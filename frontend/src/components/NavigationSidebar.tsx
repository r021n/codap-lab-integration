import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FileSearch, LogOut, User, Menu, ChevronLeft } from "lucide-react";

export default function NavigationSidebar({ handleLogout }: { handleLogout?: () => void }) {
  const [isOpen, setIsOpen] = useState(true);

  const activeClass = "flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-2 text-blue-700 transition-all";
  const inactiveClass = "flex items-center gap-3 rounded-lg px-3 py-2 text-slate-500 transition-all hover:text-slate-900 hover:bg-slate-100";

  return (
    <div className={`flex flex-col border-r bg-white h-screen sticky top-0 transition-all duration-300 shrink-0 ${isOpen ? "w-64" : "w-16"}`}>
      <div className={`flex h-14 items-center border-b lg:h-[60px] ${isOpen ? "px-4 justify-between" : "px-0 justify-center"}`}>
        {isOpen && <h2 className="font-semibold text-blue-600 truncate mr-2">EcoDataLearn</h2>}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none"
          title={isOpen ? "Tutup Menu" : "Buka Menu"}
        >
          {isOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">
        <nav className="grid items-start gap-1 px-2 text-sm font-medium">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
            title="Profil"
          >
            <User className="h-4 w-4 shrink-0" />
            {isOpen && <span>Profil</span>}
          </NavLink>
          <NavLink
            to="/dashboard/investigasi"
            className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
            title="Investigasi"
          >
            <FileSearch className="h-4 w-4 shrink-0" />
            {isOpen && <span>Investigasi</span>}
          </NavLink>
        </nav>
      </div>

      {handleLogout && (
        <div className="mt-auto p-4 border-t">
          <button 
            type="button"
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 rounded-lg py-2 text-red-500 transition-all hover:bg-red-50 ${isOpen ? "px-3" : "justify-center"}`}
            title="Sign Out"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {isOpen && <span>Sign Out</span>}
          </button>
        </div>
      )}
    </div>
  );
}
