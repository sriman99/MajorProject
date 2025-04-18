# Respiratory Disease Classification Model

This directory contains a deep learning model for classifying respiratory diseases from audio recordings of respiratory sounds.

## Model Architecture

The model uses a hybrid CNN-GRU (Convolutional Neural Network + Gated Recurrent Unit) architecture:
- Input: MFCC features from respiratory audio (shape: 40x862x1)
- 2 Convolutional layers with BatchNormalization
- Bidirectional GRU layer
- Dense layers with dropout for final classification

## Features
- Audio preprocessing using librosa
- MFCC (Mel-frequency cepstral coefficients) feature extraction
- Data augmentation techniques:
  - Noise injection
  - Time stretching
  - Pitch shifting

## Supported Diseases
The model can classify various respiratory conditions including:
- Bronchiectasis
- Bronchiolitis
- Pneumonia
- URTI (Upper Respiratory Tract Infection)
- LRTI (Lower Respiratory Tract Infection)

## Model Files
- `prediction_lung_disease_model.keras`: Trained model file
- `Respiratory_Disease_Classifier.ipynb`: Training notebook

## Requirements
```
tensorflow
librosa
numpy
fastapi
python-multipart
uvicorn
```

## API Usage
The model is exposed through a FastAPI endpoint. To use the model:

1. Send a POST request to `/predict` endpoint
2. Upload an audio file (WAV format)
3. Receive the prediction response with disease classification

See the `/backend` directory for API implementation details.