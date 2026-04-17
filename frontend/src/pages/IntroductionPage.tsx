import { useState, useEffect } from "react";
import { getContent, updateContent } from "../api/content.api";
import { Edit2, Eye, Save, AlertCircle } from "lucide-react";

// Note: Ensure react-quill-new is installed: npm install react-quill-new
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface IntroductionPageProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export default function IntroductionPage({ user }: IntroductionPageProps) {
  const [content, setContent] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user.role === "admin";

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await getContent("pendahuluan");
        if (data.content) {
          setContent(data.content);
        } else {
          // Placeholder content
          setContent(`
            <h1>Capaian Pembelajaran</h1>
            <p>Mahasiswa diharapkan mampu memahami konsep dasar analisis data udara dan menerapkan metode statistik untuk menginterpretasi kualitas udara di Jakarta.</p>
            <br/>
            <h1>Tujuan Pembelajaran</h1>
            <ul>
              <li>Menganalisis tren polusi udara dari tahun 2020 hingga 2023.</li>
              <li>Mengevaluasi faktor-faktor yang mempengaruhi fluktuasi indeks kualitas udara.</li>
              <li>Membangun visualisasi data yang informatif menggunakan platform AirDataLabs.</li>
            </ul>
          `);
        }
      } catch (err) {
        console.error(err);
        setError("Gagal memuat konten pendahuluan.");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateContent("pendahuluan", content);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan konten.");
    } finally {
      setSaving(false);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ],
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8 px-3 sm:px-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 sm:mb-8 border-b border-border/50 pb-4 gap-4">
        <div className="w-full">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
            Pendahuluan
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Capaian dan Tujuan Pembelajaran
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center gap-2 px-3 py-2 md:px-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors w-full md:w-auto"
              >
                <Edit2 className="h-4 w-4" />
                Edit Konten
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center justify-center gap-2 px-3 py-2 md:px-4 bg-background border border-border rounded-lg hover:bg-muted transition-colors w-full md:w-auto"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-3 py-2 md:px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 w-full md:w-auto"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-border/50 overflow-hidden">
        {isEditing ? (
          <div className="p-3 sm:p-4 bg-white editor-container">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              className="min-h-62.5 sm:min-h-75 md:min-h-100"
            />
          </div>
        ) : (
          <div className="p-4 sm:p-6 md:p-8 prose prose-slate max-w-none wrap-break-word">
            <div
              className="rich-text-content overflow-hidden"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        )}
      </div>

      {!isAdmin && !content && (
        <div className="text-center py-12 text-muted-foreground italic">
          Belum ada konten pendahuluan yang ditambahkan oleh admin.
        </div>
      )}

      <style>{`
        .rich-text-content { overflow-wrap: break-word; word-break: break-word; }

        .rich-text-content h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          color: var(--primary);
        }

        .rich-text-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
        }

        .rich-text-content p {
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .rich-text-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .rich-text-content ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .editor-container .ql-container {
          min-height: 250px;
          font-size: 1rem;
        }

        .editor-container .ql-editor {
          min-height: 250px;
          padding: 1rem;
        }

        @media (min-width: 640px) {
          .editor-container .ql-container,
          .editor-container .ql-editor {
            min-height: 350px;
          }

          .editor-container .ql-editor {
            padding: 1.25rem;
          }
        }

        @media (max-width: 639px) {
          .rich-text-content h1 {
            font-size: 1.5rem;
            margin-top: 1rem;
            margin-bottom: 0.75rem;
          }

          .rich-text-content h2 {
            font-size: 1.25rem;
            margin-top: 0.75rem;
            margin-bottom: 0.5rem;
          }

          .rich-text-content p {
            margin-bottom: 0.75rem;
          }

          .rich-text-content ul,
          .rich-text-content ol {
            padding-left: 1rem;
            margin-bottom: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
