import { Car, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-[#1e2040] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00e5cc] to-[#7b5cf0] flex items-center justify-center">
                <Car size={14} className="text-[#07080e]" />
              </div>
              <span className="font-bold text-white">
                Auto<span className="text-[#00e5cc]">Fácil</span>
              </span>
            </Link>
            <p className="text-white/60 text-sm max-w-xs">
              O marketplace de veículos que conecta compradores e vendedores de forma simples e segura.
            </p>
          </div>

          <div className="flex gap-12">
            <div>
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Navegação</p>
              <ul className="space-y-2">
                {[['/', 'Início'], ['/anuncios', 'Anúncios'], ['/login', 'Entrar']].map(([to, label]) => (
                  <li key={to}>
                    <Link to={to} className="text-sm text-white/60 hover:text-[#00e5cc] transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Categorias</p>
              <ul className="space-y-2">
                {['Sedans', 'SUVs', 'Motos', 'Pickups'].map(cat => (
                  <li key={cat}>
                    <Link
                      to={`/anuncios?category=${cat.toLowerCase()}`}
                      className="text-sm text-white/60 hover:text-[#00e5cc] transition-colors"
                    >
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-8 border-t border-[#1e2040]">
          <p className="text-xs text-white/60">© 2026 AutoFácil. Projeto acadêmico.</p>
          <a
            href="https://github.com/LuisHenriqueFurlan/Projeto_Agro"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors"
          >
            <ExternalLink size={14} />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
