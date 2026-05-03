import { useState } from "react";
import AirExperimentLab from "../components/Vlabs/AirExperimentLab";
import AirQualityMeasurementLab from "../components/Vlabs/AirQualityMeasurementLab";
import { FlaskConical, Wind, CheckCircle2 } from "lucide-react";

type LabType = "air-experiment" | "air-quality";

export default function VirtualLab() {
  const [selectedLab, setSelectedLab] = useState<LabType | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const handleStart = () => {
    if (selectedLab && isReady) {
      setIsStarted(true);
    }
  };

  const handleBack = () => {
    setIsStarted(false);
    setIsReady(false);
  };

  if (isStarted && selectedLab === "air-experiment") {
    return <AirExperimentLab onBack={handleBack} />;
  }

  if (isStarted && selectedLab === "air-quality") {
    return <AirQualityMeasurementLab onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4">
            Virtual Laboratory
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Selamat datang di laboratorium virtual. Silakan pilih praktikum yang
            ingin Anda lakukan hari ini.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Lab 1: Air Quality Measurement */}
          <div
            onClick={() => setSelectedLab("air-quality")}
            className={`cursor-pointer group relative overflow-hidden rounded-3xl border-2 transition-all duration-300 ${
              selectedLab === "air-quality"
                ? "border-primary bg-primary/5 shadow-lg ring-4 ring-primary/10"
                : "border-slate-200 bg-white hover:border-primary/50 hover:shadow-md"
            }`}
          >
            <div className="p-8">
              <div
                className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-colors duration-300 ${
                  selectedLab === "air-quality"
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-600 group-hover:bg-primary/10 group-hover:text-primary"
                }`}
              >
                <Wind size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                Pengukuran Kualitas Udara
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Simulasi interaktif pengukuran kualitas udara di beberapa lokasi
                menggunakan alat sensor secara real time
              </p>
            </div>
            {selectedLab === "air-quality" && (
              <div className="absolute top-4 right-4 text-primary">
                <CheckCircle2 size={24} />
              </div>
            )}
          </div>

          {/* Lab 2: Air Experiment */}
          <div
            onClick={() => setSelectedLab("air-experiment")}
            className={`cursor-pointer group relative overflow-hidden rounded-3xl border-2 transition-all duration-300 ${
              selectedLab === "air-experiment"
                ? "border-primary bg-primary/5 shadow-lg ring-4 ring-primary/10"
                : "border-slate-200 bg-white hover:border-primary/50 hover:shadow-md"
            }`}
          >
            <div className="p-8">
              <div
                className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-colors duration-300 ${
                  selectedLab === "air-experiment"
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-600 group-hover:bg-primary/10 group-hover:text-primary"
                }`}
              >
                <FlaskConical size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                Pengaruh Gas CO2 terhadap Suhu
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Simulasi interaktif untuk mengamati pengaruh gas CO2 terhadap
                suhu lingkungan
              </p>
            </div>
            {selectedLab === "air-experiment" && (
              <div className="absolute top-4 right-4 text-primary">
                <CheckCircle2 size={24} />
              </div>
            )}
          </div>
        </div>

        {selectedLab && (
          <div className="max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="group flex cursor-pointer items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:bg-slate-50">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  id="ready-checkbox"
                  checked={isReady}
                  onChange={(e) => setIsReady(e.target.checked)}
                  className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-slate-300 transition-all checked:border-primary checked:bg-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <svg
                  className="pointer-events-none absolute left-1 top-1 h-4 w-4 scale-0 text-white transition-transform peer-checked:scale-100"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <label
                htmlFor="ready-checkbox"
                className="cursor-pointer select-none text-lg font-semibold text-slate-700 group-hover:text-primary transition-colors"
              >
                Ayo mulai!
              </label>
            </div>

            <button
              onClick={handleStart}
              disabled={!isReady}
              className={`w-full overflow-hidden rounded-2xl py-4 font-bold tracking-wide transition-all duration-300 active:scale-[0.98] ${
                isReady
                  ? "bg-primary text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              Mulai Praktikum
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
