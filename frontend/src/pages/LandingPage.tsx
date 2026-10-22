// frontend/src/pages/LandingPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  PlayCircle, 
  CheckCircle2, 
  Sparkles, 
  FlaskConical, 
  Target, 
  Recycle, 
  Building2, 
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Cpu,
  Layers
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F7F8F3] text-[#202C25] flex flex-col selection:bg-[#B8E2C1] selection:text-[#202C25]">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 bg-[#F7F8F3]/90 backdrop-blur-md border-b border-[#DCE5DA]">
        <div className="max-w-[1360px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D0E3D1] border border-[#C2D8C4] flex items-center justify-center text-[#26734D] font-bold text-lg tracking-wide shadow-xs">
              IT
            </div>
            <div>
              <span className="font-bold text-[19px] leading-tight text-[#202C25] tracking-tight block">
                IndusTrace AI
              </span>
              <span className="text-[12px] text-[#56645A] block">
                Resource Recovery & Investigation
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-[#56645A]">
            <a href="#home" className="text-[#202C25] hover:text-[#26734D] transition">Home</a>
            <a href="#features" className="hover:text-[#26734D] transition">Features</a>
            <a href="#how-it-works" className="hover:text-[#26734D] transition">How It Works</a>
            <a href="#for-industries" className="hover:text-[#26734D] transition">For Industries</a>
            <a href="#evidence" className="hover:text-[#26734D] transition">Evidence Standards</a>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/signin"
              className="px-5 py-2.5 rounded-full text-[15px] font-semibold text-[#202C25] bg-[#FFFFFF] border border-[#DCE5DA] hover:bg-[#F0F5EC] transition shadow-2xs"
            >
              Sign In
            </Link>
            <Link
              to="/create-account"
              className="px-5 py-2.5 rounded-full text-[15px] font-semibold text-white bg-[#278653] hover:bg-[#227549] transition shadow-xs flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section id="home" className="relative pt-12 pb-20 md:py-24 overflow-hidden border-b border-[#DCE5DA]">
        <div className="max-w-[1360px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5EEE3] border border-[#C2D8C4] text-[#26734D] text-[13px] font-semibold tracking-wide">
              <Sparkles className="w-4 h-4" />
              <span>Sustainable Industries, Smarter Decisions</span>
            </div>

            <h1 className="text-[44px] sm:text-[54px] lg:text-[62px] font-bold text-[#202C25] leading-[1.08] tracking-tight">
              From Industrial Waste to{' '}
              <span className="text-[#26734D] italic font-serif">Valuable Opportunities</span>
            </h1>

            <p className="text-[17px] sm:text-[18px] text-[#56645A] leading-relaxed max-w-2xl">
              AI-powered decision support helping manufacturing facilities investigate waste streams, identify critical information gaps, prioritize certified laboratory testing, and unlock resource recovery pathways.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/create-account"
                className="px-7 py-3.5 rounded-full bg-[#278653] hover:bg-[#227549] text-white font-semibold text-[16px] shadow-sm flex items-center gap-2 transition"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#how-it-works"
                className="px-6 py-3.5 rounded-full bg-[#FFFFFF] border border-[#DCE5DA] hover:bg-[#F0F5EC] text-[#202C25] font-semibold text-[16px] shadow-2xs flex items-center gap-2 transition"
              >
                <PlayCircle className="w-5 h-5 text-[#26734D]" />
                <span>Explore How It Works</span>
              </a>
            </div>

            {/* Metrics highlight strip */}
            <div className="pt-8 border-t border-[#DCE5DA] grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <p className="text-[28px] font-bold text-[#202C25] leading-tight">100+</p>
                <p className="text-[13px] text-[#56645A] mt-0.5 font-medium">Industries Supported</p>
              </div>
              <div>
                <p className="text-[28px] font-bold text-[#26734D] leading-tight">6x</p>
                <p className="text-[13px] text-[#56645A] mt-0.5 font-medium">Factor Investigation</p>
              </div>
              <div>
                <p className="text-[28px] font-bold text-[#202C25] leading-tight">Data-Driven</p>
                <p className="text-[13px] text-[#56645A] mt-0.5 font-medium">Recommendations</p>
              </div>
              <div>
                <p className="text-[28px] font-bold text-[#26734D] leading-tight">Sustainable</p>
                <p className="text-[13px] text-[#56645A] mt-0.5 font-medium">Resource Recovery</p>
              </div>
            </div>
          </div>

          {/* Right Hero Image Card Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#DCE5DA] bg-[#E5EEE3]">
              <img
                src="/images/landing-hero.jpg"
                alt="Modern sustainable manufacturing plant"
                className="w-full h-[480px] object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#10271E]/70 via-[#10271E]/20 to-transparent"></div>
              
              {/* Floating Pill on image */}
              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-[#FFFFFF]/95 backdrop-blur-md border border-[#DCE5DA] shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E5EEE3] flex items-center justify-center text-[#26734D]">
                    <Recycle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[16px] text-[#202C25]">Circular Industrial Intelligence</h4>
                    <p className="text-[13px] text-[#56645A] mt-0.5">Turning Waste into a Better Tomorrow</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Pillars / Feature Cards */}
      <section id="features" className="py-20 bg-[#FFFFFF] border-b border-[#DCE5DA]">
        <div className="max-w-[1360px] mx-auto px-6 lg:px-12 space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-[13px] font-semibold text-[#26734D] uppercase tracking-wider">
              Comprehensive Platform Capabilities
            </span>
            <h2 className="text-[36px] font-bold text-[#202C25] tracking-tight">
              Evidence-Based Decision Support for Modern Manufacturing
            </h2>
            <p className="text-[16px] text-[#56645A]">
              Avoid guesswork, reduce disposal costs, and comply with strict industrial engineering standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-7 rounded-2xl bg-[#F0F5EC] border border-[#DCE5DA] space-y-4 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-[#FFFFFF] border border-[#DCE5DA] flex items-center justify-center text-[#26734D] shadow-2xs">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[19px] text-[#202C25]">Multi-Facility Scoping</h3>
              <p className="text-[14px] text-[#56645A] leading-relaxed">
                Map generation points across production plants, CNC centers, and chemical surface lines with full operational isolation.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#F0F5EC] border border-[#DCE5DA] space-y-4 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-[#FFFFFF] border border-[#DCE5DA] flex items-center justify-center text-[#26734D] shadow-2xs">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[19px] text-[#202C25]">6-Factor TWS Prioritization</h3>
              <p className="text-[14px] text-[#56645A] leading-relaxed">
                Transparent Test Worthiness Score ranks testing urgency based on quantity, information gaps, and intrinsic matrix values.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#F0F5EC] border border-[#DCE5DA] space-y-4 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-[#FFFFFF] border border-[#DCE5DA] flex items-center justify-center text-[#26734D] shadow-2xs">
                <FlaskConical className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[19px] text-[#202C25]">Lab Qualifier Integrity</h3>
              <p className="text-[14px] text-[#56645A] leading-relaxed">
                Faithful preservation of reported qualifiers (&lt;0.030, ND, bal.) separating confirmed assays from reference benchmarks.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#F0F5EC] border border-[#DCE5DA] space-y-4 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-[#FFFFFF] border border-[#DCE5DA] flex items-center justify-center text-[#26734D] shadow-2xs">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[19px] text-[#202C25]">Guarded Recovery Economics</h3>
              <p className="text-[14px] text-[#56645A] leading-relaxed">
                Rigorous thermodynamic and mass-balance calculations preventing exaggerated yield or profitability claims.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Step by Step "How It Works" */}
      <section id="how-it-works" className="py-20 bg-[#F7F8F3] border-b border-[#DCE5DA]">
        <div className="max-w-[1360px] mx-auto px-6 lg:px-12 space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[13px] font-semibold text-[#26734D] uppercase tracking-wider">
              Systematic Methodology
            </span>
            <h2 className="text-[36px] font-bold text-[#202C25] tracking-tight">
              How IndusTrace AI Guides Your Plant
            </h2>
            <p className="text-[16px] text-[#56645A]">
              From uncharacterized waste generation to validated secondary resource recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#DCE5DA] shadow-xs space-y-4 relative">
              <div className="w-9 h-9 rounded-full bg-[#E5EEE3] text-[#26734D] font-bold text-sm flex items-center justify-center">
                1
              </div>
              <h4 className="font-bold text-[18px] text-[#202C25]">Register Stream</h4>
              <p className="text-[14px] text-[#56645A] leading-relaxed">
                Record process details, generation rates, and observed handling without fabricated assumptions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#DCE5DA] shadow-xs space-y-4 relative">
              <div className="w-9 h-9 rounded-full bg-[#E5EEE3] text-[#26734D] font-bold text-sm flex items-center justify-center">
                2
              </div>
              <h4 className="font-bold text-[18px] text-[#202C25]">TWS Audit</h4>
              <p className="text-[14px] text-[#56645A] leading-relaxed">
                The engine evaluates missing data and prioritizes testing urgency to prevent costly blind lab spend.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#DCE5DA] shadow-xs space-y-4 relative">
              <div className="w-9 h-9 rounded-full bg-[#E5EEE3] text-[#26734D] font-bold text-sm flex items-center justify-center">
                3
              </div>
              <h4 className="font-bold text-[18px] text-[#202C25]">Assay Verification</h4>
              <p className="text-[14px] text-[#56645A] leading-relaxed">
                Enter certified chemical assay data with analytical detection limit preservation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#DCE5DA] shadow-xs space-y-4 relative">
              <div className="w-9 h-9 rounded-full bg-[#E5EEE3] text-[#26734D] font-bold text-sm flex items-center justify-center">
                4
              </div>
              <h4 className="font-bold text-[18px] text-[#202C25]">Model Recovery</h4>
              <p className="text-[14px] text-[#56645A] leading-relaxed">
                Simulate recovery mass balances, commodity values, and net benefits under explicit assumptions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Supported Industries */}
      <section id="for-industries" className="py-20 bg-[#FFFFFF] border-b border-[#DCE5DA]">
        <div className="max-w-[1360px] mx-auto px-6 lg:px-12 space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-[13px] font-semibold text-[#26734D] uppercase tracking-wider">
              Target Manufacturing Sectors
            </span>
            <h2 className="text-[36px] font-bold text-[#202C25] tracking-tight">
              Tailored for Complex Industrial Waste Matrices
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-[#DCE5DA] overflow-hidden bg-[#F0F5EC]">
              <img src="/images/facility-cnc.jpg" alt="Metal fabrication" className="w-full h-48 object-cover" />
              <div className="p-6 space-y-3">
                <h3 className="font-bold text-[19px] text-[#202C25]">Metal Fabrication & Machining</h3>
                <p className="text-[14px] text-[#56645A] leading-relaxed">
                  High-value turnings, dry/wet aluminium & titanium swarf, stamping offcuts, and briquetted machining chips.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#DCE5DA] overflow-hidden bg-[#F0F5EC]">
              <img src="/images/facility-surface.jpg" alt="Electroplating & Finishing" className="w-full h-48 object-cover" />
              <div className="p-6 space-y-3">
                <h3 className="font-bold text-[19px] text-[#202C25]">Electroplating & Surface Treatment</h3>
                <p className="text-[14px] text-[#56645A] leading-relaxed">
                  Neutralized metal-hydroxide sludges, spent acid pickling liquors, nickel baths, and rinse wastewater concentrates.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#DCE5DA] overflow-hidden bg-[#F0F5EC]">
              <img src="/images/facility-main.jpg" alt="Automotive Metallurgy" className="w-full h-48 object-cover" />
              <div className="p-6 space-y-3">
                <h3 className="font-bold text-[19px] text-[#202C25]">Automotive Components & Foundries</h3>
                <p className="text-[14px] text-[#56645A] leading-relaxed">
                  Cast iron dross, copper commutator tailings, spent mould sands, baghouse filter dusts, and furnace slag.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Scientific & Evidence Standards Section */}
      <section id="evidence" className="py-20 bg-[#F7F8F3] border-b border-[#DCE5DA]">
        <div className="max-w-[1360px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[13px] font-semibold text-[#26734D] uppercase tracking-wider">
              Research & Scientific Boundaries
            </span>
            <h2 className="text-[36px] font-bold text-[#202C25] tracking-tight">
              No Fabricated Assumptions. Strict Engineering Guardrails.
            </h2>
            <div className="space-y-4 text-[15px] text-[#56645A] leading-relaxed">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#26734D] flex-shrink-0 mt-1" />
                <p>
                  <strong>Literature Rules vs Plant Reality:</strong> Reference benchmarks from peer-reviewed publications highlight what to investigate, but never substitute for certified testing of plant samples.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#26734D] flex-shrink-0 mt-1" />
                <p>
                  <strong>Material Compatibility Checks:</strong> The engine automatically flags metallurgical impossibilities (e.g., claiming 30% copper in standard aluminium scrap).
                </p>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#26734D] flex-shrink-0 mt-1" />
                <p>
                  <strong>Transparent Assumptions:</strong> If recovery is calculated on an unassayed stream, the system mandates an explicit Hypothetical Scenario label.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="p-8 rounded-3xl bg-[#FFF5DD] border border-[#E8D8A7] space-y-4 shadow-sm">
              <h3 className="font-bold text-[20px] text-[#8A5A00]">University IDEA Lab Research Standard</h3>
              <p className="text-[14px] text-[#8A5A00]/90 leading-relaxed">
                IndusTrace AI was developed under the guidance of Dr. Abhishek Sahu for Semester V, Session 2026–27. 
                Its decision-support architecture provides advisory pathways and does not constitute statutory environmental clearance.
              </p>
              <div className="pt-4 border-t border-[#E8D8A7]/70 text-[13px] text-[#8A5A00] font-medium flex flex-wrap gap-4">
                <span>Deeya Saoji (Roll 50)</span>
                <span>Simran Chawla (Roll 28)</span>
                <span>Shriram Gosavi (Roll 58)</span>
                <span>Anushree Agrawal (Roll 45)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Call To Action Banner */}
      <section className="py-20 bg-[#E5EEE3] border-b border-[#DCE5DA]">
        <div className="max-w-[1360px] mx-auto px-6 lg:px-12 text-center space-y-6">
          <h2 className="text-[36px] sm:text-[44px] font-bold text-[#202C25] tracking-tight">
            Ready to Investigate Your Manufacturing Waste Streams?
          </h2>
          <p className="text-[17px] text-[#56645A] max-w-2xl mx-auto">
            Create an enterprise company workspace in under two minutes. No credit card required.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link
              to="/create-account"
              className="px-8 py-3.5 rounded-full bg-[#278653] hover:bg-[#227549] text-white font-semibold text-[16px] shadow-sm flex items-center gap-2 transition"
            >
              <span>Create Free Company Account</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="py-12 bg-[#FFFFFF] text-[#56645A] text-[14px]">
        <div className="max-w-[1360px] mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#D0E3D1] text-[#26734D] font-bold flex items-center justify-center text-sm">
              IT
            </div>
            <span className="font-semibold text-[#202C25]">IndusTrace AI Platform</span>
          </div>

          <p className="text-[13px] text-[#778279]">
            © 2026–27 IndusTrace AI. Engineering Decision Support System • IDEA Lab
          </p>

          <div className="flex items-center gap-6 text-[13px]">
            <Link to="/signin" className="hover:text-[#202C25] transition">Sign In</Link>
            <Link to="/create-account" className="hover:text-[#202C25] transition">Onboarding</Link>
            <Link to="/console" className="hover:text-[#202C25] transition font-medium text-[#26734D]">Research Console</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
