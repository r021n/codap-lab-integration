import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type PointerEvent as ReactPointerEvent,
} from "react";

type PortId = "B" | "C" | "D" | "J";

type InventoryItem =
  | "thermoA"
  | "thermoB"
  | "thermoD"
  | "stopperA"
  | "stopperB"
  | "stopperC"
  | "stopperD"
  | "plant"
  | "bakingSoda"
  | "vinegar"
  | "cylinder"
  | "sun"
  | "stopwatch";

type DropZone =
  | "flaskA"
  | "flaskB"
  | "flaskC"
  | "flaskD"
  | "jar"
  | "scale"
  | "environment";

type PortCoords = Record<PortId, { x: number; y: number }>;

type LabLog = {
  time: number;
  tempA: string;
  tempB: string;
  tempD: string;
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
  flaskD: { hasThermo: boolean; hasStopper: boolean; temp: number };
  jar: { hasPlant: boolean; hasWrap: boolean };
  scale: { hasCylinder: boolean; sodaAmount: number };
  inventory: Record<InventoryItem, boolean>;
  isSunny: boolean;
  isRunning: boolean;
  time: number;
  logs: LabLog[];
  hoseBCConnected: boolean;
  hoseDJConnected: boolean;
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

type ToplesProps = {
  hasPlant: boolean;
  hasWrap: boolean;
};

const DEFAULT_DURATION = 5;

const initialState: LabState = {
  flaskA: { hasThermo: false, hasStopper: false, hasPlant: false, temp: 28 },
  flaskB: { hasThermo: false, hasStopper: false, temp: 28 },
  flaskC: { hasSoda: false, hasVinegar: false, hasStopper: false },
  flaskD: { hasThermo: false, hasStopper: false, temp: 28 },
  jar: { hasPlant: false, hasWrap: false },
  scale: { hasCylinder: false, sodaAmount: 0 },
  inventory: {
    thermoA: true,
    thermoB: true,
    thermoD: true,
    stopperA: true,
    stopperB: true,
    stopperC: true,
    stopperD: true,
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
  hoseBCConnected: false,
  hoseDJConnected: false,
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
  D: { x: 0, y: 0 },
  J: { x: 0, y: 0 },
};

const isPortId = (value: string | null | undefined): value is PortId => {
  return value === "B" || value === "C" || value === "D" || value === "J";
};

const getHosePair = (a: PortId, b: PortId): "BC" | "DJ" | null => {
  if ((a === "B" && b === "C") || (a === "C" && b === "B")) {
    return "BC";
  }
  if ((a === "D" && b === "J") || (a === "J" && b === "D")) {
    return "DJ";
  }
  return null;
};

const isPairConnected = (labState: LabState, pair: "BC" | "DJ"): boolean => {
  return pair === "BC" ? labState.hoseBCConnected : labState.hoseDJConnected;
};

const hasMeasuredPortCoords = (coords: PortCoords, port: PortId): boolean => {
  return coords[port].x !== 0 || coords[port].y !== 0;
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

const ToplesSVG = ({ hasPlant, hasWrap }: ToplesProps) => (
  <svg viewBox="0 0 120 160" className="w-full h-full drop-shadow-md">
    <rect
      x="25"
      y="35"
      width="70"
      height="105"
      rx="10"
      fill="rgba(255,255,255,0.4)"
      stroke="#475569"
      strokeWidth="2.5"
    />
    <rect
      x="35"
      y="26"
      width="50"
      height="10"
      rx="3"
      fill="#94a3b8"
      stroke="#64748b"
      strokeWidth="1.5"
    />
    {hasWrap && (
      <path
        d="M 32 28 Q 60 18 88 28"
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="4"
        strokeLinecap="round"
      />
    )}
    {hasPlant && (
      <g transform="translate(60, 130)">
        <path d="M 0 0 Q -12 -25 -6 -45 Q 6 -20 0 0" fill="#22c55e" />
        <path d="M 0 0 Q 14 -16 22 -34 Q 8 -12 0 0" fill="#16a34a" />
        <path d="M 0 0 Q -18 -12 -24 -28 Q -8 -8 0 0" fill="#15803d" />
      </g>
    )}
    <text
      x="60"
      y="152"
      textAnchor="middle"
      fontSize="10"
      fill="#334155"
      fontWeight="600"
    >
      Toples
    </text>
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
  const portDRef = useRef<HTMLDivElement | null>(null);
  const portJRef = useRef<HTMLDivElement | null>(null);
  const [portCoords, setPortCoords] = useState<PortCoords>(initialPortCoords);

  const updatePortCoords = useCallback(() => {
    if (
      !workspaceRef.current ||
      !portBRef.current ||
      !portCRef.current ||
      !portDRef.current ||
      !portJRef.current
    )
      return;
    const workspaceRect = workspaceRef.current.getBoundingClientRect();
    const rectB = portBRef.current.getBoundingClientRect();
    const rectC = portCRef.current.getBoundingClientRect();
    const rectD = portDRef.current.getBoundingClientRect();
    const rectJ = portJRef.current.getBoundingClientRect();

    setPortCoords({
      B: {
        x: rectB.left - workspaceRect.left + rectB.width / 2,
        y: rectB.top - workspaceRect.top + rectB.height / 2,
      },
      C: {
        x: rectC.left - workspaceRect.left + rectC.width / 2,
        y: rectC.top - workspaceRect.top + rectC.height / 2,
      },
      D: {
        x: rectD.left - workspaceRect.left + rectD.width / 2,
        y: rectD.top - workspaceRect.top + rectD.height / 2,
      },
      J: {
        x: rectJ.left - workspaceRect.left + rectJ.width / 2,
        y: rectJ.top - workspaceRect.top + rectJ.height / 2,
      },
    });
  }, []);

  const isPortLocked = useCallback((port: PortId, labState: LabState) => {
    const pair = port === "B" || port === "C" ? "BC" : "DJ";
    return isPairConnected(labState, pair);
  }, []);

  const tryConnectPorts = useCallback(
    (startPort: PortId, targetPort: PortId) => {
      const pair = getHosePair(startPort, targetPort);
      if (!pair) {
        return false;
      }

      setState((prev) => {
        if (isPairConnected(prev, pair)) {
          return prev;
        }

        if (pair === "BC") {
          return { ...prev, hoseBCConnected: true };
        }

        return { ...prev, hoseDJConnected: true };
      });
      setHoseDrawing(initialHoseDrawing);
      setTimeout(updatePortCoords, 50);
      return true;
    },
    [updatePortCoords],
  );

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
          const newTempB =
            prev.flaskB.temp + (prev.hoseBCConnected ? 2.5 : 1.0);
          // Tabung D dibuat sebagai profil suhu terendah (efek pendinginan oleh tanaman/toples).
          const newTempD =
            prev.flaskD.temp + (prev.hoseDJConnected ? 0.3 : 0.5);

          const newLogs = [
            ...prev.logs,
            {
              time: newTime,
              tempA: newTempA.toFixed(1),
              tempB: newTempB.toFixed(1),
              tempD: newTempD.toFixed(1),
            },
          ];
          return {
            ...prev,
            time: newTime,
            flaskA: { ...prev.flaskA, temp: newTempA },
            flaskB: { ...prev.flaskB, temp: newTempB },
            flaskD: { ...prev.flaskD, temp: newTempD },
            logs: newLogs,
            isRunning: newTime < prev.duration,
          };
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [
    state.isRunning,
    state.time,
    state.hoseBCConnected,
    state.hoseDJConnected,
    state.duration,
  ]);

  const isSetupComplete = useCallback((s: LabState) => {
    return (
      s.flaskA.hasThermo &&
      s.flaskA.hasStopper &&
      s.flaskB.hasThermo &&
      s.flaskB.hasStopper &&
      s.flaskD.hasThermo &&
      s.flaskD.hasStopper &&
      s.flaskC.hasSoda &&
      s.flaskC.hasVinegar &&
      s.flaskC.hasStopper &&
      s.jar.hasPlant &&
      s.jar.hasWrap &&
      s.hoseBCConnected &&
      s.hoseDJConnected
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
          flaskD: { ...prev.flaskD },
          jar: { ...prev.jar },
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

        if (zone === "flaskD") {
          if (item === "thermoD" && !newState.flaskD.hasThermo) {
            newState.flaskD.hasThermo = true;
            inv.thermoD = false;
          }
          if (item === "stopperD" && !newState.flaskD.hasStopper) {
            newState.flaskD.hasStopper = true;
            inv.stopperD = false;
          }
        }

        if (zone === "jar") {
          if (item === "plant" && !newState.jar.hasPlant) {
            newState.jar.hasPlant = true;
            newState.jar.hasWrap = true;
            inv.plant = false;
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
        const targetPortValue = portEl?.getAttribute("data-port");

        if (hoseOverlay) hoseOverlay.style.visibility = "visible";

        // Hanya pasangan port B<->C dan D<->J yang valid.
        if (
          hoseDrawing.startPort &&
          isPortId(targetPortValue) &&
          targetPortValue !== hoseDrawing.startPort
        ) {
          if (!tryConnectPorts(hoseDrawing.startPort, targetPortValue)) {
            setHoseDrawing(initialHoseDrawing);
          }
        }
        // Jika lepas jari di ruang kosong tapi cukup jauh dari awal (Batal Dragging)
        else if (!targetPortValue) {
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
    tryConnectPorts,
    portCoords,
    processAction,
  ]);

  const handlePortPointerDown = (
    e: ReactPointerEvent<HTMLDivElement>,
    portId: PortId,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // Pastikan koordinat port terbaru tersedia saat mode drag selang dimulai.
    updatePortCoords();

    if (isPortLocked(portId, state)) return;

    // Perbaikan Bug Selang: Mode Klik-ke-Klik (Jika selang sudah mulai ditarik dan kita klik port lain)
    if (hoseDrawing.isDrawing && hoseDrawing.startPort) {
      if (hoseDrawing.startPort !== portId) {
        if (!tryConnectPorts(hoseDrawing.startPort, portId)) {
          setHoseDrawing(initialHoseDrawing);
        }
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
      return "1. Siapkan Tabung A: tarik Termometer A dan Gabus A ke Tabung A.";
    if (!state.flaskB.hasThermo || !state.flaskB.hasStopper)
      return "2. Siapkan Tabung B: tarik Termometer B dan Gabus B ke Tabung B.";

    if (!state.flaskC.hasSoda) {
      if (!state.scale.hasCylinder)
        return "3. Tarik Gelas Ukur ke atas Timbangan.";
      if (state.scale.sodaAmount === 0)
        return "4. Tarik Baking Soda ke Timbangan atau Gelas Ukur untuk menimbang 10 ml.";
      return "5. Tarik Gelas Ukur (yang berisi soda) ke Tabung C untuk menuangkannya.";
    }

    if (!state.flaskC.hasVinegar) return "6. Tarik Asam Cuka ke Tabung C.";
    if (!state.flaskC.hasStopper) return "7. Tutup Tabung C dengan Gabus C.";
    if (!state.hoseBCConnected)
      return "8. Hubungkan selang 1: tekan titik Tabung B, lalu tekan titik Tabung C.";
    if (!state.flaskD.hasThermo || !state.flaskD.hasStopper)
      return "9. Siapkan Tabung D: tarik Termometer D dan Gabus D ke Tabung D.";
    if (!state.jar.hasPlant) return "10. Tarik Tanaman ke Toples.";
    if (!state.hoseDJConnected)
      return "11. Hubungkan selang 2: tekan titik Tabung D, lalu tekan titik Toples.";
    if (!state.isSunny)
      return "12. Tarik Matahari ke area kosong untuk memindahkan set alat ke luar ruangan.";
    if (!state.isRunning && state.time === 0)
      return "13. Tarik Stopwatch ke area kerja untuk mulai mengamati suhu A dan B!";
    if (state.time < state.duration)
      return "Mengamati... (Perhatikan suhu di Tabung B naik lebih cepat karena CO2 dari Tabung C)";
    return "Praktikum selesai! LKPD menampilkan perbandingan suhu Tabung A dan B tiap menit.";
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
            {state.inventory.thermoD &&
              renderInvItem("thermoD", "🌡️", "Thermo D")}
            {state.inventory.stopperA &&
              renderInvItem("stopperA", "🟫", "Gabus A")}
            {state.inventory.stopperB &&
              renderInvItem("stopperB", "🟫", "Gabus B")}
            {state.inventory.stopperC &&
              renderInvItem("stopperC", "🟫", "Gabus C")}
            {state.inventory.stopperD &&
              renderInvItem("stopperD", "🟫", "Gabus D")}
            {state.inventory.plant && renderInvItem("plant", "🌱", "Tanaman")}
            {state.inventory.cylinder &&
              renderInvItem("cylinder", "🧪", "Gelas Ukur")}
            {state.inventory.bakingSoda &&
              renderInvItem("bakingSoda", "🧂", "Soda (10 ml)")}
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
            {state.hoseBCConnected &&
              hasMeasuredPortCoords(portCoords, "B") &&
              hasMeasuredPortCoords(portCoords, "C") && (
                <path
                  d={`M ${portCoords.B.x} ${portCoords.B.y} Q ${(portCoords.B.x + portCoords.C.x) / 2} ${Math.min(portCoords.B.y, portCoords.C.y) - 80} ${portCoords.C.x} ${portCoords.C.y}`}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="8"
                  strokeLinecap="round"
                  style={{ filter: "drop-shadow(0 3px 2px rgba(0,0,0,0.3))" }}
                />
              )}
            {state.hoseDJConnected &&
              hasMeasuredPortCoords(portCoords, "D") &&
              hasMeasuredPortCoords(portCoords, "J") && (
                <path
                  d={`M ${portCoords.D.x} ${portCoords.D.y} Q ${(portCoords.D.x + portCoords.J.x) / 2} ${Math.min(portCoords.D.y, portCoords.J.y) - 70} ${portCoords.J.x} ${portCoords.J.y}`}
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="8"
                  strokeLinecap="round"
                  style={{ filter: "drop-shadow(0 3px 2px rgba(0,0,0,0.25))" }}
                />
              )}
            {hoseDrawing.isDrawing &&
              hoseDrawing.startPort &&
              hasMeasuredPortCoords(portCoords, hoseDrawing.startPort) && (
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
                  ${state.hoseBCConnected ? "bg-primary border-foreground" : "bg-background border-foreground hover:bg-primary/30 hover:scale-125 animate-pulse"}`}
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
                  ${state.hoseBCConnected ? "bg-primary border-foreground" : "bg-background border-foreground hover:bg-primary/30 hover:scale-125 animate-pulse"}`}
              ></div>
            </div>

            {/* Tabung D */}
            <div
              className={`w-16 sm:w-24 md:w-32 flex flex-col items-center relative transition-transform ${activeDropZone === "flaskD" ? "scale-110 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" : ""}`}
              data-dropzone="flaskD"
            >
              {state.flaskD.hasThermo && (
                <div className="absolute -top-6 bg-slate-900/90 text-white px-2 py-0.5 rounded text-[10px] md:text-xs font-mono border border-slate-700 whitespace-nowrap">
                  {state.flaskD.temp.toFixed(1)}°C
                </div>
              )}
              <ErlenmeyerSVG
                label="D"
                hasThermo={state.flaskD.hasThermo}
                hasStopper={state.flaskD.hasStopper}
              />

              {/* Port Selang D */}
              <div
                ref={portDRef}
                data-port="D"
                onPointerDown={(e) => handlePortPointerDown(e, "D")}
                className={`absolute top-[12%] left-1/2 w-8 h-8 rounded-full border-[3px] transform -translate-x-1/2 -translate-y-1/2 touch-none z-40 cursor-pointer shadow-sm
                  ${state.hoseDJConnected ? "bg-primary border-foreground" : "bg-background border-foreground hover:bg-primary/30 hover:scale-125 animate-pulse"}`}
              ></div>
            </div>

            {/* Toples Tanaman */}
            <div
              className={`w-20 sm:w-28 md:w-36 flex flex-col items-center relative transition-transform ${activeDropZone === "jar" ? "scale-105 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" : ""}`}
              data-dropzone="jar"
            >
              <ToplesSVG
                hasPlant={state.jar.hasPlant}
                hasWrap={state.jar.hasWrap}
              />

              {/* Port Selang Toples */}
              <div
                ref={portJRef}
                data-port="J"
                onPointerDown={(e) => handlePortPointerDown(e, "J")}
                className={`absolute top-[24%] right-[16%] w-8 h-8 rounded-full border-[3px] touch-none z-40 cursor-pointer shadow-sm
                  ${state.hoseDJConnected ? "bg-primary border-foreground" : "bg-background border-foreground hover:bg-primary/30 hover:scale-125 animate-pulse"}`}
              ></div>

              <p className="text-[10px] md:text-xs text-muted-foreground font-semibold mt-1 text-center">
                {state.jar.hasPlant
                  ? "Tanaman siap, wrap terpasang"
                  : "Drop Tanaman ke Toples"}
              </p>
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
                    Tabung A (Kontrol)
                  </th>
                  <th className="p-1.5 md:p-2 font-semibold">
                    Tabung B (+CO2)
                  </th>
                  <th className="p-1.5 md:p-2 font-semibold">
                    Tabung D (Toples)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {state.logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
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
                      <td className="p-1.5 md:p-2 text-muted-foreground font-sans">
                        {log.tempD} °C
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
              {dragInfo.item === "thermoA" ||
              dragInfo.item === "thermoB" ||
              dragInfo.item === "thermoD"
                ? "🌡️"
                : ""}
              {dragInfo.item === "stopperA" ||
              dragInfo.item === "stopperB" ||
              dragInfo.item === "stopperC" ||
              dragInfo.item === "stopperD"
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
