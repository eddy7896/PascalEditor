'use client'

import { Suspense, lazy, useState, useRef, useEffect } from 'react'
import {
  motion, useScroll, useTransform, useSpring,
  useInView, AnimatePresence, useMotionValue, useAnimationFrame,
} from 'framer-motion'
import {
  ArrowRight, ArrowUpRight, Building2, Box, Check,
  Download, Eye, FolderOpen, Globe2, GitBranch,
  Layers, MousePointer2, Package, Play,
  ShieldCheck, Sparkles, Users2, Zap, Cpu, Star,
  BarChart3, Lock, RefreshCw, Workflow,
} from 'lucide-react'
import Link from 'next/link'

const HeroCanvas = lazy(() => import('./_components/HeroCanvas'))

/* ─── Design tokens ─────────────────────────────────────────── */
const accent  = '#3DCBFF'
const accentD = '#0AA9E2'
const bg      = '#0E0F11'
const bgE     = '#16181B'
const bgE2    = '#1D2024'
const ink     = '#F4F5F7'
const inkM    = '#A8ADB4'
const inkL    = '#6B7079'
const line    = 'rgba(255,255,255,0.07)'
const lineS   = 'rgba(255,255,255,0.14)'

/* ─── Reusable primitives ────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}
const stagger = (i: number) => ({
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] } },
})

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return { ref, inView }
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em]"
      style={{ border: `1px solid rgba(61,203,255,0.22)`, background: 'rgba(61,203,255,0.07)', color: accent }}
    >
      {children}
    </span>
  )
}

function PrimaryBtn({ href, children, large }: { href: string; children: React.ReactNode; large?: boolean }) {
  return (
    <motion.div whileHover={{ scale: 1.025 }} whileTap={{ scale: 0.975 }}>
      <Link
        href={href}
        className={`relative group inline-flex items-center gap-2 font-semibold text-black overflow-hidden rounded-xl transition-all ${large ? 'px-9 py-4 text-[15px]' : 'px-6 py-3 text-[14px]'}`}
        style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accentD} 100%)` }}
      >
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: `linear-gradient(135deg, #5DD8FF 0%, ${accent} 100%)` }} />
        <span className="absolute inset-x-0 top-0 h-px bg-white/30" />
        <span className="relative flex items-center gap-2">{children}</span>
      </Link>
    </motion.div>
  )
}

function GhostBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <motion.div whileHover={{ scale: 1.025 }} whileTap={{ scale: 0.975 }}>
      <Link
        href={href}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-[14px] transition-all"
        style={{ border: `1px solid ${lineS}`, color: ink, background: 'rgba(255,255,255,0.03)' }}
      >
        {children}
      </Link>
    </motion.div>
  )
}

/* ─── Marquee ────────────────────────────────────────────────── */
const LOGOS = [
  { name: 'Zaha Hadid', icon: Building2 },
  { name: 'Foster+Partners', icon: Layers },
  { name: 'Bjarke Ingels', icon: Globe2 },
  { name: 'Gensler', icon: Cpu },
  { name: 'HOK Global', icon: ShieldCheck },
  { name: 'SOM Architects', icon: BarChart3 },
  { name: 'Skidmore Owings', icon: Workflow },
]

function Marquee() {
  const x = useMotionValue(0)
  useAnimationFrame(() => { x.set(x.get() - 0.6) })

  const items = [...LOGOS, ...LOGOS]
  return (
    <div className="relative overflow-hidden py-1" style={{ maskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)' }}>
      <motion.div className="flex gap-8 w-max" style={{ x }}>
        {items.map((logo, i) => (
          <div key={i} className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl whitespace-nowrap" style={{ border: `1px solid ${line}`, background: bgE }}>
            <logo.icon className="w-4 h-4" style={{ color: inkL }} />
            <span className="text-[13px] font-medium" style={{ color: inkL }}>{logo.name}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

/* ─── Animated grid background ──────────────────────────────── */
function GridBg({ accent: col = accent }: { accent?: string }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `linear-gradient(${line} 1px,transparent 1px),linear-gradient(90deg,${line} 1px,transparent 1px)`,
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
      }}
    />
  )
}

/* ─── Glow blob ─────────────────────────────────────────────── */
function Glow({ color = accent, w = 600, h = 300, top = 0, left = '50%', opacity = 0.12 }: {
  color?: string; w?: number; h?: number; top?: number | string; left?: number | string; opacity?: number
}) {
  return (
    <div
      className="absolute rounded-full pointer-events-none blur-[160px]"
      style={{ width: w, height: h, top, left, transform: 'translateX(-50%)', background: color, opacity }}
    />
  )
}

/* ─── Stat card ─────────────────────────────────────────────── */
function Stat({ value, label }: { value: string; label: string }) {
  const { ref, inView } = useReveal()
  return (
    <motion.div ref={ref} variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} className="text-center">
      <div className="text-4xl font-extrabold tracking-tight mb-1" style={{ color: ink }}>{value}</div>
      <div className="text-sm" style={{ color: inkM }}>{label}</div>
    </motion.div>
  )
}

/* ─── Feature card ──────────────────────────────────────────── */
function FeatureCard({
  icon: Icon, title, desc, accent: cardAccent = accent, span = 1, children, delay = 0,
}: {
  icon: React.ElementType; title: string; desc: string; accent?: string; span?: 1 | 2; children?: React.ReactNode; delay?: number
}) {
  const { ref, inView } = useReveal()
  return (
    <motion.div
      ref={ref}
      variants={stagger(delay)}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className={`relative rounded-2xl p-7 overflow-hidden group transition-all duration-300 ${span === 2 ? 'md:col-span-2' : ''}`}
      style={{ border: `1px solid ${line}`, background: `${bgE}99` }}
      whileHover={{ borderColor: `${cardAccent}40`, y: -2 }}
    >
      {/* Top specular */}
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${cardAccent}30,transparent)` }} />
      {/* Corner glow */}
      <div className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: cardAccent }} />

      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl" style={{ background: `${cardAccent}15` }}>
          <Icon className="w-5 h-5" style={{ color: cardAccent }} />
        </div>
        <h3 className="font-bold text-[15px]" style={{ color: ink }}>{title}</h3>
      </div>
      <p className="text-sm leading-relaxed mb-4" style={{ color: inkM }}>{desc}</p>
      {children}
    </motion.div>
  )
}

/* ─── Testimonial card ──────────────────────────────────────── */
function TestimonialCard({ quote, name, role, company, i }: {
  quote: string; name: string; role: string; company: string; i: number
}) {
  const { ref, inView } = useReveal()
  return (
    <motion.div
      ref={ref}
      variants={stagger(i)}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className="rounded-2xl p-7 flex flex-col gap-5"
      style={{ border: `1px solid ${line}`, background: `${bgE}cc` }}
    >
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, j) => (
          <Star key={j} className="w-4 h-4 fill-current" style={{ color: accent }} />
        ))}
      </div>
      <p className="text-[15px] leading-relaxed flex-1" style={{ color: inkM }}>"{quote}"</p>
      <div className="flex items-center gap-3 pt-4" style={{ borderTop: `1px solid ${line}` }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-black flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accentD})` }}>
          {name[0]}
        </div>
        <div>
          <div className="font-semibold text-[13px]" style={{ color: ink }}>{name}</div>
          <div className="text-[12px]" style={{ color: inkL }}>{role} · {company}</div>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Pricing card ──────────────────────────────────────────── */
function PricingCard({ plan, i }: { plan: typeof PLANS[0]; i: number }) {
  const { ref, inView } = useReveal()
  return (
    <motion.div
      ref={ref}
      variants={stagger(i)}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className="relative rounded-2xl p-8 flex flex-col"
      style={plan.hot
        ? { border: `1.5px solid rgba(61,203,255,0.45)`, background: `linear-gradient(160deg, rgba(61,203,255,0.08) 0%, ${bgE} 60%)` }
        : { border: `1px solid ${line}`, background: bgE }
      }
    >
      {plan.hot && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-black"
          style={{ background: `linear-gradient(90deg, ${accent}, ${accentD})` }}>
          Most Popular
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-1" style={{ color: ink }}>{plan.name}</h3>
        <p className="text-sm" style={{ color: inkM }}>{plan.desc}</p>
      </div>
      <div className="flex items-baseline gap-1 mb-8">
        <span className="text-4xl font-extrabold" style={{ color: ink }}>{plan.price}</span>
        {plan.per && <span className="text-sm" style={{ color: inkL }}>{plan.per}</span>}
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((f, j) => (
          <li key={j} className="flex items-start gap-2.5 text-sm" style={{ color: inkM }}>
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(61,203,255,0.12)' }}>
              <Check className="w-3 h-3" style={{ color: accent }} />
            </div>
            {f}
          </li>
        ))}
      </ul>
      {plan.hot
        ? <PrimaryBtn href="/signup">{plan.cta}</PrimaryBtn>
        : <GhostBtn href="/signup">{plan.cta}</GhostBtn>
      }
    </motion.div>
  )
}

/* ─── Data ───────────────────────────────────────────────────── */
const PLANS = [
  {
    name: 'Starter', price: 'Free', per: '', desc: 'Perfect for solo architects and small studios.', hot: false, cta: 'Get Started Free',
    features: ['Up to 3 projects', '5 team members', 'Basic 3D editor', 'Community support', 'Standard export (OBJ, GLTF)'],
  },
  {
    name: 'Pro', price: '$29', per: '/seat/mo', desc: 'For growing teams that move fast.', hot: true, cta: 'Start Free Trial',
    features: ['Unlimited projects', 'Unlimited members', 'Real-time collaboration', 'Priority support', 'Version history & branching', 'Advanced materials library', 'Client presentation links'],
  },
  {
    name: 'Enterprise', price: 'Custom', per: '', desc: 'Security, compliance, and dedicated support.', hot: false, cta: 'Contact Sales',
    features: ['Everything in Pro', 'SSO / SAML 2.0', 'Dedicated success manager', 'Custom integrations & API', 'SLA guarantee (99.9%)', 'On-premise deployment option'],
  },
]

const TESTIMONIALS = [
  { quote: "We replaced three separate tools with Archly. Our design review cycles went from days to hours — clients love the shareable 3D links.", name: 'Priya Menon', role: 'Director of Design', company: 'StudioFlow' },
  { quote: "The real-time collaboration is genuinely magic. Having our engineers and architects in the same 3D scene simultaneously changed how we work.", name: 'James Okafor', role: 'VP Engineering', company: 'Meridian AEC' },
  { quote: "Finally a BIM-adjacent tool that doesn't feel like it was designed in 2005. The WebGPU performance is exceptional even on complex models.", name: 'Sofia Lindqvist', role: 'Principal Architect', company: 'Nordform' },
]

const HOW_STEPS = [
  { step: '01', icon: FolderOpen, title: 'Import or Create', desc: 'Start from scratch or bring in your IFC, RVT, or SKP files. The parametric engine generates smart building elements in seconds.' },
  { step: '02', icon: Users2, title: 'Collaborate in Real Time', desc: 'Invite your team and clients. See every cursor, selection, and edit instantly — no polling, no conflicts, no version email chains.' },
  { step: '03', icon: Download, title: 'Ship & Share', desc: 'Generate interactive client walkthroughs, export to industry-standard formats, or embed a live 3D viewer on any webpage.' },
]

/* ─── Page ───────────────────────────────────────────────────── */
export default function LandingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const heroY       = useTransform(scrollYProgress, [0, 1], [0, 80])

  return (
    <div className="min-h-screen overflow-x-hidden selection:bg-[#3DCBFF]/20 selection:text-white"
      style={{ background: bg, color: ink, fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, sans-serif' }}>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl"
        style={{ borderBottom: `1px solid ${line}`, background: `${bg}cc` }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: 8 }}
              className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accentD})` }}
            >
              <Box className="w-4 h-4 text-black" />
            </motion.div>
            <span className="font-bold text-[17px] tracking-tight" style={{ color: ink }}>archly</span>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-[13px] font-medium" style={{ color: inkM }}>
            {['Features', 'Use Cases', 'Pricing', 'Docs'].map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`}
                className="hover:text-white transition-colors duration-150">{l}</a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-[13px] font-medium px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: inkM }}>
              Sign In
            </Link>
            <PrimaryBtn href="/signup">Get Started Free</PrimaryBtn>
          </div>
        </div>
      </motion.nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative flex flex-col items-center justify-center text-center px-6 overflow-hidden" style={{ minHeight: '100vh', paddingTop: 120 }}>
        <GridBg />
        <Glow w={900} h={500} top={-60} opacity={0.11} />
        <Glow color={accentD} w={400} h={400} top={200} left="70%" opacity={0.07} />

        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative z-10 max-w-5xl mx-auto w-full">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-semibold mb-10 cursor-pointer hover:bg-[rgba(61,203,255,0.12)] transition-colors"
            style={{ border: `1px solid rgba(61,203,255,0.25)`, background: 'rgba(61,203,255,0.07)', color: accent }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Now in Open Beta — Free for teams up to 5
            <ArrowRight className="w-3 h-3" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl md:text-[78px] font-extrabold tracking-[-0.04em] leading-[1.03] mb-6"
          >
            <span style={{ background: 'linear-gradient(180deg, #fff 50%, rgba(255,255,255,0.38))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              The 3D workspace
            </span>
            <br />
            <span
              className="italic"
              style={{
                fontFamily: '"Instrument Serif", Georgia, serif',
                background: `linear-gradient(135deg, ${accent} 20%, ${accentD} 80%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              architecture teams
            </span>
            <br />
            <span style={{ background: 'linear-gradient(180deg, #fff 50%, rgba(255,255,255,0.38))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              actually ship with.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.22 }}
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: inkM }}
          >
            Real-time collaborative 3D design for AEC teams. WebGPU-native performance, zero plugin installs, built for the way you actually work.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.32 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <PrimaryBtn href="/signup" large>
              Start Building Free <ArrowRight className="w-4 h-4" />
            </PrimaryBtn>
            <GhostBtn href="/playground">
              <Play className="w-4 h-4" /> Watch Demo
            </GhostBtn>
          </motion.div>

          {/* Social proof micro */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}
            className="flex items-center justify-center gap-3 mt-8"
          >
            <div className="flex -space-x-2">
              {['#3DCBFF', '#10B981', '#F59E0B', '#A855F7', accentD].map((c, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[9px] font-bold text-black"
                  style={{ background: c, borderColor: bg }}>
                  {['S','M','A','J','K'][i]}
                </div>
              ))}
            </div>
            <span className="text-[13px]" style={{ color: inkM }}>
              <span className="font-semibold" style={{ color: ink }}>2,400+</span> teams already building
            </span>
          </motion.div>
        </motion.div>

        {/* Hero canvas frame */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mt-16 w-full max-w-6xl mx-auto"
          style={{ animation: 'drift 10s ease-in-out infinite' }}
        >
          {/* Outer glow ring */}
          <div className="absolute -inset-1 rounded-[26px] blur-xl opacity-30" style={{ background: `linear-gradient(135deg, ${accent}, transparent, ${accentD})` }} />
          <div
            className="relative p-px rounded-2xl overflow-hidden"
            style={{ background: `linear-gradient(180deg, ${lineS} 0%, ${line} 100%)` }}
          >
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}55, transparent)` }} />
            <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden relative" style={{ background: '#060810' }}>
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center" style={{ background: `radial-gradient(circle at 50% 50%, rgba(61,203,255,0.04), transparent 70%)` }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                    <RefreshCw className="w-8 h-8" style={{ color: inkL }} />
                  </motion.div>
                </div>
              }>
                <HeroCanvas />
              </Suspense>

              {/* Floating cursors */}
              {[
                { x: '22%', y: '28%', color: accent,    name: 'Sarah K.',  delay: 0 },
                { x: '68%', y: '52%', color: '#10B981',  name: 'Marcus R.', delay: 1.1 },
                { x: '46%', y: '74%', color: '#F59E0B',  name: 'Alex T.',   delay: 2.2 },
              ].map((c, i) => (
                <motion.div
                  key={i}
                  className="absolute flex flex-col items-start gap-0.5 pointer-events-none"
                  style={{ left: c.x, top: c.y }}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 3 + i, delay: c.delay, ease: 'easeInOut' }}
                >
                  <MousePointer2 className="w-4 h-4 fill-current drop-shadow-lg" style={{ color: c.color }} />
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md ml-3 shadow-lg"
                    style={{ background: c.color, color: i === 0 ? '#000' : '#fff' }}>
                    {c.name}
                  </span>
                </motion.div>
              ))}

              {/* Editor chrome bar */}
              <div className="absolute top-0 inset-x-0 h-9 flex items-center px-4 gap-2" style={{ background: `${bgE}ee`, borderBottom: `1px solid ${line}` }}>
                <div className="flex gap-1.5">
                  {['#FF5F57', '#FFBD2E', '#28C840'].map((c, i) => (
                    <div key={i} className="w-3 h-3 rounded-full" style={{ background: c }} />
                  ))}
                </div>
                <div className="flex-1 mx-4 h-5 rounded-md text-[11px] flex items-center px-3" style={{ background: bg, color: inkL }}>
                  archly.cloud/editor/proj_xK8mN2
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-black" style={{ background: accent }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-black/30 animate-pulse" />
                  3 live
                </div>
              </div>

              {/* Bottom fade */}
              <div className="absolute inset-x-0 bottom-0 h-28" style={{ background: `linear-gradient(to top, ${bg}, transparent)` }} />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── MARQUEE ─────────────────────────────────────────── */}
      <section className="py-12" style={{ borderTop: `1px solid ${line}`, borderBottom: `1px solid ${line}` }}>
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] mb-8" style={{ color: inkL }}>
          Trusted by leading AEC firms worldwide
        </p>
        <Marquee />
      </section>

      {/* ── STATS ───────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 divide-x"
          style={{ borderTop: `1px solid ${line}`, borderBottom: `1px solid ${line}`, divideColor: line }}>
          {[
            { value: '2,400+', label: 'Teams using Archly' },
            { value: '98ms',   label: 'Avg. collaboration latency' },
            { value: '4.9★',   label: 'Rating on G2' },
            { value: '99.9%',  label: 'Uptime SLA' },
          ].map((s, i) => (
            <div key={i} className="py-10 px-4">
              <Stat value={s.value} label={s.label} />
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel><Sparkles className="w-3 h-3" /> Platform</SectionLabel>
            <motion.h2
              {...fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold tracking-[-0.03em] mt-5"
            >
              Built for teams who<br />
              <span className="italic" style={{ fontFamily: '"Instrument Serif", Georgia, serif', color: accent }}>
                move fast and build right.
              </span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Wide — Real-time Sync */}
            <FeatureCard
              icon={Users2} title="Real-Time Collaboration" span={2} delay={0}
              desc="Every edit, cursor move, and selection is broadcast in under 100ms. CRDT-powered conflict resolution means no merge hell, ever."
            >
              <div className="flex items-center gap-3 mt-2">
                {[accent, '#10B981', '#F59E0B', '#A855F7'].map((c, i) => (
                  <motion.div key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.4, ease: 'easeInOut' }}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 text-black"
                    style={{ background: c, borderColor: bgE2, marginLeft: i > 0 ? '-8px' : 0 }}
                  >
                    {['S','M','A','J'][i]}
                  </motion.div>
                ))}
                <span className="text-xs ml-3" style={{ color: inkL }}>4 collaborators online</span>
                <span className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-emerald-400 text-xs font-medium"
                  style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                </span>
              </div>
            </FeatureCard>

            {/* Version History */}
            <FeatureCard icon={GitBranch} title="Version History" delay={1} accent="#A855F7"
              desc="Branch your project like code. Roll back to any checkpoint. Never lose work again.">
              <div className="space-y-2 mt-2">
                {['v3 — Facade revision', 'v2 — Floor plan update', 'v1 — Initial layout'].map((v, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs" style={{ color: i === 0 ? ink : inkL }}>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: i === 0 ? accent : inkL }} />
                    {v}
                  </div>
                ))}
              </div>
            </FeatureCard>

            {/* Client Sharing */}
            <FeatureCard icon={Eye} title="Client Presentation Mode" delay={2}
              desc="Share a live 3D link. Clients explore the scene as Viewers — zero plugin installs, full immersion." />

            {/* RBAC */}
            <FeatureCard icon={Lock} title="Granular Access Control" delay={3} accent="#F59E0B"
              desc="Owner, Editor, Commenter, Viewer — control exactly who can do what at project or folder level.">
              <div className="flex flex-wrap gap-2 mt-2">
                {['Owner', 'Editor', 'Commenter', 'Viewer'].map((r, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                    style={{ background: `${['#A855F7','#3DCBFF','#F59E0B','#6B7079'][i]}18`, color: ['#A855F7',accent,'#F59E0B',inkL][i] }}>
                    {r}
                  </span>
                ))}
              </div>
            </FeatureCard>

            {/* R2 Pipeline */}
            <FeatureCard icon={Zap} title="CDN Asset Pipeline" delay={4} accent="#F59E0B"
              desc="Direct-to-R2 uploads via presigned URLs. Draco compression + KTX2 textures. Sub-second load times globally." />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section id="use-cases" className="py-28 px-6" style={{ background: `${bgE}66` }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <SectionLabel><Workflow className="w-3 h-3" /> How It Works</SectionLabel>
            <motion.h2
              {...fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold tracking-[-0.03em] mt-5"
            >
              From import to shipped
              <br />
              <span className="italic" style={{ fontFamily: '"Instrument Serif", Georgia, serif', color: inkM }}>
                in three steps.
              </span>
            </motion.h2>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}40, ${accent}40, transparent)` }} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {HOW_STEPS.map((s, i) => {
                const { ref, inView } = useReveal()
                return (
                  <motion.div
                    key={i} ref={ref}
                    variants={stagger(i)} initial="hidden" animate={inView ? 'show' : 'hidden'}
                    className="relative rounded-2xl p-8 text-center"
                    style={{ border: `1px solid ${line}`, background: bgE }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6 text-sm font-bold"
                      style={{ background: `rgba(61,203,255,0.10)`, color: accent, border: `1px solid rgba(61,203,255,0.2)` }}
                    >
                      {s.step}
                    </div>
                    <div className="p-3 rounded-xl w-fit mx-auto mb-4" style={{ background: 'rgba(61,203,255,0.07)', color: accent }}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-[15px] mb-3" style={{ color: ink }}>{s.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: inkM }}>{s.desc}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel><Star className="w-3 h-3" /> Testimonials</SectionLabel>
            <motion.h2
              {...fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="text-4xl font-bold tracking-tight mt-5"
            >
              Loved by architects who{' '}
              <span className="italic" style={{ fontFamily: '"Instrument Serif", Georgia, serif', color: accent }}>
                ship.
              </span>
            </motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => <TestimonialCard key={i} {...t} i={i} />)}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────── */}
      <section id="pricing" className="py-28 px-6" style={{ background: `${bgE}55` }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel><BarChart3 className="w-3 h-3" /> Pricing</SectionLabel>
            <motion.h2
              {...fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold tracking-[-0.03em] mt-5 mb-4"
            >
              Start free.{' '}
              <span className="italic" style={{ fontFamily: '"Instrument Serif", Georgia, serif', color: accent }}>
                Scale with your team.
              </span>
            </motion.h2>
            <p className="text-lg" style={{ color: inkM }}>No credit card required. Cancel anytime.</p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-1 mt-8 p-1 rounded-xl" style={{ background: bgE, border: `1px solid ${line}` }}>
              {(['monthly', 'annual'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className="px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all capitalize"
                  style={billing === b
                    ? { background: accent, color: '#000' }
                    : { color: inkM }
                  }
                >
                  {b} {b === 'annual' && <span className="ml-1 text-[10px] font-bold text-emerald-400">–20%</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => <PricingCard key={i} plan={plan} i={i} />)}
          </div>

          <p className="text-center text-[13px] mt-10" style={{ color: inkL }}>
            All plans include a 14-day free trial on Pro features. No credit card needed.
          </p>
        </div>
      </section>

      {/* ── CTA BAND ────────────────────────────────────────── */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            {...fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="relative rounded-[32px] p-16 md:p-24 text-center overflow-hidden"
            style={{ border: `1px solid rgba(61,203,255,0.2)` }}
          >
            {/* Ambient */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(61,203,255,0.08), transparent)' }} />
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}55, transparent)` }} />
            <GridBg />

            <div className="relative">
              <SectionLabel><Sparkles className="w-3 h-3" /> Get Started</SectionLabel>
              <h2
                className="text-4xl md:text-5xl font-bold mt-5 mb-4 tracking-[-0.03em]"
                style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontStyle: 'italic' }}
              >
                Ready to build together?
              </h2>
              <p className="text-lg mb-10 max-w-md mx-auto" style={{ color: inkM }}>
                Join thousands of AEC teams designing the future in real time. Free to start.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <PrimaryBtn href="/signup" large>
                  Start Building Free <ArrowRight className="w-4 h-4" />
                </PrimaryBtn>
                <GhostBtn href="/contact">
                  Talk to Sales <ArrowUpRight className="w-4 h-4" />
                </GhostBtn>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="py-16 px-6" style={{ borderTop: `1px solid ${line}` }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-4 max-w-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${accent}, ${accentD})` }}>
                <Box className="w-4 h-4 text-black" />
              </div>
              <span className="font-bold text-base tracking-tight">archly</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: inkL }}>
              The collaborative 3D spatial platform for teams that build the physical world.
            </p>
            <div className="flex gap-3">
              {['Twitter', 'Discord', 'GitHub'].map((s) => (
                <a key={s} href="#" className="text-[12px] transition-colors hover:text-white" style={{ color: inkL }}>{s}</a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Marketplace', 'Playground', 'Changelog'] },
              { title: 'Resources', links: ['Documentation', 'API Reference', 'Community', 'Blog', 'Support'] },
              { title: 'Company', links: ['About', 'Careers', 'Press', 'Privacy', 'Terms'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] mb-4" style={{ color: inkM }}>{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-[13px] transition-colors hover:text-white" style={{ color: inkL }}>{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[12px]"
          style={{ borderTop: `1px solid ${line}`, color: inkL }}>
          <span>&copy; {new Date().getFullYear()} Archly Inc. All rights reserved.</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All systems operational
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes drift {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(0.25deg); }
        }
      `}</style>
    </div>
  )
}

