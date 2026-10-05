# Fundu Used-Smartphone Buyback Quote Integration

## 1. Business Valuation Formula
Fundu's smartphone buyback valuation follows an explicit, unit-economics-driven formula:

$$\text{Final Offer} = \max\Big(\text{Floor}, \big(\text{ResaleProceeds} \times \text{CosmeticMultiplier} + \text{AccessoriesBonus}\big) - \text{Repairs} - \text{Logistics} - \text{Reserves} - \text{TargetMargin}\Big)$$

### Terms Breakdown:
1. **Exact-Variant Expected Resale Proceeds (`ResaleProceeds`)**:
   - Pulled from Fundu's real project catalog benchmark (`MASTER_MODEL_CATALOG`, `phonesData.ts`, `ALL_INDIAN_PHONES_CATALOG`).
   - Matched against exact brand, model, and storage capacity.
   - If missing or stale (older than `maxStalenessDays = 90`), automated estimation is suspended and routed to manual review.
2. **Cosmetic Condition Adjustment (`CosmeticMultiplier`)**:
   - `flawless`: 1.00 (Like-new, zero scratches)
   - `good`: 0.92 (-8% cosmetic markdown for normal use wear)
   - `fair`: 0.82 (-18% cosmetic markdown for visible scuffs & scratches)
3. **Configured Component Repairs (`Repairs`)**:
   - Configured parts and labor pricing retrieved from Fundu's repair catalog (`CONFIGURED_REPAIRS` / `RepairPriceCatalog`):
     - Screen glass / display replacement
     - Battery health replacement (if health < 80% or service alert)
     - Rear camera repair
     - Back glass / housing chassis replacement
     - Charging port repair
     - Speaker / mic repair
   - If a reported fault lacks configured repair pricing for that specific model, the system routes to manual technician inspection.
4. **Logistics & Refurbishment Cost (`Logistics`)**:
   - `450 INR`: Doorstep rider transit, doorstep diagnostic time, certified multi-pass factory data wipe.
5. **Warranty and Risk Reserves (`Reserves`)**:
   - `5%` baseline reserve for market volatility and hidden component variance.
   - Reduced by `500 INR` credit if device is under active manufacturer warranty.
6. **Target Contribution Margin (`TargetMargin`)**:
   - `10%` target contribution margin for Fundu business operations.
7. **Minimum Floor**:
   - `500 INR` floor price for any functioning phone.

---

## 2. Confidentiality of Unit Economics
Fundu's internal cost parameters (target margins, risk reserves, pickup logistics costs, and supplier repair line margins) remain strictly on the server:
- **Seller-Facing Response**: Contains only the final conditional offer amount in INR, conditional disclaimer, and customer-understandable condition-related reasons (e.g., "Screen replacement deduction applied", "Logistics & handling included").
- **Internal Audit Record**: Preserves full calculation details (`_internalAudit`) in the database for accounting, audit trail, and rider verification.

---

## 3. Manual-Review & Inspection Routing Rules
Automated cash quotes are immediately paused and routed to manual review under the following conditions:
| Trigger Condition | Reason Code | Customer Explanation |
| :--- | :--- | :--- |
| `powers_on === false` | `NON_POWERING_DEVICE` | Non-powering phones require technical bench diagnostics to determine salvageable value. |
| `activation_lock_cleared === false` | `UNCLEARED_ACTIVATION_LOCK` | iCloud / Google FRP / Mi Account locks must be removed before an automated cash quote can be issued. |
| `ownership_verified === false` | `UNVERIFIED_OWNERSHIP` | Proof of purchase, valid invoice, or owner government ID is required for buyback processing. |
| `liquid_damage === true` | `LIQUID_DAMAGE` | Liquid or moisture exposure requires physical teardown to check for motherboard oxidation. |
| Missing variant benchmark | `MISSING_PRICING_BENCHMARK` | Resale pricing benchmark for this specific variant is not yet configured in Fundu catalog. |
| Stale variant benchmark | `STALE_PRICING_BENCHMARK` | Pricing benchmark for this model has expired and requires market update. |
| Unpriced fault | `UNPRICED_FAULT_REPAIR` | Repair cost for reported fault is not configured for this device model. |
| Deductions > 70% proceeds | `DEDUCTIONS_EXCEED_VALUE` | Repair and refurbishing deductions exceed the resale value threshold for automated buyback. |

---

## 4. Inspection Mismatch & Seller Acceptance Flow
1. **Initial Quote**: Customer receives a clearly labeled **"Conditional Estimate (Subject to Physical Doorstep Inspection)"**.
2. **Doorstep Physical Inspection**: Rider performs hardware checklist on the spot.
3. **Recalculation**: If the physical phone differs from the customer's online submission (e.g. cracked display, lower storage variant, degraded battery):
   - Server runs `recalculateInspectedQuote`.
   - Explains the exact mismatches in plain language.
   - Issues a revised offer.
4. **Mandatory Acceptance**: The seller must explicitly accept the revised offer in their dashboard before the transaction can be completed. If declined, the device is returned with no cancellation charge.
