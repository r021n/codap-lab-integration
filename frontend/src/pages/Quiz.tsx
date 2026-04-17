import { useState } from "react";
import { ToastContainer } from "../components/ui/toast";
import { Eye, Edit, GraduationCap } from "lucide-react";
import type { User } from "../api/auth.api";
import PreviewMode from "../components/Quiz/PreviewMode";
import EditorMode from "../components/Quiz/EditorMode";
import TeacherMode from "../components/Quiz/TeacherMode";

export default function QuizPage({ user }: { user: User }) {
  const [mode, setMode] = useState<"preview" | "editor" | "teacher">("preview");
  const activeMode = user.role === "admin" ? mode : "preview";

  return (
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8 pb-10 sm:pb-12 font-sans text-foreground">
      <ToastContainer />

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            Kuis
          </h1>
          <p className="text-muted-foreground mt-1.5 sm:mt-2 text-sm sm:text-lg">
            {user.role === "admin"
              ? "Kelola dan pantau kuis untuk siswa."
              : "Kerjakan kuis yang tersedia."}
          </p>
        </div>

        {user.role === "admin" && (
          <div className="grid grid-cols-3 sm:flex bg-background p-1 rounded-lg border border-border/20 w-full sm:w-auto">
            {(["preview", "editor", "teacher"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors min-h-10 ${mode === m ? "bg-background shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] text-primary" : "text-muted-foreground hover:text-foreground"}`}
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
