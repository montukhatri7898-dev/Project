import { Router, Request, Response } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/promotions - List all active promotions & deals
router.get('/', (req: Request, res: Response) => {
  const activePromos = db.promotions;
  return res.json({
    success: true,
    data: activePromos,
    meta: {
      count: activePromos.length,
    },
  });
});

// POST /api/promotions/verify - Validate code and calculate discount
router.post('/verify', (req: Request, res: Response) => {
  const { code, amount } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ success: false, error: 'Promotion code is required.' });
  }

  const promo = db.promotions.find(
    (p) => p.code.toUpperCase() === code.trim().toUpperCase()
  );

  if (!promo) {
    return res.status(404).json({
      success: false,
      error: 'Invalid or expired promotional coupon code.',
    });
  }

  const bookingAmount = Number(amount) || 0;
  if (promo.minBookingAmount && bookingAmount < promo.minBookingAmount) {
    return res.status(400).json({
      success: false,
      error: `Coupon requires a minimum booking amount of ₹${promo.minBookingAmount}. Current total: ₹${bookingAmount}.`,
    });
  }

  let discountAmount = 0;
  if (promo.discountType === 'flat') {
    discountAmount = promo.discountValue;
  } else if (promo.discountType === 'percentage') {
    discountAmount = Math.round((bookingAmount * promo.discountValue) / 100);
  }

  // Ensure discount does not exceed total amount
  discountAmount = Math.min(discountAmount, bookingAmount);

  return res.json({
    success: true,
    data: {
      code: promo.code,
      title: promo.title,
      discountType: promo.discountType,
      discountAmount,
      finalAmount: Math.max(0, bookingAmount - discountAmount),
      badge: promo.badge,
    },
    message: `Promotion "${promo.code}" applied! You save ₹${discountAmount}.`,
  });
});

export default router;
