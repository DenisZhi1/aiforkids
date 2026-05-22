import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { HERO, VK_LINK } from '../content'
import RobotMascot from './RobotMascot'

const words = HERO.title.split(' ')

const Stars = () => {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 3,
  }))
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.3, 1] }}
          transition={{ duration: 2 + s.delay, repeat: Infinity, delay: s.delay }}
        />
      ))}
    </div>
  )
}

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -80])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -40])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const btnRef = useRef<HTMLAnchorElement>(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const btn = btnRef.current
    if (!btn) return
    const onMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      setMouse({ x: x * 0.25, y: y * 0.25 })
    }
    const onLeave = () => setMouse({ x: 0, y: 0 })
    btn.addEventListener('mousemove', onMove)
    btn.addEventListener('mouseleave', onLeave)
    return () => { btn.removeEventListener('mousemove', onMove); btn.removeEventListener('mouseleave', onLeave) }
  }, [])

  return (
    <section
      ref={ref}
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden pt-16"
      style={{ background: 'linear-gradient(135deg, #0f0a2e 0%, #1a1a4e 40%, #0d2640 70%, #0a1628 100%)' }}
    >
      {/* Parallax background layers */}
      <motion.div style={{ y: y1 }} className="absolute inset-0 pointer-events-none">
        <Stars />
      </motion.div>

      {/* Floating orbs */}
      <motion.div
        style={{ y: y2, background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' }}
        className="absolute top-20 left-10 w-72 h-72 rounded-full pointer-events-none"
      />
      <motion.div
        className="absolute bottom-32 right-16 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.1) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity, delay: 2 }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          {/* Text content — fades on scroll, robot stays bright */}
          <motion.div style={{ opacity }} className="flex-1 text-center lg:text-left">
            {/* Title word-by-word */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block mr-3"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.12 }}
                >
                  {i === 2 ? (
                    <span className="text-gradient">{word}</span>
                  ) : i === 4 ? (
                    <span style={{ color: '#2dd4bf' }}>{word}</span>
                  ) : word}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
            >
              {HERO.subtitle}
            </motion.p>

            {/* Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="flex flex-wrap gap-3 justify-center lg:justify-start mb-10"
            >
              {HERO.badges.map((badge, i) => (
                <span
                  key={i}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold glass-dark text-violet-300 border border-violet-500/30"
                >
                  {badge}
                </span>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.a
                ref={btnRef}
                href={VK_LINK}
                target="_blank"
                rel="noopener noreferrer"
                style={{ x: mouse.x, y: mouse.y }}
                animate={{ boxShadow: ['0 0 20px rgba(139,92,246,0.4)', '0 0 40px rgba(139,92,246,0.7)', '0 0 20px rgba(139,92,246,0.4)'] }}
                transition={{ boxShadow: { duration: 2, repeat: Infinity } }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-violet-500 to-violet-600 text-white font-bold text-lg shadow-xl"
              >
                {HERO.cta}
              </motion.a>
              <motion.a
                href="#program"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 rounded-full border-2 border-teal-400/60 text-teal-300 font-bold text-lg hover:bg-teal-400/10 transition-colors"
              >
                {HERO.ctaSecondary}
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Robot mascot — no opacity, always bright */}
          <motion.div
            className="flex-shrink-0 relative z-20"
            initial={{ opacity: 0, x: 80, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
          >
            <RobotMascot size={260} />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-violet-400/50 flex justify-center pt-2">
          <div className="w-1.5 h-2.5 rounded-full bg-violet-400 opacity-70" />
        </div>
      </motion.div>
    </section>
  )
}
