import prisma from '../prisma';
import { getIO } from '../socket';

export async function notifyUser(userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') {
  const notification = await prisma.notification.create({ data: { userId, title, message, type } });
  getIO().to(`user:${userId}`).emit('notification', notification);
  return notification;
}
