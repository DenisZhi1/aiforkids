import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Check } from 'lucide-react'
import { PRICING, VK_LINK } from '../content'

export default function Pricing() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="pricing" className="py-20 sm:py-28 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0a2e 0%, #1a1a4e 50%, #0d2640 100%)' }}>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(139,92,246,0.4) 0%, transparent 50%)' }} />
        <div className="absolute inset-0 opacity-15"
          style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(45,212,191,0.4) 0%, transparent 50%)' }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {PRICING.title}
          </h2>
          <div className="h-1 w-20 mx-auto rounded-full bg-gradient-to-r from-violet-400 to-teal-400" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PRICING.options.map((opt, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className={`relative p-8 rounded-2xl border flex flex-col ${
                opt.highlight
                  ? 'border-teal-400/60 bg-gradient-to-br from-teal-900/40 to-teal-800/20 shadow-2xl shadow-teal-500/20'
                  : 'border-violet-400/30 bg-gradient-to-br from-violet-900/30 to-violet-800/10'
              } transition-all duration-300`}
            >
              {opt.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-gradient-to-r from-teal-400 to-teal-500 text-white text-xs font-bold shadow-lg">
                    Выгоднее
                  </span>
                </div>
              )}

              <h3 className="font-heading text-xl font-semibold text-white mb-2">{opt.name}</h3>
              <p className="text-slate-400 text-sm mb-4">{opt.description}</p>

              <div className={`text-4xl font-bold mb-1 ${opt.highlight ? 'text-teal-300' : 'text-violet-300'}`}>
                {opt.price}
              </div>
              {opt.total && (
                <div className="text-slate-500 text-sm line-through mb-4">{opt.total} суммарно</div>
              )}

              <ul className="space-y-2 mt-4 flex-1">
                {opt.payments.map((p, j) => (
                  <li key={j} className="flex items-center gap-2 text-slate-300 text-sm">
                    <Check size={16} className={opt.highlight ? 'text-teal-400' : 'text-violet-400'} />
                    {p}
                  </li>
                ))}
              </ul>

              <a
                href={VK_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-8 block w-full py-3.5 rounded-xl text-center font-semibold transition-all duration-200 ${
                  opt.highlight
                    ? 'bg-gradient-to-r from-teal-400 to-teal-500 text-white hover:shadow-lg hover:shadow-teal-500/30 hover:scale-[1.02]'
                    : 'bg-gradient-to-r from-violet-500 to-violet-600 text-white hover:shadow-lg hover:shadow-violet-500/30 hover:scale-[1.02]'
                }`}
              >
                Записаться
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
