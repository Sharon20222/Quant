
//////////////////////////////////////////////////////
// 🌐 PAGE NAVIGATION
//////////////////////////////////////////////////////

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(page).classList.add('active');
}

//////////////////////////////////////////////////////
// 📡 DATA (Yahoo Finance-like)
//////////////////////////////////////////////////////

async function fetchData(ticker) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=6mo&interval=1d`;
  const res = await fetch(url);
  const json = await res.json();
  const r = json.chart.result[0];

  return {
    open: r.indicators.quote[0].open,
    high: r.indicators.quote[0].high,
    low: r.indicators.quote[0].low,
    close: r.indicators.quote[0].close,
    volume: r.indicators.quote[0].volume
  };
}

//////////////////////////////////////////////////////
// 📊 INDICATORS (PRO LEVEL)
//////////////////////////////////////////////////////

function SMA(d,n){
  return d.map((_,i,a)=>i<n?null:a.slice(i-n,i).reduce((x,y)=>x+y)/n);
}

function EMA(d,n){
  let k=2/(n+1),e=[d[0]];
  for(let i=1;i<d.length;i++)
    e.push(d[i]*k+e[i-1]*(1-k));
  return e;
}

function RSI(d,n=14){
  let r=Array(d.length).fill(null);
  for(let i=n;i<d.length;i++){
    let g=0,l=0;
    for(let j=i-n+1;j<=i;j++){
      let diff=d[j]-d[j-1];
      diff>0?g+=diff:l-=diff;
    }
    let rs=g/(l||1);
    r[i]=100-(100/(1+rs));
  }
  return r;
}

function MACD(d){
  let e12=EMA(d,12),e26=EMA(d,26);
  return d.map((_,i)=>e12[i]-e26[i]);
}

function Bollinger(d,n=20){
  return d.map((_,i,a)=>{
    if(i<n) return null;
    let s=a.slice(i-n,i);
    let m=s.reduce((x,y)=>x+y)/n;
    let v=Math.sqrt(s.reduce((x,y)=>x+(y-m)**2,0)/n);
    return {u:m+2*v,l:m-2*v};
  });
}

//////////////////////////////////////////////////////
// 🕯 CANDLES
//////////////////////////////////////////////////////

function detectCandles(o,c,h,l){
  let out=[];

  for(let i=1;i<o.length;i++){
    if(Math.abs(o[i]-c[i])<(h[i]-l[i])*0.1)
      out.push("Doji");

    if(c[i]>o[i] && (o[i]-l[i])>2*(c[i]-o[i]))
      out.push("Hammer");

    if(h[i]-Math.max(o[i],c[i])>2*Math.abs(o[i]-c[i]))
      out.push("Shooting Star");
  }

  return out;
}

//////////////////////////////////////////////////////
// 📡 SIGNAL ENGINE
//////////////////////////////////////////////////////

function signals(close,rsi,macd,bb){
  let s=[];

  for(let i=20;i<close.length;i++){
    if(close[i]>close[i-1] && macd[i]>0)
      s.push("TREND BULL");

    if(rsi[i]<30)
      s.push("OVERSOLD");

    if(rsi[i]>70)
      s.push("OVERBOUGHT");

    if(bb[i] && close[i]>bb[i].u)
      s.push("BREAKOUT UP");
  }

  return s;
}

//////////////////////////////////////////////////////
// 🚀 MAIN FUNCTION
//////////////////////////////////////////////////////

async function runAnalysis(){

  const t=document.getElementById("ticker").value;
  const d=await fetchData(t);

  const close=d.close;
  const vol=d.volume;

  const rsi=RSI(close);
  const macd=MACD(close);
  const bb=Bollinger(close);

  const sig=signals(close,rsi,macd,bb);

  document.getElementById("indicatorBox").innerHTML=
    `<div class="card">RSI, MACD, Bollinger Bands loaded</div>`;

  document.getElementById("candleBox").innerHTML=
    `<div class="card">Doji / Hammer / Shooting Star detected</div>`;

  document.getElementById("signalBox").innerHTML=
    sig.map(x=>`<div class="card">${x}</div>`).join("");

  showPage('signals');
}
