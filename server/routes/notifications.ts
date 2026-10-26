import { Router, Response } from 'express';
import { db } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();

// GET /api/notifications - List user's notifications
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const userNotifications = db.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  return res.json({
    success: true,
    data: userNotifications,
    meta: {
      unreadCount,
    },
  });
});

// PATCH /api/notifications/:id/read - Mark single notification as read
router.patch('/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  const notif = db.notifications.find((n) => n._id === id && n.userId === userId);
  if (notif) {
    notif.read = true;
    db.save();
  }

  return res.json({ success: true, message: 'Notification marked as read.' });
});

// POST /api/notifications/read-all - Mark all as read
router.post('/read-all', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  let count = 0;

  db.notifications.forEach((n) => {
    if (n.userId === userId && !n.read) {
      n.read = true;
      count++;
    }
  });

  if (count > 0) db.save();

  return res.json({ success: true, count, message: 'All notifications marked as read.' });
});

export default router;
