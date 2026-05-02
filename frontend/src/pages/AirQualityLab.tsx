import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import IndonesiaMapSVG from "../assets/air_labs/indonesian_map.svg";

// ─── Types ─────────────────────────────────────────────────────────────────

type Screen =
  | "start"
  | "location"
  | "time"
  | "confirm"
  | "measuring"
  | "result";

type AirQualityRecord = {
  hari: string;
  tanggal: string;
  jam: string;
  kota: string;
  pm10: number | null;
  pm25: number | null;
  so2: number | null;
  co: number | null;
  o3: number | null;
  no2: number | null;
  hc: number | null;
};

type ISPUCategory =
  | "Baik"
  | "Sedang"
  | "Tidak Sehat"
  | "Sangat Tidak Sehat"
  | "Berbahaya";

type MeasurementResult = {
  record: AirQualityRecord;
  categories: Record<
    string,
    { value: number | null; category: ISPUCategory | "-"; color: string }
  >;
  overallCategory: ISPUCategory;
  overallColor: string;
  overallMax: number;
};

// ─── Constants ─────────────────────────────────────────────────────────────

const LOCATIONS = ["Tasikmalaya", "Solo", "Kutai Barat"] as const;
type Location = (typeof LOCATIONS)[number];

const PARAMETERS = [
  { key: "pm10", label: "PM₁₀", unit: "µg/m³" },
  { key: "pm25", label: "PM₂.₅", unit: "µg/m³" },
  { key: "so2", label: "SO₂", unit: "µg/m³" },
  { key: "co", label: "CO", unit: "mg/m³" },
  { key: "o3", label: "O₃", unit: "µg/m³" },
  { key: "no2", label: "NO₂", unit: "µg/m³" },
  { key: "hc", label: "HC", unit: "µg/m³" },
];

function getCategory(value: number | null): {
  category: ISPUCategory | "-";
  color: string;
} {
  if (value === null || isNaN(value))
    return { category: "-", color: "#9ca3af" };
  if (value <= 50) return { category: "Baik", color: "#16a34a" }; // green-600
  if (value <= 100) return { category: "Sedang", color: "#2563eb" }; // blue-600
  if (value <= 200) return { category: "Tidak Sehat", color: "#eab308" }; // yellow-500
  if (value <= 300) return { category: "Sangat Tidak Sehat", color: "#dc2626" }; // red-600
  return { category: "Berbahaya", color: "#581c87" }; // purple-900
}

function getCategoryBgClass(category: ISPUCategory | "-"): string {
  switch (category) {
    case "Baik":
      return "bg-green-500";
    case "Sedang":
      return "bg-blue-500";
    case "Tidak Sehat":
      return "bg-yellow-400";
    case "Sangat Tidak Sehat":
      return "bg-red-500";
    case "Berbahaya":
      return "bg-purple-900";
    default:
      return "bg-gray-300";
  }
}

function getCategoryTextClass(category: ISPUCategory | "-"): string {
  switch (category) {
    case "Baik":
      return "text-green-600";
    case "Sedang":
      return "text-blue-600";
    case "Tidak Sehat":
      return "text-yellow-600";
    case "Sangat Tidak Sehat":
      return "text-red-600";
    case "Berbahaya":
      return "text-purple-900";
    default:
      return "text-gray-400";
  }
}

function getCategoryDescription(category: ISPUCategory): string {
  switch (category) {
    case "Baik":
      return "Tingkat kualitas udara yang sangat baik, tidak memberikan efek negatif terhadap manusia, hewan, dan tumbuhan.";
    case "Sedang":
      return "Tingkat kualitas udara masih dapat diterima, namun perlu diawasi untuk pencemaran yang meningkat.";
    case "Tidak Sehat":
      return "Tingkat kualitas udara yang tidak sehat bagi kelompok sensitif seperti anak-anak, lansia, dan penderita penyakit pernapasan.";
    case "Sangat Tidak Sehat":
      return "Tingkat kualitas udara yang sangat tidak sehat bagi semua kelompok. Dapat menimbulkan gangguan kesehatan serius.";
    case "Berbahaya":
      return "Tingkat kualitas udara yang berbahaya! Segera lakukan tindakan evakuasi dan pengurangan aktivitas luar ruangan.";
  }
}

// ─── CSV Parser ────────────────────────────────────────────────────────────

function parseCSV(csvText: string): AirQualityRecord[] {
  const lines = csvText.trim().split("\n");
  if (lines.length === 0) return [];
  const records: AirQualityRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = line.split(",");
    if (values.length < 11) continue;

    const parseNum = (v: string): number | null => {
      const trimmed = v.trim();
      if (trimmed === "" || trimmed === "-") return null;
      const n = Number(trimmed);
      return isNaN(n) ? null : n;
    };

    records.push({
      hari: values[0].trim(),
      tanggal: values[1].trim(),
      jam: values[2].trim(),
      kota: values[3].trim(),
      pm10: parseNum(values[4]),
      pm25: parseNum(values[5]),
      so2: parseNum(values[6]),
      co: parseNum(values[7]),
      o3: parseNum(values[8]),
      no2: parseNum(values[9]),
      hc: parseNum(values[10]),
    });
  }

  return records;
}

// ─── Measurement Logic ─────────────────────────────────────────────────────

function calculateResult(record: AirQualityRecord): MeasurementResult {
  const categories: MeasurementResult["categories"] = {};
  let maxValue = 0;
  let overallCategory: ISPUCategory = "Baik";

  const params = ["pm10", "pm25", "so2", "co", "o3", "no2", "hc"] as const;
  params.forEach((key) => {
    const value = record[key as keyof AirQualityRecord] as number | null;
    const { category, color } = getCategory(value);
    categories[key] = { value, category, color };

    if (value !== null && value > maxValue) {
      maxValue = value;
      overallCategory = category === "-" ? overallCategory : category;
    }
  });

  const { color: overallColor } = getCategory(maxValue);

  return {
    record,
    categories,
    overallCategory,
    overallColor,
    overallMax: maxValue,
  };
}

// ─── SVG Components ────────────────────────────────────────────────────────

const MapPinIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const WindIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
  </svg>
);

// ─── Illustrations ──────────────────────────────────────────────────────────

const EnvironmentVisual = ({ location }: { location?: string }) => (
  <svg
    className="absolute inset-0 w-full h-full object-cover"
    viewBox="0 0 800 600"
    preserveAspectRatio="xMidYMid slice"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#87CEEB" />
        <stop offset="100%" stopColor="#E0F6FF" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#skyGradient)" />
    {/* Sun */}
    <circle cx="700" cy="100" r="60" fill="#FFD700" opacity="0.8" />
    {/* Clouds */}
    <path
      d="M 100 150 Q 130 110 160 140 Q 200 120 220 160 Q 250 160 210 190 Q 160 210 120 180 Z"
      fill="#FFFFFF"
      opacity="0.8"
    />
    <path
      d="M 500 100 Q 520 70 550 90 Q 580 80 590 110 Q 610 100 600 130 Q 550 150 510 120 Z"
      fill="#FFFFFF"
      opacity="0.6"
    />

    {/* Distant City / Mountains based on location (simplified) */}
    {location === "Tasikmalaya" && (
      <path
        d="M 0 450 L 150 250 L 350 450 L 550 300 L 800 450 L 800 600 L 0 600 Z"
        fill="#4B5320"
        opacity="0.6"
      />
    )}
    {location === "Solo" && (
      <>
        <rect x="100" y="300" width="80" height="200" fill="#8B8B8B" />
        <rect x="190" y="250" width="100" height="250" fill="#A9A9A9" />
        <rect x="350" y="320" width="120" height="180" fill="#8B8B8B" />
        <rect x="520" y="200" width="90" height="300" fill="#A9A9A9" />
        <rect x="650" y="350" width="100" height="150" fill="#8B8B8B" />
      </>
    )}
    {location === "Kutai Barat" && (
      <>
        <path
          d="M 0 500 Q 100 400 200 500 T 400 500 T 600 500 T 800 500 L 800 600 L 0 600 Z"
          fill="#228B22"
          opacity="0.7"
        />
        <path
          d="M -50 550 Q 50 450 150 550 T 350 550 T 550 550 T 750 550 T 850 550 L 850 600 L -50 600 Z"
          fill="#006400"
        />
      </>
    )}

    {/* Ground */}
    <rect x="0" y="450" width="100%" height="150" fill="#8B4513" />
    <rect x="0" y="450" width="100%" height="20" fill="#556B2F" />
  </svg>
);

const MapIndonesiaBase = () => (
  <div className="w-full h-full absolute inset-0 pointer-events-none">
    <img
      src={IndonesiaMapSVG}
      className="w-full h-full object-contain"
      alt="Peta Indonesia"
    />
  </div>
);

const LocationPins = ({ selected }: { selected: string | null }) => (
  <svg
    viewBox="0 0 1000 500"
    className="w-full h-full absolute inset-0 z-10 pointer-events-none"
    preserveAspectRatio="xMidYMid meet"
  >
    {LOCATIONS.map((loc) => {
      let x, y;
      if (loc === "Tasikmalaya") {
        x = 320;
        y = 360;
      } else if (loc === "Solo") {
        x = 380;
        y = 360;
      } else {
        x = 450;
        y = 200;
      } // Kutai Barat

      const isSelected = selected === loc;

      return (
        <g
          key={loc}
          transform={`translate(${x}, ${y})`}
          className="pointer-events-none"
        >
          <circle
            cx="0"
            cy="0"
            r={isSelected ? "18" : "12"}
            fill={isSelected ? "#EF4444" : "#3B82F6"}
            opacity="0.3"
            className="animate-ping"
          />
          <circle
            cx="0"
            cy="0"
            r={isSelected ? "12" : "8"}
            fill={isSelected ? "#EF4444" : "#3B82F6"}
          />
          <path
            d="M -8 -8 L 8 8 M 8 -8 L -8 8"
            stroke="white"
            strokeWidth="2"
          />
          <text
            x="0"
            y="25"
            textAnchor="middle"
            fill="#1F2937"
            fontSize="14"
            fontWeight="bold"
          >
            {loc}
          </text>
        </g>
      );
    })}
  </svg>
);

const IndonesiaMap = ({ selected }: { selected: string | null }) => (
  <div className="relative w-full max-w-2xl aspect-2/1 mx-auto bg-[#E0F6FF] rounded-2xl overflow-hidden shadow-inner border border-blue-200">
    <MapIndonesiaBase />
    <LocationPins selected={selected} />
  </div>
);

const DeviceSVG = ({
  progress = 0,
  status,
  result,
}: {
  progress?: number;
  status?: string;
  result?: MeasurementResult | null;
}) => {
  return (
    <svg
      viewBox="0 0 400 500"
      className="w-75 md:w-87.5 lg:w-100 h-auto drop-shadow-2xl"
    >
      {/* Device Body */}
      <rect x="40" y="20" width="320" height="460" rx="30" fill="#2d3748" />
      <rect x="45" y="25" width="310" height="450" rx="25" fill="#1f2937" />

      {/* Sensors / Top Details */}
      <rect x="150" y="5" width="100" height="20" rx="5" fill="#4a5568" />
      <circle cx="100" cy="50" r="10" fill="#4a5568" />
      <circle cx="300" cy="50" r="10" fill="#4a5568" />
      {progress > 0 && progress < 100 && (
        <circle cx="100" cy="50" r="5" fill="#ef4444">
          <animate
            attributeName="opacity"
            values="1;0;1"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Screen */}
      <rect x="60" y="80" width="280" height="220" rx="15" fill="#111827" />
      <rect x="65" y="85" width="270" height="210" rx="10" fill="#0f172a" />

      {/* Screen Content - Measuring */}
      {!result && progress > 0 && (
        <g>
          <text
            x="200"
            y="140"
            textAnchor="middle"
            fill="#60a5fa"
            fontSize="20"
            fontFamily="monospace"
          >
            MENGUKUR KUALITAS UDARA
          </text>
          <text
            x="200"
            y="180"
            textAnchor="middle"
            fill="#9ca3af"
            fontSize="14"
            fontFamily="monospace"
          >
            {status}
          </text>

          <rect x="80" y="210" width="240" height="20" rx="10" fill="#1e293b" />
          <rect
            x="80"
            y="210"
            width={(progress / 100) * 240}
            height="20"
            rx="10"
            fill="#3b82f6"
          >
            <animate
              attributeName="width"
              from="0"
              to={(progress / 100) * 240}
              dur="0.2s"
            />
          </rect>

          <text
            x="200"
            y="260"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="28"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {progress}%
          </text>
        </g>
      )}

      {/* Screen Content - Result */}
      {result && (
        <g>
          <rect
            x="65"
            y="85"
            width="270"
            height="210"
            rx="10"
            fill={result.overallColor}
            opacity="0.2"
          />
          <text
            x="200"
            y="125"
            textAnchor="middle"
            fill="#9ca3af"
            fontSize="16"
            fontFamily="sans-serif"
          >
            NILAI ISPU
          </text>
          <text
            x="200"
            y="195"
            textAnchor="middle"
            fill={result.overallColor}
            fontSize="72"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            {result.overallMax}
          </text>
          <rect
            x="90"
            y="220"
            width="220"
            height="40"
            rx="20"
            fill={result.overallColor}
          />
          <text
            x="200"
            y="247"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="18"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            {result.overallCategory}
          </text>
        </g>
      )}

      {/* Screen Content - Idle */}
      {!result && progress === 0 && (
        <g>
          <text
            x="200"
            y="180"
            textAnchor="middle"
            fill="#4b5563"
            fontSize="24"
            fontFamily="monospace"
          >
            SIAP DIGUNAKAN
          </text>
          <text
            x="200"
            y="210"
            textAnchor="middle"
            fill="#4b5563"
            fontSize="14"
            fontFamily="monospace"
          >
            Tunggu instruksi
          </text>
        </g>
      )}

      {/* Buttons / Bottom details */}
      <circle cx="200" cy="360" r="40" fill="#374151" />
      <circle cx="200" cy="360" r="30" fill="#1f2937" />
      {/* Small buttons */}
      <circle cx="100" cy="420" r="15" fill="#374151" />
      <circle cx="150" cy="420" r="15" fill="#374151" />
      <circle cx="250" cy="420" r="15" fill="#374151" />
      <circle cx="300" cy="420" r="15" fill="#374151" />

      {/* Vents */}
      <rect x="100" y="330" width="15" height="40" rx="5" fill="#111827" />
      <rect x="125" y="330" width="15" height="40" rx="5" fill="#111827" />
      <rect x="260" y="330" width="15" height="40" rx="5" fill="#111827" />
      <rect x="285" y="330" width="15" height="40" rx="5" fill="#111827" />

      {/* Brand logo */}
      <text
        x="200"
        y="470"
        textAnchor="middle"
        fill="#4b5563"
        fontSize="12"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        ECO SENSOR PRO
      </text>
    </svg>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────

export default function AirQualityLab() {
  const [screen, setScreen] = useState<Screen>("start");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [data, setData] = useState<AirQualityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [measureProgress, setMeasureProgress] = useState(0);
  const [measureStatus, setMeasureStatus] = useState("");
  const [result, setResult] = useState<MeasurementResult | null>(null);
  const measureIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  // Load CSV data
  useEffect(() => {
    fetch("/data/udara_24.csv")
      .then((res) => res.text())
      .then((text) => {
        const parsed = parseCSV(text);
        setData(parsed);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const availableTimes = useMemo(() => {
    if (!selectedLocation) return [];
    const times = data
      .filter((r) => r.kota === selectedLocation)
      .map((r) => r.jam);
    return [...new Set(times)].sort((a, b) => {
      const ah = parseFloat(a.replace(".", ":"));
      const bh = parseFloat(b.replace(".", ":"));
      return ah - bh;
    });
  }, [data, selectedLocation]);

  const availableDates = useMemo(() => {
    if (!selectedLocation || !selectedTime) return [];
    return data
      .filter((r) => r.kota === selectedLocation && r.jam === selectedTime)
      .map((r) => ({ hari: r.hari, tanggal: r.tanggal }));
  }, [data, selectedLocation, selectedTime]);

  const startMeasurement = useCallback(() => {
    if (!selectedLocation || !selectedTime) return;

    setScreen("measuring");
    setMeasureProgress(0);

    const statuses = [
      "Menginisialisasi alat ukur...",
      "Menyiapkan sensor PM₁₀ dan PM₂.₅...",
      "Mengukur konsentrasi SO₂...",
      "Mendeteksi level CO...",
      "Menganalisis O₃ dan NO₂...",
      "Memproses data HC...",
      "Menghitung indeks ISPU...",
      "Finalisasi hasil pengukuran...",
    ];

    let progress = 0;
    measureIntervalRef.current = setInterval(() => {
      progress += 1;
      setMeasureProgress(progress);
      const statusIndex = Math.min(
        Math.floor((progress / 100) * statuses.length),
        statuses.length - 1,
      );
      setMeasureStatus(statuses[statusIndex]);

      if (progress >= 100) {
        if (measureIntervalRef.current)
          clearInterval(measureIntervalRef.current);
        const record = data.find(
          (r) => r.kota === selectedLocation && r.jam === selectedTime,
        );
        if (record) {
          const res = calculateResult(record);
          setResult(res);
          setScreen("result");
        }
      }
    }, 60); // Faster for demo purposes
  }, [data, selectedLocation, selectedTime]);

  useEffect(() => {
    return () => {
      if (measureIntervalRef.current) clearInterval(measureIntervalRef.current);
    };
  }, []);

  // ─── Sub-renders for Left Panel ──────────────────────────────────────────

  const renderLeftPanel = () => {
    if (loading) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      );
    }

    if (screen === "start" || screen === "location") {
      return (
        <div className="flex flex-col h-full space-y-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-800 flex items-center gap-2">
              <WindIcon className="w-8 h-8 text-primary" /> Virtual Lab
            </h1>
            <p className="text-slate-500 mt-2">
              Pilih lokasi pemantauan pada peta atau daftar di bawah untuk
              memulai simulasi pengukuran kualitas udara.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {LOCATIONS.map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  setSelectedLocation(loc);
                  setSelectedTime(null);
                }}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  selectedLocation === loc
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-slate-200 hover:border-primary/50 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPinIcon
                    className={`w-6 h-6 ${selectedLocation === loc ? "text-primary" : "text-slate-400"}`}
                  />
                  <span className="font-bold text-slate-700">{loc}</span>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedLocation === loc ? "border-primary" : "border-slate-300"}`}
                >
                  {selectedLocation === loc && (
                    <div className="w-3 h-3 bg-primary rounded-full" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-auto pt-6 space-y-3">
            <button
              disabled={!selectedLocation}
              onClick={() => setScreen("time")}
              className={`w-full py-4 rounded-xl font-bold tracking-wide shadow-lg transition-all ${
                selectedLocation
                  ? "bg-primary text-white hover:shadow-xl active:scale-95"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              Lanjut Pilih Waktu
            </button>
          </div>
        </div>
      );
    }

    if (screen === "time") {
      return (
        <div className="flex flex-col h-full space-y-6">
          <button
            onClick={() => setScreen("location")}
            className="self-start text-sm text-primary font-medium hover:underline flex items-center gap-1"
          >
            ← Kembali Pilih Lokasi
          </button>

          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-800">
              Pilih Waktu Pengukuran
            </h2>
            <p className="text-slate-500 mt-1 flex items-center gap-1">
              <MapPinIcon className="w-4 h-4" /> {selectedLocation}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 flex-1 content-start">
            {availableTimes.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`p-3 rounded-lg border-2 font-bold transition-all ${
                  selectedTime === time
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-slate-200 bg-white text-slate-600 hover:border-primary/40"
                }`}
              >
                {time}
              </button>
            ))}
          </div>

          <div className="mt-auto pt-6">
            <button
              disabled={!selectedTime}
              onClick={() => setScreen("confirm")}
              className={`w-full py-4 mb-4 rounded-xl font-bold tracking-wide shadow-lg transition-all ${
                selectedTime
                  ? "bg-primary text-white hover:shadow-xl active:scale-95"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              Lanjut ke Konfirmasi
            </button>
          </div>
        </div>
      );
    }

    if (screen === "confirm") {
      return (
        <div className="flex flex-col h-full space-y-6">
          <button
            onClick={() => setScreen("time")}
            className="self-start text-sm text-primary font-medium hover:underline flex items-center gap-1"
          >
            ← Kembali Pilih Waktu
          </button>

          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-800">
              Konfirmasi & Mulai
            </h2>
            <p className="text-slate-500 mt-2">
              Anda akan melakukan pengukuran kualitas udara dengan parameter
              berikut:
            </p>
          </div>

          <div className="bg-slate-100 rounded-xl p-5 space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-500 text-sm">Lokasi</span>
              <span className="font-bold text-slate-800">
                {selectedLocation}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-sm">Jam</span>
              <span className="font-bold text-slate-800">{selectedTime}</span>
            </div>
            {availableDates.length > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500 text-sm">Tanggal Data</span>
                <span className="font-bold text-slate-800 text-right">
                  {availableDates[0].hari}, {availableDates[0].tanggal}
                </span>
              </div>
            )}
          </div>

          <div className="mt-auto pt-6">
            <button
              onClick={startMeasurement}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold tracking-wide shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              Mulai Pengukuran
            </button>
          </div>
        </div>
      );
    }

    if (screen === "measuring") {
      return (
        <div className="flex flex-col h-full justify-center items-center text-center space-y-6">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-800">
              Proses Pengukuran
            </h2>
            <p className="text-slate-500 mt-2">
              Mohon tunggu, sensor sedang mengambil data dari lingkungan
              sekitar.
            </p>
          </div>
        </div>
      );
    }

    if (screen === "result" && result) {
      return (
        <div className="flex flex-col h-full space-y-6 overflow-hidden">
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-800">
              Hasil Pengukuran
            </h2>
            <div className="flex gap-2 mt-2 text-sm text-slate-500">
              <span className="px-2 py-1 bg-slate-100 rounded">
                {result.record.kota}
              </span>
              <span className="px-2 py-1 bg-slate-100 rounded">
                {result.record.jam}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            <div
              className={`p-4 rounded-xl text-white ${getCategoryBgClass(result.overallCategory)}`}
            >
              <p className="text-sm opacity-90 font-medium">Kategori Dominan</p>
              <h3 className="text-xl font-bold">{result.overallCategory}</h3>
              <p className="text-xs mt-2 opacity-80">
                {getCategoryDescription(result.overallCategory)}
              </p>
            </div>

            <div className="bg-white border rounded-xl overflow-hidden text-sm">
              <table className="w-full">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="p-3 text-left">Parameter</th>
                    <th className="p-3 text-center">Nilai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PARAMETERS.map((param) => {
                    const cat = result.categories[param.key];
                    return (
                      <tr key={param.key}>
                        <td className="p-3">
                          <span className="font-medium block">
                            {param.label}
                          </span>
                          <span className="text-xs text-slate-400">
                            {param.unit}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono font-bold">
                          <div className="flex flex-col items-center">
                            <span>{cat.value !== null ? cat.value : "-"}</span>
                            {cat.category !== "-" && (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded ${getCategoryTextClass(cat.category)}`}
                                style={{ backgroundColor: cat.color + "20" }}
                              >
                                {cat.category}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 border-t">
            <button
              onClick={() => {
                setScreen("location");
                setResult(null);
                setSelectedLocation(null);
                setSelectedTime(null);
              }}
              className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
            >
              Ukur Ulang
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  // ─── Main Render ─────────────────────────────────────────────────────────

  return (
    <div className="flex w-full h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Left Panel: Controls */}
      <div className="w-full md:w-100 lg:w-112.5 shrink-0 bg-white border-r border-slate-200 p-6 md:p-8 flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.05)] overflow-y-auto relative">
        {renderLeftPanel()}
      </div>

      {/* Right Panel: Visual Stage */}
      <div className="hidden md:flex flex-1 relative bg-[#E0F6FF] overflow-hidden justify-center items-center">
        {/* Background Visuals based on screen */}
        {(screen === "start" ||
          screen === "location" ||
          screen === "time" ||
          screen === "confirm") && (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="w-full max-w-4xl text-center">
              <h2 className="text-4xl font-serif text-sky-800 opacity-50 mb-12">
                Pilih Lokasi Pemantauan
              </h2>
              <IndonesiaMap selected={selectedLocation} />
            </div>
          </div>
        )}

        {(screen === "measuring" || screen === "result") && (
          <div className="absolute inset-0 transition-opacity duration-1000 opacity-100">
            <EnvironmentVisual location={selectedLocation || "Tasikmalaya"} />
            {/* Dark overlay during measuring for focus */}
            {screen === "measuring" && (
              <div className="absolute inset-0 bg-black/20" />
            )}
          </div>
        )}

        {/* Foreground Visuals: The Device */}
        <div
          className={`absolute bottom-0 xl:-bottom-12 transition-transform duration-1000 transform ${
            screen === "measuring" || screen === "result"
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-full opacity-0 scale-75 pointer-events-none"
          }`}
        >
          <DeviceSVG
            progress={measureProgress}
            status={measureStatus}
            result={result}
          />
        </div>
      </div>
    </div>
  );
}
