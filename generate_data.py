"""Генератор синтетических операций по счетам микробизнеса (ИП).
Реальные данные банка в рамках хакатона недоступны, поэтому структура потоков
смоделирована по типовым паттернам: аренда, зарплата, налоги, лаги оплат B2B,
выплаты маркетплейсов, сезонность.
"""
import numpy as np, pandas as pd, sys

SEGMENTS = ["retail", "services", "b2b", "ecommerce"]

def make_client(rng, cid, dates):
    seg = rng.choice(SEGMENTS, p=[.30, .28, .22, .20])
    n = len(dates)
    scale = rng.lognormal(np.log(70_000), 0.55)          # средняя дневная выручка, руб.
    dow = dates.dayofweek.values
    dom = dates.day.values
    doy = dates.dayofyear.values
    season = 1 + 0.18 * np.sin(2 * np.pi * (doy - 60) / 365)
    if seg == "ecommerce":
        season = season * np.where(np.isin(dates.month.values, [11, 12]), 1.35, 1.0)

    # --- поступления ---
    if seg == "retail":
        wd = np.array([.9, .9, .95, 1, 1.1, 1.3, 1.25]); sd = 0.35
        inflow = scale * wd[dow] * season * rng.lognormal(0, sd, n)
    elif seg == "services":
        wd = np.array([1.2, 1.2, 1.1, 1.1, 1.0, .4, .2]); sd = 0.45
        inflow = scale * wd[dow] * season * rng.lognormal(0, sd, n)
    elif seg == "b2b":
        # счета выставляются, оплата приходит с лагом 10-40 дней крупными суммами
        inflow = np.zeros(n)
        k = 0
        while k < n:
            k += int(rng.integers(2, 6))
            if k >= n: break
            amt = scale * rng.lognormal(np.log(3.5), 0.6)
            lag = int(np.clip(rng.lognormal(np.log(18), 0.45), 5, 70))
            if k + lag < n:
                inflow[k + lag] += amt
        inflow *= season
    else:  # ecommerce: выплаты маркетплейса раз в неделю
        payout_dow = int(rng.integers(0, 5))
        base = scale * season * rng.lognormal(0, 0.3, n)
        inflow = np.zeros(n)
        acc = 0.0
        for i in range(n):
            acc += base[i]
            if dow[i] == payout_dow:
                inflow[i] = acc * rng.uniform(0.82, 0.95)   # комиссия и возвраты
                acc = 0.0

    mean_in = inflow.mean()
    # --- расходы ---
    cogs_ratio = {"retail": .52, "services": .22, "b2b": .50, "ecommerce": .55}[seg]
    var_out = cogs_ratio * mean_in * np.where(np.isin(dow, [5, 6]), 0.35, 1.2) * rng.lognormal(0, 0.55, n)
    rent = mean_in * 30 * rng.uniform(0.05, 0.11)
    payroll = mean_in * 30 * {"retail": .10, "services": .24, "b2b": .13, "ecommerce": .09}[seg]
    tax_rate = rng.uniform(.05, .07)
    fixed = np.zeros(n)
    for i in range(n):
        d = dom[i]
        j = 1 if rng.random() < 0.15 else 0        # платёж иногда уходит на день позже
        if d == 5 - j + 0 and j == 0: fixed[i] += rent
        if d == 6 and j == 1: fixed[i] += rent
        if d == 10 and j == 0: fixed[i] += payroll * .4
        if d == 11 and j == 1: fixed[i] += payroll * .4
        if d == 25 and j == 0: fixed[i] += payroll * .6
        if d == 26 and j == 1: fixed[i] += payroll * .6
        if d == 28 and j == 0 and i >= 30:
            fixed[i] += tax_rate * inflow[max(0, i - 30):i].sum()
    shock = rng.random(n) < 0.012
    shock_amt = shock * mean_in * rng.uniform(2, 6, n)
    # тонкая маржа микробизнеса: 0-9% от выручки (подгоняем переменные расходы)
    margin = rng.uniform(-0.008, 0.008)
    target_out = mean_in * (1 - margin)
    base_out = fixed.mean() + shock_amt.mean()
    var_out = var_out * max(0.15, (target_out - base_out) / var_out.mean())
    outflow = var_out + fixed + shock_amt
    net = inflow - outflow
    cushion = mean_in * rng.uniform(0.1, 1.0)
    open_bal = max(0.0, -np.cumsum(net)[: n - 210].min()) + cushion
    return pd.DataFrame({"client_id": cid, "segment": seg, "date": dates,
                         "inflow": inflow.round(2), "outflow": outflow.round(2),
                         "opening_balance": open_bal})

def generate(n_clients=400, days=540, end="2026-10-30", seed=42):
    rng = np.random.default_rng(seed)
    dates = pd.date_range(end=end, periods=days, freq="D")
    return pd.concat([make_client(rng, f"C{i:04d}", dates) for i in range(n_clients)], ignore_index=True)

if __name__ == "__main__":
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 400
    df = generate(n)
    df.to_csv("transactions_synthetic.csv", index=False)
    print(df.shape, df.segment.value_counts().to_dict())
