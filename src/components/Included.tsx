import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { type LucideIcon, Monitor, Zap, Bot, Video, MessageCircle, ClipboardList, Layers, Star } from 'lucide-react'
import { INCLUDED } from '../content'

const ICONS: Record<string, LucideIcon> = {
  Monitor, Zap, Bot, Video, MessageCircle, ClipboardList, Layers, Star,
}

const COLORS = [
  'from-violet-100 to-violet-50 border-violet-200 text-violet-600',
  'from-teal-100 to-teal-50 border-teal-200 text-teal-600',
  'from-orange-100 to-orange-50 border-orange-200 text-orange-600',
  'from-emerald-100 to-emerald-50 border-emerald-200 text-emerald-600',
  'from-teal-100 to-teal-50 border-teal-200 text-teal-600',
  'from-violet-100 to-violet-50 border-violet-200 text-violet-600',
  'from-orange-100 to-orange-50 border-orange-200 text-orange-600',
  'from-emerald-100 to-emerald-50 border-emerald-200 text-emerald-600',
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const item = {
  hidden: { opacity: 0, scale: 0.85, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4 } },
}

export default function Included() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="included" className="py-20 sm:py-28 bg-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
            {INCLUDED.title}
          </h2>
          <div className="h-1 w-20 mx-auto rounded-full bg-gradient-to-r from-violet-500 to-teal-400" />
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {INCLUDED.items.map((item2, i) => {
            const Icon = ICONS[item2.icon]
            const colors = COLORS[i].split(' ')
            return (
              <motion.div
                key={i}
                variants={item}
                whileHover={{ y: -4, scale: 1.03 }}
                className={`p-5 rounded-2xl border bg-gradient-to-br ${COLORS[i]} shadow-sm text-center cursor-default transition-all duration-200`}
              >
                <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-3 ${colors[0].replace('from-', 'bg-')}`}>
                  <Icon size={20} className={colors[3]} />
                </div>
                <p className="text-slate-700 text-sm font-medium leading-tight">{item2.text}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
