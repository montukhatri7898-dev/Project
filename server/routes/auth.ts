import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db, UserDoc } from '../db.js';
import { signToken, sanitizeUser, AuthenticatedRequest, requireAuth } from '../auth.js';

const router = Router();

// Register new customer account
router.post('/register', async (req, res: Response) => {
  try {
    const { name, email, password, preferredCity } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email address already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: UserDoc = {
      _id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'customer', // Public registration is strictly customer
      preferredCity: preferredCity || 'Mumbai',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    db.save();

    const token = signToken(newUser);

    // Set secure HttpOnly cookie
    res.cookie('imovies_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      token,
      user: sanitizeUser(newUser),
      message: 'Account registered successfully.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Registration failed.' });
  }
});

// Login
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = signToken(user);

    res.cookie('imovies_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      token,
      user: sanitizeUser(user),
      message: 'Welcome back!',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Login failed.' });
  }
});

// Logout
router.post('/logout', (req, res: Response) => {
  res.clearCookie('imovies_token');
  return res.json({ success: true, message: 'Signed out successfully.' });
});

// Current Authenticated User (Me)
router.get('/me', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.json({ success: true, user: null });
  }

  const user = db.users.find((u) => u._id === req.user!.userId);
  if (!user) {
    return res.json({ success: true, user: null });
  }

  return res.json({
    success: true,
    user: sanitizeUser(user),
  });
});

// Update Profile
router.patch('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = db.users.find((u) => u._id === req.user!.userId);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  const { name, preferredCity, profileImage } = req.body;
  if (name) user.name = name.trim();
  if (preferredCity) user.preferredCity = preferredCity;
  if (profileImage !== undefined) user.profileImage = profileImage;
  user.updatedAt = new Date().toISOString();

  db.save();

  return res.json({
    success: true,
    user: sanitizeUser(user),
    message: 'Profile updated successfully.',
  });
});

// Change Password
router.post('/change-password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = db.users.find((u) => u._id === req.user!.userId);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, error: 'Current password and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, error: 'New password must be at least 6 characters.' });
  }

  const matches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!matches) {
    return res.status(400).json({ success: false, error: 'Incorrect current password.' });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.updatedAt = new Date().toISOString();
  db.save();

  return res.json({ success: true, message: 'Password changed successfully.' });
});

export default router;
