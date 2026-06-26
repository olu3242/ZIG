# Heatmap Library

Risk/control heatmaps and scoring matrices. Indexed per `VISUAL_LEARNING_STANDARD.md`.

## Risk
| Heatmap | Used by | Depicts |
|---|---|---|
| Risk Heatmap | `risk/03_*`, lab `RISK_LAB_CREATE_ENTERPRISE_RISK_REGISTER.md` | Likelihood (x) × Impact (y), risks plotted by score |
| Risk Scoring Matrix | `risk/03_*` | 5x5 grid, likelihood/impact bands mapped to score ranges and treatment urgency |

## Vendor Risk
| Heatmap | Used by | Depicts |
|---|---|---|
| Vendor Risk Heatmap | `vendor_risk/04_*` | Vendors plotted by risk score with data-access multiplier applied |

## Scenario risk landscape maps
| Heatmap | Scenario | Depicts |
|---|---|---|
| CloudPay Risk Landscape Map | `docs/scenarios/CLOUDPAY.md` | All identified risks plotted by likelihood/impact |
| HealthBridge Risk Landscape Map | `docs/scenarios/HEALTHBRIDGE.md` | All identified risks plotted by likelihood/impact |
| RetailNova Risk Landscape Map | `docs/scenarios/RETAILNOVA.md` | All identified risks plotted by likelihood/impact |
| ManufacturX Risk Landscape Map | `docs/scenarios/MANUFACTURX.md` | All identified risks plotted by likelihood/impact |
| GovSec Risk Landscape Map | `docs/scenarios/GOVSEC.md` | All identified risks plotted by likelihood/impact |

## Backing data
Heatmap plots are rendered from `RiskService.findAssessments` / `RiskAssessment` records
(real, exist on `main`) — no new scoring table is created.

## What this wave does NOT do
Does not render any heatmap or change the underlying likelihood/impact scoring model.
