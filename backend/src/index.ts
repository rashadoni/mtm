import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { authRouter } from './modules/auth/auth.router';
import { usersRouter } from './modules/users/users.router';
import { customersRouter } from './modules/customers/customers.router';
import { routesRouter } from './modules/routes/routes.router';
import { visitsRouter } from './modules/visits/visits.router';
import { tasksRouter } from './modules/tasks/tasks.router';
import { photosRouter } from './modules/photos/photos.router';
import { alertsRouter } from './modules/alerts/alerts.router';
import { reportsRouter } from './modules/reports/reports.router';
import { inventoryRouter } from './modules/inventory/inventory.router';
import { errorHandler } from './middleware/error-handler';
import { setupWebSocket } from './websocket/ws-server';
import http from 'http';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://mtm.leaddrivecrm.org', 'https://mtm.leaddrivecrm.org', 'http://178.156.249.177', 'http://178.156.249.177:3000'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/customers', customersRouter);
app.use('/api/routes', routesRouter);
app.use('/api/visits', visitsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/photos', photosRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/inventory', inventoryRouter);

// Agent locations — latest GPS for all agents (for admin map polling)
app.get('/api/agent-locations', async (req, res) => {
  try {
    // Get latest location for each agent
    const locations = await (await import('./utils/prisma')).prisma.$queryRaw`
      SELECT DISTINCT ON (al."agentId")
        al."agentId", al.lat, al.lng, al.speed, al.heading, al.battery, al."createdAt",
        u.name as "agentName", u.role
      FROM "AgentLocation" al
      JOIN "User" u ON u.id = al."agentId"
      ORDER BY al."agentId", al."createdAt" DESC
    `;
    res.json(locations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Recent activities — visits, photos, tasks for live feed
app.get('/api/recent-activities', async (req, res) => {
  try {
    const { prisma } = await import('./utils/prisma');
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // last 24h

    const [visits, photos, tasks] = await Promise.all([
      prisma.visit.findMany({
        where: { checkInTime: { gte: since } },
        include: { agent: { select: { name: true } }, customer: { select: { name: true } } },
        orderBy: { checkInTime: 'desc' },
        take: 20,
      }),
      prisma.photo.findMany({
        where: { createdAt: { gte: since } },
        include: { agent: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.task.findMany({
        where: { updatedAt: { gte: since }, status: 'DONE' },
        include: { assignee: { select: { name: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 20,
      }),
    ]);

    const activities: any[] = [];

    for (const v of visits) {
      activities.push({
        type: v.status === 'CHECKED_IN' ? 'check_in' : 'check_out',
        agentName: v.agent.name,
        message: v.status === 'CHECKED_IN'
          ? `${v.agent.name} — ${v.customer.name} müştərisinə check-in etdi`
          : `${v.agent.name} — ${v.customer.name} müştərisindən check-out etdi`,
        timestamp: v.checkInTime,
      });
    }

    for (const p of photos) {
      activities.push({
        type: 'photo',
        agentName: p.agent.name,
        message: `${p.agent.name} yeni foto yüklədi`,
        timestamp: p.createdAt,
      });
    }

    for (const t of tasks) {
      activities.push({
        type: 'task_complete',
        agentName: t.assignee.name,
        message: `${t.assignee.name} tapşırığı tamamladı`,
        timestamp: t.updatedAt,
      });
    }

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json(activities.slice(0, 30));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Error handler
app.use(errorHandler);

// WebSocket for realtime GPS
setupWebSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 MTM Backend running on port ${PORT}`);
  console.log(`📡 WebSocket ready on ws://localhost:${PORT}`);
});

export default app;
