import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3668',
})

export interface FipeMarca  { codigo: string; nome: string }
export interface FipeModelo { codigo: number; nome: string }
export interface FipeAno    { codigo: string; nome: string }
export interface FipePreco  {
  Valor: string
  Marca: string
  Modelo: string
  AnoModelo: number
  Combustivel: string
  CodigoFipe: string
  MesReferencia: string
  TipoVeiculo: number
  SiglaCombustivel: string
}

export const fipeService = {
  getMarcas: (tipo: string) =>
    api.get<{ data: FipeMarca[] }>(`/fipe/${tipo}/marcas`).then(r => r.data.data),

  getModelos: (tipo: string, codMarca: string) =>
    api.get<{ data: { modelos: FipeModelo[] } }>(`/fipe/${tipo}/marcas/${codMarca}/modelos`)
      .then(r => r.data.data.modelos),

  getAnos: (tipo: string, codMarca: string, codModelo: string) =>
    api.get<{ data: FipeAno[] }>(`/fipe/${tipo}/marcas/${codMarca}/modelos/${codModelo}/anos`)
      .then(r => r.data.data),

  getPreco: (tipo: string, codMarca: string, codModelo: string, codAno: string) =>
    api.get<{ data: FipePreco }>(`/fipe/${tipo}/marcas/${codMarca}/modelos/${codModelo}/anos/${codAno}/preco`)
      .then(r => r.data.data),
}
