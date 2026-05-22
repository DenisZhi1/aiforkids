import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Quote } from 'lucide-react'

interface StudentReview {
  name: string
  age: number
  text: string
  avatarPlaceholder: string
  bgColor: string
  project: string
}

const STUDENT_REVIEWS: StudentReview[] = [
  {
    name: 'Айрапет',
    age: 16,
    text: 'Изначально думал, что ИИ — это просто игрушка для генерации шуток. На курсе Дениса я научился вайб-кодингу, создал свою первую полностью рабочую HTML-игру и разместил её на хостинге! Ощущения непередаваемые. Это дало мне гигантский толчок в выборе будущей профессии.',
    avatarPlaceholder: '👨‍💻',
    bgColor: 'border-indigo-500/20',
    project: 'Проект: Веб-игра на HTML/CSS',
  },
  {
    name: 'Дарья',
    age: 15,
    text: 'Я думала, что ИИ — это только для списывания сочинений или ответов по биологии. Но Денис показал, как ИИ может работать репетитором. Я теперь с лёгкостью готовлюсь к школьным проектам за 10 минут, сама продумываю классные презентации и учу младшего брата основам промптов. Мои оценки стали намного лучше!',
    avatarPlaceholder: '👩‍🎨',
    bgColor: 'border-cyan-500/20',
    project: 'Проект: Презентация ИИ-ассистента',
  },
  {
    name: 'Кеша',
    age: 15,
    text: 'Самым крутым на занятиях для меня стала генерация графики и видео. Мы не просто писали скучные запросы, а создали целую иллюстрированную книгу со своим персонажем и наложили озвучку с помощью ИИ. Родители были в шоке, когда я им показал этот мультфильм!',
    avatarPlaceholder: '🎒',
    bgColor: 'border-purple-500/20',
    project: 'Проект: Генерация видеоролика',
  },
  {
    name: 'Тимофей',
    age: 9,
    text: 'Мне 9 лет, я сначала думал, что программировать очень тяжело. Оказалось, если создавать сайт вместе с умным ИИ-секретарём, то всё получается сразу. Я сделал сайт-визитку про своих домашних животных, опубликовал в интернете и отправил ссылку бабушке в другой город!',
    avatarPlaceholder: '🚀',
    bgColor: 'border-cyan-500/20',
    project: 'Проект: Сайт-портфолио',
  },
  {
    name: 'Никита',
    age: 9,
    text: 'Денис Жихарев — самый лучший учитель! Он шутит, рассказывает всё очень понятно и весело, хвалит, когда мы придумываем необычные картинки или сочиняем ролевые промпты. Уроки пролетали очень быстро, я всегда с нетерпением ждал следующего дня занятий.',
    avatarPlaceholder: '🎨',
    bgColor: 'border-indigo-500/20',
    project: 'Проект: Персональный чат-бот',
  },
]

const ACCENT_COLORS = [
  { bg: 'from-indigo-950/50 to-indigo-900/20', dot: 'bg-indigo-500' },
  { bg: 'from-cyan-950/50 to-cyan-900/20', dot: 'bg-cyan-500' },
  { bg: 'from-purple-950/50 to-purple-900/20', dot: 'bg-purple-500' },
  { bg: 'from-cyan-950/50 to-teal-900/20', dot: 'bg-teal-500' },
  { bg: 'from-indigo-950/50 to-violet-900/20', dot: 'bg-violet-500' },
]

export default function Reviews() {
  const [activeIdx, setActiveIdx] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % STUDENT_REVIEWS.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const review = STUDENT_REVIEWS[activeIdx]
  const accent = ACCENT_COLORS[activeIdx]

  return (
    <section
      id="reviews"
      ref={ref}
      className="py-20 sm:py-28 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0f0a2e 0%, #1a1a4e 100%)' }}
    >
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.4) 0%, transparent 70%)' }} />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-mono uppercase tracking-widest mb-4">
            <Quote size={12} />
            Отзывы наших выпускников
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
            Гордость родителей и учеников
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Ребята делятся результатами, которых смогли достичь в рамках обучения у Дениса.
          </p>
        </motion.div>

        {/* Slider */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -15 }}
                transition={{ duration: 0.35 }}
                className={`p-6 md:p-10 rounded-3xl border ${review.bgColor} bg-gradient-to-br ${accent.bg} relative flex flex-col justify-between min-h-[280px] shadow-xl`}
              >
                {/* Big quote decoration */}
                <div className="absolute top-6 right-8 text-white/5 font-heading font-black text-8xl pointer-events-none select-none leading-none">
                  "
                </div>

                <p className="text-slate-100 text-base md:text-lg font-medium leading-relaxed italic relative z-10">
                  «{review.text}»
                </p>

                <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-4 justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-slate-950 flex items-center justify-center text-2xl select-none shadow">
                      {review.avatarPlaceholder}
                    </div>
                    <div>
                      <h4 className="text-white font-bold font-heading text-base leading-none">
                        {review.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 font-mono">
                        {review.age} лет · ученик курса
                      </p>
                    </div>
                  </div>

                  <div className="px-3.5 py-1.5 bg-slate-950/50 rounded-lg border border-slate-700 text-[11px] font-mono font-semibold text-purple-300">
                    {review.project}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dot indicators */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {STUDENT_REVIEWS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIdx(index)}
                  aria-label={`Перейти к отзыву ${index + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    index === activeIdx
                      ? `w-8 ${accent.dot}`
                      : 'w-2.5 bg-slate-700 hover:bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
