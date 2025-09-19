# src/train_recommender.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib, os

os.makedirs("../models", exist_ok=True)

df = pd.read_csv("../data/processed/crop_data.csv") 
# expected cols: N,P,K,ph,rainfall,soil_type,label (label = recommended crop)

# Encode soil_type & label
le_soil = LabelEncoder(); df['soil_enc'] = le_soil.fit_transform(df['soil_type'])
le_crop = LabelEncoder(); df['crop_enc'] = le_crop.fit_transform(df['label'])

X = df[['N','P','K','ph','rainfall','soil_enc']]
y = df['crop_enc']
X_train, X_test, y_train, y_test = train_test_split(X,y,test_size=0.2, random_state=42)

scaler = StandardScaler().fit(X_train)
X_train_s = scaler.transform(X_train)
X_test_s  = scaler.transform(X_test)

clf = RandomForestClassifier(n_estimators=200, random_state=42)
clf.fit(X_train_s, y_train)
pred = clf.predict(X_test_s)
print("Accuracy:", accuracy_score(y_test, pred))

# save model + encoders + scaler
joblib.dump({
    "model": clf,
    "le_crop": le_crop,
    "le_soil": le_soil,
    "scaler": scaler
}, "../models/crop_recommender.pkl")
print("Saved crop_recommender.pkl")
