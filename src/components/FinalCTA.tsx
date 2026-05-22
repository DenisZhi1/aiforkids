import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight, Rocket } from 'lucide-react'
import { FINAL_CTA, VK_LINK } from '../content'

export default function FinalCTA() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="cta" className="py-24 sm:py-32 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0a2e 0%, #1a1a4e 40%, #0d2640 70%, #0a1628 100%)' }}>

      {/* Animated orbs */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)' }}
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, delay: 1 }}
        className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.2) 0%, transparent 70%)' }}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 text-center" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
          <Rocket className="mx-auto text-orange-400 mb-4" size={48} />
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            {FINAL_CTA.title}
          </h2>
          <p className="text-teal-300 text-lg font-semibold leading-8 mb-8">
            {FINAL_CTA.subtitleLine1}<br />
            {FINAL_CTA.subtitleLine2}
          </p>
        </motion.div>

        {/* Facts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap gap-3 justify-center mb-10"
        >
          {FINAL_CTA.facts.map((fact, i) => (
            <span key={i} className="px-4 py-2 rounded-full glass-dark text-slate-300 text-sm border border-white/10">
              {fact}
            </span>
          ))}
        </motion.div>

        <motion.a
          href={VK_LINK}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.5 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-violet-500 via-violet-600 to-teal-500 text-white font-bold text-xl shadow-2xl shadow-violet-500/40"
        >
          {FINAL_CTA.cta}
          <ArrowRight size={22} />
        </motion.a>
      </div>
    </section>
  )
}
