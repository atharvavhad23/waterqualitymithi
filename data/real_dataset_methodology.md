# Mithi River real-measurement dataset

## Current status

`real_mithi_water_quality.csv` contains 462 long-format measurements extracted from the official MPCB Mithi River PDF. The attached `server/mithi_river_data.csv` remains synthetic/project-generated: it has 400,000 rows, only a year field rather than a sampling date, five labels, no source column, and no document/page provenance. It is not copied into the real dataset.

No measurement row is added until an MPCB, CPCB/NWMP, India-WRIS, BMC, or peer-reviewed source can be cited to a document/table/page or stable portal record.

## Provenance rules

1. Preserve the source's station name, month/year, value, and unit.
2. Add one long-format row per measured parameter.
3. Keep the source document, URL, page, and table reference on every row.
4. Do not interpolate, forward-fill, duplicate, or infer missing measurements.
5. Keep any future augmentation in `synthetic_mithi_water_quality.csv` with `source_document` or `notes` explicitly marked `synthetic`; no augmentation has been created.

## WQI target

Use the **weighted arithmetic WQI method** only after the source values and standard values are documented. For parameters $i$:

- Quality rating: $Q_i = 100(V_i - V_{ideal,i})/(S_i - V_{ideal,i})$
- Unit weight: $W_i = K/S_i$, where $K = 1 / sum(1/S_i)$
- WQI: $WQI = sum(Q_i W_i) / sum(W_i)$

The implementation must store the standard table and its citation before calculating WQI. Recommended initial inputs are pH, dissolved oxygen, BOD, COD, TDS, turbidity, nitrate, and fecal coliform, but only parameters actually present in a cited source should be used.

Suggested classification for the weighted-arithmetic WQI output: 0-25 excellent, 26-50 good, 51-75 poor, 76-100 very poor, above 100 unsuitable. Confirm the selected standard/method against the cited WQI reference before publication.

## Leakage controls

Do not use any current-timestep parameter that is also used to calculate WQI as a feature for predicting that same WQI. For forecasting the next observation, lagged values are allowed:

- Regression targets: next-step WQI or next-step BOD.
- Classification target: next-step WQI class.
- Minimum features: station, date-derived season/month if date exists, and lagged pH, DO, BOD, COD, TDS; add turbidity/nitrate/fecal coliform only when measured.
- Split chronologically by date, with the newest period held out. If dates are sparse, hold out the newest station-period combination and report it.
- Fit scaling, feature selection, WQI standards, and any synthetic generator on training data only.

## Baseline results

The first leakage-free chronological run uses lagged measurements from the single MPCB station:

- Regression BOD persistence: MAE 34.4286, RMSE 60.4271, R² -0.4766.
- Regression BOD ridge: MAE 24.7208, RMSE 49.0806, R² 0.0259.
- Classification majority/logistic: 1.0 balanced accuracy and macro-F1 on the held-out period only because every held-out label is Non Complying; this is not evidence of multi-class generalization.
- Metrics: MAE/RMSE/R2 for regression; balanced accuracy, macro-F1, per-class precision/recall, and confusion matrix for classification.

With only 92 station-month rows and one station, prefer interpretable baselines, blocked validation, and uncertainty intervals. Do not claim that deep learning or CEEMDAN-BiLSTM generalizes from this sample.
