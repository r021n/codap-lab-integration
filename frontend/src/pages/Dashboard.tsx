import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getMe } from "../api/auth.api";
import NavigationSidebar from "../components/NavigationSidebar";
import Profile from "./Profile";
import Investigasi from "./Investigasi";
import VirtualLab from "./VirtualLab";
import QuizPage from "./Quiz";
import IntroductionPage from "./IntroductionPage";
import GuidePage from "./GuidePage";

type User = {
  name: string;
  email: string;
  role: string;
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleUserUpdate = (nextUser: User) => {
    setUser(nextUser);
  };

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

  return (
    <div className="flex bg-background min-h-screen font-sans text-foreground">
      {/* Sidebar Navigation */}
      <NavigationSidebar handleLogout={handleLogout} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full h-full">
        <div className={isProfile ? "block p-4 md:p-8" : "hidden"}>
          <Profile user={user} setUser={handleUserUpdate} />
        </div>
        <div className={isInvestigasi ? "block p-4 md:p-8" : "hidden"}>
          <Investigasi user={user} />
        </div>
        <div className={isVirtualLab ? "block w-full h-full" : "hidden"}>
          <VirtualLab />
        </div>
        <div className={isKuis ? "block p-4 md:p-8" : "hidden"}>
          <QuizPage user={user} />
        </div>
        <div className={isPendahuluan ? "block p-4 md:p-8" : "hidden"}>
          <IntroductionPage user={user} />
        </div>
        <div className={isPetunjuk ? "block p-4 md:p-8" : "hidden"}>
          <GuidePage user={user} />
        </div>
      </main>
    </div>
  );
}
