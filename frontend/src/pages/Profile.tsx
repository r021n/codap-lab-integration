import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { updatePassword, updateProfile, type User } from "../api/auth.api";
import { getApiErrorMessage } from "../api/errors";
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

type ProfileProps = {
  user: User;
  setUser: (user: User) => void;
};

export default function Profile({ user, setUser }: ProfileProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [school, setSchool] = useState(user.school || "");
  const [userClass, setUserClass] = useState(user.class || "");
  const [age, setAge] = useState(user.age?.toString() || "");
  const [gender, setGender] = useState(user.gender || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error";
    title: string;
    description: string;
  } | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (
    type: "success" | "error",
    title: string,
    description: string,
  ) => {
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
      const data = await updateProfile({
        name,
        email,
        school,
        class: userClass,
        age: age ? parseInt(age) : undefined,
        gender,
      });
      showToast("success", "Berhasil", "Profil berhasil diperbarui!");
      setUser({
        ...user,
        name: data.user?.name || name,
        email: data.user?.email || email,
        school: data.user?.school || school,
        class: data.user?.class || userClass,
        age: data.user?.age || (age ? parseInt(age) : undefined),
        gender: data.user?.gender || gender,
      });
    } catch (err: unknown) {
      showToast("error", "Gagal", getApiErrorMessage(err, "Terjadi kesalahan"));
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
      await updatePassword({ currentPassword, newPassword });

      showToast("success", "Berhasil", "Password berhasil diperbarui!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      showToast("error", "Gagal", getApiErrorMessage(err, "Terjadi kesalahan"));
    } finally {
      setIsLoadingPassword(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 sm:space-y-8 relative">
      {/* Toast Notification */}
      {toast && toast.show && (
        <div className="fixed inset-x-0 bottom-3 z-50 flex justify-center px-3 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:px-0 md:max-w-105">
          <div className="pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 pr-6 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] transition-all border-border/20 bg-background text-foreground">
            <div className="flex gap-3">
              {toast.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              )}
              <div className="grid gap-1">
                <div className="text-sm font-semibold">{toast.title}</div>
                <div className="text-sm opacity-90 text-muted-foreground">
                  {toast.description}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="mb-6 sm:mb-8">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
          Pengaturan Profil
        </h1>
        <p className="mt-2 text-base sm:text-lg text-muted-foreground">
          Perbarui informasi akun dan kata sandi Anda
        </p>
      </header>

      {/* Edit Profile */}
      <Card className="border border-border/20 bg-background shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg overflow-hidden">
        <CardHeader className="border-b border-border/10 bg-background/50 p-4 sm:p-6">
          <CardTitle className="font-serif text-lg sm:text-xl font-bold text-foreground">
            Detail Profil
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Ubah nama atau alamat email Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6">
          <form
            onSubmit={handleUpdateProfile}
            className="space-y-4 sm:space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold text-foreground">
                Nama Lengkap
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Lengkap"
                required
                className="h-10 bg-background border-gray-300 focus:border-primary focus:ring-primary focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-foreground">
                Alamat Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="h-10 bg-background border-gray-300 focus:border-primary focus:ring-primary focus-visible:ring-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="school"
                  className="font-semibold text-foreground"
                >
                  Sekolah
                </Label>
                <Input
                  id="school"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="Nama Sekolah"
                  required
                  className="h-10 bg-background border-gray-300 focus:border-primary focus:ring-primary focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="class"
                  className="font-semibold text-foreground"
                >
                  Kelas
                </Label>
                <Input
                  id="class"
                  value={userClass}
                  onChange={(e) => setUserClass(e.target.value)}
                  placeholder="Contoh: 10A"
                  required
                  className="h-10 bg-background border-gray-300 focus:border-primary focus:ring-primary focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="age" className="font-semibold text-foreground">
                  Usia
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="15"
                  required
                  className="h-10 bg-background border-gray-300 focus:border-primary focus:ring-primary focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="gender"
                  className="font-semibold text-foreground"
                >
                  Jenis Kelamin
                </Label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-base sm:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Pilih...</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                Akses: {user.role === "admin" ? "Administrator" : "Siswa"}
              </span>
            </div>
            <Button
              type="submit"
              disabled={isLoadingProfile}
              className="mt-4 sm:mt-6 h-10 w-full sm:w-auto rounded-lg bg-primary text-white hover:bg-primary/90"
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
      <Card className="border border-border/20 bg-background shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg overflow-hidden">
        <CardHeader className="border-b border-border/10 bg-background/50 p-4 sm:p-6">
          <CardTitle className="font-serif text-lg sm:text-xl font-bold text-foreground">
            Keamanan
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Ganti kata sandi akun Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6">
          <form
            onSubmit={handleUpdatePassword}
            className="space-y-4 sm:space-y-5"
          >
            <div className="space-y-2">
              <Label
                htmlFor="currentPassword"
                className="font-semibold text-foreground"
              >
                Password Saat Ini
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan password saat ini"
                  required
                  className="h-10 bg-background border-gray-300 focus:border-primary focus:ring-primary focus-visible:ring-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  aria-label={
                    showCurrentPassword
                      ? "Sembunyikan password saat ini"
                      : "Tampilkan password saat ini"
                  }
                >
                  {showCurrentPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="newPassword"
                className="font-semibold text-foreground"
              >
                Password Baru
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru"
                  required
                  className="h-10 bg-background border-gray-300 focus:border-primary focus:ring-primary focus-visible:ring-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  aria-label={
                    showNewPassword
                      ? "Sembunyikan password baru"
                      : "Tampilkan password baru"
                  }
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="font-semibold text-foreground"
              >
                Konfirmasi Password Baru
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi password baru"
                  required
                  className="h-10 bg-background border-gray-300 focus:border-primary focus:ring-primary focus-visible:ring-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  aria-label={
                    showConfirmPassword
                      ? "Sembunyikan konfirmasi password baru"
                      : "Tampilkan konfirmasi password baru"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={
                isLoadingPassword ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
              className="mt-4 sm:mt-6 h-10 w-full sm:w-auto rounded-lg bg-primary text-white hover:bg-primary/90"
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
