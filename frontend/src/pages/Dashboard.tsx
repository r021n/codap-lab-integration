import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { getMe, type User } from "../api/auth.api";
import NavigationSidebar from "../components/NavigationSidebar";
import Profile from "./Profile";
import Investigasi from "./Investigasi";
import VirtualLab from "./VirtualLab";
import QuizPage from "./Quiz";
import IntroductionPage from "./IntroductionPage";
import GuidePage from "./GuidePage";
import MateriPage from "./MateriPage";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const data: User = await getMe();
        setUser(data);
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    setIsMobileSidebarOpen(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleUserUpdate = (nextUser: User) => {
    setUser(nextUser);
  };

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background font-sans text-foreground">
        Memuat data akun...
      </div>
    );
  }

  const isProfile =
    location.pathname === "/dashboard" || location.pathname === "/dashboard/";
  const isInvestigasi = location.pathname.startsWith("/dashboard/investigasi");
  const isVirtualLab = location.pathname.startsWith("/dashboard/virtual-lab");
  const isKuis = location.pathname.startsWith("/dashboard/kuis");
  const isPendahuluan = location.pathname.startsWith("/dashboard/pendahuluan");
  const isPetunjuk = location.pathname.startsWith("/dashboard/petunjuk");
  const isMateri = location.pathname.startsWith("/dashboard/materi");
  const pageTitle = isProfile
    ? "Profil"
    : isInvestigasi
      ? "Investigasi"
      : isVirtualLab
        ? "Virtual Lab"
        : isKuis
          ? "Kuis"
          : isPendahuluan
            ? "Pendahuluan"
            : isPetunjuk
              ? "Petunjuk"
              : isMateri
                ? "Materi"
                : "Dashboard";
  const contentPaddingClass = "p-3 sm:p-4 md:p-8";

  const investigasiContainerClass = isInvestigasi
    ? `block ${contentPaddingClass}`
    : "invisible h-0 overflow-hidden p-0 pointer-events-none";

  return (
    <div className="flex bg-background min-h-screen font-sans text-foreground">
      {/* Sidebar Navigation */}
      <NavigationSidebar
        handleLogout={handleLogout}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto w-full h-full">
        <div className="md:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/20 bg-background/95 px-3 sm:px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/50 text-foreground hover:bg-background/70"
            aria-label="Buka menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold text-sm text-foreground">
            {pageTitle}
          </span>
          <div className="h-9 w-9" />
        </div>

        <div className={isProfile ? `block ${contentPaddingClass}` : "hidden"}>
          <Profile user={user} setUser={handleUserUpdate} />
        </div>
        <div className={investigasiContainerClass} aria-hidden={!isInvestigasi}>
          <Investigasi user={user} />
        </div>
        <div className={isVirtualLab ? "block w-full h-full" : "hidden"}>
          <VirtualLab />
        </div>
        <div className={isKuis ? `block ${contentPaddingClass}` : "hidden"}>
          <QuizPage user={user} />
        </div>
        <div
          className={isPendahuluan ? `block ${contentPaddingClass}` : "hidden"}
        >
          <IntroductionPage user={user} />
        </div>
        <div className={isPetunjuk ? `block ${contentPaddingClass}` : "hidden"}>
          <GuidePage user={user} />
        </div>
        <div className={isMateri ? `block ${contentPaddingClass}` : "hidden"}>
          <MateriPage user={user} />
        </div>
      </main>
    </div>
  );
}
