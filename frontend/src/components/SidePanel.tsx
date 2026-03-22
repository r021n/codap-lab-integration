import { X, User } from "lucide-react"
import { Button } from "./ui/button"
import ProfileSettings from "./ProfileSettings"

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  user: { name: string; email: string };
  onProfileUpdate?: (updatedUser: { name: string; email: string }) => void;
}

export default function SidePanel({ isOpen, onClose, user, onProfileUpdate }: SidePanelProps) {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      
      {/* Sliding Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-xl font-semibold text-slate-900">Settings</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900">
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Tabs Navigation (Currently only Profile) */}
          <div className="border-b px-6">
            <div className="flex space-x-6">
              <button 
                className="flex items-center space-x-2 border-b-2 border-primary py-3 text-sm font-medium text-primary"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 border-l">
            <ProfileSettings user={user} onProfileUpdate={onProfileUpdate} />
          </div>
        </div>
      </div>
    </>
  )
}
