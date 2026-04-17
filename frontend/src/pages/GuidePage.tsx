import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { getContent, updateContent } from "../api/content.api";
import { Edit2, Eye, Save, AlertCircle, HelpCircle } from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface GuidePageProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export default function GuidePage({ user }: GuidePageProps) {
  const [content, setContent] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const quillRef = useRef<ReactQuill>(null);

  const isAdmin = user.role === "admin";

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await getContent("petunjuk-penggunaan");
        if (data.content) {
          setContent(data.content);
        } else {
          setContent(`
            <h1>Petunjuk Penggunaan</h1>
            <p>Selamat datang di AirDataLabs. Halaman ini berisi panduan penggunaan sistem.</p>
            <h2>Langkah-langkah:</h2>
            <ol>
              <li>Buka menu <b>Investigasi</b> untuk mulai menganalisis data.</li>
              <li>Gunakan <b>Virtual Lab</b> untuk simulasi interaktif.</li>
              <li>Selesaikan <b>Kuis</b> untuk menguji pemahaman Anda.</li>
            </ol>
          `);
        }
      } catch (err) {
        console.error(err);
        setError("Gagal memuat petunjuk penggunaan.");
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
      await updateContent("petunjuk-penggunaan", content);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan petunjuk penggunaan.");
    } finally {
      setSaving(false);
    }
  };

  const compressImage = useCallback(
    (file: File, maxKB: number): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
          const img = new Image();
          img.src = e.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;

            // Initial resize if huge
            if (width > 1200) {
              height = (1200 / width) * height;
              width = 1200;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0, width, height);

            let quality = 0.8;
            let dataUrl = canvas.toDataURL("image/jpeg", quality);

            // Loop to reduce quality and/or resolution until below maxKB
            while (dataUrl.length / 1024 > maxKB && quality > 0.1) {
              quality -= 0.1;
              dataUrl = canvas.toDataURL("image/jpeg", quality);

              if (quality <= 0.2 && dataUrl.length / 1024 > maxKB) {
                // If still too big at low quality, reduce resolution
                width *= 0.7;
                height *= 0.7;
                canvas.width = width;
                canvas.height = height;
                ctx?.drawImage(img, 0, 0, width, height);
                quality = 0.5; // Reset quality to try again at lower res
              }

              // Safety break to prevent infinite loop
              if (width < 100) break;
            }
            resolve(dataUrl);
          };
          img.onerror = reject;
        };
        reader.onerror = reject;
      });
    },
    [],
  );

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        try {
          const compressedDataUrl = await compressImage(file, 300);
          const quill = quillRef.current?.getEditor();
          if (quill) {
            const range = quill.getSelection();
            if (range) {
              quill.insertEmbed(range.index, "image", compressedDataUrl);
            }
          }
        } catch (err) {
          console.error("Compression error:", err);
          setError("Gagal mengompres gambar.");
        }
      }
    };
  }, [compressImage]);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ color: [] }, { background: [] }],
          ["image"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [imageHandler],
  );

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
        <div className="flex items-start sm:items-center gap-3 w-full">
          <HelpCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0 mt-0.5 sm:mt-0" />
          <div className="w-full">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
              Petunjuk Penggunaan
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Panduan interaktif AirDataLabs
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center gap-2 px-3 py-2 md:px-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors w-full md:w-auto"
                id="btn-edit-guide"
              >
                <Edit2 className="h-4 w-4" />
                Edit Petunjuk
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center justify-center gap-2 px-3 py-2 md:px-4 bg-background border border-border rounded-lg hover:bg-muted transition-colors w-full md:w-auto"
                  id="btn-preview-guide"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-3 py-2 md:px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 w-full md:w-auto"
                  id="btn-save-guide"
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
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              className="min-h-62.5 sm:min-h-75 md:min-h-100"
            />
          </div>
        ) : (
          <div className="p-4 sm:p-6 md:p-8 prose prose-slate max-w-none wrap-break-word">
            {content ? (
              <div
                className="rich-text-content overflow-hidden"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground italic">
                Belum ada petunjuk penggunaan yang ditambahkan oleh admin.
              </div>
            )}
          </div>
        )}
      </div>

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
          color: var(--primary);
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

        .rich-text-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }

        .editor-container .ql-container {
          min-height: 250px;
          font-size: 1rem;
        }

        .editor-container .ql-editor {
          min-height: 250px;
          padding: 1rem;
        }

        .editor-container .ql-editor img {
          max-width: 100%;
          height: auto;
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
