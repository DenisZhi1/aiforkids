import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Image, Video, Globe, FileText, X, ExternalLink, Play } from 'lucide-react'

type Tab = 'images' | 'videos' | 'sites' | 'pdf'

interface ProjectItem {
  src: string
  title: string
}

const DATA: Record<Tab, ProjectItem[]> = {
  images: [
    { src: './projects/0.png',   title: 'Арт-проект' },
    { src: './projects/1.png',   title: 'Арт-проект' },
    { src: './projects/2.png',   title: 'Иллюстрация' },
    { src: './projects/3.png',   title: 'Цифровой рисунок' },
    { src: './projects/4.png',   title: 'Генеративный арт' },
    { src: './projects/5.png',   title: 'Персонаж' },
    { src: './projects/6.jfif',  title: 'Визуальная история' },
    { src: './projects/7.png',   title: 'Концепт-арт' },
  ],
  videos: [
    { src: './projects/8.mp4',  title: 'Видео-проект' },
    { src: './projects/9.mp4',  title: 'Анимация' },
    { src: './projects/10.mp4', title: 'Ролик' },
    { src: './projects/11.mp4', title: 'Короткометражка' },
  ],
  sites: [
    { src: './projects/12.html', title: 'Сайт-проект №1' },
    { src: './projects/13.html', title: 'Сайт-проект №2' },
    { src: './projects/14.html', title: 'Сайт-проект №3' },
    { src: './projects/15.html', title: 'Сайт-проект №4' },
    { src: './projects/16.html', title: 'Сайт-проект №5' },
  ],
  pdf: [
    { src: './projects/Iskusstvo-pravilnyh-poglazhivanij.pdf', title: 'Искусство правильных поглаживаний' },
  ],
}

const TABS: { key: Tab; label: string; Icon: React.ElementType }[] = [
  { key: 'images', label: 'Картинки',      Icon: Image },
  { key: 'videos', label: 'Видео',         Icon: Video },
  { key: 'sites',  label: 'Сайты',         Icon: Globe },
  { key: 'pdf',    label: 'Презентации',   Icon: FileText },
]

const TAB_COLORS: Record<Tab, { active: string; dot: string }> = {
  images: { active: 'border-violet-400 text-violet-300 bg-violet-500/10', dot: 'bg-violet-400' },
  videos: { active: 'border-orange-400 text-orange-300 bg-orange-500/10', dot: 'bg-orange-400' },
  sites:  { active: 'border-teal-400   text-teal-300   bg-teal-500/10',   dot: 'bg-teal-400' },
  pdf:    { active: 'border-pink-400   text-pink-300   bg-pink-500/10',   dot: 'bg-pink-400' },
}

/* ── Lightbox ── */
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.img
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        src={src}
        className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
      >
        <X size={20} />
      </button>
    </motion.div>
  )
}

/* ── Image grid ── */
function ImagesTab() {
  const [lightbox, setLightbox] = useState<string | null>(null)
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {DATA.images.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            whileHover={{ scale: 1.03, y: -3 }}
            className="relative group cursor-pointer rounded-xl overflow-hidden aspect-square border border-slate-700/50 shadow-lg"
            onClick={() => setLightbox(item.src)}
          >
            <img
              src={item.src}
              alt={item.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
              <span className="text-white text-xs font-semibold">{item.title}</span>
            </div>
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
    </>
  )
}

/* ── Video grid ── */
function VideosTab() {
  const [playing, setPlaying] = useState<number | null>(null)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {DATA.videos.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.08 }}
          className="relative rounded-xl overflow-hidden border border-slate-700/50 shadow-lg bg-slate-900"
        >
          {playing === i ? (
            <video
              src={item.src}
              controls
              autoPlay
              className="w-full aspect-video"
            />
          ) : (
            <div
              className="relative w-full aspect-video flex items-center justify-center cursor-pointer group"
              onClick={() => setPlaying(i)}
            >
              <video src={item.src} className="w-full h-full object-cover" muted preload="metadata" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300 flex flex-col items-center justify-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  className="w-16 h-16 rounded-full bg-orange-500/90 backdrop-blur flex items-center justify-center shadow-lg shadow-orange-500/30"
                >
                  <Play size={24} className="text-white ml-1" fill="white" />
                </motion.div>
                <span className="text-white text-sm font-semibold drop-shadow">{item.title}</span>
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

/* ── Sites grid ── */
function SitesTab() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {DATA.sites.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.08 }}
          className="rounded-xl overflow-hidden border border-slate-700/50 shadow-lg bg-slate-900 flex flex-col"
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 border-b border-slate-700/50 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            <span className="ml-2 text-[10px] text-slate-500 font-mono truncate flex-1">
              ученик-{i + 1}.html
            </span>
          </div>
          {/* Scaled iframe preview */}
          <div className="relative overflow-hidden" style={{ height: 160 }}>
            <iframe
              src={item.src}
              title={item.title}
              sandbox="allow-scripts allow-same-origin"
              style={{
                width: 960,
                height: 640,
                transform: 'scale(0.25)',
                transformOrigin: 'top left',
                pointerEvents: 'none',
                border: 'none',
              }}
            />
            {/* Overlay to block iframe interaction + gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/80" />
          </div>
          {/* Footer */}
          <div className="flex items-center justify-between px-3 py-2.5 border-t border-slate-700/50">
            <span className="text-slate-300 text-xs font-semibold">{item.title}</span>
            <a
              href={item.src}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-teal-400 hover:text-teal-300 text-xs font-bold transition-colors"
            >
              Открыть <ExternalLink size={12} />
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/* ── PDF tab ── */
function PdfTab() {
  return (
    <div className="space-y-4">
      {DATA.pdf.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-xl overflow-hidden border border-pink-500/20 shadow-lg bg-slate-900 flex flex-col"
        >
          {/* Embedded PDF */}
          <div className="relative w-full" style={{ height: 520 }}>
            <iframe
              src={item.src}
              title={item.title}
              className="w-full h-full"
              style={{ border: 'none' }}
            />
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50">
            <span className="text-slate-300 text-sm font-semibold">{item.title}</span>
            <a
              href={item.src}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 text-xs font-bold border border-pink-500/20 transition-colors"
            >
              Открыть <ExternalLink size={12} />
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/* ── Main section ── */
export default function Projects() {
  const [activeTab, setActiveTab] = useState<Tab>('images')
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="projects" className="py-20 sm:py-28 relative overflow-hidden bg-white">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 60% 0%, rgba(139,92,246,0.05) 0%, transparent 60%)' }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-3">
            Работы учеников
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base">
            Реальные проекты, созданные детьми на курсе с помощью ИИ
          </p>
          <div className="h-1 w-20 mx-auto mt-4 rounded-full bg-gradient-to-r from-violet-500 to-teal-400" />
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {TABS.map(({ key, label, Icon }) => {
            const isActive = activeTab === key
            const colors = TAB_COLORS[key]
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? colors.active + ' shadow-md'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 bg-white'
                }`}
              >
                {isActive && (
                  <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                )}
                <Icon size={15} />
                {label}
                <span className="text-xs opacity-60">
                  ({DATA[key].length})
                </span>
              </button>
            )
          })}
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'images' && <ImagesTab />}
            {activeTab === 'videos' && <VideosTab />}
            {activeTab === 'sites'  && <SitesTab />}
            {activeTab === 'pdf'    && <PdfTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
