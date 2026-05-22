import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { Award, BookOpen, GraduationCap, Sparkles, MessageSquare } from 'lucide-react'
import { VK_LINK } from '../content'
import denisSrc from '../assets/denis.jpg'

const stats = [
  { value: '1000+', label: 'Обученных педагогов' },
  { value: '500+',  label: 'Часов лекций по ИИ' },
  { value: '50+',   label: 'Детей прошли обучение по ИИ' },
  { value: '100%',  label: 'Практический подход' },
]

const bullets = [
  {
    icon: GraduationCap,
    title: 'Инженер-программист по образованию',
    description:
      'Понимаю внутреннюю математику и устройство нейронных сетей изнутри, а не на уровне простого пользователя.',
  },
  {
    icon: Award,
    title: 'Автор курсов ИИ для общего образования',
    description:
      'За последние 2 года обучил более 1000 учителей по всей России внедрять искусственный интеллект в классные уроки.',
  },
  {
    icon: BookOpen,
    title: 'Преподаватель программирования и английского',
    description:
      'Знаю тонкости детской психологии, умею удерживать внимание, объяснять сложные термины простым языком и мотивировать.',
  },
]

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Track scroll progress through the section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  // Spring-smoothed progress for buttery movement
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.001,
  })

  // Photo drifts down 180px over the full section height (desktop only)
  const photoY = useTransform(smoothProgress, [0, 1], [0, isDesktop ? 180 : 0])

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-24 px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0f0a2e 0%, #12103a 50%, #0d1f3c 100%)' }}
    >
      {/* Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500/15 border border-teal-500/30 rounded-full text-teal-300 text-xs font-mono uppercase tracking-widest font-bold">
            <Sparkles size={13} className="animate-pulse" />
            Наставник вашего ребёнка
          </div>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            О преподавателе курса
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Мы отказались от нанимаемых неподготовленных кураторов. Каждое занятие ведёт лично автор программы.
          </p>
        </motion.div>

        {/* Grid: photo left, text right */}
        <div className="grid lg:grid-cols-12 gap-12 items-start">

          {/* Photo column — дрейфует вниз при скролле на десктопе */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              style={{ y: photoY }}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Gradient glow border */}
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-teal-400 via-violet-500 to-purple-400 rounded-3xl blur opacity-30 pointer-events-none" />
              <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-2xl">
                <img
                  src={denisSrc}
                  alt="Денис Жихарев — преподаватель курса по ИИ"
                  className="w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 object-cover object-top rounded-xl"
                />
                {/* Badge */}
                <div className="absolute bottom-6 left-6 right-6 bg-slate-950/90 border border-slate-700/80 backdrop-blur px-4 py-3 rounded-xl flex items-center gap-3">
                  <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500 animate-ping" />
                  <div className="min-w-0">
                    <p className="text-white text-xs font-bold leading-none uppercase tracking-wide">
                      Денис Жихарев
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">
                      Основатель курса, ведущий педагог
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Text column — скроллится как обычно */}
          <motion.div
            className="lg:col-span-7 space-y-8"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="space-y-4">
              <span className="text-xs font-mono text-teal-400 font-bold uppercase tracking-widest">
                Индивидуальный подход
              </span>
              <h3 className="font-heading text-2xl md:text-3xl font-bold text-white">
                Здравствуйте, я Денис!
              </h3>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                Я разработал этот курс, потому что чувствую искреннюю необходимость подружить
                школьников с технологиями с юных лет. Моя ключевая цель — научить ребят смотреть
                на компьютеры и нейросети как на умные инструменты для творчества, проектов и
                логического созидания, а не как на бездумный способ убивать время в телефонах.
              </p>
            </div>

            {/* Bullets */}
            <div className="space-y-3">
              {bullets.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  className="flex gap-4 p-4 rounded-xl border border-transparent hover:border-slate-700/60 hover:bg-slate-900/40 transition-all duration-200"
                >
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center border border-violet-500/20">
                    <b.icon size={18} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm md:text-base font-bold text-white leading-snug">
                      {b.title}
                    </h4>
                    <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                      {b.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-700/50">
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * i }}
                  className="text-left p-2"
                >
                  <div className="font-heading font-black text-2xl md:text-3xl bg-gradient-to-r from-teal-400 to-violet-400 bg-clip-text text-transparent leading-none">
                    {s.value}
                  </div>
                  <div className="text-[10px] md:text-xs text-slate-400 font-medium mt-1 leading-tight">
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* VK CTA */}
            <motion.a
              href={VK_LINK}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-teal-400 border border-teal-500/25 hover:border-teal-500/50 text-xs font-bold rounded-xl transition-all shadow-lg"
            >
              <MessageSquare size={14} />
              Задать вопрос Денису Жихареву напрямую в ВК
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
