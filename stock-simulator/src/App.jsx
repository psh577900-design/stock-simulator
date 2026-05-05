import { useState, useEffect, useRef } from "react";

function calcMA(data, period) {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    const slice = data.slice(i - period + 1, i + 1);
    return slice.reduce((s, d) => s + d.c, 0) / period;
  });
}

export default function App() {
  const [appKey, setAppKey] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [keyInput, setKeyInput] = useState({ appKey: "", appSecret: "" });
  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visibleEnd, setVisibleEnd] = useState(60);
  const [buyIndex, setBuyIndex] = useState(null);
  const [sellIndex, setSellIndex] = useState(null);
  const [phase, setPhase] = useState("watch");
  const intervalRef = useRef(null);

  const loadData = async (ak, as) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/stock?symbol=005930&appkey=${ak}&appsecret=${as}`);
      const json = await res.json();
      if (json.error) { setError(json.error); setLoading(false); return; }
      setCandles(json.data);
      setVisibleEnd(Math.min(60, json.data.length));
    } catch (e) {
      setError("연결 실패 😢 " + e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (phase === "bought") {
      intervalRef.current = setInterval(() => {
        setVisibleEnd(prev => {
          if (prev >= candles.length) { clearInterval(intervalRef.current); return prev; }
          return prev + 1;
        });
      }, 250);
      return () => clearInterval(intervalRef.current);
    }
  }, [phase, candles.length]);

  const visibleStart = Math.max(0, visibleEnd - 60);
  const visible = candles.slice(visibleStart, visibleEnd);
  const ma5 = calcMA(candles, 5).slice(visibleStart, visibleEnd);
  const ma20 = calcMA(candles, 20).slice(visibleStart, visibleEnd);
  const ma60 = calcMA(candles, 60).slice(visibleStart, visibleEnd);

  const W = 380, H = 210, VH = 50;
  const PAD = { t: 8, r: 8, b: 18, l: 52 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  const prices = visible.flatMap(d => [d.h, d.l]);
  const minP = prices.length ? Math.min(...prices) * 0.997 : 0;
  const maxP = prices.length ? Math.max(...prices) * 1.003 : 1;
  const maxVol = Math.max(...visible.map(d => d.v || 0));

  const xScale = i => PAD.l + (i + 0.5) * (chartW / visible.length);
  const yScale = p => PAD.t + chartH - ((p - minP) / (maxP - minP)) * chartH;
  const cw = Math.max(2, (chartW / visible.length) * 0.65);

  const maPath = arr => {
    let path = "";
    arr.forEach((v, i) => {
      if (v === null) return;
      path += (path === "" || arr[i - 1] === null ? "M" : "L") +
        `${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`;
    });
    return path;
  };

  const buyPrice = buyIndex !== null ? candles[buyIndex]?.c : null;
  const sellPrice = sellIndex !== null ? candles[sellIndex]?.c : null;
  const currentPrice = visible[visible.length - 1]?.c;
  const livePnl = buyPrice && currentPrice ? ((currentPrice - buyPrice) / buyPrice * 100) : null;
  const finalPnl = buyPrice && sellPrice ? ((sellPrice - buyPrice) / buyPrice * 100) : null;

  const handleBuy = () => { setBuyIndex(visibleEnd - 1); setPhase("bought"); };
  const handleSell = () => {
    clearInterval(intervalRef.current);
    setSellIndex(visibleEnd - 1);
    setPhase("sold");
    setVisibleEnd(candles.length);
  };
  const handleReset = () => {
    clearInterval(intervalRef.current);
    setBuyIndex(null); setSellIndex(null);
    setPhase("watch"); setVisibleEnd(60);
  };

  // ── API 키 입력 ──
  if (!appKey) return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", color: "#e0e6f0", padding: 24 }}>
      <div style={{ maxWidth: 360, width: "100%" }}>
        <div style={{ fontSize: 40, textAlign: "center", marginBottom: 8 }}>📈</div>
        <div style={{ fontSize: 11, letterSpacing: 4, color: "#4a9eff", textAlign: "center", marginBottom: 8 }}>삼성전자 실제 데이터</div>
        <h2 style={{ fontSize: 20, fontWeight: 900, textAlign: "center", margin: "0 0 20px" }}>한국투자증권 API 키 입력</h2>
        <div style={{ background: "#0d1526", border: "1px solid #1e2a42", borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 12, color: "#8899bb", lineHeight: 1.8 }}>
          🔑 KIS Developers에서 발급받은<br/>
          <strong style={{ color: "#fff" }}>앱키</strong>와 <strong style={{ color: "#fff" }}>시크릿키</strong>를 입력하세요
        </div>
        <input value={keyInput.appKey} onChange={e => setKeyInput(k => ({ ...k, appKey: e.target.value }))}
          placeholder="앱키 (App Key)"
          style={{ width: "100%", padding: 14, background: "#151c2e", border: "1px solid #1e2a42", borderRadius: 10, color: "#fff", fontSize: 12, outline: "none", boxSizing: "border-box", marginBottom: 10 }} />
        <input value={keyInput.appSecret} onChange={e => setKeyInput(k => ({ ...k, appSecret: e.target.value }))}
          placeholder="시크릿키 (App Secret)" type="password"
          style={{ width: "100%", padding: 14, background: "#151c2e", border: "1px solid #1e2a42", borderRadius: 10, color: "#fff", fontSize: 12, outline: "none", boxSizing: "border-box", marginBottom: 12 }} />
        {error && <div style={{ color: "#ff5252", fontSize: 12, marginBottom: 10, textAlign: "center" }}>{error}</div>}
        <button onClick={() => { setAppKey(keyInput.appKey); setAppSecret(keyInput.appSecret); loadData(keyInput.appKey, keyInput.appSecret); }}
          disabled={!keyInput.appKey || !keyInput.appSecret}
          style={{ width: "100%", padding: 16, background: (keyInput.appKey && keyInput.appSecret) ? "#4a9eff" : "#1e2a42", border: "none", borderRadius: 12, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
          삼성전자 차트 보기 🚀
        </button>
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", color: "#4a9eff", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 36 }}>📡</div>
      <div>삼성전자 실제 데이터 불러오는 중...</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", padding: 24, flexDirection: "column", gap: 12, textAlign: "center" }}>
      <div style={{ fontSize: 36 }}>😢</div>
      <div style={{ color: "#ff5252", fontSize: 14 }}>{error}</div>
      <button onClick={() => { setAppKey(""); setError(""); }}
        style={{ padding: "12px 24px", background: "#4a9eff", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, cursor: "pointer" }}>
        다시 시도
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", fontFamily: "monospace", color: "#e0e6f0", maxWidth: 420, margin: "0 auto", paddingBottom: 40 }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #1a2235", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: "#4a9eff", letterSpacing: 3 }}>🇰🇷 국내 · 일봉 · 실제데이터</div>
          <div style={{ fontSize: 20, fontWeight: 900 }}>삼성전자 <span style={{ fontSize: 12, color: "#8899bb" }}>005930</span></div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 900 }}>{currentPrice?.toLocaleString()}원</div>
          {livePnl !== null && phase === "bought" && (
            <div style={{ fontSize: 13, fontWeight: 700, color: livePnl >= 0 ? "#00e676" : "#ff5252" }}>
              {livePnl >= 0 ? "▲+" : "▼"}{livePnl.toFixed(2)}%
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "6px 16px", display: "flex", gap: 12, fontSize: 10 }}>
        <span style={{ color: "#ff9800" }}>— MA5</span>
        <span style={{ color: "#4a9eff" }}>— MA20</span>
        <span style={{ color: "#e040fb" }}>— MA60</span>
        <span style={{ marginLeft: "auto", color: "#556677" }}>{visible[0]?.date} ~ {visible[visible.length - 1]?.date}</span>
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        {[0, 0.25, 0.5, 0.75, 1].map(t => {
          const p = minP + (maxP - minP) * (1 - t);
          const y = PAD.t + t * chartH;
          return (
            <g key={t}>
              <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#1a2235" strokeWidth={0.5} />
              <text x={PAD.l - 3} y={y + 3} textAnchor="end" fontSize={8} fill="#556677">{(p / 1000).toFixed(0)}K</text>
            </g>
          );
        })}
        {buyPrice && <line x1={PAD.l} y1={yScale(buyPrice)} x2={W - PAD.r} y2={yScale(buyPrice)} stroke="#00e676" strokeWidth={1} strokeDasharray="4 3" />}
        {sellPrice && <line x1={PAD.l} y1={yScale(sellPrice)} x2={W - PAD.r} y2={yScale(sellPrice)} stroke="#ff5252" strokeWidth={1} strokeDasharray="4 3" />}
        <path d={maPath(ma60)} fill="none" stroke="#e040fb" strokeWidth={1} opacity={0.8} />
        <path d={maPath(ma20)} fill="none" stroke="#4a9eff" strokeWidth={1.2} opacity={0.9} />
        <path d={maPath(ma5)} fill="none" stroke="#ff9800" strokeWidth={1.2} opacity={0.9} />
        {visible.map((d, i) => {
          const x = xScale(i);
          const isUp = d.c >= d.o;
          const color = isUp ? "#00e676" : "#ff5252";
          const bodyTop = yScale(Math.max(d.o, d.c));
          const bodyH = Math.max(1, Math.abs(yScale(d.o) - yScale(d.c)));
          return (
            <g key={i}>
              <line x1={x} y1={yScale(d.h)} x2={x} y2={yScale(d.l)} stroke={color} strokeWidth={1} />
              <rect x={x - cw / 2} y={bodyTop} width={cw} height={bodyH} fill={isUp ? color : "none"} stroke={color} strokeWidth={isUp ? 0 : 1} rx={0.5} />
            </g>
          );
        })}
        {buyIndex !== null && (() => {
          const bi = buyIndex - visibleStart;
          if (bi < 0 || bi >= visible.length) return null;
          return (
            <g>
              <polygon points={`${xScale(bi)},${yScale(buyPrice) + 14} ${xScale(bi) - 5},${yScale(buyPrice) + 22} ${xScale(bi) + 5},${yScale(buyPrice) + 22}`} fill="#00e676" />
              <text x={xScale(bi)} y={yScale(buyPrice) + 32} textAnchor="middle" fontSize={8} fill="#00e676">매수</text>
            </g>
          );
        })()}
        {sellIndex !== null && (() => {
          const si = sellIndex - visibleStart;
          if (si < 0 || si >= visible.length) return null;
          return (
            <g>
              <polygon points={`${xScale(si)},${yScale(sellPrice) - 14} ${xScale(si) - 5},${yScale(sellPrice) - 22} ${xScale(si) + 5},${yScale(sellPrice) - 22}`} fill="#ff5252" />
              <text x={xScale(si)} y={yScale(sellPrice) - 26} textAnchor="middle" fontSize={8} fill="#ff5252">매도</text>
            </g>
          );
        })()}
      </svg>

      <svg width="100%" viewBox={`0 0 ${W} ${VH}`} style={{ display: "block", marginTop: -2 }}>
        <text x={PAD.l - 3} y={12} textAnchor="end" fontSize={8} fill="#556677">VOL</text>
        {visible.map((d, i) => {
          const isUp = d.c >= d.o;
          const h = maxVol > 0 ? (d.v / maxVol) * (VH - 8) : 0;
          return <rect key={i} x={xScale(i) - cw / 2} y={VH - h} width={cw} height={h} fill={isUp ? "#00e676" : "#ff5252"} fillOpacity={0.4} rx={0.5} />;
        })}
      </svg>

      {phase === "watch" && candles.length > 60 && (
        <div style={{ padding: "4px 16px 8px" }}>
          <input type="range" min={60} max={candles.length} value={visibleEnd}
            onChange={e => setVisibleEnd(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#4a9eff" }} />
          <div style={{ fontSize: 10, color: "#556677", textAlign: "center" }}>슬라이더로 기간 이동</div>
        </div>
      )}

      <div style={{ padding: "8px 16px" }}>
        {phase === "watch" && (
          <button onClick={handleBuy}
            style={{ width: "100%", padding: 18, background: "#003d1f", border: "2px solid #00e676", borderRadius: 14, color: "#00e676", fontSize: 18, fontWeight: 900, cursor: "pointer" }}>
            📈 여기서 매수!
          </button>
        )}
        {phase === "bought" && (
          <div>
            <div style={{ background: "#151c2e", border: "1px solid #1e2a42", borderRadius: 12, padding: "12px 16px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 10, color: "#8899bb" }}>매수가</div>
                <div style={{ fontSize: 15, fontWeight: 900 }}>{buyPrice?.toLocaleString()}원</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#8899bb" }}>현재가</div>
                <div style={{ fontSize: 15, fontWeight: 900 }}>{currentPrice?.toLocaleString()}원</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: "#8899bb" }}>수익률</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: livePnl >= 0 ? "#00e676" : "#ff5252" }}>
                  {livePnl >= 0 ? "+" : ""}{livePnl?.toFixed(2)}%
                </div>
              </div>
            </div>
            <button onClick={handleSell}
              style={{ width: "100%", padding: 20, background: livePnl >= 0 ? "#003d1f" : "#3d0010", border: `2px solid ${livePnl >= 0 ? "#00e676" : "#ff5252"}`, borderRadius: 14, color: livePnl >= 0 ? "#00e676" : "#ff5252", fontSize: 20, fontWeight: 900, cursor: "pointer" }}>
              💰 지금 매도!
            </button>
          </div>
        )}
        {phase === "sold" && (
          <div>
            <div style={{ background: finalPnl >= 0 ? "#001a0d" : "#1a0005", border: `2px solid ${finalPnl >= 0 ? "#00e676" : "#ff5252"}`, borderRadius: 14, padding: 20, marginBottom: 12, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>{finalPnl >= 0 ? "🎯" : "💸"}</div>
              <div style={{ fontSize: 12, color: "#8899bb", marginBottom: 4 }}>
                매수 {buyPrice?.toLocaleString()}원 → 매도 {sellPrice?.toLocaleString()}원
              </div>
              <div style={{ fontSize: 30, fontWeight: 900, color: finalPnl >= 0 ? "#00e676" : "#ff5252" }}>
                {finalPnl >= 0 ? "+" : ""}{finalPnl?.toFixed(2)}%
              </div>
              <div style={{ fontSize: 11, color: "#556677", marginTop: 8 }}>↑ 매도 이후 흐름도 확인해보세요</div>
            </div>
            <button onClick={handleReset}
              style={{ width: "100%", padding: 16, background: "#4a9eff", border: "none", borderRadius: 12, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
              다시 해보기 🔄
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
