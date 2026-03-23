import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { register } from "../api/auth.api";
import { getApiErrorMessage } from "../api/errors";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useRedirectIfAuthenticated } from "../hooks/useRedirectIfAuthenticated";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export default function Register() {
  useRedirectIfAuthenticated();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register({ name, email, password });

      // Automatically login or redirect to login
      navigate("/login");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to register"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FDFBF0] font-sans text-[#0F172A] px-4">
      <Card className="w-full max-w-md border border-[#94A3B8]/20 bg-[#FFFFFF] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)]">
        <form onSubmit={handleRegister}>
          <CardHeader className="space-y-1">
            <CardTitle className="font-serif text-2xl font-bold text-[#0F172A]">
              Create an account
            </CardTitle>
            <CardDescription className="text-[#94A3B8]">
              Enter your details to get started with EcoDataLearn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold text-[#0F172A]">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-[#FFFFFF] border-gray-300 focus:border-[#F97316] focus:ring-[#F97316] focus-visible:ring-[#F97316]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-[#0F172A]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="yours@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#FFFFFF] border-gray-300 focus:border-[#F97316] focus:ring-[#F97316] focus-visible:ring-[#F97316]"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="font-semibold text-[#0F172A]"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-[#FFFFFF] border-gray-300 focus:border-[#F97316] focus:ring-[#F97316] focus-visible:ring-[#F97316] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full rounded-lg bg-[#F97316] text-[#FFFFFF] hover:bg-[#EA580C]"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign up"}
            </Button>
            <div className="text-center text-sm text-[#94A3B8]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#F97316] hover:text-[#EA580C] hover:underline"
              >
                Sign in
              </Link>
            </div>
            <div className="text-center text-sm">
              <Link
                to="/"
                className="text-[#94A3B8] hover:text-[#0F172A] hover:underline"
              >
                &larr; Back to Home
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
