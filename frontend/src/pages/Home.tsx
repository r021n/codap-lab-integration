import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { useState, useEffect } from "react"
import ConfirmDialog from "../components/ui/confirm-dialog"
import codapImg from "../assets/features/codap.png"
import virtualLabImg from "../assets/features/virtual_lab.png"
import quizImg from "../assets/features/quiz.png"

const features = [
  {
    title: "CODAP",
    description: "Analisis data secara interaktif berdasarkan data yang sudah disediakan untuk membangun literasi data.",
    image: codapImg,
    link: "/investigasi"
  },
  {
    title: "Virtual Lab",
    description: "Lakukan percobaan secara virtual dengan simulasi alat dan bahan yang realistis.",
    image: virtualLabImg,
    link: "/virtual-lab"
  },
  {
    title: "Kuis",
    description: "Latih pemahamanmu dengan berbagai kuis interaktif yang mengasah kemampuan berpikir.",
    image: quizImg,
    link: "/quiz"
  }
];

const faqs = [
  {
    question: "Apa itu CODAP?",
    answer: "CODAP adalah platform analisis data online yang mudah digunakan dan interaktif, dirancang khusus untuk pembelajaran."
  },
  {
    question: "Bagaimana cara mengakses Virtual Lab?",
    answer: "Anda dapat mengakses Virtual Lab melalui menu utama setelah Anda melakukan login ke dalam platform kami."
  },
  {
    question: "Apakah aplikasi ini gratis?",
    answer: "Ya, platform pembelajaran ini dapat diakses secara gratis untuk keperluan edukasi dan peningkatan literasi data."
  }
];

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      setIsLoggedIn(true)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeatureIndex((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setIsLoggedIn(false)
  }

  const toggleFaq = (index: number) => {
    if (openFaqIndex === index) {
      setOpenFaqIndex(null);
    } else {
      setOpenFaqIndex(index);
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF0] font-sans text-[#0F172A] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#94A3B8]/20 bg-[#FDFBF0]/95 backdrop-blur supports-backdrop-filter:bg-[#FDFBF0]/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold text-[#F97316]">AirDataLabs</span>
          </div>
          <nav className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Link to="/dashboard">
                  <Button className="rounded-lg bg-[#F97316] text-white hover:bg-[#EA580C]">
                    To Dashboard
                  </Button>
                </Link>
                <Button 
                  onClick={() => setLogoutConfirmOpen(true)}
                  variant="ghost" 
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
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
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto max-w-7xl px-4 py-16 text-center lg:py-32">
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
        </section>

        {/* Features Section */}
        <section className="container mx-auto max-w-7xl px-4 py-16">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-bold text-[#0F172A] sm:text-4xl mb-4">Fitur Utama Platform</h2>
            <p className="text-lg text-[#94A3B8] max-w-2xl mx-auto">
              Berbagai fasilitas yang kami sediakan untuk menunjang pembelajaran yang interaktif dan mendalam.
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2 flex flex-col gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                    activeFeatureIndex === index 
                      ? "border-[#F97316] bg-[#FFFFFF] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] scale-[1.02] transform z-10" 
                      : "border-transparent bg-transparent hover:bg-[#FFFFFF]/50 opacity-60"
                  }`}
                  onClick={() => setActiveFeatureIndex(index)}
                >
                  <h3 className={`font-serif text-2xl font-bold mb-3 transition-colors ${
                    activeFeatureIndex === index ? "text-[#F97316]" : "text-[#0F172A]"
                  }`}>
                    {feature.title}
                  </h3>
                  <p className="text-[#94A3B8] leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  {activeFeatureIndex === index && (
                    <Link to={feature.link}>
                      <span className="inline-flex items-center text-[#F97316] font-semibold hover:text-[#EA580C] transition-colors">
                        Mulai Pelajari
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </span>
                    </Link>
                  )}
                </div>
              ))}
            </div>

            <div className="w-full lg:w-1/2 h-[350px] sm:h-[450px] relative perspective-1000">
              <div className="relative w-full h-full flex items-center justify-center">
                {features.map((feature, index) => {
                  let offset = (index - activeFeatureIndex + features.length) % features.length;
                  
                  let zIndex = 30 - offset * 10;
                  let scale = 1 - offset * 0.1;
                  let translateY = offset * 25;
                  let translateX = offset * 15;
                  let opacity = 1 - offset * 0.4;
                  
                  return (
                    <div 
                      key={index}
                      className="absolute top-0 left-0 w-full h-full p-4 transition-all duration-700 ease-in-out flex items-center justify-center"
                      style={{
                        zIndex: zIndex,
                        transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
                        opacity: opacity,
                      }}
                    >
                      <img 
                        src={feature.image} 
                        alt={feature.title} 
                        className="w-full h-full object-cover rounded-xl shadow-xl bg-[#FFFFFF] border border-[#94A3B8]/20 ring-4 ring-white/50"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-[#FFFFFF] border-y border-[#94A3B8]/20 mt-16 py-24">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl font-bold text-[#0F172A] sm:text-4xl mb-4">Pertanyaan Seputar Platform</h2>
              <p className="text-lg text-[#94A3B8]">
                Beberapa hal yang sering ditanyakan mengenai platform edukasi kami.
              </p>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={`border border-[#94A3B8]/20 rounded-lg bg-[#FDFBF0] transition-colors ${openFaqIndex === index ? "border-[#F97316] ring-1 ring-[#F97316]/20" : "hover:border-[#94A3B8]/50"}`}
                >
                  <button 
                    className="w-full px-6 py-5 flex items-center justify-between focus:outline-none"
                    onClick={() => toggleFaq(index)}
                  >
                    <span className="font-semibold text-[#0F172A] text-left text-lg">{faq.question}</span>
                    <span className={`transform transition-transform duration-300 text-[#F97316] ${openFaqIndex === index ? "rotate-180" : ""}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </span>
                  </button>
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaqIndex === index ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    <div className="px-6 pb-5 text-[#94A3B8] leading-relaxed text-base">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer Section */}
      <footer className="bg-[#0F172A] text-white py-16 mt-auto">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <span className="font-serif text-2xl font-bold text-[#F97316]">AirDataLabs</span>
              <p className="mt-6 text-[#94A3B8] leading-relaxed max-w-sm">
                Membangun literasi data untuk memahami perubahan iklim melalui platform edukasi yang interaktif dan komprehensif.
              </p>
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold mb-6 text-white">Tautan Cepat</h4>
              <ul className="space-y-3 text-[#94A3B8]">
                <li><Link to="/investigasi" className="hover:text-[#F97316] transition-colors">CODAP Investigasi</Link></li>
                <li><Link to="/virtual-lab" className="hover:text-[#F97316] transition-colors">Virtual Lab</Link></li>
                <li><Link to="/quiz" className="hover:text-[#F97316] transition-colors">Kuis</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold mb-6 text-white">Hubungi Kami</h4>
              <ul className="space-y-3 text-[#94A3B8]">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  support@airdatalabs.com
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  +62 812 3456 7890
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#94A3B8]/20 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between text-[#94A3B8]">
            <p>&copy; {new Date().getFullYear()} AirDataLabs. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
               <span className="text-sm hover:text-[#FFFFFF] cursor-pointer">Privacy Policy</span>
               <span className="text-sm hover:text-[#FFFFFF] cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

      <ConfirmDialog
        open={logoutConfirmOpen}
        onConfirm={() => {
          setLogoutConfirmOpen(false);
          handleLogout();
        }}
        onCancel={() => setLogoutConfirmOpen(false)}
        title="Konfirmasi Logout"
        description="Apakah Anda yakin ingin logout?"
        confirmText="Ya, Logout"
        cancelText="Batal"
        variant="danger"
      />
    </div>
  )
}
