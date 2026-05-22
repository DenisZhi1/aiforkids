import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { type LucideIcon, Sparkles, MessageSquare, BookOpen, Image, Video, Code2, Trophy } from 'lucide-react'
import { PROGRAM } from '../content'

const ICONS: Record<string, LucideIcon> = {
  Sparkles, MessageSquare, BookOpen, Image, Video, Code2, Trophy,
}

const colorStyles: Record<string, { bg: string; text: string; border: string; dot: string; line: string }> = {
  violet: { bg: 'bg-violet-100', text: 'text-violet-600', border: 'border-violet-300', dot: 'bg-violet-500', line: 'bg-violet-200' },
  teal:   { bg: 'bg-teal-100',   text: 'text-teal-600',   border: 'border-teal-300',   dot: 'bg-teal-500',   line: 'bg-teal-200'   },
  mint:   { bg: 'bg-emerald-100',text: 'text-emerald-600',border: 'border-emerald-300',dot: 'bg-emerald-500',line: 'bg-emerald-200' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-300', dot: 'bg-orange-500', line: 'bg-orange-200' },
}

export default function Program() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="program" className="py-20 sm:py-28 bg-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(45,212,191,0.04) 0%, transparent 60%)' }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-3">
            {PROGRAM.title}
          </h2>
          <p className="text-slate-500 text-lg">{PROGRAM.subtitle}</p>
          <div className="h-1 w-20 mx-auto mt-4 rounded-full bg-gradient-to-r from-violet-500 to-teal-400" />
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-300 via-teal-300 to-orange-300 hidden sm:block" />

          <div className="space-y-6">
            {PROGRAM.modules.map((mod, i) => {
              const Icon = ICONS[mod.icon]
              const c = colorStyles[mod.color]
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ x: 4 }}
                  className="flex gap-4 sm:gap-6 items-start"
                >
                  {/* Timeline dot */}
                  <div className={`relative z-10 w-12 h-12 rounded-xl ${c.bg} ${c.text} flex items-center justify-center shrink-0 shadow-sm border ${c.border}`}>
                    <Icon size={20} />
                  </div>

                  {/* Card */}
                  <div className={`flex-1 p-5 rounded-2xl border bg-gradient-to-br from-white to-slate-50 ${c.border} shadow-sm hover:shadow-md transition-shadow duration-300`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                        {mod.num}
                      </span>
                      <h3 className="font-heading text-lg font-semibold text-slate-800">{mod.title}</h3>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">{mod.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
