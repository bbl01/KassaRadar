import numpy as np, pandas as pd, json, time
from model import forecast, naive_gap, H
df = pd.read_csv("transactions_synthetic.csv", parse_dates=["date"])
clients = df.client_id.unique()
rng = np.random.default_rng(1)
rows = []
t0 = time.time()
LAST = df.date.max()
origins = [LAST - pd.Timedelta(days=H + 7 * i) for i in range(0, 22)]
for cid in clients:
    g = df[df.client_id == cid].set_index("date")
    ob = g["opening_balance"].iloc[0]; seg = g["segment"].iloc[0]
    net = (g.inflow - g.outflow)
    for o in origins:
        hist = g.loc[:o]; fut = g.loc[o + pd.Timedelta(days=1): o + pd.Timedelta(days=H)]
        if len(hist) < 200 or len(fut) < H: continue
        bal_fut = ob + net.loc[:o].sum() + np.cumsum(net.loc[fut.index].values)
        actual = bool(bal_fut.min() < 0)
        first_actual = int(np.argmax(bal_fut < 0)) + 1 if actual else None
        fc, b0 = forecast(hist, ob, rng)
        if b0 < 0: continue
        rows.append(dict(cid=cid, seg=seg, origin=o, actual=actual, first_actual=first_actual,
                         p_gap=fc.p_gap, naive=naive_gap(hist, ob),
                         mae=float(np.abs(fc.p50 - bal_fut).mean()),
                         mae_naive=float(np.abs(b0 + net.loc[:o].iloc[-28:].mean()*np.arange(1,H+1) - bal_fut).mean()),
                         cover=float(((bal_fut >= fc.p10) & (bal_fut <= fc.p90)).mean())))
r = pd.DataFrame(rows)
r.to_csv("eval_rows.csv", index=False)
print("прогнозов:", len(r), "время, c:", round(time.time() - t0))
