import { useState, useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { showToast, ToastContainer } from "../components/ui/toast";
import ConfirmDialog from "../components/ui/confirm-dialog";
import {
  Eye, Edit, GraduationCap, Plus, Trash2, ChevronLeft, ChevronRight,
  ChevronUp, ChevronDown, CheckCircle, Circle, ClipboardList, Send, FileText,
} from "lucide-react";

type User = { name: string; email: string; role: string };
type Option = { id?: number; optionText: string; isCorrect?: boolean; orderIndex: number };
type Question = {
  id: number; quizId: number; type: string; questionText: string;
  orderIndex: number; options: Option[];
};
type Quiz = {
  id: number; title: string; description: string | null;
  isPublished: boolean; createdAt: string; updatedAt: string;
  questions?: Question[];
};
type Submission = {
  submissionId: number; userId: number; userName: string;
  userEmail: string; submittedAt: string;
};
type SubmissionDetail = Submission & {
  quizId: number;
  answers: {
    answerId: number; questionId: number; questionText: string;
    questionType: string; selectedOptionId: number | null;
    essayAnswer: string | null; selectedOptionText: string | null;
    correctOptionText: string | null; isCorrect: boolean | null;
    allOptions: Option[];
  }[];
};

const API = "http://localhost:5000/api/quizzes";
const headers = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

// ─── STUDENT QUIZ VIEW ──────────────────────────────────────────
function StudentQuizView({ quiz }: { quiz: Quiz & { questions: Question[] } }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { selectedOptionId?: number; essayAnswer?: string }>>({});
  const [submitted, setSubmitted] = useState(false);

  const q = quiz.questions[current];
  const total = quiz.questions.length;
  const progress = total > 0 ? Math.round(((Object.keys(answers).length) / total) * 100) : 0;

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
      const res = await fetch(`${API}/${quiz.id}/submit`, {
        method: "POST", headers: headers(), body: JSON.stringify({ answers: payload }),
      });
      if (res.ok) { setSubmitted(true); showToast("Kuis berhasil dikirim!", "success"); }
      else showToast("Gagal mengirim kuis.", "error");
    } catch { showToast("Terjadi kesalahan jaringan.", "error"); }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <div className="w-20 h-20 rounded-full bg-[#10B981]/10 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-[#10B981]" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#0F172A]">Kuis Berhasil Dikirim!</h2>
        <p className="text-[#94A3B8] text-center max-w-md">Jawaban kamu sudah tercatat. Terima kasih telah mengerjakan kuis ini.</p>
      </div>
    );
  }

  if (total === 0) {
    return <p className="text-[#94A3B8] text-center py-12">Belum ada soal dalam kuis ini.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-[#94A3B8]">
          <span>Soal {current + 1} dari {total}</span>
          <span>{progress}% selesai</span>
        </div>
        <div className="w-full h-3 bg-[#94A3B8]/10 rounded-full overflow-hidden">
          <div className="h-full bg-linear-to-r from-[#F97316] to-[#F59E0B] rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question Card */}
      <Card className="border border-[#94A3B8]/20 bg-[#FFFFFF] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg">
        <CardHeader className="border-b border-[#94A3B8]/10 bg-[#FDFBF0]">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#F97316] text-white text-sm font-bold">{current + 1}</span>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#F97316]/10 text-[#F97316]">
              {q.type === "multiple_choice" ? "Pilihan Ganda" : "Essay"}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <p className="text-[#0F172A] text-lg leading-relaxed font-medium">{q.questionText}</p>

          {q.type === "multiple_choice" ? (
            <div className="space-y-3">
              {q.options.map((opt) => {
                const selected = answers[q.id]?.selectedOptionId === opt.id;
                return (
                  <button key={opt.id} onClick={() => handleSelect(opt.id!)}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-all duration-200 ${selected
                      ? "border-[#F97316] bg-[#F97316]/5 shadow-sm" : "border-[#94A3B8]/20 hover:border-[#F97316]/40 hover:bg-[#FDFBF0]"}`}>
                    {selected ? <CheckCircle className="w-5 h-5 text-[#F97316] shrink-0" /> : <Circle className="w-5 h-5 text-[#94A3B8] shrink-0" />}
                    <span className={`text-sm ${selected ? "text-[#0F172A] font-medium" : "text-[#0F172A]"}`}>{opt.optionText}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <textarea value={answers[q.id]?.essayAnswer || ""} onChange={(e) => handleEssay(e.target.value)}
              placeholder="Tulis jawaban kamu di sini..." rows={6}
              className="w-full p-4 rounded-lg border-2 border-[#94A3B8]/20 bg-[#FFFFFF] text-[#0F172A] text-sm resize-none focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 transition-all placeholder:text-[#94A3B8]" />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button onClick={() => setCurrent((c) => c - 1)} disabled={current === 0}
          className="bg-transparent border-2 border-[#0F172A] text-[#0F172A] hover:bg-[#0F172A]/5 disabled:opacity-30 rounded-lg">
          <ChevronLeft className="w-4 h-4 mr-2" /> Sebelumnya
        </Button>
        {current === total - 1 ? (
          <Button onClick={handleSubmit}
            className="bg-[#10B981] hover:bg-[#059669] text-white rounded-lg px-6">
            <Send className="w-4 h-4 mr-2" /> Kirim Jawaban
          </Button>
        ) : (
          <Button onClick={() => setCurrent((c) => c + 1)}
            className="bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg">
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
  const [selectedQuiz, setSelectedQuiz] = useState<(Quiz & { questions: Question[] }) | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [qType, setQType] = useState<"multiple_choice" | "essay">("multiple_choice");
  const [qText, setQText] = useState("");
  const [qOptions, setQOptions] = useState<{ optionText: string; isCorrect: boolean }[]>([
    { optionText: "", isCorrect: true }, { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false }, { optionText: "", isCorrect: false },
  ]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ type: "quiz" | "question"; id: number } | null>(null);

  const fetchQuizzes = useCallback(async () => {
    try {
      const res = await fetch(API, { headers: headers() });
      if (res.ok) setQuizList(await res.json());
    } catch { console.error("Failed to fetch quizzes"); }
  }, []);

  const fetchQuizDetail = useCallback(async (id: number) => {
    try {
      const res = await fetch(`${API}/${id}`, { headers: headers() });
      if (res.ok) setSelectedQuiz(await res.json());
    } catch { console.error("Failed to fetch quiz detail"); }
  }, []);

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  const createQuiz = async () => {
    if (!newTitle.trim()) return showToast("Judul kuis harus diisi.", "error");
    try {
      const res = await fetch(API, {
        method: "POST", headers: headers(),
        body: JSON.stringify({ title: newTitle, description: newDesc }),
      });
      if (res.ok) { showToast("Kuis berhasil dibuat!", "success"); setNewTitle(""); setNewDesc(""); fetchQuizzes(); }
      else showToast("Gagal membuat kuis.", "error");
    } catch { showToast("Kesalahan jaringan.", "error"); }
  };

  const togglePublish = async (quiz: Quiz) => {
    try {
      await fetch(`${API}/${quiz.id}`, {
        method: "PUT", headers: headers(),
        body: JSON.stringify({ isPublished: !quiz.isPublished }),
      });
      fetchQuizzes();
      if (selectedQuiz?.id === quiz.id) fetchQuizDetail(quiz.id);
    } catch { showToast("Gagal mengubah status.", "error"); }
  };

  const addQuestion = async () => {
    if (!selectedQuiz || !qText.trim()) return showToast("Teks soal harus diisi.", "error");
    const body: any = { type: qType, questionText: qText };
    if (qType === "multiple_choice") body.options = qOptions.filter((o) => o.optionText.trim());
    try {
      const res = await fetch(`${API}/${selectedQuiz.id}/questions`, {
        method: "POST", headers: headers(), body: JSON.stringify(body),
      });
      if (res.ok) {
        showToast("Soal berhasil ditambahkan!", "success");
        resetQuestionForm(); fetchQuizDetail(selectedQuiz.id);
      } else showToast("Gagal menambahkan soal.", "error");
    } catch { showToast("Kesalahan jaringan.", "error"); }
  };

  const updateQuestion = async () => {
    if (!editingQuestion || !qText.trim()) return;
    const body: any = { type: qType, questionText: qText };
    if (qType === "multiple_choice") body.options = qOptions.filter((o) => o.optionText.trim());
    try {
      const res = await fetch(`${API}/questions/${editingQuestion.id}`, {
        method: "PUT", headers: headers(), body: JSON.stringify(body),
      });
      if (res.ok) {
        showToast("Soal berhasil diperbarui!", "success");
        resetQuestionForm(); if (selectedQuiz) fetchQuizDetail(selectedQuiz.id);
      } else showToast("Gagal memperbarui soal.", "error");
    } catch { showToast("Kesalahan jaringan.", "error"); }
  };

  const confirmDelete = (type: "quiz" | "question", id: number) => {
    setPendingDelete({ type, id }); setConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!pendingDelete) return;
    setConfirmOpen(false);
    const url = pendingDelete.type === "quiz" ? `${API}/${pendingDelete.id}` : `${API}/questions/${pendingDelete.id}`;
    try {
      const res = await fetch(url, { method: "DELETE", headers: headers() });
      if (res.ok) {
        showToast("Berhasil dihapus!", "success");
        if (pendingDelete.type === "quiz") { setSelectedQuiz(null); fetchQuizzes(); }
        else if (selectedQuiz) fetchQuizDetail(selectedQuiz.id);
      } else showToast("Gagal menghapus.", "error");
    } catch { showToast("Kesalahan jaringan.", "error"); }
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
      await fetch(`${API}/${selectedQuiz.id}/reorder`, {
        method: "PUT", headers: headers(), body: JSON.stringify({ orderedIds }),
      });
      fetchQuizDetail(selectedQuiz.id);
    } catch { showToast("Gagal mengubah urutan.", "error"); }
  };

  const startEdit = (q: Question) => {
    setEditingQuestion(q); setQType(q.type as any); setQText(q.questionText);
    if (q.type === "multiple_choice") {
      const opts = q.options.length > 0 ? q.options.map((o) => ({ optionText: o.optionText, isCorrect: o.isCorrect || false }))
        : [{ optionText: "", isCorrect: true }, { optionText: "", isCorrect: false }];
      setQOptions(opts);
    } else setQOptions([]);
    setShowAddQuestion(true);
  };

  const resetQuestionForm = () => {
    setShowAddQuestion(false); setEditingQuestion(null); setQText(""); setQType("multiple_choice");
    setQOptions([{ optionText: "", isCorrect: true }, { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false }, { optionText: "", isCorrect: false }]);
  };

  // ── Quiz List View ──
  if (!selectedQuiz) {
    return (
      <div className="space-y-6">
        <Card className="border border-[#F97316]/20 bg-[#F97316]/5 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg">
          <CardHeader><CardTitle className="font-serif text-xl font-bold text-[#0F172A] flex items-center gap-2"><Plus className="h-5 w-5 text-[#F97316]" /> Buat Kuis Baru</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Judul kuis"
              className="bg-white border-gray-300 focus:border-[#F97316] focus:ring-[#F97316]" />
            <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Deskripsi (opsional)"
              className="bg-white border-gray-300 focus:border-[#F97316] focus:ring-[#F97316]" />
            <Button onClick={createQuiz} className="bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg">Buat Kuis</Button>
          </CardContent>
        </Card>

        <Card className="border border-[#94A3B8]/20 bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg">
          <CardHeader className="border-b border-[#94A3B8]/10"><CardTitle className="font-serif text-xl font-bold text-[#0F172A]">Daftar Kuis</CardTitle></CardHeader>
          <CardContent className="pt-6">
            {quizList.length === 0 ? <p className="text-[#94A3B8] text-center py-8">Belum ada kuis.</p> : (
              <div className="space-y-3">
                {quizList.map((qz) => (
                  <div key={qz.id} className="flex items-center justify-between p-4 rounded-lg border border-[#94A3B8]/20 hover:border-[#F97316]/30 hover:bg-[#FDFBF0] transition-all">
                    <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => fetchQuizDetail(qz.id)}>
                      <ClipboardList className="w-5 h-5 text-[#F97316] shrink-0" />
                      <div><p className="font-semibold text-[#0F172A]">{qz.title}</p>
                        <p className="text-xs text-[#94A3B8]">{qz.isPublished ? "✅ Dipublikasi" : "📝 Draft"}</p></div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => togglePublish(qz)}
                        className="text-xs border-[#94A3B8]/30 hover:bg-[#FDFBF0]">{qz.isPublished ? "Sembunyikan" : "Publikasi"}</Button>
                      <Button size="sm" variant="destructive" onClick={() => confirmDelete("quiz", qz.id)}
                        className="bg-red-500 hover:bg-red-600"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Quiz Detail / Question Editor ──
  return (
    <div className="space-y-6">
      <button onClick={() => setSelectedQuiz(null)} className="flex items-center gap-2 text-sm text-[#F97316] hover:text-[#EA580C] font-medium transition-colors">
        <ChevronLeft className="w-4 h-4" /> Kembali ke Daftar Kuis
      </button>

      <Card className="border border-[#94A3B8]/20 bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg">
        <CardHeader className="border-b border-[#94A3B8]/10 bg-[#FDFBF0]">
          <CardTitle className="font-serif text-xl font-bold text-[#0F172A]">{selectedQuiz.title}</CardTitle>
          {selectedQuiz.description && <CardDescription className="text-[#94A3B8]">{selectedQuiz.description}</CardDescription>}
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#94A3B8]">{selectedQuiz.questions.length} soal</span>
            <Button onClick={() => { resetQuestionForm(); setShowAddQuestion(true); }}
              className="bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg text-sm"><Plus className="w-4 h-4 mr-2" /> Tambah Soal</Button>
          </div>

          {/* Question List */}
          {selectedQuiz.questions.map((q, idx) => (
            <div key={q.id} className="p-4 rounded-lg border border-[#94A3B8]/20 bg-[#FDFBF0]/50 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#F97316]/10 text-[#F97316]">
                      {q.type === "multiple_choice" ? "PG" : "Essay"} #{idx + 1}
                    </span>
                  </div>
                  <p className="text-sm text-[#0F172A] font-medium">{q.questionText}</p>
                  {q.type === "multiple_choice" && (
                    <div className="mt-2 space-y-1">
                      {q.options.map((o) => (
                        <p key={o.id} className={`text-xs pl-4 ${o.isCorrect ? "text-[#10B981] font-semibold" : "text-[#94A3B8]"}`}>
                          {o.isCorrect ? "✓" : "○"} {o.optionText}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveQuestion(idx, -1)} disabled={idx === 0} className="p-1 rounded hover:bg-[#94A3B8]/10 disabled:opacity-20"><ChevronUp className="w-4 h-4 text-[#94A3B8]" /></button>
                  <button onClick={() => moveQuestion(idx, 1)} disabled={idx === selectedQuiz.questions.length - 1} className="p-1 rounded hover:bg-[#94A3B8]/10 disabled:opacity-20"><ChevronDown className="w-4 h-4 text-[#94A3B8]" /></button>
                  <button onClick={() => startEdit(q)} className="p-1 rounded hover:bg-[#F97316]/10"><Edit className="w-4 h-4 text-[#F97316]" /></button>
                  <button onClick={() => confirmDelete("question", q.id)} className="p-1 rounded hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Add/Edit Question Modal-like card */}
      {showAddQuestion && (
        <Card className="border-2 border-[#F97316]/30 bg-white shadow-lg rounded-lg animate-scale-in">
          <CardHeader className="bg-[#F97316]/5 border-b border-[#F97316]/10">
            <CardTitle className="font-serif text-lg font-bold text-[#0F172A]">{editingQuestion ? "Edit Soal" : "Tambah Soal Baru"}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-3">
              <button onClick={() => setQType("multiple_choice")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${qType === "multiple_choice" ? "bg-[#F97316] text-white" : "bg-[#94A3B8]/10 text-[#94A3B8] hover:text-[#0F172A]"}`}>Pilihan Ganda</button>
              <button onClick={() => setQType("essay")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${qType === "essay" ? "bg-[#F97316] text-white" : "bg-[#94A3B8]/10 text-[#94A3B8] hover:text-[#0F172A]"}`}>Essay</button>
            </div>
            <textarea value={qText} onChange={(e) => setQText(e.target.value)} placeholder="Teks soal..."
              rows={3} className="w-full p-3 rounded-lg border-2 border-[#94A3B8]/20 bg-[#FFFFFF] text-sm text-[#0F172A] resize-none focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 placeholder:text-[#94A3B8]" />

            {qType === "multiple_choice" && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#0F172A]">Pilihan Jawaban <span className="text-xs text-[#94A3B8] font-normal">(klik radio untuk jawaban benar)</span></p>
                {qOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <button onClick={() => setQOptions((p) => p.map((o, j) => ({ ...o, isCorrect: j === i })))}
                      className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${opt.isCorrect ? "border-[#10B981] bg-[#10B981]" : "border-[#94A3B8]/40"}`}>
                      {opt.isCorrect && <div className="w-2 h-2 rounded-full bg-white" />}
                    </button>
                    <Input value={opt.optionText} onChange={(e) => setQOptions((p) => p.map((o, j) => j === i ? { ...o, optionText: e.target.value } : o))}
                      placeholder={`Pilihan ${String.fromCharCode(65 + i)}`} className="bg-white border-gray-300 focus:border-[#F97316] focus:ring-[#F97316]" />
                    {qOptions.length > 2 && (
                      <button onClick={() => setQOptions((p) => p.filter((_, j) => j !== i))} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4 text-red-400" /></button>
                    )}
                  </div>
                ))}
                {qOptions.length < 6 && (
                  <button onClick={() => setQOptions((p) => [...p, { optionText: "", isCorrect: false }])}
                    className="text-sm text-[#F97316] hover:text-[#EA580C] font-medium flex items-center gap-1"><Plus className="w-4 h-4" /> Tambah Pilihan</button>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button onClick={editingQuestion ? updateQuestion : addQuestion} className="bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg">
                {editingQuestion ? "Simpan Perubahan" : "Tambah Soal"}
              </Button>
              <Button onClick={resetQuestionForm} className="bg-transparent border-2 border-[#0F172A] text-[#0F172A] hover:bg-[#0F172A]/5 rounded-lg">Batal</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog open={confirmOpen} onConfirm={handleDeleteConfirmed} onCancel={() => { setConfirmOpen(false); setPendingDelete(null); }}
        title="Hapus" description="Apakah Anda yakin ingin menghapus ini? Tindakan ini tidak dapat dibatalkan." confirmText="Ya, Hapus" cancelText="Batal" variant="danger" />
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
        const res = await fetch(API, { headers: headers() });
        if (res.ok) setQuizList(await res.json());
      } catch { /* ignore */ }
    })();
  }, []);

  const fetchSubmissions = async (quizId: number) => {
    setSelectedQuizId(quizId); setDetail(null);
    try {
      const res = await fetch(`${API}/${quizId}/submissions`, { headers: headers() });
      if (res.ok) setSubmissions(await res.json());
    } catch { showToast("Gagal memuat data.", "error"); }
  };

  const fetchDetail = async (submissionId: number) => {
    try {
      const res = await fetch(`${API}/submissions/${submissionId}`, { headers: headers() });
      if (res.ok) setDetail(await res.json());
    } catch { showToast("Gagal memuat detail.", "error"); }
  };

  // Detail view
  if (detail) {
    return (
      <div className="space-y-6">
        <button onClick={() => setDetail(null)} className="flex items-center gap-2 text-sm text-[#F97316] hover:text-[#EA580C] font-medium"><ChevronLeft className="w-4 h-4" /> Kembali</button>
        <Card className="border border-[#94A3B8]/20 bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg">
          <CardHeader className="border-b border-[#94A3B8]/10 bg-[#FDFBF0]">
            <CardTitle className="font-serif text-xl font-bold text-[#0F172A]">Jawaban: {detail.userName}</CardTitle>
            <CardDescription className="text-[#94A3B8]">{detail.userEmail} • {new Date(detail.submittedAt).toLocaleString("id-ID")}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {detail.answers.map((a, i) => (
              <div key={a.answerId} className={`p-4 rounded-lg border ${a.questionType === "multiple_choice" ? (a.isCorrect ? "border-[#10B981]/30 bg-[#10B981]/5" : "border-red-200 bg-red-50/50") : "border-[#94A3B8]/20 bg-[#FDFBF0]/50"}`}>
                <p className="text-sm font-medium text-[#0F172A] mb-2">{i + 1}. {a.questionText}</p>
                {a.questionType === "multiple_choice" ? (
                  <div className="space-y-1 text-xs">
                    <p>Jawaban siswa: <span className={`font-semibold ${a.isCorrect ? "text-[#10B981]" : "text-red-500"}`}>{a.selectedOptionText || "-"}</span></p>
                    {!a.isCorrect && <p>Jawaban benar: <span className="font-semibold text-[#10B981]">{a.correctOptionText}</span></p>}
                  </div>
                ) : (
                  <div className="mt-1 p-3 bg-white rounded border border-[#94A3B8]/10 text-sm text-[#0F172A]">{a.essayAnswer || <span className="text-[#94A3B8] italic">Tidak dijawab</span>}</div>
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
        <button onClick={() => { setSelectedQuizId(null); setSubmissions([]); }} className="flex items-center gap-2 text-sm text-[#F97316] hover:text-[#EA580C] font-medium"><ChevronLeft className="w-4 h-4" /> Kembali</button>
        <Card className="border border-[#94A3B8]/20 bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg">
          <CardHeader className="border-b border-[#94A3B8]/10 bg-[#FDFBF0]">
            <CardTitle className="font-serif text-xl font-bold text-[#0F172A]">Hasil Kuis: {qz?.title}</CardTitle>
            <CardDescription className="text-[#94A3B8]">{submissions.length} pengumpulan</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {submissions.length === 0 ? <p className="text-[#94A3B8] text-center py-8">Belum ada siswa yang mengumpulkan.</p> : (
              <div className="rounded-lg border border-[#94A3B8]/20 overflow-hidden">
                <table className="w-full text-sm"><thead className="bg-[#FDFBF0] border-b border-[#94A3B8]/20"><tr>
                  <th className="px-5 py-3 text-left font-semibold text-[#0F172A]">Nama Siswa</th>
                  <th className="px-5 py-3 text-left font-semibold text-[#0F172A]">Email</th>
                  <th className="px-5 py-3 text-left font-semibold text-[#0F172A]">Waktu</th>
                  <th className="px-5 py-3 text-right font-semibold text-[#0F172A]">Aksi</th>
                </tr></thead><tbody className="divide-y divide-[#94A3B8]/10">
                  {submissions.map((s) => (
                    <tr key={s.submissionId} className="hover:bg-[#FDFBF0]/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-[#0F172A]">{s.userName}</td>
                      <td className="px-5 py-3 text-[#94A3B8]">{s.userEmail}</td>
                      <td className="px-5 py-3 text-[#94A3B8]">{new Date(s.submittedAt).toLocaleString("id-ID")}</td>
                      <td className="px-5 py-3 text-right">
                        <Button size="sm" variant="outline" onClick={() => fetchDetail(s.submissionId)}
                          className="text-xs border-[#F97316]/30 text-[#F97316] hover:bg-[#F97316]/5"><FileText className="w-3.5 h-3.5 mr-1" /> Lihat</Button>
                      </td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz picker
  return (
    <Card className="border border-[#94A3B8]/20 bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg">
      <CardHeader className="border-b border-[#94A3B8]/10 bg-[#FDFBF0]">
        <CardTitle className="font-serif text-xl font-bold text-[#0F172A] flex items-center gap-2"><GraduationCap className="w-5 h-5 text-[#F97316]" /> Pilih Kuis untuk Melihat Hasil</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {quizList.length === 0 ? <p className="text-[#94A3B8] text-center py-8">Belum ada kuis.</p> : (
          <div className="space-y-3">
            {quizList.map((qz) => (
              <button key={qz.id} onClick={() => fetchSubmissions(qz.id)}
                className="w-full flex items-center gap-3 p-4 rounded-lg border border-[#94A3B8]/20 hover:border-[#F97316]/30 hover:bg-[#FDFBF0] transition-all text-left">
                <ClipboardList className="w-5 h-5 text-[#F97316] shrink-0" />
                <div><p className="font-semibold text-[#0F172A]">{qz.title}</p>
                  <p className="text-xs text-[#94A3B8]">{qz.isPublished ? "✅ Dipublikasi" : "📝 Draft"}</p></div>
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
  const [selectedQuiz, setSelectedQuiz] = useState<(Quiz & { questions: Question[] }) | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(API, { headers: headers() });
        if (res.ok) {
          const all: Quiz[] = await res.json();
          setQuizList(user.role === "admin" ? all : all.filter((q) => q.isPublished));
        }
      } catch { /* ignore */ }
    })();
  }, [user.role]);

  const selectQuiz = async (id: number) => {
    try {
      const res = await fetch(`${API}/${id}`, { headers: headers() });
      if (res.ok) setSelectedQuiz(await res.json());
    } catch { showToast("Gagal memuat kuis.", "error"); }
  };

  if (selectedQuiz) {
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedQuiz(null)} className="flex items-center gap-2 text-sm text-[#F97316] hover:text-[#EA580C] font-medium"><ChevronLeft className="w-4 h-4" /> Kembali ke Daftar Kuis</button>
        <StudentQuizView quiz={selectedQuiz as Quiz & { questions: Question[] }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {quizList.length === 0 ? <p className="text-[#94A3B8] text-center py-12">Belum ada kuis yang tersedia.</p> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizList.map((qz) => (
            <Card key={qz.id} onClick={() => selectQuiz(qz.id)}
              className="border border-[#94A3B8]/20 bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg cursor-pointer hover:border-[#F97316]/30 hover:shadow-md transition-all group">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#F97316] to-[#F59E0B] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#0F172A]">{qz.title}</h3>
                {qz.description && <p className="text-sm text-[#94A3B8] line-clamp-2">{qz.description}</p>}
                <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                  <span>{new Date(qz.createdAt).toLocaleDateString("id-ID")}</span>
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
    <div className="mx-auto max-w-6xl space-y-8 pb-12 font-sans text-[#0F172A]">
      <ToastContainer />

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#0F172A]">Kuis</h1>
          <p className="text-[#94A3B8] mt-2 text-lg">
            {user.role === "admin" ? "Kelola dan pantau kuis untuk siswa." : "Kerjakan kuis yang tersedia."}
          </p>
        </div>

        {user.role === "admin" && (
          <div className="flex bg-[#FDFBF0] p-1 rounded-lg border border-[#94A3B8]/20 shrink-0">
            {(["preview", "editor", "teacher"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === m ? "bg-[#FFFFFF] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] text-[#F97316]" : "text-[#94A3B8] hover:text-[#0F172A]"}`}>
                {m === "preview" && <Eye className="w-4 h-4" />}
                {m === "editor" && <Edit className="w-4 h-4" />}
                {m === "teacher" && <GraduationCap className="w-4 h-4" />}
                {m === "preview" ? "Preview" : m === "editor" ? "Editor" : "Guru"}
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
