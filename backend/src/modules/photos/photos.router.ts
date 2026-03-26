import { Router, Response, NextFunction } from 'express';
import { prisma } from '../../utils/prisma';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { AppError } from '../../middleware/error-handler';

export const photosRouter = Router();

// Middleware for protecting photos routes
photosRouter.use(authenticate);

// GET /api/photos
photosRouter.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const customerId = req.query.customerId as string;
    const agentId = req.query.agentId as string;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (agentId) where.agentId = agentId;

    const [photos, total] = await Promise.all([
      prisma.photo.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: { select: { id: true, name: true } },
          agent: { select: { id: true, name: true } },
          visit: { select: { id: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.photo.count({ where }),
    ]);

    res.json({
      data: photos,
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

// POST /api/photos
photosRouter.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { url, customerId, agentId, visitId, description, metadata } = req.body;

    if (!url) {
      throw new AppError('Photo URL is required', 400);
    }

    const photo = await prisma.photo.create({
      data: {
        url,
        customerId: customerId || null,
        agentId: agentId || null,
        visitId: visitId || null,
        description: description || null,
        metadata: metadata || null,
        status: 'PENDING',
      },
      include: {
        customer: { select: { id: true, name: true } },
        agent: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(photo);
  } catch (error) {
    next(error);
  }
});

// PUT /api/photos/:id/approve
photosRouter.put('/:id/approve', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const photo = await prisma.photo.update({
      where: { id },
      data: {
        status: 'APPROVED',
        notes: notes || null,
        approvedAt: new Date(),
        approvedBy: req.userId,
      },
      include: {
        customer: { select: { id: true, name: true } },
        agent: { select: { id: true, name: true } },
      },
    });

    res.json(photo);
  } catch (error) {
    next(error);
  }
});

// PUT /api/photos/:id/reject
photosRouter.put('/:id/reject', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      throw new AppError('Rejection reason is required', 400);
    }

    const photo = await prisma.photo.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        rejectedAt: new Date(),
        rejectedBy: req.userId,
      },
      include: {
        customer: { select: { id: true, name: true } },
        agent: { select: { id: true, name: true } },
      },
    });

    res.json(photo);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/photos/:id
photosRouter.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.photo.delete({
      where: { id },
    });

    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    next(error);
  }
});
