import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: 'desc' }, take: 50 });
    const unreadCount = await prisma.notification.count({ where: { userId: req.user!.id, read: false } });
    res.json({ notifications, unreadCount });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.patch('/read-all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({ where: { userId: req.user!.id, read: false }, data: { read: true } });
    res.json({ ok: true });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.patch('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.update({ where: { id: req.params.id }, data: { read: true } });
    res.json({ ok: true });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

export default router;
