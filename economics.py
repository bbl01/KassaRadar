"""Юнит-экономика КассаРадар: сценарии на 100 000 активных ИП-клиентов банка.
ВСЕ параметры, кроме recall, — допущения команды, подлежащие проверке в спринте №2."""
import json
BASE = 100_000
RECALL = 0.353  # из бэктеста (синтетика)
S = {
 "Пессимистичный": dict(optin=.15, incid=.15, take=.15, uses=1.5, limit=200_000, cor=.04, paid=.05, churn=.005),
 "Базовый":        dict(optin=.30, incid=.25, take=.30, uses=2.0, limit=300_000, cor=.03, paid=.15, churn=.015),
 "Оптимистичный":  dict(optin=.45, incid=.35, take=.45, uses=2.5, limit=400_000, cor=.02, paid=.25, churn=.025),
}
DAYS, RATE, FUND, SUB, ARPU, COST = 14, .22, .14, 390, 15_000, 12_000_000
out = {}
for name, p in S.items():
    users = BASE * p["optin"]
    warned = users * p["incid"] * RECALL
    takers = warned * p["take"]
    uses = takers * p["uses"]
    vol = uses * p["limit"] * DAYS / 365                      # «рублей-годов» кредита
    credit = vol * (RATE - FUND - p["cor"])                   # чистая процентная маржа за вычетом риска
    sub = users * p["paid"] * SUB * 12
    ret = users * p["churn"] * ARPU
    total = credit + sub + ret
    out[name] = dict(users=round(users), warned=round(warned), takers=round(takers),
        credit_m=round(credit/1e6, 2), sub_m=round(sub/1e6, 1), ret_m=round(ret/1e6, 1),
        total_m=round(total/1e6, 1), net_m=round((total-COST)/1e6, 1))
print(json.dumps(out, ensure_ascii=False, indent=1))
json.dump(out, open("economics.json","w"), ensure_ascii=False, indent=1)

# --- чувствительность базового сценария: доля платящих × снижение оттока ---
def net(p, paid=None, churn=None):
    p = dict(p); p["paid"] = paid if paid is not None else p["paid"]; p["churn"] = churn if churn is not None else p["churn"]
    users = BASE * p["optin"]; takers = users * p["incid"] * RECALL * p["take"]
    credit = takers * p["uses"] * p["limit"] * DAYS / 365 * (RATE - FUND - p["cor"])
    return (credit + users * p["paid"] * SUB * 12 + users * p["churn"] * ARPU - COST) / 1e6
b = S["Базовый"]
sens = {"paid": [.0, .05, .10, .15, .20], "churn": [.0, .005, .01, .015, .02],
        "grid": [[round(net(b, pd_, ch), 1) for pd_ in [.0, .05, .10, .15, .20]] for ch in [.0, .005, .01, .015, .02]]}
json.dump(sens, open("sensitivity.json", "w"), ensure_ascii=False)
print("чувствительность (строки — отток, столбцы — доля платящих):")
for ch, row in zip(sens["churn"], sens["grid"]): print(ch, row)
