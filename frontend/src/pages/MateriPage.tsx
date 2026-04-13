import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { getContent, updateContent } from "../api/content.api";
import {
  Edit2,
  Eye,
  Save,
  AlertCircle,
  Book,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface MateriPageProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export default function MateriPage({ user }: MateriPageProps) {
  const [slides, setSlides] = useState<string[]>([""]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const quillRef = useRef<ReactQuill>(null);

  const isAdmin = user.role === "admin";

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await getContent("materi-pembelajaran");
        if (data.content) {
          try {
            const parsed = JSON.parse(data.content);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSlides(parsed);
            } else {
              setSlides([data.content]); // Fallback if it's not JSON array
            }
          } catch {
            setSlides([data.content]); // Fallback for old content format
          }
        }
      } catch (err) {
        console.error(err);
        setError("Gagal memuat materi pembelajaran.");
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
      await updateContent("materi-pembelajaran", JSON.stringify(slides));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan materi pembelajaran.");
    } finally {
      setSaving(false);
    }
  };

  const updateCurrentSlideContent = useCallback(
    (content: string) => {
      setSlides((prev) => {
        const newSlides = [...prev];
        newSlides[currentIndex] = content;
        return newSlides;
      });
    },
    [currentIndex],
  );

  const addSlide = () => {
    const newSlides = [...slides, ""];
    setSlides(newSlides);
    setCurrentIndex(newSlides.length - 1);
  };

  const removeSlide = (index: number) => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    if (currentIndex >= newSlides.length) {
      setCurrentIndex(newSlides.length - 1);
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

            while (dataUrl.length / 1024 > maxKB && quality > 0.1) {
              quality -= 0.1;
              dataUrl = canvas.toDataURL("image/jpeg", quality);

              if (quality <= 0.2 && dataUrl.length / 1024 > maxKB) {
                width *= 0.7;
                height *= 0.7;
                canvas.width = width;
                canvas.height = height;
                ctx?.drawImage(img, 0, 0, width, height);
                quality = 0.5;
              }
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
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-border/50 pb-6 gap-4">
        <div className="flex items-center gap-3">
          <Book className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary">
              Materi Pembelajaran
            </h1>
            <p className="text-muted-foreground mt-1">
              Bacaan literasi dan materi pembelajaran terstruktur
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {isAdmin && (
            <>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors shadow-sm"
                  id="btn-edit-materi"
                >
                  <Edit2 className="h-4 w-4" />
                  Mode Editor
                </button>
              ) : (
                <div className="flex flex-1 md:flex-none gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2 bg-background border border-border rounded-lg hover:bg-muted transition-colors shadow-sm"
                    id="btn-preview-materi"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-md"
                    id="btn-save-materi"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Menyimpan..." : "Simpan Semua"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3 shadow-sm">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Slide Navigation - Editor Mode */}
      {isEditing && (
        <div className="flex flex-wrap items-center gap-2 mb-4 bg-muted/30 p-3 rounded-xl border border-border/50">
          <span className="text-sm font-medium mr-2 text-muted-foreground">
            Slide:
          </span>
          {slides.map((_, idx) => (
            <div key={idx} className="group relative">
              <button
                onClick={() => setCurrentIndex(idx)}
                className={`w-10 h-10 rounded-lg font-bold transition-all ${
                  currentIndex === idx
                    ? "bg-primary text-white shadow-md scale-105"
                    : "bg-white border border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {idx + 1}
              </button>
              {slides.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSlide(idx);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                  title="Hapus Slide"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addSlide}
            className="w-10 h-10 rounded-lg border border-dashed border-primary/50 text-primary flex items-center justify-center hover:bg-primary/5 transition-colors"
            title="Tambah Slide Baru"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Content Area */}
      <div className="bg-white rounded-2xl shadow-xl border border-border/50 overflow-hidden min-h-[500px] flex flex-col">
        {isEditing ? (
          <div className="p-4 flex-1 flex flex-col">
            <ReactQuill
              key={currentIndex}
              ref={quillRef}
              theme="snow"
              value={slides[currentIndex] || ""}
              onChange={updateCurrentSlideContent}
              modules={modules}
              className="flex-1 flex flex-col"
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="p-8 md:p-12 prose prose-slate max-w-none flex-1 overflow-x-hidden">
              {slides[currentIndex] ? (
                <div
                  className="rich-text-content animate-in fade-in duration-500"
                  dangerouslySetInnerHTML={{ __html: slides[currentIndex] }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground italic gap-4">
                  <Book className="h-12 w-12 opacity-20" />
                  <p>Materi belum tersedia.</p>
                </div>
              )}
            </div>

            {/* Slide Navigation - Preview Mode */}
            <div className="bg-muted/30 border-t border-border/50 p-6 flex justify-between items-center">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-white text-foreground hover:bg-muted transition-all disabled:opacity-30 disabled:cursor-not-allowed font-medium shadow-sm"
              >
                <ChevronLeft className="h-5 w-5" />
                Sebelumnya
              </button>

              <div className="px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm border border-primary/20">
                Slide {currentIndex + 1} dari {slides.length}
              </div>

              <button
                onClick={() =>
                  setCurrentIndex((prev) =>
                    Math.min(slides.length - 1, prev + 1),
                  )
                }
                disabled={currentIndex === slides.length - 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed font-medium shadow-md"
              >
                Selanjutnya
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .rich-text-content { 
          overflow-wrap: break-word; 
          word-break: break-word; 
          line-height: 1.8;
          font-size: 1.125rem;
          color: #334155;
        }
        .rich-text-content h1 { font-size: 2.5rem; font-weight: 800; margin-top: 2rem; margin-bottom: 1.5rem; color: #1e293b; font-family: serif; border-left: 6px solid var(--primary); padding-left: 1rem; }
        .rich-text-content h2 { font-size: 1.875rem; font-weight: 700; margin-top: 1.75rem; margin-bottom: 1rem; color: #334155; font-family: serif; }
        .rich-text-content h3 { font-size: 1.5rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #475569; }
        .rich-text-content p { margin-bottom: 1.25rem; }
        .rich-text-content ul { list-style-type: disc; padding-left: 2rem; margin-bottom: 1.25rem; }
        .rich-text-content ol { list-style-type: decimal; padding-left: 2rem; margin-bottom: 1.25rem; }
        .rich-text-content li { margin-bottom: 0.5rem; }
        .rich-text-content img { max-width: 100%; height: auto; border-radius: 1rem; margin: 2rem auto; display: block; shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        
        /* Quill adjustments */
        .ql-container.ql-snow { border: none !important; }
        .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #e2e8f0 !important; background-color: #f8fafc; border-radius: 1rem 1rem 0 0; }
        .ql-editor { min-height: 400px; padding: 2rem !important; font-size: 1.125rem !important; }
        .ql-editor img { max-width: 100%; border-radius: 0.5rem; }
        
        .animate-in {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
