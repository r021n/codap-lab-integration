import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md text-center border-none shadow-sm md:border-solid md:shadow-md">
        <CardHeader className="space-y-2">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-slate-100 p-4">
              <FileQuestion className="h-12 w-12 text-slate-400" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold text-slate-800">404</CardTitle>
          <CardDescription className="text-lg">
            Halaman Tidak Ditemukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">
            Maaf, kami tidak dapat menemukan halaman yang Anda cari. Periksa kembali tautan Anda atau kembali ke halaman utama.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button asChild className="w-full" size="lg">
            <Link to="/">Kembali ke Beranda</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
