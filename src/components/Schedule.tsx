import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Calendar, Clock } from 'lucide-react'
import { SCHEDULE, VK_LINK } from '../content'

export default function Schedule() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="schedule" className="py-20 sm:py-28 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
            {SCHEDULE.title}
          </h2>
          <div className="flex items-center justify-center gap-6 flex-wrap mt-3 text-slate-500">
            <span className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-violet-500" />
              {SCHEDULE.period}
            </span>
            <span className="flex items-center gap-2 text-sm">
              <Clock size={16} className="text-teal-500" />
              {SCHEDULE.lessons}
            </span>
          </div>
          <div className="h-1 w-20 mx-auto mt-4 rounded-full bg-gradient-to-r from-violet-500 to-teal-400" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SCHEDULE.groups.map((group, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
              whileHover={{ y: -4 }}
              className={`p-8 rounded-2xl border-2 shadow-lg ${
                group.color === 'violet'
                  ? 'border-violet-200 bg-gradient-to-br from-violet-50 to-white'
                  : 'border-teal-200 bg-gradient-to-br from-teal-50 to-white'
              }`}
            >
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-5 ${
                group.color === 'violet' ? 'bg-violet-100 text-violet-700' : 'bg-teal-100 text-teal-700'
              }`}>
                {group.name} · {group.grade}
              </div>

              <div className="space-y-4">
                {group.days.map((d, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">{d.day}</span>
                    <span className={`text-lg font-bold ${group.color === 'violet' ? 'text-violet-600' : 'text-teal-600'}`}>
                      {d.time}
                    </span>
                  </div>
                ))}
              </div>

              <a
                href={VK_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-6 block w-full py-3 rounded-xl text-center text-sm font-semibold transition-all duration-200 ${
                  group.color === 'violet'
                    ? 'bg-violet-500 hover:bg-violet-600 text-white shadow-lg shadow-violet-200'
                    : 'bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-200'
                }`}
              >
                Записаться в группу
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
