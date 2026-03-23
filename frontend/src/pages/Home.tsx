import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FDFBF0] font-sans text-[#0F172A]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#94A3B8]/20 bg-[#FDFBF0]/95 backdrop-blur supports-backdrop-filter:bg-[#FDFBF0]/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold text-[#F97316]">EcoDataLearn</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-[#F97316] hover:bg-[#F97316]/10 hover:text-[#F97316]">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="rounded-lg bg-[#F97316] text-white hover:bg-[#EA580C]">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto max-w-7xl px-4 py-16 text-center lg:py-32">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-[#0F172A] sm:text-5xl md:text-6xl lg:text-7xl">
          Understand Climate Change <br className="hidden sm:inline" />
          <span className="text-[#F97316]">Through Data Literacy</span>
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-[#94A3B8] sm:text-xl">
          Empower yourself with CODAP (Common Online Data Analysis Platform). 
          Explore real-world climate datasets, build essential data literacy skills, and discover the science behind our changing planet.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link to="/register">
            <Button size="lg" className="h-12 rounded-lg bg-[#F97316] px-8 text-lg text-white hover:bg-[#EA580C]">
              Start Learning Now
            </Button>
          </Link>
          <a href="https://codap.concord.org/" target="_blank" rel="noreferrer">
            <Button size="lg" variant="outline" className="h-12 rounded-lg border-2 border-[#0F172A] bg-transparent px-8 text-lg text-[#0F172A] hover:bg-[#0F172A]/5">
              What is CODAP?
            </Button>
          </a>
        </div>

        {/* Features Matrix - Course Cards Style */}
        <div className="mt-24 grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Card 1 */}
          <div className="rounded-lg border border-[#94A3B8]/20 bg-[#FFFFFF] p-8 text-left shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] transition-transform hover:-translate-y-1">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#F97316]/10 text-[#F97316]">
              {/* Icon placeholder */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
            </div>
            <h3 className="mb-3 font-serif text-xl font-bold text-[#0F172A]">Interactive Data</h3>
            <p className="leading-relaxed text-[#94A3B8]">Get hands-on experience using CODAP to manipulate and visualize real climate datasets.</p>
          </div>
          
          {/* Card 2 */}
          <div className="rounded-lg border border-[#94A3B8]/20 bg-[#FFFFFF] p-8 text-left shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] transition-transform hover:-translate-y-1">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#10B981]/10 text-[#10B981]">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l2-9 5 18 2-9h5"/></svg>
            </div>
            <h3 className="mb-3 font-serif text-xl font-bold text-[#0F172A]">Climate Science</h3>
            <p className="leading-relaxed text-[#94A3B8]">Understand the fundamental drivers of climate change through scientific evidence and data modeling.</p>
          </div>

          {/* Card 3 */}
          <div className="rounded-lg border border-[#94A3B8]/20 bg-[#FFFFFF] p-8 text-left shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] transition-transform hover:-translate-y-1">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#F59E0B]/10 text-[#F59E0B]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h3 className="mb-3 font-serif text-xl font-bold text-[#0F172A]">Data Literacy</h3>
            <p className="leading-relaxed text-[#94A3B8]">Develop critical thinking skills to interpret statistics, graphs, and complex information reliably.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
