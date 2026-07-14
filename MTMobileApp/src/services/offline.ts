import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { api } from './api';
export interface SyncOperation {
  operationId: string;
  op: 'create' | 'update';
  entity: 'visits' | 'visitActions' | 'tasks';
  data: Record<string, unknown>;
  clientTimestamp: string;
  retries: number;
  lastError?: string;
}
const QUEUE_KEY = 'mtm-sync-outbox-v2';
const CLIENT_KEY = 'mtm-sync-client-id';
export function createOperationId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
    const value = Math.floor(Math.random() * 16);
    return (char === 'x' ? value : (value & 3) | 8).toString(16);
  });
}
class OfflineService {
  private online = true;
  private syncing = false;
  private unsubscribe?: () => void;
  async init() {
    if (this.unsubscribe) return;
    const state = await NetInfo.fetch();
    this.online = Boolean(state.isConnected);
    this.unsubscribe = NetInfo.addEventListener(next => {
      const reconnected = !this.online && Boolean(next.isConnected);
      this.online = Boolean(next.isConnected);
      if (reconnected) void this.syncQueue();
    });
    if (this.online) void this.syncQueue();
  }
  isConnected() {
    return this.online;
  }
  async getQueue(): Promise<SyncOperation[]> {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  }
  async enqueue(
    entity: SyncOperation['entity'],
    op: SyncOperation['op'],
    data: Record<string, unknown>,
  ) {
    const queue = await this.getQueue();
    const operation = {
      operationId: createOperationId(),
      entity,
      op,
      data,
      clientTimestamp: new Date().toISOString(),
      retries: 0,
    };
    queue.push(operation);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    if (this.online) void this.syncQueue();
    return operation;
  }
  private async getClientId() {
    const current = await AsyncStorage.getItem(CLIENT_KEY);
    if (current) return current;
    const next = `android-${createOperationId()}`;
    await AsyncStorage.setItem(CLIENT_KEY, next);
    return next;
  }
  async syncQueue() {
    if (this.syncing || !this.online) return;
    const queue = await this.getQueue();
    if (!queue.length) return;
    this.syncing = true;
    try {
      const response = await api.pushSync(
        await this.getClientId(),
        queue.slice(0, 100),
      );
      const map = new Map(
        response.results.map(result => [result.operationId, result]),
      );
      const remaining = queue.flatMap(operation => {
        const result = map.get(operation.operationId);
        if (result?.status === 'ok' || result?.status === 'conflict') return [];
        return [
          {
            ...operation,
            retries: operation.retries + 1,
            lastError: result?.error || 'Sync failed',
          },
        ];
      });
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sync failed';
      await AsyncStorage.setItem(
        QUEUE_KEY,
        JSON.stringify(
          queue.map(item => ({
            ...item,
            retries: item.retries + 1,
            lastError: message,
          })),
        ),
      );
    } finally {
      this.syncing = false;
    }
  }
  async getQueueCount() {
    return (await this.getQueue()).length;
  }
}
export const offlineService = new OfflineService();
