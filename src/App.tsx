import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Header } from './components/Header'

import Home from './pages/Home'

const Account = lazy(() => import('./pages/Account'))
const Direction = lazy(() => import('./pages/Direction'))
const Directions = lazy(() => import('./pages/Directions'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Prices = lazy(() => import('./pages/Prices'))
const Schedule = lazy(() => import('./pages/Schedule'))
const Trainer = lazy(() => import('./pages/Trainer'))
const Trainers = lazy(() => import('./pages/Trainers'))

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
        <Suspense fallback={<p className="container" role="status" style={{ minHeight: '50vh', paddingBlock: 32 }}>Загрузка…</p>}>
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
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
