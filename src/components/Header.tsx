import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { NAV_LINKS, VK_LINK } from '../content'
import logoSrc from '../assets/logo.png'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-lg shadow-violet-500/10' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 shrink-0">
          <img src={logoSrc} alt="DEAL for Kids" className="h-9 w-auto" />
        </a>

        {/* Mobile title — visible only on mobile when scrolled */}
        {scrolled && (
          <span className="md:hidden absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-slate-700 whitespace-nowrap pointer-events-none">
            Курс по ИИ для детей
          </span>
        )}

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200
                ${scrolled
                  ? 'text-slate-700 hover:text-violet-600 hover:bg-violet-50'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
            >
              {link.label}
            </a>
          ))}
          <a
            href={VK_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 px-5 py-2 rounded-full bg-gradient-to-r from-violet-500 to-teal-400 text-white text-sm font-semibold shadow-lg hover:scale-105 hover:shadow-violet-400/40 transition-all duration-200"
          >
            Записаться
          </a>
        </nav>

        {/* Burger */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-violet-50 transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label="Меню"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden glass border-t border-white/30 overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-base font-medium text-slate-700 hover:text-violet-600 py-2 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href={VK_LINK}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="mt-2 px-5 py-3 rounded-full bg-gradient-to-r from-violet-500 to-teal-400 text-white text-base font-semibold text-center shadow-lg"
              >
                Записаться
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
