import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Car, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { authService } from '../../services/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authService.login(email, password)
      localStorage.setItem('token', res.data.token)
      setSuccess(true)
      setTimeout(() => navigate('/'), 1500)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'E-mail ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-white/60 hover:text-[#e8e8f4] transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#00e5cc] to-[#7b5cf0] flex items-center justify-center">
              <Car size={18} className="text-[#07080e]" />
            </div>
            <span className="font-bold text-xl text-white">
              Auto<span className="text-[#00e5cc]">Fácil</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-[#e8e8f4]">Entrar na conta</h1>
          <p className="text-white/60 text-sm mt-1">Acesse sua conta para gerenciar seus anúncios</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-white/60 mb-1.5">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="seu@email.com"
              className="w-full bg-[#0c0e1a] border border-[#1e2040] rounded-xl px-4 py-3 text-sm text-[#e8e8f4] placeholder-white/30 focus:border-[#00e5cc55] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-white/60 mb-1.5">Senha</label>
            <div className="relative">
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-[#0c0e1a] border border-[#1e2040] rounded-xl px-4 py-3 pr-10 text-sm text-[#e8e8f4] placeholder-white/30 focus:border-[#00e5cc55] focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-[#e8e8f4] transition-colors"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {success && (
            <div className="flex items-center gap-2 text-sm text-[#00e5cc] bg-[#00e5cc10] border border-[#00e5cc30] rounded-lg px-3 py-2">
              <CheckCircle size={15} />
              Login realizado com sucesso! Redirecionando...
            </div>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 bg-[#00e5cc] text-[#07080e] font-semibold rounded-xl hover:bg-[#00c8b4] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-sm text-white/60 mt-6">
          Ainda não tem conta?{' '}
          <Link to="/cadastro" className="text-[#00e5cc] hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}
