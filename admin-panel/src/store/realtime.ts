import { create } from 'zustand';

export interface LiveAgent {
  id: string;
  name: string;
  lat: number;
  lng: number;
  speed: number;
  battery: number;
  status: 'active' | 'idle' | 'offline';
  lastUpdate: Date;
  currentCustomer?: string;
  heading: number;
  hasRealGps?: boolean; // true when GPS came from real device
}

export interface LiveNotification {
  id: string;
  type: 'check_in' | 'check_out' | 'off_route' | 'low_battery' | 'photo' | 'task_complete';
  agentName: string;
  message: string;
  timestamp: Date;
}

interface RealtimeStore {
  agents: LiveAgent[];
  notifications: LiveNotification[];
  isSimulating: boolean;
  lastUpdate: Date | null;
  wsConnected: boolean;

  startSimulation: () => void;
  stopSimulation: () => void;
  addNotification: (notification: Omit<LiveNotification, 'id' | 'timestamp'>) => void;
  clearNotifications: () => void;
}

// Baku inland coordinates - agents spread across districts (initial/fallback)
const initialAgents: LiveAgent[] = [
  { id: 'a1', name: 'Əhməd Məmmədov', lat: 40.3916, lng: 49.8674, speed: 0, battery: 85, status: 'active', lastUpdate: new Date(), heading: 45 },
  { id: 'a2', name: 'Farid Hüseynov', lat: 40.4082, lng: 49.8376, speed: 25, battery: 62, status: 'active', lastUpdate: new Date(), heading: 120 },
  { id: 'a3', name: 'Leyla Qasımova', lat: 40.3789, lng: 49.8492, speed: 0, battery: 91, status: 'active', lastUpdate: new Date(), currentCustomer: 'Bravo', heading: 0 },
  { id: 'a4', name: 'Rəfail Əliəv', lat: 40.4195, lng: 49.8315, speed: 35, battery: 15, status: 'active', lastUpdate: new Date(), heading: 270 },
  { id: 'a5', name: 'Sərxan Yusifov', lat: 40.3851, lng: 49.8241, speed: 0, battery: 73, status: 'idle', lastUpdate: new Date(), heading: 90 },
  { id: 'a6', name: 'Nigar Hüseynova', lat: 40.4150, lng: 49.8550, speed: 0, battery: 0, status: 'offline', lastUpdate: new Date(), heading: 180 },
  { id: 'a7', name: 'Kamran İsmayılov', lat: 40.4310, lng: 49.8190, speed: 18, battery: 54, status: 'active', lastUpdate: new Date(), heading: 315 },
  { id: 'a8', name: 'Günel Əhmədova', lat: 40.3995, lng: 49.8420, speed: 0, battery: 78, status: 'active', lastUpdate: new Date(), currentCustomer: 'SOCAR', heading: 60 },
];

const customerNames = [
  'Bravo Supermarket', 'Araz Market', 'SOCAR Trading', 'Azərsu ASC',
  'Baku Electronics', 'Kontakt Home', 'İrşad Center', 'Neptun Market',
];

const notificationTemplates = [
  { type: 'check_in' as const, msg: (agent: string, customer: string) => `${agent} — ${customer} müştərisinə check-in etdi` },
  { type: 'check_out' as const, msg: (agent: string, customer: string) => `${agent} — ${customer} müştərisindən check-out etdi` },
  { type: 'photo' as const, msg: (agent: string) => `${agent} yeni foto yüklədi` },
  { type: 'task_complete' as const, msg: (agent: string) => `${agent} tapşırığı tamamladı` },
  { type: 'off_route' as const, msg: (agent: string) => `${agent} marşrutdan saplandı!` },
];

let simulationInterval: ReturnType<typeof setInterval> | null = null;
let wsConnection: WebSocket | null = null;
let wsReconnectTimer: ReturnType<typeof setTimeout> | null = null;
let pollingInterval: ReturnType<typeof setInterval> | null = null;

// API base URL
const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://178.156.249.177:4000/api';

const getWsUrl = () => {
  const apiUrl = getApiUrl();
  const base = apiUrl.replace('/api', '').replace('http://', 'ws://').replace('https://', 'wss://');
  return `${base}/ws`;
};

// Poll REST API for real agent locations
async function pollAgentLocations() {
  try {
    const apiUrl = getApiUrl().replace('/api', '');
    const res = await fetch(`${apiUrl}/api/agent-locations`);
    if (!res.ok) return;
    const locations: any[] = await res.json();
    if (!locations || locations.length === 0) return;

    useRealtimeStore.setState((state) => {
      let agents = [...state.agents];

      for (const loc of locations) {
        const existingIdx = agents.findIndex(
          a => a.id === loc.agentId || a.name === loc.agentName
        );

        const agentData: LiveAgent = {
          id: loc.agentId,
          name: loc.agentName || `Agent`,
          lat: parseFloat(loc.lat),
          lng: parseFloat(loc.lng),
          speed: parseFloat(loc.speed) || 0,
          battery: parseFloat(loc.battery) || 100,
          status: 'active',
          lastUpdate: new Date(loc.createdAt),
          heading: parseFloat(loc.heading) || 0,
          hasRealGps: true,
        };

        if (existingIdx >= 0) {
          agents[existingIdx] = { ...agents[existingIdx], ...agentData };
        } else {
          agents.push(agentData);
        }
      }

      return { agents, lastUpdate: new Date() };
    });
  } catch (err) {
    // Silently fail — WS or simulation will handle
  }
}

function connectWebSocket(store: ReturnType<typeof useRealtimeStore.getState>) {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('mtm-token') : null;
    const wsUrl = token ? `${getWsUrl()}?token=${token}` : getWsUrl();

    wsConnection = new WebSocket(wsUrl);

    wsConnection.onopen = () => {
      console.log('[WS] Connected to backend');
      useRealtimeStore.setState({ wsConnected: true });
    };

    wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'agent_location') {
          // Real GPS data from mobile app
          useRealtimeStore.setState((state) => {
            const existingIdx = state.agents.findIndex(
              a => a.id === data.agentId || a.name === data.agentName
            );

            let agents: LiveAgent[];
            if (existingIdx >= 0) {
              // Update existing agent
              agents = state.agents.map((agent, idx) => {
                if (idx === existingIdx) {
                  return {
                    ...agent,
                    id: data.agentId,
                    name: data.agentName || agent.name,
                    lat: data.lat,
                    lng: data.lng,
                    speed: data.speed || 0,
                    battery: data.battery ?? agent.battery,
                    heading: data.heading || agent.heading,
                    status: 'active' as const,
                    lastUpdate: new Date(),
                  };
                }
                return agent;
              });
            } else {
              // New agent — add to list
              agents = [...state.agents, {
                id: data.agentId,
                name: data.agentName || `Agent ${data.agentId.slice(0, 4)}`,
                lat: data.lat,
                lng: data.lng,
                speed: data.speed || 0,
                battery: data.battery ?? 100,
                status: 'active' as const,
                lastUpdate: new Date(),
                heading: data.heading || 0,
              }];
            }

            return { agents, lastUpdate: new Date() };
          });
        }

        if (data.type === 'check_in') {
          useRealtimeStore.getState().addNotification({
            type: 'check_in',
            agentName: data.agentName || 'Agent',
            message: `${data.agentName || 'Agent'} — ${data.customerName || 'müştəri'}yə check-in etdi`,
          });
        }

        if (data.type === 'check_out') {
          useRealtimeStore.getState().addNotification({
            type: 'check_out',
            agentName: data.agentName || 'Agent',
            message: `${data.agentName || 'Agent'} — ${data.customerName || 'müştəri'}dən check-out etdi`,
          });
        }

        if (data.type === 'photo_uploaded') {
          useRealtimeStore.getState().addNotification({
            type: 'photo',
            agentName: data.agentName || 'Agent',
            message: `${data.agentName || 'Agent'} yeni foto yüklədi`,
          });
        }
      } catch {}
    };

    wsConnection.onclose = () => {
      console.log('[WS] Disconnected, falling back to simulation');
      useRealtimeStore.setState({ wsConnected: false });
      // Reconnect after 5 seconds
      wsReconnectTimer = setTimeout(() => {
        if (useRealtimeStore.getState().isSimulating) {
          connectWebSocket(useRealtimeStore.getState());
        }
      }, 5000);
    };

    wsConnection.onerror = () => {
      console.log('[WS] Connection error, using simulation');
      useRealtimeStore.setState({ wsConnected: false });
    };
  } catch {
    console.log('[WS] Failed to connect, using simulation');
  }
}

export const useRealtimeStore = create<RealtimeStore>((set, get) => ({
  agents: initialAgents,
  notifications: [],
  isSimulating: false,
  lastUpdate: null,
  wsConnected: false,

  startSimulation: () => {
    if (simulationInterval) return;

    set({ isSimulating: true });

    // Try to connect to real WebSocket
    if (typeof window !== 'undefined') {
      connectWebSocket(get());
    }

    // Poll REST API for real GPS data every 5 seconds
    if (!pollingInterval) {
      pollAgentLocations(); // immediate first poll
      pollingInterval = setInterval(pollAgentLocations, 5000);
    }

    // Always run local simulation as fallback/supplement
    simulationInterval = setInterval(() => {
      const state = get();

      // If WebSocket is connected, only do minimal updates (battery drain, offline detection)
      // If not connected, do full simulation
      set((state) => {
        const now = new Date();
        const updatedAgents = state.agents.map((agent) => {
          if (agent.status === 'offline') return agent;

          // Never simulate movement for agents with real GPS data
          if (agent.hasRealGps) return agent;

          // Mark agents as idle/offline if no update for a while
          const msSinceUpdate = now.getTime() - new Date(agent.lastUpdate).getTime();
          if (msSinceUpdate > 300000) { // 5 min
            return { ...agent, status: 'offline' as const };
          }
          if (msSinceUpdate > 60000) { // 1 min
            return { ...agent, status: 'idle' as const };
          }

          // If WS connected, don't simulate movement (real data comes via WS)
          if (state.wsConnected) {
            return {
              ...agent,
              battery: Math.max(0, agent.battery - Math.random() * 0.1),
            };
          }

          // Simulate movement when no WS
          const isMoving = Math.random() > 0.4;
          const latDelta = isMoving ? (Math.random() - 0.5) * 0.002 : 0;
          const lngDelta = isMoving ? (Math.random() - 0.5) * 0.002 : 0;

          const newLat = Math.max(40.35, Math.min(40.45, agent.lat + latDelta));
          const newLng = Math.max(49.80, Math.min(49.88, agent.lng + lngDelta));

          const batteryDrain = agent.status === 'active' ? Math.random() * 0.3 : 0;

          return {
            ...agent,
            lat: newLat,
            lng: newLng,
            speed: isMoving ? Math.floor(Math.random() * 45) + 5 : 0,
            battery: Math.max(0, agent.battery - batteryDrain),
            lastUpdate: new Date(),
            heading: isMoving ? Math.floor(Math.random() * 360) : agent.heading,
          };
        });

        // Random notification only when no WS (10% chance per tick)
        let newNotifications = [...state.notifications];
        if (!state.wsConnected && Math.random() < 0.1) {
          const activeAgents = updatedAgents.filter(a => a.status !== 'offline');
          if (activeAgents.length > 0) {
            const randomAgent = activeAgents[Math.floor(Math.random() * activeAgents.length)];
            const template = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
            const customer = customerNames[Math.floor(Math.random() * customerNames.length)];

            const notification: LiveNotification = {
              id: `notif-${Date.now()}`,
              type: template.type,
              agentName: randomAgent.name,
              message: template.msg(randomAgent.name, customer),
              timestamp: new Date(),
            };

            newNotifications = [notification, ...newNotifications].slice(0, 50);
          }
        }

        return {
          agents: updatedAgents,
          notifications: newNotifications,
          lastUpdate: new Date(),
        };
      });
    }, 3000);
  },

  stopSimulation: () => {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      simulationInterval = null;
    }
    if (wsConnection) {
      wsConnection.close();
      wsConnection = null;
    }
    if (wsReconnectTimer) {
      clearTimeout(wsReconnectTimer);
      wsReconnectTimer = null;
    }
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    set({ isSimulating: false, wsConnected: false });
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: `notif-${Date.now()}`,
          timestamp: new Date(),
        },
        ...state.notifications,
      ].slice(0, 50),
    }));
  },

  clearNotifications: () => set({ notifications: [] }),
}));
