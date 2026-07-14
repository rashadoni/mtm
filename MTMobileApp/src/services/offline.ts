// Offline Mode Service — queue actions when no internet, sync when back online
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';
import NetInfo from '@react-native-community/netinfo';

interface QueuedAction {
  id: string;
  type: 'check_in' | 'check_out' | 'order' | 'photo' | 'note' | 'stock' | 'task_update';
  payload: any;
  timestamp: string;
  retries: number;
}

const QUEUE_KEY = 'mtm_offline_queue';

class OfflineService {
  private isOnline: boolean = true;
  private syncing: boolean = false;

  async init() {
    // Listen for network changes
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      if (wasOffline && this.isOnline) {
        console.log('[Offline] Back online — syncing queued actions');
        this.syncQueue();
      }
    });

    // Check initial state
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected ?? false;
  }

  isConnected(): boolean {
    return this.isOnline;
  }

  // Add action to offline queue
  async queueAction(type: QueuedAction['type'], payload: any) {
    const queue = await this.getQueue();
    const action: QueuedAction = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      timestamp: new Date().toISOString(),
      retries: 0,
    };
    queue.push(action);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    console.log(`[Offline] Queued: ${type} (${queue.length} total)`);
    return action.id;
  }

  // Get all queued actions
  async getQueue(): Promise<QueuedAction[]> {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  // Sync all queued actions to server
  async syncQueue() {
    if (this.syncing || !this.isOnline) return;
    this.syncing = true;

    try {
      const queue = await this.getQueue();
      if (queue.length === 0) { this.syncing = false; return; }

      console.log(`[Offline] Syncing ${queue.length} queued actions...`);
      const failed: QueuedAction[] = [];

      for (const action of queue) {
        try {
          await this.executeAction(action);
          console.log(`[Offline] Synced: ${action.type} (${action.id})`);
        } catch (err) {
          action.retries++;
          if (action.retries < 3) {
            failed.push(action);
            console.warn(`[Offline] Failed (retry ${action.retries}): ${action.type}`);
          } else {
            console.error(`[Offline] Dropped after 3 retries: ${action.type}`);
          }
        }
      }

      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(failed));
      console.log(`[Offline] Sync complete. ${failed.length} remaining.`);
    } finally {
      this.syncing = false;
    }
  }

  private async executeAction(action: QueuedAction) {
    switch (action.type) {
      case 'check_in':
        await api.checkIn(action.payload.customerId, action.payload.lat, action.payload.lng);
        break;
      case 'check_out':
        await api.checkOut(action.payload.visitId, action.payload.lat, action.payload.lng);
        break;
      case 'order':
        // await api.createOrder(action.payload);
        break;
      case 'photo':
        await api.uploadPhotoMeta(action.payload.visitId, action.payload.url, action.payload.lat, action.payload.lng);
        break;
      case 'note':
        // await api.createNote(action.payload);
        break;
      case 'stock':
        // await api.submitStock(action.payload);
        break;
      case 'task_update':
        await api.updateTaskStatus(action.payload.taskId, action.payload.status);
        break;
    }
  }

  // Clear queue
  async clearQueue() {
    await AsyncStorage.removeItem(QUEUE_KEY);
  }

  // Get queue count for UI badge
  async getQueueCount(): Promise<number> {
    const queue = await this.getQueue();
    return queue.length;
  }
}

export const offlineService = new OfflineService();
