import pandas as pd

def SMA(series, n=10):
    return series.rolling(n).mean().tolist()

def EMA(series, n=10):
    return series.ewm(span=n).mean().tolist()

def RSI(series, n=14):
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(n).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(n).mean()
    rs = gain / loss
    return (100 - (100 / (1 + rs))).tolist()

def compute_indicators(df):
    close = df["Close"]
    return {
        "sma": SMA(close),
        "ema": EMA(close),
        "rsi": RSI(close)
    }
