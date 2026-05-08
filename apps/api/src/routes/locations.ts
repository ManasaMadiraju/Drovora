import { Router, Request, Response } from 'express';
import prisma from '../prisma';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const locations = await prisma.returnLocation.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
    res.json({ locations });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const location = await prisma.returnLocation.findUnique({ where: { id: req.params.id } });
    if (!location) { res.status(404).json({ error: 'Location not found' }); return; }
    res.json({ location });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

export default router;
