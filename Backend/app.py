from flask import Flask, jsonify
from flask_cors import CORS
import yfinance as yf
import pandas as pd

app = Flask(__name__)
CORS(app)

@app.route("/analyze/<ticker>")
def analyze(ticker):

    df = yf.Ticker(ticker).history(period="6mo")

    close = df["Close"]

    # Indicators
    sma = close.rolling(10).mean().fillna(0).tolist()
    ema = close.ewm(span=10).mean().tolist()

    # RSI
    delta = close.diff()
    gain = (delta.where(delta > 0, 0)).rolling(14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
    rs = gain / loss
    rsi = (100 - (100 / (1 + rs))).fillna(50).tolist()

    # Candles (basic)
    candles = []
    for i in range(1, len(df)):
        o, c, h, l = df["Open"][i], df["Close"][i], df["High"][i], df["Low"][i]

        if abs(o - c) < (h - l) * 0.1:
            candles.append([i, "Doji"])

        if (h - max(o, c)) > 2 * abs(o - c):
            candles.append([i, "Shooting Star"])

    # Signals
    signals = []
    for i in range(1, len(close)):
        if close[i] > sma[i] and close[i-1] <= sma[i-1]:
            signals.append({"type": "BUY", "index": i})

        if close[i] < sma[i] and close[i-1] >= sma[i-1]:
            signals.append({"type": "SELL", "index": i})

    return jsonify({
        "data": {
            "close": close.tolist()
        },
        "indicators": {
            "sma": sma,
            "ema": ema,
            "rsi": rsi
        },
        "candles": candles,
        "signals": signals
    })

if __name__ == "__main__":
    app.run()
