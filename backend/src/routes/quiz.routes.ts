import { Router } from 'express';
import { eq, asc, desc } from 'drizzle-orm';
import { db } from '../db/db';
import { quizzes, quizQuestions, quizOptions, quizSubmissions, quizAnswers, users } from '../db/schema';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Helper for Express 5 param parsing (params can be string | string[])
const parseParam = (val: string | string[]): string => (Array.isArray(val) ? val[0] : val);

// ─── QUIZ CRUD (Admin) ─────────────────────────────────────────

// GET all quizzes
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const allQuizzes = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        description: quizzes.description,
        isPublished: quizzes.isPublished,
        createdAt: quizzes.createdAt,
        updatedAt: quizzes.updatedAt,
      })
      .from(quizzes)
      .orderBy(desc(quizzes.createdAt));

    res.json(allQuizzes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// GET single quiz with all questions & options
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const quizId = parseInt(parseParam(req.params.id));

    const quiz = await db.select().from(quizzes).where(eq(quizzes.id, quizId));
    if (quiz.length === 0) return res.status(404).json({ error: 'Quiz not found' });

    const questions = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quizId))
      .orderBy(asc(quizQuestions.orderIndex));

    const questionsWithOptions = await Promise.all(
      questions.map(async (q) => {
        const options = await db
          .select()
          .from(quizOptions)
          .where(eq(quizOptions.questionId, q.id))
          .orderBy(asc(quizOptions.orderIndex));

        // Only include isCorrect for admin users
        const isAdmin = req.user?.role === 'admin';
        return {
          ...q,
          options: options.map((o) => ({
            id: o.id,
            optionText: o.optionText,
            orderIndex: o.orderIndex,
            ...(isAdmin ? { isCorrect: o.isCorrect } : {}),
          })),
        };
      })
    );

    res.json({ ...quiz[0], questions: questionsWithOptions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// CREATE quiz (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const newQuiz = await db
      .insert(quizzes)
      .values({
        title,
        description: description || '',
        createdBy: req.user!.id,
      })
      .returning();

    res.status(201).json(newQuiz[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// UPDATE quiz metadata (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const quizId = parseInt(parseParam(req.params.id));
    const { title, description, isPublished } = req.body;

    const updated = await db
      .update(quizzes)
      .set({
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(isPublished !== undefined ? { isPublished } : {}),
        updatedAt: new Date(),
      })
      .where(eq(quizzes.id, quizId))
      .returning();

    if (updated.length === 0) return res.status(404).json({ error: 'Quiz not found' });

    res.json(updated[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update quiz' });
  }
});

// DELETE quiz (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const quizId = parseInt(parseParam(req.params.id));

    const deleted = await db
      .delete(quizzes)
      .where(eq(quizzes.id, quizId))
      .returning();

    if (deleted.length === 0) return res.status(404).json({ error: 'Quiz not found' });

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

// ─── QUESTION CRUD (Admin) ──────────────────────────────────────

// ADD question to quiz
router.post('/:quizId/questions', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const quizId = parseInt(parseParam(req.params.quizId));
    const { type, questionText, options } = req.body;

    if (!type || !questionText) {
      return res.status(400).json({ error: 'type and questionText are required' });
    }

    // Get the highest order index
    const existing = await db
      .select({ orderIndex: quizQuestions.orderIndex })
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quizId))
      .orderBy(desc(quizQuestions.orderIndex));

    const nextOrder = existing.length > 0 ? existing[0].orderIndex + 1 : 0;

    const newQuestion = await db
      .insert(quizQuestions)
      .values({
        quizId,
        type,
        questionText,
        orderIndex: nextOrder,
      })
      .returning();

    // If multiple choice, insert options
    if (type === 'multiple_choice' && Array.isArray(options) && options.length > 0) {
      const optionValues = options.map((opt: { optionText: string; isCorrect: boolean }, idx: number) => ({
        questionId: newQuestion[0].id,
        optionText: opt.optionText,
        isCorrect: opt.isCorrect || false,
        orderIndex: idx,
      }));

      await db.insert(quizOptions).values(optionValues);
    }

    // Fetch the complete question
    const completeQuestion = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.id, newQuestion[0].id));

    const questionOptions = await db
      .select()
      .from(quizOptions)
      .where(eq(quizOptions.questionId, newQuestion[0].id))
      .orderBy(asc(quizOptions.orderIndex));

    res.status(201).json({ ...completeQuestion[0], options: questionOptions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add question' });
  }
});

// UPDATE question
router.put('/questions/:questionId', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const questionId = parseInt(parseParam(req.params.questionId));
    const { questionText, type, options } = req.body;

    const updated = await db
      .update(quizQuestions)
      .set({
        ...(questionText !== undefined ? { questionText } : {}),
        ...(type !== undefined ? { type } : {}),
      })
      .where(eq(quizQuestions.id, questionId))
      .returning();

    if (updated.length === 0) return res.status(404).json({ error: 'Question not found' });

    // If options provided, replace them all
    if (Array.isArray(options)) {
      // Delete existing options
      await db.delete(quizOptions).where(eq(quizOptions.questionId, questionId));

      // Insert new options
      if (options.length > 0) {
        const optionValues = options.map((opt: { optionText: string; isCorrect: boolean }, idx: number) => ({
          questionId,
          optionText: opt.optionText,
          isCorrect: opt.isCorrect || false,
          orderIndex: idx,
        }));

        await db.insert(quizOptions).values(optionValues);
      }
    }

    // Fetch complete updated question
    const questionOptions = await db
      .select()
      .from(quizOptions)
      .where(eq(quizOptions.questionId, questionId))
      .orderBy(asc(quizOptions.orderIndex));

    res.json({ ...updated[0], options: questionOptions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// DELETE question
router.delete('/questions/:questionId', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const questionId = parseInt(parseParam(req.params.questionId));

    const deleted = await db
      .delete(quizQuestions)
      .where(eq(quizQuestions.id, questionId))
      .returning();

    if (deleted.length === 0) return res.status(404).json({ error: 'Question not found' });

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// REORDER questions
router.put('/:quizId/reorder', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { orderedIds } = req.body; // array of question IDs in desired order

    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds array is required' });
    }

    await Promise.all(
      orderedIds.map((id: number, index: number) =>
        db.update(quizQuestions).set({ orderIndex: index }).where(eq(quizQuestions.id, id))
      )
    );

    res.json({ message: 'Questions reordered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to reorder questions' });
  }
});

// ─── QUIZ SUBMISSION (Student) ──────────────────────────────────

// Submit quiz answers
router.post('/:quizId/submit', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const quizId = parseInt(parseParam(req.params.quizId));
    const userId = req.user!.id;
    const { answers } = req.body;
    // answers: [{ questionId, selectedOptionId?, essayAnswer? }]

    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: 'answers array is required' });
    }

    // Create submission
    const submission = await db
      .insert(quizSubmissions)
      .values({ quizId, userId })
      .returning();

    // Insert answers
    const answerValues = answers.map((a: { questionId: number; selectedOptionId?: number; essayAnswer?: string }) => ({
      submissionId: submission[0].id,
      questionId: a.questionId,
      selectedOptionId: a.selectedOptionId || null,
      essayAnswer: a.essayAnswer || null,
    }));

    await db.insert(quizAnswers).values(answerValues);

    res.status(201).json({ message: 'Quiz submitted successfully', submissionId: submission[0].id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

// ─── TEACHER VIEW (Admin) ──────────────────────────────────────

// GET all submissions for a quiz
router.get('/:quizId/submissions', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const quizId = parseInt(parseParam(req.params.quizId));

    const submissions = await db
      .select({
        submissionId: quizSubmissions.id,
        userId: quizSubmissions.userId,
        userName: users.name,
        userEmail: users.email,
        submittedAt: quizSubmissions.submittedAt,
      })
      .from(quizSubmissions)
      .innerJoin(users, eq(quizSubmissions.userId, users.id))
      .where(eq(quizSubmissions.quizId, quizId))
      .orderBy(desc(quizSubmissions.submittedAt));

    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// GET a specific submission's answers
router.get('/submissions/:submissionId', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const submissionId = parseInt(parseParam(req.params.submissionId));

    const submission = await db
      .select({
        submissionId: quizSubmissions.id,
        quizId: quizSubmissions.quizId,
        userId: quizSubmissions.userId,
        userName: users.name,
        userEmail: users.email,
        submittedAt: quizSubmissions.submittedAt,
      })
      .from(quizSubmissions)
      .innerJoin(users, eq(quizSubmissions.userId, users.id))
      .where(eq(quizSubmissions.id, submissionId));

    if (submission.length === 0) return res.status(404).json({ error: 'Submission not found' });

    const answers = await db
      .select({
        answerId: quizAnswers.id,
        questionId: quizAnswers.questionId,
        questionText: quizQuestions.questionText,
        questionType: quizQuestions.type,
        selectedOptionId: quizAnswers.selectedOptionId,
        essayAnswer: quizAnswers.essayAnswer,
      })
      .from(quizAnswers)
      .innerJoin(quizQuestions, eq(quizAnswers.questionId, quizQuestions.id))
      .where(eq(quizAnswers.submissionId, submissionId))
      .orderBy(asc(quizQuestions.orderIndex));

    // For each MC answer, get the selected option text and the correct option text
    const enrichedAnswers = await Promise.all(
      answers.map(async (a) => {
        if (a.questionType === 'multiple_choice') {
          const allOptions = await db
            .select()
            .from(quizOptions)
            .where(eq(quizOptions.questionId, a.questionId))
            .orderBy(asc(quizOptions.orderIndex));

          const selectedOption = allOptions.find((o) => o.id === a.selectedOptionId);
          const correctOption = allOptions.find((o) => o.isCorrect);

          return {
            ...a,
            selectedOptionText: selectedOption?.optionText || '-',
            correctOptionText: correctOption?.optionText || '-',
            isCorrect: selectedOption?.id === correctOption?.id,
            allOptions,
          };
        }
        return { ...a, selectedOptionText: null, correctOptionText: null, isCorrect: null, allOptions: [] };
      })
    );

    res.json({ ...submission[0], answers: enrichedAnswers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch submission details' });
  }
});

export default router;
