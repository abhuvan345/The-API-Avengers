import pandas as pd

def get_latest_price(market, crop):
    df = pd.read_csv("data/processed/market_prices.csv", parse_dates=['Date'])
    tok = df[(df.Market.str.lower()==market.lower()) & (df.Crop.str.lower()==crop.lower())]
    if tok.empty: 
        return None
    return float(tok.sort_values('Date').iloc[-1]['Price_per_qtl'])

def expected_income(price_per_qtl, avg_yield_kg_per_acre, acres):
    # convert price per qtl -> per kg
    price_per_kg = price_per_qtl / 100.0
    return price_per_kg * avg_yield_kg_per_acre * acres

def forecast_rainfall(location=None, season=None):
    """
    Placeholder rainfall forecast function.
    In the future, replace this with a real ML model or weather API integration.
    """
    # Example: fixed dummy rainfall in mm
    return 120.0
