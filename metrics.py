import pandas as pd, numpy as np, json
r = pd.read_csv("eval_rows.csv", parse_dates=["origin"])
cl = np.array(sorted(r.cid.unique())); rng = np.random.default_rng(7); rng.shuffle(cl)
tune_c = set(cl[: len(cl)//2])
tune, test = r[r.cid.isin(tune_c)], r[~r.cid.isin(tune_c)]

def prf(y, p):
    y = y.astype(bool); p = p.astype(bool)
    tp = (y & p).sum(); fp = (~y & p).sum(); fn = (y & ~p).sum()
    pr = tp / max(tp + fp, 1); rc = tp / max(tp + fn, 1)
    return pr, rc, 2 * pr * rc / max(pr + rc, 1e-9)

best = max(np.arange(0.2, 0.96, 0.05), key=lambda t: prf(tune.actual, tune.p_gap >= t)[2])
pr, rc, f1 = prf(test.actual, test.p_gap >= best)
npr, nrc, nf1 = prf(test.actual, test.naive)
tp = test[(test.actual) & (test.p_gap >= best)]
res = dict(
  n_forecasts=int(len(r)), n_clients=int(r.cid.nunique()), n_test=int(len(test)),
  n_test_gaps=int(test.actual.sum()), base_rate=round(float(test.actual.mean()), 3),
  threshold=round(float(best), 2),
  precision=round(float(pr), 3), recall=round(float(rc), 3), f1=round(float(f1), 3),
  naive_precision=round(float(npr), 3), naive_recall=round(float(nrc), 3), naive_f1=round(float(nf1), 3),
  mae_model=round(float(test.mae.mean())), mae_naive=round(float(test.mae_naive.mean())),
  coverage_p10_p90=round(float(test.cover.mean()), 3),
  median_lead_days=float(tp.first_actual.median()) if len(tp) else None,
  share_tp_lead_ge3=round(float((tp.first_actual >= 3).mean()), 3) if len(tp) else None,
  by_segment={s: dict(zip(["precision","recall","f1"], [round(float(x),3) for x in prf(g.actual, g.p_gap>=best)]))|{"n_gaps": int(g.actual.sum())}
              for s, g in test.groupby("seg")},
)
res["mae_gain_pct"] = round((1 - res["mae_model"] / res["mae_naive"]) * 100, 1)
json.dump(res, open("metrics.json", "w"), ensure_ascii=False, indent=1)
print(json.dumps(res, ensure_ascii=False, indent=1))
