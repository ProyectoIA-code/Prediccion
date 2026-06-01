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
4. Ver resultados + hacer predicciones (tab Predicción primero, luego Métricas)

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
- `ViewArquitectura` — modal con diagrama del sistema
- `ViewManual` — modal con guía de usuario por fases (5 fases navegables)
- `ViewAyuda` — modal con Centro de Ayuda (sidebar + contenido visual por tema)

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
- Botones **🏗 Arquitectura · 📖 Manual · ❓ Ayuda** en el header (en ese orden)
- Botón **🔄 Reiniciar** visible en el header (aparece cuando hay datos cargados)
- Botón **⬇ Descargar Excel** en Step 2 (aparece solo al cargar un demo)
- Ícono SVG de red neuronal en header (gradiente azul→violeta)
- Favicon SVG de red neuronal (igual al header)
- Título de pestaña: **"IA Predict · Grupo FDS 674"**
- Footer con copyright © 2026 · Ivonne Díaz · Christian Buitrago · Miguel Guerrero

### Backend
- **Framework:** FastAPI (Python)
- **ML:** scikit-learn
- **Datos:** pandas, numpy
- **Gráficas:** matplotlib, seaborn
- **Serialización:** pickle (base64) — para enviar el modelo al frontend
- **Archivos:** python-multipart, openpyxl, xlrd

**Arquitectura STATELESS (crítico):**
El backend NO guarda ningún estado entre requests. Cada operación recibe los datos completos:
- `/clean` recibe los `records` + opciones → devuelve datos limpios
- `/train` recibe los `records` + config → devuelve métricas + gráficas + **modelo serializado en base64**
- `/predict` recibe el `model_state` (modelo serializado) + valores → devuelve predicción

El modelo viaja siempre en el frontend (estado React). Si Render se reinicia, no importa.

**Endpoints:**
| Método | Ruta | Función |
|--------|------|---------|
| GET | `/` | Health check |
| GET | `/demos` | Lista demos disponibles |
| GET | `/demo/{nombre}` | Carga un demo — devuelve TODOS los records |
| GET | `/demo/{nombre}/download` | Descarga el demo como Excel |
| POST | `/upload` | Sube CSV o Excel — devuelve TODOS los records |
| POST | `/clean` | Limpia datos (recibe records, devuelve records limpios) |
| POST | `/train` | Entrena modelo — recibe records + config, devuelve model_state + métricas |
| POST | `/predict` | Predice — recibe model_state + valores |

**Estructura de requests clave:**

```python
# /clean
{ "records": [...], "columnas": [...], "opciones": {"eliminar_duplicados": bool, "estrategia_nulos": str} }

# /train
{ "records": [...], "columnas": [...], "target": str, "task_type": str, "algorithm": str, "test_size": float, "features": [...] }

# /predict
{ "model_state": { "model_b64": str, "le_b64": str, "scaler_b64": str|null, "feature_columns": [...], "task_type": str, "algorithm": str }, "valores": {...} }
```

**Demos precargados (datos colombianos en COP):**
1. `vivienda` — **1000 filas**, regresión, predice `precio_millones_cop`
   - 13 columnas: tipo_inmueble, ciudad, zona, estrato, area_m2, habitaciones, banos, piso, parqueaderos, cuarto_util, conjunto_cerrado, antiguedad_anos, precio_millones_cop
   - Precios reales 2026: Bogotá 8.2M/m² · Medellín 6.5M/m² · Cartagena 6.0M/m² · Cali 4.8M/m² · Barranquilla 4.3M/m²
   - Ejemplo: apartamento 60m² estrato 4 Medellín → ~320–390 M COP
2. `credito` — 300 filas, clasificación, predice `aprobado` (0/1)
3. `churn` — 300 filas, clasificación, predice `churn` (0/1)

**Algoritmos disponibles:**

Clasificación:
- `regresion_logistica` → LogisticRegression(max_iter=1000)
- `arbol_decision_cls` → DecisionTreeClassifier(max_depth=10)
- `random_forest_cls` → RandomForestClassifier(n_estimators=30, max_depth=8) ← reducido para RAM
- `svm` → SVC(probability=True)
- `knn` → KNeighborsClassifier(n_neighbors=5)

Regresión:
- `regresion_lineal` → LinearRegression
- `ridge` → Ridge(alpha=1.0)
- `lasso` → Lasso(alpha=1.0, max_iter=5000)
- `arbol_decision_reg` → DecisionTreeRegressor(max_depth=10)
- `random_forest_reg` → RandomForestRegressor(n_estimators=30, max_depth=8) ← reducido para RAM
- `svr` → SVR(kernel='rbf')

**NEEDS_SCALING** = {'regresion_logistica', 'svm', 'knn', 'svr'} → aplica StandardScaler, serializado en model_state

**Métricas calculadas:**
- Clasificación: accuracy, precision, recall, f1_score, roc_auc (si binario)
- Regresión: mae, mse, rmse, r2, mape

**Gráficas generadas (base64 PNG, dpi=90):**
- Clasificación: matriz de confusión (seaborn heatmap)
- Regresión: scatter real vs predicho
- Ambos: importancia de variables o coeficientes

### Módulo de Ayuda (ViewAyuda)
Modal con sidebar de navegación izquierda. 13 temas navegables:
- **Conceptos base:** Tipos de tarea (Clasificación vs Regresión)
- **Algoritmos Clasificación:** Regresión Logística · Árbol de Decisión · Random Forest · SVM · KNN
- **Algoritmos Regresión:** Lineal · Ridge · Lasso · Árbol · Random Forest · SVR
- **Métricas:** Clasificación (Accuracy, Precision, Recall, F1, ROC-AUC) · Regresión (R², MAE, RMSE, MSE, MAPE)
- Cada tema tiene: descripción, gráfica CSS visual, cuándo usarlo, ventajas/limitaciones
- Navegación anterior/siguiente con contador de posición

### Infraestructura / Deploy

| Componente | Plataforma | URL |
|------------|-----------|-----|
| Frontend | **Vercel** (Hobby/Free) | https://prediccion-roan.vercel.app |
| Backend | **Render** (Free) | https://ml-studio-backend-it5p.onrender.com |
| Código | **GitHub** | https://github.com/ProyectoIA-code/Prediccion |

**Deploy automático:** cada `git push` a `main` actualiza Vercel (~30s) y Render (~2min) automáticamente.

### Estructura de archivos

```
C:\Users\Asus\Claro drive\Proyecto\
├── .gitignore
├── CONTEXTO_PROYECTO.md               ← este archivo
├── Docs/
│   ├── IA_Predict_Documento_Final.docx  ← documento Word del proyecto
│   └── IA_Predict_Seccion_5_2.docx      ← sección 5.2 con código fuente
└── Prediccion/
    ├── backend/
    │   ├── main.py                    ← TODO el backend FastAPI (stateless)
    │   ├── requirements.txt
    │   └── .gitignore
    └── frontend/
        ├── index.html                 ← título + favicon SVG red neuronal
        ├── package.json
        ├── vite.config.js
        ├── tailwind.config.js
        ├── postcss.config.js
        ├── .gitignore
        └── src/
            ├── App.jsx                ← TODO el frontend React (~1800 líneas)
            ├── main.jsx
            └── index.css
```

### Documentos Word generados
- `C:\Users\Asus\Claro drive\Proyecto\Docs\IA_Predict_Documento_Final.docx`
  - Portada, Introducción, Justificación, Objetivo General, Objetivos Específicos, Desarrollo (5.1 Arquitectura), Conclusiones, Resultados Clave
- `C:\Users\Asus\Claro drive\Proyecto\Docs\IA_Predict_Seccion_5_2.docx`
  - Sección 5.2: Código fuente completo organizado por componente (backend y frontend)
- Script generador: skill docx en `...skills/docx/ia_predict.js` y `add_codigo.js`
  - Requiere Node.js (instalado con winget en esta sesión) y el paquete `docx` (npm install)

### Dataset NuBank preparado
- **Limpio:** `C:\Users\Asus\Downloads\NuBank_LIMPIO.xlsx` y `.csv`
  - 1119 filas · 11 columnas · datos 2021-12-10 a 2026-05-28
  - Columnas: fecha, apertura, maximo, minimo, cierre, volumen_millones, rango_dia, variacion_pct, cierre_anterior, cierre_manana, sube_manana
  - Para **regresión**: objetivo = `cierre_manana`, excluir `fecha` y `sube_manana`
  - Para **clasificación**: objetivo = `sube_manana`, excluir `fecha` y `cierre_manana`
  - El backend ignora automáticamente columnas datetime → no hay error aunque `fecha` quede seleccionada

---

## 3. PROBLEMAS RESUELTOS EN ESTA SESIÓN

| Problema | Causa | Solución |
|----------|-------|----------|
| ⚠ Network Error general | Backend caído por imports duplicados (`JSONResponse` importado 2 veces) | Unificar todos los imports de fastapi al inicio del archivo |
| `module 'joblib' has no attribute 'dumps'` | `joblib` no tiene `dumps/loads` (son de `pickle`) | Reemplazar `joblib` por `pickle` en serialización del modelo |
| Backend devuelve 503 | Crash en startup por imports duplicados | Fix de imports + redespliegue |
| Columnas `datetime64` rompen el entrenamiento | sklearn no puede convertir Timestamp a float | Backend elimina automáticamente columnas datetime de las features |

---

## 4. ESTADO ACTUAL

### ✅ Todo funcionando
- Arquitectura **stateless** — datos y modelo viajan en cada request desde el browser
- Los 3 demos cargan y entrenan correctamente
- Demo vivienda: 1000 filas con precios reales 2026
- Todos los algoritmos de clasificación y regresión
- Métricas y gráficas se muestran correctamente
- Tab **Predicción** aparece primero (luego Métricas)
- Predicción con formulario dinámico (dropdowns para categóricas)
- Módulo de Ayuda con 13 temas y gráficas CSS visuales
- Botón ⬇ Descargar Excel funciona para todos los demos
- Botón 🔄 Reiniciar visible en header
- Ícono y favicon de red neuronal (azul→violeta)
- Deploy automático GitHub → Vercel + Render
- Dataset NuBank probado: R²=0.9933 (regresión), Accuracy=51.3% (clasificación — esperado por mercados eficientes)

### ⚠ Limitaciones conocidas
- **Render Free se duerme** tras 15 minutos sin uso → primer request tarda 30-60 segundos (abrir la URL del backend antes de presentar)
- **Random Forest reducido** a 30 árboles y max_depth=8 para caber en la RAM gratuita de Render
- El modelo serializado (pickle base64) puede ser grande para modelos complejos, pero funciona bien en la práctica

### 📋 Pendiente
- Nada crítico — el proyecto está completo y funcional para la presentación

---

## 5. CÓMO CONTINUAR EN OTRO CHAT

### Instrucciones para el nuevo chat
1. **Leer este archivo primero**
2. Decirle a Claude: *"Estoy continuando el proyecto IA Predict para Unisabaneta. El contexto está en C:\Users\Asus\Claro drive\Proyecto\CONTEXTO_PROYECTO.md"*
3. El directorio de trabajo es: `C:\Users\Asus\Claro drive\Proyecto`

### Archivos más importantes
| Archivo | Por qué es crítico |
|---------|-------------------|
| `Prediccion/frontend/src/App.jsx` | Todo el frontend React (~1800 líneas) |
| `Prediccion/backend/main.py` | Todo el backend FastAPI stateless |
| `C:\Users\Asus\Downloads\NuBank_LIMPIO.xlsx` | Dataset listo para usar |

### Primeros pasos recomendados en nuevo chat
1. `git log --oneline -5` para ver el estado del repo
2. Verificar backend: `curl https://ml-studio-backend-it5p.onrender.com/`
3. Si hay problemas, revisar imports en `main.py` (todo debe estar al inicio del archivo)

### Comandos útiles
```powershell
cd "C:\Users\Asus\Claro drive\Proyecto"
git log --oneline -10
git add .
git commit -m "descripción"
git push
```

### Para generar documentos Word
```powershell
# Node.js instalado en C:\Program Files\nodejs\node.exe
$env:PATH = [System.Environment]::GetEnvironmentVariable('PATH','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('PATH','User')
Set-Location "C:\Users\Asus\AppData\Roaming\Claude\local-agent-mode-sessions\skills-plugin\99448349-95c3-4ab0-b4c1-cb858bf9beea\0832b756-5cb7-4d4d-be72-242c0ae736db\skills\docx"
& "C:\Program Files\nodejs\node.exe" ia_predict.js
```

---

## 6. CÓDIGO CLAVE

### URL del backend (hardcodeada en App.jsx)
```javascript
const API = 'https://ml-studio-backend-it5p.onrender.com'
```

### Arquitectura stateless — cómo fluyen los datos
```
Browser                          Render (Backend)
  │                                    │
  ├─ GET /demo/vivienda ──────────────>│ genera 1000 filas
  │<──────────── { records: [...] } ───┤ devuelve TODO
  │                                    │
  ├─ POST /clean { records, opciones }─>│ limpia en memoria
  │<──────────── { records: [...] } ───┤ devuelve limpios
  │                                    │
  ├─ POST /train { records, config } ──>│ entrena modelo
  │<── { model_state: {model_b64,..} }─┤ devuelve modelo serializado
  │  (guarda model_state en useState)  │
  │                                    │
  ├─ POST /predict { model_state, val }─>│ deserializa + predice
  │<──────────── { prediccion: ... } ──┤
```

### Serialización del modelo (pickle + base64)
```python
# En /train — serializar para enviar al frontend
model_b64  = base64.b64encode(pickle.dumps(model)).decode()
le_b64     = base64.b64encode(pickle.dumps(label_encoders)).decode()
scaler_b64 = base64.b64encode(pickle.dumps(scaler)).decode() if scaler else None

# En /predict — deserializar lo que envió el frontend
model          = pickle.loads(base64.b64decode(ms['model_b64']))
label_encoders = pickle.loads(base64.b64decode(ms['le_b64']))
scaler         = pickle.loads(base64.b64decode(ms['scaler_b64'])) if ms.get('scaler_b64') else None
```

### CORS — configuración crítica
```python
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=False, allow_methods=['*'], allow_headers=['*'])
# allow_credentials DEBE ser False cuando allow_origins=['*']
```

### Commits importantes de esta sesión
```
64f14ce  feat: vivienda 1000 filas precios reales 2026 + endpoint descarga Excel
483c2df  feat: tab Predicción primero y activo por defecto al llegar a resultados
faccc36  fix: reemplazar joblib.dumps/loads por pickle.dumps/loads
0edc697  feat: backend stateless - datos viajan en cada request, modelo serializado en frontend
056bbdd  feat: favicon red neuronal + orden botones Arquitectura · Manual · Ayuda
c9f46eb  feat: logo header reemplazado por ícono SVG de red neuronal (azul-violeta)
a62ed28  feat: título IA Predict · Grupo FDS 674 y favicon azul rey con sombra
b78487b  feat: módulo de Ayuda con navegación lateral y contenido visual por algoritmo y métricas
96fbe9d  fix: ignorar columnas datetime en entrenamiento (Timestamp no convertible a float)
```

---

*Archivo actualizado el 2026-06-01 al finalizar sesión de desarrollo.*
