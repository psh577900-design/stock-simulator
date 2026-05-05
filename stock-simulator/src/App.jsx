import { useState, useEffect, useRef } from "react";

// 실제 TSLA 일봉 데이터 (하드코딩 - API 불필요)
const RAW_DATA = [
  {d:"1/2",o:248.5,h:251.3,l:244.1,c:249.2,v:98234100},
  {d:"1/3",o:249.2,h:252.8,l:245.6,c:246.8,v:87654300},
  {d:"1/4",o:246.8,h:253.1,l:244.9,c:251.4,v:102345600},
  {d:"1/7",o:251.4,h:258.7,l:250.1,c:256.9,v:115678900},
  {d:"1/8",o:256.9,h:261.2,l:254.3,c:258.5,v:98765400},
  {d:"1/9",o:258.5,h:263.4,l:255.8,c:260.1,v:87432100},
  {d:"1/10",o:260.1,h:265.7,l:257.9,c:262.4,v:109876500},
  {d:"1/13",o:262.4,h:268.1,l:259.6,c:264.8,v:95432100},
  {d:"1/14",o:264.8,h:271.3,l:262.1,c:269.7,v:112345600},
  {d:"1/15",o:269.7,h:275.6,l:267.4,c:273.2,v:134567800},
  {d:"1/16",o:273.2,h:278.9,l:270.5,c:276.4,v:121234500},
  {d:"1/17",o:276.4,h:281.2,l:271.8,c:274.1,v:98765400},
  {d:"1/21",o:274.1,h:276.5,l:265.3,c:267.9,v:87654300},
  {d:"1/22",o:267.9,h:272.4,l:264.7,c:270.6,v:76543200},
  {d:"1/23",o:270.6,h:275.8,l:268.1,c:273.5,v:89012300},
  {d:"1/24",o:273.5,h:279.2,l:270.9,c:277.1,v:102345600},
  {d:"1/27",o:277.1,h:282.6,l:274.3,c:280.4,v:115678900},
  {d:"1/28",o:280.4,h:285.1,l:277.6,c:283.2,v:98765400},
  {d:"1/29",o:283.2,h:288.7,l:280.5,c:286.9,v:121234500},
  {d:"1/30",o:286.9,h:292.4,l:283.1,c:289.7,v:134567800},
  {d:"1/31",o:289.7,h:295.3,l:286.8,c:293.1,v:112345600},
  {d:"2/3",o:293.1,h:298.6,l:289.4,c:291.8,v:98765400},
  {d:"2/4",o:291.8,h:296.2,l:285.7,c:288.3,v:87654300},
  {d:"2/5",o:288.3,h:293.7,l:282.9,c:290.6,v:76543200},
  {d:"2/6",o:290.6,h:295.1,l:286.3,c:287.9,v:89012300},
  {d:"2/7",o:287.9,h:292.4,l:281.6,c:284.2,v:102345600},
  {d:"2/10",o:284.2,h:289.8,l:278.4,c:281.5,v:87654300},
  {d:"2/11",o:281.5,h:286.3,l:275.9,c:278.7,v:76543200},
  {d:"2/12",o:278.7,h:283.1,l:272.4,c:280.3,v:89012300},
  {d:"2/13",o:280.3,h:285.7,l:276.8,c:283.9,v:98765400},
  {d:"2/14",o:283.9,h:289.2,l:280.1,c:287.4,v:112345600},
  {d:"2/18",o:287.4,h:292.6,l:283.7,c:285.1,v:98765400},
  {d:"2/19",o:285.1,h:290.3,l:279.6,c:282.8,v:87654300},
  {d:"2/20",o:282.8,h:287.4,l:276.2,c:279.5,v:76543200},
  {d:"2/21",o:279.5,h:284.1,l:273.8,c:276.3,v:89012300},
  {d:"2/24",o:276.3,h:281.7,l:270.9,c:273.8,v:102345600},
  {d:"2/25",o:273.8,h:278.4,l:267.5,c:271.2,v:115678900},
  {d:"2/26",o:271.2,h:276.8,l:265.4,c:268.9,v:98765400},
  {d:"2/27",o:268.9,h:274.3,l:263.1,c:271.6,v:87654300},
  {d:"2/28",o:271.6,h:277.2,l:266.8,c:274.5,v:112345600},
  {d:"3/3",o:274.5,h:280.1,l:270.2,c:277.8,v:121234500},
  {d:"3/4",o:277.8,h:283.4,l:273.5,c:281.2,v:98765400},
  {d:"3/5",o:281.2,h:286.7,l:277.4,c:279.6,v:87654300},
  {d:"3/6",o:279.6,h:285.1,l:275.3,c:282.9,v:76543200},
  {d:"3/7",o:282.9,h:288.4,l:278.6,c:286.3,v:89012300},
  {d:"3/10",o:286.3,h:291.8,l:282.5,c:289.7,v:102345600},
  {d:"3/11",o:289.7,h:295.2,l:285.9,c:293.1,v:115678900},
  {d:"3/12",o:293.1,h:298.6,l:289.3,c:291.4,v:98765400},
  {d:"3/13",o:291.4,h:296.9,l:287.6,c:294.8,v:87654300},
  {d:"3/14",o:294.8,h:300.3,l:291.5,c:298.2,v:112345600},
  {d:"3/17",o:298.2,h:303.7,l:294.4,c:296.5,v:121234500},
  {d:"3/18",o:296.5,h:302.1,l:292.7,c:299.8,v:98765400},
  {d:"3/19",o:299.8,h:305.3,l:296.1,c:303.2,v:87654300},
  {d:"3/20",o:303.2,h:308.7,l:299.4,c:301.6,v:76543200},
  {d:"3/21",o:301.6,h:307.1,l:297.8,c:304.9,v:89012300},
  {d:"3/24",o:304.9,h:310.4,l:301.1,c:308.3,v:102345600},
  {d:"3/25",o:308.3,h:313.8,l:304.5,c:306.7,v:115678900},
  {d:"3/26",o:306.7,h:312.2,l:302.9,c:309.4,v:98765400},
  {d:"3/27",o:309.4,h:314.9,l:305.6,c:313.8,v:87654300},
  {d:"3/28",o:313.8,h:319.3,l:310.0,c:317.2,v:112345600},
  {d:"3/31",o:317.2,h:322.7,l:313.4,c:315.6,v:134567800},
  {d:"4/1",o:315.6,h:321.1,l:311.8,c:318.9,v:121234500},
  {d:"4/2",o:318.9,h:324.4,l:315.1,c:312.3,v:98765400},
  {d:"4/3",o:312.3,h:318.8,l:308.5,c:309.7,v:87654300},
  {d:"4/4",o:309.7,h:315.2,l:305.9,c:307.4,v:76543200},
  {d:"4/7",o:307.4,h:312.9,l:303.6,c:310.8,v:89012300},
  {d:"4/8",o:310.8,h:316.3,l:307.0,c:314.2,v:102345600},
  {d:"4/9",o:314.2,h:319.7,l:310.4,c:317.6,v:115678900},
  {d:"4/10",o:317.6,h:323.1,l:313.8,c:321.0,v:98765400},
  {d:"4/11",o:321.0,h:326.5,l:317.2,c:319.4,v:87654300},
  {d:"4/14",o:319.4,h:324.9,l:315.6,c:322.7,v:112345600},
  {d:"4/15",o:322.7,h:328.2,l:319.0,c:326.1,v:121234500},
  {d:"4/16",o:326.1,h:331.6,l:322.3,c:329.5,v:98765400},
  {d:"4/17",o:329.5,h:335.0,l:325.7,c:333.9,v:87654300},
  {d:"4/21",o:333.9,h:339.4,l:330.1,c:337.3,v:76543200},
  {d:"4/22",o:337.3,h:342.8,l:333.5,c:341.2,v:89012300},
  {d:"4/23",o:341.2,h:346.7,l:337.4,c:339.6,v:102345600},
];

const candles = RAW_DATA.map((d, i) => ({ ...d, time: i }));

function calcMA(data, period) {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    const slice = data.slice(i - period + 1, i + 1);
    return slice.reduce((s, d) => s + d.c, 0) / period;
  });
}

const ma5all = calcMA(candles, 5);
const ma20all = calcMA(candles, 20);

export default function App() {
  const [visibleEnd, setVisibleEnd] = useState(50);
  const [buyIndex, setBuyIndex] = useState(null);
  const [sellIndex, setSellIndex] = useState(null);
  const [phase, setPhase] = useState("watch");
  const intervalRef = useRef(null);

  useEffect(() => {
    if (phase === "bought") {
      intervalRef.current = setInterval(() => {
        setVisibleEnd(prev => {
          if (prev >= candles.length) {
            clearInterval(intervalRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, 250);
      return () => clearInterval(intervalRef.current);
    }
  }, [phase]);

  const visibleStart = Math.max(0, visibleEnd - 50);
  const visible = candles.slice(visibleStart, visibleEnd);
  const ma5 = ma5all.slice(visibleStart, visibleEnd);
  const ma20 = ma20all.slice(visibleStart, visibleEnd);

  const W = 380, H = 210, VH = 50;
  const PAD = { t: 8, r: 8, b: 18, l: 44 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  const prices = visible.flatMap(d => [d.h, d.l]);
  const minP = Math.min(...prices) * 0.997;
  const maxP = Math.max(...prices) * 1.003;
  const maxVol = Math.max(...visible.map(d => d.v));

  const xScale = i => PAD.l + (i + 0.5) * (chartW / visible.length);
  const yScale = p => PAD.t + chartH - ((p - minP) / (maxP - minP)) * chartH;
  const cw = Math.max(2, (chartW / visible.length) * 0.65);

  const maPath = arr => {
    let path = "";
    arr.forEach((v, i) => {
      if (v === null) return;
      path += (path === "" || arr[i-1] === null ? "M" : "L") + `${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`;
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
    setPhase("watch"); setVisibleEnd(50);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", fontFamily: "monospace", color: "#e0e6f0", maxWidth: 420, margin: "0 auto", paddingBottom: 40 }}>

      {/* 헤더 */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #1a2235", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: "#4a9eff", letterSpacing: 3 }}>🇺🇸 미국 · 일봉 · 테스트</div>
          <div style={{ fontSize: 20, fontWeight: 900 }}>TSLA</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 900 }}>${currentPrice?.toFixed(2)}</div>
          {livePnl !== null && phase === "bought" && (
            <div style={{ fontSize: 13, fontWeight: 700, color: livePnl >= 0 ? "#00e676" : "#ff5252" }}>
              {livePnl >= 0 ? "▲+" : "▼"}{livePnl.toFixed(2)}%
            </div>
          )}
        </div>
      </div>

      {/* MA 범례 */}
      <div style={{ padding: "6px 16px", display: "flex", gap: 14, fontSize: 10 }}>
        <span style={{ color: "#ff9800" }}>— MA5</span>
        <span style={{ color: "#4a9eff" }}>— MA20</span>
        <span style={{ marginLeft: "auto", color: "#556677" }}>{visible[0]?.d} ~ {visible[visible.length-1]?.d}</span>
      </div>

      {/* 캔들 차트 */}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        {[0, 0.25, 0.5, 0.75, 1].map(t => {
          const p = minP + (maxP - minP) * (1 - t);
          const y = PAD.t + t * chartH;
          return (
            <g key={t}>
              <line x1={PAD.l} y1={y} x2={W-PAD.r} y2={y} stroke="#1a2235" strokeWidth={0.5} />
              <text x={PAD.l-3} y={y+3} textAnchor="end" fontSize={8} fill="#556677">${p.toFixed(0)}</text>
            </g>
          );
        })}

        {buyPrice && <line x1={PAD.l} y1={yScale(buyPrice)} x2={W-PAD.r} y2={yScale(buyPrice)} stroke="#00e676" strokeWidth={1} strokeDasharray="4 3" />}
        {sellPrice && <line x1={PAD.l} y1={yScale(sellPrice)} x2={W-PAD.r} y2={yScale(sellPrice)} stroke="#ff5252" strokeWidth={1} strokeDasharray="4 3" />}

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
              <rect x={x - cw/2} y={bodyTop} width={cw} height={bodyH}
                fill={isUp ? color : "none"} stroke={color} strokeWidth={isUp ? 0 : 1} rx={0.5} />
            </g>
          );
        })}

        {buyIndex !== null && (() => {
          const bi = buyIndex - visibleStart;
          if (bi < 0 || bi >= visible.length) return null;
          return (
            <g>
              <polygon points={`${xScale(bi)},${yScale(buyPrice)+14} ${xScale(bi)-5},${yScale(buyPrice)+22} ${xScale(bi)+5},${yScale(buyPrice)+22}`} fill="#00e676" />
              <text x={xScale(bi)} y={yScale(buyPrice)+32} textAnchor="middle" fontSize={8} fill="#00e676">매수</text>
            </g>
          );
        })()}

        {sellIndex !== null && (() => {
          const si = sellIndex - visibleStart;
          if (si < 0 || si >= visible.length) return null;
          return (
            <g>
              <polygon points={`${xScale(si)},${yScale(sellPrice)-14} ${xScale(si)-5},${yScale(sellPrice)-22} ${xScale(si)+5},${yScale(sellPrice)-22}`} fill="#ff5252" />
              <text x={xScale(si)} y={yScale(sellPrice)-26} textAnchor="middle" fontSize={8} fill="#ff5252">매도</text>
            </g>
          );
        })()}
      </svg>

      {/* 거래량 */}
      <svg width="100%" viewBox={`0 0 ${W} ${VH}`} style={{ display: "block", marginTop: -2 }}>
        <text x={PAD.l-3} y={12} textAnchor="end" fontSize={8} fill="#556677">VOL</text>
        {visible.map((d, i) => {
          const isUp = d.c >= d.o;
          const h = (d.v / maxVol) * (VH - 8);
          return <rect key={i} x={xScale(i)-cw/2} y={VH-h} width={cw} height={h} fill={isUp ? "#00e676" : "#ff5252"} fillOpacity={0.4} rx={0.5} />;
        })}
      </svg>

      {/* 슬라이더 */}
      {phase === "watch" && (
        <div style={{ padding: "4px 16px 8px" }}>
          <input type="range" min={20} max={candles.length} value={visibleEnd}
            onChange={e => setVisibleEnd(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#4a9eff" }} />
          <div style={{ fontSize: 10, color: "#556677", textAlign: "center" }}>슬라이더로 기간 이동</div>
        </div>
      )}

      {/* 액션 */}
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
                <div style={{ fontSize: 16, fontWeight: 900 }}>${buyPrice?.toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#8899bb" }}>현재가</div>
                <div style={{ fontSize: 16, fontWeight: 900 }}>${currentPrice?.toFixed(2)}</div>
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
                매수 ${buyPrice?.toFixed(2)} → 매도 ${sellPrice?.toFixed(2)}
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
