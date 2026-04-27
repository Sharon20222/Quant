async function loadSignals() {
  const ticker = document.getElementById("ticker").value;
  const res = await fetchData(ticker);

  let html = "<h3>Signals:</h3>";

  res.signals.forEach(s => {
    html += `<p>${s.type} @ ${s.index}</p>`;
  });

  document.getElementById("signals").innerHTML = html;
}
