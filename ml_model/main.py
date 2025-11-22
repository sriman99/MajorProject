import os
import librosa
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import tempfile

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
MODEL_PATH = "../ml_model/prediction_lung_disease_model.keras"
model = tf.keras.models.load_model(MODEL_PATH)

# Disease classes (update these based on your model's classes)
CLASSES = ['Bronchiectasis', 'Bronchiolitis', 'LRTI', 'Pneumonia', 'URTI']

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
    """    # Check file extension and mimetype
    filename = audio_file.filename.lower()
    if not (filename.endswith('.wav') or filename.endswith('.wave')):
        return {"error": "Please upload a WAV file"}
    
    try:
        # Save the uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp:
            content = await audio_file.read()
            tmp.write(content)
            tmp_path = tmp.name

        # Extract features
        features = extract_features(tmp_path)
        features = np.expand_dims(features, axis=[0, -1])  # Add batch and channel dimensions

        # Make prediction
        prediction = model.predict(features)
        predicted_class = CLASSES[np.argmax(prediction[0])]
        confidence = float(np.max(prediction[0]))

        # Clean up
        os.unlink(tmp_path)

        return {
            "disease": predicted_class,
            "confidence": confidence,
            "predictions": {
                class_name: float(pred)
                for class_name, pred in zip(CLASSES, prediction[0])
            }
        }
    
    except Exception as e:
        return {"error": str(e)}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)