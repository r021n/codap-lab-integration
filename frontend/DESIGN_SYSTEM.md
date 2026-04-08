# 📘 Design System: "EduWarm" (Education Platform)

**Version:** 1.0.0 | **Vibe:** Warm, Professional, Energetic, Focus-Oriented

---

## 🎨 1. Foundations: Color & Typography

### A. Palet Warna (The Palette)

Warna dipilih untuk meningkatkan retensi informasi dan mengurangi kelelahan mata (_eye strain_).

| Role          | Color Name       | Hex Code  | Usage                                                        |
| :------------ | :--------------- | :-------- | :----------------------------------------------------------- |
| **Primary**   | Emerald Green    | `#10B981` | Action buttons, progress bars, highlights, active states.    |
| **Surface**   | Crisp White      | `#FFFFFF` | Main background, container backgrounds.                      |
| **Contrast**  | Deep Slate       | `#0F172A` | Primary text, navigation bars, footer, professional accents. |
| **Secondary** | Ocean Blue       | `#3B82F6` | Secondary accents, badges, decorative elements.              |
| **Success**   | Mint Green       | `#34D399` | Completed lessons, correct answers, positive feedback.       |
| **Warning**   | Energetic Orange | `#F97316` | Reminders, streaks, upcoming deadlines, warning states.      |

### B. Tipografi (Typography)

- **Headings (Judul):** `Lora` atau `Playfair Display` (Serif). Memberikan kesan akademis, otoritas, dan terpercaya.
- **Body Text (Isi):** `Inter` atau `Plus Jakarta Sans` (Sans-serif). Dioptimalkan untuk pembacaan teks panjang di layar digital.

---

## 🛠️ 2. UI Components Detail

### A. Buttons (Tombol)

- **Primary:** Background `#10B981`, Text `#FFFFFF`, Border-radius `8px`. _Hover state: Darken by 10%_.
- **Secondary:** Background `Transparent`, Border `2px solid #0F172A`, Text `#0F172A`.
- **Ghost:** Text `#10B981`, No background. Digunakan untuk aksi minor (misal: "Batal").

### B. Course Cards (Kartu Materi)

- **Background:** `#F8FAFC` (Slate yang sangat terang agar kontras dengan latar belakang putih).
- **Shadow:** `0px 4px 6px -1px rgba(0, 0, 0, 0.1)`. Memberikan efek mengambang halus.
- **Elements:** \* Thumbnail image (top).
  - Badge kategori (Blue/Orange bg, white text).
  - Progress bar tipis di bagian bawah kartu.

### C. Inputs & Forms

- **State Normal:** Border Gray-300, Background `#FFFFFF`.
- **State Focus:** Border `#10B981`, Soft Green Glow (Ring).
- **Label:** Gunakan Deep Slate (`#0F172A`) dengan font-weight 600.

---

## 🧩 3. UX Strategy (Education-Specific)

### A. Information Architecture (Hierarki Informasi)

1.  **The "Focus Mode":** Saat user masuk ke halaman materi, hilangkan sidebar utama dan navigasi yang tidak perlu. Fokus hanya pada konten video/teks.
2.  **Breadcrumbs:** Selalu tampilkan lokasi user (Misal: _Dashboard > Kelas Python > Modul 1_).

### B. Feedback Loops (Interaksi)

- **Micro-interactions:** Saat menyelesaikan kuis, berikan animasi halus (confetti kecil atau checkmark) dengan warna Forest Green.
- **Progress Tracking:** Visualisasikan progres dalam persentase (%) dan "Step Indicator" yang jelas di bagian atas halaman belajar.

### C. Cognitive Load Management (Beban Kognitif)

- **Chunking:** Bagi materi panjang menjadi sub-bab kecil berdurasi 5-10 menit.
- **White Space:** Gunakan margin minimal `32px` antar bagian besar untuk menghindari kesan "sumpek" yang membuat pelajar cepat lelah.

---

## 📐 4. Layout & Grid System

- **Grid:** 12-Column Grid (Desktop), 4-Column Grid (Mobile).
- **Container:** Max-width `1280px` untuk menjaga fokus mata tidak terlalu melebar ke samping.
- **Spacing System:** Gunakan kelipatan 8 (8px, 16px, 24px, 32px, 64px) untuk konsistensi vertikal dan horizontal.

---

## 💻 5. Coding Reference (Tailwind Config Example)

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "#10B981", // Hijau
        surface: "#FFFFFF", // Putih
        secondary: "#3B82F6", // Biru
        contrast: "#0F172A", // Deep Slate
        warning: "#F97316", // Jingga
        success: "#34D399",
      },
      fontFamily: {
        serif: ["Lora", "serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
};
```
