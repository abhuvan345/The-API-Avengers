import pandas as pd

def get_market_price(market, crop):
    df = pd.read_csv("data/market_prices.csv")  # Date,Market,Crop,Price
    f = df[(df["Market"]==market) & (df["Crop"]==crop)]
    if f.empty:
        return None
    return f.sort_values("Date").tail(1)["Price"].values[0]
