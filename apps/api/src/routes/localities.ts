import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * GET /localities
 * Obtiene lista de localidades
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const localities = await prisma.locality.findMany({
      orderBy: { name: 'asc' },
    });

    const formatted = localities.map((loc) => ({
      id: loc.id,
      name: loc.name,
      coordinates: [loc.latitude, loc.longitude],
      province: loc.province,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
});

export default router;
