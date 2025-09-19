import pandas as pd
from sklearn.tree import DecisionTreeClassifier
import joblib, os

MODEL_PATH = "models/soil_crop.pkl"

def train_recommendation():
    df = pd.read_csv("data/soil_crop.csv")
    X = df[["N","P","K","pH","soil_type","rainfall"]]
    y = df["label"]
    model = DecisionTreeClassifier(max_depth=5)
    model.fit(X, y)
    joblib.dump(model, MODEL_PATH)

def recommend_crop(features):
    model = joblib.load(MODEL_PATH)
    pred = model.predict([features])
    return pred[0]
