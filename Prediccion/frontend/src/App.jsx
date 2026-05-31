import { useState, useRef, useCallback } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-4 border-violet-500/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-indigo-400 animate-spin [animation-duration:0.6s]" />
      </div>
      <p className="text-sm font-medium text-slate-400 tracking-widest uppercase">Procesando</p>
    </div>
  )
}

// ── Alert ─────────────────────────────────────────────────────────────────────
function Alert({ type = 'info', children, onClose }) {
  const s = {
    info:    'border-blue-500/40   bg-blue-500/10   text-blue-300',
    success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    warning: 'border-amber-500/40  bg-amber-500/10  text-amber-300',
    error:   'border-red-500/40    bg-red-500/10    text-red-300',
  }
  return (
    <div className={`relative rounded-xl border px-4 py-3 text-sm backdrop-blur-sm ${s[type]}`}>
      {children}
      {onClose && (
        <button onClick={onClose} className="absolute right-3 top-3 opacity-50 hover:opacity-100 transition">✕</button>
      )}
    </div>
  )
}

// ── Glass Card ────────────────────────────────────────────────────────────────
function Card({ children, className = '', glow = false }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl
      ${glow ? 'shadow-violet-500/10' : ''} ${className}`}>
      {children}
    </div>
  )
}

// ── Metric Card ───────────────────────────────────────────────────────────────
function Metric({ label, value, hint, gradient = 'from-violet-500 to-indigo-500' }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 relative overflow-hidden group hover:border-white/20 transition-all">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-600">{hint}</p>}
    </div>
  )
}

// ── Button ────────────────────────────────────────────────────────────────────
function Btn({ children, onClick, disabled, variant = 'primary', size = 'md', className = '' }) {
  const base = 'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed'
  const variants = {
    primary:   'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-indigo-500 hover:-translate-y-0.5',
    secondary: 'border border-white/20 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white backdrop-blur-sm',
    success:   'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5',
  }
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-8 py-4 text-base' }
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

// ── Step Bar ──────────────────────────────────────────────────────────────────
const STEP_LABELS = ['Datos', 'Limpiar', 'Modelo', 'Resultados']

function StepBar({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1
        const done   = n < current
        const active = n === current
        return (
          <div key={n} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-black transition-all
                ${done   ? 'border-violet-500 bg-violet-500 text-white shadow-lg shadow-violet-500/40'
                : active ? 'border-violet-500 bg-violet-500/20 text-violet-400 shadow-lg shadow-violet-500/20'
                :          'border-white/10 bg-white/5 text-slate-600'}`}>
                {done ? '✓' : n}
              </div>
              <span className={`text-xs font-semibold whitespace-nowrap transition-all
                ${active ? 'text-violet-400' : done ? 'text-slate-400' : 'text-slate-700'}`}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`mx-2 mb-5 h-px w-12 sm:w-20 transition-all ${done ? 'bg-violet-500' : 'bg-white/10'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Demo Cards ────────────────────────────────────────────────────────────────
const DEMOS = [
  {
    id: 'vivienda', icon: '🏠', title: 'Compra de Vivienda',
    desc: 'Predice el precio en millones COP según área, estrato, ciudad y características.',
    task: 'Regresión', rows: 300,
    gradient: 'from-blue-600/20 to-indigo-600/20',
    border: 'hover:border-blue-500/50',
    glow: 'hover:shadow-blue-500/10',
    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  {
    id: 'credito', icon: '💳', title: 'Aprobación de Crédito',
    desc: 'Clasifica si un crédito bancario colombiano será aprobado según el perfil.',
    task: 'Clasificación', rows: 300,
    gradient: 'from-violet-600/20 to-purple-600/20',
    border: 'hover:border-violet-500/50',
    glow: 'hover:shadow-violet-500/10',
    badge: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  },
  {
    id: 'churn', icon: '📉', title: 'Deserción de Clientes',
    desc: 'Predice qué clientes de un neobank colombiano dejarán de usar el servicio.',
    task: 'Clasificación', rows: 300,
    gradient: 'from-rose-600/20 to-pink-600/20',
    border: 'hover:border-rose-500/50',
    glow: 'hover:shadow-rose-500/10',
    badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  },
]

// ── Algorithm Catalog ─────────────────────────────────────────────────────────
const ALGORITHMS = {
  clasificacion: [
    { id: 'regresion_logistica', name: 'Regresión Logística',         desc: 'Rápido e interpretable, ideal como línea base' },
    { id: 'arbol_decision_cls',  name: 'Árbol de Decisión',           desc: 'Muy interpretable, no requiere normalización' },
    { id: 'random_forest_cls',   name: 'Random Forest',               desc: 'Alta precisión, robusto a outliers' },
    { id: 'svm',                 name: 'SVM',                         desc: 'Efectivo en espacios de alta dimensión' },
    { id: 'knn',                 name: 'KNN',                         desc: 'Simple, basado en similitud entre puntos' },
  ],
  regresion: [
    { id: 'regresion_lineal',    name: 'Regresión Lineal',            desc: 'Línea base interpretable y rápida' },
    { id: 'ridge',               name: 'Ridge (L2)',                  desc: 'Regularización, previene overfitting' },
    { id: 'lasso',               name: 'Lasso (L1)',                  desc: 'Regularización + selección automática' },
    { id: 'arbol_decision_reg',  name: 'Árbol de Decisión',           desc: 'Captura relaciones no lineales' },
    { id: 'random_forest_reg',   name: 'Random Forest',               desc: 'Mejor precisión general' },
    { id: 'svr',                 name: 'SVR',                         desc: 'Robusto con kernel RBF' },
  ],
}

// ── Data Table ────────────────────────────────────────────────────────────────
function DataTable({ columns, rows }) {
  if (!columns || !rows) return null
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            {columns.map(c => (
              <th key={c} className="px-4 py-2.5 text-left font-bold text-slate-500 whitespace-nowrap tracking-widest uppercase text-[10px]">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              {columns.map(c => (
                <td key={c} className="px-4 py-2 text-slate-300 whitespace-nowrap max-w-[160px] truncate font-mono text-[11px]">
                  {row[c] == null ? <span className="text-red-400/60 italic">null</span> : String(row[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep]             = useState(1)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [dataInfo, setDataInfo]     = useState(null)
  const [cleanOpts, setCleanOpts]   = useState({ eliminar_duplicados: false, estrategia_nulos: 'ninguna' })
  const [target, setTarget]         = useState('')
  const [taskType, setTaskType]     = useState('clasificacion')
  const [algorithm, setAlgorithm]   = useState('')
  const [testSize, setTestSize]     = useState(0.2)
  const [selFeatures, setSelFeatures] = useState([])
  const [trainResults, setTrainResults] = useState(null)
  const [activeTab, setActiveTab]   = useState('metricas')
  const [predVals, setPredVals]     = useState({})
  const [predResult, setPredResult] = useState(null)
  const [predLoading, setPredLoading] = useState(false)
  const fileRef = useRef()

  const handleError = (e) => { setError(e?.response?.data?.detail || e?.message || 'Error desconocido'); setLoading(false) }

  const applyDataInfo = useCallback((info) => {
    setDataInfo(info); setError(''); setSuccessMsg('')
    setTarget(''); setAlgorithm('')
    setSelFeatures(info.columnas || [])
    setTrainResults(null); setPredResult(null); setStep(2)
  }, [])

  const resetAll = () => {
    setStep(1); setDataInfo(null); setTrainResults(null)
    setTarget(''); setAlgorithm(''); setPredResult(null); setError(''); setSuccessMsg('')
  }

  const loadDemo = async (id) => {
    setLoading(true); setError('')
    try { const { data } = await axios.get(`${API}/demo/${id}`); applyDataInfo(data) }
    catch (e) { handleError(e) } finally { setLoading(false) }
  }

  const uploadFile = async (file) => {
    if (!file) return
    setLoading(true); setError('')
    const form = new FormData(); form.append('file', file)
    try { const { data } = await axios.post(`${API}/upload`, form); applyDataInfo(data) }
    catch (e) { handleError(e) } finally { setLoading(false) }
  }

  const cleanData = async () => {
    setLoading(true); setError('')
    try {
      const { data } = await axios.post(`${API}/clean`, cleanOpts)
      setDataInfo(prev => ({ ...prev, ...data, problemas: [] }))
      setSuccessMsg(`Limpieza: ${data.acciones?.join(' · ') || 'Sin cambios'}`)
    } catch (e) { handleError(e) } finally { setLoading(false) }
  }

  const trainModel = async () => {
    if (!target)    { setError('Selecciona la variable objetivo'); return }
    if (!algorithm) { setError('Selecciona un algoritmo'); return }
    setLoading(true); setError('')
    try {
      const { data } = await axios.post(`${API}/train`, {
        target, task_type: taskType, algorithm, test_size: testSize,
        features: selFeatures.filter(f => f !== target),
      })
      setTrainResults(data)
      const initVals = {}; data.features_usadas.forEach(f => { initVals[f] = '' })
      setPredVals(initVals); setPredResult(null); setActiveTab('metricas'); setStep(4)
    } catch (e) { handleError(e) } finally { setLoading(false) }
  }

  const predict = async () => {
    setPredLoading(true); setError('')
    try { const { data } = await axios.post(`${API}/predict`, { valores: predVals }); setPredResult(data) }
    catch (e) { setError(e?.response?.data?.detail || 'Error en predicción') }
    finally { setPredLoading(false) }
  }

  const hasNulls  = dataInfo && Object.values(dataInfo.nulos || {}).some(v => v > 0)
  const hasDups   = dataInfo?.problemas?.some(p => p.includes('duplicad'))
  const hasIssues = hasNulls || hasDups

  const handleTargetChange = (col) => {
    setTarget(col); setAlgorithm('')
    setSelFeatures((dataInfo?.columnas || []).filter(c => c !== col))
  }

  const METRIC_GRADIENTS = [
    'from-violet-500 to-indigo-500',
    'from-indigo-500 to-blue-500',
    'from-blue-500 to-cyan-500',
    'from-cyan-500 to-teal-500',
    'from-teal-500 to-emerald-500',
  ]

  return (
    <div className="min-h-screen bg-[#080B14] text-white">
      {/* Grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      {/* Ambient glow orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      {/* ── Header ── */}
      <header className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 font-black text-sm shadow-lg shadow-violet-500/30">
            ML
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight">
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">ML</span> Studio
            </h1>
            <p className="text-xs text-slate-600">Análisis predictivo · Datos Colombia (COP)</p>
          </div>
          {dataInfo && (
            <button onClick={resetAll} className="ml-auto text-xs text-slate-600 hover:text-red-400 transition underline">
              Reiniciar
            </button>
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-10">
        <StepBar current={step} />

        {error && <div className="mb-5"><Alert type="error" onClose={() => setError('')}>⚠ {error}</Alert></div>}
        {successMsg && !error && <div className="mb-5"><Alert type="success" onClose={() => setSuccessMsg('')}>✓ {successMsg}</Alert></div>}

        {loading && <Spinner />}

        {/* ═══ STEP 1 ═══ */}
        {!loading && step === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-black tracking-tight">
                Carga tu <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">dataset</span>
              </h2>
              <p className="mt-2 text-slate-500">Sube tu archivo o elige un ejemplo con datos reales de Colombia</p>
            </div>

            <Card>
              <div
                onDrop={e => { e.preventDefault(); uploadFile(e.dataTransfer.files[0]) }}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-white/10 bg-white/5 py-16 transition-all hover:border-violet-500/50 hover:bg-violet-500/5 group"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-3xl group-hover:scale-110 transition-transform">📁</div>
                <div className="text-center">
                  <p className="font-bold text-slate-300">Arrastra tu archivo aquí o haz clic para seleccionar</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Soporta <span className="text-violet-400 font-semibold">CSV</span> y <span className="text-violet-400 font-semibold">Excel (.xlsx, .xls)</span>
                  </p>
                </div>
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden"
                  onChange={e => uploadFile(e.target.files[0])} />
              </div>
            </Card>

            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-white/5" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-600">O elige un demo</p>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {DEMOS.map(d => (
                  <button key={d.id} onClick={() => loadDemo(d.id)}
                    className={`group rounded-2xl border border-white/10 bg-gradient-to-br ${d.gradient} p-5 text-left
                      transition-all hover:shadow-xl ${d.glow} ${d.border} hover:-translate-y-1 active:scale-95`}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-2xl mb-3 group-hover:scale-110 transition-transform">{d.icon}</div>
                    <p className="font-bold text-white text-sm">{d.title}</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{d.desc}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${d.badge}`}>{d.task}</span>
                      <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-xs font-semibold text-slate-400">{d.rows} filas</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ STEP 2 ═══ */}
        {!loading && step === 2 && dataInfo && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">
                  Explorar <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">& limpiar</span>
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">{dataInfo.filas} filas · {dataInfo.columnas?.length} columnas{dataInfo.nombre_archivo ? ` · ${dataInfo.nombre_archivo}` : ''}</p>
              </div>
              <Btn onClick={() => setStep(3)}>Continuar →</Btn>
            </div>

            {dataInfo.problemas?.length > 0 && (
              <Alert type="warning">
                <p className="font-bold mb-1">Problemas detectados</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs opacity-80">{dataInfo.problemas.map((p, i) => <li key={i}>{p}</li>)}</ul>
              </Alert>
            )}

            {hasIssues && (
              <Card className="p-5">
                <h3 className="font-bold text-slate-300 mb-4 flex items-center gap-2"><span className="text-lg">🧹</span> Opciones de limpieza</h3>
                <div className="space-y-4">
                  {hasDups && (
                    <label className="flex cursor-pointer items-center gap-3"
                      onClick={() => setCleanOpts(p => ({ ...p, eliminar_duplicados: !p.eliminar_duplicados }))}>
                      <div className={`h-5 w-5 rounded flex items-center justify-center border transition-all
                        ${cleanOpts.eliminar_duplicados ? 'border-violet-500 bg-violet-500' : 'border-white/20 bg-white/5'}`}>
                        {cleanOpts.eliminar_duplicados && <span className="text-[10px] text-white font-black">✓</span>}
                      </div>
                      <span className="text-sm text-slate-300 hover:text-white transition">Eliminar filas duplicadas</span>
                    </label>
                  )}
                  {hasNulls && (
                    <div>
                      <p className="text-sm font-semibold text-slate-500 mb-2">Manejo de valores nulos:</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { val: 'ninguna', label: 'Ignorar' }, { val: 'eliminar_filas', label: 'Eliminar filas' },
                          { val: 'media', label: 'Media' }, { val: 'mediana', label: 'Mediana' }, { val: 'moda', label: 'Moda' },
                        ].map(opt => (
                          <button key={opt.val} onClick={() => setCleanOpts(p => ({ ...p, estrategia_nulos: opt.val }))}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all
                              ${cleanOpts.estrategia_nulos === opt.val
                                ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                                : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white'}`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <Btn onClick={cleanData} variant="success" size="sm">Aplicar limpieza</Btn>
                </div>
              </Card>
            )}

            <Card className="p-5">
              <h3 className="font-bold text-slate-300 mb-4 flex items-center gap-2"><span>📋</span> Resumen de columnas</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-white/10">
                    {['Columna', 'Tipo', 'Nulos'].map(h => (
                      <th key={h} className="pb-2 pr-6 text-left text-[10px] font-bold uppercase tracking-widest text-slate-600">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {dataInfo.columnas?.map(col => {
                      const n = dataInfo.nulos?.[col] || 0
                      return (
                        <tr key={col} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-2 pr-6 font-mono text-xs text-violet-400 font-bold">{col}</td>
                          <td className="py-2 pr-6 text-xs text-slate-500">{dataInfo.tipos?.[col]}</td>
                          <td className="py-2">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold border
                              ${n > 0 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                              {n === 0 ? '✓ 0' : n}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-bold text-slate-300 mb-4 flex items-center gap-2"><span>👁</span> Vista previa</h3>
              <DataTable columns={dataInfo.columnas} rows={dataInfo.preview} />
            </Card>
          </div>
        )}

        {/* ═══ STEP 3 ═══ */}
        {!loading && step === 3 && dataInfo && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black">
                Configurar <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">modelo</span>
              </h2>
              <p className="text-sm text-slate-500 mt-1">Define la variable a predecir, el tipo de tarea y el algoritmo</p>
            </div>

            <div className="grid gap-5 lg:grid-cols-5">
              <div className="space-y-4 lg:col-span-3">
                <Card className="p-5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">🎯 Variable objetivo</label>
                  <select value={target} onChange={e => handleTargetChange(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20">
                    <option value="" className="bg-slate-900">— Selecciona una columna —</option>
                    {dataInfo.columnas?.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                  </select>
                  {target && <p className="mt-1.5 text-xs text-slate-600">Tipo: <span className="text-violet-400 font-semibold">{dataInfo.tipos?.[target]}</span></p>}
                </Card>

                <Card className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">⚙ Tipo de tarea</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { val: 'clasificacion', label: '🏷 Clasificación', desc: 'Variable categórica o binaria' },
                      { val: 'regresion',     label: '📈 Regresión',     desc: 'Variable numérica continua' },
                    ].map(t => (
                      <button key={t.val} onClick={() => { setTaskType(t.val); setAlgorithm('') }}
                        className={`rounded-xl border p-3 text-left transition-all
                          ${taskType === t.val
                            ? 'border-violet-500/60 bg-violet-500/15 shadow-lg shadow-violet-500/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                        <p className="text-sm font-bold text-white">{t.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </Card>

                <Card className="p-5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">✂ División entrenamiento / prueba</label>
                  <input type="range" min="0.10" max="0.40" step="0.05" value={testSize}
                    onChange={e => setTestSize(parseFloat(e.target.value))}
                    className="w-full accent-violet-500 cursor-pointer" />
                  <div className="mt-2 flex justify-between text-xs font-bold">
                    <span className="text-violet-400">Entrenamiento: {Math.round((1 - testSize) * 100)}%</span>
                    <span className="text-indigo-400">Prueba: {Math.round(testSize * 100)}%</span>
                  </div>
                </Card>

                {target && (
                  <Card className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">📋 Variables predictoras</p>
                      <div className="flex gap-2">
                        <button onClick={() => setSelFeatures(dataInfo.columnas.filter(c => c !== target))}
                          className="text-xs text-violet-400 hover:text-violet-300 transition">Todas</button>
                        <span className="text-slate-700">·</span>
                        <button onClick={() => setSelFeatures([])}
                          className="text-xs text-slate-500 hover:text-white transition">Ninguna</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1 max-h-44 overflow-y-auto pr-1">
                      {dataInfo.columnas?.filter(c => c !== target).map(col => (
                        <label key={col} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors"
                          onClick={() => setSelFeatures(p => p.includes(col) ? p.filter(f => f !== col) : [...p, col])}>
                          <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center transition-all shrink-0
                            ${selFeatures.includes(col) ? 'border-violet-500 bg-violet-500' : 'border-white/20 bg-white/5'}`}>
                            {selFeatures.includes(col) && <span className="text-[8px] text-white font-black">✓</span>}
                          </div>
                          <span className="text-xs font-mono text-slate-400 truncate">{col}</span>
                        </label>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              <div className="lg:col-span-2">
                <Card className="p-5 h-full">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">🤖 Algoritmo</p>
                  <div className="space-y-2">
                    {ALGORITHMS[taskType].map(alg => (
                      <button key={alg.id} onClick={() => setAlgorithm(alg.id)}
                        className={`w-full rounded-xl border px-3 py-2.5 text-left transition-all
                          ${algorithm === alg.id
                            ? 'border-violet-500/60 bg-violet-500/15 shadow-lg shadow-violet-500/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'}`}>
                        <p className="text-sm font-bold text-white leading-tight">{alg.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{alg.desc}</p>
                      </button>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <Btn onClick={trainModel} disabled={!target || !algorithm} size="lg">🚀 Entrenar modelo</Btn>
            </div>
          </div>
        )}

        {/* ═══ STEP 4 ═══ */}
        {!loading && step === 4 && trainResults && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">
                  Resultados <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">del modelo</span>
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {trainResults.filas_entrenamiento} train · {trainResults.filas_prueba} test ·{' '}
                  <span className="text-violet-400 font-semibold">
                    {ALGORITHMS[trainResults.task_type]?.find(a => a.id === trainResults.algoritmo)?.name || trainResults.algoritmo}
                  </span>
                </p>
              </div>
              <Btn variant="secondary" size="sm" onClick={() => { setStep(3); setTrainResults(null) }}>← Cambiar</Btn>
            </div>

            <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1 w-fit backdrop-blur-sm">
              {[{ id: 'metricas', label: '📊 Métricas' }, { id: 'prediccion', label: '🔮 Predicción' }].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`rounded-lg px-5 py-2 text-sm font-bold transition-all
                    ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20'
                      : 'text-slate-500 hover:text-white'}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'metricas' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {trainResults.task_type === 'clasificacion' ? <>
                    {trainResults.metricas.accuracy  !== undefined && <Metric label="Accuracy"  value={`${(trainResults.metricas.accuracy  * 100).toFixed(1)}%`} gradient={METRIC_GRADIENTS[0]} hint="Predicciones correctas" />}
                    {trainResults.metricas.precision !== undefined && <Metric label="Precision" value={`${(trainResults.metricas.precision * 100).toFixed(1)}%`} gradient={METRIC_GRADIENTS[1]} hint="Precisión ponderada" />}
                    {trainResults.metricas.recall    !== undefined && <Metric label="Recall"    value={`${(trainResults.metricas.recall    * 100).toFixed(1)}%`} gradient={METRIC_GRADIENTS[2]} hint="Sensibilidad" />}
                    {trainResults.metricas.f1_score  !== undefined && <Metric label="F1-Score"  value={`${(trainResults.metricas.f1_score  * 100).toFixed(1)}%`} gradient={METRIC_GRADIENTS[3]} hint="Balance prec/recall" />}
                    {trainResults.metricas.roc_auc   !== undefined && <Metric label="ROC-AUC"   value={trainResults.metricas.roc_auc.toFixed(3)}               gradient={METRIC_GRADIENTS[4]} hint="Discriminación" />}
                  </> : <>
                    {trainResults.metricas.r2   !== undefined && <Metric label="R² Score" value={trainResults.metricas.r2.toFixed(3)}         gradient={METRIC_GRADIENTS[0]} hint="Varianza explicada" />}
                    {trainResults.metricas.mae  !== undefined && <Metric label="MAE"       value={trainResults.metricas.mae.toFixed(2)}        gradient={METRIC_GRADIENTS[1]} hint="Error absoluto medio" />}
                    {trainResults.metricas.rmse !== undefined && <Metric label="RMSE"      value={trainResults.metricas.rmse.toFixed(2)}       gradient={METRIC_GRADIENTS[2]} hint="Raíz error cuadrático" />}
                    {trainResults.metricas.mse  !== undefined && <Metric label="MSE"       value={trainResults.metricas.mse.toFixed(2)}        gradient={METRIC_GRADIENTS[3]} hint="Error cuadrático medio" />}
                    {trainResults.metricas.mape !== undefined && <Metric label="MAPE"      value={`${trainResults.metricas.mape.toFixed(1)}%`} gradient={METRIC_GRADIENTS[4]} hint="Error porcentual" />}
                  </>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {trainResults.charts.confusion_matrix && (
                    <Card className="p-4"><img src={`data:image/png;base64,${trainResults.charts.confusion_matrix}`} alt="Matriz de Confusión" className="w-full rounded-lg" /></Card>
                  )}
                  {trainResults.charts.scatter && (
                    <Card className="p-4"><img src={`data:image/png;base64,${trainResults.charts.scatter}`} alt="Real vs Predicho" className="w-full rounded-lg" /></Card>
                  )}
                  {trainResults.charts.feature_importance && (
                    <Card className="p-4 sm:col-span-2">
                      <img src={`data:image/png;base64,${trainResults.charts.feature_importance}`} alt="Importancia de Variables" className="mx-auto w-full max-w-2xl rounded-lg" />
                    </Card>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'prediccion' && (
              <div className="grid gap-5 lg:grid-cols-2">
                <Card className="p-5">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Valores para predecir</h3>
                  <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                    {trainResults.features_usadas?.map(col => {
                      const isCat = trainResults.columnas_categoricas?.includes(col)
                      const opts  = trainResults.opciones_categoricas?.[col]
                      return (
                        <div key={col}>
                          <label className="mb-1 flex items-center gap-2 text-xs font-bold text-slate-500 font-mono">
                            {col}
                            {isCat && <span className="rounded-full bg-violet-500/20 border border-violet-500/30 px-1.5 py-0.5 text-[10px] text-violet-400">categórica</span>}
                          </label>
                          {isCat && opts ? (
                            <select value={predVals[col] || ''} onChange={e => setPredVals(p => ({ ...p, [col]: e.target.value }))}
                              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20">
                              <option value="" className="bg-slate-900">— Selecciona —</option>
                              {opts.map(o => <option key={o} value={o} className="bg-slate-900">{o}</option>)}
                            </select>
                          ) : (
                            <input type="number" value={predVals[col] || ''} onChange={e => setPredVals(p => ({ ...p, [col]: e.target.value }))}
                              placeholder="Valor numérico"
                              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-700 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <Btn onClick={predict} disabled={predLoading} className="mt-5 w-full" size="md">
                    {predLoading ? 'Calculando…' : '🔮 Predecir'}
                  </Btn>
                </Card>

                {predResult ? (
                  <Card className="p-6 border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex flex-col justify-center" glow>
                    <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-6">Resultado</p>
                    {predResult.task_type === 'clasificacion' ? (
                      <>
                        <div className="text-center">
                          <div className="text-6xl mb-3">{predResult.clase === 1 ? '✅' : '❌'}</div>
                          <p className="text-2xl font-black text-white">{predResult.etiqueta}</p>
                          <p className="text-sm text-slate-500 mt-1">Clase: <span className="font-bold text-violet-400">{predResult.clase}</span></p>
                        </div>
                        {predResult.probabilidades && (
                          <div className="mt-6 space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 text-center mb-3">Probabilidades</p>
                            {predResult.probabilidades.map(({ clase, prob }) => (
                              <div key={clase} className="flex items-center gap-3">
                                <span className="w-14 text-right text-xs text-slate-500 shrink-0">Clase {clase}</span>
                                <div className="flex-1 rounded-full bg-white/10 h-2 overflow-hidden">
                                  <div className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all" style={{ width: `${prob * 100}%` }} />
                                </div>
                                <span className="w-10 text-right text-xs font-black text-white">{(prob * 100).toFixed(1)}%</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <div className="text-5xl mb-4">📌</div>
                        <p className="text-4xl font-black bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                          {Number(predResult.prediccion).toLocaleString('es-CO', { maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-slate-500 mt-2">Valor predicho</p>
                      </div>
                    )}
                  </Card>
                ) : (
                  <Card className="flex items-center justify-center border-dashed p-10">
                    <div className="text-center text-slate-700">
                      <div className="text-4xl mb-2 opacity-30">🔮</div>
                      <p className="text-sm font-medium">Completa el formulario y haz clic en Predecir</p>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="relative z-10 mt-16 border-t border-white/5 py-4 text-center text-xs text-slate-700">
        ML Studio · Proyecto - Talento Tech - UniSabaneta · scikit-learn + FastAPI + React
      </footer>
    </div>
  )
}
