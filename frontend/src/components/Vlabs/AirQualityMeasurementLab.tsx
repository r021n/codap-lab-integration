import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import IndonesiaMapSVG from "../../assets/air_labs/indonesian_map.svg";

// ─── Types ─────────────────────────────────────────────────────────────────

type Screen =
  | "start"
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

type DragInfo = {
  isDragging: boolean;
  x: number;
  y: number;
  isTouch: boolean;
};

// ─── Constants ─────────────────────────────────────────────────────────────

const LOCATIONS = ["Tasikmalaya", "Solo", "Kutai Barat"] as const;

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

const AeroScannerIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="12" cy="12" r="9" stroke="#3B82F6" strokeWidth="2" fill="#3B82F6" fillOpacity="0.1" />
    <circle cx="12" cy="12" r="5" stroke="#3B82F6" strokeWidth="1.5" />
    <path d="M12 7V17M7 12H17" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M18 18L21 21" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
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

const LocationPins = ({ isMonitoring = false }: { isMonitoring?: boolean }) => (
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

      return (
        <g
          key={loc}
          transform={`translate(${x}, ${y})`}
          className="pointer-events-none"
        >
          <circle
            cx="0"
            cy="0"
            r={isMonitoring ? "20" : "12"}
            fill={isMonitoring ? "#10B981" : "#3B82F6"}
            opacity="0.3"
            className="animate-ping"
          />
          <circle
            cx="0"
            cy="0"
            r={isMonitoring ? "10" : "8"}
            fill={isMonitoring ? "#10B981" : "#3B82F6"}
          />
          <path
            d="M -6 -6 L 6 6 M 6 -6 L -6 6"
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
            className="drop-shadow-sm"
          >
            {loc}
          </text>
        </g>
      );
    })}
  </svg>
);

const IndonesiaMap = ({ isMonitoring = false }: { isMonitoring?: boolean }) => (
  <div className="relative w-full max-w-2xl aspect-[2/1] mx-auto bg-[#E0F6FF] rounded-2xl overflow-hidden shadow-inner border border-blue-200">
    <MapIndonesiaBase />
    <LocationPins isMonitoring={isMonitoring} />
  </div>
);

const DeviceSVG = ({
  progress = 0,
  status,
  result,
  compact = false,
}: {
  progress?: number;
  status?: string;
  result?: MeasurementResult | null;
  compact?: boolean;
}) => {
  return (
    <svg
      viewBox="0 0 400 500"
      className={`${compact ? "w-full max-w-[240px]" : "w-64 sm:w-72 md:w-87.5 lg:w-100"} h-auto drop-shadow-2xl mx-auto`}
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
            y="130"
            textAnchor="middle"
            fill="#60a5fa"
            fontSize="18"
            fontFamily="monospace"
          >
            MENGUKUR...
          </text>
          {!compact && (
            <text
              x="200"
              y="160"
              textAnchor="middle"
              fill="#9ca3af"
              fontSize="12"
              fontFamily="monospace"
            >
              {status}
            </text>
          )}

          <rect x="80" y="200" width="240" height="20" rx="10" fill="#1e293b" />
          <rect
            x="80" y="200"
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
            fontSize="32"
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
            y="120"
            textAnchor="middle"
            fill="#9ca3af"
            fontSize="14"
            fontFamily="sans-serif"
          >
            ISPU {result.record.kota.toUpperCase()}
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
            x="80"
            y="225"
            width="240"
            height="40"
            rx="20"
            fill={result.overallColor}
          />
          <text
            x="200"
            y="252"
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
            READY
          </text>
        </g>
      )}

      {/* Buttons / Bottom details */}
      <circle cx="200" cy="360" r="40" fill="#374151" />
      <circle cx="200" cy="360" r="30" fill="#1f2937" />
      
      {/* Vents */}
      <rect x="80" y="340" width="10" height="40" rx="5" fill="#111827" />
      <rect x="100" y="340" width="10" height="40" rx="5" fill="#111827" />
      <rect x="290" y="340" width="10" height="40" rx="5" fill="#111827" />
      <rect x="310" y="340" width="10" height="40" rx="5" fill="#111827" />

      {/* Brand logo */}
      <text
        x="200"
        y="460"
        textAnchor="middle"
        fill="#4b5563"
        fontSize="12"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        MULTILOC SENSOR V2
      </text>
    </svg>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────

type AirQualityMeasurementLabProps = {
  onBack: () => void;
};

export default function AirQualityMeasurementLab({
  onBack,
}: AirQualityMeasurementLabProps) {
  const [screen, setScreen] = useState<Screen>("start");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [data, setData] = useState<AirQualityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [measureProgress, setMeasureProgress] = useState(0);
  const [measureStatus, setMeasureStatus] = useState("");
  const [results, setResults] = useState<MeasurementResult[]>([]);
  const [revealedCities, setRevealedCities] = useState<string[]>([]);
  const [dragInfo, setDragInfo] = useState<DragInfo>({ isDragging: false, x: 0, y: 0, isTouch: false });
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null);
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
    if (data.length === 0) return [];
    // Use Solo as reference for times (assuming all cities have same times)
    const times = data
      .filter((r) => r.kota === "Solo")
      .map((r) => r.jam);
    return [...new Set(times)].sort((a, b) => {
      const ah = parseFloat(a.replace(".", ":"));
      const bh = parseFloat(b.replace(".", ":"));
      return ah - bh;
    });
  }, [data]);

  const availableDates = useMemo(() => {
    if (!selectedTime || data.length === 0) return [];
    return data
      .filter((r) => r.kota === "Solo" && r.jam === selectedTime)
      .map((r) => ({ hari: r.hari, tanggal: r.tanggal }));
  }, [data, selectedTime]);

  const startMeasurement = useCallback(() => {
    if (!selectedTime) return;

    setScreen("measuring");
    setMeasureProgress(0);
    setRevealedCities([]);

    const statuses = [
      "Menginisialisasi alat ukur di 3 lokasi...",
      "Menyiapkan sensor di Tasikmalaya, Solo, dan Kutai Barat...",
      "Mengukur konsentrasi polutan udara...",
      "Sinkronisasi data antar stasiun...",
      "Menganalisis parameter ISPU...",
      "Menghitung rata-rata regional...",
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
        
        const currentResults: MeasurementResult[] = [];
        LOCATIONS.forEach(loc => {
          const record = data.find(
            (r) => r.kota === loc && r.jam === selectedTime,
          );
          if (record) {
            currentResults.push(calculateResult(record));
          }
        });

        if (currentResults.length > 0) {
          setResults(currentResults);
          setScreen("result");
        }
      }
    }, 40);
  }, [data, selectedTime]);

  useEffect(() => {
    return () => {
      if (measureIntervalRef.current) clearInterval(measureIntervalRef.current);
    };
  }, []);

  const handleScannerPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setDragInfo({
      isDragging: true,
      x: e.clientX,
      y: e.clientY,
      isTouch: e.nativeEvent instanceof TouchEvent
    });
  };

  useEffect(() => {
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!dragInfo.isDragging) return;

      let clientX, clientY;
      if ("touches" in e) {
        // Prevent scroll on mobile during drag
        if (e.cancelable) e.preventDefault();
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      setDragInfo(prev => ({ ...prev, x: clientX, y: clientY }));

      // Target detection during drag for feedback
      const dragOverlay = document.getElementById("scanner-overlay");
      if (dragOverlay) dragOverlay.style.visibility = "hidden";
      const target = document.elementFromPoint(clientX, clientY);
      if (dragOverlay) dragOverlay.style.visibility = "visible";

      const dropZone = target?.closest("[data-dropzone-city]");
      setActiveDropZone(dropZone ? dropZone.getAttribute("data-dropzone-city") : null);
    };

    const handlePointerUp = (e: MouseEvent | TouchEvent) => {
      if (!dragInfo.isDragging) return;

      let clientX, clientY;
      if ("touches" in e) {
        clientX = (e as TouchEvent).changedTouches[0].clientX;
        clientY = (e as TouchEvent).changedTouches[0].clientY;
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      const dragOverlay = document.getElementById("scanner-overlay");
      if (dragOverlay) dragOverlay.style.visibility = "hidden";
      const target = document.elementFromPoint(clientX, clientY);
      if (dragOverlay) dragOverlay.style.visibility = "visible";

      const dropZone = target?.closest("[data-dropzone-city]");
      if (dropZone) {
        const cityName = dropZone.getAttribute("data-dropzone-city");
        if (cityName && !revealedCities.includes(cityName)) {
          setRevealedCities(prev => [...prev, cityName]);
        }
      }

      setDragInfo({ isDragging: false, x: 0, y: 0, isTouch: false });
      setActiveDropZone(null);
    };

    if (dragInfo.isDragging) {
      window.addEventListener("mousemove", handlePointerMove);
      window.addEventListener("touchmove", handlePointerMove, { passive: false });
      window.addEventListener("mouseup", handlePointerUp);
      window.addEventListener("touchend", handlePointerUp);
    }

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [dragInfo.isDragging, revealedCities]);

  // ─── Sub-renders for Left Panel ──────────────────────────────────────────

  const renderLeftPanel = () => {
    if (loading) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      );
    }

    if (screen === "start") {
      return (
        <div className="flex flex-col h-full space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-800 flex items-center gap-2">
              <WindIcon className="w-6 h-6 md:w-8 md:h-8 text-primary" /> Virtual Lab
            </h1>
            <button
              onClick={onBack}
              className="text-xs font-semibold px-2 py-1 border rounded hover:bg-slate-50 transition-colors"
            >
              ← Kembali
            </button>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-primary p-4 rounded-r-xl">
            <h3 className="font-bold text-primary mb-1">Misi Pengukuran</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Anda akan melakukan pemantauan kualitas udara secara serentak di 3 lokasi berbeda di Indonesia untuk membandingkan kondisi lingkungan yang berbeda.
            </p>
          </div>

          <div className="flex-1 space-y-4">
            <h4 className="font-bold text-slate-700">Lokasi Pemantauan:</h4>
            <div className="space-y-3">
              {LOCATIONS.map((loc) => (
                <div
                  key={loc}
                  className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-100 bg-white shadow-sm"
                >
                  <MapPinIcon className="w-6 h-6 text-primary" />
                  <div>
                    <span className="font-bold text-slate-700 block">{loc}</span>
                    <span className="text-xs text-slate-500">
                      {loc === "Tasikmalaya" ? "Jawa Barat (Kaki Gunung)" : 
                       loc === "Solo" ? "Jawa Tengah (Pusat Kota)" : 
                       "Kalimantan Timur (Area Hutan)"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6">
            <button
              onClick={() => setScreen("time")}
              className="w-full py-4 rounded-xl font-bold tracking-wide shadow-lg transition-all bg-primary text-white hover:shadow-xl active:scale-95"
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
            onClick={() => setScreen("start")}
            className="self-start text-sm text-primary font-medium hover:underline flex items-center gap-1"
          >
            ← Kembali ke Info
          </button>

          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-800">
              Pilih Waktu Pengukuran
            </h2>
            <p className="text-slate-500 mt-1">
              Pengukuran akan dilakukan secara serentak pada waktu yang Anda pilih.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 flex-1 content-start overflow-y-auto pr-2">
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
              Anda akan mengaktifkan sensor di 3 lokasi pemantauan pada:
            </p>
          </div>

          <div className="bg-slate-100 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-slate-500 text-sm">Lokasi (3)</span>
              <span className="font-bold text-slate-800 text-right">
                Tasikmalaya, Solo,<br />Kutai Barat
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
              className="w-full bg-primary text-white mb-4 py-4 rounded-xl font-bold tracking-wide shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              Mulai Pengukuran Serentak
            </button>
          </div>
        </div>
      );
    }

    if (screen === "measuring") {
      return null;
    }

    if (screen === "result" && results.length > 0) {
      return (
        <div className="flex flex-col h-full space-y-4 overflow-hidden max-w-5xl mx-auto w-full relative">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-2xl font-serif font-bold text-slate-800">
                Hasil Pengukuran
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Data real-time jam {results[0].record.jam}
              </p>
            </div>
            <div className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-full border border-blue-100 shadow-sm animate-pulse">
              {revealedCities.length}/{LOCATIONS.length} Lokasi Teranalisis
            </div>
          </div>

          {/* Rak Alat Analisis */}
          <div className="bg-slate-50 rounded-2xl border-2 border-slate-200 p-4 shadow-inner">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-sm md:text-base font-bold text-primary flex items-center gap-2 justify-center md:justify-start">
                  <span className="p-1 bg-primary/10 rounded-lg">🛠️</span> Rak Alat Analisis
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Sentuh & tarik <b>AeroScan Tool</b> ke kotak hasil setiap kota untuk menganalisis kategori kualitas udara (ISPU).
                </p>
              </div>

              <div className="shrink-0 flex flex-col items-center gap-1 group">
                <div
                  onPointerDown={handleScannerPointerDown}
                  className="w-16 h-16 flex items-center justify-center bg-white rounded-2xl border-2 border-blue-400 shadow-sm cursor-grab active:cursor-grabbing transition-all hover:scale-110 hover:shadow-md group-hover:border-blue-500 touch-none"
                >
                  <AeroScannerIcon className="w-10 h-10" />
                </div>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">AeroScan Tool</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
              {results.map((res, idx) => {
                const isRevealed = revealedCities.includes(res.record.kota);
                const isHovered = activeDropZone === res.record.kota;
                return (
                  <div
                    key={res.record.kota}
                    data-dropzone-city={res.record.kota}
                    className={`space-y-4 rounded-2xl p-1 transition-all duration-300 border-2 ${
                      isRevealed 
                        ? "border-transparent" 
                        : isHovered
                          ? "border-blue-500 bg-blue-50 shadow-lg scale-[1.02]"
                          : "border-dashed border-slate-300 bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 border-b pb-2 px-2">
                      <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg">{res.record.kota}</h3>
                    </div>

                    {isRevealed ? (
                      <div
                        className={`p-4 rounded-xl text-white shadow-lg animate-in zoom-in-95 duration-500 ${getCategoryBgClass(res.overallCategory)}`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm opacity-90 font-medium">Kategori ISPU</p>
                          <span className="text-2xl font-black">{res.overallMax}</span>
                        </div>
                        <h3 className="text-xl font-bold">{res.overallCategory}</h3>
                      </div>
                    ) : (
                      <div className={`h-[84px] rounded-xl flex flex-col items-center justify-center border-2 border-white transition-colors gap-1 italic text-sm ${isHovered ? "bg-blue-100 text-blue-600" : "bg-slate-200/50 text-slate-400"}`}>
                         <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center opacity-50 ${isHovered ? "border-blue-400 animate-pulse" : "border-slate-300"}`}>?</div>
                         {isHovered ? "Ready to Scan" : "Drop Scanner Here"}
                      </div>
                    )}

                    <div className="bg-white border rounded-xl overflow-hidden text-sm shadow-sm">
                      <table className="w-full">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            <th className="p-3 text-left">Parameter</th>
                            <th className="p-3 text-center">Nilai</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {PARAMETERS.map((param) => {
                            const cat = res.categories[param.key];
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
                                    {isRevealed && cat.category !== "-" && (
                                      <span
                                        className={`text-[10px] px-1.5 py-0.5 rounded animate-in fade-in slide-in-from-top-1 ${getCategoryTextClass(cat.category)}`}
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
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t bg-white sticky bottom-0">
            <button
              onClick={() => {
                setScreen("start");
                setResults([]);
                setSelectedTime(null);
                setRevealedCities([]);
              }}
              className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors active:scale-95"
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
    <div className="flex flex-col md:flex-row w-full h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Visual Stage: Top on mobile, right on desktop */}
      <div
        className={`flex-none transition-all duration-500 relative bg-[#E0F6FF] overflow-hidden order-1 md:order-2
        ${(screen === "time" || screen === "confirm") ? "h-0 md:h-full md:flex-1" : "h-[45vh] min-h-[350px] md:h-full md:flex-1"}
        ${screen === "measuring" ? "h-full md:h-full md:flex-1" : ""}
        ${screen === "result" ? "hidden" : ""}
      `}
      >
        {/* Background Visuals for selection phases */}
        {(screen === "start" || screen === "time" || screen === "confirm") && (
          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-4xl text-center">
              <h2 className="text-xl md:text-3xl font-serif text-sky-800 opacity-60 mb-4 md:mb-8">
                Jaringan Pemantauan Kualitas Udara
              </h2>
              <IndonesiaMap isMonitoring={screen === "confirm"} />
            </div>
          </div>
        )}

        {/* Measuring/Result visuals - 3 split screen */}
        {(screen === "measuring" || screen === "result") && (
          <div className="flex flex-col md:flex-row h-full w-full">
            {LOCATIONS.map((loc, idx) => (
              <div
                key={loc}
                className={`relative flex-1 border-slate-300/30 ${idx !== 2 ? "border-b md:border-b-0 md:border-r" : ""}`}
              >
                <div className="absolute inset-0 transition-opacity duration-1000 opacity-100">
                  <EnvironmentVisual location={loc} />
                  <div className="absolute inset-0 bg-black/10" />

                  {/* Location Label */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur shadow-sm rounded-full text-xs font-bold text-slate-700">
                      {loc}
                    </span>
                  </div>

                  {/* Device/Measurement UI for this location */}
                  <div className="absolute inset-x-0 bottom-4 flex justify-center items-end px-4">
                    <div className="w-full max-w-[180px] md:max-w-[240px]">
                      <DeviceSVG
                        progress={measureProgress}
                        status={measureStatus}
                        result={results[idx] || null}
                        compact={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Left Panel: Controls */}
      <div
        className={`flex-1 md:w-100 lg:w-112.5 md:shrink-0 bg-white border-t md:border-t-0 md:border-r border-slate-200 p-6 md:p-8 flex flex-col z-10 shadow-[0_-4px_24px_rgba(0,0,0,0.05)] md:shadow-[4px_0_24px_rgba(0,0,0,0.05)] overflow-y-auto relative order-2 md:order-1
        ${screen === "measuring" ? "hidden" : "flex"}
      `}
      >
        {renderLeftPanel()}
      </div>

      {/* Drag Overlay for Scanner */}
      {dragInfo.isDragging && (
        <div
          id="scanner-overlay"
          className="fixed pointer-events-none z-[100] transform -translate-x-1/2 drop-shadow-2xl scale-125"
          style={{ 
            left: dragInfo.x, 
            top: dragInfo.y - (dragInfo.isTouch ? 60 : 0),
            marginTop: dragInfo.isTouch ? '-20px' : '0px'
          }}
        >
          <div className="bg-white p-3 rounded-full border-4 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]">
            <AeroScannerIcon className="w-12 h-12" />
          </div>
          {dragInfo.isTouch && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-blue-600 text-white text-[8px] font-bold rounded uppercase whitespace-nowrap shadow-md">
              Scanning Mode
            </div>
          )}
        </div>
      )}
    </div>
  );
}
