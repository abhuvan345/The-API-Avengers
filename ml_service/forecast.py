from prophet import Prophet
import pandas as pd
import joblib, os

MODEL_PATH = "models/rainfall_prophet.pkl"

def train_rainfall():
    df = pd.read_csv("data/rainfall.csv")   # columns: ds,y (date,rainfall mm)
    m = Prophet(yearly_seasonality=True)
    m.fit(df)
    joblib.dump(m, MODEL_PATH)

def forecast_rainfall(periods=12):
    m = joblib.load(MODEL_PATH)
    future = m.make_future_dataframe(periods=periods, freq='M')
    fc = m.predict(future)
    return fc[["ds","yhat"]].tail(periods).to_dict(orient="records")
