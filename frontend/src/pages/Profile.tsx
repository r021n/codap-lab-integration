import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

type UserType = {
  name: string;
  email: string;
  role: string;
};

type ProfileProps = {
  user: UserType;
  setUser: (user: UserType) => void;
};

export default function Profile({ user, setUser }: ProfileProps) {
  
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "error"; title: string; description: string } | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (type: "success" | "error", title: string, description: string) => {
    setToast({ show: true, type, title, description });
    
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    
    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => (prev ? { ...prev, show: false } : null));
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingProfile(true);
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, email })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Gagal memperbarui profil");
      }
      
      const data = await res.json();
      showToast("success", "Berhasil", "Profil berhasil diperbarui!");
      setUser({ ...user, name: data.user?.name || name, email: data.user?.email || email });
    } catch (err: any) {
      showToast("error", "Gagal", err.message || "Terjadi kesalahan");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingPassword(true);
    
    if (newPassword !== confirmPassword) {
      showToast("error", "Gagal", "Password baru tidak cocok");
      setIsLoadingPassword(false);
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/auth/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Gagal memperbarui password");
      }
      
      showToast("success", "Berhasil", "Password berhasil diperbarui!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      showToast("error", "Gagal", err.message || "Terjadi kesalahan");
    } finally {
      setIsLoadingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 relative">
      {/* Toast Notification */}
      {toast && toast.show && (
        <div className="fixed bottom-4 right-4 z-50 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
          <div className="pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 pr-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] transition-all border-[#94A3B8]/20 bg-[#FFFFFF] text-[#0F172A]">
            <div className="flex gap-3">
              {toast.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-[#10B981] mt-0.5 shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              )}
              <div className="grid gap-1">
                <div className="text-sm font-semibold">{toast.title}</div>
                <div className="text-sm opacity-90 text-[#94A3B8]">{toast.description}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#0F172A]">Pengaturan Profil</h1>
        <p className="mt-2 text-lg text-[#94A3B8]">Perbarui informasi akun dan kata sandi Anda</p>
      </header>

      {/* Edit Profile */}
      <Card className="border border-[#94A3B8]/20 bg-[#FFFFFF] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg overflow-hidden">
        <CardHeader className="border-b border-[#94A3B8]/10 bg-[#FFFFFF]/50">
          <CardTitle className="font-serif text-xl font-bold text-[#0F172A]">Detail Profil</CardTitle>
          <CardDescription className="text-[#94A3B8]">Ubah nama atau alamat email Anda</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold text-[#0F172A]">Nama Lengkap</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Lengkap"
                required
                className="bg-[#FFFFFF] border-gray-300 focus:border-[#F97316] focus:ring-[#F97316] focus-visible:ring-[#F97316]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-[#0F172A]">Alamat Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="bg-[#FFFFFF] border-gray-300 focus:border-[#F97316] focus:ring-[#F97316] focus-visible:ring-[#F97316]"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center rounded-md bg-[#F97316]/10 px-2.5 py-1 text-xs font-bold text-[#F97316]">
                Akses: {user.role === "admin" ? "Administrator" : "Siswa"}
              </span>
            </div>
            <Button
              type="submit"
              disabled={isLoadingProfile}
              className="mt-6 rounded-lg bg-[#F97316] text-[#FFFFFF] hover:bg-[#EA580C]"
            >
              {isLoadingProfile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Edit Password */}
      <Card className="border border-[#94A3B8]/20 bg-[#FFFFFF] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg overflow-hidden">
        <CardHeader className="border-b border-[#94A3B8]/10 bg-[#FFFFFF]/50">
          <CardTitle className="font-serif text-xl font-bold text-[#0F172A]">Keamanan</CardTitle>
          <CardDescription className="text-[#94A3B8]">Ganti kata sandi akun Anda</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="font-semibold text-[#0F172A]">Password Saat Ini</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan password saat ini"
                  required
                  className="bg-[#FFFFFF] border-gray-300 focus:border-[#F97316] focus:ring-[#F97316] focus-visible:ring-[#F97316] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A]"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="font-semibold text-[#0F172A]">Password Baru</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru"
                  required
                  className="bg-[#FFFFFF] border-gray-300 focus:border-[#F97316] focus:ring-[#F97316] focus-visible:ring-[#F97316] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A]"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-semibold text-[#0F172A]">Konfirmasi Password Baru</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi password baru"
                  required
                  className="bg-[#FFFFFF] border-gray-300 focus:border-[#F97316] focus:ring-[#F97316] focus-visible:ring-[#F97316] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A]"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoadingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="mt-6 rounded-lg bg-[#F97316] text-[#FFFFFF] hover:bg-[#EA580C]"
            >
              {isLoadingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memperbarui...
                </>
              ) : (
                "Perbarui Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
