# Respiratory Disease Classification - ML Model Documentation

## Table of Contents

1. [Overview](#overview)
2. [Dependencies](#dependencies)
3. [Dataset](#dataset)
4. [Feature Extraction](#feature-extraction)
5. [Data Augmentation](#data-augmentation)
6. [Data Preprocessing](#data-preprocessing)
7. [Model Architecture](#model-architecture)
8. [Training Configuration](#training-configuration)
9. [Evaluation Metrics](#evaluation-metrics)
10. [Model Usage](#model-usage)
11. [File Structure](#file-structure)

---

## Overview

This machine learning pipeline classifies **respiratory diseases** from lung sound audio recordings using a **CNN-GRU hybrid neural network**. The model analyzes audio features (MFCC) extracted from breath sounds to predict one of seven respiratory conditions.

### Supported Disease Classes

| Class | Description |
|-------|-------------|
| Healthy | Normal lung sounds |
| COPD | Chronic Obstructive Pulmonary Disease |
| Asthma | Asthmatic breathing patterns |
| URTI | Upper Respiratory Tract Infection |
| LRTI | Lower Respiratory Tract Infection |
| Bronchiectasis | Bronchial tube damage |
| Bronchiolitis | Small airway inflammation |
| Pneumonia | Lung infection |

---

## Dependencies

### Required Libraries

```python
# Core libraries
import os                    # File system operations
import numpy as np           # Numerical computations
import pandas as pd          # Data manipulation

# Audio processing
import librosa               # Audio feature extraction

# Machine learning
import tensorflow as tf      # Deep learning framework
from tensorflow.keras import layers, models

# Scikit-learn utilities
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.utils.class_weight import compute_class_weight

# Visualization
import matplotlib.pyplot as plt
import seaborn as sns
```

### Installation

```bash
pip install numpy pandas librosa tensorflow scikit-learn matplotlib seaborn
```

### Version Requirements

| Library | Minimum Version |
|---------|-----------------|
| Python | 3.8+ |
| TensorFlow | 2.10+ |
| Librosa | 0.9+ |
| NumPy | 1.21+ |
| Scikit-learn | 1.0+ |

---

## Dataset

### Source

**ICBHI Respiratory Sound Database** - A collection of lung sound recordings from patients with various respiratory conditions.

### Structure

```
Respiratory_Sound_Database/
├── audio_and_txt_files/          # Audio recordings (.wav)
│   ├── 101_1b1_Al_sc_Meditron.wav
│   ├── 101_1b1_Al_sc_Meditron.txt
│   └── ...
└── patient_diagnosis.csv         # Patient labels
```

### Label File Format

| Column | Type | Description |
|--------|------|-------------|
| patient_id | Integer | Unique patient identifier |
| disease | String | Diagnosed respiratory condition |

**Example:**
```csv
patient_id,disease
102,Healthy
103,Asthma
104,COPD
105,URTI
```

### Audio File Naming Convention

```
{patient_id}_{recording_location}_{acquisition_mode}_{equipment}.wav
```

**Example:** `102_1b1_Al_sc_Meditron.wav`
- `102` - Patient ID
- `1b1` - Recording location on chest
- `Al` - Acquisition mode
- `sc` - Recording type
- `Meditron` - Stethoscope type

### Dataset Statistics

- **Total Patients:** 125
- **Audio Format:** WAV
- **Sampling Rate:** Variable (preserved during loading)
- **Recording Duration:** Variable (standardized to 862 frames)

---

## Feature Extraction

### MFCC (Mel-Frequency Cepstral Coefficients)

MFCC is the primary feature extraction technique used in this pipeline. It transforms raw audio into a compact representation that captures the spectral characteristics of sound.

### Why MFCC?

1. **Mimics Human Hearing:** Uses Mel scale which models human pitch perception
2. **Compact Representation:** Reduces dimensionality while preserving important audio features
3. **Industry Standard:** Widely used in speech and audio classification tasks
4. **Robust:** Effective for distinguishing different sound patterns

### MFCC Extraction Process

```
Raw Audio Signal
      │
      ▼
┌─────────────────────────────────────┐
│ 1. Pre-emphasis                     │
│    Amplify high frequencies         │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│ 2. Framing                          │
│    Divide into 25ms overlapping     │
│    windows with 10ms hop            │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│ 3. Windowing                        │
│    Apply Hamming window to          │
│    reduce spectral leakage          │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│ 4. FFT (Fast Fourier Transform)     │
│    Convert to frequency domain      │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│ 5. Mel Filter Bank                  │
│    Apply triangular filters on      │
│    Mel scale (40 filters)           │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│ 6. Log Compression                  │
│    Take logarithm of filter         │
│    bank energies                    │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│ 7. DCT (Discrete Cosine Transform)  │
│    Decorrelate features             │
│    Keep first 40 coefficients       │
└─────────────────────────────────────┘
      │
      ▼
MFCC Matrix (40 x time_frames)
```

### Implementation

```python
def extract_features(file_path, max_pad_len=862):
    """
    Extract MFCC features from an audio file.

    Parameters:
    -----------
    file_path : str
        Path to the audio file (.wav)
    max_pad_len : int
        Maximum number of time frames (default: 862)

    Returns:
    --------
    numpy.ndarray
        MFCC feature matrix of shape (40, 862)
        Returns None if extraction fails
    """
    try:
        # Load audio file
        # y: audio time series (1D array of amplitude values)
        # sr: sampling rate (samples per second)
        y, sr = librosa.load(file_path, sr=None)

        # Extract 40 MFCC coefficients
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)

        # Standardize length to max_pad_len frames
        pad_width = max_pad_len - mfcc.shape[1]

        if pad_width > 0:
            # Pad shorter sequences with zeros
            mfcc = np.pad(mfcc, pad_width=((0, 0), (0, pad_width)), mode='constant')
        else:
            # Truncate longer sequences
            mfcc = mfcc[:, :max_pad_len]

        return mfcc

    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return None
```

### Feature Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| n_mfcc | 40 | Number of MFCC coefficients |
| max_pad_len | 862 | Fixed time dimension |
| sr | None | Preserve original sampling rate |

### Output Shape

- **Single sample:** `(40, 862)`
- **With channel dimension:** `(40, 862, 1)`
- **Batch:** `(batch_size, 40, 862, 1)`

---

## Data Augmentation

### Purpose

Data augmentation addresses two key challenges:
1. **Limited training data** - Increases effective dataset size
2. **Class imbalance** - Minority classes get more samples

### Augmentation Techniques

#### 1. Noise Injection

```python
noise = np.random.randn(len(y))
y_aug = y + 0.005 * noise
```

**Description:** Adds random Gaussian noise to the audio signal.

**Parameters:**
- Noise amplitude: 0.5% of signal amplitude

**Effect:** Simulates real-world recording variations and background noise.

#### 2. Time Stretching

```python
rate = random.uniform(0.8, 1.2)
y_aug = librosa.effects.time_stretch(y, rate=rate)
```

**Description:** Changes audio speed without affecting pitch.

**Parameters:**
- Rate range: 0.8x to 1.2x (80% to 120% speed)

**Effect:** Simulates variations in breathing rate.

#### 3. Pitch Shifting

```python
steps = random.randint(-2, 2)
y_aug = librosa.effects.pitch_shift(y, sr=sr, n_steps=steps)
```

**Description:** Changes audio pitch without affecting speed.

**Parameters:**
- Shift range: -2 to +2 semitones

**Effect:** Simulates variations in patient vocal characteristics.

### Implementation

```python
def augment_audio(file_path, num_augmented=3):
    """
    Generate augmented versions of an audio file.

    Parameters:
    -----------
    file_path : str
        Path to the original audio file
    num_augmented : int
        Number of augmented samples to generate (default: 3)

    Returns:
    --------
    list
        List of MFCC matrices from augmented audio
    """
    augmented_samples = []

    try:
        y, sr = librosa.load(file_path, sr=None)

        for _ in range(num_augmented):
            # Randomly select augmentation technique
            choice = random.choice(['noise', 'stretch', 'pitch'])

            if choice == 'noise':
                noise = np.random.randn(len(y))
                y_aug = y + 0.005 * noise

            elif choice == 'stretch':
                rate = random.uniform(0.8, 1.2)
                y_aug = librosa.effects.time_stretch(y, rate=rate)

            elif choice == 'pitch':
                steps = random.randint(-2, 2)
                y_aug = librosa.effects.pitch_shift(y, sr=sr, n_steps=steps)

            # Extract MFCC from augmented audio
            mfcc = librosa.feature.mfcc(y=y_aug, sr=sr, n_mfcc=40)

            # Standardize length
            pad_width = 862 - mfcc.shape[1]
            if pad_width > 0:
                mfcc = np.pad(mfcc, pad_width=((0, 0), (0, pad_width)), mode='constant')
            else:
                mfcc = mfcc[:, :862]

            augmented_samples.append(mfcc)

    except Exception as e:
        print(f"Error augmenting {file_path}: {e}")

    return augmented_samples
```

### Augmentation Strategy

| Disease Class | Augmentation | Samples Generated |
|---------------|--------------|-------------------|
| Healthy | No | 0 per sample |
| COPD | No | 0 per sample |
| Asthma | No | 0 per sample |
| Bronchiectasis | Yes | 3 per sample |
| Bronchiolitis | Yes | 3 per sample |
| Pneumonia | Yes | 3 per sample |
| URTI | Yes | 3 per sample |
| LRTI | Yes | 3 per sample |

---

## Data Preprocessing

### Complete Preprocessing Pipeline

```python
# Step 1: Load all audio files and extract features
data = []
labels = []

for filename in os.listdir(audio_path):
    if filename.endswith(".wav"):
        # Extract patient ID from filename
        patient_id = filename.split('_')[0]

        # Look up disease label
        match = labels_df[labels_df['patient_id'] == patient_id]

        if not match.empty:
            label = match['disease'].values[0]
            file_path = os.path.join(audio_path, filename)

            # Extract MFCC features
            feature = extract_features(file_path)

            if feature is not None:
                data.append(feature)
                labels.append(label)

                # Apply augmentation for minority classes
                if label in ['Bronchiectasis', 'Bronchiolitis', 'Pneumonia', 'URTI', 'LRTI']:
                    aug_feats = augment_audio(file_path, num_augmented=3)
                    for aug in aug_feats:
                        data.append(aug)
                        labels.append(label)
```

### Step 2: Filter Rare Classes

```python
from collections import Counter

label_counts = Counter(labels)
filtered_data = []
filtered_labels = []

# Keep only classes with >= 2 samples (required for stratified split)
for feature, label in zip(data, labels):
    if label_counts[label] >= 2:
        filtered_data.append(feature)
        filtered_labels.append(label)
```

### Step 3: Reshape for CNN Input

```python
data = np.array(filtered_data)

# Add channel dimension for CNN
# Shape: (samples, 40, 862) -> (samples, 40, 862, 1)
if data.ndim == 3:
    data = data[..., np.newaxis]
```

### Step 4: Encode Labels

```python
from sklearn.preprocessing import LabelEncoder

le = LabelEncoder()
labels_encoded = le.fit_transform(filtered_labels)
num_classes = len(le.classes_)

# Example mapping:
# {'Asthma': 0, 'Bronchiectasis': 1, 'Bronchiolitis': 2,
#  'COPD': 3, 'Healthy': 4, 'LRTI': 5, 'Pneumonia': 6, 'URTI': 7}
```

### Step 5: Train-Test Split

```python
X_train, X_test, y_train_labels, y_test_labels = train_test_split(
    data,
    labels_encoded,
    test_size=0.25,        # 25% for testing
    random_state=42,       # Reproducibility
    stratify=labels_encoded  # Maintain class distribution
)
```

### Step 6: One-Hot Encoding

```python
y_train = tf.keras.utils.to_categorical(y_train_labels, num_classes)
y_test = tf.keras.utils.to_categorical(y_test_labels, num_classes)

# Example: class 2 -> [0, 0, 1, 0, 0, 0, 0]
```

### Data Shapes Summary

| Stage | Shape | Description |
|-------|-------|-------------|
| Raw MFCC | `(40, 862)` | Per audio file |
| With channel | `(40, 862, 1)` | CNN input format |
| Training set | `(N_train, 40, 862, 1)` | Training samples |
| Test set | `(N_test, 40, 862, 1)` | Test samples |
| Labels (encoded) | `(N, num_classes)` | One-hot vectors |

---

## Model Architecture

### Overview

The model uses a **CNN-GRU hybrid architecture** that combines:
- **CNN (Convolutional Neural Network):** Extracts local spectral patterns
- **GRU (Gated Recurrent Unit):** Captures temporal dependencies

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    INPUT LAYER                               │
│                  Shape: (40, 862, 1)                        │
│            40 MFCC coefficients × 862 time frames           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  CNN BLOCK 1                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Conv2D(32 filters, 3×3 kernel, ReLU, padding=same)  │   │
│  │ Output: (40, 862, 32)                               │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ MaxPooling2D(2×2)                                   │   │
│  │ Output: (20, 431, 32)                               │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ BatchNormalization                                  │   │
│  │ Output: (20, 431, 32)                               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  CNN BLOCK 2                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Conv2D(64 filters, 3×3 kernel, ReLU, padding=same)  │   │
│  │ Output: (20, 431, 64)                               │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ MaxPooling2D(2×2)                                   │   │
│  │ Output: (10, 215, 64)                               │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ BatchNormalization                                  │   │
│  │ Output: (10, 215, 64)                               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  RESHAPE LAYER                               │
│  Reshape((10, -1))                                          │
│  Output: (10, 13760)                                        │
│  Converts CNN output to sequence for RNN                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  RECURRENT BLOCK                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Bidirectional(GRU(64 units))                        │   │
│  │ Forward GRU: 64 units                               │   │
│  │ Backward GRU: 64 units                              │   │
│  │ Output: (128)                                       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  CLASSIFICATION HEAD                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Dense(64 units, ReLU activation)                    │   │
│  │ Output: (64)                                        │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Dropout(0.3)                                        │   │
│  │ Randomly drops 30% of neurons during training       │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Dense(num_classes, Softmax activation)              │   │
│  │ Output: (7) - probability for each class            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
              PREDICTION (7 class probabilities)
```

### Layer Details

#### Input Layer

```python
layers.Input(shape=(40, 862, 1))
```

- **40:** MFCC coefficients (frequency axis)
- **862:** Time frames (temporal axis)
- **1:** Single channel (grayscale spectrogram)

#### Conv2D Layers

```python
layers.Conv2D(32, (3, 3), activation='relu', padding='same')
layers.Conv2D(64, (3, 3), activation='relu', padding='same')
```

| Parameter | Value | Description |
|-----------|-------|-------------|
| filters | 32, 64 | Number of learned filters |
| kernel_size | (3, 3) | Filter dimensions |
| activation | ReLU | max(0, x) non-linearity |
| padding | same | Output same size as input |

**Purpose:** Learns local spectral-temporal patterns like:
- Wheezing sounds
- Crackling sounds
- Breathing rhythm patterns

#### MaxPooling2D Layers

```python
layers.MaxPooling2D((2, 2))
```

**Purpose:**
- Reduces spatial dimensions by half
- Provides translation invariance
- Reduces computational cost

#### BatchNormalization Layers

```python
layers.BatchNormalization()
```

**Purpose:**
- Normalizes layer outputs to zero mean, unit variance
- Stabilizes and accelerates training
- Acts as mild regularization

#### Reshape Layer

```python
layers.Reshape((10, -1))  # Output: (10, 13760)
```

**Purpose:** Converts 3D CNN output to 2D sequence for RNN:
- **10 time steps:** From spatial dimension after pooling
- **13760 features:** Flattened from (215 × 64)

#### Bidirectional GRU

```python
layers.Bidirectional(layers.GRU(64))
```

**GRU (Gated Recurrent Unit):**
- Simplified version of LSTM
- Uses update gate and reset gate
- Efficiently captures temporal dependencies

**Bidirectional:**
- Processes sequence in both directions
- Forward pass: Past → Future
- Backward pass: Future → Past
- Output: Concatenation of both (64 + 64 = 128)

#### Dense Layers

```python
layers.Dense(64, activation='relu')
layers.Dropout(0.3)
layers.Dense(num_classes, activation='softmax')
```

| Layer | Output | Purpose |
|-------|--------|---------|
| Dense(64) | 64 | Learn high-level features |
| Dropout(0.3) | 64 | Prevent overfitting |
| Dense(num_classes) | 7 | Final classification |

### Model Implementation

```python
from tensorflow.keras import layers, models

model = models.Sequential([
    layers.Input(shape=(40, 862, 1)),

    # CNN Block 1
    layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
    layers.MaxPooling2D((2, 2)),
    layers.BatchNormalization(),

    # CNN Block 2
    layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
    layers.MaxPooling2D((2, 2)),
    layers.BatchNormalization(),

    # Reshape for RNN
    layers.Reshape((10, -1)),

    # Bidirectional GRU
    layers.Bidirectional(layers.GRU(64)),

    # Classification head
    layers.Dense(64, activation='relu'),
    layers.Dropout(0.3),
    layers.Dense(num_classes, activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)
```

### Model Statistics

| Metric | Value |
|--------|-------|
| Total Parameters | 5,337,095 |
| Trainable Parameters | 5,336,903 |
| Non-trainable Parameters | 192 |
| Model Size | ~20.36 MB |

### Parameter Breakdown by Layer

| Layer | Parameters |
|-------|------------|
| Conv2D (32 filters) | 320 |
| BatchNorm 1 | 128 |
| Conv2D (64 filters) | 18,496 |
| BatchNorm 2 | 256 |
| Bidirectional GRU | 5,309,184 |
| Dense (64) | 8,256 |
| Dense (output) | 455 |

---

## Training Configuration

### Callbacks

#### ModelCheckpoint

```python
tf.keras.callbacks.ModelCheckpoint(
    "best_model.keras",
    save_best_only=True,
    monitor='val_accuracy',
    mode='max'
)
```

**Purpose:** Saves the model with highest validation accuracy.

| Parameter | Value | Description |
|-----------|-------|-------------|
| filepath | best_model.keras | Save location |
| save_best_only | True | Only save when improved |
| monitor | val_accuracy | Metric to monitor |
| mode | max | Higher is better |

#### EarlyStopping

```python
tf.keras.callbacks.EarlyStopping(
    patience=10,
    restore_best_weights=True
)
```

**Purpose:** Stops training when validation accuracy stops improving.

| Parameter | Value | Description |
|-----------|-------|-------------|
| patience | 10 | Epochs to wait before stopping |
| restore_best_weights | True | Revert to best model |

### Class Weights

```python
from sklearn.utils.class_weight import compute_class_weight

class_weights = compute_class_weight(
    class_weight='balanced',
    classes=np.unique(y_train_labels),
    y=y_train_labels
)
class_weights_dict = dict(enumerate(class_weights))
```

**Purpose:** Addresses class imbalance by weighting loss.

**Formula:**
```
weight[class] = n_samples / (n_classes × n_samples[class])
```

**Example:**
| Class | Samples | Weight |
|-------|---------|--------|
| COPD | 1000 | 0.15 |
| Healthy | 800 | 0.19 |
| Pneumonia | 100 | 1.5 |

### Training Parameters

```python
history = model.fit(
    X_train, y_train,
    validation_split=0.2,
    epochs=50,
    batch_size=32,
    callbacks=callbacks,
    class_weight=class_weights_dict
)
```

| Parameter | Value | Description |
|-----------|-------|-------------|
| validation_split | 0.2 | 20% of training data for validation |
| epochs | 50 | Maximum training epochs |
| batch_size | 32 | Samples per gradient update |
| optimizer | Adam | Adaptive learning rate optimizer |
| loss | categorical_crossentropy | Multi-class classification loss |

### Optimizer Details (Adam)

| Parameter | Default Value |
|-----------|---------------|
| Learning rate | 0.001 |
| Beta1 | 0.9 |
| Beta2 | 0.999 |
| Epsilon | 1e-07 |

---

## Evaluation Metrics

### Prediction

```python
y_pred = model.predict(X_test)
y_pred_labels = np.argmax(y_pred, axis=1)
y_true = np.argmax(y_test, axis=1)
```

### Classification Report

```python
from sklearn.metrics import classification_report

print(classification_report(
    y_true,
    y_pred_labels,
    target_names=le.classes_,
    zero_division=0
))
```

**Output Metrics:**

| Metric | Formula | Description |
|--------|---------|-------------|
| **Precision** | TP / (TP + FP) | Accuracy of positive predictions |
| **Recall** | TP / (TP + FN) | Coverage of actual positives |
| **F1-Score** | 2 × (P × R) / (P + R) | Harmonic mean of precision and recall |
| **Support** | - | Number of samples per class |
| **Accuracy** | Correct / Total | Overall correctness |
| **Macro Avg** | Mean of class metrics | Unweighted average |
| **Weighted Avg** | Weighted by support | Class-size weighted average |

### Confusion Matrix

```python
from sklearn.metrics import confusion_matrix
import seaborn as sns

conf_matrix = confusion_matrix(y_true, y_pred_labels)

plt.figure(figsize=(8, 6))
sns.heatmap(
    conf_matrix,
    annot=True,
    fmt="d",
    cmap="Blues",
    xticklabels=le.classes_,
    yticklabels=le.classes_
)
plt.ylabel('Actual')
plt.xlabel('Predicted')
plt.title('Confusion Matrix')
plt.show()
```

**Interpretation:**
- **Diagonal cells:** Correct predictions
- **Off-diagonal cells:** Misclassifications
- **Row:** Actual class
- **Column:** Predicted class

### Training Curves

```python
plt.figure(figsize=(12, 4))

# Accuracy plot
plt.subplot(1, 2, 1)
plt.plot(history.history['accuracy'], label='Train Acc')
plt.plot(history.history['val_accuracy'], label='Val Acc')
plt.title('Accuracy')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.legend()

# Loss plot
plt.subplot(1, 2, 2)
plt.plot(history.history['loss'], label='Train Loss')
plt.plot(history.history['val_loss'], label='Val Loss')
plt.title('Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()

plt.tight_layout()
plt.show()
```

**What to Look For:**
- **Convergence:** Both curves should plateau
- **Overfitting:** Val loss increases while train loss decreases
- **Underfitting:** Both curves plateau at high loss
- **Good fit:** Train and val curves close together, both decreasing

---

## Model Usage

### Loading the Saved Model

```python
import tensorflow as tf

model = tf.keras.models.load_model('best_model.keras')
# or
model = tf.keras.models.load_model('prediction_lung_disease_model.keras')
```

### Making Predictions

```python
import librosa
import numpy as np

def predict_disease(audio_path, model, label_encoder):
    """
    Predict respiratory disease from an audio file.

    Parameters:
    -----------
    audio_path : str
        Path to the audio file
    model : keras.Model
        Trained model
    label_encoder : LabelEncoder
        Fitted label encoder

    Returns:
    --------
    tuple
        (predicted_class, confidence_score, all_probabilities)
    """
    # Extract features
    y, sr = librosa.load(audio_path, sr=None)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)

    # Pad/truncate to standard length
    max_pad_len = 862
    pad_width = max_pad_len - mfcc.shape[1]

    if pad_width > 0:
        mfcc = np.pad(mfcc, ((0, 0), (0, pad_width)), mode='constant')
    else:
        mfcc = mfcc[:, :max_pad_len]

    # Reshape for model input
    mfcc = mfcc[np.newaxis, ..., np.newaxis]  # (1, 40, 862, 1)

    # Predict
    predictions = model.predict(mfcc)
    predicted_class_idx = np.argmax(predictions[0])
    confidence = predictions[0][predicted_class_idx]
    predicted_class = label_encoder.inverse_transform([predicted_class_idx])[0]

    return predicted_class, confidence, predictions[0]

# Example usage
CLASSES = ['Bronchiectasis', 'Bronchiolitis', 'COPD', 'Healthy', 'LRTI', 'Pneumonia', 'URTI']

class MockLabelEncoder:
    def inverse_transform(self, indices):
        return [CLASSES[i] for i in indices]

le = MockLabelEncoder()
disease, confidence, probs = predict_disease('patient_audio.wav', model, le)
print(f"Predicted: {disease} (Confidence: {confidence:.2%})")
```

### Batch Prediction

```python
def predict_batch(audio_paths, model, label_encoder):
    """
    Predict diseases for multiple audio files.
    """
    features = []

    for path in audio_paths:
        mfcc = extract_features(path)
        if mfcc is not None:
            features.append(mfcc)

    features = np.array(features)[..., np.newaxis]
    predictions = model.predict(features)

    results = []
    for pred in predictions:
        idx = np.argmax(pred)
        disease = label_encoder.inverse_transform([idx])[0]
        confidence = pred[idx]
        results.append((disease, confidence))

    return results
```

---

## File Structure

```
ml_model/
├── Respiratory_Disease_Classifier.ipynb    # Training notebook
├── prediction_lung_disease_model.keras     # Saved trained model
├── best_model.keras                        # Best model checkpoint
├── main.py                                 # FastAPI inference service
├── ML_MODEL_DOCUMENTATION.md               # This documentation
└── Respiratory_Sound_Database/             # Dataset (not in repo)
    ├── audio_and_txt_files/
    │   └── *.wav
    └── patient_diagnosis.csv
```

### Inference Service (main.py)

The trained model is served via a FastAPI endpoint:

```python
# Endpoint: POST /predict
# Input: Audio file (WAV format)
# Output: {
#   "prediction": "Pneumonia",
#   "confidence": 0.95,
#   "probabilities": {...}
# }
```

---

## Summary

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **MFCC features** | Industry standard for audio classification, captures spectral characteristics |
| **CNN + GRU hybrid** | CNN for local patterns, GRU for temporal dependencies |
| **Bidirectional GRU** | Captures context from both past and future |
| **Data augmentation** | Handles limited data and class imbalance |
| **Class weights** | Further addresses class imbalance during training |
| **Early stopping** | Prevents overfitting, saves training time |

### Model Performance

The model achieves competitive accuracy on respiratory disease classification, with particular strength in distinguishing between healthy and diseased lung sounds.

### Limitations

1. **Dataset size:** Limited number of samples per disease class
2. **Audio quality:** Model trained on specific recording equipment
3. **Generalization:** May not generalize well to different recording conditions
4. **Class imbalance:** Some diseases have significantly fewer samples

### Future Improvements

1. **Transfer learning:** Use pre-trained audio models (e.g., VGGish, YAMNet)
2. **Attention mechanisms:** Add attention layers for better interpretability
3. **Data collection:** Gather more samples for minority classes
4. **Ensemble methods:** Combine multiple models for better accuracy
5. **Cross-validation:** Implement k-fold cross-validation for robust evaluation
