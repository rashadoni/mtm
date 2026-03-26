import { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';

interface WSClient {
  ws: WebSocket;
  userId: string;
  role: string;
  isAlive: boolean;
}

const clients = new Map<string, WSClient>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  // Heartbeat every 30 seconds
  const heartbeatInterval = setInterval(() => {
    clients.forEach((client, id) => {
      if (!client.isAlive) {
        client.ws.terminate();
        clients.delete(id);
        return;
      }
      client.isAlive = false;
      client.ws.ping();
    });
  }, 30000);

  wss.on('close', () => clearInterval(heartbeatInterval));

  wss.on('connection', (ws, req) => {
    // Authenticate via query param token
    const url = new URL(req.url || '', `http://localhost`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(4001, 'Authentication required');
      return;
    }

    let decoded: { userId: string; role: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    } catch {
      ws.close(4002, 'Invalid token');
      return;
    }

    const clientId = decoded.userId;
    clients.set(clientId, { ws, userId: decoded.userId, role: decoded.role, isAlive: true });

    console.log(`[WS] Connected: ${decoded.userId} (${decoded.role})`);

    ws.on('pong', () => {
      const client = clients.get(clientId);
      if (client) client.isAlive = true;
    });

    ws.on('message', async (data) => {
      try {
        const msg = JSON.parse(data.toString());

        switch (msg.type) {
          // Agent sends GPS location
          case 'location_update': {
            const { lat, lng, speed, heading, battery, accuracy } = msg.payload;

            // Save to database
            await prisma.agentLocation.create({
              data: {
                agentId: decoded.userId,
                lat, lng, speed, heading, battery, accuracy,
              },
            });

            // Get agent name for broadcast
            const agent = await prisma.user.update({
              where: { id: decoded.userId },
              data: { lastSyncAt: new Date() },
            });

            // Broadcast to all admins/managers
            broadcastToAdmins({
              type: 'agent_location',
              agentId: decoded.userId,
              agentName: agent.name,
              lat, lng, speed, heading, battery,
              timestamp: new Date().toISOString(),
            });
            break;
          }

          // Agent check-in
          case 'check_in': {
            const { customerId, lat, lng } = msg.payload;

            const visit = await prisma.visit.create({
              data: {
                agentId: decoded.userId,
                customerId,
                checkInTime: new Date(),
                checkInLat: lat,
                checkInLng: lng,
                status: 'CHECKED_IN',
              },
              include: { customer: true },
            });

            const checkInAgent = await prisma.user.findUnique({ where: { id: decoded.userId } });
            broadcastToAdmins({
              type: 'check_in',
              agentId: decoded.userId,
              agentName: checkInAgent?.name || 'Agent',
              customerName: visit.customer.name,
              visitId: visit.id,
              lat, lng,
              timestamp: new Date().toISOString(),
            });

            ws.send(JSON.stringify({ type: 'check_in_confirmed', payload: { visitId: visit.id } }));
            break;
          }

          // Agent check-out
          case 'check_out': {
            const { visitId, lat, lng } = msg.payload;

            const visit = await prisma.visit.update({
              where: { id: visitId },
              data: {
                checkOutTime: new Date(),
                checkOutLat: lat,
                checkOutLng: lng,
                status: 'CHECKED_OUT',
                duration: Math.round(
                  (new Date().getTime() - new Date((await prisma.visit.findUnique({ where: { id: visitId } }))!.checkInTime).getTime()) / 60000
                ),
              },
              include: { customer: true },
            });

            const checkOutAgent = await prisma.user.findUnique({ where: { id: decoded.userId } });
            broadcastToAdmins({
              type: 'check_out',
              agentId: decoded.userId,
              agentName: checkOutAgent?.name || 'Agent',
              customerName: visit.customer.name,
              visitId: visit.id,
              duration: visit.duration,
              timestamp: new Date().toISOString(),
            });

            ws.send(JSON.stringify({ type: 'check_out_confirmed', payload: { visitId: visit.id, duration: visit.duration } }));
            break;
          }

          // Agent uploads photo
          case 'photo_uploaded': {
            broadcastToAdmins({
              type: 'photo_uploaded',
              payload: {
                agentId: decoded.userId,
                ...msg.payload,
                timestamp: new Date().toISOString(),
              },
            });
            break;
          }
        }
      } catch (err) {
        console.error('[WS] Message error:', err);
        ws.send(JSON.stringify({ type: 'error', payload: { message: 'Invalid message' } }));
      }
    });

    ws.on('close', (code: number, reason: Buffer) => {
      clients.delete(clientId);
      console.log(`[WS] Disconnected: ${decoded.userId} code=${code} reason=${reason?.toString() || 'none'}`);

      // Notify admins that agent went offline
      if (decoded.role === 'AGENT') {
        broadcastToAdmins({
          type: 'agent_offline',
          payload: { agentId: decoded.userId, timestamp: new Date().toISOString() },
        });
      }
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      payload: { userId: decoded.userId, role: decoded.role, serverTime: new Date().toISOString() },
    }));
  });

  console.log('📡 WebSocket server initialized');
}

function broadcastToAdmins(message: any) {
  const data = JSON.stringify(message);
  clients.forEach((client) => {
    if (['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(client.role) && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(data);
    }
  });
}

export function broadcastToAll(message: any) {
  const data = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(data);
    }
  });
}

export function sendToUser(userId: string, message: any) {
  const client = clients.get(userId);
  if (client && client.ws.readyState === WebSocket.OPEN) {
    client.ws.send(JSON.stringify(message));
  }
}
