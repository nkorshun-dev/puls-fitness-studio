import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import Account from './pages/Account'
import Direction from './pages/Direction'
import Directions from './pages/Directions'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Prices from './pages/Prices'
import Schedule from './pages/Schedule'
import Trainer from './pages/Trainer'
import Trainers from './pages/Trainers'

/** При смене страницы — наверх, при ссылке с #якорем — к якорю. Параметры фильтров прокрутку не сбрасывают. */
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <>
      <a href="#main" className="skip-link">К содержимому</a>
      <ScrollToTop />
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/directions" element={<Directions />} />
          <Route path="/directions/:slug" element={<Direction />} />
          <Route path="/trainers" element={<Trainers />} />
          <Route path="/trainers/:slug" element={<Trainer />} />
          <Route path="/prices" element={<Prices />} />
          <Route path="/account" element={<Account />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
