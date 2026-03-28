# Respiratory Disease Classification Service

This folder contains the ML inference service used by the backend for respiratory disease prediction.

## What this service does

- Loads `prediction_lung_disease_model.keras`
- Accepts WAV audio uploads on `POST /predict`
- Extracts MFCC features (`40 x 862`)
- Returns predicted disease, confidence, and class probabilities

## Service setup

### 1. Create and activate a virtual environment (recommended)

```powershell
cd ml_model
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 2. Install dependencies

```powershell
pip install -r requirements.txt
```

### 3. Start the ML service

```powershell
python main.py
```

Service URL: `http://localhost:8001`

## API endpoints

- `GET /health` - health check
- `POST /predict` - model inference (multipart upload)

## Correct curl test command

The upload field name must be `audio_file`:

```powershell
curl.exe -X POST http://localhost:8001/predict -F "audio_file=@test_audio.wav"
```

## Class label configuration

The model output dimension must match the configured label count.

- The service defaults to 8 labels:
  - Asthma
  - Bronchiectasis
  - Bronchiolitis
  - COPD
  - Healthy
  - LRTI
  - Pneumonia
  - URTI
- If your model uses a different label order, set `CLASS_LABELS` before starting the service.

Example:

```powershell
$env:CLASS_LABELS = "Asthma,Bronchiectasis,Bronchiolitis,COPD,Healthy,LRTI,Pneumonia,URTI"
python main.py
```

## Common troubleshooting

- `422 Unprocessable Entity` on `/predict`:
  - Usually wrong multipart field name. Use `audio_file`.
- `500 Internal error: list index out of range`:
  - Class labels do not match model output size/order.
  - Set `CLASS_LABELS` correctly or use a model trained with matching labels.

## Model files

- `prediction_lung_disease_model.keras` - trained model
- `Respiratory_Disease_Classifier.ipynb` - training notebook

See backend integration in `backend/main.py` (`/api/analysis/lung-disease`).