import { Router, Response } from "express";
import multer from "multer";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../db/db";
import { investigationSubmissions, chatMessages, users } from "../db/schema";
import {
  authenticateToken,
  requireAdmin,
  AuthRequest,
} from "../middleware/auth.middleware";
import { chatWithGemini } from "../services/gemini.service";
import {
  canAccessInvestigasiStep,
  completeInvestigasiStep,
  getCompletedInvestigasiSteps,
  parseInvestigasiStepId,
} from "../services/investigasi-progress.service";

const router = Router();

const toParamString = (value: unknown): string | null => {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return null;
};

// ─── Multer Configuration ─────────────────────────────────────────────────────
const storage = multer.memoryStorage();
const fileFilter = (_req: any, file: any, cb: any) => {
  // Allow all extensions but we will validate size and specific logic in the route
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});

const ensureStepAccess = async (
  req: AuthRequest,
  res: Response,
  stepId: number,
): Promise<boolean> => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }

  const hasAccess = await canAccessInvestigasiStep({
    userId: req.user.id,
    userRole: req.user.role,
    stepId,
  });

  if (!hasAccess) {
    res
      .status(403)
      .json({
        error:
          "Langkah belum terbuka. Selesaikan langkah sebelumnya terlebih dahulu.",
      });
    return false;
  }

  return true;
};

// ─── PROGRESS ROUTES ─────────────────────────────────────────────────────────

// GET /api/investigasi/progress
router.get(
  "/progress",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const completedSteps = await getCompletedInvestigasiSteps(userId);

      res.json({ completedSteps });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Gagal mengambil progress investigasi" });
    }
  },
);

// PUT /api/investigasi/progress/:stepId/complete
router.put(
  "/progress/:stepId/complete",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const stepId = parseInvestigasiStepId(req.params.stepId);
      if (stepId === null) {
        return res
          .status(400)
          .json({ error: "stepId harus berada pada rentang 1 sampai 5" });
      }

      const hasAccess = await ensureStepAccess(req, res, stepId);
      if (!hasAccess) return;

      const completedSteps = await completeInvestigasiStep(
        req.user!.id,
        stepId,
      );

      res.json({ completedSteps });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Gagal menyimpan progress investigasi" });
    }
  },
);

// ─── AI CHAT ROUTES ──────────────────────────────────────────────────────────

// POST /api/investigasi/chat
router.post(
  "/chat",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { message } = req.body;
      const stepId = parseInvestigasiStepId(req.body.stepId ?? 2);

      if (!message)
        return res.status(400).json({ error: "Pesan tidak boleh kosong" });
      if (stepId === null) {
        return res
          .status(400)
          .json({ error: "stepId harus berada pada rentang 1 sampai 5" });
      }

      const userId = req.user!.id;

      const hasAccess = await ensureStepAccess(req, res, stepId);
      if (!hasAccess) return;

      // Ambil riwayat chat untuk Gemini context
      const history = await db
        .select()
        .from(chatMessages)
        .where(
          and(eq(chatMessages.userId, userId), eq(chatMessages.stepId, stepId)),
        )
        .orderBy(chatMessages.createdAt);

      const geminiHistory = history.map((h) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.content }],
      }));

      // Simpan pesan user ke DB
      await db.insert(chatMessages).values({
        userId,
        stepId,
        role: "user",
        content: message,
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
        return res
          .status(500)
          .json({ error: "Gagal memproses data terstruktur dari AI" });
      }

      // Simpan pesan AI ke DB
      const insertedAi = await db
        .insert(chatMessages)
        .values({
          userId,
          stepId,
          role: "model",
          content: finalMessage,
        })
        .returning();

      res.json(insertedAi[0]);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Gagal memproses chat" });
    }
  },
);

// GET /api/investigasi/chat/:stepId
router.get(
  "/chat/:stepId",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const stepId = parseInvestigasiStepId(req.params.stepId);
      if (stepId === null) {
        return res
          .status(400)
          .json({ error: "stepId harus berada pada rentang 1 sampai 5" });
      }

      const hasAccess = await ensureStepAccess(req, res, stepId);
      if (!hasAccess) return;

      const userId = req.user!.id;

      const messages = await db
        .select()
        .from(chatMessages)
        .where(
          and(eq(chatMessages.userId, userId), eq(chatMessages.stepId, stepId)),
        )
        .orderBy(chatMessages.createdAt);

      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Gagal mengambil riwayat chat" });
    }
  },
);

// ─── SUBMISSION ROUTES ───────────────────────────────────────────────────────

// POST /api/investigasi/submit
router.post(
  "/submit",
  authenticateToken,
  upload.single("file"),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ error: "File tidak ditemukan" });
      }

      const userId = req.user!.id;
      const stepId = parseInvestigasiStepId(req.body.stepId ?? 2);
      if (stepId === null) {
        return res
          .status(400)
          .json({ error: "stepId harus berada pada rentang 1 sampai 5" });
      }

      const hasAccess = await ensureStepAccess(req, res, stepId);
      if (!hasAccess) return;

      // ENFORCE 100KB LIMIT FOR STEP 3
      if (stepId === 3 && req.file.size > 100 * 1024) {
        return res
          .status(400)
          .json({
            error: "Ukuran file maksimal untuk langkah ini adalah 100KB",
          });
      }

      // Untuk file excel, kita simpan sebagai base64 string agar konsisten dengan fileData text field
      // Jika CSV, kita simpan string UTF-8 biasa
      const isCsv = req.file.originalname.toLowerCase().endsWith(".csv");
      const fileContent = isCsv
        ? req.file.buffer.toString("utf-8")
        : req.file.buffer.toString("base64");

      const sanitized = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storedName = `${Date.now()}_${sanitized}`;

      const inserted = await db
        .insert(investigationSubmissions)
        .values({
          userId,
          stepId,
          originalName: req.file.originalname,
          storedName,
          fileData: fileContent,
        })
        .returning();

      res.status(201).json(inserted[0]);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Gagal mengunggah submission" });
    }
  },
);

// GET /api/investigasi/submissions/:stepId
router.get(
  "/submissions/:stepId",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const stepId = parseInvestigasiStepId(req.params.stepId);
      if (stepId === null) {
        return res
          .status(400)
          .json({ error: "stepId harus berada pada rentang 1 sampai 5" });
      }

      const hasAccess = await ensureStepAccess(req, res, stepId);
      if (!hasAccess) return;

      const userId = req.user!.id;

      const submissions = await db
        .select()
        .from(investigationSubmissions)
        .where(
          and(
            eq(investigationSubmissions.userId, userId),
            eq(investigationSubmissions.stepId, stepId),
          ),
        )
        .orderBy(desc(investigationSubmissions.createdAt));

      res.json(submissions);
    } catch (error) {
      res.status(500).json({ error: "Gagal mengambil submission" });
    }
  },
);

// GET /api/investigasi/admin/submissions/:stepId
router.get(
  "/admin/submissions/:stepId",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const stepId = parseInvestigasiStepId(req.params.stepId);
      if (stepId === null) {
        return res
          .status(400)
          .json({ error: "stepId harus berada pada rentang 1 sampai 5" });
      }

      const allSubmissions = await db
        .select({
          id: investigationSubmissions.id,
          userName: users.name,
          userEmail: users.email,
          originalName: investigationSubmissions.originalName,
          storedName: investigationSubmissions.storedName,
          createdAt: investigationSubmissions.createdAt,
        })
        .from(investigationSubmissions)
        .innerJoin(users, eq(investigationSubmissions.userId, users.id))
        .where(eq(investigationSubmissions.stepId, stepId))
        .orderBy(desc(investigationSubmissions.createdAt));

      res.json(allSubmissions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Gagal mengambil semua submission" });
    }
  },
);

// GET /api/investigasi/download/:storedName (Admin & Siswa)
router.get(
  "/download/:storedName",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const safeName = toParamString(req.params.storedName);
      if (!safeName) {
        return res.status(400).json({ error: "storedName tidak valid" });
      }
      const record = await db
        .select()
        .from(investigationSubmissions)
        .where(eq(investigationSubmissions.storedName, safeName));

      if (record.length === 0)
        return res.status(404).json({ error: "File tidak ditemukan" });

      const submission = record[0];

      // Check if user is admin or the owner
      if (req.user?.role !== "admin" && req.user?.id !== submission.userId) {
        return res.status(403).json({ error: "Unauthorized download" });
      }

      const hasAccess = await ensureStepAccess(req, res, submission.stepId);
      if (!hasAccess) return;

      const isCsv = submission.originalName.toLowerCase().endsWith(".csv");

      if (isCsv) {
        res.setHeader("Content-Type", "text/csv");
        res.attachment(submission.originalName);
        res.send(submission.fileData);
      } else {
        // Excel
        const buffer = Buffer.from(submission.fileData, "base64");
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        res.attachment(submission.originalName);
        res.send(buffer);
      }
    } catch (error) {
      res.status(500).json({ error: "Gagal mengunduh file" });
    }
  },
);

export default router;
