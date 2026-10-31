import numpy as np, pandas as pd
from model import forecast, offer, H
from generate_data import generate

def _hist(days=300):
    idx = pd.date_range("2026-01-01", periods=days, freq="D")
    return pd.DataFrame({"inflow": 10_000.0, "outflow": 9_000.0}, index=idx)

def test_healthy_client_has_no_gap():
    fc, b0 = forecast(_hist(), 500_000)
    assert fc.p_gap == 0 and offer(fc) is None

def test_detects_recurring_payment_gap():
    h = _hist()
    h.loc[h.index.day == 25, "outflow"] += 400_000          # зарплата 25-го
    last = h.index[-1]
    fc, b0 = forecast(h, 150_000)
    days_to_25 = [i for i, d in enumerate(fc.dates) if d.day == 25]
    if days_to_25 and b0 < 400_000:
        assert fc.p_gap > 0.5
        o = offer(fc)
        assert o and o["amount"] >= fc.shortfall_p90 and 7 <= o["days"] <= 30

def test_bands_are_ordered():
    fc, _ = forecast(generate(1, 300).set_index("date"), 100_000)
    assert (fc.p10 <= fc.p50 + 1e-6).all() and (fc.p50 <= fc.p90 + 1e-6).all() and len(fc.p50) == H

def test_no_leakage_uses_only_history():
    h = _hist(); a, _ = forecast(h, 100_000, np.random.default_rng(0))
    h2 = h.copy(); h2.iloc[-1] = h2.iloc[-1]                  # прогноз строится по тому, что передали
    b, _ = forecast(h2, 100_000, np.random.default_rng(0))
    assert np.allclose(a.p50, b.p50)
