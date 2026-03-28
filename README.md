# Healthcare Respiratory Disease Detection Platform

Full-stack healthcare application with AI-based respiratory disease prediction.

## Services

- Frontend: React + Vite (`http://localhost:5173`)
- Backend: FastAPI + MongoDB (`http://localhost:8000`)
- ML Service: FastAPI + TensorFlow (`http://localhost:8001`)

## Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB running on `localhost:27017`

## 1. Start backend

```powershell
cd backend
pip install -r requirements.txt
python init_db.py
python seed_data.py
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 2. Start ML service

Open a new terminal:

```powershell
cd ml_model
pip install -r requirements.txt
python main.py
```

Optional: set class labels explicitly when using a different model/label order.

```powershell
$env:CLASS_LABELS = "Asthma,Bronchiectasis,Bronchiolitis,COPD,Healthy,LRTI,Pneumonia,URTI"
python main.py
```

## 3. Start frontend

Open a new terminal:

```powershell
cd frontend
npm install
npm run dev
```

## Quick health checks

```powershell
curl.exe -s -o NUL -w "Backend: %{http_code}`n" http://localhost:8000/docs
curl.exe -s -o NUL -w "ML: %{http_code}`n" http://localhost:8001/health
curl.exe -s -o NUL -w "Frontend: %{http_code}`n" http://localhost:5173
```

## ML prediction test

Use multipart field name `audio_file`:

```powershell
curl.exe -X POST http://localhost:8001/predict -F "audio_file=@test_audio.wav"
```

## Notes

- Backend endpoint `/api/analysis/lung-disease` forwards audio to ML service.
- If prediction fails with class-index errors, ensure model output dimension and `CLASS_LABELS` match.