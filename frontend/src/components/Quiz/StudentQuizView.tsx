import { useState } from "react";
import {
  submitQuiz as submitQuizApi,
  getSubmissionDetail as getSubmissionDetailApi,
} from "../../api/quiz.api";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { showToast } from "../ui/toast";
import {
  CheckCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
  Send,
} from "lucide-react";
import type { Quiz, Question, SubmissionDetail } from "./types";

export default function StudentQuizView({
  quiz,
}: {
  quiz: Quiz & { questions: Question[] };
}) {
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
          <p className="text-muted-foreground animate-pulse">
            {" "}
            Memproses hasil...
          </p>
        </div>
      );
    }

    if (result) {
      const totalObtained = result.answers.reduce((sum, a) => sum + a.score, 0);
      const totalMax = result.answers.reduce((sum, a) => sum + a.maxScore, 0);
      const score =
        totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
      const hasEssay = result.answers.some((a) => a.questionType === "essay");

      return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Dashboard Ringkasan */}
          <Card className="overflow-hidden border-none bg-linear-to-br from-primary/10 via-background to-secondary/10 shadow-xl">
            <CardContent className="p-4 sm:p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                    <CheckCircle className="w-3.5 h-3.5" /> Kuis Selesai
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                    Hasil Pekerjaan Kamu
                  </h2>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Terima kasih telah mengerjakan kuis{" "}
                    <strong>{quiz.title}</strong>. Berikut adalah rincian
                    jawaban kamu.
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
                    <span className="text-3xl font-bold text-foreground">
                      {score}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                      Skor
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border/10 flex flex-col sm:flex-row items-center gap-4 text-sm">
                <div className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-lg border border-border/10">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-foreground font-medium">
                    {totalObtained} / {totalMax} Poin
                  </span>
                </div>

                {hasEssay ? (
                  <div className="flex-1 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-md border border-amber-100 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>
                      <strong>Nilai Sementara:</strong> Skor akan diperbarui
                      setelah guru menilai soal essay.
                    </span>
                  </div>
                ) : (
                  <div className="flex-1 text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-md border border-emerald-100 flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>
                      <strong>Nilai Final:</strong> Skor ini sudah tetap dan
                      tidak akan berubah.
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Rincian Jawaban */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-foreground px-1">
              Rincian Pertanyaan
            </h3>
            <div className="grid gap-4">
              {result.answers.map((a, i) => (
                <Card
                  key={a.answerId}
                  className="border border-border/10 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div
                    className={`h-1 w-full ${a.questionType === "multiple_choice" ? (a.score === a.maxScore ? "bg-primary" : "bg-red-400") : "bg-amber-400"}`}
                  />
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-wider">
                            Soal {i + 1}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${a.questionType === "multiple_choice" ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-600"}`}
                          >
                            {a.questionType === "multiple_choice"
                              ? "Pilihan Ganda"
                              : "Essay"}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/5 text-primary uppercase tracking-wider border border-primary/10">
                            {a.score} / {a.maxScore} Poin
                          </span>
                        </div>
                        <p className="text-foreground font-medium leading-relaxed">
                          {a.questionText}
                        </p>
                      </div>

                      {a.questionType === "multiple_choice" && (
                        <div
                          className={`p-2 rounded-full ${a.score === a.maxScore ? "bg-primary/10 text-primary" : "bg-red-50 text-red-500"}`}
                        >
                          {a.score === a.maxScore ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <div className="w-5 h-5 flex items-center justify-center font-bold">
                              ✕
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                          Jawaban Kamu
                        </p>
                        {a.questionType === "multiple_choice" ? (
                          <p
                            className={`text-sm font-semibold ${a.score === a.maxScore ? "text-primary" : "text-red-500"}`}
                          >
                            {a.selectedOptionText || "-"}
                          </p>
                        ) : (
                          <p className="text-sm text-foreground bg-muted/30 p-2 rounded italic">
                            {a.essayAnswer || (
                              <span className="text-muted-foreground opacity-50">
                                Tidak dijawab
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      {a.questionType === "multiple_choice" &&
                        a.score !== a.maxScore && (
                          <div className="space-y-1">
                            <p className="text-[10px] text-primary uppercase font-bold tracking-tighter">
                              Jawaban Benar
                            </p>
                            <p className="text-sm font-semibold text-primary">
                              {a.correctOptionText}
                            </p>
                          </div>
                        )}

                      {a.questionType === "essay" && a.score === 0 && (
                        <div className="space-y-1">
                          <p className="text-[10px] text-amber-600 uppercase font-bold tracking-tighter">
                            Status Penilaian
                          </p>
                          <p className="text-sm font-semibold text-amber-600 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />{" "}
                            Menunggu dinilai oleh guru
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
              className="bg-primary hover:bg-primary/90 text-white rounded-lg px-6 sm:px-8 py-3 sm:py-6 h-auto w-full sm:w-auto"
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
          <p className="text-foreground text-base sm:text-lg leading-relaxed font-medium">
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
                    className={`w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border-2 text-left transition-all duration-200 ${
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
                      className={`text-sm wrap-break-word ${selected ? "text-foreground font-medium" : "text-foreground"}`}
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
              rows={5}
              className="w-full p-4 rounded-lg border-2 border-border/20 bg-background text-foreground text-sm resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <Button
          onClick={() => setCurrent((c) => c - 1)}
          disabled={current === 0}
          className="bg-transparent border-2 border-foreground text-foreground hover:bg-foreground/5 disabled:opacity-30 rounded-lg w-full sm:w-auto"
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> Sebelumnya
        </Button>
        {current === total - 1 ? (
          <Button
            onClick={handleSubmit}
            className="bg-primary hover:bg-primary/90 text-white rounded-lg px-6 w-full sm:w-auto"
          >
            <Send className="w-4 h-4 mr-2" /> Kirim Jawaban
          </Button>
        ) : (
          <Button
            onClick={() => setCurrent((c) => c + 1)}
            className="bg-primary hover:bg-primary/90 text-white rounded-lg w-full sm:w-auto"
          >
            Selanjutnya <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
