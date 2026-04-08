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
    <div className="flex min-h-screen items-center justify-center bg-background font-sans text-foreground px-4">
      <Card className="w-full max-w-md text-center border-border/20 bg-background shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] rounded-lg">
        <CardHeader className="space-y-4 pt-8">
          <div className="flex justify-center mb-2">
            <div className="rounded-xl bg-background border border-border/20 p-5 shadow-sm">
              <FileQuestion className="h-14 w-14 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="font-serif text-5xl font-bold text-primary">404</CardTitle>
          <CardDescription className="text-xl font-serif font-bold text-foreground">
            Halaman Tidak Ditemukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-base leading-relaxed">
            Maaf, kami tidak dapat menemukan halaman yang Anda cari. Periksa kembali tautan Anda atau kembali ke halaman utama untuk melanjutkan pembelajaran.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 pb-8">
          <Button asChild className="w-full h-12 rounded-lg bg-primary text-white hover:bg-primary/90 text-lg font-semibold shadow-sm">
            <Link to="/">Kembali ke Beranda</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
