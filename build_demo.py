import json, numpy as np, pandas as pd
from model import forecast, offer
df = pd.read_csv("transactions_synthetic.csv", parse_dates=["date"])
rng = np.random.default_rng(3)
res = []
for cid, g in df.groupby("client_id"):
    g = g.set_index("date"); ob = g.opening_balance.iloc[0]
    fc, b0 = forecast(g, ob, rng)
    res.append((cid, g, ob, fc, b0))
risky = sorted([x for x in res if x[4] >= 0], key=lambda x: -x[3].p_gap)[:5]
safe = sorted([x for x in res if x[4] > 0], key=lambda x: x[3].p_gap)[:2]
NAMES = {"retail": "Розничный магазин", "services": "Студия услуг", "b2b": "B2B-поставщик", "ecommerce": "Интернет-магазин"}
out = []
for i, (cid, g, ob, fc, b0) in enumerate(risky + safe):
    net = (g.inflow - g.outflow); bal = ob + net.cumsum()
    hist = bal.iloc[-30:]
    o = offer(fc)
    out.append(dict(
        id=cid, name=f"ИП · {NAMES[g.segment.iloc[0]]} #{i+1}", segment=g.segment.iloc[0],
        hist_dates=[d.strftime("%d.%m") for d in hist.index], hist=[round(v) for v in hist.values],
        fc_dates=[d.strftime("%d.%m") for d in fc.dates],
        p10=[round(v) for v in fc.p10], p50=[round(v) for v in fc.p50], p90=[round(v) for v in fc.p90],
        p_gap=round(fc.p_gap, 2), first_gap=fc.first_gap_day, shortfall=round(fc.shortfall_p90),
        balance=round(b0), drivers=[[d.strftime("%d.%m"), round(a)] for d, a in fc.drivers],
        offer=o))
m = json.load(open("metrics.json"))
html = open("demo_template.html", encoding="utf-8").read()
html = html.replace("__DATA__", json.dumps(out, ensure_ascii=False)).replace("__METRICS__", json.dumps(m, ensure_ascii=False))
open("demo.html", "w", encoding="utf-8").write(html)
print([(x["id"], x["p_gap"], x["first_gap"], x["shortfall"]) for x in out])
