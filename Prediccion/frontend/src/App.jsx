import { useState, useRef, useCallback } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ── Tiny UI primitives ────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="h-12 w-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
      <p className="text-sm text-slate-500 font-medium">Procesando…</p>
    </div>
  )
}

function Alert({ type = 'info', children, onClose }) {
  const s = {
    info:    'bg-blue-50   border-blue-300   text-blue-800',
    success: 'bg-emerald-50 border-emerald-300 text-emerald-800',
    warning: 'bg-amber-50  border-amber-300  text-amber-800',
    error:   'bg-red-50    border-red-300    text-red-800',
  }
  return (
    <div className={`relative rounded-xl border px-4 py-3 text-sm ${s[type]}`}>
      {children}
      {onClose && (
        <button onClick={onClose} className="absolute right-3 top-2.5 opacity-50 hover:opacity-100">✕</button>
      )}
    </div>
  )
}

function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

function Metric({ label, value, hint, color = 'indigo' }) {
  const palette = {
    indigo:  'bg-indigo-50  border-indigo-200  text-indigo-700',
    violet:  'bg-violet-50  border-violet-200  text-violet-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    sky:     'bg-sky-50     border-sky-200     text-sky-700',
    amber:   'bg-amber-50   border-amber-200   text-amber-700',
    rose:    'bg-rose-50    border-rose-200    text-rose-700',
  }
  return (
    <div className={`rounded-xl border px-4 py-3 ${palette[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-widest opacity-60">{label}</p>
      <p className="mt-1 text-2xl font-extrabold leading-none">{value}</p>
      {hint && <p className="mt-1 text-xs opacity-50">{hint}</p>}
    </div>
  )
}

function Btn({ children, onClick, disabled, variant = 'primary', size = 'md', className = '' }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed'
  const variants = {
    primary:   'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow hover:from-indigo-700 hover:to-violet-700 focus:ring-indigo-400',
    secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-300',
    success:   'bg-emerald-600 text-white shadow hover:bg-emerald-700 focus:ring-emerald-400',
    danger:    'bg-red-600 text-white shadow hover:bg-red-700 focus:ring-red-400',
  }
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3.5 text-base' }
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

// ── Step indicator ────────────────────────────────────────────────────────────

const STEP_LABELS = ['Cargar datos', 'Explorar y limpiar', 'Configurar modelo', 'Resultados']

function StepBar({ current }) {
  return (
    <nav className="mb-8 flex items-center overflow-x-auto pb-1">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1
        const done   = n < current
        const active = n === current
        return (
          <div key={n} className="flex shrink-0 items-center">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-all
              ${done   ? 'border-indigo-600 bg-indigo-600 text-white'
              : active ? 'border-indigo-600 bg-white text-indigo-600'
              :          'border-slate-300  bg-white text-slate-400'}`}>
              {done ? '✓' : n}
            </div>
            <span className={`ml-2 whitespace-nowrap text-sm font-medium
              ${active ? 'text-indigo-700' : done ? 'text-slate-600' : 'text-slate-400'}`}>
              {label}
            </span>
            {i < STEP_LABELS.length - 1 && (
              <div className={`mx-3 h-0.5 w-10 sm:w-16 shrink-0 ${done ? 'bg-indigo-500' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </nav>
  )
}

// ── Demo cards ────────────────────────────────────────────────────────────────

const DEMOS = [
  {
    id: 'vivienda', icon: '🏠', title: 'Compra de Vivienda',
    desc: 'Predice el precio de inmuebles en Colombia según área, estrato, ciudad y características.',
    task: 'Regresión', rows: 300,
    gradient: 'from-blue-50 to-indigo-50', border: 'border-indigo-200',
  },
  {
    id: 'credito', icon: '💳', title: 'Aprobación de Crédito',
    desc: 'Clasifica si un crédito bancario colombiano será aprobado según el perfil del solicitante.',
    task: 'Clasificación', rows: 300,
    gradient: 'from-violet-50 to-purple-50', border: 'border-violet-200',
  },
  {
    id: 'churn', icon: '📉', title: 'Deserción de Clientes',
    desc: 'Predice qué clientes de un neobank colombiano dejarán de usar el servicio.',
    task: 'Clasificación', rows: 300,
    gradient: 'from-rose-50 to-pink-50', border: 'border-rose-200',
  },
]

// ── Algorithm catalog ─────────────────────────────────────────────────────────

const ALGORITHMS = {
  clasificacion: [
    { id: 'regresion_logistica', name: 'Regresión Logística',           desc: 'Rápido, interpretable, ideal como línea base' },
    { id: 'arbol_decision_cls',  name: 'Árbol de Decisión',             desc: 'Muy interpretable, no requiere normalización' },
    { id: 'random_forest_cls',   name: 'Random Forest',                 desc: 'Alta precisión, robusto a outliers' },
    { id: 'svm',                 name: 'SVM (Máq. Soporte Vectorial)',  desc: 'Efectivo en espacios de alta dimensión' },
    { id: 'knn',                 name: 'KNN (K-Vecinos Cercanos)',      desc: 'Simple, basado en similitud' },
  ],
  regresion: [
    { id: 'regresion_lineal',    name: 'Regresión Lineal',              desc: 'Línea base interpretable y rápida' },
    { id: 'ridge',               name: 'Ridge (Regularización L2)',     desc: 'Previene overfitting con muchas variables' },
    { id: 'lasso',               name: 'Lasso (Regularización L1)',     desc: 'Regularización + selección automática' },
    { id: 'arbol_decision_reg',  name: 'Árbol de Decisión',             desc: 'Captura relaciones no lineales' },
    { id: 'random_forest_reg',   name: 'Random Forest',                 desc: 'Mejor precisión general' },
    { id: 'svr',                 name: 'SVR (Support Vector Reg.)',     desc: 'Robusto con kernel RBF' },
  ],
}

// ── Data table ────────────────────────────────────────────────────────────────

function DataTable({ columns, rows }) {
  if (!columns || !rows) return null
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100">
      <table className="w-full text-xs">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            {columns.map(c => (
              <th key={c} className="px-3 py-2 text-left font-semibold text-slate-600 whitespace-nowrap">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
              {columns.map(c => (
                <td key={c} className="px-3 py-1.5 text-slate-600 whitespace-nowrap max-w-[160px] truncate">
                  {row[c] == null ? <span className="text-red-400 italic">null</span> : String(row[c])}
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
  const [step, setStep]               = useState(1)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [successMsg, setSuccessMsg]   = useState('')

  // Data state
  const [dataInfo, setDataInfo]         = useState(null)
  const [cleanOpts, setCleanOpts]       = useState({ eliminar_duplicados: false, estrategia_nulos: 'ninguna' })

  // Model config state
  const [target, setTarget]             = useState('')
  const [taskType, setTaskType]         = useState('clasificacion')
  const [algorithm, setAlgorithm]       = useState('')
  const [testSize, setTestSize]         = useState(0.2)
  const [selFeatures, setSelFeatures]   = useState([])

  // Results state
  const [trainResults, setTrainResults] = useState(null)
  const [activeTab, setActiveTab]       = useState('metricas')

  // Prediction state
  const [predVals, setPredVals]         = useState({})
  const [predResult, setPredResult]     = useState(null)
  const [predLoading, setPredLoading]   = useState(false)

  const fileRef = useRef()

  // ── Helpers ──────────────────────────────────────────────────────────────

  const handleError = (e) => {
    const msg = e?.response?.data?.detail || e?.message || 'Error desconocido'
    setError(msg)
    setLoading(false)
  }

  const applyDataInfo = useCallback((info) => {
    setDataInfo(info)
    setError('')
    setSuccessMsg('')
    setTarget('')
    setAlgorithm('')
    setSelFeatures(info.columnas || [])
    setTrainResults(null)
    setPredResult(null)
    setStep(2)
  }, [])

  const resetAll = () => {
    setStep(1); setDataInfo(null); setTrainResults(null)
    setTarget(''); setAlgorithm(''); setPredResult(null)
    setError(''); setSuccessMsg('')
  }

  // ── API calls ─────────────────────────────────────────────────────────────

  const loadDemo = async (id) => {
    setLoading(true); setError('')
    try {
      const { data } = await axios.get(`${API}/demo/${id}`)
      applyDataInfo(data)
    } catch (e) { handleError(e) }
    finally { setLoading(false) }
  }

  const uploadFile = async (file) => {
    if (!file) return
    setLoading(true); setError('')
    const form = new FormData()
    form.append('file', file)
    try {
      const { data } = await axios.post(`${API}/upload`, form)
      applyDataInfo(data)
      if (data.problemas?.length) setError(data.problemas.join(' · '))
    } catch (e) { handleError(e) }
    finally { setLoading(false) }
  }

  const cleanData = async () => {
    setLoading(true); setError('')
    try {
      const { data } = await axios.post(`${API}/clean`, cleanOpts)
      setDataInfo(prev => ({ ...prev, ...data, problemas: [] }))
      setSuccessMsg(`Limpieza aplicada: ${data.acciones?.join(' · ') || 'Sin cambios'}`)
    } catch (e) { handleError(e) }
    finally { setLoading(false) }
  }

  const trainModel = async () => {
    if (!target) { setError('Selecciona la variable objetivo'); return }
    if (!algorithm) { setError('Selecciona un algoritmo'); return }
    setLoading(true); setError('')
    try {
      const { data } = await axios.post(`${API}/train`, {
        target,
        task_type: taskType,
        algorithm,
        test_size: testSize,
        features: selFeatures.filter(f => f !== target),
      })
      setTrainResults(data)
      const initVals = {}
      data.features_usadas.forEach(f => { initVals[f] = '' })
      setPredVals(initVals)
      setPredResult(null)
      setActiveTab('metricas')
      setStep(4)
    } catch (e) { handleError(e) }
    finally { setLoading(false) }
  }

  const predict = async () => {
    setPredLoading(true); setError('')
    try {
      const { data } = await axios.post(`${API}/predict`, { valores: predVals })
      setPredResult(data)
    } catch (e) { setError(e?.response?.data?.detail || 'Error en predicción') }
    finally { setPredLoading(false) }
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const hasNulls = dataInfo && Object.values(dataInfo.nulos || {}).some(v => v > 0)
  const hasDups  = dataInfo?.problemas?.some(p => p.includes('duplicad'))
  const hasIssues = hasNulls || hasDups

  const handleTargetChange = (col) => {
    setTarget(col)
    setAlgorithm('')
    setSelFeatures((dataInfo?.columnas || []).filter(c => c !== col))
  }

  const toggleFeature = (col, checked) =>
    setSelFeatures(p => checked ? [...p, col] : p.filter(f => f !== col))

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-black text-sm shadow-md">
            ML
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-extrabold text-slate-800 leading-none">ML Studio</h1>
            <p className="text-xs text-slate-500 truncate">Análisis predictivo · Datos Colombia (COP)</p>
          </div>
          {dataInfo && (
            <button onClick={resetAll} className="ml-auto shrink-0 text-xs text-slate-400 hover:text-red-500 transition underline">
              Reiniciar
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <StepBar current={step} />

        {/* Global messages */}
        {error && (
          <div className="mb-4">
            <Alert type="error" onClose={() => setError('')}>⚠ {error}</Alert>
          </div>
        )}
        {successMsg && !error && (
          <div className="mb-4">
            <Alert type="success" onClose={() => setSuccessMsg('')}>✓ {successMsg}</Alert>
          </div>
        )}

        {loading && <Spinner />}

        {/* ═══════════════════════════════════ STEP 1 ═══ */}
        {!loading && step === 1 && (
          <div className="space-y-7">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Cargar dataset</h2>
              <p className="text-sm text-slate-500 mt-1">Sube tu propio archivo o elige un dataset de ejemplo</p>
            </div>

            {/* Upload zone */}
            <Card>
              <div
                onDrop={e => { e.preventDefault(); uploadFile(e.dataTransfer.files[0]) }}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 py-14 transition hover:border-indigo-500 hover:bg-indigo-50"
              >
                <span className="text-5xl">📁</span>
                <div className="text-center">
                  <p className="font-semibold text-slate-700">Arrastra tu archivo aquí o haz clic para seleccionar</p>
                  <p className="text-sm text-slate-400 mt-1">Soporta <strong>CSV</strong> y <strong>Excel (.xlsx, .xls)</strong></p>
                </div>
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden"
                  onChange={e => uploadFile(e.target.files[0])} />
              </div>
            </Card>

            {/* Demo cards */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">— O elige un demo precargado —</p>
              <div className="grid gap-4 sm:grid-cols-3">
                {DEMOS.map(d => (
                  <button key={d.id} onClick={() => loadDemo(d.id)}
                    className={`rounded-2xl border bg-gradient-to-br ${d.gradient} ${d.border} p-5 text-left shadow-sm transition hover:shadow-md hover:-translate-y-0.5 active:scale-95`}>
                    <span className="text-3xl">{d.icon}</span>
                    <p className="mt-2 font-bold text-slate-800 text-sm">{d.title}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{d.desc}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="rounded-full border border-slate-200 bg-white/70 px-2 py-0.5 text-xs font-medium text-slate-600">{d.task}</span>
                      <span className="rounded-full border border-slate-200 bg-white/70 px-2 py-0.5 text-xs font-medium text-slate-600">{d.rows} filas</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════ STEP 2 ═══ */}
        {!loading && step === 2 && dataInfo && (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Explorar y limpiar</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {dataInfo.filas} filas · {dataInfo.columnas?.length} columnas
                  {dataInfo.nombre_archivo && ` · ${dataInfo.nombre_archivo}`}
                </p>
              </div>
              <Btn onClick={() => setStep(3)} size="md">Continuar →</Btn>
            </div>

            {/* Issues banner */}
            {dataInfo.problemas?.length > 0 && (
              <Alert type="warning">
                <p className="font-semibold mb-1">Problemas detectados en el dataset</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  {dataInfo.problemas.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </Alert>
            )}

            {/* Clean panel */}
            {hasIssues && (
              <Card>
                <h3 className="font-semibold text-slate-700 mb-4">🧹 Limpiar datos</h3>
                <div className="space-y-5">
                  {hasDups && (
                    <label className="flex cursor-pointer items-center gap-3">
                      <input type="checkbox" checked={cleanOpts.eliminar_duplicados}
                        onChange={e => setCleanOpts(p => ({ ...p, eliminar_duplicados: e.target.checked }))}
                        className="h-4 w-4 rounded border-slate-300 accent-indigo-600" />
                      <span className="text-sm text-slate-700 font-medium">Eliminar filas duplicadas</span>
                    </label>
                  )}
                  {hasNulls && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-2">Manejo de valores nulos:</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { val: 'ninguna',        label: 'Ignorar' },
                          { val: 'eliminar_filas', label: 'Eliminar filas' },
                          { val: 'media',          label: 'Rellenar con media' },
                          { val: 'mediana',        label: 'Rellenar con mediana' },
                          { val: 'moda',           label: 'Rellenar con moda' },
                        ].map(opt => (
                          <button key={opt.val}
                            onClick={() => setCleanOpts(p => ({ ...p, estrategia_nulos: opt.val }))}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition
                              ${cleanOpts.estrategia_nulos === opt.val
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}>
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

            {/* Column summary */}
            <Card>
              <h3 className="font-semibold text-slate-700 mb-3">📋 Resumen de columnas</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="py-2 pr-6 text-left font-semibold text-slate-500 text-xs uppercase tracking-wide">Columna</th>
                      <th className="py-2 pr-6 text-left font-semibold text-slate-500 text-xs uppercase tracking-wide">Tipo</th>
                      <th className="py-2 text-left font-semibold text-slate-500 text-xs uppercase tracking-wide">Nulos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataInfo.columnas?.map(col => {
                      const nullCount = dataInfo.nulos?.[col] || 0
                      return (
                        <tr key={col} className="border-b border-slate-50 hover:bg-slate-50">
                          <td className="py-2 pr-6 font-mono text-xs text-indigo-700 font-semibold">{col}</td>
                          <td className="py-2 pr-6 text-slate-500 text-xs">{dataInfo.tipos?.[col]}</td>
                          <td className="py-2">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold
                              ${nullCount > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {nullCount === 0 ? '✓ 0' : nullCount}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Preview */}
            <Card>
              <h3 className="font-semibold text-slate-700 mb-3">👁 Vista previa — primeras 10 filas</h3>
              <DataTable columns={dataInfo.columnas} rows={dataInfo.preview} />
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════ STEP 3 ═══ */}
        {!loading && step === 3 && dataInfo && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Configurar modelo</h2>
              <p className="text-sm text-slate-500 mt-1">Elige la variable objetivo, la tarea de ML y el algoritmo</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
              {/* ── Left panel (3 cols) ── */}
              <div className="space-y-5 lg:col-span-3">

                {/* Target */}
                <Card>
                  <label className="block text-sm font-bold text-slate-700 mb-2">🎯 Variable objetivo (target)</label>
                  <select value={target} onChange={e => handleTargetChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                    <option value="">— Selecciona una columna —</option>
                    {dataInfo.columnas?.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {target && (
                    <p className="mt-1.5 text-xs text-slate-400">
                      Tipo detectado: <span className="font-semibold text-indigo-600">{dataInfo.tipos?.[target]}</span>
                    </p>
                  )}
                </Card>

                {/* Task type */}
                <Card>
                  <p className="text-sm font-bold text-slate-700 mb-3">⚙ Tipo de tarea</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { val: 'clasificacion', label: '🏷 Clasificación', desc: 'Variable categórica o binaria (0/1, Sí/No)' },
                      { val: 'regresion',     label: '📈 Regresión',     desc: 'Variable numérica continua (precio, edad…)' },
                    ].map(t => (
                      <button key={t.val} onClick={() => { setTaskType(t.val); setAlgorithm('') }}
                        className={`rounded-xl border-2 p-3 text-left transition
                          ${taskType === t.val ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`}>
                        <p className="text-sm font-bold text-slate-800">{t.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-snug">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Split slider */}
                <Card>
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    ✂ División entrenamiento / prueba
                  </label>
                  <input type="range" min="0.10" max="0.40" step="0.05"
                    value={testSize} onChange={e => setTestSize(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer" />
                  <div className="mt-1.5 flex justify-between text-xs text-slate-500">
                    <span className="font-semibold text-indigo-600">Entrenamiento: {Math.round((1 - testSize) * 100)}%</span>
                    <span className="font-semibold text-violet-600">Prueba: {Math.round(testSize * 100)}%</span>
                  </div>
                </Card>

                {/* Feature selection */}
                {target && (
                  <Card>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-bold text-slate-700">📋 Variables predictoras</p>
                      <div className="flex gap-2">
                        <button onClick={() => setSelFeatures(dataInfo.columnas.filter(c => c !== target))}
                          className="text-xs text-indigo-600 hover:underline">Todas</button>
                        <span className="text-slate-300">·</span>
                        <button onClick={() => setSelFeatures([])}
                          className="text-xs text-slate-500 hover:underline">Ninguna</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1 max-h-44 overflow-y-auto pr-1">
                      {dataInfo.columnas?.filter(c => c !== target).map(col => (
                        <label key={col} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                          <input type="checkbox" checked={selFeatures.includes(col)}
                            onChange={e => toggleFeature(col, e.target.checked)}
                            className="h-3.5 w-3.5 rounded border-slate-300 accent-indigo-600" />
                          <span className="text-xs font-mono text-slate-600 truncate">{col}</span>
                        </label>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              {/* ── Right panel (2 cols) ── */}
              <div className="lg:col-span-2">
                <Card className="h-full">
                  <p className="text-sm font-bold text-slate-700 mb-3">🤖 Algoritmo</p>
                  <div className="space-y-2">
                    {ALGORITHMS[taskType].map(alg => (
                      <button key={alg.id} onClick={() => setAlgorithm(alg.id)}
                        className={`w-full rounded-xl border-2 px-3 py-2.5 text-left transition
                          ${algorithm === alg.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`}>
                        <p className="text-sm font-semibold text-slate-800 leading-tight">{alg.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{alg.desc}</p>
                      </button>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            {/* Train button */}
            <div className="flex justify-center pt-2">
              <Btn onClick={trainModel} disabled={!target || !algorithm} size="lg">
                🚀 Entrenar modelo
              </Btn>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════ STEP 4 ═══ */}
        {!loading && step === 4 && trainResults && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Resultados del modelo</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {trainResults.filas_entrenamiento} filas entrenamiento · {trainResults.filas_prueba} filas prueba
                  {' · '}
                  <span className="font-semibold text-indigo-600">
                    {ALGORITHMS[trainResults.task_type]?.find(a => a.id === trainResults.algoritmo)?.name || trainResults.algoritmo}
                  </span>
                </p>
              </div>
              <Btn variant="secondary" size="sm" onClick={() => { setStep(3); setTrainResults(null) }}>
                ← Cambiar modelo
              </Btn>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1 w-fit">
              {[
                { id: 'metricas',   label: '📊 Métricas y gráficas' },
                { id: 'prediccion', label: '🔮 Hacer predicción' },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`rounded-lg px-5 py-2 text-sm font-semibold transition
                    ${activeTab === tab.id ? 'bg-white text-indigo-700 shadow' : 'text-slate-500 hover:text-slate-700'}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── MÉTRICAS tab ── */}
            {activeTab === 'metricas' && (
              <div className="space-y-6">

                {/* Classification metrics */}
                {trainResults.task_type === 'clasificacion' && (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      {trainResults.metricas.accuracy  !== undefined && <Metric label="Accuracy"  value={`${(trainResults.metricas.accuracy  * 100).toFixed(1)}%`} color="indigo"  hint="Predicciones correctas" />}
                      {trainResults.metricas.precision !== undefined && <Metric label="Precision" value={`${(trainResults.metricas.precision * 100).toFixed(1)}%`} color="violet"  hint="Precisión ponderada" />}
                      {trainResults.metricas.recall    !== undefined && <Metric label="Recall"    value={`${(trainResults.metricas.recall    * 100).toFixed(1)}%`} color="sky"     hint="Sensibilidad" />}
                      {trainResults.metricas.f1_score  !== undefined && <Metric label="F1-Score"  value={`${(trainResults.metricas.f1_score  * 100).toFixed(1)}%`} color="emerald" hint="Balance precisión / recall" />}
                      {trainResults.metricas.roc_auc   !== undefined && <Metric label="ROC-AUC"   value={trainResults.metricas.roc_auc.toFixed(3)}               color="amber"   hint="Capacidad discriminatoria" />}
                    </div>
                    <Card className="text-xs text-slate-500 space-y-1 bg-slate-50">
                      <p><strong className="text-slate-700">Accuracy:</strong> Porcentaje total de predicciones correctas.</p>
                      <p><strong className="text-slate-700">Precision:</strong> De los que el modelo predijo positivos, ¿cuántos realmente lo eran?</p>
                      <p><strong className="text-slate-700">Recall:</strong> De todos los casos positivos reales, ¿cuántos detectó el modelo?</p>
                      <p><strong className="text-slate-700">F1-Score:</strong> Media armónica entre Precision y Recall. Útil con clases desbalanceadas.</p>
                      {trainResults.metricas.roc_auc !== undefined && <p><strong className="text-slate-700">ROC-AUC:</strong> Área bajo la curva ROC. Valor cercano a 1 = excelente discriminación.</p>}
                    </Card>
                  </>
                )}

                {/* Regression metrics */}
                {trainResults.task_type === 'regresion' && (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      {trainResults.metricas.r2   !== undefined && <Metric label="R² Score" value={trainResults.metricas.r2.toFixed(3)}   color="indigo"  hint="Varianza explicada (0–1)" />}
                      {trainResults.metricas.mae  !== undefined && <Metric label="MAE"       value={trainResults.metricas.mae.toFixed(3)}  color="violet"  hint="Error absoluto medio" />}
                      {trainResults.metricas.rmse !== undefined && <Metric label="RMSE"      value={trainResults.metricas.rmse.toFixed(3)} color="sky"     hint="Raíz del error cuadrático" />}
                      {trainResults.metricas.mse  !== undefined && <Metric label="MSE"       value={trainResults.metricas.mse.toFixed(3)}  color="amber"   hint="Error cuadrático medio" />}
                      {trainResults.metricas.mape !== undefined && <Metric label="MAPE"      value={`${trainResults.metricas.mape.toFixed(1)}%`} color="emerald" hint="Error porcentual medio" />}
                    </div>
                    <Card className="text-xs text-slate-500 space-y-1 bg-slate-50">
                      <p><strong className="text-slate-700">R²:</strong> Proporción de varianza explicada. Más cercano a 1 = mejor ajuste.</p>
                      <p><strong className="text-slate-700">MAE:</strong> Error promedio en las mismas unidades que la variable objetivo.</p>
                      <p><strong className="text-slate-700">RMSE:</strong> Similar al MAE pero penaliza errores grandes con más fuerza.</p>
                      <p><strong className="text-slate-700">MAPE:</strong> Error porcentual; fácil de interpretar sin importar la escala.</p>
                    </Card>
                  </>
                )}

                {/* Charts */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {trainResults.charts.confusion_matrix && (
                    <Card>
                      <img src={`data:image/png;base64,${trainResults.charts.confusion_matrix}`}
                        alt="Matriz de Confusión" className="w-full rounded-lg" />
                    </Card>
                  )}
                  {trainResults.charts.scatter && (
                    <Card>
                      <img src={`data:image/png;base64,${trainResults.charts.scatter}`}
                        alt="Real vs Predicho" className="w-full rounded-lg" />
                    </Card>
                  )}
                  {trainResults.charts.feature_importance && (
                    <Card className="sm:col-span-2">
                      <img src={`data:image/png;base64,${trainResults.charts.feature_importance}`}
                        alt="Importancia de Variables" className="mx-auto w-full max-w-2xl rounded-lg" />
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* ── PREDICCIÓN tab ── */}
            {activeTab === 'prediccion' && (
              <div className="grid gap-6 lg:grid-cols-2">

                {/* Input form */}
                <Card>
                  <h3 className="font-bold text-slate-700 mb-4">Ingresa los valores a predecir</h3>
                  <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                    {trainResults.features_usadas?.map(col => {
                      const isCat = trainResults.columnas_categoricas?.includes(col)
                      const opts  = trainResults.opciones_categoricas?.[col]
                      return (
                        <div key={col}>
                          <label className="mb-1 block text-xs font-semibold text-slate-600 font-mono">
                            {col}
                            {isCat && <span className="ml-1 text-violet-500">(categórica)</span>}
                          </label>
                          {isCat && opts ? (
                            <select value={predVals[col] || ''}
                              onChange={e => setPredVals(p => ({ ...p, [col]: e.target.value }))}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                              <option value="">— Selecciona —</option>
                              {opts.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          ) : (
                            <input type="number" value={predVals[col] || ''}
                              onChange={e => setPredVals(p => ({ ...p, [col]: e.target.value }))}
                              placeholder={`Valor numérico`}
                              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <Btn onClick={predict} disabled={predLoading} className="mt-5 w-full" size="md">
                    {predLoading ? 'Calculando…' : '🔮 Predecir'}
                  </Btn>
                </Card>

                {/* Result */}
                {predResult ? (
                  <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 flex flex-col justify-center">
                    <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
                      Resultado de la predicción
                    </p>

                    {predResult.task_type === 'clasificacion' ? (
                      <>
                        <div className="text-center">
                          <span className="text-6xl">{predResult.clase === 1 ? '✅' : '❌'}</span>
                          <p className="mt-3 text-2xl font-extrabold text-slate-800">{predResult.etiqueta}</p>
                          <p className="text-sm text-slate-500 mt-1">Clase predicha: <span className="font-bold text-indigo-600">{predResult.clase}</span></p>
                        </div>
                        {predResult.probabilidades && (
                          <div className="mt-5 space-y-2">
                            <p className="text-xs font-semibold text-slate-600 text-center mb-2">Probabilidades por clase</p>
                            {predResult.probabilidades.map(({ clase, prob }) => (
                              <div key={clase} className="flex items-center gap-2">
                                <span className="w-12 text-right text-xs text-slate-500 shrink-0">Clase {clase}</span>
                                <div className="flex-1 rounded-full bg-slate-200 h-2.5 overflow-hidden">
                                  <div className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                                    style={{ width: `${prob * 100}%` }} />
                                </div>
                                <span className="w-10 text-right text-xs font-bold text-slate-700">{(prob * 100).toFixed(1)}%</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <span className="text-5xl">📌</span>
                        <p className="mt-3 text-3xl font-extrabold text-indigo-700">
                          {Number(predResult.prediccion).toLocaleString('es-CO', { maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">Valor predicho para <span className="font-semibold">{trainResults.target || target}</span></p>
                      </div>
                    )}
                  </Card>
                ) : (
                  <Card className="flex items-center justify-center border-dashed">
                    <div className="text-center text-slate-400">
                      <span className="text-4xl">🔮</span>
                      <p className="mt-2 text-sm font-medium">Completa el formulario y haz clic en Predecir</p>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-16 border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        ML Studio · Trabajo de clase · Datos Colombia (COP) · scikit-learn + FastAPI + React + Tailwind
      </footer>
    </div>
  )
}
