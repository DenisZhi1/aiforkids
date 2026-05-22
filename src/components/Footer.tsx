import { FOOTER, VK_LINK } from '../content'
import logoSrc from '../assets/logo.png'

export default function Footer() {
  return (
    <footer className="py-10 border-t border-slate-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={logoSrc} alt="DEAL for Kids" className="h-8 w-auto opacity-80" />
          <span className="text-slate-500 text-sm">{FOOTER.copy}</span>
        </div>
        <a
          href={VK_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium transition-colors"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.523-2.049-1.713-1.033-1.004-1.49-1.137-1.744-1.137-.356 0-.458.102-.458.593v1.566c0 .424-.135.678-1.252.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.372 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.253-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.762-.491h1.744c.525 0 .643.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.202 1.253.745.847 1.32 1.558 1.473 2.049.17.474-.085.729-.576.729z"/>
          </svg>
          {FOOTER.vkLabel}
        </a>
      </div>
    </footer>
  )
}
