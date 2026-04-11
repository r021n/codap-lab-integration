import { useState, useEffect, useCallback } from "react";
import {
  addQuestion as addQuestionApi,
  createQuiz as createQuizApi,
  deleteQuestion as deleteQuestionApi,
  deleteQuiz as deleteQuizApi,
  getQuizDetail as getQuizDetailApi,
  getQuizzes as getQuizzesApi,
  getSubmissionDetail as getSubmissionDetailApi,
  getSubmissions as getSubmissionsApi,
  reorderQuestions as reorderQuestionsApi,
  submitQuiz as submitQuizApi,
  updateQuestion as updateQuestionApi,
  updateQuiz as updateQuizApi,
} from "../api/quiz.api";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { showToast, ToastContainer } from "../components/ui/toast";
import ConfirmDialog from "../components/ui/confirm-dialog";
import {
  Eye,
  Edit,
  GraduationCap,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  Circle,
  ClipboardList,
  Send,
  FileText,
} from "lucide-react";

type User = { name: string; email: string; role: string };
type Option = {
  id?: number;
  optionText: string;
  isCorrect?: boolean;
  orderIndex: number;
};
type Question = {
  id: number;
  quizId: number;
  type: string;
  questionText: string;
  orderIndex: number;
  options: Option[];
};
type Quiz = {
  id: number;
  title: string;
  description: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  questions?: Question[];
};
type Submission = {
  submissionId: number;
  userId: number;
  userName: string;
  userEmail: string;
  submittedAt: string;
};
type SubmissionDetail = Submission & {
  quizId: number;
  answers: {
    answerId: number;
    questionId: number;
    questionText: string;
    questionType: string;
    selectedOptionId: number | null;
    essayAnswer: string | null;
    selectedOptionText: string | null;
    correctOptionText: string | null;
    isCorrect: boolean | null;
    allOptions: Option[];
  }[];
};

// ─── STUDENT QUIZ VIEW ──────────────────────────────────────────
function StudentQuizView({ quiz }: { quiz: Quiz & { questions: Question[] } }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<
    Record<number, { selectedOptionId?: number; essayAnswer?: string }>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<SubmissionDetail | null>(null);
  const [isLoadingResult, setIsLoadingResult] = useState(false);

  const q = quiz.questions[current];
  const total = quiz.questions.length;
  const progress =
    total > 0 ? Math.round((Object.keys(answers).length / total) * 100) : 0;

  const handleSelect = (optId: number) => {
    setAnswers((p) => ({ ...p, [q.id]: { selectedOptionId: optId } }));
  };
  const handleEssay = (text: string) => {
    setAnswers((p) => ({ ...p, [q.id]: { essayAnswer: text } }));
  };

  const handleSubmit = async () => {
    const payload = quiz.questions.map((question) => ({
      questionId: question.id,
      selectedOptionId: answers[question.id]?.selectedOptionId || null,
      essayAnswer: answers[question.id]?.essayAnswer || null,
    }));
    try {
      const resp = await submitQuizApi(quiz.id, { answers: payload });
      setSubmitted(true);
      showToast("Kuis berhasil dikirim!", "success");

      // Fetch the detailed result
      setIsLoadingResult(true);
      try {
        const detail = await getSubmissionDetailApi(resp.submissionId);
        setResult(detail as SubmissionDetail);
      } catch (err) {
        console.error("Failed to fetch result detail", err);
      } finally {
        setIsLoadingResult(false);
      }
    } catch {
      showToast("Terjadi kesalahan jaringan.", "error");
    }
  };

  if (submitted) {
    if (isLoadingResult) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse"> Memproses hasil...</p>
        </div>
      );
    }

    if (result) {
      const correctCount = result.answers.filter((a) => a.isCorrect === true).length;
      const totalCount = result.answers.length;
      const score = Math.round((correctCount / totalCount) * 100);
      const hasEssay = result.answers.some((a) => a.questionType === "essay");

      return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Dashboard Ringkasan */}
          <Card className="overflow-hidden border-none bg-linear-to-br from-primary/10 via-background to-secondary/10 shadow-xl">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                    <CheckCircle className="w-3.5 h-3.5" /> Kuis Selesai
                  </div>
                  <h2 className="font-serif text-3xl font-bold text-foreground">
                    Hasil Pekerjaan Kamu
                  </h2>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Terima kasih telah mengerjakan kuis <strong>{quiz.title}</strong>. 
                    Berikut adalah rincian jawaban kamu.
                  </p>
                </div>

                <div className="relative flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-muted-foreground/10"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={364.4}
                      strokeDashoffset={364.4 - (364.4 * score) / 100}
                      className="text-primary transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-foreground">{score}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">Skor</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border/10 flex flex-col sm:flex-row items-center gap-4 text-sm">
                <div className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-lg border border-border/10">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-foreground font-medium">{correctCount} Benar</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-lg border border-border/10">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                  <span className="text-muted-foreground">{totalCount - correctCount} Salah/Belum Dinilai</span>
                </div>
                
                {hasEssay ? (
                  <div className="flex-1 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-md border border-amber-100 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span><strong>Nilai Sementara:</strong> Skor akan diperbarui setelah guru menilai soal essay.</span>
                  </div>
                ) : (
                  <div className="flex-1 text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-md border border-emerald-100 flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span><strong>Nilai Final:</strong> Skor ini sudah tetap dan tidak akan berubah.</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Rincian Jawaban */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-foreground px-1">Rincian Pertanyaan</h3>
            <div className="grid gap-4">
              {result.answers.map((a, i) => (
                <Card key={a.answerId} className="border border-border/10 overflow-hidden hover:shadow-md transition-shadow">
                  <div className={`h-1 w-full ${a.questionType === 'multiple_choice' ? (a.isCorrect ? 'bg-primary' : 'bg-red-400') : 'bg-amber-400'}`} />
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                         <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-wider">
                            Soal {i + 1}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${a.questionType === 'multiple_choice' ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-600'}`}>
                            {a.questionType === 'multiple_choice' ? 'Pilihan Ganda' : 'Essay'}
                          </span>
                        </div>
                        <p className="text-foreground font-medium leading-relaxed">
                          {a.questionText}
                        </p>
                      </div>
                      
                      {a.questionType === 'multiple_choice' && (
                        <div className={`p-2 rounded-full ${a.isCorrect ? 'bg-primary/10 text-primary' : 'bg-red-50 text-red-500'}`}>
                          {a.isCorrect ? <CheckCircle className="w-5 h-5" /> : <div className="w-5 h-5 flex items-center justify-center font-bold">✕</div>}
                        </div>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Jawaban Kamu</p>
                        {a.questionType === 'multiple_choice' ? (
                          <p className={`text-sm font-semibold ${a.isCorrect ? 'text-primary' : 'text-red-500'}`}>
                            {a.selectedOptionText || '-'}
                          </p>
                        ) : (
                          <p className="text-sm text-foreground bg-muted/30 p-2 rounded italic">
                            {a.essayAnswer || <span className="text-muted-foreground opacity-50">Tidak dijawab</span>}
                          </p>
                        )}
                      </div>

                      {a.questionType === 'multiple_choice' && !a.isCorrect && (
                        <div className="space-y-1">
                          <p className="text-[10px] text-primary uppercase font-bold tracking-tighter">Jawaban Benar</p>
                          <p className="text-sm font-semibold text-primary">
                            {a.correctOptionText}
                          </p>
                        </div>
                      )}

                      {a.questionType === 'essay' && (
                        <div className="space-y-1">
                          <p className="text-[10px] text-amber-600 uppercase font-bold tracking-tighter">Status Penilaian</p>
                          <p className="text-sm font-semibold text-amber-600 flex items-center gap-1">
                             <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Menunggu dinilai oleh guru
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-primary/90 text-white rounded-lg px-8 py-6 h-auto"
            >
              Kembali ke Daftar Kuis
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          Kuis Berhasil Dikirim!
        </h2>
        <p className="text-muted-foreground text-center max-w-md">
          Jawaban kamu sudah tercatat. Terima kasih telah mengerjakan kuis ini.
        </p>
      </div>
    );
  }

  if (total === 0) {
    return (
      <p className="text-muted-foreground text-center py-12">
        Belum ada soal dalam kuis ini.
      </p>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Soal {current + 1} dari {total}
          </span>
          <span>{progress}% selesai</span>
        </div>
        <div className="w-full h-3 bg-muted-foreground/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-primary to-secondary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card className="border border-border/20 bg-background shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg">
        <CardHeader className="border-b border-border/10 bg-background">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">
              {current + 1}
            </span>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
              {q.type === "multiple_choice" ? "Pilihan Ganda" : "Essay"}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <p className="text-foreground text-lg leading-relaxed font-medium">
            {q.questionText}
          </p>

          {q.type === "multiple_choice" ? (
            <div className="space-y-3">
              {q.options.map((opt) => {
                const selected = answers[q.id]?.selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(opt.id!)}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                      selected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/20 hover:border-primary/40 hover:bg-background"
                    }`}
                  >
                    {selected ? (
                      <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                    )}
                    <span
                      className={`text-sm ${selected ? "text-foreground font-medium" : "text-foreground"}`}
                    >
                      {opt.optionText}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <textarea
              value={answers[q.id]?.essayAnswer || ""}
              onChange={(e) => handleEssay(e.target.value)}
              placeholder="Tulis jawaban kamu di sini..."
              rows={6}
              className="w-full p-4 rounded-lg border-2 border-border/20 bg-background text-foreground text-sm resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => setCurrent((c) => c - 1)}
          disabled={current === 0}
          className="bg-transparent border-2 border-foreground text-foreground hover:bg-foreground/5 disabled:opacity-30 rounded-lg"
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> Sebelumnya
        </Button>
        {current === total - 1 ? (
          <Button
            onClick={handleSubmit}
            className="bg-primary hover:bg-primary/90 text-white rounded-lg px-6"
          >
            <Send className="w-4 h-4 mr-2" /> Kirim Jawaban
          </Button>
        ) : (
          <Button
            onClick={() => setCurrent((c) => c + 1)}
            className="bg-primary hover:bg-primary/90 text-white rounded-lg"
          >
            Selanjutnya <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── EDITOR MODE ────────────────────────────────────────────────
function EditorMode() {
  const [quizList, setQuizList] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<
    (Quiz & { questions: Question[] }) | null
  >(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [qType, setQType] = useState<"multiple_choice" | "essay">(
    "multiple_choice",
  );
  const [qText, setQText] = useState("");
  const [qOptions, setQOptions] = useState<
    { optionText: string; isCorrect: boolean }[]
  >([
    { optionText: "", isCorrect: true },
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
  ]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    type: "quiz" | "question";
    id: number;
  } | null>(null);

  const fetchQuizzes = useCallback(async () => {
    try {
      const quizzes = await getQuizzesApi();
      setQuizList(quizzes);
    } catch {
      console.error("Failed to fetch quizzes");
    }
  }, []);

  const fetchQuizDetail = useCallback(async (id: number) => {
    try {
      const quizDetail = await getQuizDetailApi(id);
      setSelectedQuiz(quizDetail as Quiz & { questions: Question[] });
    } catch {
      console.error("Failed to fetch quiz detail");
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const createQuiz = async () => {
    if (!newTitle.trim()) return showToast("Judul kuis harus diisi.", "error");
    try {
      await createQuizApi({ title: newTitle, description: newDesc });
      showToast("Kuis berhasil dibuat!", "success");
      setNewTitle("");
      setNewDesc("");
      fetchQuizzes();
    } catch {
      showToast("Kesalahan jaringan.", "error");
    }
  };

  const togglePublish = async (quiz: Quiz) => {
    try {
      await updateQuizApi(quiz.id, { isPublished: !quiz.isPublished });
      fetchQuizzes();
      if (selectedQuiz?.id === quiz.id) fetchQuizDetail(quiz.id);
    } catch {
      showToast("Gagal mengubah status.", "error");
    }
  };

  const addQuestion = async () => {
    if (!selectedQuiz || !qText.trim())
      return showToast("Teks soal harus diisi.", "error");
    const body: any = { type: qType, questionText: qText };
    if (qType === "multiple_choice")
      body.options = qOptions.filter((o) => o.optionText.trim());
    try {
      await addQuestionApi(selectedQuiz.id, body);
      showToast("Soal berhasil ditambahkan!", "success");
      resetQuestionForm();
      fetchQuizDetail(selectedQuiz.id);
    } catch {
      showToast("Kesalahan jaringan.", "error");
    }
  };

  const updateQuestion = async () => {
    if (!editingQuestion || !qText.trim()) return;
    const body: any = { type: qType, questionText: qText };
    if (qType === "multiple_choice")
      body.options = qOptions.filter((o) => o.optionText.trim());
    try {
      await updateQuestionApi(editingQuestion.id, body);
      showToast("Soal berhasil diperbarui!", "success");
      resetQuestionForm();
      if (selectedQuiz) fetchQuizDetail(selectedQuiz.id);
    } catch {
      showToast("Kesalahan jaringan.", "error");
    }
  };

  const confirmDelete = (type: "quiz" | "question", id: number) => {
    setPendingDelete({ type, id });
    setConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!pendingDelete) return;
    setConfirmOpen(false);
    try {
      if (pendingDelete.type === "quiz") {
        await deleteQuizApi(pendingDelete.id);
      } else {
        await deleteQuestionApi(pendingDelete.id);
      }
      showToast("Berhasil dihapus!", "success");
      if (pendingDelete.type === "quiz") {
        setSelectedQuiz(null);
        fetchQuizzes();
      } else if (selectedQuiz) fetchQuizDetail(selectedQuiz.id);
    } catch {
      showToast("Kesalahan jaringan.", "error");
    }
    setPendingDelete(null);
  };

  const moveQuestion = async (idx: number, dir: -1 | 1) => {
    if (!selectedQuiz) return;
    const qs = [...selectedQuiz.questions];
    const target = idx + dir;
    if (target < 0 || target >= qs.length) return;
    [qs[idx], qs[target]] = [qs[target], qs[idx]];
    const orderedIds = qs.map((q) => q.id);
    try {
      await reorderQuestionsApi(selectedQuiz.id, orderedIds);
      fetchQuizDetail(selectedQuiz.id);
    } catch {
      showToast("Gagal mengubah urutan.", "error");
    }
  };

  const startEdit = (q: Question) => {
    setEditingQuestion(q);
    setQType(q.type as any);
    setQText(q.questionText);
    if (q.type === "multiple_choice") {
      const opts =
        q.options.length > 0
          ? q.options.map((o) => ({
              optionText: o.optionText,
              isCorrect: o.isCorrect || false,
            }))
          : [
              { optionText: "", isCorrect: true },
              { optionText: "", isCorrect: false },
            ];
      setQOptions(opts);
    } else setQOptions([]);
    setShowAddQuestion(true);
  };

  const resetQuestionForm = () => {
    setShowAddQuestion(false);
    setEditingQuestion(null);
    setQText("");
    setQType("multiple_choice");
    setQOptions([
      { optionText: "", isCorrect: true },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
    ]);
  };

  // ── Quiz List View ──
  if (!selectedQuiz) {
    return (
      <div className="space-y-6">
        <Card className="border border-primary/20 bg-primary/5 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg">
          <CardHeader>
            <CardTitle className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Buat Kuis Baru
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Judul kuis"
              className="bg-background border-gray-300 focus:border-primary focus:ring-primary"
            />
            <Input
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Deskripsi (opsional)"
              className="bg-background border-gray-300 focus:border-primary focus:ring-primary"
            />
            <Button
              onClick={createQuiz}
              className="bg-primary hover:bg-primary/90 text-white rounded-lg"
            >
              Buat Kuis
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-border/20 bg-background shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg">
          <CardHeader className="border-b border-border/10">
            <CardTitle className="font-serif text-xl font-bold text-foreground">
              Daftar Kuis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {quizList.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Belum ada kuis.</p>
            ) : (
              <div className="space-y-3">
                {quizList.map((qz) => (
                  <div
                    key={qz.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/20 hover:border-primary/30 hover:bg-background transition-all"
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer flex-1"
                      onClick={() => fetchQuizDetail(qz.id)}
                    >
                      <ClipboardList className="w-5 h-5 text-primary shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">
                          {qz.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {qz.isPublished ? "✅ Dipublikasi" : "📝 Draft"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePublish(qz)}
                        className="text-xs border-border/30 hover:bg-background"
                      >
                        {qz.isPublished ? "Sembunyikan" : "Publikasi"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => confirmDelete("quiz", qz.id)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <ConfirmDialog
          open={confirmOpen}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => {
            setConfirmOpen(false);
            setPendingDelete(null);
          }}
          title="Hapus"
          description="Apakah Anda yakin ingin menghapus ini? Tindakan ini tidak dapat dibatalkan."
          confirmText="Ya, Hapus"
          cancelText="Batal"
          variant="danger"
        />
      </div>
    );
  }

  // ── Quiz Detail / Question Editor ──
  return (
    <div className="space-y-6">
      <button
        onClick={() => setSelectedQuiz(null)}
        className="flex items-center gap-2 text-sm text-primary hover:text-primary/90 font-medium transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Kembali ke Daftar Kuis
      </button>

      <Card className="border border-border/20 bg-background shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg">
        <CardHeader className="border-b border-border/10 bg-background">
          <CardTitle className="font-serif text-xl font-bold text-foreground">
            {selectedQuiz.title}
          </CardTitle>
          {selectedQuiz.description && (
            <CardDescription className="text-muted-foreground">
              {selectedQuiz.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {selectedQuiz.questions.length} soal
            </span>
            <Button
              onClick={() => {
                resetQuestionForm();
                setShowAddQuestion(true);
              }}
              className="bg-primary hover:bg-primary/90 text-white rounded-lg text-sm"
            >
              <Plus className="w-4 h-4 mr-2" /> Tambah Soal
            </Button>
          </div>

          {/* Question List */}
          {selectedQuiz.questions.map((q, idx) => (
            <div
              key={q.id}
              className="p-4 rounded-lg border border-border/20 bg-background/50 space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {q.type === "multiple_choice" ? "PG" : "Essay"} #{idx + 1}
                    </span>
                  </div>
                  <p className="text-sm text-foreground font-medium">
                    {q.questionText}
                  </p>
                  {q.type === "multiple_choice" && (
                    <div className="mt-2 space-y-1">
                      {q.options.map((o) => (
                        <p
                          key={o.id}
                          className={`text-xs pl-4 ${o.isCorrect ? "text-primary font-semibold" : "text-muted-foreground"}`}
                        >
                          {o.isCorrect ? "✓" : "○"} {o.optionText}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveQuestion(idx, -1)}
                    disabled={idx === 0}
                    className="p-1 rounded hover:bg-muted-foreground/10 disabled:opacity-20"
                  >
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => moveQuestion(idx, 1)}
                    disabled={idx === selectedQuiz.questions.length - 1}
                    className="p-1 rounded hover:bg-muted-foreground/10 disabled:opacity-20"
                  >
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => startEdit(q)}
                    className="p-1 rounded hover:bg-primary/10"
                  >
                    <Edit className="w-4 h-4 text-primary" />
                  </button>
                  <button
                    onClick={() => confirmDelete("question", q.id)}
                    className="p-1 rounded hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Add/Edit Question Modal-like card */}
      {showAddQuestion && (
        <Card className="border-2 border-primary/30 bg-background shadow-lg rounded-lg animate-scale-in">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="font-serif text-lg font-bold text-foreground">
              {editingQuestion ? "Edit Soal" : "Tambah Soal Baru"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-3">
              <button
                onClick={() => setQType("multiple_choice")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${qType === "multiple_choice" ? "bg-primary text-white" : "bg-muted-foreground/10 text-muted-foreground hover:text-foreground"}`}
              >
                Pilihan Ganda
              </button>
              <button
                onClick={() => setQType("essay")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${qType === "essay" ? "bg-primary text-white" : "bg-muted-foreground/10 text-muted-foreground hover:text-foreground"}`}
              >
                Essay
              </button>
            </div>
            <textarea
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              placeholder="Teks soal..."
              rows={3}
              className="w-full p-3 rounded-lg border-2 border-border/20 bg-background text-sm text-foreground resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
            />

            {qType === "multiple_choice" && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">
                  Pilihan Jawaban{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    (klik radio untuk jawaban benar)
                  </span>
                </p>
                {qOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setQOptions((p) =>
                          p.map((o, j) => ({ ...o, isCorrect: j === i })),
                        )
                      }
                      className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${opt.isCorrect ? "border-primary bg-primary" : "border-border/40"}`}
                    >
                      {opt.isCorrect && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </button>
                    <Input
                      value={opt.optionText}
                      onChange={(e) =>
                        setQOptions((p) =>
                          p.map((o, j) =>
                            j === i ? { ...o, optionText: e.target.value } : o,
                          ),
                        )
                      }
                      placeholder={`Pilihan ${String.fromCharCode(65 + i)}`}
                      className="bg-background border-gray-300 focus:border-primary focus:ring-primary"
                    />
                    {qOptions.length > 2 && (
                      <button
                        onClick={() =>
                          setQOptions((p) => p.filter((_, j) => j !== i))
                        }
                        className="p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    )}
                  </div>
                ))}
                {qOptions.length < 6 && (
                  <button
                    onClick={() =>
                      setQOptions((p) => [
                        ...p,
                        { optionText: "", isCorrect: false },
                      ])
                    }
                    className="text-sm text-primary hover:text-primary/90 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Tambah Pilihan
                  </button>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                onClick={editingQuestion ? updateQuestion : addQuestion}
                className="bg-primary hover:bg-primary/90 text-white rounded-lg"
              >
                {editingQuestion ? "Simpan Perubahan" : "Tambah Soal"}
              </Button>
              <Button
                onClick={resetQuestionForm}
                className="bg-transparent border-2 border-foreground text-foreground hover:bg-foreground/5 rounded-lg"
              >
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDelete(null);
        }}
        title="Hapus"
        description="Apakah Anda yakin ingin menghapus ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
      />
    </div>
  );
}

// ─── TEACHER MODE ───────────────────────────────────────────────
function TeacherMode() {
  const [quizList, setQuizList] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [detail, setDetail] = useState<SubmissionDetail | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const quizzes = await getQuizzesApi();
        setQuizList(quizzes);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const fetchSubmissions = async (quizId: number) => {
    setSelectedQuizId(quizId);
    setDetail(null);
    try {
      const submissionList = await getSubmissionsApi(quizId);
      setSubmissions(submissionList);
    } catch {
      showToast("Gagal memuat data.", "error");
    }
  };

  const fetchDetail = async (submissionId: number) => {
    try {
      const submissionDetail = await getSubmissionDetailApi(submissionId);
      setDetail(submissionDetail as SubmissionDetail);
    } catch {
      showToast("Gagal memuat detail.", "error");
    }
  };

  // Detail view
  if (detail) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setDetail(null)}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/90 font-medium"
        >
          <ChevronLeft className="w-4 h-4" /> Kembali
        </button>
        <Card className="border border-border/20 bg-background shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg">
          <CardHeader className="border-b border-border/10 bg-background">
            <CardTitle className="font-serif text-xl font-bold text-foreground">
              Jawaban: {detail.userName}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {detail.userEmail} •{" "}
              {new Date(detail.submittedAt).toLocaleString("id-ID")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {detail.answers.map((a, i) => (
              <div
                key={a.answerId}
                className={`p-4 rounded-lg border ${a.questionType === "multiple_choice" ? (a.isCorrect ? "border-primary/30 bg-primary/5" : "border-red-200 bg-red-50/50") : "border-border/20 bg-background/50"}`}
              >
                <p className="text-sm font-medium text-foreground mb-2">
                  {i + 1}. {a.questionText}
                </p>
                {a.questionType === "multiple_choice" ? (
                  <div className="space-y-1 text-xs">
                    <p>
                      Jawaban siswa:{" "}
                      <span
                        className={`font-semibold ${a.isCorrect ? "text-primary" : "text-red-500"}`}
                      >
                        {a.selectedOptionText || "-"}
                      </span>
                    </p>
                    {!a.isCorrect && (
                      <p>
                        Jawaban benar:{" "}
                        <span className="font-semibold text-primary">
                          {a.correctOptionText}
                        </span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-1 p-3 bg-background rounded border border-border/10 text-sm text-foreground">
                    {a.essayAnswer || (
                      <span className="text-muted-foreground italic">
                        Tidak dijawab
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Submissions list
  if (selectedQuizId !== null) {
    const qz = quizList.find((q) => q.id === selectedQuizId);
    return (
      <div className="space-y-6">
        <button
          onClick={() => {
            setSelectedQuizId(null);
            setSubmissions([]);
          }}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/90 font-medium"
        >
          <ChevronLeft className="w-4 h-4" /> Kembali
        </button>
        <Card className="border border-border/20 bg-background shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg">
          <CardHeader className="border-b border-border/10 bg-background">
            <CardTitle className="font-serif text-xl font-bold text-foreground">
              Hasil Kuis: {qz?.title}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {submissions.length} pengumpulan
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {submissions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Belum ada siswa yang mengumpulkan.
              </p>
            ) : (
              <div className="rounded-lg border border-border/20 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-background border-b border-border/20">
                    <tr>
                      <th className="px-5 py-3 text-left font-semibold text-foreground">
                        Nama Siswa
                      </th>
                      <th className="px-5 py-3 text-left font-semibold text-foreground">
                        Email
                      </th>
                      <th className="px-5 py-3 text-left font-semibold text-foreground">
                        Waktu
                      </th>
                      <th className="px-5 py-3 text-right font-semibold text-foreground">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10">
                    {submissions.map((s) => (
                      <tr
                        key={s.submissionId}
                        className="hover:bg-background/50 transition-colors"
                      >
                        <td className="px-5 py-3 font-medium text-foreground">
                          {s.userName}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {s.userEmail}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {new Date(s.submittedAt).toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fetchDetail(s.submissionId)}
                            className="text-xs border-primary/30 text-primary hover:bg-primary/5"
                          >
                            <FileText className="w-3.5 h-3.5 mr-1" /> Lihat
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz picker
  return (
    <Card className="border border-border/20 bg-background shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg">
      <CardHeader className="border-b border-border/10 bg-background">
        <CardTitle className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" /> Pilih Kuis untuk
          Melihat Hasil
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {quizList.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Belum ada kuis.</p>
        ) : (
          <div className="space-y-3">
            {quizList.map((qz) => (
              <button
                key={qz.id}
                onClick={() => fetchSubmissions(qz.id)}
                className="w-full flex items-center gap-3 p-4 rounded-lg border border-border/20 hover:border-primary/30 hover:bg-background transition-all text-left"
              >
                <ClipboardList className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">{qz.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {qz.isPublished ? "✅ Dipublikasi" : "📝 Draft"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── PREVIEW MODE (Student-like for admin, actual quiz for users) ─
function PreviewMode({ user }: { user: User }) {
  const [quizList, setQuizList] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<
    (Quiz & { questions: Question[] }) | null
  >(null);

  useEffect(() => {
    (async () => {
      try {
        const all = await getQuizzesApi();
        setQuizList(
          user.role === "admin" ? all : all.filter((q) => q.isPublished),
        );
      } catch {
        /* ignore */
      }
    })();
  }, [user.role]);

  const selectQuiz = async (id: number) => {
    try {
      const quizDetail = await getQuizDetailApi(id);
      setSelectedQuiz(quizDetail as Quiz & { questions: Question[] });
    } catch {
      showToast("Gagal memuat kuis.", "error");
    }
  };

  if (selectedQuiz) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedQuiz(null)}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/90 font-medium"
        >
          <ChevronLeft className="w-4 h-4" /> Kembali ke Daftar Kuis
        </button>
        <StudentQuizView
          quiz={selectedQuiz as Quiz & { questions: Question[] }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {quizList.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          Belum ada kuis yang tersedia.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizList.map((qz) => (
            <Card
              key={qz.id}
              onClick={() => selectQuiz(qz.id)}
              className="border border-border/20 bg-background shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg cursor-pointer hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-serif text-lg font-bold text-foreground">
                  {qz.title}
                </h3>
                {qz.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {qz.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    {new Date(qz.createdAt).toLocaleDateString("id-ID")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN QUIZ PAGE ──────────────────────────────────────────────
export default function QuizPage({ user }: { user: User }) {
  const [mode, setMode] = useState<"preview" | "editor" | "teacher">("preview");
  const activeMode = user.role === "admin" ? mode : "preview";

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12 font-sans text-foreground">
      <ToastContainer />

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Kuis</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {user.role === "admin"
              ? "Kelola dan pantau kuis untuk siswa."
              : "Kerjakan kuis yang tersedia."}
          </p>
        </div>

        {user.role === "admin" && (
          <div className="flex bg-background p-1 rounded-lg border border-border/20 shrink-0">
            {(["preview", "editor", "teacher"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === m ? "bg-background shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {m === "preview" && <Eye className="w-4 h-4" />}
                {m === "editor" && <Edit className="w-4 h-4" />}
                {m === "teacher" && <GraduationCap className="w-4 h-4" />}
                {m === "preview"
                  ? "Preview"
                  : m === "editor"
                    ? "Editor"
                    : "Guru"}
              </button>
            ))}
          </div>
        )}
      </header>

      {activeMode === "preview" && <PreviewMode user={user} />}
      {activeMode === "editor" && <EditorMode />}
      {activeMode === "teacher" && <TeacherMode />}
    </div>
  );
}
