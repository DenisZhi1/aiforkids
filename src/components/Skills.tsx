import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { SKILLS } from '../content'

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, x: -64, scale: 0.97 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

// Circle outline draws first — delay relative to card appear
const circleVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.45, ease: 'easeOut', delay: 0.25 },
  },
}

// Tick draws after circle
const tickVariants = {
  hidden: { pathLength: 0 },
  show: {
    pathLength: 1,
    transition: { duration: 0.28, ease: 'easeOut', delay: 0.6 },
  },
}

// Inner fill pops in at the end
const fillVariants = {
  hidden: { scale: 0, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 500, damping: 18, delay: 0.62 },
  },
}

function AnimatedCheck() {
  return (
    <div className="relative shrink-0 w-7 h-7">
      <svg viewBox="0 0 28 28" fill="none" className="w-7 h-7 absolute inset-0">
        {/* Subtle fill behind circle */}
        <motion.circle
          cx="14" cy="14" r="12"
          fill="rgba(45,212,191,0.12)"
          variants={fillVariants}
        />
        {/* Circle outline draws */}
        <motion.circle
          cx="14" cy="14" r="12"
          stroke="#2dd4bf"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          variants={circleVariants}
          style={{ rotate: -90 }}
        />
        {/* Tick draws */}
        <motion.path
          d="M 8,14 L 12.5,18.5 L 20,9.5"
          stroke="#2dd4bf"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          variants={tickVariants}
        />
      </svg>
    </div>
  )
}

export default function Skills() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section
      id="skills"
      className="py-20 sm:py-28 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0a2e 0%, #1a1a4e 50%, #0d2640 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-0 w-full h-full opacity-30"
          style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(139,92,246,0.3) 0%, transparent 50%)' }}
        />
        <div
          className="absolute top-0 right-0 w-full h-full opacity-20"
          style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(45,212,191,0.3) 0%, transparent 50%)' }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {SKILLS.title}
          </h2>
          <div className="h-1 w-20 mx-auto rounded-full bg-gradient-to-r from-violet-400 to-teal-400" />
        </motion.div>

        <motion.ul
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          className="space-y-3"
        >
          {SKILLS.list.map((skill, i) => (
            <motion.li
              key={i}
              variants={cardVariants}
              whileHover={{ x: 6, transition: { duration: 0.2 } }}
              className="flex items-center gap-4 px-5 py-4 rounded-xl glass-dark group cursor-default
                         border border-white/5 hover:border-teal-400/30 hover:bg-teal-400/5
                         transition-colors duration-300"
            >
              <AnimatedCheck />

              <span className="text-slate-200 text-base leading-relaxed">
                {skill}
              </span>

              {/* Subtle right arrow that appears on hover */}
              <motion.span
                className="ml-auto text-teal-400/0 group-hover:text-teal-400/60 text-sm transition-colors duration-300 shrink-0"
                initial={{ x: -4 }}
                whileHover={{ x: 0 }}
              >
                →
              </motion.span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
