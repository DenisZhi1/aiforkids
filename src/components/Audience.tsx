import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Users, PlayCircle } from 'lucide-react'
import { AUDIENCE } from '../content'

export default function Audience() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="audience" className="py-20 sm:py-28 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #faf9f7 0%, #f0eeff 100%)' }}>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
            {AUDIENCE.title}
          </h2>
          <div className="h-1 w-20 mx-auto rounded-full bg-gradient-to-r from-violet-500 to-teal-400" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {AUDIENCE.groups.map((group, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i === 0 ? -40 : 40 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
              whileHover={{ y: -4 }}
              className={`relative p-8 rounded-2xl overflow-hidden shadow-lg border ${
                group.color === 'violet'
                  ? 'border-violet-200 bg-white'
                  : 'border-teal-200 bg-white'
              }`}
            >
              {/* Color accent top bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                group.color === 'violet'
                  ? 'bg-gradient-to-r from-violet-400 to-violet-600'
                  : 'bg-gradient-to-r from-teal-400 to-teal-600'
              }`} />

              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4 ${
                group.color === 'violet'
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-teal-100 text-teal-700'
              }`}>
                {group.grade} · {group.age}
              </div>

              <p className="text-slate-600 leading-relaxed">{group.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center gap-4 p-6 rounded-2xl bg-white border border-violet-100 shadow-sm flex-1"
          >
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
              <Users className="text-violet-600" size={22} />
            </div>
            <p className="text-slate-700 leading-relaxed">{AUDIENCE.note}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="flex items-center gap-4 p-6 rounded-2xl bg-white border border-teal-100 shadow-sm flex-1"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
              <PlayCircle className="text-teal-600" size={22} />
            </div>
            <p className="text-slate-700 leading-relaxed">{AUDIENCE.noteRecord}</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
