# Project Explanation — Healthcare Respiratory Disease Detection System

## High-Level Architecture (3 Microservices)

```
┌──────────┐       ┌──────────────────┐       ┌──────────────────┐
│ Frontend  │◄─────►│  Backend (8000)  │──────►│ ML Service (8001)│
│ React+TS  │  REST │  FastAPI + Mongo │ HTTP  │ FastAPI + TF     │
│ Vite      │  + WS │  Auth, CRUD, WS  │       │ Model Inference  │
└──────────┘       └──────────────────┘       └──────────────────┘
                          │
                    ┌─────┴─────┐
                    │  MongoDB  │
                    │ healthcare_db │
                    └───────────┘
```

**Why separate the ML service?** TensorFlow inference is CPU/GPU intensive. Keeping it in a separate process prevents it from blocking the main API (authentication, appointments, chat). It also allows independent scaling — you can run multiple ML instances behind a load balancer without duplicating the entire backend.

---

## ML Model — How to Explain It

### 1. The Model Architecture: CNN-GRU Hybrid

- It's a deep learning model that combines **Convolutional Neural Networks** (for spatial feature extraction from audio spectrograms) with **GRU layers** (a type of recurrent network that captures temporal patterns in breathing sounds).
- Saved as a Keras `.keras` file, loaded once at startup.

### 2. Feature Extraction: MFCC

- When a WAV audio file comes in, it's processed using **Librosa** (`ml_model/main.py:53-65`)
- **MFCC (Mel-Frequency Cepstral Coefficients)** — 40 coefficients are extracted. These represent the short-term power spectrum of audio in a way that mimics how the human ear perceives sound.
- The MFCC matrix is padded/truncated to a fixed width of **862 time frames**, giving a consistent input shape of `(40, 862)`.
- A batch and channel dimension are added → final shape: `(1, 40, 862, 1)`.

### 3. Prediction

- The model outputs a probability distribution across **8 classes**: Asthma, Bronchiectasis, Bronchiolitis, COPD, Healthy, LRTI, Pneumonia, URTI.
- The class with the highest probability is the predicted disease.
- Both the predicted class and confidence score are returned.

### 4. Why These Choices?

- **MFCC** is the standard for audio/speech analysis — it captures the tonal quality of respiratory sounds (wheezes, crackles, etc.)
- **CNN** detects local patterns (specific sound features), **GRU** captures how those patterns evolve over time (breathing cycles)
- **Separate service** avoids blocking the main API during inference

---

## End-to-End Flow — The Story to Tell

### Patient uploads a breathing audio sample:

1. **Frontend** → Patient records/uploads a `.wav` file on the Respiratory Analysis page
2. **Backend** (`POST /analysis/upload`, `main.py:1581`) →
   - Validates the file size
   - Saves to `uploads/` directory
   - Forwards the file to the ML service via `httpx.AsyncClient`
3. **ML Service** (`POST /predict`, `ml_model/main.py:67`) →
   - Saves to a temp file
   - Extracts MFCC features (40 coefficients × 862 frames)
   - Runs `model.predict()` in an executor (non-blocking)
   - Returns: `{ disease: "Pneumonia", confidence: 0.87, predictions: {...} }`
4. **Backend** processes the result (`main.py:1609-1650`) →
   - Maps confidence to severity: `<0.3` = normal, `<0.6` = warning, `≥0.6` = critical
   - Stores the full analysis in MongoDB `analysis` collection
   - Returns a user-friendly message like *"Strong indicators of Pneumonia detected"*
5. **Frontend** displays the result with severity color-coding and recommends consulting a doctor

### If ML service is down:

- The backend has a **graceful fallback** (`main.py:1654-1670`) — it still saves the file and returns a warning saying ML analysis is unavailable, rather than crashing.

---

## Backend Highlights Worth Mentioning

| Feature | How |
|---|---|
| **Auth** | JWT tokens (HS256), bcrypt password hashing, 10-hour expiry, role-based (admin/doctor/patient) |
| **Real-time Chat** | WebSocket between doctor and patient, messages stored in MongoDB |
| **Appointments** | Conflict detection on `{doctor_id, date, time}`, status workflow (pending→confirmed→completed) |
| **Rate Limiting** | SlowAPI to prevent abuse |
| **Notifications** | In-app notification system for appointments, analysis results |
| **Email Service** | Welcome emails, appointment confirmations/cancellations |

---

## Key Talking Points for Viva/Interview

1. **"Why microservices?"** — ML inference is compute-heavy; separating it prevents blocking the main API and allows independent scaling.
2. **"Why MFCC?"** — It's the gold standard for audio analysis; it captures how the human auditory system perceives sound frequencies.
3. **"Why CNN + GRU?"** — CNN extracts spatial features from the spectrogram, GRU captures temporal patterns across breathing cycles.
4. **"How do you handle failures?"** — Graceful fallback if ML service is down; the user still gets a response.
5. **"Security?"** — JWT auth, bcrypt hashing, rate limiting, file size validation, CORS restrictions, role-based access control.
6. **"Real-time?"** — WebSocket chat with connection management and MongoDB persistence.
