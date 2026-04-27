let chart;

async function loadIndicators() {
  const ticker = document.getElementById("ticker").value;
  const res = await fetchData(ticker);

  const prices = res.data.close;
  const sma = res.indicators.sma;
  const ema = res.indicators.ema;

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("chart"), {
    type: "line",
    data: {
      labels: prices.map((_, i) => i),
      datasets: [
        { label: "Price", data: prices },
        { label: "SMA", data: sma },
        { label: "EMA", data: ema }
      ]
    }
  });
}
