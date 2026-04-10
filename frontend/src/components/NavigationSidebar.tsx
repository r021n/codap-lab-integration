import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FileSearch,
  LogOut,
  User,
  Menu,
  ChevronLeft,
  FlaskConical,
  ClipboardList,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import ConfirmDialog from "./ui/confirm-dialog";

export default function NavigationSidebar({
  handleLogout,
}: {
  handleLogout?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const activeClass =
    "flex items-center gap-3 rounded-lg bg-primary px-3 py-2 text-white transition-all shadow-sm";
  const inactiveClass =
    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground hover:bg-background/50";

  return (
    <div
      className={`flex flex-col border-r border-border/20 bg-background font-sans text-foreground h-screen sticky top-0 transition-all duration-300 shrink-0 ${isOpen ? "w-64" : "w-16"}`}
    >
      <div
        className={`flex h-14 items-center border-b border-border/20 lg:h-[60px] ${isOpen ? "px-4 justify-between" : "px-0 justify-center"}`}
      >
        {isOpen && (
          <h2 className="font-serif font-bold text-xl text-primary truncate mr-2">
            AirDataLabs
          </h2>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-md text-muted-foreground hover:bg-background/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          title={isOpen ? "Tutup Menu" : "Buka Menu"}
        >
          {isOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">
        <nav className="grid items-start gap-1 px-2 text-sm font-medium">
          <NavLink
            to="/dashboard/pendahuluan"
            className={({ isActive }) =>
              isActive ? activeClass : inactiveClass
            }
            title="Pendahuluan"
          >
            <BookOpen className="h-4 w-4 shrink-0" />
            {isOpen && <span>Pendahuluan</span>}
          </NavLink>
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              isActive ? activeClass : inactiveClass
            }
            title="Profil"
          >
            <User className="h-4 w-4 shrink-0" />
            {isOpen && <span>Profil</span>}
          </NavLink>
          <NavLink
            to="/dashboard/investigasi"
            className={({ isActive }) =>
              isActive ? activeClass : inactiveClass
            }
            title="Investigasi"
          >
            <FileSearch className="h-4 w-4 shrink-0" />
            {isOpen && <span>Investigasi</span>}
          </NavLink>
          <NavLink
            to="/dashboard/virtual-lab"
            className={({ isActive }) =>
              isActive ? activeClass : inactiveClass
            }
            title="Virtual Lab"
          >
            <FlaskConical className="h-4 w-4 shrink-0" />
            {isOpen && <span>Virtual Lab</span>}
          </NavLink>
          <NavLink
            to="/dashboard/kuis"
            className={({ isActive }) =>
              isActive ? activeClass : inactiveClass
            }
            title="Kuis"
          >
            <ClipboardList className="h-4 w-4 shrink-0" />
            {isOpen && <span>Kuis</span>}
          </NavLink>
          <NavLink
            to="/dashboard/petunjuk"
            className={({ isActive }) =>
              isActive ? activeClass : inactiveClass
            }
            title="Petunjuk Penggunaan"
          >
            <HelpCircle className="h-4 w-4 shrink-0" />
            {isOpen && <span>Petunjuk Penggunaan</span>}
          </NavLink>
        </nav>
      </div>

      {handleLogout && (
        <div className="mt-auto p-4 border-t border-border/20">
          <button
            type="button"
            onClick={() => setLogoutConfirmOpen(true)}
            className={`flex w-full items-center gap-3 rounded-lg py-2 text-red-500 transition-all hover:bg-red-50 ${isOpen ? "px-3" : "justify-center"}`}
            title="Sign Out"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {isOpen && <span>Sign Out</span>}
          </button>
        </div>
      )}

      <ConfirmDialog
        open={logoutConfirmOpen}
        onConfirm={() => {
          setLogoutConfirmOpen(false);
          handleLogout?.();
        }}
        onCancel={() => setLogoutConfirmOpen(false)}
        title="Konfirmasi Logout"
        description="Apakah Anda yakin ingin logout?"
        confirmText="Ya, Logout"
        cancelText="Batal"
        variant="danger"
      />
    </div>
  );
}
