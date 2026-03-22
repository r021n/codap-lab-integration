import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { Button } from "../components/ui/button";
import SidePanel from "../components/SidePanel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

type User = {
  name: string;
  email: string;
  role: string;
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const navigate = useNavigate();

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

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600">Welcome back, {user.name}!</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => setIsPanelOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* User Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Name</span>
                  <span className="font-semibold">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Email</span>
                  <span className="font-semibold">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Role</span>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                    {user.role}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Specific Card (Only visible if role === 'admin') */}
          {user.role === "admin" && (
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-purple-900">Admin Actions</CardTitle>
                <CardDescription className="text-purple-700">
                  Manage platform resources
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  Manage Users
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-purple-300 text-purple-700 hover:bg-purple-100"
                >
                  System Settings
                </Button>
              </CardContent>
            </Card>
          )}

          {/* CODAP Datasets (Placeholder for actual content) */}
          <Card className="md:col-span-2 lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Datasets</CardTitle>
              <CardDescription>
                Climate datasets available for analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "Global Temperature Anomalies",
                    date: "1880-2023",
                    tags: ["Temperature", "Global"],
                  },
                  {
                    title: "Ocean Heat Content",
                    date: "1955-2023",
                    tags: ["Ocean", "Heat"],
                  },
                  {
                    title: "Arctic Sea Ice Extent",
                    date: "1979-2024",
                    tags: ["Ice", "Arctic"],
                  },
                ].map((dataset, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-slate-50"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-900">
                        {dataset.title}
                      </h4>
                      <p className="text-sm text-slate-500">
                        Timeframe: {dataset.date}
                      </p>
                    </div>
                    <Button variant="secondary" size="sm">
                      Open in CODAP
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <SidePanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
        user={user}
        onProfileUpdate={(updatedUser) => setUser({ ...user, ...updatedUser })}
      />
    </div>
  );
}
