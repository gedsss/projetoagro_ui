import type { ReactNode } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { Footer } from './components/layout/Footer'
import { Navbar } from './components/layout/Navbar'
import Cadastro from './pages/Auth/Cadastro'
import Login from './pages/Auth/Login'
import CriarAnuncio from './pages/CriarAnuncio'
import Home from './pages/Home'
import ListingDetail from './pages/ListingDetail'
import Listings from './pages/Listings'
import Perfil from './pages/Perfil'
import SellerProfile from './pages/SellerProfile'

function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/anuncios" element={<Layout><Listings /></Layout>} />
        <Route path="/anuncios/:id" element={<Layout><ListingDetail /></Layout>} />
        <Route path="/criar-anuncio" element={<Layout><CriarAnuncio /></Layout>} />
        <Route path="/perfil" element={<Layout><Perfil /></Layout>} />
        <Route path="/vendedor/:id" element={<Layout><SellerProfile /></Layout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  )
}
