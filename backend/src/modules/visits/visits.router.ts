import { Router, Response, NextFunction } from 'express';
import { prisma } from '../../utils/prisma';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { AppError } from '../../middleware/error-handler';

export const visitsRouter = Router();

// Middleware for protecting visits routes
visitsRouter.use(authenticate);

// GET /api/visits
visitsRouter.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const agentId = req.query.agentId as string;
    const customerId = req.query.customerId as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (agentId) where.agentId = agentId;
    if (customerId) where.customerId = customerId;

    if (startDate || endDate) {
      where.checkInTime = {};
      if (startDate) where.checkInTime.gte = new Date(startDate);
      if (endDate) where.checkInTime.lte = new Date(endDate);
    }

    const [visits, total] = await Promise.all([
      prisma.visit.findMany({
        where,
        skip,
        take: limit,
        include: {
          agent: { select: { id: true, name: true, email: true } },
          customer: { select: { id: true, name: true, address: true } },
          routePoint: { select: { id: true } },
        },
        orderBy: { checkInTime: 'desc' },
      }),
      prisma.visit.count({ where }),
    ]);

    res.json({
      data: visits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/visits/check-in
visitsRouter.post('/check-in', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { agentId, customerId, routePointId, lat, lng, latitude, longitude, notes } = req.body;

    // agentId can come from body or from JWT token
    const resolvedAgentId = agentId || req.userId;

    if (!resolvedAgentId || !customerId) {
      throw new AppError('Agent ID and customer ID are required', 400);
    }

    const visit = await prisma.visit.create({
      data: {
        agentId: resolvedAgentId,
        customerId,
        routePointId: routePointId || null,
        checkInTime: new Date(),
        checkInLat: lat || latitude || 0,
        checkInLng: lng || longitude || 0,
        notes: notes || null,
        status: 'CHECKED_IN',
      },
      include: {
        agent: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(visit);
  } catch (error) {
    next(error);
  }
});

// PUT /api/visits/:id/check-out
visitsRouter.put('/:id/check-out', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { lat, lng, latitude, longitude, notes, duration } = req.body;

    const visit = await prisma.visit.update({
      where: { id },
      data: {
        checkOutTime: new Date(),
        checkOutLat: lat || latitude || null,
        checkOutLng: lng || longitude || null,
        notes: notes || null,
        durationMinutes: duration || null,
        status: 'CHECKED_OUT',
      },
      include: {
        agent: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
      },
    });

    res.json(visit);
  } catch (error) {
    next(error);
  }
});

// GET /api/visits/stats
visitsRouter.get('/stats', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const agentId = req.query.agentId as string;

    const where: any = {};
    if (agentId) where.agentId = agentId;

    if (startDate || endDate) {
      where.checkInTime = {};
      if (startDate) where.checkInTime.gte = new Date(startDate);
      if (endDate) where.checkInTime.lte = new Date(endDate);
    }

    const [totalVisits, completedVisits, averageDuration] = await Promise.all([
      prisma.visit.count({ where }),
      prisma.visit.count({
        where: {
          ...where,
          status: 'CHECKED_OUT',
        },
      }),
      prisma.visit.aggregate({
        where: {
          ...where,
          status: 'CHECKED_OUT',
          durationMinutes: { not: null },
        },
        _avg: { durationMinutes: true },
      }),
    ]);

    res.json({
      totalVisits,
      completedVisits,
      pendingVisits: totalVisits - completedVisits,
      completionRate: totalVisits > 0 ? ((completedVisits / totalVisits) * 100).toFixed(2) : 0,
      averageDurationMinutes: averageDuration._avg.durationMinutes || 0,
    });
  } catch (error) {
    next(error);
  }
});
