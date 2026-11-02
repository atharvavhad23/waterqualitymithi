# Dataset audit

Audit date: 2026-11-02

## Files reviewed

- `server/mithi_river_data.csv`: attached/project CSV; synthetic or project-generated, not accepted as real evidence.
- `data/real_mithi_water_quality.csv`: provenance-controlled long-format real-data file extracted from the official MPCB PDF.
- `data/real_mithi_water_quality_wide.csv`: one row per station-month for modeling.
- `data/synthetic_mithi_water_quality.csv`: reserved for explicitly labeled augmentation; currently header-only.
- `data/source_register.csv`: official portal/source register.

## Attached CSV audit

| Check | Result |
|---|---:|
| Rows | 400,000 |
| Columns | 9 |
| Missing values | 0 in every column |
| Duplicate rows | 0 |
| Year range | 2000-2024 |
| Stations | 5 |
| WQI labels | Poor 388,215; Moderate 11,164; Good 621 |
| Date column | Missing |
| Units | Missing |
| Source/document/page provenance | Missing |

Because it has no dates, units, or source citations and has an artificial-looking balanced station allocation, it is retained only as the project's synthetic baseline. It is not copied into the real dataset.

## Real dataset status

| Item | Result |
|---|---:|
| Citable long-format measurement rows | 462 |
| Station-period rows | 92 |
| Stations | 1: MPCB station 2168 near Road Bridge, Village Mahim |
| Period | January 2017 through December 2024, where published |
| Parameters | pH, DO, BOD, fecal coliform, total coliform |
| Missing values | DO 32, BOD 1, quality-status labels 2 |
| BDL qualifiers | 25 values retained as BDL, never converted to zero |
| BOD ridge baseline | MAE 24.7208, RMSE 49.0806, R² 0.0259 |
| BOD persistence baseline | MAE 34.4286, RMSE 60.4271, R² -0.4766 |
| Deep-learning suitability | Not recommended for this single-station sample |
| Hybrid CEEMDAN-BiLSTM-XGBoost suitability | Not recommended for final claims at this sample size |

## Limits

The 462 real rows were extracted from the official MPCB Mithi River PDF, station 2168. The PDF reports month and year but not a day, so dates are stored as `YYYY-MM`; no day was invented. The PDF reports BDL and blank cells; these are preserved as qualifiers/missing values. Additional stations and parameters require more official exports before they can be merged.

A reviewer should not interpret the existing 400,000-row model scores as field validation. They are scores on the synthetic/project-generated dataset.
