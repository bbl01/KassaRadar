const pptxgen = require("pptxgenjs");
const SK = "/root/.claude/skills/synced/30fcbfee-8000-4bd0-8063-3692f64f030b_ddac4040-42ff-480c-af60-41a306319e24/pptx";
const { applyTheme } = require(SK + "/scripts/apply_theme.js");
const fs = require("fs");
const M = JSON.parse(fs.readFileSync("metrics.json", "utf8"));
const E = JSON.parse(fs.readFileSync("economics.json", "utf8"));

const THEME = {
  name: "KassaRadar", headFontFace: "Cambria", bodyFontFace: "Calibri",
  colors: { dk1: "0B1F44", lt1: "FFFFFF", dk2: "1B3A6B", lt2: "EEF3FA",
    accent1: "0A5CFF", accent2: "00AAFF", accent3: "E5384F", accent4: "18A058",
    accent5: "F2A93B", accent6: "5D6B82", hlink: "0A5CFF", folHlink: "5D6B82" },
};
const HEX = { navy: "0B1F44", blue: "0A5CFF", cyan: "00AAFF", red: "E5384F", gray: "93A2BB", line: "DFE6F0", mid: "5D6B82", pale: "EEF3FA" };

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "КассаРадар — Спринт №1"; pres.author = "Команда КассаРадар";
const C = pres.SchemeColor;
const FOOT = "КассаРадар · Финтех без границ · Спринт №1";

pres.defineSlideMaster({
  title: "COVER", background: { color: C.text1 },
  objects: [],
  slideNumber: undefined,
});
pres.defineSlideMaster({
  title: "CONTENT", background: { color: C.background1 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.3, w: 9, h: 0.95, fontSize: 28, bold: true, color: C.text1, align: "left", valign: "middle", margin: 0 }, text: "" } },
    { text: { text: FOOT, options: { x: 0.5, y: 5.25, w: 6, h: 0.25, fontSize: 10, color: C.accent6, margin: 0 } } },
  ],
  slideNumber: { x: 9.0, y: 5.25, w: 0.5, h: 0.25, fontSize: 10, color: C.accent6, align: "right" },
});
pres.defineSlideMaster({
  title: "CLOSE", background: { color: C.text1 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.4, w: 9, h: 0.9, fontSize: 28, bold: true, color: C.background1, align: "left", valign: "middle", margin: 0 }, text: "" } },
  ],
});

const tb = (s, text, o) => s.addText(text, Object.assign({ isTextBox: true, margin: 0, valign: "top" }, o));
const card = (s, x, y, w, h, name, fill) => s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.1, fill: { color: fill || C.background2 }, line: { color: fill || C.background2, width: 0 }, objectName: name });
const src = (s, t) => tb(s, t, { x: 0.5, y: 4.88, w: 9, h: 0.3, fontSize: 10, color: C.accent6, objectName: "Источники" });
const radar = (s, cx, cy, r, tr) => { // мотив: радар
  [1, 0.68, 0.36].forEach((k, i) => s.addShape(pres.ShapeType.ellipse, { x: cx - r * k, y: cy - r * k, w: 2 * r * k, h: 2 * r * k, fill: { type: "none" }, line: { color: C.accent2, width: 1.25, transparency: tr }, objectName: "Радар " + (i + 1) }));
  s.addShape(pres.ShapeType.ellipse, { x: cx + r * 0.42, y: cy - r * 0.5, w: 0.2, h: 0.2, fill: { color: C.accent3 }, line: { color: C.accent3, width: 0 }, objectName: "Сигнал" });
};

// 1. Обложка
let s = pres.addSlide({ masterName: "COVER" });
radar(s, 7.7, 2.8, 2.1, 35);
tb(s, "КассаРадар", { x: 0.6, y: 1.35, w: 6, h: 1.0, fontSize: 54, bold: true, fontFace: "Cambria", color: C.background1, objectName: "Название" });
tb(s, "Прогноз кассовых разрывов ИП и микробизнеса на 14 дней — и готовое предложение банка в один клик", { x: 0.6, y: 2.5, w: 5.4, h: 1.3, fontSize: 20, color: C.background2, objectName: "Подзаголовок" });
tb(s, "Трек «Финтех без границ: банк будущего для бизнеса»  ·  Спринт №1", { x: 0.6, y: 4.6, w: 8, h: 0.35, fontSize: 14, color: C.accent2, objectName: "Трек" });
s.addNotes("КассаРадар предупреждает владельца ИП о кассовом разрыве за несколько дней и сразу предлагает решение. Это решение для бизнеса: аналитический сервис для предпринимателей и микробизнеса.");

// 2. Проблема
s = pres.addSlide({ masterName: "CONTENT" });
s.addText("Прибыльный бизнес остаётся без денег на выплаты", { placeholder: "title" });
const stats = [
  ["27%", "компаний и ИП в 2026 году впервые за долгое время столкнулись с кассовым разрывом"],
  ["> 50%", "опрошенных российских компаний столкнулись с кассовыми разрывами в 2026 году"],
  ["24%", "компаний из этого опроса закрывали нехватку личными деньгами владельца"],
  ["4,84 млн", "ИП в России на апрель 2026 года, почти 5 млн потенциальных клиентов банка"],
];
stats.forEach((st, i) => {
  const x = 0.5 + i * 2.28;
  card(s, x, 1.45, 2.1, 2.65, "Карточка " + (i + 1));
  tb(s, st[0], { x: x + 0.15, y: 1.6, w: 1.8, h: 0.7, fontSize: i === 3 ? 26 : 32, bold: true, fontFace: "Cambria", color: i === 3 ? C.accent1 : C.accent3, valign: "middle", objectName: "Цифра " + (i + 1) });
  tb(s, st[1], { x: x + 0.15, y: 2.4, w: 1.82, h: 1.6, fontSize: 14, color: C.text1, objectName: "Подпись " + (i + 1) });
});
tb(s, "Банк видит движение по счёту каждый день, но сообщает о нехватке денег только тогда, когда платёж уже не прошёл.", { x: 0.5, y: 4.25, w: 9, h: 0.6, fontSize: 16, bold: true, color: C.text1, objectName: "Вывод" });
src(s, "Источники: ФНС (РБК, апрель 2026); Актион финансы (Ведомости); опрос компаний, The Moscow Times, 20.05.2026");
s.addNotes("Цифры из открытых опросов и ФНС. В опросе Moscow Times доля компаний с оборотом до 1 млрд ₽ составляла 58%, поэтому для ИП это ориентир, а не точная оценка. В опросе Актион финансов: «впервые или впервые за долгое время». Точную долю разрывов у ИП проверим на данных банка.");

// 3. JTBD и гипотезы
s = pres.addSlide({ masterName: "CONTENT" });
s.addText("Задача клиента и гипотезы, которые проверяем", { placeholder: "title" });
card(s, 0.5, 1.45, 3.4, 3.3, "Карточка JTBD", C.accent1);
tb(s, "Задача клиента (JTBD)", { x: 0.7, y: 1.6, w: 3.0, h: 0.3, fontSize: 14, bold: true, color: C.accent2, objectName: "JTBD заголовок" });
tb(s, "Когда до аренды или зарплаты неделя, а денег на счёте не хватает, я хочу узнать об этом заранее и закрыть разрыв без визита и бумаг, чтобы не сорвать платежи и не занимать у знакомых.", { x: 0.7, y: 1.95, w: 3.0, h: 2.7, fontSize: 18, color: C.background1, objectName: "JTBD текст" });
const hyp = [
  ["H1", "Сигнал за 3+ дня меняет поведение клиента", "Проверка: 10 интервью и тест прототипа на экране"],
  ["H2", "Предложение лимита в один клик принимают", "Цель: 30% среди верно предупреждённых"],
  ["H3", "Часть клиентов платит за сервис и остаётся в банке", "Цель: 15% платят 390 ₽/мес., отток ниже на 1,5 п.п."],
];
hyp.forEach((h, i) => {
  const y = 1.45 + i * 1.12;
  card(s, 4.15, y, 5.35, 1.0, "Гипотеза " + h[0]);
  s.addShape(pres.ShapeType.ellipse, { x: 4.3, y: y + 0.25, w: 0.5, h: 0.5, fill: { color: C.accent1 }, line: { color: C.accent1, width: 0 }, objectName: "Бейдж " + h[0] });
  tb(s, h[0], { x: 4.3, y: y + 0.25, w: 0.5, h: 0.5, fontSize: 14, bold: true, color: C.background1, align: "center", valign: "middle", objectName: "Номер " + h[0] });
  tb(s, h[1], { x: 4.95, y: y + 0.1, w: 4.4, h: 0.45, fontSize: 14, bold: true, color: C.text1, objectName: "Текст " + h[0] });
  tb(s, h[2], { x: 4.95, y: y + 0.55, w: 4.4, h: 0.4, fontSize: 12, color: C.accent6, objectName: "Проверка " + h[0] });
});
s.addNotes("Честно: интервью с предпринимателями ещё впереди, сейчас опираемся на опросы. Гайд интервью лежит в аналитическом документе. Гипотезы H2 и H3 определяют экономику, поэтому проверяем их первыми.");

// 4. Как работает
s = pres.addSlide({ masterName: "CONTENT" });
s.addText("КассаРадар предупреждает за дни, а не в момент разрыва", { placeholder: "title" });
const steps = [
  ["1", "Данные", "Обороты по счёту: только суммы по дням, без контрагентов"],
  ["2", "Прогноз", "600 сценариев на 14 дней: вероятность разрыва, дата, глубина"],
  ["3", "Сигнал", "Уведомление: «Через 4 дня может не хватить 870 тыс. ₽»"],
  ["4", "Действие", "Лимит под нужную сумму и срок, подключение в один клик"],
];
steps.forEach((st, i) => {
  const x = 0.5 + i * 2.28;
  card(s, x, 1.5, 2.1, 2.3, "Шаг " + st[0]);
  s.addShape(pres.ShapeType.ellipse, { x: x + 0.15, y: 1.65, w: 0.55, h: 0.55, fill: { color: i === 2 ? C.accent3 : C.accent1 }, line: { color: C.background2, width: 0 }, objectName: "Бейдж шага " + st[0] });
  tb(s, st[0], { x: x + 0.15, y: 1.65, w: 0.55, h: 0.55, fontSize: 18, bold: true, color: C.background1, align: "center", valign: "middle", objectName: "Номер шага " + st[0] });
  tb(s, st[1], { x: x + 0.15, y: 2.3, w: 1.8, h: 0.35, fontSize: 18, bold: true, fontFace: "Cambria", color: C.text1, objectName: "Название шага " + st[0] });
  tb(s, st[2], { x: x + 0.15, y: 2.7, w: 1.8, h: 1.05, fontSize: 14, color: C.text1, objectName: "Описание шага " + st[0] });
});
card(s, 0.5, 4.0, 9, 0.85, "Плашка про ИИ", C.accent1);
tb(s, "Без нейросетей: статистика и симуляции Монте-Карло. Результат объясним клиенту и риск-менеджеру, считается внутри контура банка (on-prem).", { x: 0.7, y: 4.07, w: 8.6, h: 0.7, fontSize: 14, color: C.background1, valign: "middle", objectName: "Текст про ИИ" });
s.addNotes("Трек просит использовать ИИ только там, где он улучшает решение. Здесь хватает статистики, это проще, надёжнее и работает on-prem без зарубежных моделей.");

// 5. УТП
s = pres.addSlide({ masterName: "CONTENT" });
s.addText("Чем КассаРадар отличается от привычных решений", { placeholder: "title" });
const hd = (t, f) => ({ text: t, options: { bold: true, color: "FFFFFF", fill: { color: f || HEX.navy }, fontSize: 14, valign: "middle" } });
const cl = (t, o) => ({ text: t, options: Object.assign({ fontSize: 14, color: HEX.navy, valign: "middle" }, o || {}) });
const hl = { fill: { color: "E3EEFF" }, bold: true };
s.addTable([
  [hd(""), hd("Таблица или платёжный календарь"), hd("Овердрафт по запросу"), hd("КассаРадар", HEX.blue)],
  [cl("Когда узнаёт клиент", { bold: true }), cl("Если ведёт календарь сам"), cl("В момент нехватки"), cl("За " + String(M.median_lead_days).replace(".", ",") + " дня до разрыва (медиана в бэктесте)", hl)],
  [cl("Усилия клиента", { bold: true }), cl("Ручной ввод платежей"), cl("Заявка и ожидание"), cl("Ничего вводить не нужно: всё берётся из счёта", hl)],
  [cl("Что делать дальше", { bold: true }), cl("Решает сам"), cl("Просить деньги в спешке"), cl("Сумма, срок и предложение уже готовы", hl)],
  [cl("Риск для банка", { bold: true }), cl("Не виден"), cl("Виден, когда поздно"), cl("Виден заранее, лимит по прогнозной глубине", hl)],
], { x: 0.5, y: 1.45, w: 9, colW: [1.9, 2.3, 2.1, 2.7], rowH: [0.45, 0.7, 0.7, 0.7, 0.7], border: { type: "solid", color: HEX.line, pt: 1 }, fontFace: "Calibri", objectName: "Таблица УТП" });
s.addNotes("Сравниваем с типовыми подходами, а не с конкретными продуктами. Конкурентный анализ по рынку добавим во втором спринте.");

// 6. Аудитория и рынок
s = pres.addSlide({ masterName: "CONTENT" });
s.addText("Аудитория и рынок: от 4,84 млн ИП к пилоту на 100 тысячах", { placeholder: "title" });
card(s, 0.5, 1.45, 3.1, 1.55, "Карточка ИП");
tb(s, "4,84 млн", { x: 0.7, y: 1.55, w: 2.8, h: 0.6, fontSize: 32, bold: true, fontFace: "Cambria", color: C.accent1, objectName: "ИП цифра" });
tb(s, "ИП в России, основной сегмент (ФНС, апрель 2026)", { x: 0.7, y: 2.2, w: 2.8, h: 0.7, fontSize: 14, color: C.text1, objectName: "ИП подпись" });
card(s, 0.5, 3.15, 3.1, 1.55, "Карточка самозанятые");
tb(s, "15+ млн", { x: 0.7, y: 3.25, w: 2.8, h: 0.6, fontSize: 32, bold: true, fontFace: "Cambria", color: C.accent6, objectName: "СЗ цифра" });
tb(s, "самозанятых, следующий сегмент после ИП (ФНС, 2026)", { x: 0.7, y: 3.9, w: 2.8, h: 0.7, fontSize: 14, color: C.text1, objectName: "СЗ подпись" });
tb(s, "Воронка пилота, базовый сценарий (допущения команды)", { x: 3.9, y: 1.45, w: 5.6, h: 0.3, fontSize: 14, bold: true, color: C.text1, objectName: "Воронка заголовок" });
const fun = [[100000, "активных ИП-клиентов банка"], [E["Базовый"].users, "подключили КассаРадар (30%)"], [7500, "сталкиваются с разрывом за год (25%)"], [E["Базовый"].warned, "получили верный сигнал заранее (recall 35%)"]];
fun.forEach((f, i) => {
  const w = [3.0, 2.3, 1.5, 1.0][i], y = 1.9 + i * 0.7;
  s.addShape(pres.ShapeType.roundRect, { x: 3.9, y, w, h: 0.55, rectRadius: 0.08, fill: { color: i === 3 ? C.accent3 : C.accent1 }, line: { color: C.background1, width: 0 }, objectName: "Столбец воронки " + (i + 1) });
  tb(s, String(f[0]).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0"), { x: 3.98, y, w: w - 0.08, h: 0.55, fontSize: 14, bold: true, color: C.background1, valign: "middle", objectName: "Число воронки " + (i + 1) });
  tb(s, f[1], { x: 7.05, y, w: 2.45, h: 0.55, fontSize: 12, color: C.text1, valign: "middle", objectName: "Подпись воронки " + (i + 1) });
});
src(s, "Источники: ФНС (РБК, Точка, ОСН, 2026). Доли в воронке — допущения, уточняем по данным банка во втором спринте.");
s.addNotes("Размер базы пилота (100 тысяч) — допущение. Проценты подключения и частоты разрывов тоже допущения; recall 35% взят из бэктеста на синтетике.");

// 7. MVP
s = pres.addSlide({ masterName: "CONTENT" });
s.addText("Рабочий прототип: прогноз, сигнал и предложение на одном экране", { placeholder: "title" });
s.addImage({ path: "demo_screenshot.png", x: 0.5, y: 1.4, w: 5.5, h: 3.49, objectName: "Скриншот демо", altText: "Экран демо КассаРадар: вероятность разрыва, график прогноза и предложение лимита" });
const mv = [
  ["Работает", "Прогноз остатка на 14 дней с диапазоном 10–90%"],
  ["Работает", "Вероятность и день разрыва, глубина по P90"],
  ["Работает", "Подбор суммы и срока лимита"],
  ["Проверено", "Бэктест на 13 тыс. прогнозов, 4 автотеста"],
  ["Дальше", "Данные банка вместо синтетики"],
];
mv.forEach((m, i) => {
  const y = 1.4 + i * 0.7;
  s.addShape(pres.ShapeType.roundRect, { x: 6.25, y: y + 0.05, w: 0.95, h: 0.3, rectRadius: 0.1, fill: { color: m[0] === "Дальше" ? C.accent5 : C.accent4 }, line: { color: C.background1, width: 0 }, objectName: "Статус " + (i + 1) });
  tb(s, m[0], { x: 6.25, y: y + 0.05, w: 0.95, h: 0.3, fontSize: 11, bold: true, color: C.background1, align: "center", valign: "middle", objectName: "Статус текст " + (i + 1) });
  tb(s, m[1], { x: 7.3, y, w: 2.2, h: 0.65, fontSize: 13, color: C.text1, valign: "middle", objectName: "Описание " + (i + 1) });
});
s.addNotes("Демо открывается как одна HTML-страница без сервера. Данные синтетические: 600 ИП четырёх типов за 540 дней. Исходный код и тесты в репозитории.");

// 8. Бэктест
s = pres.addSlide({ masterName: "CONTENT" });
s.addText("Бэктест: модель находит больше разрывов, чем наивный метод", { placeholder: "title" });
const pc = v => Math.round(v * 1000) / 10;
s.addChart(pres.charts.BAR, [
  { name: "КассаРадар", labels: ["Precision", "Recall", "F1"], values: [pc(M.precision), pc(M.recall), pc(M.f1)] },
  { name: "Наивный метод", labels: ["Precision", "Recall", "F1"], values: [pc(M.naive_precision), pc(M.naive_recall), pc(M.naive_f1)] },
], { x: 0.5, y: 1.4, w: 5.3, h: 3.4, barDir: "col", barGrouping: "clustered", chartColors: [HEX.blue, HEX.gray],
  showTitle: true, title: "Обнаружение разрывов на тестовых клиентах, %", titleFontSize: 14, titleColor: HEX.navy, titleFontFace: "+mn-lt",
  showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 12, dataLabelColor: HEX.navy, dataLabelFontFace: "+mn-lt", dataLabelFormatCode: "0.0",
  showLegend: true, legendPos: "b", legendFontSize: 12, legendColor: HEX.navy, legendFontFace: "+mn-lt",
  catAxisLabelColor: HEX.navy, catAxisLabelFontSize: 12, catAxisLabelFontFace: "+mn-lt",
  valAxisLabelColor: HEX.mid, valAxisLabelFontSize: 11, valAxisLabelFontFace: "+mn-lt", valAxisMinVal: 0, valAxisMaxVal: 50, valAxisMajorUnit: 10,
  valGridLine: { color: HEX.line, size: 0.75 }, catGridLine: { style: "none" }, objectName: "График бэктеста" });
const kp = [
  ["−" + String(M.mae_gain_pct).replace(".", ",") + "%", "ошибка прогноза остатка против наивного метода"],
  [String(M.median_lead_days).replace(".", ",") + " дня", "медианный запас времени до разрыва"],
  [Math.round(M.coverage_p10_p90 * 100) + "%", "покрытие интервала при цели 80%: модель пока самоуверенна"],
];
kp.forEach((k, i) => {
  const y = 1.4 + i * 1.15;
  card(s, 6.05, y, 3.45, 1.05, "Показатель " + (i + 1));
  tb(s, k[0], { x: 6.2, y: y + 0.1, w: 1.3, h: 0.85, fontSize: 24, bold: true, fontFace: "Cambria", color: i === 2 ? C.accent3 : C.accent1, valign: "middle", objectName: "Значение " + (i + 1) });
  tb(s, k[1], { x: 7.55, y: y + 0.1, w: 1.85, h: 0.85, fontSize: 12, color: C.text1, valign: "middle", objectName: "Расшифровка " + (i + 1) });
});
src(s, "Синтетические данные; тест: " + M.n_test.toLocaleString("ru-RU").replace(/ /g, " ") + " прогнозов, " + M.n_test_gaps + " реальных разрывов, клиенты теста не участвовали в подборе порога.");
s.addNotes("Показываем и слабые места: precision около 39%, то есть большинство сигналов ложные, и интервалы уже, чем нужно. Выборка небольшая (68 событий), поэтому цифры ориентировочные. Решение: мягкие уведомления и калибровка на данных банка.");

// 9. Метрики
s = pres.addSlide({ masterName: "CONTENT" });
s.addText("Метрики продукта и цели пилота", { placeholder: "title" });
card(s, 0.5, 1.4, 9, 0.8, "North Star", C.accent1);
tb(s, "North Star: доля верно предсказанных разрывов, которые клиент закрыл заранее (лимит, пополнение, перенос платежа)", { x: 0.7, y: 1.45, w: 8.6, h: 0.7, fontSize: 14, bold: true, color: C.background1, valign: "middle", objectName: "North Star текст" });
const th = t => ({ text: t, options: { bold: true, color: "FFFFFF", fill: { color: HEX.navy }, fontSize: 13, valign: "middle" } });
const td = (t, b) => ({ text: t, options: { fontSize: 13, color: HEX.navy, bold: !!b, valign: "middle" } });
s.addTable([
  [th("Группа"), th("Метрика"), th("Цель пилота")],
  [td("Качество", 1), td("Precision / Recall на данных банка"), td("≥ 40% / ≥ 35%")],
  [td("Качество", 1), td("Запас времени до разрыва (медиана)"), td("≥ 3 дней")],
  [td("Вовлечённость", 1), td("Подключили сервис / приняли предложение"), td("30% / 30%")],
  [td("Деньги", 1), td("Платят за сервис / отток ниже"), td("15% / на 1,5 п.п.")],
  [td("Доверие", 1), td("Жалобы на ложные сигналы"), td("< 2% клиентов")],
], { x: 0.5, y: 2.35, w: 9, colW: [1.9, 4.9, 2.2], rowH: 0.4, border: { type: "solid", color: HEX.line, pt: 1 }, fontFace: "Calibri", objectName: "Таблица метрик" });
s.addNotes("Цели пилота — наши гипотезы, их уточним после интервью и данных банка.");

// 10. Экономика
s = pres.addSlide({ masterName: "CONTENT" });
s.addText("Экономика: доход даёт подписка и удержание, а не кредит", { placeholder: "title" });
const names = ["Пессимистичный", "Базовый", "Оптимистичный"];
s.addChart(pres.charts.BAR, [
  { name: "Подписка", labels: names, values: names.map(n => E[n].sub_m) },
  { name: "Удержание клиентов", labels: names, values: names.map(n => E[n].ret_m) },
  { name: "Кредитная маржа", labels: names, values: names.map(n => E[n].credit_m) },
], { x: 0.5, y: 1.4, w: 5.5, h: 3.4, barDir: "col", barGrouping: "stacked", chartColors: [HEX.blue, HEX.cyan, HEX.red],
  showTitle: true, title: "Годовой эффект на 100 тыс. ИП, млн ₽", titleFontSize: 14, titleColor: HEX.navy, titleFontFace: "+mn-lt",
  showValue: false, showLegend: true, legendPos: "b", legendFontSize: 12, legendColor: HEX.navy, legendFontFace: "+mn-lt",
  catAxisLabelColor: HEX.navy, catAxisLabelFontSize: 12, catAxisLabelFontFace: "+mn-lt",
  valAxisLabelColor: HEX.mid, valAxisLabelFontSize: 11, valAxisLabelFontFace: "+mn-lt",
  valGridLine: { color: HEX.line, size: 0.75 }, catGridLine: { style: "none" }, objectName: "График экономики" });
const ec = [
  [E["Пессимистичный"].net_m, "Пессимистичный", "затраты 12 млн ₽ не окупаются"],
  [E["Базовый"].net_m, "Базовый", "эффект за вычетом затрат, млн ₽"],
  [E["Оптимистичный"].net_m, "Оптимистичный", "эффект за вычетом затрат, млн ₽"],
];
ec.forEach((e, i) => {
  const y = 1.4 + i * 0.95;
  card(s, 6.25, y, 3.25, 0.85, "Сценарий " + (i + 1));
  const v = (e[0] > 0 ? "+" : "−") + Math.abs(e[0]).toFixed(1).replace(".", ",");
  tb(s, v, { x: 6.4, y: y + 0.05, w: 1.2, h: 0.75, fontSize: 24, bold: true, fontFace: "Cambria", color: e[0] > 0 ? C.accent4 : C.accent3, valign: "middle", objectName: "Эффект " + (i + 1) });
  tb(s, e[1] + ": " + e[2], { x: 7.65, y: y + 0.05, w: 1.75, h: 0.75, fontSize: 12, color: C.text1, valign: "middle", objectName: "Сценарий текст " + (i + 1) });
});
tb(s, "Кредит даёт около 3% эффекта в базовом сценарии. Главные гипотезы: платят ли клиенты и остаются ли в банке.", { x: 6.25, y: 4.25, w: 3.25, h: 0.6, fontSize: 12, bold: true, color: C.text1, objectName: "Вывод экономики" });
src(s, "Все параметры, кроме recall, — допущения команды (подписка 390 ₽/мес., ставка 22%, затраты 12 млн ₽). Финмодель уточним в спринте №2.");
s.addNotes("Важный вывод: кредитная маржа по короткому лимиту мала. Поэтому продукт продаём как сервис с подпиской и инструмент удержания, а кредит — как естественное продолжение. Это нужно подтвердить интервью и A/B-тестом.");

// 11. Дорожная карта
s = pres.addSlide({ masterName: "CONTENT" });
s.addText("Дорожная карта до финала и путь к пилоту", { placeholder: "title" });
const rm = [
  ["Спринт №1", "до 1 ноября", ["Прототип и бэктест на синтетике", "Гипотезы, метрики, гайд интервью", "Запуск интервью по гайду"], C.accent1],
  ["Спринт №2", "16–29 ноября", ["Калибровка на выборке банка", "Финансовая модель", "Защита данных: on-prem, 152-ФЗ"], C.accent1],
  ["Спринт №3", "3–8 декабря", ["Сценарий пилота и масштабирование", "A/B-дизайн на 1–3 тыс. ИП", "Финальный питч"], C.accent1],
];
rm.forEach((r, i) => {
  const x = 0.5 + i * 3.05;
  card(s, x, 1.45, 2.9, 2.45, "Спринт " + (i + 1));
  tb(s, r[0], { x: x + 0.2, y: 1.58, w: 2.5, h: 0.35, fontSize: 18, bold: true, fontFace: "Cambria", color: C.accent1, objectName: "Название спринта " + (i + 1) });
  tb(s, r[1], { x: x + 0.2, y: 1.95, w: 2.5, h: 0.3, fontSize: 14, color: C.accent6, objectName: "Даты спринта " + (i + 1) });
  tb(s, r[2].map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < r[2].length - 1 } })), { x: x + 0.2, y: 2.35, w: 2.55, h: 1.45, fontSize: 14, color: C.text1, paraSpaceAfter: 4, objectName: "Задачи спринта " + (i + 1) });
});
card(s, 0.5, 4.05, 9, 0.8, "Плашка пилота", C.accent1);
tb(s, "Пилот: 8 недель, 1–3 тыс. ИП-клиентов банка, контрольная группа без сигналов; решение о масштабировании по North Star и удержанию.", { x: 0.7, y: 4.1, w: 8.6, h: 0.7, fontSize: 14, bold: true, color: C.background1, valign: "middle", objectName: "Текст пилота" });
s.addNotes("Состав спринтов соответствует фокусам организаторов: спринт 1 — проблема и MVP, спринт 2 — MVP, финмодель, защита данных, спринт 3 — пилот и питч.");

// 12. Риски
s = pres.addSlide({ masterName: "CONTENT" });
s.addText("Риски и как мы их снимаем", { placeholder: "title" });
const rk = [
  ["Ложные сигналы", "При выбранном пороге большинство сигналов ложные (precision " + Math.round(M.precision * 100) + "%)", "Мягкое уведомление, настраиваемый порог, кнопка «неактуально»"],
  ["Синтетика ≠ реальность", "Все цифры бэктеста получены на смоделированных данных", "Калибровка на выборке банка и A/B до масштабирования"],
  ["Кредитный риск", "Лимит выдаётся под прогноз, а не под факт", "Сумма по P90 глубины, срок 7–30 дней, решение в рамках скоринга банка"],
  ["Данные и закон", "Операции ИП — персональные и финансовые данные", "On-prem, только дневные агрегаты, 152-ФЗ и 115-ФЗ при оценке пилота"],
];
rk.forEach((r, i) => {
  const y = 1.4 + i * 0.85;
  card(s, 0.5, y, 9, 0.75, "Риск " + (i + 1));
  tb(s, r[0], { x: 0.65, y: y + 0.05, w: 1.9, h: 0.65, fontSize: 14, bold: true, color: C.accent3, valign: "middle", objectName: "Риск название " + (i + 1) });
  tb(s, r[1], { x: 2.65, y: y + 0.05, w: 3.0, h: 0.65, fontSize: 12, color: C.text1, valign: "middle", objectName: "Риск суть " + (i + 1) });
  tb(s, r[2], { x: 5.8, y: y + 0.05, w: 3.6, h: 0.65, fontSize: 12, bold: true, color: C.text1, valign: "middle", objectName: "Риск мера " + (i + 1) });
});
s.addNotes("Не скрываем слабые места: именно по ним строится план второго спринта.");

// 13. Финал
s = pres.addSlide({ masterName: "CLOSE" });
s.addText("Что нужно от банка для пилота", { placeholder: "title" });
radar(s, 8.2, 3.3, 1.5, 55);
const ask = [
  ["1", "Обезличенная выборка", "Обороты 1–5 тыс. ИП за 12 месяцев и более, только дневные суммы"],
  ["2", "Эксперт по продуктам МСБ", "Проверить гипотезу лимита и порядок одобрения"],
  ["3", "Площадка для A/B", "Показ сигнала части клиентов в приложении"],
];
ask.forEach((a, i) => {
  const y = 1.55 + i * 1.05;
  s.addShape(pres.ShapeType.ellipse, { x: 0.5, y: y + 0.1, w: 0.6, h: 0.6, fill: { color: C.accent2 }, line: { color: C.accent2, width: 0 }, objectName: "Бейдж запроса " + a[0] });
  tb(s, a[0], { x: 0.5, y: y + 0.1, w: 0.6, h: 0.6, fontSize: 20, bold: true, color: C.text1, align: "center", valign: "middle", objectName: "Номер запроса " + a[0] });
  tb(s, a[1], { x: 1.3, y, w: 5.2, h: 0.35, fontSize: 18, bold: true, fontFace: "Cambria", color: C.background1, objectName: "Запрос " + a[0] });
  tb(s, a[2], { x: 1.3, y: y + 0.38, w: 5.2, h: 0.5, fontSize: 14, color: C.background2, objectName: "Запрос описание " + a[0] });
});
tb(s, "КассаРадар: деньги на платёж — до того, как их перестало хватать", { x: 0.5, y: 4.8, w: 9, h: 0.4, fontSize: 16, color: C.accent2, objectName: "Слоган" });

(async () => {
  await pres.writeFile({ fileName: "KassaRadar_Sprint1.pptx" });
  await applyTheme("KassaRadar_Sprint1.pptx", THEME);
  console.log("ok");
})();
