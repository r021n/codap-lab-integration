import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavigationSidebar from "../components/NavigationSidebar";
import Profile from "./Profile";
import Investigasi from "./Investigasi";
import VirtualLab from "./VirtualLab";

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
        const res = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch user");
        }

        const data: User = await res.json();
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
      <div className="flex min-h-screen items-center justify-center bg-[#FDFBF0] font-sans text-[#0F172A]">
        Memuat data akun...
      </div>
    );
  }

  const isProfile =
    location.pathname === "/dashboard" || location.pathname === "/dashboard/";
  const isInvestigasi = location.pathname.startsWith("/dashboard/investigasi");
  const isVirtualLab = location.pathname.startsWith("/dashboard/virtual-lab");

  return (
    <div className="flex bg-[#FDFBF0] min-h-screen font-sans text-[#0F172A]">
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
      </main>
    </div>
  );
}
