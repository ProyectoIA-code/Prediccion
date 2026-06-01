import io
import base64
import pickle
import warnings
from typing import Any, Dict, List, Optional

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import Lasso, LinearRegression, LogisticRegression, Ridge
from sklearn.metrics import (
    accuracy_score, confusion_matrix, f1_score, mean_absolute_error,
    mean_squared_error, precision_score, r2_score, recall_score, roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.svm import SVC, SVR
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor

warnings.filterwarnings('ignore')

app = FastAPI(title='IA Predict · Grupo FDS 674', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=False,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={'detail': f'Error interno: {exc}'},
        headers={'Access-Control-Allow-Origin': '*'},
    )


# ── Demo data generators ──────────────────────────────────────────────────────

def gen_vivienda() -> pd.DataFrame:
    """
    Dataset vivienda Colombia 2026 — 1000 registros con precios realistas.
    Referencia: apartamento 60 m² estrato 4 Medellín ≈ 320–400 M COP.
    Precio base/m² 2026 (M COP): Bogotá 8.2 · Medellín 6.5 · Cartagena 6.0 · Cali 4.8 · Barranquilla 4.3
    """
    rng = np.random.default_rng(42)
    n = 1000

    ciudades = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena']
    ciudad   = rng.choice(ciudades, n, p=[0.35, 0.28, 0.18, 0.11, 0.08])
    estrato  = rng.choice([1,2,3,4,5,6], n, p=[0.08,0.17,0.30,0.25,0.14,0.06])

    tipo_inmueble = np.where(
        estrato <= 3,
        rng.choice(['Apartamento','Casa'], n, p=[0.52, 0.48]),
        rng.choice(['Apartamento','Casa'], n, p=[0.78, 0.22]),
    )
    area         = np.where(tipo_inmueble == 'Casa', rng.integers(70,380,n), rng.integers(38,210,n))
    habitaciones = np.clip(area // 32 + rng.integers(-1,2,n), 1, 7)
    banos        = np.clip(habitaciones - 1 + rng.integers(0,2,n), 1, 6)
    antiguedad   = rng.integers(0, 31, n)
    parqueaderos = np.where(estrato>=3, rng.choice([0,1,2],n,p=[0.08,0.62,0.30]), rng.choice([0,1],n,p=[0.55,0.45]))
    cuarto_util  = rng.choice([0,1], n, p=[0.32,0.68])
    conjunto_cerrado = np.where(estrato>=3, rng.choice([0,1],n,p=[0.12,0.88]), rng.choice([0,1],n,p=[0.42,0.58]))
    piso = np.where(tipo_inmueble=='Apartamento', rng.integers(1,22,n), np.ones(n,dtype=int))

    zonas_map = {
        'Bogotá':       (['Chapinero','Usaquén','Suba','Kennedy','Bosa'],           [1.20,1.15,0.95,0.82,0.78]),
        'Medellín':     (['El Poblado','Laureles','Belén','Robledo','Itagüí'],      [1.30,1.12,0.90,0.80,0.85]),
        'Cali':         (['Ciudad Jardín','El Ingenio','San Antonio','Aguablanca','Chipichape'], [1.18,1.05,0.88,0.72,1.02]),
        'Barranquilla': (['El Prado','Riomar','Villa Santos','Soledad','Suroriente'],[1.22,1.15,0.98,0.80,0.75]),
        'Cartagena':    (['Bocagrande','Manga','Pie de la Popa','La Boquilla','Turbaco'],[1.35,1.10,1.05,1.20,0.80]),
    }
    zona     = np.empty(n, dtype=object)
    zona_fac = np.ones(n)
    for c in ciudades:
        mask = ciudad == c
        idx  = rng.integers(0, 5, mask.sum())
        zona[mask]     = np.array(zonas_map[c][0])[idx]
        zona_fac[mask] = np.array(zonas_map[c][1])[idx]

    pm2          = np.array([8.2 if c=='Bogotá' else 6.5 if c=='Medellín' else 4.8 if c=='Cali' else 4.3 if c=='Barranquilla' else 6.0 for c in ciudad])
    estrato_fac  = np.array([0.46,0.64,0.82,1.00,1.30,1.68])[estrato-1]
    tipo_fac     = np.where(tipo_inmueble=='Casa', 0.82, 1.00)
    piso_fac     = np.where(tipo_inmueble=='Apartamento', 1.0 + np.clip((piso-5)*0.009,-0.04,0.14), 1.0)
    amenidad_bon = parqueaderos*0.038 + cuarto_util*0.013 + conjunto_cerrado*0.027
    antig_fac    = np.maximum(0.70, 1.0 - antiguedad*0.009)

    precio = (pm2 * area * estrato_fac * tipo_fac * piso_fac * zona_fac * (1+amenidad_bon) * antig_fac
              + rng.normal(0,1,n) * pm2 * area * 0.05)
    precio = np.round(np.maximum(90, precio), 1)

    return pd.DataFrame({
        'tipo_inmueble':     tipo_inmueble,
        'ciudad':            ciudad,
        'zona':              zona,
        'estrato':           estrato,
        'area_m2':           area,
        'habitaciones':      habitaciones,
        'banos':             banos,
        'piso':              piso,
        'parqueaderos':      parqueaderos,
        'cuarto_util':       cuarto_util,
        'conjunto_cerrado':  conjunto_cerrado,
        'antiguedad_anos':   antiguedad,
        'precio_millones_cop': precio,
    })


def gen_credito() -> pd.DataFrame:
    rng = np.random.default_rng(123)
    n = 300
    edad = rng.integers(20, 66, n)
    ingresos = np.maximum(1_300_000, rng.choice([1_300_000,2_000_000,3_500_000,5_000_000,8_000_000,12_000_000], n, p=[0.15,0.25,0.30,0.15,0.10,0.05]) + rng.integers(-200_000, 200_001, n))
    score = np.clip(rng.normal(600, 120, n).astype(int), 300, 850)
    deuda = rng.choice([0,500_000,1_500_000,3_000_000,6_000_000,10_000_000], n, p=[0.20,0.20,0.25,0.20,0.10,0.05])
    monto = np.round(ingresos * rng.uniform(2, 10, n), -3).astype(int)
    plazo = rng.choice([12, 24, 36, 48, 60, 72], n)
    empleado = rng.choice([0, 1], n, p=[0.25, 0.75])
    ratio = (deuda + monto / plazo) / ingresos
    prob = 0.30*(score/850) + 0.30*(1-np.clip(ratio,0,1)) + 0.20*empleado + 0.20*np.clip((ingresos-1_300_000)/10_700_000,0,1)
    aprobado = (rng.uniform(0,1,n) < prob).astype(int)
    return pd.DataFrame({'edad': edad, 'ingresos_mensuales_cop': ingresos, 'score_crediticio': score, 'deuda_actual_cop': deuda, 'monto_solicitado_cop': monto, 'plazo_meses': plazo, 'empleado_formal': empleado, 'aprobado': aprobado})


def gen_churn() -> pd.DataFrame:
    rng = np.random.default_rng(777)
    n = 300
    edad = rng.integers(18, 61, n)
    saldo = np.clip(rng.exponential(800_000, n).astype(int), 0, 15_000_000)
    transacciones = rng.poisson(12, n)
    productos = rng.choice([1, 2, 3, 4], n, p=[0.30, 0.35, 0.25, 0.10])
    meses = rng.integers(1, 61, n)
    quejas = rng.choice([0,1,2,3,4], n, p=[0.50,0.25,0.15,0.07,0.03])
    uso_app = np.clip(rng.poisson(5, n), 0, 30)
    prob = 0.30*(1-np.clip(saldo/5_000_000,0,1)) + 0.25*(1-np.clip(transacciones/20,0,1)) + 0.20*(quejas/4) + 0.15*(1-np.clip(uso_app/10,0,1)) + 0.10*(1-productos/4)
    churn = (rng.uniform(0,1,n) < prob).astype(int)
    return pd.DataFrame({'edad': edad, 'saldo_promedio_cop': saldo, 'transacciones_mes': transacciones, 'productos_activos': productos, 'meses_como_cliente': meses, 'quejas_ultimo_ano': quejas, 'uso_app_semanal': uso_app, 'churn': churn})


DEMO_GENERATORS = {'vivienda': gen_vivienda, 'credito': gen_credito, 'churn': gen_churn}

DEMO_META = {
    'vivienda': {'nombre': 'Compra de Vivienda', 'descripcion': 'Predice el precio en millones COP — 1000 inmuebles 2026 con precios reales por ciudad, zona, estrato y tipo', 'tarea_sugerida': 'regresion', 'target_sugerido': 'precio_millones_cop', 'icono': '🏠'},
    'credito':  {'nombre': 'Aprobación de Crédito', 'descripcion': 'Clasifica si un crédito bancario colombiano será aprobado o rechazado', 'tarea_sugerida': 'clasificacion', 'target_sugerido': 'aprobado', 'icono': '💳'},
    'churn':    {'nombre': 'Deserción de Clientes (Churn)', 'descripcion': 'Predice qué clientes de un neobank colombiano dejarán de usar el servicio', 'tarea_sugerida': 'clasificacion', 'target_sugerido': 'churn', 'icono': '📉'},
}


# ── Helpers ───────────────────────────────────────────────────────────────────

def _json_safe(val):
    if val is None:
        return None
    if isinstance(val, float) and np.isnan(val):
        return None
    if isinstance(val, (np.integer,)):
        return int(val)
    if isinstance(val, (np.floating,)):
        return None if np.isnan(val) else float(val)
    if isinstance(val, (np.bool_,)):
        return bool(val)
    if isinstance(val, pd.Timestamp):
        return val.strftime('%Y-%m-%d')
    try:
        if pd.isna(val):
            return None
    except (ValueError, TypeError):
        pass
    return str(val) if not isinstance(val, (int, float, bool, str)) else val


def df_to_summary(df: pd.DataFrame, extra: dict = None) -> dict:
    """Convierte un DataFrame a un dict serializable con TODOS los registros."""
    records_raw = df.to_dict(orient='records')
    records = [{k: _json_safe(v) for k, v in row.items()} for row in records_raw]
    preview_raw = df.tail(10).to_dict(orient='records')
    preview = [{k: _json_safe(v) for k, v in row.items()} for row in preview_raw]
    result = {
        'records': records,
        'columnas': [str(c) for c in df.columns],
        'filas': int(len(df)),
        'preview': preview,
        'nulos': {str(c): int(v) for c, v in df.isnull().sum().items()},
        'tipos': {str(c): str(t) for c, t in df.dtypes.items()},
        'problemas': [],
    }
    null_counts = {str(c): int(v) for c, v in df.isnull().sum().items() if v > 0}
    if null_counts:
        result['problemas'].append(f"Valores nulos en: {null_counts}")
    dups = int(df.duplicated().sum())
    if dups:
        result['problemas'].append(f"{dups} filas duplicadas")
    if extra:
        result.update(extra)
    return result


def fig_to_b64(fig) -> str:
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight', dpi=90, facecolor='white')
    buf.seek(0)
    b64 = base64.b64encode(buf.read()).decode()
    plt.close(fig)
    return b64


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get('/')
def root():
    return {'status': 'ok', 'app': 'IA Predict · Grupo FDS 674'}


@app.get('/demos')
def list_demos():
    return DEMO_META


@app.get('/demo/{nombre}')
def load_demo(nombre: str):
    if nombre not in DEMO_GENERATORS:
        raise HTTPException(404, f"Demo '{nombre}' no encontrado")
    df = DEMO_GENERATORS[nombre]()
    return df_to_summary(df, DEMO_META[nombre])


@app.get('/demo/{nombre}/download')
def download_demo(nombre: str):
    if nombre not in DEMO_GENERATORS:
        raise HTTPException(404, f"Demo '{nombre}' no encontrado")
    df = DEMO_GENERATORS[nombre]()
    buf = io.BytesIO()
    with pd.ExcelWriter(buf, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name=DEMO_META[nombre]['nombre'][:31])
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={
            'Content-Disposition': f'attachment; filename="IA_Predict_Demo_{nombre}_2026.xlsx"',
            'Access-Control-Allow-Origin': '*',
        },
    )


@app.post('/upload')
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    fname = file.filename or ''
    try:
        if fname.endswith('.csv'):
            df = None
            for sep in [',', ';', '\t']:
                try:
                    candidate = pd.read_csv(io.BytesIO(content), sep=sep)
                    if candidate.shape[1] > 1:
                        df = candidate; break
                except Exception:
                    continue
            if df is None:
                df = pd.read_csv(io.BytesIO(content))
        elif fname.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(content))
        else:
            raise HTTPException(400, 'Formato no soportado. Use CSV o Excel (.xlsx, .xls)')
        if df.empty:
            raise HTTPException(400, 'El archivo está vacío')
        return df_to_summary(df, {'nombre_archivo': fname})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, f'Error al procesar el archivo: {e}')


# ── Clean (stateless: recibe records, devuelve records limpios) ───────────────

class CleanRequest(BaseModel):
    records: List[Dict[str, Any]]
    columnas: List[str]
    opciones: Dict[str, Any]


@app.post('/clean')
def clean_data(req: CleanRequest):
    try:
        df = pd.DataFrame(req.records, columns=req.columnas)
        acciones: List[str] = []

        if req.opciones.get('eliminar_duplicados'):
            antes = len(df)
            df = df.drop_duplicates()
            diff = antes - len(df)
            if diff:
                acciones.append(f'Eliminadas {diff} filas duplicadas')

        estrategia = req.opciones.get('estrategia_nulos', 'ninguna')
        if estrategia == 'eliminar_filas':
            antes = len(df)
            df = df.dropna()
            acciones.append(f'Eliminadas {antes - len(df)} filas con valores nulos')
        elif estrategia in ('media', 'mediana', 'moda'):
            for col in df.columns:
                n_null = int(df[col].isnull().sum())
                if n_null == 0:
                    continue
                if estrategia == 'media' and pd.api.types.is_numeric_dtype(df[col]):
                    val = round(float(df[col].mean()), 2)
                    df[col] = df[col].fillna(val)
                    acciones.append(f"'{col}': {n_null} nulos → media ({val})")
                elif estrategia == 'mediana' and pd.api.types.is_numeric_dtype(df[col]):
                    val = round(float(df[col].median()), 2)
                    df[col] = df[col].fillna(val)
                    acciones.append(f"'{col}': {n_null} nulos → mediana ({val})")
                elif estrategia == 'moda':
                    val = df[col].mode().iloc[0]
                    df[col] = df[col].fillna(val)
                    acciones.append(f"'{col}': {n_null} nulos → moda ({val})")

        return df_to_summary(df, {'acciones': acciones})
    except Exception as e:
        raise HTTPException(400, f'Error limpiando datos: {e}')


# ── Train (stateless: recibe records + config, devuelve resultados + modelo serializado) ──

MODELS_MAP = {
    'regresion_logistica': lambda: LogisticRegression(max_iter=1000, random_state=42),
    'arbol_decision_cls':  lambda: DecisionTreeClassifier(max_depth=10, random_state=42),
    'random_forest_cls':   lambda: RandomForestClassifier(n_estimators=30, max_depth=8, random_state=42),
    'svm':                 lambda: SVC(probability=True, random_state=42),
    'knn':                 lambda: KNeighborsClassifier(n_neighbors=5),
    'regresion_lineal':    LinearRegression,
    'ridge':               lambda: Ridge(alpha=1.0),
    'lasso':               lambda: Lasso(alpha=1.0, max_iter=5000),
    'arbol_decision_reg':  lambda: DecisionTreeRegressor(max_depth=10, random_state=42),
    'random_forest_reg':   lambda: RandomForestRegressor(n_estimators=30, max_depth=8, random_state=42),
    'svr':                 lambda: SVR(kernel='rbf'),
}

NEEDS_SCALING = {'regresion_logistica', 'svm', 'knn', 'svr'}


class TrainRequest(BaseModel):
    records: List[Dict[str, Any]]
    columnas: List[str]
    target: str
    task_type: str
    algorithm: str
    test_size: float = 0.2
    features: Optional[List[str]] = None


@app.post('/train')
def train(req: TrainRequest):
    if req.algorithm not in MODELS_MAP:
        raise HTTPException(400, f"Algoritmo '{req.algorithm}' no reconocido")

    df = pd.DataFrame(req.records, columns=req.columnas)

    if req.target not in df.columns:
        raise HTTPException(400, f"Columna '{req.target}' no existe")

    feat_cols = [f for f in (req.features or df.columns.tolist()) if f in df.columns and f != req.target]
    if not feat_cols:
        raise HTTPException(400, 'No hay variables predictoras seleccionadas')

    # Eliminar columnas datetime
    datetime_cols = df[feat_cols].select_dtypes(include=['datetime64', 'datetimetz']).columns.tolist()
    feat_cols = [f for f in feat_cols if f not in datetime_cols]

    df = df[feat_cols + [req.target]].dropna().copy()
    if len(df) < 20:
        raise HTTPException(400, f'Solo quedan {len(df)} filas, se necesitan al menos 20')

    # Encode categoricals
    label_encoders: Dict[str, LabelEncoder] = {}
    for col in df.select_dtypes(include='object').columns:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        label_encoders[col] = le

    X = df[feat_cols].values
    y = df[req.target].values
    if req.task_type == 'clasificacion':
        y = y.astype(int)

    scaler = None
    if req.algorithm in NEEDS_SCALING:
        scaler = StandardScaler()
        X = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=req.test_size, random_state=42)
    model = MODELS_MAP[req.algorithm]()
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    # Serializar modelo al frontend (base64)
    model_b64  = base64.b64encode(pickle.dumps(model)).decode()
    le_b64     = base64.b64encode(pickle.dumps(label_encoders)).decode()
    scaler_b64 = base64.b64encode(pickle.dumps(scaler)).decode() if scaler else None

    charts: Dict[str, str] = {}
    metrics: Dict[str, float] = {}

    if req.task_type == 'clasificacion':
        metrics['accuracy']  = round(float(accuracy_score(y_test, y_pred)), 4)
        metrics['precision'] = round(float(precision_score(y_test, y_pred, average='weighted', zero_division=0)), 4)
        metrics['recall']    = round(float(recall_score(y_test, y_pred, average='weighted', zero_division=0)), 4)
        metrics['f1_score']  = round(float(f1_score(y_test, y_pred, average='weighted', zero_division=0)), 4)
        if len(np.unique(y)) == 2:
            try:
                y_prob = model.predict_proba(X_test)[:, 1]
                metrics['roc_auc'] = round(float(roc_auc_score(y_test, y_prob)), 4)
            except Exception:
                pass
        cm = confusion_matrix(y_test, y_pred)
        labels = [str(c) for c in sorted(np.unique(y))]
        fig, ax = plt.subplots(figsize=(5, 4))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=ax,
                    xticklabels=[f'Pred {l}' for l in labels],
                    yticklabels=[f'Real {l}' for l in labels])
        ax.set_title('Matriz de Confusión', fontsize=13, fontweight='bold', pad=10)
        ax.set_ylabel('Valor Real'); ax.set_xlabel('Valor Predicho')
        plt.tight_layout()
        charts['confusion_matrix'] = fig_to_b64(fig)
    else:
        mse = float(mean_squared_error(y_test, y_pred))
        metrics['mae']  = round(float(mean_absolute_error(y_test, y_pred)), 4)
        metrics['mse']  = round(mse, 4)
        metrics['rmse'] = round(float(np.sqrt(mse)), 4)
        metrics['r2']   = round(float(r2_score(y_test, y_pred)), 4)
        safe_y = np.where(np.abs(y_test) < 1e-9, 1e-9, y_test)
        metrics['mape'] = round(float(np.mean(np.abs((y_test - y_pred) / safe_y))) * 100, 2)
        fig, ax = plt.subplots(figsize=(5, 4))
        ax.scatter(y_test, y_pred, alpha=0.55, color='#6366f1', edgecolors='white', linewidth=0.4, s=40)
        lo, hi = min(y_test.min(), y_pred.min()), max(y_test.max(), y_pred.max())
        ax.plot([lo, hi], [lo, hi], 'r--', linewidth=1.8, label='Predicción perfecta')
        ax.set_xlabel('Valor Real'); ax.set_ylabel('Valor Predicho')
        ax.set_title('Real vs Predicho', fontsize=13, fontweight='bold', pad=10)
        ax.legend(fontsize=9); plt.tight_layout()
        charts['scatter'] = fig_to_b64(fig)

    if hasattr(model, 'feature_importances_'):
        imp = model.feature_importances_
        idx = np.argsort(imp)[::-1]
        top = min(12, len(feat_cols))
        fig, ax = plt.subplots(figsize=(6, max(3, top * 0.45)))
        colors = plt.cm.viridis(np.linspace(0.25, 0.85, top))
        ax.barh(range(top), imp[idx[:top]][::-1], color=colors[::-1])
        ax.set_yticks(range(top))
        ax.set_yticklabels([feat_cols[i] for i in idx[:top]][::-1], fontsize=9)
        ax.set_title('Importancia de Variables', fontsize=13, fontweight='bold', pad=10)
        ax.set_xlabel('Importancia relativa'); plt.tight_layout()
        charts['feature_importance'] = fig_to_b64(fig)
    elif hasattr(model, 'coef_'):
        coef = model.coef_.flatten() if model.coef_.ndim > 1 else model.coef_
        if len(coef) == len(feat_cols):
            fig, ax = plt.subplots(figsize=(6, max(3, len(feat_cols) * 0.42)))
            colors = ['#6366f1' if c >= 0 else '#f43f5e' for c in coef]
            ax.barh(feat_cols, coef, color=colors)
            ax.axvline(0, color='black', linewidth=0.8, linestyle='--')
            ax.set_title('Coeficientes del Modelo', fontsize=13, fontweight='bold', pad=10)
            ax.set_xlabel('Coeficiente'); plt.tight_layout()
            charts['feature_importance'] = fig_to_b64(fig)

    return {
        'metricas': metrics,
        'charts': charts,
        'task_type': req.task_type,
        'algoritmo': req.algorithm,
        'filas_entrenamiento': int(len(X_train)),
        'filas_prueba': int(len(X_test)),
        'features_usadas': feat_cols,
        'columnas_categoricas': list(label_encoders.keys()),
        'opciones_categoricas': {col: list(le.classes_) for col, le in label_encoders.items() if col in feat_cols},
        # ← modelo serializado para guardarlo en el frontend
        'model_state': {
            'model_b64':  model_b64,
            'le_b64':     le_b64,
            'scaler_b64': scaler_b64,
            'feature_columns': feat_cols,
            'task_type':  req.task_type,
            'algorithm':  req.algorithm,
        },
    }


# ── Predict (stateless: recibe model_state + valores) ─────────────────────────

class PredictRequest(BaseModel):
    model_state: Dict[str, Any]
    valores: Dict[str, Any]


@app.post('/predict')
def predict(req: PredictRequest):
    try:
        ms = req.model_state
        model          = pickle.loads(base64.b64decode(ms['model_b64']))
        label_encoders = pickle.loads(base64.b64decode(ms['le_b64']))
        scaler         = pickle.loads(base64.b64decode(ms['scaler_b64'])) if ms.get('scaler_b64') else None
        feat_cols      = ms['feature_columns']
        task_type      = ms['task_type']

        row = []
        for col in feat_cols:
            val = req.valores.get(col)
            if val is None or str(val).strip() == '':
                raise HTTPException(400, f"Falta el valor para '{col}'")
            if col in label_encoders:
                try:
                    val = int(label_encoders[col].transform([str(val)])[0])
                except ValueError:
                    val = 0
            else:
                val = float(val)
            row.append(val)

        X = np.array([row])
        if scaler is not None:
            X = scaler.transform(X)

        pred = model.predict(X)[0]
        result: Dict[str, Any] = {'prediccion': float(pred), 'task_type': task_type}
        if task_type == 'clasificacion':
            result['clase']   = int(pred)
            result['etiqueta'] = 'Sí / Positivo' if int(pred) == 1 else 'No / Negativo'
            if hasattr(model, 'predict_proba'):
                proba = model.predict_proba(X)[0]
                result['probabilidades'] = [{'clase': str(c), 'prob': round(float(p), 4)} for c, p in zip(model.classes_, proba)]
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, f'Error en predicción: {e}')
