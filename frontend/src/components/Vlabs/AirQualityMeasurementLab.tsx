import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import IndonesiaMapSVG from "../../assets/air_labs/indonesian_map.svg";

// ─── Types ─────────────────────────────────────────────────────────────────

type Screen = "start" | "time" | "confirm" | "activation" | "measuring" | "result";

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
  powerState = "ready",
  onPowerClick,
}: {
  progress?: number;
  status?: string;
  result?: MeasurementResult | null;
  compact?: boolean;
  powerState?: "off" | "booting" | "ready";
  onPowerClick?: () => void;
}) => {
  const getIndicatorX = (category: ISPUCategory | string) => {
    switch (category) {
      case "Baik":
        return 55;
      case "Sedang":
        return 85;
      case "Tidak Sehat":
        return 115;
      case "Sangat Tidak Sehat":
        return 145;
      case "Berbahaya":
        return 175;
      default:
        return 55;
    }
  };

  return (
    <svg
      viewBox="0 0 300 400"
      className={`w-full h-auto drop-shadow-2xl mx-auto transition-all duration-300 ${compact ? "max-w-[180px]" : "max-w-[280px] sm:max-w-[320px]"}`}
    >
      {/* Device Body */}
      {/* Back shadow */}
      <rect
        x="25"
        y="25"
        width="260"
        height="360"
        rx="15"
        fill="#94a3b8"
        opacity="0.3"
      />
      {/* Main casing */}
      <rect
        x="15"
        y="15"
        width="260"
        height="360"
        rx="15"
        fill="#ffffff"
        stroke="#e2e8f0"
        strokeWidth="2"
      />

      {/* Right side shading to give 3D edge effect */}
      <path d="M 230 15 L 230 375" stroke="#e2e8f0" strokeWidth="1" />
      <path
        d="M 230 15 L 260 15 Q 275 15 275 30 L 275 360 Q 275 375 260 375 L 230 375 Z"
        fill="#f1f5f9"
      />

      {/* Vents and Side Button */}
      <g fill="#cbd5e1">
        <rect
          x="245"
          y="80"
          width="20"
          height="4"
          rx="2"
          transform="rotate(-10 245 80)"
        />
        <rect
          x="245"
          y="95"
          width="20"
          height="4"
          rx="2"
          transform="rotate(-10 245 95)"
        />
        <rect
          x="245"
          y="110"
          width="20"
          height="4"
          rx="2"
          transform="rotate(-10 245 110)"
        />
        <rect
          x="245"
          y="125"
          width="20"
          height="4"
          rx="2"
          transform="rotate(-10 245 125)"
        />
        <rect
          x="245"
          y="140"
          width="20"
          height="4"
          rx="2"
          transform="rotate(-10 245 140)"
        />

        {/* Power Button Area */}
        <g
          className={onPowerClick ? "cursor-pointer" : ""}
          onClick={onPowerClick}
        >
          {/* Transparent hit area for power button - enlarged for touch */}
          <circle cx="255" cy="200" r="25" fill="transparent" />

          <circle
            cx="255"
            cy="200"
            r="10"
            fill="none"
            stroke={powerState !== "off" ? "#10b981" : "#cbd5e1"}
            strokeWidth="2"
            className="transition-colors duration-300"
          />
          <rect
            x="254"
            y="195"
            width="2"
            height="6"
            fill={powerState !== "off" ? "#10b981" : "#cbd5e1"}
            className="transition-colors duration-300"
          />
        </g>

        <rect
          x="245"
          y="260"
          width="20"
          height="4"
          rx="2"
          transform="rotate(-10 245 260)"
        />
        <rect
          x="245"
          y="275"
          width="20"
          height="4"
          rx="2"
          transform="rotate(-10 245 275)"
        />
        <rect
          x="245"
          y="290"
          width="20"
          height="4"
          rx="2"
          transform="rotate(-10 245 290)"
        />
        <rect
          x="245"
          y="305"
          width="20"
          height="4"
          rx="2"
          transform="rotate(-10 245 305)"
        />
      </g>

      {/* Screen Area */}
      <rect x="30" y="30" width="185" height="330" rx="8" fill="#111827" />
      <rect x="32" y="32" width="181" height="326" rx="6" fill="#000000" />

      {/* Top Bar on Screen (only visible when not off) */}
      {powerState !== "off" && (
        <g>
          <path
            d="M 40 45 L 46 51 L 43 54 L 43 36 L 46 39 L 40 45 Z"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <rect
            x="180"
            y="40"
            width="18"
            height="10"
            rx="2"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
          <rect x="199" y="43" width="2" height="4" fill="#ffffff" />
          <rect x="182" y="42" width="14" height="6" fill="#10b981" rx="1" />

          <text
            x="122"
            y="65"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="10"
            fontFamily="sans-serif"
            fontWeight="bold"
            letterSpacing="0.5"
          >
            AIR QUALITY DETECTOR
          </text>
          <rect x="40" y="75" width="165" height="1" fill="#334155" />
        </g>
      )}

      {/* Screen Content */}
      {powerState === "off" ? (
        <g>{/* Black screen content - nothing to show */}</g>
      ) : powerState === "booting" ? (
        <g>
          <text
            x="122"
            y="170"
            textAnchor="middle"
            fill="#10b981"
            fontSize="14"
            fontFamily="monospace"
            fontWeight="bold"
            className="animate-pulse"
          >
            SYSTEM BOOT...
          </text>
          <rect x="50" y="190" width="145" height="4" fill="#1e293b" rx="2" />
          <rect x="50" y="190" width="145" height="4" fill="#10b981" rx="2">
            <animate
              attributeName="width"
              from="0"
              to="145"
              dur="1.5s"
              fill="freeze"
            />
          </rect>
          <text
            x="122"
            y="220"
            textAnchor="middle"
            fill="#475569"
            fontSize="8"
            fontFamily="sans-serif"
          >
            LOADING CALIBRATION
          </text>
        </g>
      ) : progress > 0 && !result ? (
        <g>
          <text
            x="122"
            y="170"
            textAnchor="middle"
            fill="#3b82f6"
            fontSize="16"
            fontFamily="monospace"
            fontWeight="bold"
            className="animate-pulse"
          >
            MENGUKUR...
          </text>
          <text
            x="122"
            y="210"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="32"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {progress}%
          </text>
          {!compact && (
            <text
              x="122"
              y="240"
              textAnchor="middle"
              fill="#9ca3af"
              fontSize="10"
              fontFamily="sans-serif"
            >
              {status}
            </text>
          )}
          {/* Mock Parameters blinking */}
          {PARAMETERS.map((p, i) => (
            <text
              key={p.key}
              x="45"
              y={100 + i * 28}
              fill="#4b5563"
              fontSize="12"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              {p.label}
            </text>
          ))}
        </g>
      ) : !result && progress === 0 ? (
        <g>
          <text
            x="122"
            y="200"
            textAnchor="middle"
            fill="#4b5563"
            fontSize="24"
            fontFamily="monospace"
            fontWeight="bold"
          >
            READY
          </text>
          {PARAMETERS.map((p, i) => (
            <text
              key={p.key}
              x="45"
              y={100 + i * 28}
              fill="#374151"
              fontSize="12"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              {p.label}
            </text>
          ))}
        </g>
      ) : (
        <g>
          {/* Display Results */}
          {PARAMETERS.map((param, i) => {
            const cat = result?.categories[param.key];
            const value =
              cat?.value !== null && cat?.value !== undefined
                ? cat?.value
                : "---";
            const color = cat?.color || "#9ca3af";
            const yPos = 100 + i * 28;
            return (
              <g key={param.key}>
                <text
                  x="45"
                  y={yPos}
                  fill={color}
                  fontSize="14"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {param.label}
                </text>
                <text
                  x="155"
                  y={yPos}
                  fill={color}
                  fontSize="16"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {value}
                </text>
                <text
                  x="160"
                  y={yPos}
                  fill={color}
                  fontSize="9"
                  fontFamily="sans-serif"
                  textAnchor="start"
                >
                  {param.unit === "µg/m³" ? "ug/m³" : param.unit}
                </text>
              </g>
            );
          })}
        </g>
      )}

      {/* Bottom Color Bar (only when ready or result) */}
      {(powerState === "ready" || result) && (
        <g transform="translate(0, 10)">
          <text
            x="55"
            y="325"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="7"
            fontFamily="sans-serif"
          >
            Baik
          </text>
          <text
            x="85"
            y="325"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="7"
            fontFamily="sans-serif"
          >
            Sedang
          </text>
          <text
            x="115"
            y="325"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="7"
            fontFamily="sans-serif"
          >
            T.Sht
          </text>
          <text
            x="145"
            y="325"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="7"
            fontFamily="sans-serif"
          >
            S.T.S
          </text>
          <text
            x="175"
            y="325"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="7"
            fontFamily="sans-serif"
          >
            Bhaya
          </text>

          <rect x="40" y="330" width="30" height="6" fill="#16a34a" />
          <rect x="70" y="330" width="30" height="6" fill="#2563eb" />
          <rect x="100" y="330" width="30" height="6" fill="#eab308" />
          <rect x="130" y="330" width="30" height="6" fill="#dc2626" />
          <rect x="160" y="330" width="30" height="6" fill="#581c87" />

          {result && (
            <polygon
              points={`${getIndicatorX(result.overallCategory) - 4},344 ${getIndicatorX(result.overallCategory)},337 ${getIndicatorX(result.overallCategory) + 4},344`}
              fill="#ffffff"
            />
          )}
        </g>
      )}
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
  const [confirmDevicePower, setConfirmDevicePower] = useState<
    "off" | "booting" | "ready"
  >("off");
  const [dragInfo, setDragInfo] = useState<DragInfo>({
    isDragging: false,
    x: 0,
    y: 0,
    isTouch: false,
  });
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
    const times = data.filter((r) => r.kota === "Solo").map((r) => r.jam);
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

  const handlePowerClick = useCallback(() => {
    if (confirmDevicePower !== "off") return;
    setConfirmDevicePower("booting");
    setTimeout(() => {
      setConfirmDevicePower("ready");
    }, 2000);
  }, [confirmDevicePower]);

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
        LOCATIONS.forEach((loc) => {
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
    }, 120);
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
      isTouch: e.nativeEvent instanceof TouchEvent,
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

      setDragInfo((prev) => ({ ...prev, x: clientX, y: clientY }));

      // Target detection during drag for feedback
      const dragOverlay = document.getElementById("scanner-overlay");
      if (dragOverlay) dragOverlay.style.visibility = "hidden";
      const target = document.elementFromPoint(clientX, clientY);
      if (dragOverlay) dragOverlay.style.visibility = "visible";

      const dropZone = target?.closest("[data-dropzone-city]");
      setActiveDropZone(
        dropZone ? dropZone.getAttribute("data-dropzone-city") : null,
      );
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
          setRevealedCities((prev) => [...prev, cityName]);
        }
      }

      setDragInfo({ isDragging: false, x: 0, y: 0, isTouch: false });
      setActiveDropZone(null);
    };

    if (dragInfo.isDragging) {
      window.addEventListener("mousemove", handlePointerMove);
      window.addEventListener("touchmove", handlePointerMove, {
        passive: false,
      });
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
        <div className="flex flex-col min-h-full space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-800 flex items-center gap-2">
              <WindIcon className="w-6 h-6 md:w-8 md:h-8 text-primary" />{" "}
              Virtual Lab
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
              Anda akan melakukan pemantauan kualitas udara secara serentak di 3
              lokasi berbeda di Indonesia untuk membandingkan kondisi lingkungan
              yang berbeda.
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
                    <span className="font-bold text-slate-700 block">
                      {loc}
                    </span>
                    <span className="text-xs text-slate-500">
                      {loc === "Tasikmalaya"
                        ? "Jawa Barat (Kaki Gunung)"
                        : loc === "Solo"
                          ? "Jawa Tengah (Pusat Kota)"
                          : "Kalimantan Timur (Area Hutan)"}
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
        <div className="flex flex-col min-h-full space-y-6">
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
              Pengukuran akan dilakukan secara serentak pada waktu yang Anda
              pilih.
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
        <div className="flex flex-col min-h-full space-y-6">
          <button
            onClick={() => {
              setScreen("time");
              setConfirmDevicePower("off");
            }}
            className="self-start text-sm text-primary font-medium hover:underline flex items-center gap-1"
          >
            ← Kembali Pilih Waktu
          </button>

          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-800">
              Konfirmasi
            </h2>
            <p className="text-slate-500 mt-2">
              Anda akan mengaktifkan sensor di 3 lokasi pemantauan pada:
            </p>
          </div>

          <div className="bg-slate-100 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-slate-500 text-sm">Lokasi (3)</span>
              <span className="font-bold text-slate-800 text-right">
                Tasikmalaya, Solo,
                <br />
                Kutai Barat
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

          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-blue-50/50 rounded-2xl border-2 border-dashed border-blue-100">
             <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-xl">
                   ⚡
                </div>
                <h4 className="font-bold text-slate-700">Siap Aktivasi</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
                  Semua data sudah siap. Langkah selanjutnya adalah menyalakan alat deteksi.
                </p>
             </div>
          </div>

          <div className="mt-auto pt-6">
            <button
              onClick={() => setScreen("activation")}
              className="w-full mb-4 py-4 rounded-xl font-bold tracking-wide shadow-lg transition-all bg-primary text-white hover:shadow-xl active:scale-95"
            >
              Lanjut ke Aktivasi Alat
            </button>
          </div>
        </div>
      );
    }

    if (screen === "activation") {
      return (
        <div className="flex flex-col min-h-full space-y-6">
          <button
            onClick={() => setScreen("confirm")}
            className="self-start text-sm text-primary font-medium hover:underline flex items-center gap-1"
          >
            ← Kembali ke Konfirmasi
          </button>

          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-800">
              Aktivasi Alat
            </h2>
            <p className="text-slate-500 mt-2">
              Nyalakan alat untuk mulai memantau kualitas udara di lokasi.
            </p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 relative">
            <div className="absolute top-2 right-3">
              <div
                className={`w-2 h-2 rounded-full ${confirmDevicePower === "ready" ? "bg-green-500 animate-pulse" : "bg-slate-300"}`}
              />
            </div>

            <div className="w-full mb-6">
              <DeviceSVG
                compact={false}
                powerState={confirmDevicePower}
                onPowerClick={handlePowerClick}
              />
            </div>

            <div className="text-center">
              <h4 className="font-bold text-slate-700 text-lg">
                {confirmDevicePower === "off"
                  ? "Alat Belum Aktif"
                  : confirmDevicePower === "booting"
                    ? "Menginisialisasi..."
                    : "Sistem Siap"}
              </h4>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-[320px] mx-auto">
                {confirmDevicePower === "off"
                  ? "Sentuh tombol power (bulat) di samping alat untuk menyalakan."
                  : confirmDevicePower === "booting"
                    ? "Menghubungkan ke jaringan stasiun udara di 3 kota..."
                    : "Alat telah terkalibrasi. Tekan tombol di bawah untuk mulai."}
              </p>
            </div>
          </div>

          <div className="mt-auto pt-6">
            <button
              disabled={confirmDevicePower !== "ready"}
              onClick={startMeasurement}
              className={`w-full mb-4 py-4 rounded-xl font-bold tracking-wide shadow-lg transition-all ${
                confirmDevicePower === "ready"
                  ? "bg-primary text-white hover:shadow-xl active:scale-95"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
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
                  <span className="p-1 bg-primary/10 rounded-lg">🛠️</span> Rak
                  Alat Analisis
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Sentuh & tarik tombol <b>ISPU</b> ke kotak hasil setiap kota
                  untuk menganalisis kategori kualitas udara.
                </p>
              </div>

              <div className="shrink-0 flex flex-col items-center gap-1 group">
                <div
                  onPointerDown={handleScannerPointerDown}
                  className="w-16 h-16 flex items-center justify-center bg-blue-600 text-white rounded-full border-4 border-blue-400 shadow-lg cursor-grab active:cursor-grabbing transition-all hover:scale-110 active:scale-95 touch-none font-black text-lg tracking-tighter"
                >
                  ISPU
                </div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">
                  Scanner
                </span>
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
                      <h3 className="font-bold text-slate-800 text-lg">
                        {res.record.kota}
                      </h3>
                    </div>

                    {isRevealed ? (
                      <div
                        className={`p-4 rounded-xl text-white shadow-lg animate-in zoom-in-95 duration-500 ${getCategoryBgClass(res.overallCategory)}`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm opacity-90 font-medium">
                            Kategori ISPU
                          </p>
                          <span className="text-2xl font-black">
                            {res.overallMax}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold">
                          {res.overallCategory}
                        </h3>
                      </div>
                    ) : (
                      <div
                        className={`h-[84px] rounded-xl flex flex-col items-center justify-center border-2 border-white transition-colors gap-1 italic text-sm ${isHovered ? "bg-blue-100 text-blue-600" : "bg-slate-200/50 text-slate-400"}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center opacity-50 ${isHovered ? "border-blue-400 animate-pulse" : "border-slate-300"}`}
                        >
                          ?
                        </div>
                        {isHovered ? "Ready to Scan" : "Drop Tombol ISPU"}
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
                                    <span>
                                      {cat.value !== null ? cat.value : "-"}
                                    </span>
                                    {isRevealed && cat.category !== "-" && (
                                      <span
                                        className={`text-[10px] px-1.5 py-0.5 rounded animate-in fade-in slide-in-from-top-1 ${getCategoryTextClass(cat.category)}`}
                                        style={{
                                          backgroundColor: cat.color + "20",
                                        }}
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
                setConfirmDevicePower("off");
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
        ${screen === "time" || screen === "confirm" || screen === "activation" ? "h-0 md:h-full md:flex-1" : "h-[45vh] min-h-[350px] md:h-full md:flex-1"}
        ${screen === "measuring" ? "h-full md:h-full md:flex-1" : ""}
        ${screen === "result" ? "hidden" : ""}
      `}
      >
        {/* Background Visuals for selection phases */}
        {(screen === "start" || screen === "time" || screen === "confirm" || screen === "activation") && (
          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-4xl text-center">
              <h2 className="text-xl md:text-3xl font-serif text-sky-800 opacity-60 mb-4 md:mb-8">
                Jaringan Pemantauan Kualitas Udara
              </h2>
              <IndonesiaMap isMonitoring={screen === "activation"} />
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
            marginTop: dragInfo.isTouch ? "-20px" : "0px",
          }}
        >
          <div className="bg-blue-600 text-white p-3 rounded-full border-4 border-blue-400 shadow-[0_0_25px_rgba(37,99,235,0.7)] font-black text-sm tracking-tighter">
            ISPU
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
