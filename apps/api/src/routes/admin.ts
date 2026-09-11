import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { notifyUser } from '../lib/notify';

const router = Router();
router.use(authenticate, requireRole('admin'));

router.get('/stats', async (_req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, totalCustomers, totalDrivers, totalPickups, pendingPickups, completedPickups, cancelledPickups, revenueData, onlineDrivers] = await Promise.all([
      prisma.user.count(), prisma.user.count({ where: { role: 'customer' } }), prisma.user.count({ where: { role: 'driver' } }),
      prisma.pickupRequest.count(), prisma.pickupRequest.count({ where: { status: 'pending' } }),
      prisma.pickupRequest.count({ where: { status: 'completed' } }), prisma.pickupRequest.count({ where: { status: 'cancelled' } }),
      prisma.pickupRequest.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: 'paid' } }),
      prisma.driverLocation.count({ where: { isOnline: true } }),
    ]);
    res.json({ users: { total: totalUsers, customers: totalCustomers, drivers: totalDrivers }, pickups: { total: totalPickups, pending: pendingPickups, completed: completedPickups, cancelled: cancelledPickups }, revenue: revenueData._sum.totalAmount ?? 0, onlineDrivers });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const { role, page = '1', limit = '20', search } = req.query as Record<string, string>;
    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (search) where.OR = [{ name: { contains: search } }, { email: { contains: search } }];
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, select: { id: true, name: true, email: true, role: true, phone: true, isActive: true, createdAt: true }, orderBy: { createdAt: 'desc' }, skip, take: parseInt(limit) }),
      prisma.user.count({ where }),
    ]);
    res.json({ users, total });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.patch('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { isActive } = req.body;
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: !!isActive }, select: { id: true, name: true, email: true, role: true, isActive: true } });
    res.json({ user });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.get('/pickups', async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [pickups, total] = await Promise.all([
      prisma.pickupRequest.findMany({ where, include: { customer: { select: { id: true, name: true, email: true, phone: true } }, driver: { select: { id: true, name: true, phone: true } }, returnLocation: true, rating: true }, orderBy: { createdAt: 'desc' }, skip, take: parseInt(limit) }),
      prisma.pickupRequest.count({ where }),
    ]);
    res.json({ pickups, total });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.get('/analytics', async (_req: AuthRequest, res: Response) => {
  try {
    const byStatus = await prisma.pickupRequest.groupBy({ by: ['status'], _count: { status: true } });
    const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentPickups = await prisma.pickupRequest.findMany({ where: { createdAt: { gte: sevenDaysAgo }, paymentStatus: 'paid' }, select: { createdAt: true, totalAmount: true } });
    const revenueByDay: Record<string, number> = {};
    recentPickups.forEach((p) => { const day = p.createdAt.toISOString().split('T')[0]; revenueByDay[day] = (revenueByDay[day] || 0) + p.totalAmount; });
    const topLocations = await prisma.pickupRequest.groupBy({ by: ['returnLocationId'], _count: { returnLocationId: true }, orderBy: { _count: { returnLocationId: 'desc' } }, take: 5 });
    const locationDetails = await prisma.returnLocation.findMany({ where: { id: { in: topLocations.map((l) => l.returnLocationId) } } });
    const topLocationsWithDetails = topLocations.map((l) => ({ ...l, location: locationDetails.find((d) => d.id === l.returnLocationId) }));
    res.json({ byStatus, revenueByDay, topLocations: topLocationsWithDetails });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.post('/notifications', async (req: AuthRequest, res: Response) => {
  try {
    const { userId, title, message, type } = req.body;
    const notification = await notifyUser(userId, title, message, type || 'info');
    res.status(201).json({ notification });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

export default router;
