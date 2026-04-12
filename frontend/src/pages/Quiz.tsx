import { useState } from "react";
import { ToastContainer } from "../components/ui/toast";
import { Eye, Edit, GraduationCap } from "lucide-react";
import type { User } from "../components/Quiz/types";
import PreviewMode from "../components/Quiz/PreviewMode";
import EditorMode from "../components/Quiz/EditorMode";
import TeacherMode from "../components/Quiz/TeacherMode";

export default function QuizPage({ user }: { user: User }) {
  const [mode, setMode] = useState<"preview" | "editor" | "teacher">("preview");
  const activeMode = user.role === "admin" ? mode : "preview";

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12 font-sans text-foreground">
      <ToastContainer />

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Kuis
          </h1>
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
