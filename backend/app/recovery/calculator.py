# backend/app/recovery/calculator.py
from typing import Dict, Any, Optional
from app.models.entities import WasteStream
from app.models.schemas import RecoveryCalculationRequest

def normalize_quantity_to_kg_month(quantity: Optional[float], unit: Optional[str], frequency: Optional[str]) -> Optional[float]:
    """
    Safely normalizes waste quantity into kg/month based on reported unit and frequency.
    """
    if quantity is None:
        return None
    
    qty = float(quantity)
    u = (unit or "").lower().strip()
    f = (frequency or "").lower().strip()

    # Base weight conversion to kg
    if "tonne" in u or "ton" in u or "t" == u:
        base_kg = qty * 1000.0
    elif "gram" in u or "g" == u:
        base_kg = qty / 1000.0
    elif "kg" in u or not u:
        base_kg = qty
    else:
        # Unknown non-mass unit (e.g., liters without density, barrels)
        # Cannot safely assume density without lab measurement
        return None

    # Frequency conversion to monthly multiplier (assume 25 working days / month, 4 weeks / month)
    if "day" in u or "daily" in f:
        monthly_kg = base_kg * 25.0
    elif "week" in u or "weekly" in f:
        monthly_kg = base_kg * 4.0
    elif "month" in u or "monthly" in f:
        monthly_kg = base_kg
    elif "year" in u or "annual" in f:
        monthly_kg = base_kg / 12.0
    else:
        # Default assume reported rate represents standard monthly baseline if unspecified
        monthly_kg = base_kg

    return round(monthly_kg, 2)


def compute_recovery_and_economics(
    stream: WasteStream,
    req: RecoveryCalculationRequest
) -> Dict[str, Any]:
    """
    Implements exact transparent scientific formulas:
    - Theoretical target material quantity = waste quantity * confirmed target material fraction
    - Estimated recovered quantity = theoretical target material quantity * recovery-rate assumption
    - Estimated gross value = estimated recovered quantity * market price
    - Estimated net value = gross value - entered applicable costs
    """
    notes_list = []
    
    # 1. Quantity validation
    monthly_waste_kg = normalize_quantity_to_kg_month(
        stream.quantity,
        stream.quantity_unit,
        stream.frequency
    )
    
    if monthly_waste_kg is None or monthly_waste_kg <= 0:
        return {
            "status": "INSUFFICIENT_QUANTITY_DATA",
            "message": "Cannot calculate recovery: stream quantity is missing, non-numeric, or unit is non-standard.",
            "theoretical_quantity_kg": 0.0,
            "estimated_recovered_quantity_kg": 0.0,
            "waste_quantity_kg_per_month": 0.0,
            "gross_value": None,
            "net_value": None,
            "missing_inputs": ["Valid quantitative mass (kg/tonnes)"]
        }

    # 2. Material fractions
    # Theoretical target material quantity = waste quantity * confirmed target material fraction
    theoretical_qty = round(monthly_waste_kg * req.confirmed_material_fraction, 2)

    # Estimated recovered quantity = theoretical target material quantity * recovery-rate assumption
    recovered_qty = round(theoretical_qty * req.recovery_rate_assumption, 2)

    missing_inputs = []
    if req.market_price_per_kg is None:
        missing_inputs.append("Market commodity price per kg")
    
    # 3. Economics
    gross_val = None
    net_val = None
    calc_status = "COMPLETE"

    if req.market_price_per_kg is not None and req.market_price_per_kg >= 0:
        gross_val = round(recovered_qty * req.market_price_per_kg, 2)
        
        # Calculate total operational costs
        total_costs = 0.0
        has_cost_data = False

        if req.processing_cost_per_kg is not None:
            proc_cost = recovered_qty * req.processing_cost_per_kg
            total_costs += proc_cost
            has_cost_data = True
        else:
            missing_inputs.append("Processing cost per kg (optional but recommended)")

        if req.testing_cost_fixed is not None:
            total_costs += req.testing_cost_fixed
            has_cost_data = True

        if req.transport_handling_cost is not None:
            total_costs += req.transport_handling_cost
            has_cost_data = True

        if req.other_cost is not None:
            total_costs += req.other_cost
            has_cost_data = True

        if has_cost_data:
            net_val = round(gross_val - total_costs, 2)
        else:
            net_val = None
            calc_status = "PARTIAL_COSTS_RECORDED"
            notes_list.append("Notice: Net economic valuation cannot yet be determined because operational processing and transport costs are unrecorded. Gross material value is shown for reference only and does not represent net profit.")
    else:
        calc_status = "INSUFFICIENT_COST_INPUTS"
        notes_list.append("Economic net valuation could not be computed due to missing commodity market price.")

    notes_list.append(
        "Scientific Notice: Recovery assumption is a user-supplied scenario parameter and does not constitute a guaranteed metallurgical recovery outcome."
    )

    return {
        "status": calc_status,
        "waste_quantity_kg_per_month": monthly_waste_kg,
        "theoretical_quantity_kg": theoretical_qty,
        "estimated_recovered_quantity_kg": recovered_qty,
        "gross_value": gross_val,
        "net_value": net_val,
        "missing_inputs": missing_inputs,
        "notes": " | ".join(notes_list)
    }
