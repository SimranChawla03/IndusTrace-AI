# backend/app/models/schemas.py
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr, ConfigDict

# --- Auth & User Schemas ---
class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: Optional[str] = "admin"

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    email: str
    full_name: str
    role: str
    created_at: datetime

class AuthResponse(BaseModel):
    token: str
    user: UserResponse
    company: "CompanyResponse"

class OnboardingRegisterRequest(BaseModel):
    # Step 1: Company details
    company_name: str = Field(..., min_length=2, max_length=255)
    industry: str = Field(..., min_length=2, max_length=255)
    company_size: Optional[str] = "50-250 employees"
    location: Optional[str] = None
    manufacturing_process: Optional[str] = "Precision Manufacturing & Fabrication"
    
    # Step 2: Admin details
    full_name: str = Field(..., min_length=2, max_length=255)
    email: str
    password: str = Field(..., min_length=6)


# --- Facility Schemas ---
class FacilityBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    location: Optional[str] = None
    primary_process: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    image_url: Optional[str] = None

class FacilityCreate(FacilityBase):
    company_id: Optional[int] = None

class FacilityResponse(FacilityBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    waste_stream_count: Optional[int] = 0
    created_at: datetime


# --- Company Schemas ---
class CompanyBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    industry: str = Field(..., min_length=2, max_length=255)
    company_size: Optional[str] = "50-250 employees"
    location: Optional[str] = None
    contact_info: Optional[str] = None
    email: Optional[str] = None
    manufacturing_process: str = Field(..., min_length=2, max_length=255)
    process_description: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    location: Optional[str] = None
    contact_info: Optional[str] = None
    email: Optional[str] = None
    manufacturing_process: Optional[str] = None
    process_description: Optional[str] = None

class CompanyResponse(CompanyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    data_origin: str
    created_at: datetime


# --- Waste Stream Schemas ---
class WasteStreamBase(BaseModel):
    stream_name: str = Field(..., min_length=2, max_length=255)
    waste_category: str = Field(..., min_length=2, max_length=255)
    generating_process: str = Field(..., min_length=2, max_length=255)
    facility_id: Optional[int] = None
    quantity: Optional[float] = None
    quantity_unit: Optional[str] = None
    frequency: Optional[str] = None
    current_handling: Optional[str] = None
    known_characteristics: Optional[str] = None
    estimated_handling_cost: Optional[float] = None
    recovery_info: Optional[str] = None

class WasteStreamCreate(WasteStreamBase):
    company_id: Optional[int] = None

class WasteStreamUpdate(BaseModel):
    stream_name: Optional[str] = None
    waste_category: Optional[str] = None
    generating_process: Optional[str] = None
    facility_id: Optional[int] = None
    quantity: Optional[float] = None
    quantity_unit: Optional[str] = None
    frequency: Optional[str] = None
    current_handling: Optional[str] = None
    known_characteristics: Optional[str] = None
    estimated_handling_cost: Optional[float] = None
    recovery_info: Optional[str] = None

class WasteStreamResponse(WasteStreamBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    facility_name: Optional[str] = None
    data_origin: str
    created_at: datetime


# --- Lab Result Schemas ---
class LabResultBase(BaseModel):
    sample_id: str
    sample_date: Optional[str] = None
    laboratory: Optional[str] = None
    test_name: str
    measured_parameter: str
    result_value_str: str  # Preserves qualifiers: '<0.03', 'ND', 'bal.', '28.4'
    unit: Optional[str] = None
    detection_limit: Optional[str] = None
    test_method: Optional[str] = None
    notes: Optional[str] = None

class LabResultCreate(LabResultBase):
    waste_stream_id: Optional[int] = None
    result_value_numeric: Optional[float] = None

class LabResultResponse(LabResultBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    waste_stream_id: Optional[int] = None
    stream_name: Optional[str] = None
    result_value_numeric: Optional[float] = None
    data_origin: str
    created_at: datetime


# --- WIR & Research Source Schemas ---
class WIRRuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    waste_stream: str
    investigation_area: str
    missing_or_condition: str
    rule_action: str
    candidate_system_use: Optional[str] = None
    evidence_source_id: Optional[str] = None
    source_url: Optional[str] = None
    record_type: str
    evidence_confidence: Optional[str] = None
    limitations: Optional[str] = None

class ResearchSourceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    source_id: str
    title: str
    authors: Optional[str] = None
    publication_year: Optional[int] = None
    venue: Optional[str] = None
    url: str
    source_type: Optional[str] = None
    scope: Optional[str] = None
    relevant_summary: Optional[str] = None
    caveat: Optional[str] = None


# --- Assessment & Recommendation Schemas ---
class FactorScore(BaseModel):
    name: str
    weight_percent: float
    raw_value: Any
    normalized_score: float  # 0 to 100
    weighted_contribution: float  # normalized * (weight / 100)
    data_status: str  # PRESENT, UNKNOWN, PROVISIONAL_ASSUMPTION
    explanation: str

class RecommendationDetail(BaseModel):
    action: str  # Collect More Data, Further Laboratory Testing, Evaluate Recovery Feasibility, etc.
    priority: str  # High, Medium, Low
    reason: str
    supporting_evidence: List[str]
    missing_information: List[str]
    limitations: str
    suggested_next_step: str

class AssessmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    waste_stream_id: int
    stream_name: str
    company_name: str
    tws_score: Optional[float]
    priority_level: str
    factor_breakdown: List[FactorScore]
    missing_critical_info: List[str]
    matched_rules: List[Dict[str, Any]]
    recommendation: str
    recommendation_details: RecommendationDetail
    scoring_version: str
    created_at: datetime


# --- Recovery & Economics Schemas ---
class RecoveryCalculationRequest(BaseModel):
    waste_stream_id: int
    target_material: str
    scenario_type: str = "CONFIRMED_LAB_ASSAY"  # "CONFIRMED_LAB_ASSAY" or "HYPOTHETICAL_SCENARIO"
    linked_lab_result_id: Optional[int] = None
    confirmed_material_fraction: float = Field(..., ge=0.0, le=1.0)  # e.g., 0.05 for 5.0%
    recovery_rate_assumption: float = Field(..., ge=0.0, le=1.0)     # e.g., 0.75 for 75%
    market_price_per_kg: Optional[float] = None
    processing_cost_per_kg: Optional[float] = None
    testing_cost_fixed: Optional[float] = None
    transport_handling_cost: Optional[float] = None
    other_cost: Optional[float] = None
    notes: Optional[str] = None

class RecoveryScenarioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    waste_stream_id: int
    target_material: str
    waste_quantity_kg_per_month: float
    confirmed_material_fraction: float
    recovery_rate_assumption: float
    market_price_per_kg: Optional[float]
    processing_cost_per_kg: Optional[float]
    testing_cost_fixed: Optional[float]
    transport_handling_cost: Optional[float]
    other_cost: Optional[float]
    theoretical_quantity_kg: float
    estimated_recovered_quantity_kg: float
    gross_value: Optional[float]
    net_value: Optional[float]
    calculation_status: str
    scenario_type: Optional[str] = "CONFIRMED_LAB_ASSAY"
    notes: Optional[str]
    created_at: datetime


# --- Dashboard Summary Schema ---
class DashboardSummary(BaseModel):
    facilities_count: int
    waste_streams_count: int
    awaiting_investigation_count: int
    with_lab_results_count: int
    recommended_further_testing_count: int
    potentially_recoverable_count: int
    category_distribution: List[Dict[str, Any]]
    priority_distribution: List[Dict[str, Any]]
    recent_activity: List[Dict[str, Any]]
    next_recommended_action: Optional[Dict[str, Any]] = None


# --- Platform Owner Governance Schemas ---
class PlatformOverviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_companies: int
    registered_companies: int
    demo_companies: int
    total_users: int
    production_users: int = 0
    users_by_role: Dict[str, int]
    total_facilities: int
    production_facilities: int = 0
    total_waste_streams: int
    production_waste_streams: int = 0
    total_assessments: int
    production_assessments: int = 0
    total_recovery_scenarios: int
    production_recovery_scenarios: int = 0
    total_monthly_volume_kg: float
    production_monthly_volume_kg: float = 0.0
    registration_trends: List[Dict[str, Any]] = []
    recent_activity: List[Dict[str, Any]]

class PlatformCompanySummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str  # Masked/anonymized tenant identifier for privacy
    industry: str
    location: Optional[str] = None
    email: Optional[str] = None
    company_size: Optional[str] = None
    created_at: Optional[datetime] = None
    data_origin: Optional[str] = None
    user_count: int
    facility_count: int
    waste_stream_count: int
    total_monthly_volume_kg: float
    high_priority_streams_count: int

class PlatformCompanyDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    company: CompanyResponse
    users: List[UserResponse] = []
    facilities: List[FacilityResponse] = []
    facilities_count: int = 0
    waste_streams_count: int = 0
    stream_categories: Dict[str, int] = {}
    waste_streams_summary: List[Dict[str, Any]] = []
    assessments_count: int = 0
    recovery_scenarios_count: int = 0
    privacy_notice: str = "Confidentiality Protected: Raw spectroscopy, chemical assays, and trade secrets are strictly quarantined within each tenant's isolated workspace."
