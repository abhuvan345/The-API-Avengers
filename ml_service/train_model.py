# train_model.py (extended)

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score
from sklearn.ensemble import RandomForestClassifier
import xgboost as xgb
import lightgbm as lgb
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.utils import to_categorical
import joblib
import os

# Paths
RAW_DATA_PATH = os.path.join("..", "data", "raw", "crop_data.csv")
PROCESSED_PATH = os.path.join("..", "data", "processed")

# Load Dataset
df = pd.read_csv(RAW_DATA_PATH)

X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
y = df['label']

# Encode target labels
le_crop = LabelEncoder()
y_encoded = le_crop.fit_transform(y)
num_classes = len(le_crop.classes_)

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_encoded, test_size=0.2, random_state=42)

# ---- Random Forest ----
rf_model = RandomForestClassifier(n_estimators=200, random_state=42)
rf_model.fit(X_train, y_train)
y_pred_rf = rf_model.predict(X_test)
print("RandomForest accuracy:", accuracy_score(y_test, y_pred_rf))

# ---- XGBoost ----
xgb_model = xgb.XGBClassifier(use_label_encoder=False, eval_metric='mlogloss')
xgb_model.fit(X_train, y_train)
y_pred_xgb = xgb_model.predict(X_test)
print("XGBoost accuracy:", accuracy_score(y_test, y_pred_xgb))

# ---- LightGBM ----
lgb_model = lgb.LGBMClassifier()
lgb_model.fit(X_train, y_train)
y_pred_lgb = lgb_model.predict(X_test)
print("LightGBM accuracy:", accuracy_score(y_test, y_pred_lgb))

# ---- Neural Network (Keras) ----
y_train_cat = to_categorical(y_train, num_classes=num_classes)
y_test_cat = to_categorical(y_test, num_classes=num_classes)

nn_model = Sequential([
    Dense(64, activation='relu', input_shape=(X_train.shape[1],)),
    Dense(64, activation='relu'),
    Dense(num_classes, activation='softmax')
])

nn_model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
nn_model.fit(X_train, y_train_cat, epochs=50, batch_size=32, verbose=0)
nn_acc = nn_model.evaluate(X_test, y_test_cat, verbose=0)[1]
print("Neural Network accuracy:", nn_acc)

# ---- Save all bundles ----
os.makedirs(PROCESSED_PATH, exist_ok=True)

bundles = {
    'random_forest': {'model': rf_model, 'scaler': scaler, 'le_crop': le_crop},
    'xgboost': {'model': xgb_model, 'scaler': scaler, 'le_crop': le_crop},
    'lightgbm': {'model': lgb_model, 'scaler': scaler, 'le_crop': le_crop},
    'neural_network': {'model': nn_model, 'scaler': scaler, 'le_crop': le_crop}
}

for name, bundle in bundles.items():
    joblib.dump(bundle, os.path.join(PROCESSED_PATH, f'{name}_bundle.joblib'))

print("All models saved in", PROCESSED_PATH)
