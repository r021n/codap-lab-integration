import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FileSearch,
  LogOut,
  User,
  Menu,
  ChevronLeft,
  X,
  FlaskConical,
  ClipboardList,
  BookOpen,
  Book,
  HelpCircle,
} from "lucide-react";
import ConfirmDialog from "./ui/confirm-dialog";

type NavigationSidebarProps = {
  handleLogout?: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
};

const navItems = [
  { to: "/dashboard", title: "Profil", icon: User, end: true },
  {
    to: "/dashboard/pendahuluan",
    title: "Pendahuluan",
    icon: BookOpen,
    end: false,
  },
  {
    to: "/dashboard/petunjuk",
    title: "Petunjuk Penggunaan",
    icon: HelpCircle,
    end: false,
  },
  { to: "/dashboard/materi", title: "Materi", icon: Book, end: false },
  {
    to: "/dashboard/virtual-lab",
    title: "Virtual Lab",
    icon: FlaskConical,
    end: false,
  },
  {
    to: "/dashboard/investigasi",
    title: "Investigasi",
    icon: FileSearch,
    end: false,
  },
  { to: "/dashboard/kuis", title: "Kuis", icon: ClipboardList, end: false },
] as const;

export default function NavigationSidebar({
  handleLogout,
  isMobileOpen = false,
  onMobileClose,
}: NavigationSidebarProps) {
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const activeClass =
    "flex items-center gap-3 rounded-lg bg-primary px-3 py-2 text-white transition-all shadow-sm";
  const inactiveClass =
    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground hover:bg-background/50";

  const renderNavItems = (
    showLabel: boolean,
    onItemClick?: () => void,
    navClassName = "grid items-start gap-1 px-2 text-sm font-medium",
  ) => (
    <nav className={navClassName}>
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              isActive ? activeClass : inactiveClass
            }
            onClick={onItemClick}
            title={item.title}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {showLabel && <span className="truncate">{item.title}</span>}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside
        className={`hidden md:flex flex-col border-r border-border/20 bg-background font-sans text-foreground h-screen sticky top-0 transition-all duration-300 shrink-0 ${
          isDesktopOpen ? "w-64" : "w-16"
        }`}
      >
        <div
          className={`flex h-14 items-center border-b border-border/20 lg:h-15 ${
            isDesktopOpen ? "px-4 justify-between" : "px-0 justify-center"
          }`}
        >
          {isDesktopOpen && (
            <h2 className="font-serif font-bold text-xl text-primary truncate mr-2">
              AirDataLabs
            </h2>
          )}
          <button
            onClick={() => setIsDesktopOpen((prev) => !prev)}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-background/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            title={isDesktopOpen ? "Tutup Menu" : "Buka Menu"}
            type="button"
          >
            {isDesktopOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">
          {renderNavItems(isDesktopOpen)}
        </div>

        {handleLogout && (
          <div className="mt-auto p-4 border-t border-border/20">
            <button
              type="button"
              onClick={() => setLogoutConfirmOpen(true)}
              className={`flex w-full items-center gap-3 rounded-lg py-2 text-red-500 transition-all hover:bg-red-50 ${
                isDesktopOpen ? "px-3" : "justify-center"
              }`}
              title="Sign Out"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {isDesktopOpen && <span>Sign Out</span>}
            </button>
          </div>
        )}
      </aside>

      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          isMobileOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <button
          type="button"
          aria-label="Tutup drawer"
          onClick={onMobileClose}
          className={`absolute inset-0 bg-foreground/35 transition-opacity duration-300 ${
            isMobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <aside
          className={`absolute left-0 top-0 h-full w-[84vw] max-w-[320px] bg-background border-r border-border/20 shadow-xl transition-transform duration-300 flex flex-col ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-14 items-center justify-between border-b border-border/20 px-4">
            <h2 className="font-serif font-bold text-xl text-primary truncate">
              AirDataLabs
            </h2>
            <button
              type="button"
              onClick={onMobileClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-background/50 hover:text-foreground"
              aria-label="Tutup menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            {renderNavItems(true, onMobileClose)}
          </div>

          {handleLogout && (
            <div className="mt-auto p-4 border-t border-border/20">
              <button
                type="button"
                onClick={() => {
                  onMobileClose?.();
                  setLogoutConfirmOpen(true);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-500 transition-all hover:bg-red-50"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </aside>
      </div>

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
    </>
  );
}
