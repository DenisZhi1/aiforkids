import Header from './components/Header'
import Hero from './components/Hero'
import WhyAI from './components/WhyAI'
import Audience from './components/Audience'
import Program from './components/Program'
import Skills from './components/Skills'
import Reviews from './components/Reviews'
import Schedule from './components/Schedule'
import About from './components/About'
import Projects from './components/Projects'
import Pricing from './components/Pricing'
import Included from './components/Included'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <WhyAI />
        <Audience />
        <Program />
        <Skills />
        <Reviews />
        <Schedule />
        <About />
        <Projects />
        <Pricing />
        <Included />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
