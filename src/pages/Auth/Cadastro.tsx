import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Car, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { authService } from '../../services/api'

function maskCPF(v: string) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function maskPhone(v: string) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
}

export default function Cadastro() {
  const [form, setForm] = useState({ name: '', email: '', password: '', cpf: '', phone: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function set(field: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.register({
        name: form.name,
        email: form.email,
        password: form.password,
        cpf: form.cpf.replace(/\D/g, ''),
        phone: form.phone.replace(/\D/g, ''),
      })
      navigate('/login')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-[#0c0e1a] border border-[#1e2040] rounded-xl px-4 py-3 text-sm text-[#e8e8f4] placeholder-[#5a5a7a] focus:border-[#00e5cc55] focus:outline-none transition-colors"

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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00e5cc] to-[#7b5cf0] flex items-center justify-center">
              <Car size={18} className="text-[#07080e]" />
            </div>
            <span className="font-bold text-xl text-white">
              Auto<span className="text-[#00e5cc]">Fácil</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-[#e8e8f4]">Criar conta</h1>
          <p className="text-white/60 text-sm mt-1">Crie sua conta e comece a anunciar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cad-name" className="block text-xs font-medium text-white/60 mb-1.5">Nome completo</label>
            <input
              id="cad-name"
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
              placeholder="João Silva"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="cad-email" className="block text-xs font-medium text-white/60 mb-1.5">E-mail</label>
            <input
              id="cad-email"
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              required
              autoComplete="email"
              placeholder="seu@email.com"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="cad-cpf" className="block text-xs font-medium text-white/60 mb-1.5">CPF</label>
            <input
              id="cad-cpf"
              type="text"
              value={form.cpf}
              onChange={e => set('cpf', maskCPF(e.target.value))}
              required
              placeholder="000.000.000-00"
              inputMode="numeric"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="cad-phone" className="block text-xs font-medium text-white/60 mb-1.5">Celular</label>
            <input
              id="cad-phone"
              type="text"
              value={form.phone}
              onChange={e => set('phone', maskPhone(e.target.value))}
              required
              placeholder="(11) 99999-9999"
              inputMode="numeric"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="cad-password" className="block text-xs font-medium text-white/60 mb-1.5">Senha</label>
            <div className="relative">
              <input
                id="cad-password"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                className={`${inputClass} pr-10`}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#00e5cc] text-[#07080e] font-semibold rounded-xl hover:bg-[#00c8b4] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-sm text-white/60 mt-6">
          Já tem conta?{' '}
          <Link to="/login" className="text-[#00e5cc] hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
