'use client'

import { Suspense, lazy, useState } from 'react'
import {
  ArrowRight, Layers, Zap, Users2, ShieldCheck, Globe2,
  Cpu, Building2, Box, MousePointer2, Share2, Play,
  Check, ChevronRight, Sparkles, Eye, FolderOpen, Download,
  Palette, Grid3X3, LayoutGrid, Star, GitBranch, Package,
} from 'lucide-react'
import Link from 'next/link'

const HeroCanvas = lazy(() => import('./_components/HeroCanvas'))

/* ── Design tokens (mirror Archly.html CSS vars) ── */
const t = {
  accent: '#3DCBFF',
  accentDeep: '#0AA9E2',
  bg: '#0E0F11',
  bgElev: '#16181B',
  bgElev2: '#1D2024',
  ink: '#F4F5F7',
  inkMid: '#A8ADB4',
  inkLow: '#6B7079',
  line: 'rgba(255,255,255,0.08)',
  lineStrong: 'rgba(255,255,255,0.16)',
}

function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="relative group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-[15px] text-black overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
      style={{ background: t.accent }}
    >
      <span
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: t.accentDeep }}
      />
      <span className="absolute inset-x-0 top-0 h-px bg-white/30" />
      <span className="relative flex items-center gap-2">{children}</span>
    </Link>
  )
}

function GhostButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="relative group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-[15px] overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
      style={{ color: t.ink, border: `1px solid ${t.line}`, background: 'rgba(255,255,255,0.03)' }}
    >
      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(255,255,255,0.04)' }} />
      <span className="relative flex items-center gap-2">{children}</span>
    </Link>
  )
}

export default function LandingPage() {
  const [activeUseCase, setActiveUseCase] = useState(0)
  const useCases = [
    { title: 'Architecture', icon: <Building2 className="w-5 h-5" />, desc: 'Create detailed building models with parametric walls, slabs, roofs, and intelligent room layouts. Iterate with your team in real-time.', features: ['Parametric building elements', 'Multi-level editing', 'Material library'] },
    { title: 'Real Estate', icon: <LayoutGrid className="w-5 h-5" />, desc: 'Present interactive 3D walkthroughs to clients. Showcase properties with photorealistic materials and lighting before construction begins.', features: ['Interactive presentations', 'First-person walkthroughs', 'One-click sharing'] },
    { title: 'Construction', icon: <Grid3X3 className="w-5 h-5" />, desc: 'Coordinate across teams with shared project workspaces. Track changes, manage versions, and keep everyone aligned on the latest design.', features: ['Version history', 'Team permissions', 'Export to CAD formats'] },
  ]

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: t.bg, color: t.ink, fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, sans-serif' }}>

      {/* ── NAVBAR ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
        style={{ borderBottom: `1px solid ${t.line}`, background: `${t.bg}cc` }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: t.accent }}>
              <Box className="w-4 h-4" style={{ color: '#000' }} />
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ color: t.ink }}>archly</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[13px] font-medium" style={{ color: t.inkMid }}>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#use-cases" className="hover:text-white transition-colors">Use Cases</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:block text-[13px] font-medium transition-colors px-3 py-1.5"
              style={{ color: t.inkMid }}
            >
              Sign In
            </Link>
            <PrimaryButton href="/signup">Get Started Free</PrimaryButton>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-36 pb-0 px-6 overflow-hidden" style={{ minHeight: '100vh' }}>
        {/* Ambient glow — cyan */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full pointer-events-none blur-[180px]" style={{ background: 'rgba(61,203,255,0.10)' }} />
        <div className="absolute top-60 right-1/4 w-64 h-64 rounded-full pointer-events-none blur-[120px]" style={{ background: 'rgba(10,169,226,0.07)' }} />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-8"
            style={{ border: `1px solid rgba(61,203,255,0.25)`, background: 'rgba(61,203,255,0.07)', color: t.accent }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Now in Open Beta — Free for teams up to 5
            <ArrowRight className="w-3 h-3" />
          </div>

          {/* Headline — mixed serif / sans */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-[-0.035em] mb-6 leading-[1.05]">
            <span style={{ background: 'linear-gradient(to bottom, #fff 60%, rgba(255,255,255,0.4))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Design buildings{' '}
            </span>
            <span
              className="italic"
              style={{
                fontFamily: '"Instrument Serif", Georgia, serif',
                background: `linear-gradient(135deg, ${t.accent}, ${t.accentDeep})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              together,
            </span>
            <br className="hidden sm:block" />
            <span style={{ background: 'linear-gradient(to bottom, #fff 60%, rgba(255,255,255,0.4))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {' '}in real-time.
            </span>
          </h1>

          <p className="text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: t.inkMid }}>
            Archly is the collaborative 3D spatial platform built for architecture, real estate, and construction teams. Powered by WebGPU for native performance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <PrimaryButton href="/signup">
              Start Building Free <ArrowRight className="w-4 h-4" />
            </PrimaryButton>
            <GhostButton href="/playground">
              <Play className="w-4 h-4" /> Try the Playground
            </GhostButton>
          </div>
        </div>

        {/* 3D Hero Canvas */}
        <div
          className="mt-16 max-w-6xl mx-auto"
          style={{ animation: 'drift 8s ease-in-out infinite' }}
        >
          <div
            className="relative p-px rounded-2xl overflow-hidden"
            style={{ background: `linear-gradient(180deg, ${t.lineStrong} 0%, ${t.line} 100%)` }}
          >
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(61,203,255,0.3), transparent)` }} />
            <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden relative" style={{ background: '#080A0D' }}>
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(61,203,255,0.03)' }}>
                  <Box className="w-16 h-16 animate-pulse" style={{ color: t.inkLow }} />
                </div>
              }>
                <HeroCanvas />
              </Suspense>

              {/* Presence cursors */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[28%] left-[22%] flex flex-col items-start gap-0.5 animate-pulse">
                  <MousePointer2 className="w-4 h-4 fill-current drop-shadow-lg" style={{ color: t.accent }} />
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md ml-3 shadow-lg text-black" style={{ background: t.accent }}>Sarah K.</span>
                </div>
                <div className="absolute top-[52%] right-[28%] flex flex-col items-start gap-0.5 animate-pulse" style={{ animationDelay: '1s' }}>
                  <MousePointer2 className="w-4 h-4 text-emerald-400 fill-emerald-400 drop-shadow-lg" />
                  <span className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md ml-3 shadow-lg">Marcus R.</span>
                </div>
                <div className="absolute bottom-[22%] left-[48%] flex flex-col items-start gap-0.5 animate-pulse" style={{ animationDelay: '2s' }}>
                  <MousePointer2 className="w-4 h-4 text-amber-400 fill-amber-400 drop-shadow-lg" />
                  <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md ml-3 shadow-lg">Alex T.</span>
                </div>
              </div>

              {/* Bottom fade */}
              <div className="absolute inset-x-0 bottom-0 h-32" style={{ background: `linear-gradient(to top, ${t.bg}, transparent)` }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGOS STRIP ── */}
      <section className="py-16" style={{ borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}` }}>
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] mb-10" style={{ color: t.inkLow }}>Trusted by forward-thinking teams</p>
          <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-6 opacity-20">
            {[Building2, Globe2, Layers, ShieldCheck, Cpu].map((Icon, i) => <Icon key={i} className="w-28 h-10" />)}
          </div>
        </div>
      </section>

      {/* ── BENTO FEATURE GRID ── */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-semibold text-sm uppercase tracking-widest mb-4" style={{ color: t.accent }}>Platform</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Everything you need
              <br />
              <span className="italic" style={{ fontFamily: '"Instrument Serif", Georgia, serif', color: t.accent }}>to build together.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Real-Time Sync — wide */}
            <div
              className="md:col-span-2 relative rounded-3xl p-8 overflow-hidden group transition-all min-h-[300px]"
              style={{ border: `1px solid ${t.line}`, background: `rgba(255,255,255,0.02)` }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = `rgba(61,203,255,0.25)`)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = t.line)}
            >
              <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(61,203,255,0.2), transparent)` }} />
              <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full blur-[80px]" style={{ background: 'rgba(61,203,255,0.06)' }} />
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl" style={{ background: 'rgba(61,203,255,0.10)' }}>
                  <Users2 className="w-5 h-5" style={{ color: t.accent }} />
                </div>
                <h3 className="font-bold text-lg">Real-Time Sync</h3>
              </div>
              <p className="text-sm leading-relaxed max-w-sm mb-8" style={{ color: t.inkMid }}>
                Every edit, selection, and cursor move is broadcast instantly. Powered by CRDTs — no conflicts, no merge hell.
              </p>
              <div className="flex items-center gap-3">
                {['S', 'M', 'A', 'J'].map((initial, i) => (
                  <div key={i} className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-black border-2 border-[#0E0F11] shadow-lg" style={{ background: [t.accent, '#10B981', '#F59E0B', '#A855F7'][i], marginLeft: i > 0 ? '-8px' : 0 }}>
                    {initial}
                  </div>
                ))}
                <span className="text-xs ml-2" style={{ color: t.inkLow }}>4 collaborators online</span>
                <span className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-emerald-400 text-xs font-medium" style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                </span>
              </div>
            </div>

            {/* Marketplace */}
            <div
              className="relative rounded-3xl p-7 overflow-hidden group transition-all min-h-[300px]"
              style={{ border: `1px solid ${t.line}`, background: 'rgba(255,255,255,0.02)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = `rgba(61,203,255,0.25)`)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = t.line)}
            >
              <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(61,203,255,0.15), transparent)` }} />
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl" style={{ background: 'rgba(61,203,255,0.08)' }}>
                  <Package className="w-5 h-5" style={{ color: t.accent }} />
                </div>
                <h3 className="font-bold text-base">Marketplace</h3>
              </div>
              <p className="text-sm leading-relaxed mb-6" style={{ color: t.inkMid }}>
                Share scenes and clone community designs. Zero storage cost — pointer-based duplication.
              </p>
              <div className="space-y-2">
                {['Modern Villa', 'Glass Tower', 'Urban Loft'].map((name, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${t.line}` }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(61,203,255,0.10)' }}>
                      <Building2 className="w-3.5 h-3.5" style={{ color: t.accent }} />
                    </div>
                    <span className="text-xs font-medium flex-1">{name}</span>
                    <Download className="w-3 h-3" style={{ color: t.inkLow }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Client Presentation */}
            <div
              className="relative rounded-3xl p-7 overflow-hidden group transition-all"
              style={{ border: `1px solid ${t.line}`, background: 'rgba(255,255,255,0.02)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = `rgba(61,203,255,0.25)`)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = t.line)}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl" style={{ background: 'rgba(61,203,255,0.08)' }}>
                  <Eye className="w-5 h-5" style={{ color: t.accent }} />
                </div>
                <h3 className="font-bold text-base">Client Presentation</h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: t.inkMid }}>
                Share a live link. Clients join as Viewers — they can explore the 3D scene and comment, without edit access.
              </p>
            </div>

            {/* RBAC */}
            <div
              className="relative rounded-3xl p-7 overflow-hidden group transition-all"
              style={{ border: `1px solid ${t.line}`, background: 'rgba(255,255,255,0.02)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = `rgba(61,203,255,0.25)`)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = t.line)}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl" style={{ background: 'rgba(61,203,255,0.08)' }}>
                  <ShieldCheck className="w-5 h-5" style={{ color: t.accent }} />
                </div>
                <h3 className="font-bold text-base">RBAC Permissions</h3>
              </div>
              <div className="space-y-2">
                {['Owner', 'Editor', 'Commenter', 'Viewer'].map((role, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: [t.accent, t.accentDeep, '#F59E0B', t.inkLow][i] }} />
                    <span style={{ color: t.inkMid }}>{role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CDN Pipeline */}
            <div
              className="relative rounded-3xl p-7 overflow-hidden group transition-all"
              style={{ border: `1px solid ${t.line}`, background: 'rgba(255,255,255,0.02)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = `rgba(61,203,255,0.25)`)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = t.line)}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl" style={{ background: 'rgba(61,203,255,0.08)' }}>
                  <Zap className="w-5 h-5" style={{ color: t.accent }} />
                </div>
                <h3 className="font-bold text-base">CDN Asset Pipeline</h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: t.inkMid }}>
                Direct-to-R2 uploads via presigned URLs. Draco compression + KTX2 textures on the way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-28 px-6" style={{ background: `${t.bgElev}55` }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <p className="font-semibold text-sm uppercase tracking-widest mb-4" style={{ color: t.accent }}>How It Works</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              From concept to collaboration
              <br />
              <span className="italic" style={{ fontFamily: '"Instrument Serif", Georgia, serif', color: t.inkMid }}>in three steps.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Import or Create', desc: 'Start with a blank canvas or import existing floorplans. Our parametric engine generates smart building elements instantly.', icon: <FolderOpen className="w-6 h-6" /> },
              { step: '02', title: 'Collaborate Live', desc: 'Invite your team. See cursors, selections, and edits in real-time. No more emailing files back and forth.', icon: <Users2 className="w-6 h-6" /> },
              { step: '03', title: 'Share & Export', desc: 'Generate interactive walkthroughs, export to standard formats, or share a live link with stakeholders.', icon: <Download className="w-6 h-6" /> },
            ].map((item, i) => (
              <div
                key={i}
                className="relative rounded-2xl p-8 group transition-all"
                style={{ background: t.bgElev, border: `1px solid ${t.line}` }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = `rgba(61,203,255,0.2)`)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = t.line)}
              >
                <div className="text-[11px] font-bold tracking-widest mb-4" style={{ color: `${t.accent}80` }}>{item.step}</div>
                <div className="p-3 rounded-xl w-fit mb-5 transition-colors" style={{ background: 'rgba(61,203,255,0.08)', color: t.accent }}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: t.inkMid }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section id="use-cases" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-semibold text-sm uppercase tracking-widest mb-4" style={{ color: t.accent }}>Use Cases</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Built for every stage<br />
              <span className="italic" style={{ fontFamily: '"Instrument Serif", Georgia, serif', color: t.inkMid }}>of the building lifecycle.</span>
            </h2>
          </div>
          <div className="flex justify-center gap-2 mb-12">
            {useCases.map((uc, i) => (
              <button
                key={i}
                onClick={() => setActiveUseCase(i)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={activeUseCase === i
                  ? { background: 'rgba(61,203,255,0.12)', color: t.accent, border: `1px solid rgba(61,203,255,0.25)` }
                  : { color: t.inkMid, border: '1px solid transparent' }
                }
              >
                {uc.icon} {uc.title}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">{useCases[activeUseCase]?.title} Teams</h3>
              <p className="leading-relaxed mb-8" style={{ color: t.inkMid }}>{useCases[activeUseCase]?.desc}</p>
              <ul className="space-y-3">
                {useCases[activeUseCase]?.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm" style={{ color: t.ink }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(61,203,255,0.12)' }}>
                      <Check className="w-3 h-3" style={{ color: t.accent }} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 mt-8 text-sm font-medium transition-colors group"
                style={{ color: t.accent }}
              >
                Get started <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div
              className="rounded-2xl aspect-[4/3] flex items-center justify-center"
              style={{ background: t.bgElev, border: `1px solid ${t.line}` }}
            >
              <div className="flex flex-col items-center gap-3" style={{ color: t.inkLow }}>
                <Eye className="w-10 h-10" />
                <span className="text-sm font-medium">Interactive Preview</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-28 px-6" style={{ background: `${t.bgElev}55` }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-semibold text-sm uppercase tracking-widest mb-4" style={{ color: t.accent }}>Pricing</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">Start free. Scale as you grow.</h2>
            <p className="text-lg" style={{ color: t.inkMid }}>No credit card required. Upgrade when you need more.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Starter', price: 'Free', period: 'forever', desc: 'For individuals and small teams exploring 3D design.', features: ['Up to 5 team members', '3 active projects', 'Community support', 'Basic export formats'], cta: 'Get Started', highlighted: false },
              { name: 'Pro', price: '$29', period: '/seat/mo', desc: 'For professional teams that need advanced collaboration.', features: ['Unlimited members', 'Unlimited projects', 'Real-time collaboration', 'Priority support', 'Version history', 'Custom materials'], cta: 'Start Free Trial', highlighted: true },
              { name: 'Enterprise', price: 'Custom', period: '', desc: 'For organizations that need security, compliance, and scale.', features: ['Everything in Pro', 'SSO & SAML', 'Dedicated support', 'Custom integrations', 'SLA guarantee', 'On-premise option'], cta: 'Contact Sales', highlighted: false },
            ].map((plan, i) => (
              <div
                key={i}
                className="rounded-2xl p-8 flex flex-col relative"
                style={plan.highlighted
                  ? { background: 'rgba(61,203,255,0.06)', border: `2px solid rgba(61,203,255,0.35)` }
                  : { background: t.bgElev, border: `1px solid ${t.line}` }
                }
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-black text-[10px] font-bold rounded-full uppercase tracking-wider" style={{ background: t.accent }}>
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-extrabold">{plan.price}</span>
                  <span className="text-sm" style={{ color: t.inkLow }}>{plan.period}</span>
                </div>
                <p className="text-sm mb-6" style={{ color: t.inkMid }}>{plan.desc}</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm" style={{ color: t.ink }}>
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: t.accent }} /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="w-full py-3 rounded-xl font-semibold text-sm text-center transition-all"
                  style={plan.highlighted
                    ? { background: t.accent, color: '#000' }
                    : { background: 'rgba(255,255,255,0.05)', border: `1px solid ${t.line}`, color: t.ink }
                  }
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute inset-0 rounded-full blur-[100px] pointer-events-none" style={{ background: 'rgba(61,203,255,0.08)' }} />
          <div
            className="relative rounded-[32px] p-16 md:p-24 overflow-hidden"
            style={{ border: `1px solid ${t.lineStrong}` }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(to bottom, rgba(255,255,255,0.03), transparent)` }} />
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(61,203,255,0.3), transparent)` }} />
            <h2
              className="relative text-4xl md:text-5xl font-bold mb-4 tracking-tight"
              style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontStyle: 'italic' }}
            >
              Ready to build together?
            </h2>
            <p className="relative text-lg mb-10 max-w-xl mx-auto" style={{ color: t.inkMid }}>
              Join hundreds of teams already designing the future with Archly. Free to start, no credit card required.
            </p>
            <PrimaryButton href="/signup">Get Started Free</PrimaryButton>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-16 px-6" style={{ borderTop: `1px solid ${t.line}` }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-4 max-w-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: t.accent }}>
                <Box className="w-4 h-4" style={{ color: '#000' }} />
              </div>
              <span className="font-bold text-base tracking-tight">archly</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: t.inkLow }}>The collaborative 3D spatial platform for teams that build the physical world.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            {[
              { title: 'Product', links: [{ label: 'Features', href: '#features' }, { label: 'Pricing', href: '#pricing' }, { label: 'Marketplace', href: '/marketplace' }, { label: 'Playground', href: '/playground' }] },
              { title: 'Resources', links: [{ label: 'Documentation', href: '#' }, { label: 'Community', href: '#' }, { label: 'Support', href: 'mailto:support@archly.cloud' }, { label: 'Changelog', href: '#' }] },
              { title: 'Legal', links: [{ label: 'Terms', href: '/terms' }, { label: 'Privacy', href: '/privacy' }, { label: 'Contact', href: 'mailto:support@archly.cloud' }] },
            ].map((col, i) => (
              <div key={i} className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: t.inkMid }}>{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}><Link href={link.href} className="text-sm transition-colors hover:text-white" style={{ color: t.inkLow }}>{link.label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-6 flex justify-between items-center text-xs" style={{ borderTop: `1px solid ${t.line}`, color: t.inkLow }}>
          <span>&copy; {new Date().getFullYear()} Archly Inc. All rights reserved.</span>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Discord</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>

      {/* Drift animation for hero */}
      <style>{`
        @keyframes drift {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(0.3deg); }
        }
      `}</style>
    </div>
  )
}
