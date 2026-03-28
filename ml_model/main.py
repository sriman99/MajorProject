import os
import librosa
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import aiofiles
import asyncio

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model
MODEL_PATH = os.getenv("MODEL_PATH", "prediction_lung_disease_model.keras")
model = tf.keras.models.load_model(MODEL_PATH)

# Default disease classes used by the trained model. Override with CLASS_LABELS env var
# if your deployed model uses a different label order.
DEFAULT_CLASSES = [
    "Asthma",
    "Bronchiectasis",
    "Bronchiolitis",
    "COPD",
    "Healthy",
    "LRTI",
    "Pneumonia",
    "URTI",
]


def resolve_class_labels(num_outputs: int):
    env_labels = os.getenv("CLASS_LABELS", "").strip()
    if env_labels:
        labels = [label.strip() for label in env_labels.split(",") if label.strip()]
        if len(labels) == num_outputs:
            return labels

    if len(DEFAULT_CLASSES) == num_outputs:
        return DEFAULT_CLASSES

    # Keep the API stable even if model classes and configured labels drift.
    return [f"class_{idx}" for idx in range(num_outputs)]

def extract_features(file_path, max_pad_len=862):
    """Extract MFCC features from audio file"""
    try:
        y, sr = librosa.load(file_path, sr=None)
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
        pad_width = max_pad_len - mfcc.shape[1]
        if pad_width > 0:
            mfcc = np.pad(mfcc, pad_width=((0, 0), (0, pad_width)), mode='constant')
        else:
            mfcc = mfcc[:, :max_pad_len]
        return mfcc
    except Exception as e:
        raise ValueError(f"Error processing audio file: {str(e)}")

@app.post("/predict")
async def predict_disease(audio_file: UploadFile = File(...)):
    """
    Endpoint to predict respiratory disease from audio file
    """
    # Check file extension and mimetype
    filename = audio_file.filename.lower()
    if not (filename.endswith('.wav') or filename.endswith('.wave')):
        raise HTTPException(status_code=400, detail="Please upload a WAV file")

    tmp_path = None
    try:
        # Create temporary file
        tmp_fd, tmp_path = tempfile.mkstemp(suffix='.wav')
        os.close(tmp_fd)  # Close the file descriptor

        # Save the uploaded file temporarily using async file operations
        content = await audio_file.read()
        async with aiofiles.open(tmp_path, 'wb') as tmp_file:
            await tmp_file.write(content)

        # Extract features (run in executor to avoid blocking)
        loop = asyncio.get_running_loop()
        features = await loop.run_in_executor(None, extract_features, tmp_path)
        features = np.expand_dims(features, axis=[0, -1])  # Add batch and channel dimensions

        # Make prediction (run in executor to avoid blocking)
        prediction = await loop.run_in_executor(None, lambda: model.predict(features, verbose=0))

        if prediction is None or len(prediction) == 0:
            raise ValueError("Model returned empty prediction output")

        probabilities = np.asarray(prediction[0]).ravel()
        if probabilities.size == 0:
            raise ValueError("Model returned invalid prediction probabilities")

        classes = resolve_class_labels(probabilities.size)
        predicted_idx = int(np.argmax(probabilities))
        predicted_class = classes[predicted_idx]
        confidence = float(np.max(probabilities))

        predictions_map = {
            class_name: float(prob)
            for class_name, prob in zip(classes, probabilities)
        }

        return {
            "disease": predicted_class,
            "confidence": confidence,
            "predictions": predictions_map
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Error processing audio: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")
    finally:
        # Clean up temporary file
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except Exception:
                pass  # Ignore cleanup errors

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)