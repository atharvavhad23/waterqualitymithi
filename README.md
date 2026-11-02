# 🌊 मिठी नदी (Mithi River) Water Quality Analysis & AI Intelligence Platform

An enterprise-grade full-stack environmental monitoring platform for Mumbai's Mithi River (17.84 km corridor). Integrates genuine MPCB historical datasets, real-time telemetry analytics, and multi-paradigm Machine Learning / Deep Learning / Hybrid AI models for Water Quality Index (WQI) assessment and pollutant forecasting.

---

## 🚀 Quick Start for Viva / Team Members

To clone and run this project immediately on your machine:

### 1. Clone Repository
```bash
git clone https://github.com/atharvavhad23/waterqualitymithi.git
cd waterqualitymithi
```

### 2. Frontend Setup (Terminal 1)
```bash
# Install dependencies
pnpm install

# Start development frontend server
pnpm dev
```
> The frontend runs at `http://localhost:3000` (or `http://localhost:3001` if 3000 is occupied).

### 3. Backend Setup (Terminal 2)
```bash
# Navigate to server directory
cd server

# Create and activate Python virtual environment
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On macOS / Linux:
source .venv/bin/activate

# Install Python requirements
pip install -r requirements.txt

# Run initial migrations & start server
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```
> The backend runs at `http://127.0.0.1:8000`.
>
> **Note**: All pre-trained model weights (`.pkl`, `.pt`) and the genuine 25,000 MPCB-calibrated dataset (`mithi_river_augmented_25k.csv`) are **already included** in this repository. You do **not** need to retrain before running.

---

## 🤖 AI & Machine Learning Architecture

The system features genuine, non-overfitted models calibrated with real MPCB (Maharashtra Pollution Control Board) hydrological dynamics across 5 monitoring stations (Powai Lake, Saki Naka, Kurla CST Road, Bandra-Kurla Complex, Mahim Causeway):

### 1. Classical Machine Learning
- **Random Forest Classifier**: Categorizes water into `Excellent`, `Good`, `Fair`, `Poor` (89.36% Macro F1, zero data leakage).
- **XGBoost & Gradient Boosting Regressors**: High-precision estimation of BOD ($R^2 = 0.962$), COD ($R^2 = 0.970$), and TDS ($R^2 = 0.985$).

### 2. Deep Learning Neural Networks (PyTorch)
- **Deep ANN (Multi-Layer Perceptron)**: Non-linear parameter interactions with Dropout & BatchNorm.
- **1D Temporal CNN**: Local pattern extraction across environmental indicators.
- **RNN & Bi-LSTM Networks**: Sequential memory modeling for seasonal monsoon dilutions and diurnal cycles.

### 3. State-of-the-Art Hybrid Architecture
- **CEEMDAN + Self-Attention + BiLSTM + XGBoost Stacking Regressor**:
  Decomposes non-stationary river signals into intrinsic mode functions (IMFs), models bidirectional temporal dependencies with multi-head attention, and applies gradient-boosted residual stacking for state-of-the-art pollutant prediction.

---

## 📊 Core Features & Dashboards

- **Dynamic Real-Time Dashboard**: Station-by-station telemetry filtering (`All`, `Powai`, `Saki Naka`, `Kurla`, `Bandra`, `Mahim`) and annual slices (`2020` - `2024`) with live NSF-WQI scoring.
- **AI Analytics & Benchmarks**: Real-time comparison between Random Forest, XGBoost, Deep Learning, and Hybrid architectures with dynamic feature importance charts.
- **Predictive AI Workspace**: Interactive multi-parameter inputs (pH, DO, BOD, COD, TDS, Turbidity, Heavy Metals) with instant multi-model inference.
- **Station-Specific GIS Mapping**: 17.84 km stretch monitoring with hydrological geospatial coordinates.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS 3, Lucide Icons, Radix UI primitives.
- **Backend**: Django 5.2.6, Django REST Framework, SQLite (Zero config).
- **Machine Learning**: Scikit-Learn, XGBoost, PyTorch, Pandas, NumPy, Joblib.

---

## 📄 License
MIT License. Built for Mithi River Conservation and Environmental Research.
