export default async function handler(req, res) {
  const { symbol, appkey, appsecret } = req.query;
  try {
    const tokenRes = await fetch('https://openapi.koreainvestment.com:9443/oauth2/tokenP', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grant_type: 'client_credentials', appkey, appsecret }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return res.status(401).json({ error: '토큰 발급 실패' });

    const token = tokenData.access_token;
    const today = new Date();
    const end = today.toISOString().slice(0, 10).replace(/-/g, '');
    const start = new Date(today.setFullYear(today.getFullYear() - 1)).toISOString().slice(0, 10).replace(/-/g, '');

    const chartRes = await fetch(
      `https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice?FID_COND_MRKT_DIV_CODE=J&FID_INPUT_ISCD=${symbol}&FID_INPUT_DATE_1=${start}&FID_INPUT_DATE_2=${end}&FID_PERIOD_DIV_CODE=D&FID_ORG_ADJ_PRC=0`,
      { headers: { 'content-type': 'application/json', authorization: `Bearer ${token}`, appkey, appsecret, tr_id: 'FHKST03010100' } }
    );
    const chartData = await chartRes.json();
    if (!chartData.output2 || chartData.output2.length === 0) return res.status(404).json({ error: '데이터 없음' });

    const parsed = chartData.output2.reverse().map((d, i) => ({
      time: i,
      date: `${d.stck_bsop_date.slice(4,6)}/${d.stck_bsop_date.slice(6,8)}`,
      o: parseInt(d.stck_oprc), h: parseInt(d.stck_hgpr),
      l: parseInt(d.stck_lwpr), c: parseInt(d.stck_clpr), v: parseInt(d.acml_vol),
    })).filter(d => d.o && d.h && d.l && d.c);

    res.status(200).json({ data: parsed });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
