import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';

import { eq } from 'drizzle-orm';
import { db } from '../db/db';
import { datasets } from '../db/schema';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// ─── Multer Configuration ─────────────────────────────────────────────────────

const storage = multer.memoryStorage();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fileFilter = (_req: any, file: any, cb: any) => {
  if (
    (file.mimetype as string) === 'text/csv' ||
    (file.originalname as string).toLowerCase().endsWith('.csv')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file CSV yang diperbolehkan'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});

// ─── GET /api/datasets ────────────────────────────────────────────────────────
// Returns list of all datasets. Protected: any authenticated user.

router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const allDatasets = await db
      .select({
        id: datasets.id,
        name: datasets.originalName,
        storedName: datasets.storedName,
        uploadDate: datasets.createdAt,
      })
      .from(datasets)
      .orderBy(datasets.createdAt);

    const forwardedProto = req.headers['x-forwarded-proto'];
    const protocol =
      (Array.isArray(forwardedProto)
        ? forwardedProto[0]
        : forwardedProto?.split(',')[0]) || req.protocol;
    const host = req.get('host') as string;
    const baseUrl = `${protocol}://${host}`;

    const result = allDatasets.map((d) => ({
      id: String(d.id),
      name: d.name,
      url: `${baseUrl}/api/datasets/download/${encodeURIComponent(d.storedName)}`,
      uploadDate: d.uploadDate.toISOString().split('T')[0],
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil daftar dataset' });
  }
});

// ─── POST /api/datasets/upload ────────────────────────────────────────────────
// Uploads a new CSV file. Admin only.

router.post(
  '/upload',
  authenticateToken,
  requireAdmin,
  upload.single('file'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ error: 'File tidak ditemukan dalam request' });
      }

      const fileData = req.file.buffer.toString('utf-8');
      const sanitized = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storedName = `${Date.now()}_${sanitized}`;

      const inserted = await db
        .insert(datasets)
        .values({
          originalName: req.file.originalname,
          storedName: storedName,
          fileData: fileData,
          uploadedBy: req.user!.id,
        })
        .returning({ id: datasets.id, originalName: datasets.originalName });

      res.status(201).json({
        message: 'Dataset berhasil diunggah',
        dataset: inserted[0],
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || 'Gagal mengunggah dataset' });
    }
  }
);

// ─── GET /api/datasets/download/:storedName ───────────────────────────────────
// Serves the actual CSV file as a download. Protected: any authenticated user.

router.get('/download/:storedName', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const safeName = path.basename(req.params['storedName'] as string);
    
    const record = await db.select().from(datasets).where(eq(datasets.storedName, safeName));

    if (record.length === 0) {
      return res.status(404).json({ error: 'File tidak ditemukan di database' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.attachment(safeName);
    res.send(record[0].fileData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengunduh file' });
  }
});

// ─── DELETE /api/datasets/:id ─────────────────────────────────────────────────
// Deletes a dataset and its file. Admin only.

router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params['id'] as string, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID tidak valid' });
    }

    const record = await db.select().from(datasets).where(eq(datasets.id, id));

    if (record.length === 0) {
      return res.status(404).json({ error: 'Dataset tidak ditemukan' });
    }

    await db.delete(datasets).where(eq(datasets.id, id));

    res.json({ message: 'Dataset berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menghapus dataset' });
  }
});

export default router;
