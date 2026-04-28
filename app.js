//////////////////////////////////////////////////
// NAVIGATION
//////////////////////////////////////////////////

function showPage(p){
  document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
  document.getElementById(p).classList.add("active");
}

//////////////////////////////////////////////////
// DATA
//////////////////////////////////////////////////

async function fetchData(t){
  const url=`https://query1.finance.yahoo.com/v8/finance/chart/${t}?range=6mo&interval=1d`;
  const r=await fetch(url);
  const j=await r.json();
  const d=j.chart.result[0].indicators.quote[0];

  return d;
}

//////////////////////////////////////////////////
// INDICATORS
//////////////////////////////////////////////////

function SMA(d,n){
  return d.map((_,i,a)=>i<n?null:a.slice(i-n,i).reduce((x,y)=>x+y)/n);
}

function EMA(d,n){
  let k=2/(n+1),e=[d[0]];
  for(let i=1;i<d.length;i++) e.push(d[i]*k+e[i-1]*(1-k));
  return e;
}

function RSI(d,n=14){
  let r=[];
  for(let i=n;i<d.length;i++){
    let g=0,l=0;
    for(let j=i-n+1;j<=i;j++){
      let diff=d[j]-d[j-1];
      diff>0?g+=diff:l-=diff;
    }
    let rs=g/(l||1);
    r.push(100-(100/(1+rs)));
  }
  return r;
}

function MACD(d){
  let e12=EMA(d,12),e26=EMA(d,26);
  return d.map((_,i)=>e12[i]-e26[i]);
}

function Bollinger(d,n=20){
  return d.map((_,i,a)=>{
    if(i<n)return null;
    let s=a.slice(i-n,i);
    let m=s.reduce((x,y)=>x+y)/n;
    let v=Math.sqrt(s.reduce((x,y)=>x+(y-m)**2,0)/n);
    return {u:m+2*v,l:m-2*v};
  });
}

//////////////////////////////////////////////////
// CANDLES
//////////////////////////////////////////////////

function detectCandles(o,c,h,l){
  let out=[];
  for(let i=1;i<o.length;i++){
    if(Math.abs(o[i]-c[i])<(h[i]-l[i])*0.1)
      out.push("Doji");
    if(c[i]>o[i]&&(o[i]-l[i])>2*(c[i]-o[i]))
      out.push("Hammer");
    if(h[i]-Math.max(o[i],c[i])>2*Math.abs(o[i]-c[i]))
      out.push("Shooting Star");
  }
  return out;
}

//////////////////////////////////////////////////
// SIGNALS
//////////////////////////////////////////////////

function generateSignals(close,rsi,macd,bb){
  let s=[];
  for(let i=20;i<close.length;i++){
    if(close[i]>close[i-1]&&macd[i]>0)
      s.push("Bullish Trend");
    if(rsi[i] && rsi[i]<30)
      s.push("Oversold");
    if(rsi[i] && rsi[i]>70)
      s.push("Overbought");
    if(bb[i] && close[i]>bb[i].u)
      s.push("Breakout Up");
  }
  return s;
}

//////////////////////////////////////////////////
// MAIN
//////////////////////////////////////////////////

async function runAnalysis(){

  const t=document.getElementById("ticker").value;
  const d=await fetchData(t);

  const close=d.close;
  const open=d.open;
  const high=d.high;
  const low=d.low;

  const rsi=RSI(close);
  const macd=MACD(close);
  const bb=Bollinger(close);

  const candles=detectCandles(open,close,high,low);
  const signals=generateSignals(close,rsi,macd,bb);

  document.getElementById("indicatorBox").innerHTML=`
    <div class="card">RSI calculated</div>
    <div class="card">MACD calculated</div>
    <div class="card">Bollinger Bands calculated</div>
  `;

  document.getElementById("candleBox").innerHTML=
    candles.map(x=>`<div class="card">${x}</div>`).join("");

  document.getElementById("signalBox").innerHTML=
    signals.map(x=>`<div class="card">${x}</div>`).join("");

  showPage("signals");
}
