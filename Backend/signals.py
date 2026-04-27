def generate_signals(df, indicators):
    signals = []
    close = df["Close"]

    sma = indicators["sma"]
    rsi = indicators["rsi"]

    for i in range(1, len(close)):
        if close[i] > sma[i] and close[i-1] <= sma[i-1]:
            signals.append({"type": "BUY", "index": i})

        if close[i] < sma[i] and close[i-1] >= sma[i-1]:
            signals.append({"type": "SELL", "index": i})

        if rsi[i] < 30:
            signals.append({"type": "RSI_OVERSOLD", "index": i})

        if rsi[i] > 70:
            signals.append({"type": "RSI_OVERBOUGHT", "index": i})

    return signals
