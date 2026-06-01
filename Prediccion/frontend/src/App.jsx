import { useState, useRef, useCallback } from 'react'
import axios from 'axios'

const API = 'https://ml-studio-backend-it5p.onrender.com'

// ── Arquitectura ──────────────────────────────────────────────────────────────
function ViewArquitectura({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#080B14]/95 backdrop-blur-xl">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-white">Arquitectura del <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Proyecto</span></h2>
            <p className="text-sm text-slate-500 mt-1">Cómo están conectadas las partes de la aplicación</p>
          </div>
          <button onClick={onClose} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-400 hover:text-white transition">✕ Cerrar</button>
        </div>

        {/* Diagrama visual */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 text-center">Diagrama de flujo</h3>
          <div className="flex flex-col items-center gap-3">

            {/* Usuario */}
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-blue-500/30 bg-blue-500/10 px-6 py-4 w-full max-w-sm">
              <span className="text-2xl">👤</span>
              <div>
                <p className="font-bold text-blue-300">Usuario</p>
                <p className="text-xs text-slate-400">Sube datos y configura el modelo desde el navegador</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="w-0.5 h-6 bg-gradient-to-b from-blue-500 to-violet-500" />
              <span className="text-xs text-slate-500 bg-slate-900 px-2 border border-white/10 rounded-full">Internet (HTTPS)</span>
              <div className="w-0.5 h-6 bg-gradient-to-b from-violet-500 to-indigo-500" />
            </div>

            {/* Frontend */}
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-violet-500/30 bg-violet-500/10 px-6 py-4 w-full max-w-sm">
              <span className="text-2xl">🖥</span>
              <div>
                <p className="font-bold text-violet-300">Frontend — Vercel</p>
                <p className="text-xs text-slate-400">Interfaz visual hecha en React · prediccion-roan.vercel.app</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="w-0.5 h-6 bg-gradient-to-b from-indigo-500 to-violet-500" />
              <span className="text-xs text-slate-500 bg-slate-900 px-2 border border-white/10 rounded-full">Llamadas a la API (JSON)</span>
              <div className="w-0.5 h-6 bg-gradient-to-b from-violet-500 to-emerald-500" />
            </div>

            {/* Backend */}
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-4 w-full max-w-sm">
              <span className="text-2xl">⚙️</span>
              <div>
                <p className="font-bold text-emerald-300">Backend — Render</p>
                <p className="text-xs text-slate-400">Servidor Python con FastAPI · ml-studio-backend-it5p.onrender.com</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="w-0.5 h-6 bg-gradient-to-b from-emerald-500 to-amber-500" />
              <span className="text-xs text-slate-500 bg-slate-900 px-2 border border-white/10 rounded-full">Procesa y entrena</span>
              <div className="w-0.5 h-6 bg-gradient-to-b from-amber-500 to-orange-500" />
            </div>

            {/* ML */}
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-4 w-full max-w-sm">
              <span className="text-2xl">🤖</span>
              <div>
                <p className="font-bold text-amber-300">Motor de Machine Learning</p>
                <p className="text-xs text-slate-400">scikit-learn · pandas · matplotlib · numpy</p>
              </div>
            </div>

          </div>
        </div>

        {/* Capas */}
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          {[
            {
              icon: '🖥', title: 'Interfaz Visual', color: 'violet',
              items: ['React — librería para construir interfaces', 'Tailwind CSS — estilos modernos', 'Axios — comunicación con el servidor', 'Vercel — publicación en internet gratis'],
            },
            {
              icon: '⚙️', title: 'Servidor (Backend)', color: 'emerald',
              items: ['Python — lenguaje de programación', 'FastAPI — framework para crear APIs', 'Render — servidor en la nube gratis', 'Recibe archivos y devuelve resultados'],
            },
            {
              icon: '🤖', title: 'Inteligencia Artificial', color: 'amber',
              items: ['scikit-learn — algoritmos de ML', 'pandas — manejo de datos y tablas', 'matplotlib/seaborn — gráficas', 'numpy — cálculos matemáticos'],
            },
          ].map(layer => {
            const colors = {
              violet: 'border-violet-500/30 bg-violet-500/10',
              emerald: 'border-emerald-500/30 bg-emerald-500/10',
              amber:   'border-amber-500/30 bg-amber-500/10',
            }
            const textColors = {
              violet: 'text-violet-300', emerald: 'text-emerald-300', amber: 'text-amber-300',
            }
            return (
              <div key={layer.title} className={`rounded-2xl border p-4 ${colors[layer.color]}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{layer.icon}</span>
                  <p className={`font-bold text-sm ${textColors[layer.color]}`}>{layer.title}</p>
                </div>
                <ul className="space-y-1.5">
                  {layer.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className="text-slate-600 mt-0.5">▸</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* GitHub */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="font-bold text-slate-300 mb-3 flex items-center gap-2"><span>📦</span> Repositorio de código</h3>
          <p className="text-sm text-slate-400 mb-2">Todo el código fuente está disponible públicamente en GitHub:</p>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-xs text-violet-400">
            github.com/ProyectoIA-code/Prediccion
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
            <div>📁 <span className="text-slate-400">Prediccion/backend/</span> — Código Python</div>
            <div>📁 <span className="text-slate-400">Prediccion/frontend/</span> — Código React</div>
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Ayuda ─────────────────────────────────────────────────────────────────────
function ViewAyuda({ onClose }) {
  const [activeTopic, setActiveTopic] = useState('tipos_tarea')

  const nav = [
    {
      grupo: 'Conceptos base', icon: '🎯',
      items: [{ id: 'tipos_tarea', label: 'Tipos de tarea' }],
    },
    {
      grupo: 'Algoritmos — Clasificación', icon: '🏷',
      items: [
        { id: 'cls_logistica',  label: 'Regresión Logística' },
        { id: 'cls_arbol',      label: 'Árbol de Decisión' },
        { id: 'cls_rf',         label: 'Random Forest' },
        { id: 'cls_svm',        label: 'SVM' },
        { id: 'cls_knn',        label: 'KNN' },
      ],
    },
    {
      grupo: 'Algoritmos — Regresión', icon: '📈',
      items: [
        { id: 'reg_lineal',  label: 'Regresión Lineal' },
        { id: 'reg_ridge',   label: 'Ridge (L2)' },
        { id: 'reg_lasso',   label: 'Lasso (L1)' },
        { id: 'reg_arbol',   label: 'Árbol de Decisión' },
        { id: 'reg_rf',      label: 'Random Forest' },
        { id: 'reg_svr',     label: 'SVR' },
      ],
    },
    {
      grupo: 'Métricas de evaluación', icon: '📏',
      items: [
        { id: 'met_cls', label: 'Métricas de clasificación' },
        { id: 'met_reg', label: 'Métricas de regresión' },
      ],
    },
  ]

  // ── sub-components ────────────────────────────────────────────────────────
  function AlgCard({ emoji, name, color, badge, desc, cuando, pros, contras, visual }) {
    const colors = {
      violet: { border: 'border-violet-500/30', bg: 'bg-violet-500/10', text: 'text-violet-300', badge: 'bg-violet-500/20 border-violet-500/30 text-violet-300' },
      emerald:{ border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-300', badge: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' },
      blue:   { border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-300', badge: 'bg-blue-500/20 border-blue-500/30 text-blue-300' },
      amber:  { border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-300', badge: 'bg-amber-500/20 border-amber-500/30 text-amber-300' },
      rose:   { border: 'border-rose-500/30', bg: 'bg-rose-500/10', text: 'text-rose-300', badge: 'bg-rose-500/20 border-rose-500/30 text-rose-300' },
    }
    const c = colors[color]
    return (
      <div className="space-y-4">
        <div className={`rounded-2xl border ${c.border} ${c.bg} p-5 flex items-center gap-4`}>
          <span className="text-4xl">{emoji}</span>
          <div>
            <p className={`text-xl font-black ${c.text}`}>{name}</p>
            <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-xs font-bold ${c.badge}`}>{badge}</span>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-300 leading-relaxed">{desc}</p>
        </div>
        {visual && (
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-3">Representación visual</p>
            {visual}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">🕐 Cuándo usarlo</p>
            <p className="text-sm text-slate-300 leading-relaxed">{cuando}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">✅ Ventajas</p>
            <ul className="space-y-1">{pros.map((p,i) => <li key={i} className="text-xs text-slate-300 flex gap-2"><span className="text-emerald-500 shrink-0">▸</span>{p}</li>)}</ul>
            <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mt-3 mb-2">⚠ Limitaciones</p>
            <ul className="space-y-1">{contras.map((c,i) => <li key={i} className="text-xs text-slate-400 flex gap-2"><span className="text-rose-500 shrink-0">▸</span>{c}</li>)}</ul>
          </div>
        </div>
      </div>
    )
  }

  function MetricBar({ label, value, max = 1, color = 'violet', desc, formula, bueno }) {
    const pct = Math.min((value / max) * 100, 100)
    const colors = { violet: 'from-violet-500 to-indigo-500', emerald: 'from-emerald-500 to-teal-500', blue: 'from-blue-500 to-cyan-500', amber: 'from-amber-500 to-orange-500' }
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-black text-white text-sm">{label}</p>
          <span className="text-xs font-mono text-slate-500">{formula}</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div className={`h-2 rounded-full bg-gradient-to-r ${colors[color]} transition-all`} style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[11px] text-emerald-400">💡 {bueno}</p>
      </div>
    )
  }

  // ── topics content ────────────────────────────────────────────────────────
  const topics = {
    tipos_tarea: (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white mb-1">Tipos de tarea</h2>
          <p className="text-sm text-slate-500">¿Qué quieres que tu modelo aprenda a predecir?</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Clasificación */}
          <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏷</span>
              <div>
                <p className="font-black text-violet-300 text-lg">Clasificación</p>
                <p className="text-xs text-slate-400">Predice a qué categoría pertenece algo</p>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2">La salida es una categoría</p>
              <div className="flex flex-wrap gap-2">
                {['✅ Aprobado', '❌ Rechazado', '📈 Sube', '📉 Baja', '🟢 Positivo', '🔴 Negativo'].map(e => (
                  <span key={e} className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-xs text-violet-300">{e}</span>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Ejemplos reales</p>
              {['¿Se aprueba este crédito? → Sí / No', '¿El cliente se va? → Churn / No churn', '¿La acción sube mañana? → Sube / Baja'].map((e,i) => (
                <p key={i} className="text-xs text-slate-300 flex gap-2"><span className="text-violet-400 shrink-0">▸</span>{e}</p>
              ))}
            </div>
            <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 px-3 py-2">
              <p className="text-xs font-bold text-violet-400">Métricas clave: Accuracy · F1-Score · ROC-AUC</p>
            </div>
          </div>
          {/* Regresión */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📈</span>
              <div>
                <p className="font-black text-emerald-300 text-lg">Regresión</p>
                <p className="text-xs text-slate-400">Predice un número continuo</p>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2">La salida es un número</p>
              <div className="flex items-end gap-1 h-16">
                {[40, 65, 50, 80, 70, 90, 75].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-emerald-600 to-emerald-400 opacity-80" style={{ height: `${h}%` }} />
                ))}
              </div>
              <p className="text-[10px] text-slate-600 mt-1 text-center">valores numéricos continuos</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Ejemplos reales</p>
              {['¿Cuánto vale esta casa? → $320.000.000', '¿Cuánto ganará la empresa? → $1.2M', '¿Cuál será el precio de la acción? → $13.05'].map((e,i) => (
                <p key={i} className="text-xs text-slate-300 flex gap-2"><span className="text-emerald-400 shrink-0">▸</span>{e}</p>
              ))}
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3 py-2">
              <p className="text-xs font-bold text-emerald-400">Métricas clave: R² · MAE · RMSE</p>
            </div>
          </div>
        </div>
        {/* ¿Cómo elegir? */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="font-bold text-slate-300 mb-4">🤔 ¿Cómo saber cuál usar?</p>
          <div className="space-y-2">
            {[
              { q: 'Mi variable objetivo tiene valores como 0, 1, Sí, No, Categorías…', r: '→ Clasificación', color: 'text-violet-400' },
              { q: 'Mi variable objetivo tiene valores como precios, temperaturas, cantidades…', r: '→ Regresión', color: 'text-emerald-400' },
              { q: 'El tipo de dato en la columna es int64 con solo 2 valores distintos…', r: '→ Probablemente Clasificación', color: 'text-violet-400' },
              { q: 'El tipo de dato en la columna es float64 con muchos valores distintos…', r: '→ Probablemente Regresión', color: 'text-emerald-400' },
            ].map((row, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                <span className="text-slate-500 text-xs mt-0.5 shrink-0">Si:</span>
                <p className="text-xs text-slate-400 flex-1">{row.q}</p>
                <p className={`text-xs font-bold shrink-0 ${row.color}`}>{row.r}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),

    cls_logistica: (
      <AlgCard
        emoji="📉" name="Regresión Logística" color="violet"
        badge="Clasificación · Línea base recomendada"
        desc="A pesar del nombre, NO es un algoritmo de regresión: es de clasificación. Toma las variables de entrada, las combina linealmente y aplica una función sigmoide que transforma el resultado en una probabilidad entre 0 y 1. Si la probabilidad supera 0.5, predice la clase positiva."
        cuando="Dataset pequeño o mediano, variables numéricas, cuando necesitas interpretar exactamente por qué el modelo tomó cada decisión, o cuando quieres un punto de partida rápido para comparar con modelos más complejos."
        pros={['Muy rápido de entrenar', 'Fácil de interpretar (coeficientes)', 'Produce probabilidades confiables', 'Funciona bien con datos linealmente separables']}
        contras={['Asume relación lineal entre features y objetivo', 'No captura patrones complejos', 'Sensible a variables en escalas muy diferentes (requiere escalado)']}
        visual={
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-slate-500 mb-1">Función sigmoide: transforma cualquier número → probabilidad [0, 1]</p>
            <div className="flex items-end gap-0.5 w-full h-16">
              {[-6,-4,-2,-1,0,1,2,4,6].map((x, i) => {
                const sig = 1 / (1 + Math.exp(-x))
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-full rounded-t-sm bg-gradient-to-t from-violet-600 to-violet-400" style={{ height: `${sig * 100}%` }} />
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between w-full text-[10px] text-slate-600">
              <span>entrada negativa → P≈0</span><span>entrada=0 → P=0.5</span><span>entrada positiva → P≈1</span>
            </div>
          </div>
        }
      />
    ),

    cls_arbol: (
      <AlgCard
        emoji="🌳" name="Árbol de Decisión" color="emerald"
        badge="Clasificación · Muy interpretable"
        desc="Aprende una serie de preguntas tipo SI/NO sobre las variables y las organiza en forma de árbol. Cada nodo interior hace una pregunta sobre una variable, cada rama es una respuesta, y cada hoja es la predicción final. Es como un diagrama de flujo que el modelo construye automáticamente a partir de los datos."
        cuando="Cuando necesitas explicar claramente por qué el modelo tomó una decisión, con datos que tienen relaciones no lineales, o cuando el público no es técnico y debe entender el razonamiento."
        pros={['Totalmente interpretable', 'No requiere escalado de variables', 'Maneja variables numéricas y categóricas', 'Visualizable como diagrama']}
        contras={['Propenso a sobreajuste (overfitting) si el árbol crece mucho', 'Inestable: pequeños cambios en datos cambian el árbol', 'No tan preciso como modelos de conjunto']}
        visual={
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-300 font-bold">¿Ingreso &gt; $3M?</div>
            </div>
            <div className="flex justify-center gap-16">
              <div className="flex flex-col items-center gap-1">
                <div className="w-px h-4 bg-white/20" />
                <span className="text-[10px] text-slate-500">Sí</span>
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">¿Historial &gt; 700?</div>
                <div className="flex gap-4 mt-1">
                  <div className="flex flex-col items-center gap-1"><div className="w-px h-3 bg-white/20"/><div className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] text-emerald-400">✅ Aprobado</div></div>
                  <div className="flex flex-col items-center gap-1"><div className="w-px h-3 bg-white/20"/><div className="rounded-full bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 text-[10px] text-rose-400">❌ Rechazado</div></div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-px h-4 bg-white/20" />
                <span className="text-[10px] text-slate-500">No</span>
                <div className="rounded-full bg-rose-500/20 border border-rose-500/30 px-3 py-1.5 text-[10px] text-rose-400 mt-3">❌ Rechazado</div>
              </div>
            </div>
          </div>
        }
      />
    ),

    cls_rf: (
      <AlgCard
        emoji="🌲" name="Random Forest" color="emerald"
        badge="Clasificación · Alta precisión"
        desc="Crea muchos árboles de decisión distintos (el 'bosque'), cada uno entrenado con una muestra aleatoria del dataset y usando un subconjunto aleatorio de variables. La predicción final es la categoría que más árboles eligieron (votación mayoritaria). La aleatoriedad reduce el sobreajuste que tienen los árboles individuales."
        cuando="Cuando quieres alta precisión sin mucha configuración. Es el algoritmo recomendado para empezar en la mayoría de los problemas de clasificación con datos tabulares."
        pros={['Alta precisión en la mayoría de casos', 'Robusto ante datos atípicos (outliers)', 'Proporciona importancia de variables', 'Resiste bien el overfitting']}
        contras={['Más lento que un solo árbol', 'Difícil de interpretar (caja negra)', 'Consume más memoria']}
        visual={
          <div className="space-y-2">
            <div className="flex gap-2 justify-center">
              {['🌳', '🌲', '🌳', '🌲', '🌳'].map((t, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-xl">{t}</span>
                  <div className={`rounded-full px-2 py-0.5 text-[10px] border ${i % 2 === 0 ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/20 border-rose-500/30 text-rose-400'}`}>
                    {i % 2 === 0 ? '✅' : '❌'}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <div className="text-slate-500 text-xs">↓ votación mayoritaria (3 vs 2)</div>
            </div>
            <div className="flex justify-center">
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-300">✅ Predicción: Aprobado</div>
            </div>
          </div>
        }
      />
    ),

    cls_svm: (
      <AlgCard
        emoji="✂️" name="SVM — Support Vector Machine" color="blue"
        badge="Clasificación · Efectivo en alta dimensión"
        desc="Busca el hiperplano (línea en 2D, plano en 3D, …) que mejor separa las dos clases dejando el mayor margen posible entre ellas. Los puntos más cercanos al hiperplano se llaman 'vectores de soporte'. Puede usar un 'kernel' para proyectar los datos a dimensiones más altas y separar clases que no son linealmente separables."
        cuando="Datasets con muchas variables (alta dimensionalidad), cuando las clases son difíciles de separar, o cuando el dataset no es demasiado grande (>10k filas empieza a ser lento)."
        pros={['Funciona bien con muchas variables', 'Kernel RBF captura relaciones no lineales', 'Margen máximo reduce overfitting', 'Produce probabilidades con probability=True']}
        contras={['Lento en datasets grandes', 'Sensible a la escala (requiere StandardScaler)', 'Difícil de interpretar', 'Requiere ajuste de hiperparámetros (C, gamma)']}
        visual={
          <div className="space-y-2">
            <div className="relative h-24 rounded-lg bg-black/30 border border-white/10 overflow-hidden">
              {[{x:15,y:25,c:'violet'},{x:25,y:40,c:'violet'},{x:20,y:60,c:'violet'},{x:35,y:30,c:'violet'},{x:65,y:35,c:'blue'},{x:75,y:55,c:'blue'},{x:80,y:25,c:'blue'},{x:70,y:70,c:'blue'}].map((p,i)=>(
                <div key={i} className={`absolute w-3 h-3 rounded-full border-2 ${p.c==='violet'?'bg-violet-500/40 border-violet-400':'bg-blue-500/40 border-blue-400'}`} style={{left:`${p.x}%`,top:`${p.y}%`,transform:'translate(-50%,-50%)'}}/>
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-px h-full bg-white/30 rotate-12 origin-center absolute" style={{left:'51%'}}/>
                <div className="w-px h-full bg-white/10 rotate-12 origin-center absolute" style={{left:'43%'}}/>
                <div className="w-px h-full bg-white/10 rotate-12 origin-center absolute" style={{left:'59%'}}/>
              </div>
            </div>
            <p className="text-[10px] text-slate-600 text-center">línea sólida = hiperplano · líneas punteadas = margen máximo</p>
          </div>
        }
      />
    ),

    cls_knn: (
      <AlgCard
        emoji="🔍" name="KNN — K Vecinos más Cercanos" color="amber"
        badge="Clasificación · Basado en similitud"
        desc="No 'aprende' un modelo en el sentido tradicional: guarda todos los datos de entrenamiento. Cuando llega un nuevo punto, busca los K ejemplos más parecidos (vecinos más cercanos) y predice la categoría que más aparece entre ellos. K es el número de vecinos a considerar (por defecto 5)."
        cuando="Cuando tienes pocos datos, cuando las relaciones entre variables son locales (similitud geográfica, por ejemplo), o para prototipado rápido."
        pros={['Concepto muy intuitivo', 'No requiere entrenamiento (lazy learning)', 'Se adapta automáticamente a nuevas clases', 'Funciona bien con k bien elegido']}
        contras={['Lento en predicción (busca en todo el dataset)', 'Sensible a la escala (requiere StandardScaler)', 'Sufre con muchas dimensiones (curse of dimensionality)', 'Sensible a datos ruidosos']}
        visual={
          <div className="space-y-2">
            <div className="relative h-28 rounded-lg bg-black/30 border border-white/10">
              {[{x:20,y:30,c:'violet'},{x:30,y:50,c:'violet'},{x:15,y:65,c:'violet'},{x:70,y:25,c:'blue'},{x:80,y:60,c:'blue'},{x:65,y:70,c:'blue'}].map((p,i)=>(
                <div key={i} className={`absolute w-3 h-3 rounded-full ${p.c==='violet'?'bg-violet-500':'bg-blue-500'}`} style={{left:`${p.x}%`,top:`${p.y}%`,transform:'translate(-50%,-50%)'}}/>
              ))}
              <div className="absolute w-4 h-4 rounded-full bg-amber-400 border-2 border-amber-300 animate-pulse" style={{left:'45%',top:'45%',transform:'translate(-50%,-50%)'}}/>
              <div className="absolute rounded-full border border-dashed border-amber-400/50" style={{left:'45%',top:'45%',width:'80px',height:'80px',transform:'translate(-50%,-50%)'}}/>
            </div>
            <p className="text-[10px] text-slate-600 text-center">punto amarillo = nuevo dato · círculo = radio de búsqueda de K vecinos</p>
          </div>
        }
      />
    ),

    reg_lineal: (
      <AlgCard
        emoji="📏" name="Regresión Lineal" color="emerald"
        badge="Regresión · La más simple"
        desc="Encuentra la línea recta (o hiperplano en múltiples dimensiones) que mejor se ajusta a los datos minimizando la suma de errores al cuadrado. La predicción es una combinación lineal de las variables: y = a₁x₁ + a₂x₂ + ... + b. Los coeficientes 'a' indican cuánto impacta cada variable."
        cuando="Cuando la relación entre las variables y el objetivo es aproximadamente lineal, el dataset es pequeño o mediano, y necesitas máxima interpretabilidad de los coeficientes."
        pros={['Más rápido de entrenar', 'Coeficientes directamente interpretables', 'Sirve como línea base para comparar', 'Bajo costo computacional']}
        contras={['Asume relación estrictamente lineal', 'Sensible a outliers extremos', 'No captura interacciones complejas entre variables']}
        visual={
          <div className="space-y-2">
            <div className="relative h-24 rounded-lg bg-black/30 border border-white/10 overflow-hidden">
              {[{x:10,y:75},{x:20,y:65},{x:30,y:55},{x:40,y:42},{x:50,y:40},{x:60,y:28},{x:70,y:22},{x:80,y:12}].map((p,i)=>(
                <div key={i} className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400" style={{left:`${p.x}%`,top:`${p.y}%`,transform:'translate(-50%,-50%)'}}/>
              ))}
              <div className="absolute inset-0" style={{background:'linear-gradient(to right bottom, transparent 40%, rgba(16,185,129,0.3) 40%, rgba(16,185,129,0.3) 41%, transparent 41%)' }}/>
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="5" y1="82" x2="90" y2="5" stroke="rgb(52,211,153)" strokeWidth="1.5" strokeDasharray="none"/>
              </svg>
            </div>
            <p className="text-[10px] text-slate-600 text-center">la línea minimiza la suma de errores al cuadrado</p>
          </div>
        }
      />
    ),

    reg_ridge: (
      <AlgCard
        emoji="🛡" name="Ridge — Regularización L2" color="blue"
        badge="Regresión · Previene sobreajuste"
        desc="Es Regresión Lineal con un 'castigo' adicional por tener coeficientes grandes. Al minimizar los errores, también minimiza la suma de cuadrados de los coeficientes (L2). Esto reduce el impacto de variables poco relevantes sin eliminarlas completamente, mejorando la generalización del modelo."
        cuando="Cuando tienes muchas variables y sospechas que algunas son irrelevantes o hay multicolinealidad (variables muy correlacionadas entre sí). Mejora la Regresión Lineal simple en casi todos los casos."
        pros={['Más estable que Regresión Lineal con muchas variables', 'Reduce overfitting efectivamente', 'Funciona bien con multicolinealidad', 'Rápido de entrenar']}
        contras={['No elimina variables irrelevantes (solo las reduce)', 'Añade un hiperparámetro alpha a ajustar', 'Coeficientes menos interpretables que Regresión Lineal']}
        visual={
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="text-[10px] font-bold text-slate-500 mb-2">Sin Ridge (overfitting)</p>
                <div className="flex gap-1 items-end h-10">
                  {[90,10,85,5,75,15,60].map((h,i)=>(
                    <div key={i} className="flex-1 rounded-t-sm bg-rose-500/40" style={{height:`${h}%`}}/>
                  ))}
                </div>
                <p className="text-[10px] text-slate-600 mt-1">coeficientes muy variables</p>
              </div>
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                <p className="text-[10px] font-bold text-blue-400 mb-2">Con Ridge (estable)</p>
                <div className="flex gap-1 items-end h-10">
                  {[60,45,55,40,50,42,48].map((h,i)=>(
                    <div key={i} className="flex-1 rounded-t-sm bg-blue-500/60" style={{height:`${h}%`}}/>
                  ))}
                </div>
                <p className="text-[10px] text-slate-600 mt-1">coeficientes más suavizados</p>
              </div>
            </div>
          </div>
        }
      />
    ),

    reg_lasso: (
      <AlgCard
        emoji="✂️" name="Lasso — Regularización L1" color="violet"
        badge="Regresión · Selección automática de variables"
        desc="Similar a Ridge pero usa la suma de valores absolutos de los coeficientes como castigo (L1). La diferencia clave: Lasso puede llevar coeficientes exactamente a cero, eliminando completamente las variables irrelevantes. Funciona como selector automático de features."
        cuando="Cuando tienes muchas variables y crees que solo unas pocas son realmente importantes. Lasso hace la selección de features automáticamente eliminando las demás."
        pros={['Selección automática de variables (coeficientes = 0)', 'Modelo más simple y fácil de explicar', 'Robusto ante variables irrelevantes', 'Muy útil con datasets de alta dimensionalidad']}
        contras={['Si variables están muy correlacionadas, elige una arbitrariamente', 'Puede eliminar variables que sí son relevantes', 'Más inestable que Ridge']}
        visual={
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-bold text-slate-500 mb-2">Ridge: reduce pero no elimina</p>
              <div className="space-y-1">
                {['var_1','var_2','var_3','var_4'].map((v,i)=>{
                  const w = [70,50,30,15][i]
                  return <div key={v} className="flex items-center gap-2"><span className="text-[10px] text-slate-500 w-10">{v}</span><div className="flex-1 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-blue-500" style={{width:`${w}%`}}/></div></div>
                })}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-violet-400 mb-2">Lasso: elimina irrelevantes</p>
              <div className="space-y-1">
                {['var_1','var_2','var_3','var_4'].map((v,i)=>{
                  const w = [85,60,0,0][i]
                  return <div key={v} className="flex items-center gap-2"><span className="text-[10px] text-slate-500 w-10">{v}</span><div className="flex-1 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-violet-500" style={{width:`${w}%`}}/></div>{w===0&&<span className="text-[10px] text-rose-400">✕</span>}</div>
                })}
              </div>
            </div>
          </div>
        }
      />
    ),

    reg_arbol: (
      <AlgCard
        emoji="🌳" name="Árbol de Decisión (Regresión)" color="amber"
        badge="Regresión · No lineal e interpretable"
        desc="Igual que en clasificación, divide el espacio de datos en regiones mediante preguntas SI/NO, pero en vez de predecir una categoría, predice el promedio de los valores de entrenamiento que caen en cada región. Captura relaciones no lineales que la Regresión Lineal no puede."
        cuando="Cuando la relación entre variables y objetivo no es lineal, necesitas interpretabilidad pero con relaciones complejas, o como componente base de Random Forest."
        pros={['Captura relaciones no lineales', 'No requiere escalado de variables', 'Interpretable visualmente', 'Maneja variables categóricas directamente']}
        contras={['Propenso a overfitting', 'No extrapola bien fuera del rango de entrenamiento', 'Predicciones en escalera (no suavizadas)']}
        visual={
          <div className="space-y-2">
            <div className="relative h-20 rounded-lg bg-black/30 border border-white/10 overflow-hidden">
              {[{x:5,y:70},{x:15,y:68},{x:25,y:40},{x:35,y:38},{x:45,y:42},{x:55,y:20},{x:65,y:18},{x:75,y:22},{x:85,y:50},{x:95,y:52}].map((p,i)=>(
                <div key={i} className="absolute w-2 h-2 rounded-full bg-amber-400" style={{left:`${p.x}%`,top:`${p.y}%`,transform:'translate(-50%,-50%)'}}/>
              ))}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline points="0,70 30,70 30,40 55,40 55,20 80,20 80,52 100,52" fill="none" stroke="rgb(251,191,36)" strokeWidth="1.5"/>
              </svg>
            </div>
            <p className="text-[10px] text-slate-600 text-center">predicciones en "escalera" — promedio por región</p>
          </div>
        }
      />
    ),

    reg_rf: (
      <AlgCard
        emoji="🌲" name="Random Forest (Regresión)" color="emerald"
        badge="Regresión · El más preciso en general"
        desc="Crea muchos árboles de decisión de regresión, cada uno con una muestra aleatoria de datos y variables. La predicción final es el promedio de todos los árboles. Al promediar, las predicciones en 'escalera' se suavizan y se reduce drásticamente el error."
        cuando="Cuando quieres máxima precisión con mínima configuración. Es el algoritmo de regresión recomendado para datasets tabulares medianos. También provee importancia de variables."
        pros={['Alta precisión en casi todos los casos', 'Robusto ante outliers y ruido', 'Provee importancia de variables', 'Reduce drásticamente el overfitting vs árbol individual']}
        contras={['Más lento que modelos lineales', 'No extrapola fuera del rango de entrenamiento', 'Consume más memoria', 'Difícil de interpretar individualmente']}
        visual={
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {['Árbol 1','Árbol 2','Árbol 3'].map((t,ti)=>(
                <div key={t} className="rounded-lg border border-white/10 bg-white/5 p-2">
                  <p className="text-[10px] text-slate-500 mb-1">{t}</p>
                  <div className="relative h-10 bg-black/20 rounded overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <polyline points={ti===0?"0,80 40,80 40,30 100,30":ti===1?"0,60 50,60 50,20 100,20":"0,70 35,70 35,40 100,40"} fill="none" stroke="rgb(52,211,153)" strokeWidth="3"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center text-xs text-slate-500">↓ promedio de todos los árboles</div>
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2">
              <div className="relative h-10 bg-black/20 rounded overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polyline points="0,70 20,68 40,55 60,35 80,28 100,27" fill="none" stroke="rgb(52,211,153)" strokeWidth="3"/>
                </svg>
              </div>
              <p className="text-[10px] text-emerald-400 mt-1 text-center">resultado final suavizado</p>
            </div>
          </div>
        }
      />
    ),

    reg_svr: (
      <AlgCard
        emoji="🎯" name="SVR — Support Vector Regression" color="rose"
        badge="Regresión · Robusto ante outliers"
        desc="Versión de SVM para regresión. En vez de minimizar todos los errores, SVR solo penaliza los errores que superen un margen ε (épsilon). Los puntos dentro del margen son ignorados. Esto lo hace muy robusto ante valores atípicos. El kernel RBF le permite modelar relaciones no lineales."
        cuando="Cuando el dataset tiene outliers significativos, relaciones no lineales, y es de tamaño mediano. Útil cuando los errores pequeños son aceptables y solo importa corregir los grandes."
        pros={['Muy robusto ante outliers', 'Kernel RBF captura relaciones no lineales', 'Funciona bien en alta dimensionalidad', 'Control preciso del margen de error']}
        contras={['Lento en datasets grandes', 'Requiere escalado de variables (StandardScaler)', 'Difícil de interpretar', 'Requiere ajuste de hiperparámetros (C, ε, gamma)']}
        visual={
          <div className="space-y-2">
            <div className="relative h-24 rounded-lg bg-black/30 border border-white/10 overflow-hidden">
              {[{x:10,y:70,out:false},{x:20,y:55,out:false},{x:30,y:48,out:false},{x:40,y:40,out:false},{x:50,y:35,out:false},{x:60,y:28,out:false},{x:65,y:5,out:true},{x:70,y:22,out:false},{x:80,y:18,out:false}].map((p,i)=>(
                <div key={i} className={`absolute w-2.5 h-2.5 rounded-full border ${p.out?'bg-rose-500 border-rose-300':'bg-rose-400/60 border-rose-400/80'}`} style={{left:`${p.x}%`,top:`${p.y}%`,transform:'translate(-50%,-50%)'}}/>
              ))}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="5" y1="75" x2="90" y2="15" stroke="rgb(251,113,133)" strokeWidth="1.5"/>
                <line x1="5" y1="85" x2="90" y2="25" stroke="rgb(251,113,133)" strokeWidth="0.8" strokeDasharray="3,2"/>
                <line x1="5" y1="65" x2="90" y2="5" stroke="rgb(251,113,133)" strokeWidth="0.8" strokeDasharray="3,2"/>
              </svg>
            </div>
            <p className="text-[10px] text-slate-600 text-center">zona entre líneas punteadas = margen ε · punto rojo brillante = outlier ignorado</p>
          </div>
        }
      />
    ),

    met_cls: (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white mb-1">Métricas de Clasificación</h2>
          <p className="text-sm text-slate-500">Cómo evaluar si tu modelo de clasificación es bueno</p>
        </div>
        <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-4">
          <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">Concepto base: Matriz de Confusión</p>
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div/><div className="text-slate-500 font-bold">Predicho +</div>
            <div className="text-slate-500 font-bold">Real +</div>
            <div className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 p-2 text-emerald-400 font-bold">TP ✅<br/><span className="text-[10px] font-normal text-slate-500">Verdadero Positivo</span></div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-xs mt-0">
            <div/><div className="text-slate-500 font-bold">Predicho −</div>
            <div className="text-slate-500 font-bold">Real −</div>
            <div className="rounded-lg bg-rose-500/20 border border-rose-500/30 p-2 text-rose-400 font-bold">FP ⚠<br/><span className="text-[10px] font-normal text-slate-500">Falso Positivo</span></div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">TP=predijo + y era + · FP=predijo + pero era − · FN=predijo − pero era + · TN=predijo − y era −</p>
        </div>
        <div className="space-y-3">
          <MetricBar label="Accuracy" value={0.85} color="violet" formula="(TP+TN) / Total" desc="Porcentaje de predicciones correctas sobre el total. Es la métrica más intuitiva pero puede ser engañosa con clases desbalanceadas." bueno="Cerca de 1.0 es ideal. En datos balanceados, >0.8 es bueno. Con clases desbalanceadas, prefiere F1-Score." />
          <MetricBar label="Precision" value={0.78} color="blue" formula="TP / (TP+FP)" desc="De todos los casos que el modelo predijo como positivos, ¿cuántos realmente lo eran? Alta precision = pocos falsos positivos." bueno="Importante cuando el costo de un falso positivo es alto (ej: spam filter — no quieres marcar emails legítimos como spam)." />
          <MetricBar label="Recall (Sensibilidad)" value={0.82} color="emerald" formula="TP / (TP+FN)" desc="De todos los casos realmente positivos, ¿cuántos detectó el modelo? Alto recall = pocos falsos negativos." bueno="Crítico cuando no detectar un positivo es muy costoso (ej: diagnóstico médico — no quieres perder un enfermo)." />
          <MetricBar label="F1-Score" value={0.80} color="amber" formula="2 × (P × R) / (P + R)" desc="Media armónica entre Precision y Recall. Equilibra ambas métricas. Es la métrica recomendada cuando las clases están desbalanceadas." bueno="Cerca de 1.0 es ideal. Mejor métrica general para clasificación binaria desbalanceada." />
          <MetricBar label="ROC-AUC" value={0.88} color="violet" formula="Área bajo curva ROC" desc="Mide la capacidad del modelo para discriminar entre clases independientemente del umbral de decisión. 0.5 = adivinar al azar, 1.0 = perfecto." bueno="&gt;0.9 = excelente · 0.8-0.9 = bueno · 0.7-0.8 = aceptable · &lt;0.7 = pobre. En mercados financieros, incluso 0.55 es difícil de lograr." />
        </div>
      </div>
    ),

    met_reg: (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white mb-1">Métricas de Regresión</h2>
          <p className="text-sm text-slate-500">Cómo evaluar si tu modelo de regresión es preciso</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <p className="text-xs font-bold text-emerald-400 mb-2">Concepto base: error = valor_real − valor_predicho</p>
          <div className="relative h-16 bg-black/30 rounded-lg overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
              <line x1="10" y1="50" x2="190" y2="10" stroke="rgb(52,211,153)" strokeWidth="1.5"/>
              {[[30,42,35],[60,25,28],[90,38,22],[130,18,20],[160,12,10]].map(([x,real,pred],i)=>(
                <g key={i}>
                  <circle cx={x} cy={real} r="3" fill="rgb(251,191,36)"/>
                  <circle cx={x} cy={pred} r="2" fill="rgb(52,211,153)" fillOpacity="0.7"/>
                  <line x1={x} y1={real} x2={x} y2={pred} stroke="rgb(251,191,36)" strokeWidth="1" strokeDasharray="2,1"/>
                </g>
              ))}
            </svg>
          </div>
          <div className="flex gap-4 mt-2 text-[10px]"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"/>valor real</span><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"/>predicho</span><span className="flex items-center gap-1"><span className="w-4 border-t border-dashed border-amber-400 inline-block"/>error</span></div>
        </div>
        <div className="space-y-3">
          <MetricBar label="R² — Coeficiente de Determinación" value={0.95} color="emerald" formula="1 − (SS_res / SS_tot)" desc="Qué porcentaje de la variación en los datos explica el modelo. 0 = el modelo no explica nada (como predecir la media siempre). 1 = explicación perfecta." bueno="&gt;0.9 = excelente · 0.7-0.9 = bueno · 0.5-0.7 = moderado · &lt;0.5 = pobre. Un R² muy alto puede indicar overfitting." />
          <MetricBar label="MAE — Error Absoluto Medio" value={0.3} color="blue" formula="Promedio |real − predicho|" desc="Promedio de los errores absolutos. Está en las mismas unidades que el dato original (ej: si predices precios en USD, el MAE estará en USD). Fácil de interpretar." bueno="Depende de la escala del dato. Para precios de acciones de ~$13, un MAE de $0.24 es excelente (~2% de error)." />
          <MetricBar label="RMSE — Raíz del Error Cuadrático Medio" value={0.35} color="amber" formula="√(Promedio (real − predicho)²)" desc="Similar a MAE pero penaliza más los errores grandes (al elevar al cuadrado). Sensible a outliers. En las mismas unidades que el dato original." bueno="Siempre mayor o igual que MAE. Si RMSE >> MAE, indica que hay algunos errores muy grandes. Minimizarlo reduce los errores más graves." />
          <MetricBar label="MSE — Error Cuadrático Medio" value={0.25} color="violet" formula="Promedio (real − predicho)²" desc="Similar a RMSE pero sin la raíz cuadrada, por lo que está en unidades al cuadrado. Útil internamente para optimización pero difícil de interpretar directamente." bueno="RMSE = √MSE. Preferir RMSE para interpretación. MSE es más útil para comparar modelos entre sí matemáticamente." />
          <MetricBar label="MAPE — Error Porcentual Absoluto Medio" value={0.6} color="emerald" formula="Promedio |error / real| × 100" desc="Error expresado como porcentaje del valor real. Muy fácil de comunicar: 'el modelo se equivoca en promedio un X%'. No depende de la escala." bueno="&lt;5% = excelente · 5-10% = bueno · 10-20% = aceptable · &gt;20% = pobre. Cuidado: se dispara si hay valores reales cercanos a cero." />
        </div>
      </div>
    ),
  }

  const allItems = nav.flatMap(g => g.items)
  const currentIdx = allItems.findIndex(i => i.id === activeTopic)

  return (
    <div className="fixed inset-0 z-50 flex bg-[#080B14]/97 backdrop-blur-xl">
      {/* Sidebar */}
      <div className="w-64 shrink-0 border-r border-white/10 bg-black/20 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-lg">❓</span>
            <h2 className="font-black text-white">Centro de Ayuda</h2>
          </div>
          <p className="text-xs text-slate-600 ml-7">Guía de conceptos de ML</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {nav.map(grupo => (
            <div key={grupo.grupo}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-2 mb-1.5 flex items-center gap-1.5">
                <span>{grupo.icon}</span> {grupo.grupo}
              </p>
              <div className="space-y-0.5">
                {grupo.items.map(item => (
                  <button key={item.id} onClick={() => setActiveTopic(item.id)}
                    className={`w-full text-left rounded-xl px-3 py-2 text-xs font-semibold transition-all
                      ${activeTopic === item.id
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                        : 'text-slate-500 hover:bg-white/5 hover:text-white border border-transparent'}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-white/10">
          <button onClick={onClose}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition">
            ✕ Cerrar ayuda
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-8">
          {topics[activeTopic]}
          {/* Navegación anterior / siguiente */}
          <div className="flex justify-between mt-10 pt-6 border-t border-white/10">
            <button
              onClick={() => currentIdx > 0 && setActiveTopic(allItems[currentIdx - 1].id)}
              disabled={currentIdx === 0}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed">
              ← {currentIdx > 0 ? allItems[currentIdx - 1].label : ''}
            </button>
            <span className="text-xs text-slate-700 self-center">{currentIdx + 1} / {allItems.length}</span>
            <button
              onClick={() => currentIdx < allItems.length - 1 && setActiveTopic(allItems[currentIdx + 1].id)}
              disabled={currentIdx === allItems.length - 1}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed">
              {currentIdx < allItems.length - 1 ? allItems[currentIdx + 1].label : ''} →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Manual de Usuario ─────────────────────────────────────────────────────────
function ViewManual({ onClose }) {
  const [activePhase, setActivePhase] = useState(0)

  const phases = [
    {
      num: '01', icon: '📁', title: 'Cargar datos',
      color: 'blue',
      desc: 'El primer paso es cargar el dataset que deseas analizar.',
      steps: [
        'Arrastra tu archivo CSV o Excel al área indicada, o haz clic para seleccionarlo desde tu computador.',
        'También puedes elegir uno de los 3 ejemplos precargados: Vivienda, Crédito o Churn.',
        'El sistema detectará automáticamente las columnas y mostrará una vista previa de los datos.',
      ],
      tip: 'Los archivos deben tener encabezados en la primera fila. Formatos aceptados: .csv, .xlsx, .xls',
    },
    {
      num: '02', icon: '🧹', title: 'Explorar y limpiar',
      color: 'violet',
      desc: 'Revisa la calidad de tus datos y corrígelos antes de entrenar.',
      steps: [
        'Verás un resumen de todas las columnas: nombre, tipo de dato y cantidad de valores vacíos.',
        'Si hay datos vacíos (nulos), puedes elegir cómo manejarlos: eliminar las filas, rellenar con el promedio, la mediana o el valor más frecuente.',
        'Si hay filas duplicadas, puedes eliminarlas con un clic.',
        'Una vez limpios los datos, haz clic en "Continuar".',
      ],
      tip: 'Datos limpios = mejores predicciones. Es importante no saltarse este paso.',
    },
    {
      num: '03', icon: '⚙️', title: 'Configurar modelo',
      color: 'emerald',
      desc: 'Define qué quieres predecir y con qué algoritmo.',
      steps: [
        'Selecciona la Variable Objetivo: la columna que el modelo intentará predecir.',
        'Elige el Tipo de tarea: Clasificación (predice categorías como Sí/No) o Regresión (predice números como precios).',
        'Ajusta la división de datos: qué porcentaje usar para entrenamiento (recomendado 80%) y cuál para prueba (20%).',
        'Selecciona el Algoritmo que deseas usar.',
        'Elige las variables predictoras (por defecto todas excepto la objetivo).',
        'Haz clic en "Entrenar modelo".',
      ],
      tip: 'Si tu variable objetivo tiene valores como 0/1, Sí/No → usa Clasificación. Si tiene valores numéricos continuos como precios → usa Regresión.',
    },
    {
      num: '04', icon: '📊', title: 'Ver resultados',
      color: 'amber',
      desc: 'Analiza qué tan bien aprendió tu modelo.',
      steps: [
        'Verás las métricas de evaluación del modelo según el tipo de tarea.',
        'Para Clasificación: Accuracy, Precision, Recall, F1-Score y ROC-AUC.',
        'Para Regresión: R², MAE, RMSE, MSE y MAPE.',
        'Se mostrarán gráficas: Matriz de Confusión (clasificación) o Dispersión Real vs Predicho (regresión).',
        'También verás la Importancia de Variables: cuáles columnas influyeron más en el modelo.',
      ],
      tip: 'Un R² cercano a 1 en regresión o un Accuracy alto en clasificación indican un buen modelo.',
    },
    {
      num: '05', icon: '🔮', title: 'Hacer predicciones',
      color: 'rose',
      desc: 'Usa el modelo entrenado para predecir nuevos casos.',
      steps: [
        'Ve a la pestaña "Predicción" dentro de Resultados.',
        'Completa el formulario con los valores del caso que deseas predecir.',
        'Las variables categóricas (texto) muestran un menú desplegable con las opciones disponibles.',
        'Las variables numéricas tienen un campo de texto.',
        'Haz clic en "Predecir" y verás el resultado inmediatamente.',
        'Para clasificación también verás la probabilidad de cada clase.',
      ],
      tip: 'Puedes hacer todas las predicciones que necesites sin necesidad de volver a entrenar el modelo.',
    },
  ]

  const models = [
    {
      tipo: 'Clasificación', color: 'violet', icon: '🏷',
      desc: 'Predice a qué categoría pertenece algo (Sí/No, Aprobado/Rechazado, etc.)',
      algoritmos: [
        { name: 'Regresión Logística', use: 'Ideal para empezar. Rápido y fácil de interpretar.' },
        { name: 'Árbol de Decisión', use: 'Muy visual e interpretable. Como un árbol de preguntas.' },
        { name: 'Random Forest', use: 'Muy preciso. Combina muchos árboles de decisión.' },
        { name: 'SVM', use: 'Efectivo con muchas variables. Más complejo.' },
        { name: 'KNN', use: 'Predice basándose en los casos más similares.' },
      ],
    },
    {
      tipo: 'Regresión', color: 'emerald', icon: '📈',
      desc: 'Predice un valor numérico continuo (precio, edad, cantidad, etc.)',
      algoritmos: [
        { name: 'Regresión Lineal', use: 'La más simple. Buena para relaciones directas.' },
        { name: 'Ridge (L2)', use: 'Regresión lineal con control para evitar errores grandes.' },
        { name: 'Lasso (L1)', use: 'También selecciona automáticamente las variables más importantes.' },
        { name: 'Árbol de Decisión', use: 'Captura relaciones complejas entre variables.' },
        { name: 'Random Forest', use: 'El más preciso en general para regresión.' },
        { name: 'SVR', use: 'Robusto ante datos con ruido o valores atípicos.' },
      ],
    },
  ]

  const colorMap = {
    blue:   { border: 'border-blue-500/30',   bg: 'bg-blue-500/10',   text: 'text-blue-300',   num: 'bg-blue-500' },
    violet: { border: 'border-violet-500/30', bg: 'bg-violet-500/10', text: 'text-violet-300', num: 'bg-violet-500' },
    emerald:{ border: 'border-emerald-500/30',bg: 'bg-emerald-500/10',text: 'text-emerald-300',num: 'bg-emerald-500' },
    amber:  { border: 'border-amber-500/30',  bg: 'bg-amber-500/10',  text: 'text-amber-300',  num: 'bg-amber-500' },
    rose:   { border: 'border-rose-500/30',   bg: 'bg-rose-500/10',   text: 'text-rose-300',   num: 'bg-rose-500' },
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#080B14]/95 backdrop-blur-xl">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-white">Manual de <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Usuario</span></h2>
            <p className="text-sm text-slate-500 mt-1">Guía completa para usar la aplicación paso a paso</p>
          </div>
          <button onClick={onClose} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-400 hover:text-white transition">✕ Cerrar</button>
        </div>

        {/* Fases navegables */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Fases de uso</h3>
          <div className="flex gap-2 flex-wrap">
            {phases.map((p, i) => (
              <button key={i} onClick={() => setActivePhase(i)}
                className={`rounded-xl border px-3 py-2 text-xs font-bold transition-all flex items-center gap-1.5
                  ${activePhase === i
                    ? `${colorMap[p.color].border} ${colorMap[p.color].bg} ${colorMap[p.color].text}`
                    : 'border-white/10 bg-white/5 text-slate-500 hover:text-white'}`}>
                <span>{p.icon}</span> {p.num} {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Fase activa */}
        {(() => {
          const p = phases[activePhase]
          const c = colorMap[p.color]
          return (
            <div className={`rounded-2xl border ${c.border} ${c.bg} p-6 mb-6`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.num} text-white font-black text-sm`}>{p.num}</div>
                <div>
                  <p className={`font-black text-lg ${c.text}`}>{p.icon} {p.title}</p>
                  <p className="text-sm text-slate-400">{p.desc}</p>
                </div>
              </div>
              <ol className="space-y-3 mb-4">
                {p.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${c.num} text-white text-xs font-black`}>{i + 1}</span>
                    <p className="text-sm text-slate-300 leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
              <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 flex items-start gap-2">
                <span className="text-amber-400 text-sm shrink-0">💡</span>
                <p className="text-xs text-slate-400">{p.tip}</p>
              </div>
            </div>
          )
        })()}

        {/* Modelos */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Modelos disponibles</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {models.map(m => {
              const c = colorMap[m.color]
              return (
                <div key={m.tipo} className={`rounded-2xl border ${c.border} ${c.bg} p-5`}>
                  <p className={`font-black text-sm mb-1 ${c.text}`}>{m.icon} {m.tipo}</p>
                  <p className="text-xs text-slate-400 mb-3">{m.desc}</p>
                  <div className="space-y-2">
                    {m.algoritmos.map((alg, i) => (
                      <div key={i} className="rounded-lg border border-white/5 bg-black/20 px-3 py-2">
                        <p className="text-xs font-bold text-slate-300">{alg.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{alg.use}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Métricas */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="font-bold text-slate-300 mb-4 flex items-center gap-2"><span>📏</span> Métricas de evaluación</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">Clasificación</p>
              {[
                { name: 'Accuracy',  def: '¿Qué % de predicciones fueron correctas?' },
                { name: 'Precision', def: '¿De los que predijo positivos, cuántos lo eran?' },
                { name: 'Recall',    def: '¿De los positivos reales, cuántos detectó?' },
                { name: 'F1-Score',  def: 'Balance entre Precision y Recall.' },
                { name: 'ROC-AUC',  def: 'Capacidad general de discriminar entre clases.' },
              ].map(m => (
                <div key={m.name} className="flex gap-2 py-1.5 border-b border-white/5">
                  <span className="text-xs font-bold text-slate-300 w-20 shrink-0">{m.name}</span>
                  <span className="text-xs text-slate-500">{m.def}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Regresión</p>
              {[
                { name: 'R²',   def: '¿Qué % de la variación explica el modelo? (0 a 1)' },
                { name: 'MAE',  def: 'Error promedio en las mismas unidades del dato.' },
                { name: 'RMSE', def: 'Error cuadrático. Penaliza errores grandes.' },
                { name: 'MSE',  def: 'Error cuadrático medio (sin raíz).' },
                { name: 'MAPE', def: 'Error en porcentaje. Fácil de interpretar.' },
              ].map(m => (
                <div key={m.name} className="flex gap-2 py-1.5 border-b border-white/5">
                  <span className="text-xs font-bold text-slate-300 w-20 shrink-0">{m.name}</span>
                  <span className="text-xs text-slate-500">{m.def}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

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
    task: 'Regresión', rows: 1000,
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
  const [showArq, setShowArq]       = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [showAyuda, setShowAyuda]   = useState(false)
  const [loadedDemo, setLoadedDemo] = useState(null)
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
    setStep(1); setDataInfo(null); setTrainResults(null); setLoadedDemo(null)
    setTarget(''); setAlgorithm(''); setPredResult(null); setError(''); setSuccessMsg('')
  }

  const loadDemo = async (id) => {
    setLoading(true); setError('')
    try { const { data } = await axios.get(`${API}/demo/${id}`); applyDataInfo(data); setLoadedDemo(id) }
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
      {showArq    && <ViewArquitectura onClose={() => setShowArq(false)} />}
      {showManual && <ViewManual       onClose={() => setShowManual(false)} />}
      {showAyuda  && <ViewAyuda        onClose={() => setShowAyuda(false)} />}
      {/* Grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      {/* Ambient glow orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      {/* ── Header ── */}
      <header className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30 overflow-hidden">
            <svg viewBox="0 0 28 28" className="w-7 h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
              {[[5,7,13,10],[5,7,13,18],[5,14,13,10],[5,14,13,18],[5,21,13,10],[5,21,13,18]].map(([x1,y1,x2,y2],i)=>(
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="0.8" strokeOpacity="0.45"/>
              ))}
              {[[13,10,23,14],[13,18,23,14]].map(([x1,y1,x2,y2],i)=>(
                <line key={`o${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="0.8" strokeOpacity="0.45"/>
              ))}
              {[7,14,21].map(y=><circle key={y} cx="5" cy={y} r="2.2" fill="white" fillOpacity="0.8"/>)}
              {[10,18].map(y=><circle key={y} cx="13" cy={y} r="2.5" fill="white"/>)}
              <circle cx="23" cy="14" r="3" fill="white"/>
              <circle cx="23" cy="14" r="1.5" fill="#3B82F6"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight">
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">IA Predict</span> · Grupo FDS 674
            </h1>
            <p className="text-xs text-slate-600">Proyecto Final Inteligencia Artificial · Unisabaneta</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setShowArq(true)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition">
              🏗 Arquitectura
            </button>
            <button onClick={() => setShowManual(true)}
              className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 hover:bg-violet-500/20 transition">
              📖 Manual
            </button>
            <button onClick={() => setShowAyuda(true)}
              className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 transition">
              ❓ Ayuda
            </button>
            {dataInfo && (
              <button onClick={resetAll}
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/20 transition">
                🔄 Reiniciar
              </button>
            )}
          </div>
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
              <p className="mt-2 text-slate-500">Sube tu archivo o elige un ejemplo con datos reales</p>
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
              <div className="flex items-center gap-2">
                {loadedDemo && (
                  <a
                    href={`${API}/demo/${loadedDemo}/download`}
                    download
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 transition">
                    ⬇ Descargar Excel
                  </a>
                )}
                <Btn onClick={() => setStep(3)}>Continuar →</Btn>
              </div>
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
              <h3 className="font-bold text-slate-300 mb-4 flex items-center gap-2"><span>👁</span> Vista previa — últimas 10 filas</h3>
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
        © 2026 Proyecto Final Inteligencia Artificial - Unisabaneta · Ivonne Díaz · Christian Buitrago · Miguel Guerrero
      </footer>
    </div>
  )
}
