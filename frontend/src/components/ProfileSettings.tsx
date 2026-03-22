import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"

interface ProfileSettingsProps {
  user: { name: string; email: string }
  onProfileUpdate?: (updatedUser: { name: string; email: string }) => void
}

export default function ProfileSettings({ user, onProfileUpdate }: ProfileSettingsProps) {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isLoadingPassword, setIsLoadingPassword] = useState(false)
  
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" })
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" })

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoadingProfile(true)
    setProfileMessage({ type: "", text: "" })
    
    try {
      // Simulate API call to update profile
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, email })
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to update profile")
      }
      
      const data = await res.json()
      setProfileMessage({ type: "success", text: "Profile updated successfully!" })
      if (onProfileUpdate) onProfileUpdate({ name: data.user?.name || name, email: data.user?.email || email })
    } catch (err: any) {
      setProfileMessage({ type: "error", text: err.message || "Something went wrong" })
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoadingPassword(true)
    setPasswordMessage({ type: "", text: "" })
    
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match" })
      setIsLoadingPassword(false)
      return
    }
    
    try {
      // Simulate API call to update password
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:5000/api/auth/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to update password")
      }
      
      setPasswordMessage({ type: "success", text: "Password updated successfully!" })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setPasswordMessage({ type: "error", text: err.message || "Something went wrong" })
    } finally {
      setIsLoadingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Update Profile Card */}
      <Card className="border-none shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-xl">Profile Details</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {profileMessage.text && (
              <div
                className={`p-3 rounded-md text-sm font-medium ${
                  profileMessage.type === "error"
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-green-50 text-green-600 border border-green-200"
                }`}
              >
                {profileMessage.text}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isLoadingProfile}
              className="w-full sm:w-auto"
            >
              {isLoadingProfile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="h-px w-full bg-slate-200" />

      {/* Change Password Card */}
      <Card className="border-none shadow-none">
        <CardHeader className="px-0">
          <CardTitle className="text-xl">Change Password</CardTitle>
          <CardDescription>Update your account password securely</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {passwordMessage.text && (
              <div
                className={`p-3 rounded-md text-sm font-medium ${
                  passwordMessage.type === "error"
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-green-50 text-green-600 border border-green-200"
                }`}
              >
                {passwordMessage.text}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoadingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="w-full sm:w-auto"
            >
              {isLoadingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
