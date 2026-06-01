# CONTEXTO_PROYECTO.md
> Generado al final de sesión para continuar en un nuevo chat de Claude Code.

---

## 1. RESUMEN DEL PROYECTO

### Nombre
**IA Predict · Grupo FDS 674**

### Objetivo
Aplicación web de Machine Learning que permite a cualquier usuario (sin conocimientos técnicos) cargar un dataset, aplicar algoritmos de clasificación o regresión, ver métricas de evaluación, gráficas y hacer predicciones con nuevos datos.

### Para qué clase
- **Materia:** Inteligencia Artificial
- **Institución:** Unisabaneta
- **Grupo:** FDS 674
- **Integrantes:** Ivonne Díaz · Christian Buitrago · Miguel Guerrero
- **Tipo:** Proyecto Final

### Tipo de página
Single Page Application (SPA) con wizard de 4 pasos:
1. Cargar datos (CSV/Excel o demo precargado)
2. Explorar y limpiar datos
3. Configurar y entrenar modelo ML
4. Ver resultados + hacer predicciones

---

## 2. LO QUE SE CONSTRUYÓ

### Frontend
- **Framework:** React 18 + Vite
- **Estilos:** Tailwind CSS (dark theme, glassmorphism, gradientes violeta/índigo)
- **HTTP:** Axios
- **Diseño:** Tema oscuro `#080B14`, fondo con cuadrícula tech, orbes de luz ambiental, tarjetas con `backdrop-blur`

**Componentes principales en `App.jsx`:**
- `Spinner` — animación de carga doble
- `Alert` — mensajes info/success/warning/error
- `Card` — tarjeta glassmorphism
- `Metric` — tarjeta de métrica con gradiente
- `Btn` — botón con variantes primary/secondary/success
- `StepBar` — indicador de pasos con glow
- `DataTable` — tabla de vista previa con scroll horizontal
- `ViewArquitectura` — modal pantalla completa con diagrama del sistema
- `ViewManual` — modal con guía de usuario por fases (5 fases navegables)

**Funcionalidades del frontend:**
- Drag & drop de archivos CSV/Excel
- 3 tarjetas demo precargadas con gradientes de color
- Tabla de columnas con conteo de nulos
- Opciones de limpieza de datos
- Selector de variable objetivo con detección de tipo
- Toggle Clasificación / Regresión
- Slider de división train/test
- Checkboxes de selección de features
- Visualización de métricas con tarjetas de gradiente
- Gráficas como imágenes base64 (desde backend)
- Formulario de predicción dinámico con dropdowns para categóricas
- Barra de probabilidades animada para clasificación
- Botones "🏗 Arquitectura" y "📖 Manual" en el header
- Footer con copyright © 2026

### Backend
- **Framework:** FastAPI (Python)
- **ML:** scikit-learn
- **Datos:** pandas, numpy
- **Gráficas:** matplotlib, seaborn
- **Archivos:** python-multipart, openpyxl, xlrd

**Endpoints:**
| Método | Ruta | Función |
|--------|------|---------|
| GET | `/` | Health check |
| GET | `/demos` | Lista demos disponibles |
| GET | `/demo/{nombre}` | Carga un demo (vivienda/credito/churn) |
| POST | `/upload` | Sube CSV o Excel |
| POST | `/clean` | Limpia datos (nulos, duplicados) |
| POST | `/train` | Entrena modelo ML |
| POST | `/predict` | Hace predicción con modelo entrenado |

**Demos precargados (datos colombianos en COP):**
1. `vivienda` — 300 filas, regresión, predice `precio_millones_cop`
2. `credito` — 300 filas, clasificación, predice `aprobado` (0/1)
3. `churn` — 300 filas, clasificación, predice `churn` (0/1)

**Algoritmos disponibles:**

Clasificación:
- `regresion_logistica` → LogisticRegression
- `arbol_decision_cls` → DecisionTreeClassifier
- `random_forest_cls` → RandomForestClassifier
- `svm` → SVC(probability=True)
- `knn` → KNeighborsClassifier

Regresión:
- `regresion_lineal` → LinearRegression
- `ridge` → Ridge
- `lasso` → Lasso
- `arbol_decision_reg` → DecisionTreeRegressor
- `random_forest_reg` → RandomForestRegressor
- `svr` → SVR

**Métricas calculadas:**
- Clasificación: accuracy, precision, recall, f1_score, roc_auc (si binario)
- Regresión: mae, mse, rmse, r2, mape

**Gráficas generadas (base64 PNG):**
- Clasificación: matriz de confusión (seaborn heatmap)
- Regresión: scatter real vs predicho
- Ambos: importancia de variables o coeficientes

### Infraestructura / Deploy

| Componente | Plataforma | URL |
|------------|-----------|-----|
| Frontend | **Vercel** (Hobby/Free) | https://prediccion-roan.vercel.app |
| Backend | **Render** (Free) | https://ml-studio-backend-it5p.onrender.com |
| Código | **GitHub** | https://github.com/ProyectoIA-code/Prediccion |

**Deploy automático:** cada `git push` a `main` actualiza Vercel automáticamente. Render también redespliega automáticamente al detectar cambios en `/Prediccion/backend/`.

### Estructura de archivos

```
C:\Users\Asus\Claro drive\Proyecto\
├── .gitignore                          ← gitignore raíz
├── CONTEXTO_PROYECTO.md               ← este archivo
└── Prediccion/
    ├── backend/
    │   ├── main.py                    ← TODO el backend FastAPI
    │   ├── requirements.txt           ← dependencias Python
    │   └── .gitignore
    └── frontend/
        ├── index.html
        ├── package.json
        ├── vite.config.js
        ├── tailwind.config.js
        ├── postcss.config.js
        ├── .gitignore
        ├── .env.example               ← VITE_API_URL=http://localhost:8000
        └── src/
            ├── App.jsx                ← TODO el frontend React
            ├── main.jsx
            └── index.css
```

### Dataset NuBank preparado
- **Original:** `C:\Users\Asus\Downloads\HistoricoNuBank.xlsx`
  - Descargado de Yahoo Finance (ticker: NU)
  - 1121 filas, columnas: Date, Close, High, Low, Open, Volume, Sube_Baja
  - Problema: decimales con coma (formato colombiano), columna Sube_Baja vacía

- **Limpio:** `C:\Users\Asus\Downloads\NuBank_LIMPIO.xlsx` y `.csv`
  - 1119 filas · 11 columnas · datos 2021-12-10 a 2026-05-28
  - Columnas: fecha, apertura, maximo, minimo, cierre, volumen_millones, rango_dia, variacion_pct, cierre_anterior, cierre_manana, sube_manana
  - Para **regresión**: variable objetivo = `cierre_manana`
  - Para **clasificación**: variable objetivo = `sube_manana` (571 suben / 548 bajan)
  - **IMPORTANTE al usar:** excluir `fecha`, `cierre_manana` y `sube_manana` según la tarea

---

## 3. LO QUE SE HABLÓ

### Decisiones de arquitectura
- **Monorepo** en vez de 2 repos separados → más simple para proyecto de clase, un solo link para entregar
- **Render + Vercel** en vez de otras opciones → ambos gratis, sin tarjeta de crédito
- **Datos en memoria** (sin base de datos) → suficiente para proyecto de clase, simplifica todo
- **Dark theme** con glassmorphism → pedido explícito del usuario por diseño "moderno, tecnológico, elegante"
- **URL del backend hardcodeada** en `App.jsx` → la variable de entorno `VITE_API_URL` en Vercel nunca guardó el valor correctamente

### Problemas resueltos

| Problema | Causa | Solución |
|----------|-------|----------|
| `git push` con error 403 | Credenciales de otro usuario (`kristeb-trader`) | `git remote set-url origin https://ProyectoIA-code@github.com/...` |
| ⚠ Network Error al cargar Excel | Error 500 en backend, no CORS | Sanitizar JSON: fechas `Timestamp` → string, `NaN` → None, tipos numpy → nativos |
| Variable `VITE_API_URL` vacía en Vercel | No se guardó al configurar | Hardcodear URL directamente en `App.jsx` línea 4 |
| Decimales mal en NuBank | Archivo usa coma decimal (formato colombiano) | Leer con `.Value2` de Excel COM (valor numérico real) en vez de `.Text` |
| Backend dormido (Render Free) | Plan gratuito apaga servidor tras 15 min inactividad | Abrir URL del backend antes de presentar para "despertarlo" |

### Cambios y modificaciones
1. Diseño inicial (tema claro) → **rediseño completo dark theme** con glassmorphism
2. Footer: "Trabajo de clase" → "Proyecto Final Inteligencia Artificial - Unisabaneta"
3. Footer: año 2025 → **2026**
4. Footer: añadido copyright con **3 nombres del grupo**
5. Header: "ML Studio · Análisis predictivo · Datos Colombia" → **"IA Predict · Grupo FDS 674"**
6. Subtítulo header: → **"Proyecto Final Inteligencia Artificial · Unisabaneta"**
7. Texto Step 1: quitado "de Colombia"
8. Vista previa: primeras 10 filas → **últimas 10 filas**
9. Añadidos botones **🏗 Arquitectura** y **📖 Manual** en el header
10. Backend: `allow_credentials=True` → `False` (necesario con `allow_origins=['*']`)
11. Backend: añadido `global_exception_handler` para que errores 500 siempre incluyan headers CORS

---

## 4. ESTADO ACTUAL

### ✅ Funcionando bien
- Los 3 demos (vivienda, crédito, churn) cargan y entrenan correctamente
- Todos los algoritmos de clasificación y regresión
- Métricas y gráficas se muestran correctamente
- Predicción con formulario dinámico (dropdowns para categóricas)
- Arquitectura y Manual de usuario (modales)
- Deploy automático GitHub → Vercel
- Dataset NuBank limpio y listo para usar

### ⚠ Incompleto o con bugs
- **Carga de Excel con decimales coma** (formato colombiano): el backend con el fix debe estar ya activo en Render (commit `7ddf662`), pero no se pudo verificar porque Render tarda en redesplegar. **Pendiente confirmar que funciona con `NuBank_LIMPIO.xlsx`**
- **Render Free se duerme** tras 15 minutos sin uso → primer request tarda 30-60 segundos
- La **columna `fecha`** en el dataset NuBank se carga como texto (string) — si el modelo la incluye como feature, no le aportará valor. El usuario debe deseleccionarla.

### 📋 Falta por hacer
- Verificar que la carga del Excel NuBank funciona correctamente tras el fix del backend
- Posiblemente agregar instrucción en la UI para excluir columna `fecha` al usar NuBank
- El usuario quería probar el modelo con sus acciones de NuBank — **pendiente hacer esa prueba**

---

## 5. CÓMO CONTINUAR EN OTRO CHAT

### Instrucciones para el nuevo chat

1. **Leer este archivo primero** y compartirlo al inicio de la sesión
2. Decirle a Claude: *"Estoy continuando el proyecto IA Predict para Unisabaneta. Lee el archivo CONTEXTO_PROYECTO.md"*
3. El directorio de trabajo es: `C:\Users\Asus\Claro drive\Proyecto`

### Archivos más importantes
| Archivo | Por qué es crítico |
|---------|-------------------|
| `Prediccion/frontend/src/App.jsx` | Todo el frontend React (700+ líneas) |
| `Prediccion/backend/main.py` | Todo el backend FastAPI + ML (500+ líneas) |
| `C:\Users\Asus\Downloads\NuBank_LIMPIO.xlsx` | Dataset listo para la prueba de NuBank |

### Primeros pasos recomendados en nuevo chat
1. Verificar que el backend de Render tiene el último deploy (abrir https://ml-studio-backend-it5p.onrender.com)
2. Probar subir `NuBank_LIMPIO.xlsx` a https://prediccion-roan.vercel.app
3. Si sigue fallando la carga, revisar logs de Render para ver el error exacto
4. Usar `git log --oneline` para ver el estado del repo

### Comandos útiles
```powershell
# Ver estado del repo
cd "C:\Users\Asus\Claro drive\Proyecto"
git log --oneline -10

# Subir cambios
git add .
git commit -m "descripción"
git push

# Ver archivos del proyecto
Get-ChildItem -Recurse -Depth 3 Prediccion | Select-Object FullName
```

---

## 6. CÓDIGO CLAVE

### URL del backend (hardcodeada — no cambiar sin actualizar Vercel también)
```javascript
// Prediccion/frontend/src/App.jsx línea 4
const API = 'https://ml-studio-backend-it5p.onrender.com'
```

### Sanitizador JSON del backend (crítico para archivos reales como NuBank)
```python
# Prediccion/backend/main.py
def _json_safe(val):
    """Convierte cualquier valor de pandas/numpy a tipo serializable en JSON."""
    if val is None or (isinstance(val, float) and np.isnan(val)):
        return None
    if isinstance(val, (np.integer,)):
        return int(val)
    if isinstance(val, (np.floating,)):
        return None if np.isnan(val) else float(val)
    if isinstance(val, (pd.Timestamp,)):
        return val.strftime('%Y-%m-%d')
    try:
        if pd.isna(val):
            return None
    except (ValueError, TypeError):
        pass
    return str(val) if not isinstance(val, (int, float, bool, str)) else val
```

### Generadores de datos demo (Colombia/COP)
```python
# Prediccion/backend/main.py
# gen_vivienda() → 300 filas, ciudades colombianas, estratos 1-6, precios en millones COP
# gen_credito()  → 300 filas, ingresos en COP, score crediticio, aprobación
# gen_churn()    → 300 filas, neobank colombiano, saldo en COP, deserción
```

### Algoritmos que requieren escalado (StandardScaler)
```python
NEEDS_SCALING = {'regresion_logistica', 'svm', 'knn', 'svr'}
# Si el algoritmo está en este set, se aplica StandardScaler antes de entrenar
# El scaler se guarda en memoria para usarlo también en predicción
```

### CORS — configuración crítica
```python
# allow_credentials DEBE ser False cuando allow_origins=['*']
# Si se pone True con '*', FastAPI lanza error en algunos contextos
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=False,   # ← IMPORTANTE: False, no True
    allow_methods=['*'],
    allow_headers=['*'],
)
```

### Manejador global de errores (asegura headers CORS en errores 500)
```python
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={'detail': f'Error interno: {exc}'},
        headers={'Access-Control-Allow-Origin': '*'},
    )
```

### Cómo usar el dataset NuBank en la app
```
Archivo: C:\Users\Asus\Downloads\NuBank_LIMPIO.xlsx
Columnas: fecha, apertura, maximo, minimo, cierre, volumen_millones,
          rango_dia, variacion_pct, cierre_anterior, cierre_manana, sube_manana

Para CLASIFICACIÓN (¿subirá mañana?):
  - Variable objetivo: sube_manana
  - Excluir de features: fecha, cierre_manana
  - Algoritmo recomendado: Random Forest
  - Balance: 571 suben / 548 bajan (bien balanceado)

Para REGRESIÓN (¿cuánto valdrá mañana?):
  - Variable objetivo: cierre_manana
  - Excluir de features: fecha, sube_manana
  - Algoritmo recomendado: Random Forest o Regresión Lineal
```

### Commits importantes del proyecto
```
11601a7  feat: vista previa muestra últimas 10 filas
7ddf662  fix: sanear datos JSON (NaN, fechas, numpy) y CORS en errores 500  ← FIX CRÍTICO
49852e7  feat: agregar Arquitectura y Manual de Usuario
77dbc67  fix: hardcode URL backend para evitar error CORS
c015a85  fix: año copyright 2026
4d6879a  update: quitar 'de Colombia' y agregar copyright integrantes
59bfdb3  update: nombre app IA Predict Grupo FDS 674 Unisabaneta
202ce1a  redesign: dark theme premium con glassmorphism y gradientes
64db6c0  Initial commit: ML Studio - backend FastAPI + frontend React
```

---

*Archivo generado el 2026-05-31 al finalizar sesión de desarrollo.*
