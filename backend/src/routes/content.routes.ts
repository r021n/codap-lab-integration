import { Router, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/db';
import { siteContents } from '../db/schema';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// ─── GET /api/contents/:slug ──────────────────────────────────────────────────
// Returns content for a specific slug. Public/Any authenticated user.
router.get('/:slug', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const result = await db
      .select()
      .from(siteContents)
      .where(eq(siteContents.slug, slug))
      .limit(1);

    if (result.length === 0) {
      return res.json({ slug, content: '', updatedAt: null });
    }

    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil konten' });
  }
});

// ─── PUT /api/contents/:slug ──────────────────────────────────────────────────
// Updates or creates content for a specific slug. Admin only.
router.put('/:slug', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const { content } = req.body;

    if (content === undefined || typeof content !== 'string') {
      return res.status(400).json({ error: 'Konten harus disertakan dalam format string' });
    }

    // Check if exists
    const existing = await db
      .select()
      .from(siteContents)
      .where(eq(siteContents.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      // Update
      const updated = await db
        .update(siteContents)
        .set({
          content,
          updatedAt: new Date(),
          updatedBy: req.user!.id,
        })
        .where(eq(siteContents.slug, slug))
        .returning();
      
      return res.json({
        message: 'Konten berhasil diperbarui',
        data: updated[0]
      });
    } else {
      // Insert
      const inserted = await db
        .insert(siteContents)
        .values({
          slug,
          content,
          updatedBy: req.user!.id,
        })
        .returning();

      return res.status(201).json({
        message: 'Konten berhasil dibuat',
        data: inserted[0]
      });
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Gagal menyimpan konten' });
  }
});

export default router;
