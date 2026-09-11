import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { getIO } from '../socket';
import { notifyUser } from '../lib/notify';

const router = Router();

const SELECT = {
  id: true, status: true, pickupAddress: true, pickupLat: true, pickupLng: true,
  packageCount: true, packageDetails: true, notes: true, scheduledTime: true, isScheduled: true,
  baseFee: true, serviceFee: true, totalAmount: true, paymentStatus: true, paymentMethod: true,
  pickedUpAt: true, deliveredAt: true, completedAt: true, cancelledAt: true, cancelReason: true,
  createdAt: true, updatedAt: true,
  customer: { select: { id: true, name: true, phone: true, address: true } },
  driver: { select: { id: true, name: true, phone: true } },
  returnLocation: true, rating: true,
};

function calcFee(count: number) {
  const base = 5.99 + (count - 1) * 1.5;
  return { baseFee: +base.toFixed(2), serviceFee: 1.99, totalAmount: +(base + 1.99).toFixed(2) };
}

// Create pickup
router.post('/', authenticate, requireRole('customer'), async (req: AuthRequest, res: Response) => {
  try {
    const { returnLocationId, pickupAddress, pickupLat, pickupLng, packageCount, packageDetails, notes, scheduledTime, paymentMethod } = req.body;
    if (!returnLocationId || !pickupAddress) { res.status(400).json({ error: 'returnLocationId and pickupAddress are required' }); return; }
    const count = parseInt(packageCount) || 1;
    const pickup = await prisma.pickupRequest.create({
      data: { customerId: req.user!.id, returnLocationId, pickupAddress, pickupLat: pickupLat ? parseFloat(pickupLat) : null, pickupLng: pickupLng ? parseFloat(pickupLng) : null, packageCount: count, packageDetails: packageDetails ? JSON.stringify(packageDetails) : null, notes, isScheduled: !!scheduledTime, scheduledTime: scheduledTime ? new Date(scheduledTime) : null, paymentMethod, ...calcFee(count) },
      select: SELECT,
    });
    getIO().emit('new_pickup_request', pickup);
    await notifyUser(req.user!.id, 'Pickup Requested', "Your pickup request has been placed. We're finding a driver for you.", 'success');
    res.status(201).json({ pickup });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// List pickups
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = {};
    if (req.user!.role === 'customer') where.customerId = req.user!.id;
    else if (req.user!.role === 'driver') where.driverId = req.user!.id;
    if (status) where.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [pickups, total] = await Promise.all([
      prisma.pickupRequest.findMany({ where, select: SELECT, orderBy: { createdAt: 'desc' }, skip, take: parseInt(limit) }),
      prisma.pickupRequest.count({ where }),
    ]);
    res.json({ pickups, total, page: parseInt(page), limit: parseInt(limit) });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// Available for drivers
router.get('/available', authenticate, requireRole('driver'), async (_req: AuthRequest, res: Response) => {
  try {
    const pickups = await prisma.pickupRequest.findMany({ where: { status: 'pending', driverId: null }, select: SELECT, orderBy: { createdAt: 'asc' } });
    res.json({ pickups });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// Get single pickup
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const pickup = await prisma.pickupRequest.findUnique({ where: { id: req.params.id }, select: SELECT });
    if (!pickup) { res.status(404).json({ error: 'Pickup not found' }); return; }
    if (req.user!.role === 'customer' && pickup.customer.id !== req.user!.id) { res.status(403).json({ error: 'Forbidden' }); return; }
    if (req.user!.role === 'driver' && pickup.driver?.id !== req.user!.id) { res.status(403).json({ error: 'Forbidden' }); return; }
    res.json({ pickup });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// Accept job
router.patch('/:id/accept', authenticate, requireRole('driver'), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.pickupRequest.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.status !== 'pending') { res.status(400).json({ error: 'Pickup not available' }); return; }
    const pickup = await prisma.pickupRequest.update({ where: { id: req.params.id }, data: { driverId: req.user!.id, status: 'accepted' }, select: SELECT });
    getIO().emit(`pickup_updated_${req.params.id}`, pickup);
    getIO().emit('pickup_list_updated');
    await notifyUser(existing.customerId, 'Driver Assigned', "A driver has been assigned to your pickup. They're on their way!", 'success');
    res.json({ pickup });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// Update status
router.patch('/:id/status', authenticate, requireRole('driver', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!['en_route_pickup', 'picked_up', 'en_route_dropoff', 'delivered'].includes(status)) { res.status(400).json({ error: 'Invalid status' }); return; }
    const existing = await prisma.pickupRequest.findUnique({ where: { id: req.params.id } });
    if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
    if (req.user!.role === 'driver' && existing.driverId !== req.user!.id) { res.status(403).json({ error: 'Forbidden' }); return; }
    const timestamps: Record<string, Date> = {};
    if (status === 'picked_up') timestamps.pickedUpAt = new Date();
    if (status === 'delivered') { timestamps.deliveredAt = new Date(); timestamps.completedAt = new Date(); }
    const pickup = await prisma.pickupRequest.update({
      where: { id: req.params.id },
      data: { status: status === 'delivered' ? 'completed' : status, paymentStatus: status === 'delivered' ? 'paid' : existing.paymentStatus, ...timestamps },
      select: SELECT,
    });
    if (status === 'delivered' && existing.driverId) {
      if (!await prisma.earning.findUnique({ where: { pickupRequestId: existing.id } })) {
        await prisma.earning.create({ data: { driverId: existing.driverId, pickupRequestId: existing.id, amount: +(existing.totalAmount * 0.7).toFixed(2), status: 'paid' } });
      }
      await notifyUser(existing.customerId, 'Package Delivered!', `Your package has been delivered to ${pickup.returnLocation.name}.`, 'success');
    } else if (status === 'en_route_pickup') {
      await notifyUser(existing.customerId, 'Driver On The Way', 'Your driver is heading to your pickup address.', 'info');
    } else if (status === 'picked_up') {
      await notifyUser(existing.customerId, 'Package Picked Up', 'Your driver has your package and is heading to the return location.', 'info');
    }
    getIO().emit(`pickup_updated_${req.params.id}`, pickup);
    getIO().emit('pickup_list_updated');
    res.json({ pickup });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// Cancel
router.patch('/:id/cancel', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;
    const existing = await prisma.pickupRequest.findUnique({ where: { id: req.params.id } });
    if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
    if (req.user!.role === 'customer' && existing.customerId !== req.user!.id) { res.status(403).json({ error: 'Forbidden' }); return; }
    if (['completed', 'cancelled'].includes(existing.status)) { res.status(400).json({ error: 'Cannot cancel' }); return; }
    const pickup = await prisma.pickupRequest.update({ where: { id: req.params.id }, data: { status: 'cancelled', cancelledAt: new Date(), cancelReason: reason }, select: SELECT });
    if (req.user!.role === 'customer' && existing.driverId) {
      await notifyUser(existing.driverId, 'Pickup Cancelled', 'The customer cancelled this pickup request.', 'warning');
    } else if (existing.driverId !== req.user!.id) {
      await notifyUser(existing.customerId, 'Pickup Cancelled', 'Your pickup request has been cancelled.', 'warning');
    }
    getIO().emit(`pickup_updated_${req.params.id}`, pickup);
    getIO().emit('pickup_list_updated');
    res.json({ pickup });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// Rate
router.post('/:id/rate', authenticate, requireRole('customer'), async (req: AuthRequest, res: Response) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) { res.status(400).json({ error: 'Rating must be 1-5' }); return; }
    const pickup = await prisma.pickupRequest.findUnique({ where: { id: req.params.id } });
    if (!pickup || pickup.customerId !== req.user!.id || !pickup.driverId) { res.status(403).json({ error: 'Forbidden' }); return; }
    if (await prisma.rating.findUnique({ where: { pickupRequestId: req.params.id } })) { res.status(409).json({ error: 'Already rated' }); return; }
    const r = await prisma.rating.create({ data: { pickupRequestId: req.params.id, fromUserId: req.user!.id, toUserId: pickup.driverId, rating: parseInt(rating), comment } });
    res.status(201).json({ rating: r });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

export default router;
