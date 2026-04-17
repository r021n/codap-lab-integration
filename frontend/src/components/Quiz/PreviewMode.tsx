import { useState, useEffect } from "react";
import {
  getQuizzes as getQuizzesApi,
  getQuizDetail as getQuizDetailApi,
} from "../../api/quiz.api";
import { Card, CardContent } from "../ui/card";
import { showToast } from "../ui/toast";
import { ChevronLeft, ClipboardList } from "lucide-react";
import type { Quiz, Question } from "./types";
import type { User } from "../../api/auth.api";
import StudentQuizView from "./StudentQuizView";

export default function PreviewMode({ user }: { user: User }) {
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
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/90 font-medium min-h-10"
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
              <CardContent className="p-4 sm:p-6 space-y-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">
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
