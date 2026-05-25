export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { tickers, cryptos } = req.body;
  const results = {};

  // Yahoo Finance - acciones y ETFs
  if (tickers && tickers.length > 0) {
    try {
      const symbols = tickers.join(",");
      const url = `https://query1.finance.yahoo.com/v8/finance/spark?symbols=${symbols}&range=3mo&interval=1mo`;
      const r = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      const data = await r.json();
      const sparkData = data?.spark?.result || [];
      for (const item of sparkData) {
        const symbol = item.symbol;
        const closes = item.response?.[0]?.indicators?.quote?.[0]?.close || [];
        const timestamps = item.response?.[0]?.timestamp || [];
        if (closes.length > 0) {
          results[symbol] = {
            price: closes[closes.length - 1],
            history: timestamps.map((ts, i) => ({
              date: new Date(ts * 1000).toISOString().slice(0, 7),
              close: closes[i],
            })).filter(h => h.close != null),
          };
        }
      }
    } catch (e) {
      console.error("Yahoo Finance error:", e.message);
    }
  }

  // CoinGecko - criptomonedas
  if (cryptos && cryptos.length > 0) {
    try {
      const ids = cryptos.join(",");
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
      const r = await fetch(url);
      const data = await r.json();
      for (const [id, val] of Object.entries(data)) {
        results[id] = { price: val.usd, history: [] };
      }

      // Historial de cada cripto (ultimos 3 meses)
      for (const id of cryptos) {
        try {
          const hr = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=90&interval=monthly`);
          const hdata = await hr.json();
          if (results[id] && hdata.prices) {
            results[id].history = hdata.prices.map(([ts, price]) => ({
              date: new Date(ts).toISOString().slice(0, 7),
              close: price,
            }));
          }
        } catch (e) {}
      }
    } catch (e) {
      console.error("CoinGecko error:", e.message);
    }
  }

  res.status(200).json({ prices: results });
}
