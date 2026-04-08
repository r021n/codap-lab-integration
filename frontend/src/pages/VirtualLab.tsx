import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type PointerEvent as ReactPointerEvent,
} from "react";

type PortId = "B" | "C";

type InventoryItem =
  | "thermoA"
  | "thermoB"
  | "stopperA"
  | "stopperB"
  | "stopperC"
  | "plant"
  | "bakingSoda"
  | "vinegar"
  | "cylinder"
  | "sun"
  | "stopwatch";

type DropZone = "flaskA" | "flaskB" | "flaskC" | "scale" | "environment";

type PortCoords = Record<PortId, { x: number; y: number }>;

type LabLog = {
  time: number;
  tempA: string;
  tempB: string;
};

type LabState = {
  flaskA: {
    hasThermo: boolean;
    hasStopper: boolean;
    hasPlant: boolean;
    temp: number;
  };
  flaskB: { hasThermo: boolean; hasStopper: boolean; temp: number };
  flaskC: { hasSoda: boolean; hasVinegar: boolean; hasStopper: boolean };
  scale: { hasCylinder: boolean; sodaAmount: number };
  inventory: Record<InventoryItem, boolean>;
  isSunny: boolean;
  isRunning: boolean;
  time: number;
  logs: LabLog[];
  hoseConnected: boolean;
  duration: number;
};

type DragInfo = {
  isDragging: boolean;
  item: InventoryItem | null;
  x: number;
  y: number;
};

type HoseDrawing = {
  isDrawing: boolean;
  startPort: PortId | null;
  currentX: number;
  currentY: number;
};

type ErlenmeyerProps = {
  label: string;
  hasThermo?: boolean;
  hasStopper?: boolean;
  hasSoda?: boolean;
  hasVinegar?: boolean;
  hasPlant?: boolean;
  isBubbling?: boolean;
};

type GelasUkurProps = {
  sodaAmount: number;
};

type TimbanganProps = {
  value: number;
};

const DEFAULT_DURATION = 5;

const initialState: LabState = {
  flaskA: { hasThermo: false, hasStopper: false, hasPlant: false, temp: 28 },
  flaskB: { hasThermo: false, hasStopper: false, temp: 28 },
  flaskC: { hasSoda: false, hasVinegar: false, hasStopper: false },
  scale: { hasCylinder: false, sodaAmount: 0 },
  inventory: {
    thermoA: true,
    thermoB: true,
    stopperA: true,
    stopperB: true,
    stopperC: true,
    plant: true,
    bakingSoda: true,
    vinegar: true,
    cylinder: true,
    sun: true,
    stopwatch: true,
  },
  isSunny: false,
  isRunning: false,
  time: 0,
  logs: [],
  hoseConnected: false,
  duration: DEFAULT_DURATION,
};

const initialDragInfo: DragInfo = {
  isDragging: false,
  item: null,
  x: 0,
  y: 0,
};

const initialHoseDrawing: HoseDrawing = {
  isDrawing: false,
  startPort: null,
  currentX: 0,
  currentY: 0,
};

const initialPortCoords: PortCoords = {
  B: { x: 0, y: 0 },
  C: { x: 0, y: 0 },
};

const getClientPoint = (
  event: MouseEvent | TouchEvent,
): { x: number; y: number } | null => {
  if ("touches" in event) {
    const touch = event.touches[0] ?? event.changedTouches[0];
    if (!touch) {
      return null;
    }
    return { x: touch.clientX, y: touch.clientY };
  }

  return { x: event.clientX, y: event.clientY };
};

// --- SVGs Komponen Praktikum ---

const ErlenmeyerSVG = ({
  label,
  hasThermo,
  hasStopper,
  hasSoda,
  hasVinegar,
  hasPlant,
  isBubbling,
}: ErlenmeyerProps) => (
  <svg viewBox="0 0 120 160" className="w-full h-full drop-shadow-md">
    {/* Gabus / Stopper */}
    {hasStopper && (
      <path
        d="M 50 22 L 70 22 L 68 35 L 52 35 Z"
        fill="#8B4513"
        stroke="#5c2e0b"
        strokeWidth="2"
      />
    )}

    {/* Termometer */}
    {hasThermo && (
      <g>
        <line
          x1="60"
          y1="-10"
          x2="60"
          y2="100"
          stroke="#d1d5db"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <line
          x1="60"
          y1="20"
          x2="60"
          y2="90"
          stroke="#ef4444"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="60" cy="100" r="8" fill="#ef4444" />
      </g>
    )}

    {/* Leher Tabung (tanpa kuping/pegangan) */}
    <path
      d="M 50 25 L 50 55 L 15 135 A 10 10 0 0 0 25 145 L 95 145 A 10 10 0 0 0 105 135 L 70 55 L 70 25 Z"
      fill="rgba(255, 255, 255, 0.5)"
      stroke="#475569"
      strokeWidth="2.5"
    />

    {/* Mulut tabung */}
    <line
      x1="48"
      y1="25"
      x2="72"
      y2="25"
      stroke="#475569"
      strokeWidth="3"
      strokeLinecap="round"
    />

    {/* Label */}
    <rect
      x="50"
      y="70"
      width="20"
      height="20"
      fill="white"
      stroke="#64748b"
      rx="2"
    />
    <text
      x="60"
      y="84"
      fontSize="12"
      textAnchor="middle"
      fontWeight="bold"
      fill="#1e293b"
    >
      {label}
    </text>

    {/* Isi Tabung: Tanaman */}
    {hasPlant && (
      <g transform="translate(60, 140)">
        <path d="M 0 0 Q -10 -20 -5 -40 Q 5 -20 0 0" fill="#22c55e" />
        <path d="M 0 0 Q 15 -15 20 -30 Q 5 -10 0 0" fill="#16a34a" />
        <path d="M 0 0 Q -20 -10 -25 -25 Q -10 -5 0 0" fill="#15803d" />
      </g>
    )}

    {/* Isi Tabung: Baking Soda */}
    {hasSoda && (
      <path d="M 20 140 Q 60 120 100 140 L 95 145 L 25 145 Z" fill="#f8fafc" />
    )}

    {/* Isi Tabung: Cuka & Reaksi */}
    {hasVinegar && (
      <g>
        <path
          d="M 30 110 Q 60 105 90 110 L 100 135 L 20 135 Z"
          fill="rgba(191, 219, 254, 0.7)"
        />
        {isBubbling && (
          <g>
            <circle
              cx="40"
              cy="120"
              r="3"
              fill="white"
              className="animate-bounce"
            />
            <circle
              cx="60"
              cy="115"
              r="4"
              fill="white"
              className="animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <circle
              cx="80"
              cy="125"
              r="2"
              fill="white"
              className="animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
            <circle
              cx="50"
              cy="90"
              r="3"
              fill="white"
              className="animate-pulse"
            />
            <circle
              cx="70"
              cy="70"
              r="4"
              fill="white"
              className="animate-pulse"
              style={{ animationDelay: "0.3s" }}
            />
            <text
              x="60"
              y="60"
              fontSize="12"
              fill="#94a3b8"
              textAnchor="middle"
              className="animate-pulse"
            >
              CO₂
            </text>
          </g>
        )}
      </g>
    )}
  </svg>
);

const SunSVG = () => (
  <svg width="70" height="70" viewBox="0 0 100 100">
    {/* Lingkaran cahaya luar */}
    <circle cx="50" cy="50" r="35" fill="#fde68a" opacity="0.3" />
    {/* Badan matahari */}
    <circle cx="50" cy="50" r="22" fill="#fbbf24" />
    <circle cx="50" cy="50" r="18" fill="#fcd34d" />
    {/* Highlight */}
    <circle cx="43" cy="43" r="6" fill="#fef3c7" opacity="0.7" />
    {/* Sinar matahari (garis pendek memancar) */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
      const rad = (angle * Math.PI) / 180;
      const x1 = 50 + Math.cos(rad) * 28;
      const y1 = 50 + Math.sin(rad) * 28;
      const x2 = 50 + Math.cos(rad) * 40;
      const y2 = 50 + Math.sin(rad) * 40;
      return (
        <line
          key={angle}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#f59e0b"
          strokeWidth="4"
          strokeLinecap="round"
        />
      );
    })}
  </svg>
);

const GelasUkurSVG = ({ sodaAmount }: GelasUkurProps) => (
  <svg viewBox="0 0 60 120" className="w-full h-full drop-shadow-md">
    {/* Skala */}
    <line x1="15" y1="20" x2="25" y2="20" stroke="#94a3b8" strokeWidth="1" />
    <text x="28" y="24" fontSize="8" fill="#64748b">
      50
    </text>
    <line x1="15" y1="50" x2="25" y2="50" stroke="#94a3b8" strokeWidth="1" />
    <text x="28" y="54" fontSize="8" fill="#64748b">
      30
    </text>
    <line x1="15" y1="80" x2="25" y2="80" stroke="#94a3b8" strokeWidth="1" />
    <text x="28" y="84" fontSize="8" fill="#64748b">
      10
    </text>

    {/* Isi Soda */}
    {sodaAmount > 0 && (
      <rect
        x="16"
        y={110 - sodaAmount * 3}
        width="28"
        height={sodaAmount * 3}
        fill="#f8fafc"
      />
    )}

    {/* Badan */}
    <path
      d="M 15 10 L 45 10 L 45 110 A 5 5 0 0 1 40 115 L 20 115 A 5 5 0 0 1 15 110 Z"
      fill="rgba(255,255,255,0.4)"
      stroke="#475569"
      strokeWidth="2"
    />
    <path d="M 10 115 L 50 115 L 50 120 L 10 120 Z" fill="#475569" />
  </svg>
);

const TimbanganSVG = ({ value }: TimbanganProps) => (
  <svg viewBox="0 0 100 60" className="w-full h-full drop-shadow-md">
    <path
      d="M 10 20 L 90 20 L 100 50 L 0 50 Z"
      fill="#cbd5e1"
      stroke="#94a3b8"
      strokeWidth="2"
    />
    <rect x="30" y="25" width="40" height="15" fill="#0f172a" rx="2" />
    <text
      x="50"
      y="36"
      fontSize="10"
      fill="#22c55e"
      textAnchor="middle"
      fontFamily="monospace"
      fontWeight="bold"
    >
      {value.toFixed(1)} g
    </text>
    <path
      d="M 20 20 L 80 20 L 80 15 L 20 15 Z"
      fill="#e2e8f0"
      stroke="#94a3b8"
      strokeWidth="1"
    />
  </svg>
);

// --- Komponen Utama Aplikasi ---

export default function App() {
  const [state, setState] = useState<LabState>(initialState);
  const [dragInfo, setDragInfo] = useState<DragInfo>(initialDragInfo);
  const [activeDropZone, setActiveDropZone] = useState<DropZone | null>(null);
  const [durationInput, setDurationInput] = useState<string>(
    String(DEFAULT_DURATION),
  );

  const [hoseDrawing, setHoseDrawing] =
    useState<HoseDrawing>(initialHoseDrawing);
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const portBRef = useRef<HTMLDivElement | null>(null);
  const portCRef = useRef<HTMLDivElement | null>(null);
  const [portCoords, setPortCoords] = useState<PortCoords>(initialPortCoords);

  const updatePortCoords = useCallback(() => {
    if (!workspaceRef.current || !portBRef.current || !portCRef.current) return;
    const workspaceRect = workspaceRef.current.getBoundingClientRect();
    const rectB = portBRef.current.getBoundingClientRect();
    const rectC = portCRef.current.getBoundingClientRect();

    setPortCoords({
      B: {
        x: rectB.left - workspaceRect.left + rectB.width / 2,
        y: rectB.top - workspaceRect.top + rectB.height / 2,
      },
      C: {
        x: rectC.left - workspaceRect.left + rectC.width / 2,
        y: rectC.top - workspaceRect.top + rectC.height / 2,
      },
    });
  }, []);

  useEffect(() => {
    window.addEventListener("resize", updatePortCoords);
    setTimeout(updatePortCoords, 100);
    return () => window.removeEventListener("resize", updatePortCoords);
  }, [updatePortCoords, state.isSunny]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (state.isRunning && state.time < state.duration) {
      interval = setInterval(() => {
        setState((prev) => {
          const newTime = prev.time + 1;
          const newTempA = prev.flaskA.temp + 1.0;
          const newTempB = prev.flaskB.temp + (prev.hoseConnected ? 2.5 : 1.0);

          const newLogs = [
            ...prev.logs,
            {
              time: newTime,
              tempA: newTempA.toFixed(1),
              tempB: newTempB.toFixed(1),
            },
          ];
          return {
            ...prev,
            time: newTime,
            flaskA: { ...prev.flaskA, temp: newTempA },
            flaskB: { ...prev.flaskB, temp: newTempB },
            logs: newLogs,
            isRunning: newTime < prev.duration,
          };
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [state.isRunning, state.time, state.hoseConnected, state.duration]);

  const isSetupComplete = useCallback((s: LabState) => {
    return (
      s.flaskA.hasThermo &&
      s.flaskA.hasStopper &&
      s.flaskB.hasThermo &&
      s.flaskB.hasStopper &&
      s.hoseConnected &&
      s.flaskC.hasSoda &&
      s.flaskC.hasVinegar &&
      s.flaskC.hasStopper
    );
  }, []);

  const handleReset = useCallback(() => {
    setState({ ...initialState, duration: state.duration });
    setDragInfo(initialDragInfo);
    setActiveDropZone(null);
    setHoseDrawing(initialHoseDrawing);
    setPortCoords(initialPortCoords);
  }, [state.duration]);

  const handleDurationChange = useCallback((value: string) => {
    setDurationInput(value);
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 5) {
      setState((prev) => ({ ...prev, duration: num }));
    }
  }, []);

  const handleDurationBlur = useCallback(() => {
    const num = parseInt(durationInput, 10);
    if (isNaN(num) || num < 5) {
      setDurationInput("5");
      setState((prev) => ({ ...prev, duration: 5 }));
    }
  }, [durationInput]);

  const processAction = useCallback(
    (item: InventoryItem, zone: DropZone) => {
      setState((prev) => {
        const newState: LabState = {
          ...prev,
          flaskA: { ...prev.flaskA },
          flaskB: { ...prev.flaskB },
          flaskC: { ...prev.flaskC },
          scale: { ...prev.scale },
          inventory: { ...prev.inventory },
          logs: [...prev.logs],
        };
        const inv = newState.inventory;

        if (zone === "flaskA") {
          if (item === "thermoA" && !newState.flaskA.hasThermo) {
            newState.flaskA.hasThermo = true;
            inv.thermoA = false;
          }
          if (item === "stopperA" && !newState.flaskA.hasStopper) {
            newState.flaskA.hasStopper = true;
            inv.stopperA = false;
          }
          if (item === "plant" && !newState.flaskA.hasPlant) {
            newState.flaskA.hasPlant = true;
            inv.plant = false;
          }
        }

        if (zone === "flaskB") {
          if (item === "thermoB" && !newState.flaskB.hasThermo) {
            newState.flaskB.hasThermo = true;
            inv.thermoB = false;
          }
          if (item === "stopperB" && !newState.flaskB.hasStopper) {
            newState.flaskB.hasStopper = true;
            inv.stopperB = false;
          }
        }

        if (zone === "scale") {
          if (item === "cylinder" && !newState.scale.hasCylinder) {
            newState.scale.hasCylinder = true;
            inv.cylinder = false;
          }
          // Baking soda bisa di-drop ke timbangan (yang sudah ada gelas ukur)
          if (item === "bakingSoda" && newState.scale.hasCylinder) {
            newState.scale.sodaAmount = 10;
          }
        }

        if (zone === "flaskC") {
          if (item === "cylinder" && newState.scale.sodaAmount > 0) {
            newState.flaskC.hasSoda = true;
            newState.scale.sodaAmount = 0;
            inv.cylinder = true;
            newState.scale.hasCylinder = false;
          }
          if (item === "vinegar") {
            newState.flaskC.hasVinegar = true;
          }
          if (item === "stopperC" && !newState.flaskC.hasStopper) {
            newState.flaskC.hasStopper = true;
            inv.stopperC = false;
          }
        }

        if (zone === "environment") {
          if (item === "sun" && isSetupComplete(newState)) {
            newState.isSunny = true;
            inv.sun = false;
          }
          if (item === "stopwatch" && newState.isSunny) {
            newState.isRunning = true;
            inv.stopwatch = false;
          }
        }

        return newState;
      });
    },
    [isSetupComplete],
  );

  const handleItemPointerDown = (
    e: ReactPointerEvent<HTMLDivElement>,
    item: InventoryItem,
  ) => {
    e.preventDefault();
    setDragInfo({
      isDragging: true,
      item,
      x: e.clientX,
      y: e.clientY,
    });
  };

  useEffect(() => {
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const point = getClientPoint(e);
      if (!point) {
        return;
      }
      const { x: clientX, y: clientY } = point;

      if (dragInfo.isDragging) {
        setDragInfo((prev) => ({ ...prev, x: clientX, y: clientY }));

        const dragOverlay = document.getElementById("drag-overlay");
        if (dragOverlay) dragOverlay.style.visibility = "hidden";

        const element = document.elementFromPoint(clientX, clientY);
        const dropZone = element?.closest("[data-dropzone]");
        setActiveDropZone(
          dropZone
            ? (dropZone.getAttribute("data-dropzone") as DropZone)
            : null,
        );

        if (dragOverlay) dragOverlay.style.visibility = "visible";
      }

      if (hoseDrawing.isDrawing && workspaceRef.current) {
        const workspaceRect = workspaceRef.current.getBoundingClientRect();
        setHoseDrawing((prev) => ({
          ...prev,
          currentX: clientX - workspaceRect.left,
          currentY: clientY - workspaceRect.top,
        }));
      }
    };

    const handlePointerUp = (e: MouseEvent | TouchEvent) => {
      if (dragInfo.isDragging) {
        const point = getClientPoint(e);
        if (!point) {
          return;
        }
        const { x: clientX, y: clientY } = point;

        const dragOverlay = document.getElementById("drag-overlay");
        if (dragOverlay) dragOverlay.style.visibility = "hidden";

        const element = document.elementFromPoint(clientX, clientY);
        const dropZoneEl = element?.closest("[data-dropzone]");
        const targetZone = dropZoneEl?.getAttribute(
          "data-dropzone",
        ) as DropZone | null;

        if (dragOverlay) dragOverlay.style.visibility = "visible";

        if (targetZone && dragInfo.item) {
          processAction(dragInfo.item, targetZone);
        }

        setDragInfo(initialDragInfo);
        setActiveDropZone(null);
      }

      // Logika Penutup untuk Drag-and-Drop Selang
      if (hoseDrawing.isDrawing) {
        const point = getClientPoint(e);
        if (!point) {
          return;
        }
        const { x: clientX, y: clientY } = point;

        const hoseOverlay = document.getElementById("hose-overlay");
        if (hoseOverlay) hoseOverlay.style.visibility = "hidden";

        const element = document.elementFromPoint(clientX, clientY);
        const portEl = element?.closest("[data-port]");
        const targetPort = portEl?.getAttribute("data-port");

        if (hoseOverlay) hoseOverlay.style.visibility = "visible";

        // Jika drag tepat ke port lain -> Hubungkan!
        if (targetPort && targetPort !== hoseDrawing.startPort) {
          setState((prev) => ({ ...prev, hoseConnected: true }));
          setHoseDrawing(initialHoseDrawing);
          setTimeout(updatePortCoords, 50);
        }
        // Jika lepas jari di ruang kosong tapi cukup jauh dari awal (Batal Dragging)
        else if (!targetPort) {
          const startX = hoseDrawing.startPort
            ? portCoords[hoseDrawing.startPort].x
            : 0;
          const startY = hoseDrawing.startPort
            ? portCoords[hoseDrawing.startPort].y
            : 0;
          const dist = Math.hypot(
            hoseDrawing.currentX - startX,
            hoseDrawing.currentY - startY,
          );
          if (dist > 30) {
            setHoseDrawing(initialHoseDrawing);
          }
        }
        // Jika hanya menekan lalu lepas (dist < 30), maka biarkan isDrawing = true (transisi ke Mode Klik-ke-Klik)
      }
    };

    if (dragInfo.isDragging || hoseDrawing.isDrawing) {
      window.addEventListener("mousemove", handlePointerMove, {
        passive: false,
      });
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
  }, [
    dragInfo.isDragging,
    hoseDrawing.isDrawing,
    dragInfo.item,
    hoseDrawing.startPort,
    hoseDrawing.currentX,
    hoseDrawing.currentY,
    updatePortCoords,
    portCoords,
    processAction,
  ]);

  const handlePortPointerDown = (
    e: ReactPointerEvent<HTMLDivElement>,
    portId: PortId,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (state.hoseConnected) return;

    // Perbaikan Bug Selang: Mode Klik-ke-Klik (Jika selang sudah mulai ditarik dan kita klik port lain)
    if (hoseDrawing.isDrawing && hoseDrawing.startPort) {
      if (hoseDrawing.startPort !== portId) {
        setState((prev) => ({ ...prev, hoseConnected: true }));
        setHoseDrawing(initialHoseDrawing);
        setTimeout(updatePortCoords, 50);
      } else {
        // Klik port yang sama = batal
        setHoseDrawing(initialHoseDrawing);
      }
      return;
    }

    // Mulai menggambar selang
    const clientX = e.clientX;
    const clientY = e.clientY;
    if (!workspaceRef.current) {
      return;
    }
    const workspaceRect = workspaceRef.current.getBoundingClientRect();

    setHoseDrawing({
      isDrawing: true,
      startPort: portId,
      currentX: clientX - workspaceRect.left,
      currentY: clientY - workspaceRect.top,
    });
  };

  const isLabFinished = state.time >= state.duration && state.time > 0;

  const getInstruction = () => {
    if (!state.flaskA.hasThermo || !state.flaskA.hasStopper)
      return "1. Tarik Termometer A dan Gabus A ke Tabung A. (Opsional: Masukkan Tanaman)";
    if (!state.flaskB.hasThermo || !state.flaskB.hasStopper)
      return "2. Tarik Termometer B dan Gabus B ke Tabung B.";

    if (!state.flaskC.hasSoda) {
      if (!state.scale.hasCylinder)
        return "3. Tarik Gelas Ukur ke atas Timbangan.";
      if (state.scale.sodaAmount === 0)
        return "4. Tarik Baking Soda ke Timbangan atau Gelas Ukur untuk menimbang 10g.";
      return "5. Tarik Gelas Ukur (yang berisi soda) ke Tabung C untuk menuangkannya.";
    }

    if (!state.flaskC.hasVinegar)
      return "6. Tarik Asam Cuka ke Tabung C untuk bereaksi.";
    if (!state.flaskC.hasStopper) return "7. Tutup Tabung C dengan Gabus C.";
    if (!state.hoseConnected)
      return "8. Hubungkan selang: Tekan titik Tabung B, lalu tekan titik Tabung C.";
    if (!state.isSunny)
      return "9. Tarik Matahari ke area kosong untuk memindahkan set alat ke luar ruangan.";
    if (!state.isRunning && state.time === 0)
      return "10. Tarik Stopwatch ke area kerja untuk mulai mengamati suhu!";
    if (state.time < state.duration)
      return "Mengamati... (Perhatikan suhu di Tabung B naik lebih cepat karena CO2 dari Tabung C)";
    return "Praktikum Selesai! Gas CO2 (Efek Rumah Kaca) memerangkap panas lebih banyak.";
  };

  const renderInvItem = (
    id: InventoryItem,
    emoji: string,
    label: string,
    extraClass = "",
  ) => (
    <div
      key={id}
      onPointerDown={(e) => handleItemPointerDown(e, id)}
      className={`touch-none cursor-grab flex flex-col items-center justify-center p-2 rounded-lg border-2 ${extraClass} 
        ${dragInfo.item === id ? "opacity-50 border-dashed border-primary" : "bg-background border-border/20 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] hover:bg-primary/5 hover:border-primary/50 active:scale-95"}`}
    >
      <span className="text-2xl sm:text-3xl pointer-events-none select-none">
        {emoji}
      </span>
      <span className="text-[10px] sm:text-xs text-center mt-1 text-foreground font-semibold pointer-events-none select-none leading-tight">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      {/* PANEL KIRI: INVENTORY — tinggi = 100vh */}
      <div className="w-full md:w-1/4 lg:w-1/5 bg-background border-b md:border-b-0 md:border-r border-border/20 flex flex-col z-20 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] h-1/3 md:h-screen">
        <div className="p-3 border-b border-border/20 bg-background/90 sticky top-0 backdrop-blur-sm z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm md:text-base font-serif font-bold text-primary">
                Rak Alat & Bahan
              </h2>
              <p className="text-[10px] md:text-xs text-muted-foreground">
                Sentuh & tarik ke area praktikum
              </p>
            </div>
            {/* Tombol Reset */}
            <button
              onClick={handleReset}
              className="px-2.5 py-1.5 text-[10px] md:text-xs font-semibold rounded-lg border-2 border-foreground text-foreground hover:bg-foreground hover:text-white active:scale-95 transition-all duration-150"
              title="Reset Lab"
            >
              ↺ Reset
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-3 md:grid-cols-2 gap-2">
            {state.inventory.thermoA &&
              renderInvItem("thermoA", "🌡️", "Thermo A")}
            {state.inventory.thermoB &&
              renderInvItem("thermoB", "🌡️", "Thermo B")}
            {state.inventory.stopperA &&
              renderInvItem("stopperA", "🟫", "Gabus A")}
            {state.inventory.stopperB &&
              renderInvItem("stopperB", "🟫", "Gabus B")}
            {state.inventory.stopperC &&
              renderInvItem("stopperC", "🟫", "Gabus C")}
            {state.inventory.plant && renderInvItem("plant", "🌱", "Tanaman")}
            {state.inventory.cylinder &&
              renderInvItem("cylinder", "🧪", "Gelas Ukur")}
            {state.inventory.bakingSoda &&
              renderInvItem("bakingSoda", "🧂", "Soda (10g)")}
            {state.inventory.vinegar && renderInvItem("vinegar", "🧴", "Cuka")}
            {state.inventory.sun &&
              isSetupComplete(state) &&
              renderInvItem(
                "sun",
                "☀️",
                "Matahari",
                "border-[#F59E0B] bg-[#F59E0B]/10 animate-pulse",
              )}
            {state.inventory.stopwatch &&
              state.isSunny &&
              renderInvItem(
                "stopwatch",
                "⏱️",
                "Stopwatch",
                "border-primary bg-primary/10 animate-pulse",
              )}
          </div>
        </div>
      </div>

      {/* PANEL KANAN: AREA PRAKTIKUM & LKPD */}
      <div className="flex-1 flex flex-col relative h-2/3 md:h-screen overflow-hidden">
        {/* Header Instruksi */}
        <div className="bg-background/90 backdrop-blur-sm border-b border-border/20 p-2 md:p-3 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] z-20 shrink-0">
          <p className="text-xs md:text-sm text-foreground font-medium leading-tight">
            <span className="font-bold text-primary">Instruksi:</span>{" "}
            {getInstruction()}
          </p>
        </div>

        {/* Meja Praktikum (Area Interaktif) — tinggi 50% */}
        <div
          ref={workspaceRef}
          className={`relative transition-colors duration-1000 overflow-hidden touch-none flex flex-col
            ${state.isSunny ? "bg-primary/10" : "bg-muted-foreground/5"}
            ${activeDropZone === "environment" ? "ring-inset ring-4 ring-primary/50" : ""}`}
          style={{ height: "50%" }}
          data-dropzone="environment"
        >
          {state.isSunny && (
            <div className="absolute top-2 right-2 md:top-4 md:right-4 opacity-80 pointer-events-none animate-spin-slow">
              <SunSVG />
            </div>
          )}

          {/* OVERLAY SELANG: Melengkung ke atas rapih seperti jembatan pipa lab */}
          <svg
            id="hose-overlay"
            className="absolute inset-0 w-full h-full pointer-events-none z-30"
          >
            {state.hoseConnected && portCoords.B.x !== 0 && (
              <path
                d={`M ${portCoords.B.x} ${portCoords.B.y} Q ${(portCoords.B.x + portCoords.C.x) / 2} ${Math.min(portCoords.B.y, portCoords.C.y) - 80} ${portCoords.C.x} ${portCoords.C.y}`}
                fill="none"
                stroke="#22c55e"
                strokeWidth="8"
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 3px 2px rgba(0,0,0,0.3))" }}
              />
            )}
            {hoseDrawing.isDrawing &&
              hoseDrawing.startPort &&
              portCoords[hoseDrawing.startPort].x !== 0 && (
                <path
                  d={`M ${portCoords[hoseDrawing.startPort].x} ${portCoords[hoseDrawing.startPort].y} Q ${(portCoords[hoseDrawing.startPort].x + hoseDrawing.currentX) / 2} ${Math.min(portCoords[hoseDrawing.startPort].y, hoseDrawing.currentY) - 50} ${hoseDrawing.currentX} ${hoseDrawing.currentY}`}
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="10 5"
                  className="opacity-70"
                />
              )}
          </svg>

          {/* Area Penempatan Tabung dan Timbangan */}
          <div className="flex-1 flex flex-wrap justify-around items-end pb-8 px-2 sm:px-8 gap-x-2 z-20">
            {/* Tabung A */}
            <div
              className={`w-16 sm:w-24 md:w-32 flex flex-col items-center relative transition-transform ${activeDropZone === "flaskA" ? "scale-110 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" : ""}`}
              data-dropzone="flaskA"
            >
              {state.flaskA.hasThermo && (
                <div className="absolute -top-6 bg-slate-900/90 text-white px-2 py-0.5 rounded text-[10px] md:text-xs font-mono border border-slate-700 whitespace-nowrap">
                  {state.flaskA.temp.toFixed(1)}°C
                </div>
              )}
              <ErlenmeyerSVG
                label="A"
                hasThermo={state.flaskA.hasThermo}
                hasStopper={state.flaskA.hasStopper}
                hasPlant={state.flaskA.hasPlant}
              />
            </div>

            {/* Tabung B */}
            <div
              className={`w-16 sm:w-24 md:w-32 flex flex-col items-center relative transition-transform ${activeDropZone === "flaskB" ? "scale-110 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" : ""}`}
              data-dropzone="flaskB"
            >
              {state.flaskB.hasThermo && (
                <div className="absolute -top-6 bg-slate-900/90 text-white px-2 py-0.5 rounded text-[10px] md:text-xs font-mono border border-slate-700 whitespace-nowrap">
                  {state.flaskB.temp.toFixed(1)}°C
                </div>
              )}
              <ErlenmeyerSVG
                label="B"
                hasThermo={state.flaskB.hasThermo}
                hasStopper={state.flaskB.hasStopper}
              />

              {/* Port Selang B */}
                <div
                ref={portBRef}
                data-port="B"
                onPointerDown={(e) => handlePortPointerDown(e, "B")}
                className={`absolute top-[12%] left-1/2 w-8 h-8 rounded-full border-[3px] transform -translate-x-1/2 -translate-y-1/2 touch-none z-40 cursor-pointer shadow-sm
                  ${state.hoseConnected ? "bg-primary border-foreground" : "bg-background border-foreground hover:bg-primary/30 hover:scale-125 animate-pulse"}`}
              ></div>
            </div>

            {/* Tabung C */}
            <div
              className={`w-16 sm:w-24 md:w-32 flex flex-col items-center relative transition-transform ${activeDropZone === "flaskC" ? "scale-110 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" : ""}`}
              data-dropzone="flaskC"
            >
              <ErlenmeyerSVG
                label="C"
                hasStopper={state.flaskC.hasStopper}
                hasSoda={state.flaskC.hasSoda}
                hasVinegar={state.flaskC.hasVinegar}
                isBubbling={state.flaskC.hasSoda && state.flaskC.hasVinegar}
              />

              {/* Port Selang C */}
                <div
                ref={portCRef}
                data-port="C"
                onPointerDown={(e) => handlePortPointerDown(e, "C")}
                className={`absolute top-[12%] left-1/2 w-8 h-8 rounded-full border-[3px] transform -translate-x-1/2 -translate-y-1/2 touch-none z-40 cursor-pointer shadow-sm
                  ${state.hoseConnected ? "bg-primary border-foreground" : "bg-background border-foreground hover:bg-primary/30 hover:scale-125 animate-pulse"}`}
              ></div>
            </div>

            {/* Area Timbangan & Gelas Ukur */}
            <div
              className={`w-20 sm:w-28 md:w-36 h-24 md:h-32 flex flex-col items-center justify-end relative transition-transform ${activeDropZone === "scale" ? "scale-105 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" : ""}`}
              data-dropzone="scale"
            >
              {state.scale.hasCylinder && (
                <div
                  className="w-8 sm:w-12 h-16 sm:h-20 mb-[-10%] z-20 touch-none cursor-grab"
                  onPointerDown={(e) => handleItemPointerDown(e, "cylinder")}
                >
                  <GelasUkurSVG sodaAmount={state.scale.sodaAmount} />
                </div>
              )}
              <div className="w-full h-12 z-10">
                <TimbanganSVG
                  value={
                    state.scale.hasCylinder
                      ? state.scale.sodaAmount > 0
                        ? 10.0
                        : 0.0
                      : 0.0
                  }
                />
              </div>
            </div>
          </div>

          {/* Meja Kayu (Landasan Bawah) */}
          <div className="absolute bottom-0 w-full h-8 bg-background border-t border-border/20 z-10 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]"></div>
        </div>

        {/* Panel LKPD (Bawah) — tinggi 50% */}
        <div
          className="bg-background border-t-2 border-border/20 flex flex-col z-40 shadow-[0px_-4px_6px_-1px_rgba(0,0,0,0.05)]"
          style={{ height: "50%" }}
        >
          <div className="flex justify-between items-center bg-background px-3 py-1.5 md:p-2 border-b border-border/20">
            <h3 className="font-serif font-bold text-xs md:text-sm text-primary">
              📝 LKPD Data Suhu
            </h3>
            <div className="flex items-center gap-2">
              {/* Durasi Custom */}
              <div className="flex items-center gap-1 text-[10px] md:text-xs">
                <label
                  htmlFor="duration-input"
                  className="text-muted-foreground font-medium"
                >
                  Durasi:
                </label>
                <input
                  id="duration-input"
                  type="number"
                  min="5"
                  value={durationInput}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  onBlur={handleDurationBlur}
                  disabled={state.isRunning || isLabFinished}
                  className="w-12 md:w-14 px-1.5 py-0.5 rounded border border-border/30 text-center font-sans font-semibold text-foreground bg-background focus:border-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-muted-foreground">mnt</span>
              </div>
              <div className="font-sans font-semibold bg-background px-2 py-0.5 rounded text-primary text-xs md:text-sm border border-primary/20">
                Waktu: {state.time}/{state.duration} Menit
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-[10px] md:text-xs">
              <thead className="bg-background text-foreground sticky top-0 border-b border-border/20">
                <tr>
                  <th className="p-1.5 md:p-2 pl-4 font-semibold">Menit ke-</th>
                  <th className="p-1.5 md:p-2 font-semibold">
                    Tabung A (Tanaman)
                  </th>
                  <th className="p-1.5 md:p-2 font-semibold">
                    Tabung B (+CO2)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {state.logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="p-3 text-center text-muted-foreground italic"
                    >
                      Mulai stopwatch untuk mencatat data.
                    </td>
                  </tr>
                ) : (
                  state.logs.map((log) => (
                    <tr
                      key={log.time}
                      className="hover:bg-background/50 transition-colors"
                    >
                      <td className="p-1.5 md:p-2 pl-4 font-sans font-semibold text-foreground">
                        {log.time}
                      </td>
                      <td className="p-1.5 md:p-2 text-muted-foreground font-sans">
                        {log.tempA} °C
                      </td>
                      <td className="p-1.5 md:p-2 text-primary font-bold font-sans">
                        {log.tempB} °C{" "}
                        {parseFloat(log.tempB) > parseFloat(log.tempA)
                          ? "🔥"
                          : ""}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer: Tombol Reset setelah selesai */}
          {isLabFinished && (
            <div className="p-3 border-t border-border/20 bg-background flex items-center justify-center gap-3">
              <p className="text-xs md:text-sm text-primary font-semibold">
                ✅ Praktikum Selesai!
              </p>
              <button
                onClick={handleReset}
                className="px-4 py-1.5 text-xs md:text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 active:scale-95 transition-all duration-150"
              >
                ↺ Ulangi Percobaan
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RENDER ITEM DRAG (OVERLAY KUSTOM) */}
      {dragInfo.isDragging && (
        <div
          id="drag-overlay"
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 drop-shadow-2xl scale-110"
          style={{ left: dragInfo.x, top: dragInfo.y }}
        >
          <div className="bg-background p-3 rounded-xl border-2 border-primary shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <span className="text-4xl">
              {dragInfo.item === "thermoA" || dragInfo.item === "thermoB"
                ? "🌡️"
                : ""}
              {dragInfo.item === "stopperA" ||
              dragInfo.item === "stopperB" ||
              dragInfo.item === "stopperC"
                ? "🟫"
                : ""}
              {dragInfo.item === "plant" ? "🌱" : ""}
              {dragInfo.item === "cylinder" ? "🧪" : ""}
              {dragInfo.item === "bakingSoda" ? "🧂" : ""}
              {dragInfo.item === "vinegar" ? "🧴" : ""}
              {dragInfo.item === "sun" ? "☀️" : ""}
              {dragInfo.item === "stopwatch" ? "⏱️" : ""}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
