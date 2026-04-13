import { useState, useEffect } from "react";
import {
  getQuizzes as getQuizzesApi,
  getSubmissions as getSubmissionsApi,
  getSubmissionDetail as getSubmissionDetailApi,
  updateSubmissionScores as updateSubmissionScoresApi,
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
import {
  ChevronLeft,
  GraduationCap,
  ClipboardList,
  FileText,
} from "lucide-react";
import type { Quiz, Submission, SubmissionDetail } from "./types";

export default function TeacherMode() {
  const [quizList, setQuizList] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [detail, setDetail] = useState<SubmissionDetail | null>(null);
  const [editedScores, setEditedScores] = useState<Record<number, number>>({});
  const [isSaving, setIsSaving] = useState(false);

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
    try {
      const data = await getSubmissionsApi(quizId);
      setSubmissions(data);
      setSelectedQuizId(quizId);
    } catch {
      showToast("Gagal memuat pengumpulan.", "error");
    }
  };

  const fetchDetail = async (id: number) => {
    try {
      const data = await getSubmissionDetailApi(id);
      setDetail(data as SubmissionDetail);

      // Initialize edited scores
      const initial: Record<number, number> = {};
      data.answers.forEach((a: SubmissionDetail["answers"][number]) => {
        initial[a.answerId] = a.score;
      });
      setEditedScores(initial);
    } catch {
      showToast("Gagal memuat detail.", "error");
    }
  };

  const handleSaveScores = async () => {
    if (!detail) return;
    setIsSaving(true);
    try {
      const payload = Object.entries(editedScores).map(([answerId, score]) => ({
        answerId: parseInt(answerId),
        score,
      }));
      await updateSubmissionScoresApi(detail.submissionId, payload);
      showToast("Skor berhasil diperbarui!", "success");
      fetchDetail(detail.submissionId);
    } catch {
      showToast("Gagal memperbarui skor.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Detail view
  if (detail) {
    const totalObtained = detail.answers.reduce(
      (sum, a) => sum + (editedScores[a.answerId] ?? a.score),
      0,
    );
    const totalMax = detail.answers.reduce((sum, a) => sum + a.maxScore, 0);
    const grade =
      totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : 0;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setDetail(null)}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/90 font-medium"
          >
            <ChevronLeft className="w-4 h-4" /> Kembali ke Daftar
          </button>
          <Button
            onClick={handleSaveScores}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {isSaving ? "Menyimpan..." : "Simpan Perubahan Skor"}
          </Button>
        </div>

        <Card className="border border-border/20 bg-background shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg overflow-hidden">
          <CardHeader className="border-b border-border/10 bg-primary/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="font-serif text-2xl font-bold text-foreground">
                  Jawaban: {detail.userName}
                </CardTitle>
                <CardDescription className="text-muted-foreground font-medium">
                  {detail.userEmail} •{" "}
                  {new Date(detail.submittedAt).toLocaleString("id-ID")}
                </CardDescription>
              </div>
              <div className="bg-background px-6 py-4 rounded-xl border border-primary/20 shadow-sm text-center min-w-[140px]">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">
                  Nilai Akhir
                </p>
                <p className="text-3xl font-serif font-bold text-primary">
                  {grade}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {totalObtained} / {totalMax} Poin
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 space-y-6 bg-background">
            {detail.answers.map((a, i) => (
              <div
                key={a.answerId}
                className={`p-6 rounded-xl border-2 transition-all ${
                  a.questionType === "essay"
                    ? "border-amber-100 bg-amber-50/20"
                    : a.isCorrect
                      ? "border-emerald-100 bg-emerald-50/20"
                      : "border-red-100 bg-red-50/20"
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground/80 mb-2 flex items-center gap-2">
                      <span className="bg-foreground/10 px-2 py-0.5 rounded text-[10px]">
                        SOAL {i + 1}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase ${a.questionType === "essay" ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"}`}
                      >
                        {a.questionType === "essay" ? "Essay" : "Pilihan Ganda"}
                      </span>
                    </p>
                    <p className="text-base text-foreground font-medium pr-4 leading-relaxed">
                      {a.questionText}
                    </p>
                  </div>
                  <div className="shrink-0 space-y-2 bg-background p-3 rounded-lg border border-border/10 shadow-sm min-w-[120px]">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Edit Skor
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editedScores[a.answerId] ?? 0}
                        onChange={(e) =>
                          setEditedScores((p) => ({
                            ...p,
                            [a.answerId]: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="h-8 w-16 text-center font-bold text-primary bg-background p-1"
                      />
                      <span className="text-xs font-bold text-muted-foreground">
                        / {a.maxScore}
                      </span>
                    </div>
                  </div>
                </div>

                {a.questionType === "multiple_choice" ? (
                  <div className="mt-4 p-4 bg-background/50 rounded-lg border border-border/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                          Jawaban Siswa
                        </p>
                        <p
                          className={`text-sm font-semibold ${a.isCorrect ? "text-emerald-600" : "text-red-500"}`}
                        >
                          {a.selectedOptionText || "-"}
                        </p>
                      </div>
                      {!a.isCorrect && (
                        <div>
                          <p className="text-[10px] font-bold text-primary uppercase mb-1">
                            Jawaban Benar
                          </p>
                          <p className="text-sm font-semibold text-primary">
                            {a.correctOptionText}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">
                      Jawaban Siswa
                    </p>
                    <div className="p-4 bg-background rounded-lg border border-border/20 text-sm text-foreground leading-relaxed whitespace-pre-wrap italic">
                      {a.essayAnswer || (
                        <span className="text-muted-foreground opacity-50">
                          Tidak dijawab
                        </span>
                      )}
                    </div>
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
          <p className="text-muted-foreground text-center py-8">
            Belum ada kuis.
          </p>
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
