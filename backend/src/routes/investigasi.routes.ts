import { Router, Response } from 'express';
import multer from 'multer';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/db';
import { investigationSubmissions, chatMessages, users } from '../db/schema';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.middleware';
import { chatWithGemini } from '../services/gemini.service';

const router = Router();

const toParamString = (value: unknown): string | null => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return null;
};

// ─── Multer Configuration ─────────────────────────────────────────────────────
const storage = multer.memoryStorage();
const fileFilter = (_req: any, file: any, cb: any) => {
  const allowedExtensions = ['.csv', '.xlsx', '.xls'];
  const ext = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file CSV atau Excel yang diperbolehkan'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});

// ─── AI CHAT ROUTES ──────────────────────────────────────────────────────────

// POST /api/investigasi/chat
router.post('/chat', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { message, stepId = 2 } = req.body;
    if (!message) return res.status(400).json({ error: 'Pesan tidak boleh kosong' });

    const userId = req.user!.id;

    // Ambil riwayat chat untuk Gemini context
    const history = await db
      .select()
      .from(chatMessages)
      .where(and(eq(chatMessages.userId, userId), eq(chatMessages.stepId, stepId)))
      .orderBy(chatMessages.createdAt);

    const geminiHistory = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    }));

    // Simpan pesan user ke DB
    await db.insert(chatMessages).values({
      userId,
      stepId,
      role: 'user',
      content: message
    });

    // Panggil Gemini
    const aiResponse = await chatWithGemini(message, geminiHistory);

    let finalMessage = "";
    try {
      let jsonString = "";
      
      // 1. Prioritas: Cari blok kode Markdown (```json ... ```)
      const markdownRegex = /```json\s*([\s\S]*?)\s*```/g;
      const matches = [...aiResponse.matchAll(markdownRegex)];
      
      if (matches.length > 0) {
        // Ambil blok JSON terakhir (biasanya jawaban asli ada di paling bawah)
        jsonString = matches[matches.length - 1][1];
      } else {
        // 2. Fallback: Cari karakter { sampai } yang paling luas
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonString = jsonMatch[0];
        } else {
          throw new Error("Tidak ditemukan format JSON dalam respon AI");
        }
      }
      
      const parsed = JSON.parse(jsonString);
      finalMessage = parsed.pesan || "Gagal mendapatkan isi pesan dari AI.";
    } catch (e) {
      console.error("AI Response Raw:", aiResponse);
      console.error("Gagal parse JSON dari AI:", e);
      return res.status(500).json({ error: "Gagal memproses data terstruktur dari AI" });
    }

    // Simpan pesan AI ke DB
    const insertedAi = await db.insert(chatMessages).values({
      userId,
      stepId,
      role: 'model',
      content: finalMessage
    }).returning();

    res.json(insertedAi[0]);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Gagal memproses chat' });
  }
});

// GET /api/investigasi/chat/:stepId
router.get('/chat/:stepId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const stepIdParam = toParamString(req.params.stepId);
    const stepId = stepIdParam ? parseInt(stepIdParam, 10) : NaN;
    if (Number.isNaN(stepId)) {
      return res.status(400).json({ error: 'stepId tidak valid' });
    }
    const userId = req.user!.id;

    const messages = await db
      .select()
      .from(chatMessages)
      .where(and(eq(chatMessages.userId, userId), eq(chatMessages.stepId, stepId)))
      .orderBy(chatMessages.createdAt);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil riwayat chat' });
  }
});

// ─── SUBMISSION ROUTES ───────────────────────────────────────────────────────

// POST /api/investigasi/submit
router.post('/submit', authenticateToken, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'File tidak ditemukan' });
    }

    const userId = req.user!.id;
    const stepId = parseInt(req.body.stepId || '2');

    // Untuk file excel, kita simpan sebagai base64 string agar konsisten dengan fileData text field
    // Jika CSV, kita simpan string UTF-8 biasa
    const isCsv = req.file.originalname.toLowerCase().endsWith('.csv');
    const fileContent = isCsv 
      ? req.file.buffer.toString('utf-8') 
      : req.file.buffer.toString('base64');

    const sanitized = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storedName = `${Date.now()}_${sanitized}`;

    const inserted = await db.insert(investigationSubmissions).values({
      userId,
      stepId,
      originalName: req.file.originalname,
      storedName,
      fileData: fileContent
    }).returning();

    res.status(201).json(inserted[0]);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengunggah submission' });
  }
});

// GET /api/investigasi/submissions/:stepId
router.get('/submissions/:stepId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const stepIdParam = toParamString(req.params.stepId);
    const stepId = stepIdParam ? parseInt(stepIdParam, 10) : NaN;
    if (Number.isNaN(stepId)) {
      return res.status(400).json({ error: 'stepId tidak valid' });
    }
    const userId = req.user!.id;

    const submissions = await db
      .select()
      .from(investigationSubmissions)
      .where(and(eq(investigationSubmissions.userId, userId), eq(investigationSubmissions.stepId, stepId)))
      .orderBy(desc(investigationSubmissions.createdAt));

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil submission' });
  }
});

// GET /api/investigasi/admin/submissions/:stepId
router.get('/admin/submissions/:stepId', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const stepIdParam = toParamString(req.params.stepId);
    const stepId = stepIdParam ? parseInt(stepIdParam, 10) : NaN;
    if (Number.isNaN(stepId)) {
      return res.status(400).json({ error: 'stepId tidak valid' });
    }

    const allSubmissions = await db
      .select({
        id: investigationSubmissions.id,
        userName: users.name,
        userEmail: users.email,
        originalName: investigationSubmissions.originalName,
        storedName: investigationSubmissions.storedName,
        createdAt: investigationSubmissions.createdAt
      })
      .from(investigationSubmissions)
      .innerJoin(users, eq(investigationSubmissions.userId, users.id))
      .where(eq(investigationSubmissions.stepId, stepId))
      .orderBy(desc(investigationSubmissions.createdAt));

    res.json(allSubmissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil semua submission' });
  }
});

// GET /api/investigasi/download/:storedName (Admin & Siswa)
router.get('/download/:storedName', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const safeName = toParamString(req.params.storedName);
    if (!safeName) {
      return res.status(400).json({ error: 'storedName tidak valid' });
    }
    const record = await db.select().from(investigationSubmissions).where(eq(investigationSubmissions.storedName, safeName));

    if (record.length === 0) return res.status(404).json({ error: 'File tidak ditemukan' });

    const submission = record[0];
    
    // Check if user is admin or the owner
    if (req.user?.role !== 'admin' && req.user?.id !== submission.userId) {
      return res.status(403).json({ error: 'Unauthorized download' });
    }

    const isCsv = submission.originalName.toLowerCase().endsWith('.csv');
    
    if (isCsv) {
      res.setHeader('Content-Type', 'text/csv');
      res.attachment(submission.originalName);
      res.send(submission.fileData);
    } else {
      // Excel
      const buffer = Buffer.from(submission.fileData, 'base64');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.attachment(submission.originalName);
      res.send(buffer);
    }
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengunduh file' });
  }
});

export default router;
