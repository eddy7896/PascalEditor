'use client'

import { Suspense, lazy, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight, Building2, Box, Users2, Eye, Download,
  Check, ChevronRight, Sparkles, Play, Shield, Zap, Grid3X3,
  FolderOpen,
} from 'lucide-react'
import Link from 'next/link'

const HeroCanvas = lazy(() => import('./_components/HeroCanvas'))

const fadeInUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }

function GlassButton({ href, children, primary = false }: { href: string; children: React.ReactNode; primary?: boolean }) {
  if (primary) {
    return (
      <Link href={href} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-sm">
        {children}
      </Link>
    )
  }
  return (
    <Link href={href} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm text-zinc-900 bg-zinc-100 hover:bg-zinc-200 active:scale-[0.98] transition-all">
      {children}
    </Link>
  )
}

export default function LandingPage() {
  const [activeUseCase, setActiveUseCase] = useState(0)
  const useCases = [
    { title: 'Architecture', icon: <Building2 className="w-5 h-5" />, desc: 'Create detailed building models with parametric walls, slabs, roofs, and intelligent room layouts. Iterate with your team in real-time.', features: ['Parametric building elements', 'Multi-level editing', 'Material library'] },
    { title: 'Real Estate', icon: <Eye className="w-5 h-5" />, desc: 'Present interactive 3D walkthroughs to clients. Showcase properties with photorealistic materials and lighting before construction begins.', features: ['Interactive presentations', 'First-person walkthroughs', 'One-click sharing'] },
    { title: 'Construction', icon: <Users2 className="w-5 h-5" />, desc: 'Coordinate across teams with shared project workspaces. Track changes, manage versions, and keep everyone aligned on the latest design.', features: ['Version history', 'Team permissions', 'Export to CAD formats'] },
  ]

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-indigo-100">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg flex items-center justify-center">
              <Box className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-base tracking-tight text-zinc-900">archly</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
            <a href="#features" className="hover:text-zinc-900 transition-colors">Features</a>
            <a href="#use-cases" className="hover:text-zinc-900 transition-colors">Use Cases</a>
            <a href="#pricing" className="hover:text-zinc-900 transition-colors">Pricing</a>
            <Link href="/marketplace" className="hover:text-zinc-900 transition-colors">Marketplace</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors px-3 py-2">Sign In</Link>
            <GlassButton href="/apply" primary>Get Started</GlassButton>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-8 px-8 overflow-hidden" style={{ minHeight: '100vh' }}>
        {/* Soft gradient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-100/30 blur-[160px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-indigo-50/40 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div {...fadeInUp} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 text-xs font-medium text-indigo-700 mb-8">
            <Sparkles className="w-3 h-3" />
            Now in Open Beta — Free for teams up to 5
          </motion.div>
          <motion.h1 {...fadeInUp} transition={{ duration: 0.6, delay: 0.1 }} className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1] text-zinc-900">
            Design buildings together, in real-time.
          </motion.h1>
          <motion.p {...fadeInUp} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg text-zinc-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            Collaborative 3D spatial platform for architecture, real estate, and construction teams. Powered by WebGPU for native performance.
          </motion.p>
          <motion.div {...fadeInUp} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <GlassButton href="/apply" primary>
              Start Building Free <ArrowRight className="w-4 h-4" />
            </GlassButton>
            <GlassButton href="/playground">
              <Play className="w-4 h-4" /> Try Playground
            </GlassButton>
          </motion.div>
        </div>

        {/* 3D Hero Canvas */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 max-w-5xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden border border-zinc-200 shadow-lg">
            <div className="w-full aspect-[16/9] bg-gradient-to-br from-zinc-50 to-indigo-50/50 overflow-hidden relative">
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <Box className="w-12 h-12 text-zinc-300 animate-pulse" />
                </div>
              }>
                <HeroCanvas />
              </Suspense>
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Logos strip */}
      <section className="py-20 border-y border-zinc-200 bg-zinc-50/40">
        <div className="max-w-7xl mx-auto px-8">
          <p className="text-center text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-12">Trusted by forward-thinking teams</p>
          <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-8 opacity-40">
            {[Building2, Users2, Zap, Shield, Grid3X3].map((Icon, i) => <Icon key={i} className="w-20 h-6" />)}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section id="features" className="py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-indigo-600 font-semibold text-xs uppercase tracking-widest mb-4">Platform</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">Everything you need to build together.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Users2 className="w-5 h-5" />, title: 'Real-Time Sync', desc: 'Every edit is broadcast instantly. Powered by CRDTs — no conflicts, pure collaboration.' },
              { icon: <Eye className="w-5 h-5" />, title: 'Client Presentations', desc: 'Share live links. Clients explore in 3D and comment without edit access.' },
              { icon: <Shield className="w-5 h-5" />, title: 'RBAC Permissions', desc: 'Owner, Editor, Commenter, Viewer. Fine-grained control over who does what.' },
              { icon: <Download className="w-5 h-5" />, title: 'Smart Exports', desc: 'CAD formats, walkthroughs, and interactive presentations. Direct to CDN.' },
              { icon: <Zap className="w-5 h-5" />, title: 'Asset Pipeline', desc: 'Presigned R2 uploads. Draco compression and KTX2 textures included.' },
              { icon: <Grid3X3 className="w-5 h-5" />, title: 'Marketplace', desc: 'Share and clone community designs. Zero storage cost with pointer-based duplication.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-zinc-200 bg-white/50 p-6 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group"
              >
                <div className="p-2 bg-indigo-100 rounded-lg w-fit mb-4 group-hover:bg-indigo-200 transition-colors">
                  <div className="text-indigo-600">{item.icon}</div>
                </div>
                <h3 className="font-bold text-base text-zinc-900 mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-8 bg-zinc-50/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-indigo-600 font-semibold text-xs uppercase tracking-widest mb-4">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">From concept to collaboration in three steps.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Import or Create', desc: 'Start with a blank canvas or import floorplans. Our parametric engine generates building elements instantly.', icon: <FolderOpen className="w-5 h-5" /> },
              { step: '02', title: 'Collaborate Live', desc: 'Invite your team. See cursors, selections, and edits in real-time. No file shuffling.', icon: <Users2 className="w-5 h-5" /> },
              { step: '03', title: 'Share & Export', desc: 'Generate walkthroughs, export to standard formats, or share a live link with stakeholders.', icon: <Download className="w-5 h-5" /> },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-zinc-200 bg-white p-8"
              >
                <div className="text-xs font-bold text-indigo-600 tracking-widest mb-4">{item.step}</div>
                <div className="p-2.5 bg-indigo-100 rounded-lg w-fit mb-5 text-indigo-600">{item.icon}</div>
                <h3 className="text-lg font-bold text-zinc-900 mb-3">{item.title}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-indigo-600 font-semibold text-xs uppercase tracking-widest mb-4">Use Cases</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">Built for every stage of the building lifecycle.</h2>
          </div>
          <div className="flex justify-center gap-3 mb-16">
            {useCases.map((uc, i) => (
              <button
                key={i}
                onClick={() => setActiveUseCase(i)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeUseCase === i
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                    : 'text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-50 border border-zinc-200'
                }`}
              >
                {uc.icon} {uc.title}
              </button>
            ))}
          </div>
          <motion.div
            key={activeUseCase}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-4">{useCases[activeUseCase]?.title} Teams</h3>
              <p className="text-zinc-600 leading-relaxed mb-8">{useCases[activeUseCase]?.desc}</p>
              <ul className="space-y-3">
                {useCases[activeUseCase]?.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-zinc-700 text-sm">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-indigo-600" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/apply"
                className="inline-flex items-center gap-2 mt-8 text-indigo-600 font-medium text-sm hover:text-indigo-700 transition-colors group"
              >
                Get started <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="border border-zinc-200 rounded-xl aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-zinc-50 to-indigo-50/30">
              <div className="text-zinc-400 text-sm font-medium flex flex-col items-center gap-3">
                <Eye className="w-10 h-10" />
                <span>Interactive Preview</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-8 bg-zinc-50/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-indigo-600 font-semibold text-xs uppercase tracking-widest mb-4">Pricing</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-4">Start free. Scale as you grow.</h2>
            <p className="text-zinc-600 text-lg">No credit card required. Upgrade when you need more.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Starter', price: 'Free', period: 'forever', desc: 'For individuals and small teams exploring 3D design.', features: ['Up to 5 team members', '3 active projects', 'Community support', 'Basic exports'], cta: 'Get Started', highlighted: false },
              { name: 'Pro', price: '$29', period: '/seat/mo', desc: 'For professional teams that need advanced collaboration.', features: ['Unlimited members', 'Unlimited projects', 'Real-time sync', 'Priority support', 'Version history', 'Custom materials'], cta: 'Start Free Trial', highlighted: true },
              { name: 'Enterprise', price: 'Custom', period: '', desc: 'For orgs that need security, compliance, and scale.', features: ['Everything in Pro', 'SSO & SAML', 'Dedicated support', 'Custom integrations', 'SLA guarantee', 'On-premise'], cta: 'Contact Sales', highlighted: false },
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-xl p-8 flex flex-col ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-2 border-indigo-300 relative'
                    : 'bg-white border border-zinc-200'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-bold text-zinc-900 mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-extrabold text-zinc-900">{plan.price}</span>
                  <span className="text-zinc-500 text-sm">{plan.period}</span>
                </div>
                <p className={`text-sm mb-6 ${plan.highlighted ? 'text-zinc-700' : 'text-zinc-600'}`}>{plan.desc}</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className={`flex items-center gap-2.5 text-sm ${plan.highlighted ? 'text-zinc-700' : 'text-zinc-600'}`}>
                      <Check className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? 'text-indigo-600' : 'text-indigo-500'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/apply"
                  className={`w-full py-2.5 rounded-lg font-semibold text-sm text-center transition-all ${
                    plan.highlighted
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border border-zinc-300'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-8">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute inset-0 bg-indigo-200/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative border border-zinc-200 rounded-2xl p-16 md:p-24 overflow-hidden bg-white/50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none" />
            <h2 className="relative text-4xl md:text-5xl font-bold mb-6 tracking-tight text-zinc-900">Ready to build together?</h2>
            <p className="relative text-lg text-zinc-600 mb-10 max-w-xl mx-auto">Join teams designing the future with Archly. Free to start, no credit card required.</p>
            <GlassButton href="/apply" primary>
              Get Started Free
            </GlassButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-8 border-t border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
          <div className="space-y-4 max-w-xs">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <Box className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-base tracking-tight text-zinc-900">archly</span>
            </div>
            <p className="text-zinc-600 text-sm leading-relaxed">Collaborative 3D spatial platform for teams building the physical world.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            {[
              { title: 'Product', links: [{ label: 'Features', href: '#features' }, { label: 'Pricing', href: '#pricing' }, { label: 'Marketplace', href: '/marketplace' }, { label: 'Playground', href: '/playground' }] },
              { title: 'Resources', links: [{ label: 'Documentation', href: '#' }, { label: 'Community', href: '#' }, { label: 'Support', href: 'mailto:support@archly.cloud' }, { label: 'Changelog', href: '#' }] },
              { title: 'Legal', links: [{ label: 'Terms', href: '/terms' }, { label: 'Privacy', href: '/privacy' }, { label: 'Contact', href: 'mailto:support@archly.cloud' }] },
            ].map((col, i) => (
              <div key={i} className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-700">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <Link href={link.href} className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-6 border-t border-zinc-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
          <span>&copy; {new Date().getFullYear()} Archly Inc. All rights reserved.</span>
          <div className="flex gap-5">
            <a href="#" className="hover:text-zinc-900 transition-colors">Twitter</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Discord</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
