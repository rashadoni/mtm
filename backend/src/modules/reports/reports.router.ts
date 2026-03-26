import { Router, Response, NextFunction } from 'express';
import { prisma } from '../../utils/prisma';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { AppError } from '../../middleware/error-handler';

export const reportsRouter = Router();

// Middleware for protecting reports routes
reportsRouter.use(authenticate);

// GET /api/reports/daily
reportsRouter.get('/daily', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    if (!startDate || !endDate) {
      throw new AppError('Start date and end date are required', 400);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const dailyStats = await prisma.visit.groupBy({
      by: ['checkInTime'],
      where: {
        checkInTime: {
          gte: start,
          lte: end,
        },
      },
      _count: {
        id: true,
      },
    });

    // Group by date
    const byDate: { [key: string]: number } = {};
    dailyStats.forEach((stat: any) => {
      const date = new Date(stat.checkInTime).toISOString().split('T')[0];
      byDate[date] = (byDate[date] || 0) + stat._count.id;
    });

    // Also get completed visits
    const completedStats = await prisma.visit.groupBy({
      by: ['checkInTime'],
      where: {
        status: 'CHECKED_OUT',
        checkInTime: {
          gte: start,
          lte: end,
        },
      },
      _count: {
        id: true,
      },
    });

    const completedByDate: { [key: string]: number } = {};
    completedStats.forEach((stat: any) => {
      const date = new Date(stat.checkInTime).toISOString().split('T')[0];
      completedByDate[date] = (completedByDate[date] || 0) + stat._count.id;
    });

    const report = Object.keys(byDate).map((date) => ({
      date,
      totalVisits: byDate[date],
      completedVisits: completedByDate[date] || 0,
      pendingVisits: (byDate[date] || 0) - (completedByDate[date] || 0),
    }));

    res.json({
      dateRange: { start: startDate, end: endDate },
      data: report,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/performance
reportsRouter.get('/performance', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const where: any = {};
    if (startDate && endDate) {
      where.checkInTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const agentPerformance = await prisma.visit.groupBy({
      by: ['agentId'],
      where,
      _count: {
        id: true,
      },
    });

    const performanceData = await Promise.all(
      agentPerformance.map(async (agent: any) => {
        const agentInfo = await prisma.user.findUnique({
          where: { id: agent.agentId },
          select: { id: true, name: true, email: true },
        });

        const completedCount = await prisma.visit.count({
          where: {
            agentId: agent.agentId,
            status: 'CHECKED_OUT',
            ...where,
          },
        });

        const avgDuration = await prisma.visit.aggregate({
          where: {
            agentId: agent.agentId,
            status: 'CHECKED_OUT',
            durationMinutes: { not: null },
            ...where,
          },
          _avg: { durationMinutes: true },
        });

        return {
          agent: agentInfo,
          totalVisits: agent._count.id,
          completedVisits: completedCount,
          completionRate: ((completedCount / agent._count.id) * 100).toFixed(2),
          averageDurationMinutes: avgDuration._avg.durationMinutes || 0,
        };
      })
    );

    res.json({
      dateRange: startDate && endDate ? { start: startDate, end: endDate } : null,
      data: performanceData.sort((a, b) => parseInt(b.completionRate) - parseInt(a.completionRate)),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/route-execution
reportsRouter.get('/route-execution', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const where: any = {};
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const routes = await prisma.route.findMany({
      where,
      include: {
        points: {
          select: { id: true },
        },
        agent: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    const executionData = await Promise.all(
      routes.map(async (route: any) => {
        const completedPoints = await prisma.visit.count({
          where: {
            routePointId: {
              in: route.points.map((p: any) => p.id),
            },
          },
        });

        return {
          routeId: route.id,
          agent: route.agent,
          date: route.date,
          totalPoints: route.points.length,
          completedPoints,
          completionRate:
            route.points.length > 0
              ? ((completedPoints / route.points.length) * 100).toFixed(2)
              : 0,
          status: route.status,
        };
      })
    );

    res.json({
      dateRange: startDate && endDate ? { start: startDate, end: endDate } : null,
      data: executionData,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/gps-tracking
reportsRouter.get('/gps-tracking', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const where: any = {
      checkInLatitude: { not: null },
      checkOutLatitude: { not: null },
    };

    if (startDate && endDate) {
      where.checkInTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const gpsTracking = await prisma.visit.groupBy({
      by: ['agentId'],
      where,
      _count: { id: true },
    });

    const trackingData = await Promise.all(
      gpsTracking.map(async (agent: any) => {
        const agentInfo = await prisma.user.findUnique({
          where: { id: agent.agentId },
          select: { id: true, name: true, email: true },
        });

        const totalVisits = await prisma.visit.count({
          where: { agentId: agent.agentId, ...where },
        });

        const gpsTrackedVisits = await prisma.visit.count({
          where: {
            agentId: agent.agentId,
            checkInLatitude: { not: null },
            checkInLongitude: { not: null },
          },
        });

        return {
          agent: agentInfo,
          gpsTrackedVisits: agent._count.id,
          totalVisits,
          gpsHealthPercentage:
            totalVisits > 0 ? ((agent._count.id / totalVisits) * 100).toFixed(2) : 0,
        };
      })
    );

    res.json({
      dateRange: startDate && endDate ? { start: startDate, end: endDate } : null,
      data: trackingData.sort((a, b) => parseFloat(b.gpsHealthPercentage) - parseFloat(a.gpsHealthPercentage)),
    });
  } catch (error) {
    next(error);
  }
});
