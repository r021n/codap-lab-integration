import { useState, useEffect, useCallback } from "react";
import {
  addQuestion as addQuestionApi,
  createQuiz as createQuizApi,
  deleteQuestion as deleteQuestionApi,
  deleteQuiz as deleteQuizApi,
  getQuizDetail as getQuizDetailApi,
  getQuizzes as getQuizzesApi,
  reorderQuestions as reorderQuestionsApi,
  updateQuestion as updateQuestionApi,
  updateQuiz as updateQuizApi,
} from "../../api/quiz.api";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { showToast } from "../ui/toast";
import ConfirmDialog from "../ui/confirm-dialog";
import {
  Edit,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ClipboardList,
} from "lucide-react";
import type { Question, Quiz } from "./types";

export default function EditorMode() {
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
  const [qMaxScore, setQMaxScore] = useState(1);
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

  type QuestionFormPayload = {
    type: "multiple_choice" | "essay";
    questionText: string;
    maxScore: number;
    options?: { optionText: string; isCorrect: boolean }[];
  };

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
    const loadQuizzes = async () => {
      try {
        const quizzes = await getQuizzesApi();
        setQuizList(quizzes);
      } catch {
        console.error("Failed to fetch quizzes");
      }
    };

    void loadQuizzes();
  }, []);

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
    const body: QuestionFormPayload = {
      type: qType,
      questionText: qText,
      maxScore: qMaxScore,
    };
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
    const body: QuestionFormPayload = {
      type: qType,
      questionText: qText,
      maxScore: qMaxScore,
    };
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
    setQType(q.type === "essay" ? "essay" : "multiple_choice");
    setQText(q.questionText);
    setQMaxScore(q.maxScore || 1);
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
    setQMaxScore(1);
    setQType("multiple_choice");
    setQOptions([
      { optionText: "", isCorrect: true },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
    ]);
  };

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
              className="h-10 bg-background border-gray-300 focus:border-primary focus:ring-primary"
            />
            <Input
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Deskripsi (opsional)"
              className="h-10 bg-background border-gray-300 focus:border-primary focus:ring-primary"
            />
            <Button
              onClick={createQuiz}
              className="bg-primary hover:bg-primary/90 text-white rounded-lg w-full sm:w-auto h-10"
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
              <p className="text-muted-foreground text-center py-8">
                Belum ada kuis.
              </p>
            ) : (
              <div className="space-y-3">
                {quizList.map((qz) => (
                  <div
                    key={qz.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border border-border/20 hover:border-primary/30 hover:bg-background transition-all"
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
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePublish(qz)}
                        className="text-xs border-border/30 hover:bg-background flex-1 sm:flex-none min-h-9"
                      >
                        {qz.isPublished ? "Sembunyikan" : "Publikasi"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => confirmDelete("quiz", qz.id)}
                        className="bg-red-500 hover:bg-red-600 min-h-9"
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

  // Quiz Detail / Question Editor
  return (
    <div className="space-y-6">
      <button
        onClick={() => setSelectedQuiz(null)}
        className="flex items-center gap-2 text-sm text-primary hover:text-primary/90 font-medium transition-colors min-h-10"
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              {selectedQuiz.questions.length} soal
            </span>
            <Button
              onClick={() => {
                resetQuestionForm();
                setShowAddQuestion(true);
              }}
              className="bg-primary hover:bg-primary/90 text-white rounded-lg text-sm w-full sm:w-auto"
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
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {q.type === "multiple_choice" ? "PG" : "Essay"} #{idx + 1}
                    </span>
                  </div>
                  <p className="text-sm text-foreground font-medium">
                    {q.questionText}
                  </p>
                  <p className="text-[10px] text-primary font-bold uppercase mt-1">
                    Bobot: {q.maxScore} Poin
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
                <div className="flex flex-row sm:flex-col gap-1 self-end sm:self-auto">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <button
                onClick={() => setQType("multiple_choice")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-10 ${qType === "multiple_choice" ? "bg-primary text-white" : "bg-muted-foreground/10 text-muted-foreground hover:text-foreground"}`}
              >
                Pilihan Ganda
              </button>
              <button
                onClick={() => setQType("essay")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-10 ${qType === "essay" ? "bg-primary text-white" : "bg-muted-foreground/10 text-muted-foreground hover:text-foreground"}`}
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

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Skor Maksimal (Bobot)
              </label>
              <Input
                type="number"
                value={qMaxScore}
                onChange={(e) => setQMaxScore(parseInt(e.target.value) || 0)}
                placeholder="Contoh: 1, 5, 10..."
                className="h-10 bg-background border-gray-300 focus:border-primary focus:ring-primary"
              />
            </div>

            {qType === "multiple_choice" && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">
                  Pilihan Jawaban{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    (klik radio untuk jawaban benar)
                  </span>
                </p>
                {qOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-3">
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
                      className="h-10 bg-background border-gray-300 focus:border-primary focus:ring-primary"
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

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
              <Button
                onClick={editingQuestion ? updateQuestion : addQuestion}
                className="bg-primary hover:bg-primary/90 text-white rounded-lg w-full sm:w-auto"
              >
                {editingQuestion ? "Simpan Perubahan" : "Tambah Soal"}
              </Button>
              <Button
                onClick={resetQuestionForm}
                className="bg-transparent border-2 border-foreground text-foreground hover:bg-foreground/5 rounded-lg w-full sm:w-auto"
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
