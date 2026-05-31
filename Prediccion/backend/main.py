import io
import json
import base64
import warnings
from typing import Any, Dict, List, Optional

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import Lasso, LinearRegression, LogisticRegression, Ridge
from sklearn.metrics import (
    accuracy_score, confusion_matrix, f1_score, mean_absolute_error,
    mean_squared_error, precision_score, r2_score, recall_score, roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.svm import SVC, SVR
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor

warnings.filterwarnings('ignore')

app = FastAPI(title='ML Studio Colombia', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# ── In-memory session state ───────────────────────────────────────────────────
current_df: Optional[pd.DataFrame] = None
trained_model = None
label_encoders: Dict[str, LabelEncoder] = {}
scaler: Optional[StandardScaler] = None
model_config: Dict = {}
feature_columns: List[str] = []


# ── Demo data generators ──────────────────────────────────────────────────────

def gen_vivienda() -> pd.DataFrame:
    rng = np.random.default_rng(42)
    n = 300
    ciudades = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena']
    ciudad = rng.choice(ciudades, n, p=[0.35, 0.25, 0.20, 0.10, 0.10])
    estrato = rng.choice([1, 2, 3, 4, 5, 6], n, p=[0.10, 0.20, 0.30, 0.20, 0.15, 0.05])
    area = rng.integers(42, 280, n)
    habitaciones = np.clip(area // 45 + rng.integers(-1, 2, n), 1, 6)
    banos = np.clip(habitaciones - 1 + rng.integers(0, 2, n), 1, 5)
    antiguedad = rng.integers(0, 36, n)
    garaje = np.where(estrato >= 3, 1, rng.integers(0, 2, n)).astype(int)
    ascensor = np.where(estrato >= 4, 1, rng.integers(0, 2, n)).astype(int)

    base = np.array([
        5.2 if c == 'Bogotá' else
        4.5 if c == 'Medellín' else
        4.0 if c == 'Cartagena' else
        3.4 if c == 'Cali' else 3.0
        for c in ciudad
    ])
    precio = (
        base * estrato * area * 0.011
        + habitaciones * 12
        + garaje * 48
        + ascensor * 28
        - antiguedad * 1.6
        + rng.normal(0, 22, n)
    )
    precio = np.round(np.maximum(50, precio), 1)

    return pd.DataFrame({
        'area_m2': area,
        'habitaciones': habitaciones,
        'banos': banos,
        'estrato': estrato,
        'ciudad': ciudad,
        'antiguedad_anos': antiguedad,
        'garaje': garaje,
        'ascensor': ascensor,
        'precio_millones_cop': precio,
    })


def gen_credito() -> pd.DataFrame:
    rng = np.random.default_rng(123)
    n = 300
    edad = rng.integers(20, 66, n)
    ingresos_base = rng.choice(
        [1_300_000, 2_000_000, 3_500_000, 5_000_000, 8_000_000, 12_000_000],
        n, p=[0.15, 0.25, 0.30, 0.15, 0.10, 0.05],
    )
    ingresos = np.maximum(1_300_000, ingresos_base + rng.integers(-200_000, 200_001, n))
    score = np.clip(rng.normal(600, 120, n).astype(int), 300, 850)
    deuda = rng.choice(
        [0, 500_000, 1_500_000, 3_000_000, 6_000_000, 10_000_000],
        n, p=[0.20, 0.20, 0.25, 0.20, 0.10, 0.05],
    )
    monto = np.round(ingresos * rng.uniform(2, 10, n), -3).astype(int)
    plazo = rng.choice([12, 24, 36, 48, 60, 72], n)
    empleado = rng.choice([0, 1], n, p=[0.25, 0.75])

    ratio = (deuda + monto / plazo) / ingresos
    prob = (
        0.30 * (score / 850)
        + 0.30 * (1 - np.clip(ratio, 0, 1))
        + 0.20 * empleado
        + 0.20 * np.clip((ingresos - 1_300_000) / 10_700_000, 0, 1)
    )
    aprobado = (rng.uniform(0, 1, n) < prob).astype(int)

    return pd.DataFrame({
        'edad': edad,
        'ingresos_mensuales_cop': ingresos,
        'score_crediticio': score,
        'deuda_actual_cop': deuda,
        'monto_solicitado_cop': monto,
        'plazo_meses': plazo,
        'empleado_formal': empleado,
        'aprobado': aprobado,
    })


def gen_churn() -> pd.DataFrame:
    rng = np.random.default_rng(777)
    n = 300
    edad = rng.integers(18, 61, n)
    saldo = np.clip(rng.exponential(800_000, n).astype(int), 0, 15_000_000)
    transacciones = rng.poisson(12, n)
    productos = rng.choice([1, 2, 3, 4], n, p=[0.30, 0.35, 0.25, 0.10])
    meses = rng.integers(1, 61, n)
    quejas = rng.choice([0, 1, 2, 3, 4], n, p=[0.50, 0.25, 0.15, 0.07, 0.03])
    uso_app = np.clip(rng.poisson(5, n), 0, 30)

    prob = (
        0.30 * (1 - np.clip(saldo / 5_000_000, 0, 1))
        + 0.25 * (1 - np.clip(transacciones / 20, 0, 1))
        + 0.20 * (quejas / 4)
        + 0.15 * (1 - np.clip(uso_app / 10, 0, 1))
        + 0.10 * (1 - productos / 4)
    )
    churn = (rng.uniform(0, 1, n) < prob).astype(int)

    return pd.DataFrame({
        'edad': edad,
        'saldo_promedio_cop': saldo,
        'transacciones_mes': transacciones,
        'productos_activos': productos,
        'meses_como_cliente': meses,
        'quejas_ultimo_ano': quejas,
        'uso_app_semanal': uso_app,
        'churn': churn,
    })


DEMO_GENERATORS = {
    'vivienda': gen_vivienda,
    'credito': gen_credito,
    'churn': gen_churn,
}

DEMO_META = {
    'vivienda': {
        'nombre': 'Compra de Vivienda',
        'descripcion': 'Predice el precio en millones COP según área, estrato, ciudad y características',
        'tarea_sugerida': 'regresion',
        'target_sugerido': 'precio_millones_cop',
        'icono': '🏠',
    },
    'credito': {
        'nombre': 'Aprobación de Crédito',
        'descripcion': 'Clasifica si un crédito bancario colombiano será aprobado o rechazado',
        'tarea_sugerida': 'clasificacion',
        'target_sugerido': 'aprobado',
        'icono': '💳',
    },
    'churn': {
        'nombre': 'Deserción de Clientes (Churn)',
        'descripcion': 'Predice qué clientes de un neobank colombiano dejarán de usar el servicio',
        'tarea_sugerida': 'clasificacion',
        'target_sugerido': 'churn',
        'icono': '📉',
    },
}


# ── Helpers ───────────────────────────────────────────────────────────────────

def df_summary(df: pd.DataFrame, extra: dict = None) -> dict:
    result = {
        'columnas': list(df.columns),
        'filas': len(df),
        'preview': df.head(10).to_dict(orient='records'),
        'nulos': df.isnull().sum().to_dict(),
        'tipos': {c: str(t) for c, t in df.dtypes.items()},
        'problemas': [],
    }
    null_counts = {c: int(v) for c, v in df.isnull().sum().items() if v > 0}
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
    fig.savefig(buf, format='png', bbox_inches='tight', dpi=150, facecolor='white')
    buf.seek(0)
    b64 = base64.b64encode(buf.read()).decode()
    plt.close(fig)
    return b64


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get('/')
def root():
    return {'status': 'ok', 'app': 'ML Studio Colombia'}


@app.get('/demos')
def list_demos():
    return DEMO_META


@app.get('/demo/{nombre}')
def load_demo(nombre: str):
    global current_df, label_encoders, scaler, trained_model, model_config, feature_columns
    if nombre not in DEMO_GENERATORS:
        raise HTTPException(404, f"Demo '{nombre}' no encontrado")
    current_df = DEMO_GENERATORS[nombre]()
    label_encoders, scaler, trained_model, model_config, feature_columns = {}, None, None, {}, []
    return df_summary(current_df, DEMO_META[nombre])


@app.post('/upload')
async def upload_file(file: UploadFile = File(...)):
    global current_df, label_encoders, scaler, trained_model, model_config, feature_columns
    content = await file.read()
    fname = file.filename or ''
    try:
        if fname.endswith('.csv'):
            df = None
            for sep in [',', ';', '\t']:
                try:
                    candidate = pd.read_csv(io.BytesIO(content), sep=sep)
                    if candidate.shape[1] > 1:
                        df = candidate
                        break
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

        current_df = df
        label_encoders, scaler, trained_model, model_config, feature_columns = {}, None, None, {}, []
        return df_summary(current_df, {'nombre_archivo': fname})

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, f'Error al procesar el archivo: {e}')


@app.post('/clean')
def clean_data(opciones: dict):
    global current_df
    if current_df is None:
        raise HTTPException(400, 'No hay datos cargados')

    df = current_df.copy()
    acciones: List[str] = []

    if opciones.get('eliminar_duplicados'):
        antes = len(df)
        df = df.drop_duplicates()
        diff = antes - len(df)
        if diff:
            acciones.append(f'Eliminadas {diff} filas duplicadas')

    estrategia = opciones.get('estrategia_nulos', 'ninguna')
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

    current_df = df
    return df_summary(current_df, {'acciones': acciones})


# ── Train ─────────────────────────────────────────────────────────────────────

class TrainRequest(BaseModel):
    target: str
    task_type: str
    algorithm: str
    test_size: float = 0.2
    features: Optional[List[str]] = None


MODELS_MAP = {
    # Clasificación
    'regresion_logistica': lambda: LogisticRegression(max_iter=1000, random_state=42),
    'arbol_decision_cls': lambda: DecisionTreeClassifier(max_depth=10, random_state=42),
    'random_forest_cls': lambda: RandomForestClassifier(n_estimators=100, random_state=42),
    'svm': lambda: SVC(probability=True, random_state=42),
    'knn': lambda: KNeighborsClassifier(n_neighbors=5),
    # Regresión
    'regresion_lineal': LinearRegression,
    'ridge': lambda: Ridge(alpha=1.0),
    'lasso': lambda: Lasso(alpha=1.0, max_iter=5000),
    'arbol_decision_reg': lambda: DecisionTreeRegressor(max_depth=10, random_state=42),
    'random_forest_reg': lambda: RandomForestRegressor(n_estimators=100, random_state=42),
    'svr': lambda: SVR(kernel='rbf'),
}

NEEDS_SCALING = {'regresion_logistica', 'svm', 'knn', 'svr'}


@app.post('/train')
def train(req: TrainRequest):
    global current_df, trained_model, label_encoders, scaler, model_config, feature_columns

    if current_df is None:
        raise HTTPException(400, 'No hay datos cargados')
    if req.target not in current_df.columns:
        raise HTTPException(400, f"Columna '{req.target}' no existe")
    if req.algorithm not in MODELS_MAP:
        raise HTTPException(400, f"Algoritmo '{req.algorithm}' no reconocido")

    feat_cols = [
        f for f in (req.features or current_df.columns.tolist())
        if f in current_df.columns and f != req.target
    ]
    if not feat_cols:
        raise HTTPException(400, 'No hay variables predictoras seleccionadas')

    df = current_df[feat_cols + [req.target]].dropna().copy()
    if len(df) < 20:
        raise HTTPException(400, f'Solo quedan {len(df)} filas después de limpiar nulos, se necesitan al menos 20')

    # Encode categoricals
    label_encoders = {}
    for col in df.select_dtypes(include='object').columns:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        label_encoders[col] = le

    X = df[feat_cols].values
    y = df[req.target].values
    if req.task_type == 'clasificacion':
        y = y.astype(int)

    # Scale if needed
    if req.algorithm in NEEDS_SCALING:
        scaler = StandardScaler()
        X = scaler.fit_transform(X)
    else:
        scaler = None

    feature_columns = feat_cols
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=req.test_size, random_state=42
    )

    model = MODELS_MAP[req.algorithm]()
    model.fit(X_train, y_train)
    trained_model = model

    model_config = {
        'target': req.target,
        'task_type': req.task_type,
        'algorithm': req.algorithm,
        'features': feat_cols,
        'needs_scaling': req.algorithm in NEEDS_SCALING,
    }

    y_pred = model.predict(X_test)
    charts: Dict[str, str] = {}
    metrics: Dict[str, float] = {}

    if req.task_type == 'clasificacion':
        metrics['accuracy'] = round(float(accuracy_score(y_test, y_pred)), 4)
        metrics['precision'] = round(float(precision_score(y_test, y_pred, average='weighted', zero_division=0)), 4)
        metrics['recall'] = round(float(recall_score(y_test, y_pred, average='weighted', zero_division=0)), 4)
        metrics['f1_score'] = round(float(f1_score(y_test, y_pred, average='weighted', zero_division=0)), 4)
        if len(np.unique(y)) == 2:
            try:
                y_prob = model.predict_proba(X_test)[:, 1]
                metrics['roc_auc'] = round(float(roc_auc_score(y_test, y_prob)), 4)
            except Exception:
                pass

        # Confusion matrix
        cm = confusion_matrix(y_test, y_pred)
        labels = [str(c) for c in sorted(np.unique(y))]
        fig, ax = plt.subplots(figsize=(5, 4))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=ax,
                    xticklabels=[f'Pred {l}' for l in labels],
                    yticklabels=[f'Real {l}' for l in labels])
        ax.set_title('Matriz de Confusión', fontsize=13, fontweight='bold', pad=10)
        ax.set_ylabel('Valor Real')
        ax.set_xlabel('Valor Predicho')
        plt.tight_layout()
        charts['confusion_matrix'] = fig_to_b64(fig)

    else:
        mae = float(mean_absolute_error(y_test, y_pred))
        mse = float(mean_squared_error(y_test, y_pred))
        metrics['mae'] = round(mae, 4)
        metrics['mse'] = round(mse, 4)
        metrics['rmse'] = round(float(np.sqrt(mse)), 4)
        metrics['r2'] = round(float(r2_score(y_test, y_pred)), 4)
        safe_y = np.where(np.abs(y_test) < 1e-9, 1e-9, y_test)
        metrics['mape'] = round(float(np.mean(np.abs((y_test - y_pred) / safe_y))) * 100, 2)

        # Scatter real vs predicted
        fig, ax = plt.subplots(figsize=(5, 4))
        ax.scatter(y_test, y_pred, alpha=0.55, color='#6366f1', edgecolors='white', linewidth=0.4, s=40)
        lo, hi = min(y_test.min(), y_pred.min()), max(y_test.max(), y_pred.max())
        ax.plot([lo, hi], [lo, hi], 'r--', linewidth=1.8, label='Predicción perfecta')
        ax.set_xlabel('Valor Real')
        ax.set_ylabel('Valor Predicho')
        ax.set_title('Real vs Predicho', fontsize=13, fontweight='bold', pad=10)
        ax.legend(fontsize=9)
        plt.tight_layout()
        charts['scatter'] = fig_to_b64(fig)

    # Feature importance / coefficients
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
        ax.set_xlabel('Importancia relativa')
        plt.tight_layout()
        charts['feature_importance'] = fig_to_b64(fig)
    elif hasattr(model, 'coef_'):
        coef = model.coef_.flatten() if model.coef_.ndim > 1 else model.coef_
        if len(coef) == len(feat_cols):
            fig, ax = plt.subplots(figsize=(6, max(3, len(feat_cols) * 0.42)))
            colors = ['#6366f1' if c >= 0 else '#f43f5e' for c in coef]
            ax.barh(feat_cols, coef, color=colors)
            ax.axvline(0, color='black', linewidth=0.8, linestyle='--')
            ax.set_title('Coeficientes del Modelo', fontsize=13, fontweight='bold', pad=10)
            ax.set_xlabel('Coeficiente')
            plt.tight_layout()
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
        'opciones_categoricas': {
            col: list(le.classes_)
            for col, le in label_encoders.items()
            if col in feat_cols
        },
    }


# ── Predict ───────────────────────────────────────────────────────────────────

class PredictRequest(BaseModel):
    valores: Dict[str, Any]


@app.post('/predict')
def predict(req: PredictRequest):
    if trained_model is None:
        raise HTTPException(400, 'No hay modelo entrenado')
    try:
        row = []
        for col in feature_columns:
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
        if model_config.get('needs_scaling') and scaler is not None:
            X = scaler.transform(X)

        pred = trained_model.predict(X)[0]
        result: Dict[str, Any] = {
            'prediccion': float(pred),
            'task_type': model_config['task_type'],
        }
        if model_config['task_type'] == 'clasificacion':
            result['clase'] = int(pred)
            result['etiqueta'] = 'Sí / Positivo' if int(pred) == 1 else 'No / Negativo'
            if hasattr(trained_model, 'predict_proba'):
                proba = trained_model.predict_proba(X)[0]
                result['probabilidades'] = [
                    {'clase': str(c), 'prob': round(float(p), 4)}
                    for c, p in zip(trained_model.classes_, proba)
                ]
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, f'Error en predicción: {e}')
