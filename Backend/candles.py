def detect_candles(df):
    candles = []

    for i in range(1, len(df)):
        o = df["Open"][i]
        c = df["Close"][i]
        h = df["High"][i]
        l = df["Low"][i]

        prev_o = df["Open"][i-1]
        prev_c = df["Close"][i-1]

        # Doji
        if abs(o - c) < (h - l) * 0.1:
            candles.append((i, "Doji"))

        # Hammer
        if (c > o) and ((o - l) > 2 * (c - o)):
            candles.append((i, "Hammer"))

        # Engulfing
        if (c > o and prev_c < prev_o and c > prev_o):
            candles.append((i, "Bullish Engulfing"))

        # Shooting Star
        if (h - max(o, c)) > 2 * abs(o - c):
            candles.append((i, "Shooting Star"))

    return candles
