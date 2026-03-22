import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db/db';
import { users } from '../db/schema';
import * as dotenv from 'dotenv';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

dotenv.config();
const SECRET = process.env.JWT_SECRET || 'fallback_secret';
const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const newUser = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    }).returning({ id: users.id, name: users.name, email: users.email, role: users.role });

    res.status(201).json({ message: 'User registered successfully', user: newUser[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const userRecord = await db.select().from(users).where(eq(users.email, email));
    if (userRecord.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = userRecord[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: '1d' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Protected route to get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
  
  try {
    const userRecord = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    }).from(users).where(eq(users.id, req.user.id));

    if (userRecord.length === 0) return res.status(404).json({ error: 'User not found' });

    res.json(userRecord[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
