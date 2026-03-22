import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-700">EcoDataLearn</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 text-center lg:py-32">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl">
          Understand Climate Change <br className="hidden sm:inline" />
          <span className="text-blue-600">Through Data Literacy</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl">
          Empower yourself with CODAP (Common Online Data Analysis Platform). 
          Explore real-world climate datasets, build essential data literacy skills, and discover the science behind our changing planet.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link to="/register">
            <Button size="lg" className="h-12 px-8 text-lg">
              Start Learning Now
            </Button>
          </Link>
          <a href="https://codap.concord.org/" target="_blank" rel="noreferrer">
            <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
              What is CODAP?
            </Button>
          </a>
        </div>

        {/* Features Matrix */}
        <div className="mt-24 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-8 text-left shadow-sm">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              {/* Icon placeholder */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
            </div>
            <h3 className="mb-2 text-xl font-bold">Interactive Data</h3>
            <p className="text-slate-600">Get hands-on experience using CODAP to manipulate and visualize real climate datasets.</p>
          </div>
          <div className="rounded-2xl border bg-white p-8 text-left shadow-sm">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-700">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l2-9 5 18 2-9h5"/></svg>
            </div>
            <h3 className="mb-2 text-xl font-bold">Climate Science</h3>
            <p className="text-slate-600">Understand the fundamental drivers of climate change through scientific evidence and data modeling.</p>
          </div>
          <div className="rounded-2xl border bg-white p-8 text-left shadow-sm">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h3 className="mb-2 text-xl font-bold">Data Literacy</h3>
            <p className="text-slate-600">Develop critical thinking skills to interpret statistics, graphs, and complex information reliably.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
