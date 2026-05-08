import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma';
import { authenticate, AuthRequest, signToken } from '../middleware/auth';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role, address } = req.body;
    if (!name || !email || !password) { res.status(400).json({ error: 'Name, email, and password are required' }); return; }
    const userRole = ['customer', 'driver'].includes(role) ? role : 'customer';
    if (await prisma.user.findUnique({ where: { email } })) { res.status(409).json({ error: 'Email already registered' }); return; }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashed, phone, role: userRole, address }, select: { id: true, name: true, email: true, role: true, phone: true, address: true, createdAt: true } });
    res.status(201).json({ user, token: signToken({ id: user.id, email: user.email, role: user.role }) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) { res.status(400).json({ error: 'Email and password are required' }); return; }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive || !(await bcrypt.compare(password, user.password))) { res.status(401).json({ error: 'Invalid credentials' }); return; }
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser, token: signToken({ id: user.id, email: user.email, role: user.role }) });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, name: true, email: true, role: true, phone: true, address: true, avatar: true, createdAt: true } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json({ user });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.patch('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, address } = req.body;
    const user = await prisma.user.update({ where: { id: req.user!.id }, data: { name, phone, address }, select: { id: true, name: true, email: true, role: true, phone: true, address: true } });
    res.json({ user });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

export default router;
