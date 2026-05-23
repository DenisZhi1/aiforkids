import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface RobotMascotProps {
  className?: string
  size?: number
}

export default function RobotMascot({ className = '', size = 260 }: RobotMascotProps) {
  const [expression, setExpression] = useState<'happy' | 'wink' | 'curious' | 'excited'>('happy')
  const [sparkle, setSparkle] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const expressionsList: Array<'happy' | 'wink' | 'curious' | 'excited'> = [
      'happy', 'wink', 'happy', 'curious', 'happy', 'excited',
    ]
    let index = 0
    const interval = setInterval(() => {
      index = (index + 1) % expressionsList.length
      setExpression(expressionsList[index])
      setSparkle(true)
      setTimeout(() => setSparkle(false), 800)
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  const handleInteract = () => {
    const expressionsList: Array<'happy' | 'wink' | 'curious' | 'excited'> = [
      'wink', 'excited', 'curious', 'happy',
    ]
    setExpression(expressionsList[Math.floor(Math.random() * expressionsList.length)])
  }

  const floatY = isDesktop ? [0, -28, 0] : [0, -14, 0]
  const floatDuration = isDesktop ? 3.8 : 4.5

  return (
    <div
      className={`relative select-none flex items-center justify-center ${className}`}
      onClick={handleInteract}
      style={{ width: size, height: size + 40 }}
      role="button"
      aria-label="Interactive AI Robot Mascot"
    >
      {/* Orbital glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-400/20 to-cyan-400/20 rounded-full blur-2xl animate-pulse pointer-events-none" />

      {/* Floating orbital ring */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 300">
        <motion.ellipse
          cx="150" cy="160" rx="110" ry="40"
          fill="none"
          stroke="url(#orbitGradient)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          initial={{ rotate: -15 }}
          animate={{ rotate: 345 }}
          transition={{ repeat: Infinity, duration: 16, ease: 'linear' }}
        />
        <defs>
          <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.7" />
          </linearGradient>
        </defs>
      </svg>

      <motion.div
        className="relative w-full h-full flex items-center justify-center cursor-pointer"
        whileHover={{ scale: 1.05, y: -8 }}
        animate={{ y: floatY }}
        transition={{ y: { repeat: Infinity, duration: floatDuration, ease: 'easeInOut' } }}
      >
        <svg viewBox="0 0 200 275" className="w-full h-full drop-shadow-[0_15px_25px_rgba(139,92,246,0.15)]">
          <defs>
            <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
            <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <radialGradient id="thrusterGlow" cx="50%" cy="0%" r="80%">
              <stop offset="0%" stopColor="#F97316" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
            </radialGradient>
          </defs>

          {sparkle && (
            <g opacity="0.8">
              <path d="M 30,50 L 35,40 L 40,50 L 30,50 Z" fill="#FBBF24" />
              <circle cx="170" cy="80" r="4" fill="#67e8f9" />
              <circle cx="20" cy="150" r="3" fill="#a78bfa" />
            </g>
          )}

          {/* Antenna */}
          <motion.path
            d="M 100,60 L 100,32"
            stroke="#94A3B8" strokeWidth="5" strokeLinecap="round"
            animate={{ rotate: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            style={{ transformOrigin: '100px 60px' }}
          />
          <circle cx="100" cy="26" r="8" fill="#F97316" />
          <circle cx="100" cy="26" r="14" fill="#F97316" fillOpacity="0.3" className="animate-ping" style={{ animationDuration: '3s' }} />

          {/* Ears */}
          <rect x="35" y="85" width="12" height="30" rx="6" fill="#06B6D4" />
          <rect x="153" y="85" width="12" height="30" rx="6" fill="#06B6D4" />
          <circle cx="41" cy="100" r="3" fill="#FFFFFF" />
          <circle cx="159" cy="100" r="3" fill="#FFFFFF" />

          {/* Head */}
          <rect x="45" y="60" width="110" height="90" rx="32" fill="url(#metalGrad)" stroke="#CBD5E1" strokeWidth="3" />
          <path d="M 60,70 Q 100,64 140,70" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.8" />

          {/* Face screen */}
          <rect x="55" y="75" width="90" height="62" rx="18" fill="url(#screenGrad)" stroke="#475569" strokeWidth="2" />

          {/* Expressions */}
          {expression === 'happy' && (
            <g>
              <path d="M 68,102 Q 78,92 88,102" fill="none" stroke="#22D3EE" strokeWidth="5.5" strokeLinecap="round" filter="drop-shadow(0 0 4px #06B6D4)" />
              <path d="M 112,102 Q 122,92 132,102" fill="none" stroke="#22D3EE" strokeWidth="5.5" strokeLinecap="round" filter="drop-shadow(0 0 4px #06B6D4)" />
              <circle cx="68" cy="118" r="4" fill="#F43F5E" opacity="0.6" />
              <circle cx="132" cy="118" r="4" fill="#F43F5E" opacity="0.6" />
              <path d="M 94,116 Q 100,124 106,116" fill="none" stroke="#E2E8F0" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          )}
          {expression === 'wink' && (
            <g>
              <path d="M 68,104 Q 78,94 88,104" fill="none" stroke="#10B981" strokeWidth="5.5" strokeLinecap="round" filter="drop-shadow(0 0 4px #10B981)" />
              <line x1="112" y1="102" x2="132" y2="102" stroke="#10B981" strokeWidth="5.5" strokeLinecap="round" filter="drop-shadow(0 0 4px #10B981)" />
              <circle cx="68" cy="118" r="4" fill="#F43F5E" opacity="0.6" />
              <circle cx="132" cy="118" r="4" fill="#F43F5E" opacity="0.6" />
              <path d="M 94,114 Q 102,122 108,118" fill="none" stroke="#E2E8F0" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          )}
          {expression === 'curious' && (
            <g>
              <circle cx="78" cy="100" r="7" fill="#F59E0B" filter="drop-shadow(0 0 4px #F59E0B)" />
              <circle cx="122" cy="100" r="4.5" fill="#F59E0B" filter="drop-shadow(0 0 4px #F59E0B)" />
              <line x1="93" y1="120" x2="107" y2="120" stroke="#E2E8F0" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 115,88 Q 124,84 130,90" fill="none" stroke="#F59E0B" strokeWidth="2.5" />
            </g>
          )}
          {expression === 'excited' && (
            <g>
              <circle cx="78" cy="98" r="9" fill="#A78BFA" filter="drop-shadow(0 0 5px #8B5CF6)" />
              <circle cx="78" cy="98" r="4" fill="#FFFFFF" />
              <circle cx="122" cy="98" r="9" fill="#A78BFA" filter="drop-shadow(0 0 5px #8B5CF6)" />
              <circle cx="122" cy="98" r="4" fill="#FFFFFF" />
              <path d="M 92,114 Q 100,126 108,114 Z" fill="#E2E8F0" />
            </g>
          )}

          {/* Neck */}
          <rect x="85" y="146" width="30" height="15" rx="4" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
          <line x1="90" y1="151" x2="110" y2="151" stroke="#334155" strokeWidth="1.5" />
          <line x1="90" y1="155" x2="110" y2="155" stroke="#334155" strokeWidth="1.5" />

          {/* Body */}
          <rect x="52" y="158" width="96" height="70" rx="24" fill="url(#metalGrad)" stroke="#CBD5E1" strokeWidth="3" />

          {/* Chest core */}
          <circle cx="100" cy="190" r="20" fill="#1E293B" stroke="#475569" strokeWidth="2" />
          <motion.circle
            cx="100" cy="190" r="12"
            fill="url(#neonGlow)"
            animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          />
          <circle cx="100" cy="190" r="5" fill="#FFFFFF" />

          {/* Left arm — smooth wide wave ~50° total */}
          <motion.g
            animate={{ rotate: [-25, 25, -25] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
            style={{ transformOrigin: '48px 170px' }}
          >
            <path d="M 52,174 Q 25,185 22,205" fill="none" stroke="#94A3B8" strokeWidth="10" strokeLinecap="round" />
            <circle cx="22" cy="205" r="7" fill="#06B6D4" />
          </motion.g>

          {/* Right arm — opposite phase */}
          <motion.g
            animate={expression === 'excited' || expression === 'wink'
              ? { rotate: [-20, 40, -20] }
              : { rotate: [25, -25, 25] }}
            transition={{ repeat: Infinity, duration: expression === 'excited' ? 1.6 : 4.5, ease: 'easeInOut' }}
            style={{ transformOrigin: '152px 170px' }}
          >
            <path d="M 148,174 Q 175,185 178,205" fill="none" stroke="#94A3B8" strokeWidth="10" strokeLinecap="round" />
            <circle cx="178" cy="205" r="7" fill="#06B6D4" />
          </motion.g>

          {/* Jet nozzle */}
          <path d="M 82,224 L 118,224 L 110,236 L 90,236 Z" fill="#64748B" />

          {/* Thruster glow halo */}
          <motion.ellipse
            cx="100" cy="238" rx="22" ry="8"
            fill="url(#thrusterGlow)"
            animate={{ opacity: [0.5, 1, 0.5], ry: [6, 10, 6] }}
            transition={{ repeat: Infinity, duration: 0.5, ease: 'easeInOut' }}
          />

          {/* Outer flame — wide orange */}
          <motion.path
            d="M 88,236 Q 100,292 112,236"
            fill="none" stroke="#F97316" strokeWidth="14" strokeLinecap="round"
            animate={{ scaleY: [0.55, 1.45, 0.55], opacity: [0.85, 1, 0.85] }}
            transition={{ repeat: Infinity, duration: 0.5, ease: 'easeInOut' }}
            style={{ transformOrigin: '100px 236px' }}
          />
          {/* Mid flame — amber */}
          <motion.path
            d="M 92,236 Q 100,272 108,236"
            fill="none" stroke="#FBBF24" strokeWidth="9" strokeLinecap="round"
            animate={{ scaleY: [0.5, 1.4, 0.5] }}
            transition={{ repeat: Infinity, duration: 0.38, ease: 'easeInOut' }}
            style={{ transformOrigin: '100px 236px' }}
          />
          {/* Inner core — white-hot */}
          <motion.path
            d="M 96,236 Q 100,256 104,236"
            fill="none" stroke="#FEF3C7" strokeWidth="5" strokeLinecap="round"
            animate={{ scaleY: [0.45, 1.25, 0.45] }}
            transition={{ repeat: Infinity, duration: 0.28, ease: 'easeInOut' }}
            style={{ transformOrigin: '100px 236px' }}
          />
        </svg>

        {/* Speech bubble — centered above robot head */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/90 border border-purple-200/50 rounded-2xl px-3 py-1.5 shadow-md backdrop-blur-md text-[11px] font-semibold text-purple-700 pointer-events-none select-none flex items-center gap-1 opacity-90">
          <span className="animate-bounce">🤖</span>
          <span>
            {expression === 'happy' && 'Привет, друг!'}
            {expression === 'wink' && 'Давай поиграем?'}
            {expression === 'curious' && 'А что внутри?'}
            {expression === 'excited' && 'Ух ты! ИИ!'}
          </span>
        </div>
      </motion.div>
    </div>
  )
}
