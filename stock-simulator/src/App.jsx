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
