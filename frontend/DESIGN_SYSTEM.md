# 📘 Design System: "EduWarm" (Education Platform)

**Version:** 1.0.0 | **Vibe:** Warm, Professional, Energetic, Focus-Oriented

---

## 🎨 1. Foundations: Color & Typography

### A. Palet Warna (The Palette)

Warna dipilih untuk meningkatkan retensi informasi dan mengurangi kelelahan mata (_eye strain_).

| Role          | Color Name       | Hex Code  | Usage                                                        |
| :------------ | :--------------- | :-------- | :----------------------------------------------------------- |
| **Primary**   | Energetic Orange | `#F97316` | Action buttons, progress bars, highlights, active states.    |
| **Surface**   | Creamy Ivory     | `#FDFBF0` | Main background, container backgrounds (warmth & comfort).   |
| **Contrast**  | Deep Slate       | `#0F172A` | Primary text, navigation bars, footer, professional accents. |
| **Secondary** | Muted Sage       | `#94A3B8` | Secondary text, borders, decorative elements.                |
| **Success**   | Forest Green     | `#10B981` | Completed lessons, correct answers, positive feedback.       |
| **Warning**   | Golden Sun       | `#F59E0B` | Reminders, streaks, upcoming deadlines.                      |

### B. Tipografi (Typography)

- **Headings (Judul):** `Lora` atau `Playfair Display` (Serif). Memberikan kesan akademis, otoritas, dan terpercaya.
- **Body Text (Isi):** `Inter` atau `Plus Jakarta Sans` (Sans-serif). Dioptimalkan untuk pembacaan teks panjang di layar digital.

---

## 🛠️ 2. UI Components Detail

### A. Buttons (Tombol)

- **Primary:** Background `#F97316`, Text `#FFFFFF`, Border-radius `8px`. _Hover state: Darken by 10%_.
- **Secondary:** Background `Transparent`, Border `2px solid #0F172A`, Text `#0F172A`.
- **Ghost:** Text `#F97316`, No background. Digunakan untuk aksi minor (misal: "Batal").

### B. Course Cards (Kartu Materi)

- **Background:** `#FFFFFF` (Putih bersih agar kontras dengan latar belakang Creamy Ivory).
- **Shadow:** `0px 4px 6px -1px rgba(0, 0, 0, 0.1)`. Memberikan efek mengambang halus.
- **Elements:** \* Thumbnail image (top).
  - Badge kategori (Orange bg, white text).
  - Progress bar tipis di bagian bawah kartu.

### C. Inputs & Forms

- **State Normal:** Border Gray-300, Background `#FFFFFF`.
- **State Focus:** Border `#F97316`, Soft Orange Glow (Ring).
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
        primary: "#F97316", // Jingga
        surface: "#FDFBF0", // Creamy White
        contrast: "#0F172A", // Deep Slate
        success: "#10B981",
      },
      fontFamily: {
        serif: ["Lora", "serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
};
```
