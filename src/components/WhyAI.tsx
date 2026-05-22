import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { WHY_AI } from '../content'

const cardColors = ['violet', 'teal', 'orange', 'mint']
const colorMap: Record<string, string> = {
  violet: 'from-violet-50 to-violet-100/50 border-violet-200 hover:border-violet-400 hover:shadow-violet-200',
  teal: 'from-teal-50 to-teal-100/50 border-teal-200 hover:border-teal-400 hover:shadow-teal-200',
  orange: 'from-orange-50 to-orange-100/50 border-orange-200 hover:border-orange-400 hover:shadow-orange-200',
  mint: 'from-emerald-50 to-emerald-100/50 border-emerald-200 hover:border-emerald-400 hover:shadow-emerald-200',
}
const emojiColors: Record<string, string> = {
  violet: 'bg-violet-100',
  teal: 'bg-teal-100',
  orange: 'bg-orange-100',
  mint: 'bg-emerald-100',
}

export default function WhyAI() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="why" className="py-20 sm:py-28 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)' }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
            {WHY_AI.title}
          </h2>
          <div className="h-1 w-20 mx-auto rounded-full bg-gradient-to-r from-violet-500 to-teal-400" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY_AI.cards.map((card, i) => {
            const color = cardColors[i]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.12)' }}
                className={`p-6 rounded-2xl border bg-gradient-to-br ${colorMap[color]} shadow-sm transition-all duration-300 cursor-default`}
              >
                <div className={`w-12 h-12 rounded-xl ${emojiColors[color]} flex items-center justify-center text-2xl mb-4`}>
                  {card.icon}
                </div>
                <h3 className="font-heading text-xl font-semibold text-slate-800 mb-2">{card.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{card.text}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
