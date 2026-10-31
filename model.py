"""КассаРадар: вероятностный прогноз остатка на счёте на H дней.
Без нейросетей: статистика + Монте-Карло. Работает on-prem, объяснимо.
"""
import numpy as np, pandas as pd
from dataclasses import dataclass

H = 14
N_SIM = 600

@dataclass
class Forecast:
    dates: pd.DatetimeIndex
    p10: np.ndarray; p50: np.ndarray; p90: np.ndarray
    p_gap: float            # вероятность ухода баланса ниже нуля в горизонте
    first_gap_day: int | None
    shortfall_p90: float    # глубина разрыва (90-й перцентиль худшего остатка)
    drivers: list

def _learn(out_hist: pd.Series):
    """Выделяет регулярные крупные платежи (по числу месяца) и очищает расходы от них."""
    out = out_hist.iloc[-190:]
    nz = out[out > 0]
    thr = 3.0 * nz.median() if len(nz) else np.inf
    fixed = {}
    for d in range(1, 32):
        vals = out[(out.index.day == d)]
        big = vals[vals > thr]
        if len(vals) >= 3 and len(big) / len(vals) >= 0.5:
            fixed[d] = (float(big.median()), len(big) / len(vals))
    # один платёж, который иногда сдвигается на день, не должен считаться дважды
    for d in sorted(fixed):
        if d - 1 in fixed:
            a, b = fixed[d - 1], fixed[d]
            if abs(a[0] - b[0]) <= 0.25 * max(a[0], b[0]):
                del fixed[d if a[1] >= b[1] else d - 1]
    return fixed, thr

def forecast(hist: pd.DataFrame, open_balance: float, rng=None, horizon=H, n_sim=N_SIM):
    """hist: DataFrame с индексом-датой и колонками inflow, outflow (до даты прогноза включительно)."""
    rng = rng or np.random.default_rng(0)
    h = hist.iloc[-270:]
    fixed, thr = _learn(hist["outflow"])
    bal0 = open_balance + (hist["inflow"] - hist["outflow"]).sum()
    dates = pd.date_range(hist.index[-1] + pd.Timedelta(days=1), periods=horizon, freq="D")
    # очищаем историю расходов от регулярных платежей (в день и на следующий день)
    dom = h.index.day.values
    is_fixed_day = np.isin(dom, list(fixed)) | np.isin(dom - 1, list(fixed))
    out_clean = h["outflow"].values.copy()
    typical = np.median(out_clean[out_clean <= thr]) if (out_clean <= thr).any() else 0.0
    out_clean[(out_clean > thr) & is_fixed_day] = typical
    inflow_v = h["inflow"].values
    # блочный бутстрап: берём окна истории той же фазы недели, сохраняем связь между днями
    starts = [i for i in range(len(h) - horizon + 1) if h.index[i].dayofweek == dates[0].dayofweek]
    pick = rng.choice(starts, n_sim)
    idx = pick[:, None] + np.arange(horizon)[None, :]
    sim = inflow_v[idx] - out_clean[idx]
    drivers = []
    for d, (amt, p) in fixed.items():
        for k, dt in enumerate(dates):
            if dt.day == d:
                on_day = rng.random(n_sim) < p
                sim[:, k] -= np.where(on_day, amt, 0)
                if k + 1 < horizon:
                    sim[:, k + 1] -= np.where(~on_day, amt, 0)
                drivers.append((dt, amt))
    bal = bal0 + np.cumsum(sim, axis=1)
    worst = bal.min(axis=1)
    p_gap = float((worst < 0).mean())
    med = np.percentile(bal, 50, axis=0)
    first = None
    if p_gap > 0:
        cnt = (bal < 0).mean(axis=0)
        idx2 = np.where(cnt >= 0.5)[0]
        first = int(idx2[0]) + 1 if len(idx2) else int(np.argmax(cnt)) + 1
    short = float(max(0.0, -np.percentile(worst, 10)))
    return Forecast(dates, np.percentile(bal, 10, axis=0), med, np.percentile(bal, 90, axis=0),
                    p_gap, first, short, drivers), bal0

def naive_gap(hist: pd.DataFrame, open_balance: float, horizon=H):
    """Базовый метод: средний дневной чистый поток за 28 дней продлевается вперёд."""
    net = (hist["inflow"] - hist["outflow"]).iloc[-28:].mean()
    bal0 = open_balance + (hist["inflow"] - hist["outflow"]).sum()
    return bool((bal0 + net * np.arange(1, horizon + 1)).min() < 0)

def offer(fc: Forecast, key_rate=0.14, spread=0.08):
    """Подбор суммы и срока краткосрочного лимита под прогнозный разрыв."""
    if fc.p_gap < 0.5 or fc.shortfall_p90 <= 0:
        return None
    amount = float(np.ceil(fc.shortfall_p90 * 1.1 / 10_000) * 10_000)
    recover = np.where(fc.p50 > 0)[0]
    after = recover[recover > (fc.first_gap_day or 1) - 1]
    days = int((after[0] + 1) if len(after) else len(fc.dates)) + 3
    days = min(max(days, 7), 30)
    rate = key_rate + spread
    return {"amount": amount, "days": days, "rate_pct": round(rate * 100, 1),
            "cost": round(amount * rate * days / 365, 0)}
