import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { getIO } from '../socket';

const router = Router();

router.put('/me/location', authenticate, requireRole('driver'), async (req: AuthRequest, res: Response) => {
  try {
    const { lat, lng, heading } = req.body;
    if (lat === undefined || lng === undefined) { res.status(400).json({ error: 'lat and lng required' }); return; }
    const loc = await prisma.driverLocation.upsert({
      where: { driverId: req.user!.id },
      update: { lat: parseFloat(lat), lng: parseFloat(lng), heading: heading ? parseFloat(heading) : null },
      create: { driverId: req.user!.id, lat: parseFloat(lat), lng: parseFloat(lng) },
    });
    getIO().emit(`driver_location_${req.user!.id}`, loc);
    res.json({ location: loc });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.patch('/me/online', authenticate, requireRole('driver'), async (req: AuthRequest, res: Response) => {
  try {
    const { isOnline } = req.body;
    const loc = await prisma.driverLocation.upsert({
      where: { driverId: req.user!.id },
      update: { isOnline: !!isOnline },
      create: { driverId: req.user!.id, lat: 0, lng: 0, isOnline: !!isOnline },
    });
    getIO().emit('driver_status_updated', { driverId: req.user!.id, isOnline: loc.isOnline });
    res.json({ location: loc });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.get('/me/earnings', authenticate, requireRole('driver'), async (req: AuthRequest, res: Response) => {
  try {
    const earnings = await prisma.earning.findMany({
      where: { driverId: req.user!.id },
      include: { pickupRequest: { select: { id: true, pickupAddress: true, returnLocation: true, completedAt: true, packageCount: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const total = earnings.reduce((s, e) => s + e.amount, 0);
    const paid = earnings.filter((e) => e.status === 'paid').reduce((s, e) => s + e.amount, 0);
    res.json({ earnings, totalEarned: +total.toFixed(2), totalPaid: +paid.toFixed(2) });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.get('/me/stats', authenticate, requireRole('driver'), async (req: AuthRequest, res: Response) => {
  try {
    const [completed, ratings] = await Promise.all([
      prisma.pickupRequest.count({ where: { driverId: req.user!.id, status: 'completed' } }),
      prisma.rating.findMany({ where: { toUserId: req.user!.id } }),
    ]);
    const avg = ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0;
    res.json({ completedPickups: completed, totalRatings: ratings.length, averageRating: +avg.toFixed(2) });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

export default router;
