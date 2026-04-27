async function getData(ticker) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=6mo&interval=1d`;
  const res = await fetch(url);
  const json = await res.json();

  const r = json.chart.result[0];

  return {
    open: r.indicators.quote[0].open,
    high: r.indicators.quote[0].high,
    low: r.indicators.quote[0].low,
    close: r.indicators.quote[0].close,
    time: r.timestamp
  };
}
