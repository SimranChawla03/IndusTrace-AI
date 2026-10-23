# backend/app/models/entities.py
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.database.connection import Base

def get_utc_now():
    return datetime.now(timezone.utc)

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    industry = Column(String(255), nullable=False)
    company_size = Column(String(100), default="50-250 employees")
    location = Column(String(255), nullable=True)
    contact_info = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    manufacturing_process = Column(String(255), nullable=False)
    process_description = Column(Text, nullable=True)
    data_origin = Column(String(50), default="USER_REGISTERED")  # USER_REGISTERED, SYNTHETIC_DEMO, PLATFORM_SYSTEM
    created_at = Column(DateTime, default=get_utc_now)

    facilities = relationship("Facility", back_populates="company", cascade="all, delete-orphan")
    users = relationship("User", back_populates="company", cascade="all, delete-orphan")
    waste_streams = relationship("WasteStream", back_populates="company", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="admin")  # admin, member, platform_owner
    created_at = Column(DateTime, default=get_utc_now)

    company = relationship("Company", back_populates="users")


class Facility(Base):
    __tablename__ = "facilities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    primary_process = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    company = relationship("Company", back_populates="facilities")
    waste_streams = relationship("WasteStream", back_populates="facility")


class WasteStream(Base):
    __tablename__ = "waste_streams"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    facility_id = Column(Integer, ForeignKey("facilities.id", ondelete="SET NULL"), nullable=True)
    stream_name = Column(String(255), nullable=False)
    waste_category = Column(String(255), nullable=False)  # e.g., Sludge, Machining Chips, Scrap, Wastewater
    generating_process = Column(String(255), nullable=False)
    quantity = Column(Float, nullable=True)  # can be None if unknown
    quantity_unit = Column(String(50), nullable=True)  # kg/day, kg/week, tonnes/month
    frequency = Column(String(100), nullable=True)  # Daily, Weekly, Continuous, Batch, Sporadic
    current_handling = Column(String(255), nullable=True)  # Stored, Sold as scrap, Sent for treatment, Authorized handler
    known_characteristics = Column(Text, nullable=True)
    estimated_handling_cost = Column(Float, nullable=True)
    recovery_info = Column(Text, nullable=True)
    data_origin = Column(String(50), default="USER_REGISTERED")  # USER_REGISTERED, SYNTHETIC_DEMO
    created_at = Column(DateTime, default=get_utc_now)

    company = relationship("Company", back_populates="waste_streams")
    facility = relationship("Facility", back_populates="waste_streams")
    lab_results = relationship("LabResult", back_populates="waste_stream", cascade="all, delete-orphan")
    assessments = relationship("TestAssessment", back_populates="waste_stream", cascade="all, delete-orphan")
    recovery_scenarios = relationship("RecoveryScenario", back_populates="waste_stream", cascade="all, delete-orphan")


class WIRRule(Base):
    __tablename__ = "wir_rules"

    id = Column(String(50), primary_key=True)  # e.g., WIR001
    waste_stream = Column(String(255), nullable=False)
    investigation_area = Column(String(255), nullable=False)
    missing_or_condition = Column(Text, nullable=False)
    rule_action = Column(Text, nullable=False)
    candidate_system_use = Column(Text, nullable=True)
    evidence_source_id = Column(String(100), nullable=True)
    source_url = Column(Text, nullable=True)
    record_type = Column(String(100), nullable=False)  # LITERATURE_DERIVED_RULE, DATASET_USE_RULE, GUARDRAIL_RULE
    evidence_confidence = Column(String(50), nullable=True)  # High, Moderate, Low until verified
    limitations = Column(Text, nullable=True)


class ResearchSource(Base):
    __tablename__ = "research_sources"

    source_id = Column(String(50), primary_key=True)
    title = Column(Text, nullable=False)
    authors = Column(Text, nullable=True)
    publication_year = Column(Integer, nullable=True)
    venue = Column(Text, nullable=True)
    url = Column(Text, nullable=False)
    source_type = Column(String(100), nullable=True)
    scope = Column(Text, nullable=True)
    relevant_summary = Column(Text, nullable=True)
    caveat = Column(Text, nullable=True)


class LabResult(Base):
    __tablename__ = "lab_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    waste_stream_id = Column(Integer, ForeignKey("waste_streams.id", ondelete="CASCADE"), nullable=True)
    sample_id = Column(String(100), nullable=False)
    sample_date = Column(String(50), nullable=True)
    laboratory = Column(String(255), nullable=True)
    test_name = Column(String(255), nullable=False)
    measured_parameter = Column(String(255), nullable=False)  # e.g., Cu, Fe, Moisture, Oil content
    result_value_str = Column(String(100), nullable=False)  # Preserves qualifiers: ND, <0.03, bal., 28.4
    result_value_numeric = Column(Float, nullable=True)  # Numeric parsed if valid for calculations
    unit = Column(String(50), nullable=True)  # %, ppm, mg/kg, wt%
    detection_limit = Column(String(50), nullable=True)
    test_method = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    data_origin = Column(String(50), default="USER_ENTERED")  # USER_ENTERED, VERIFIED_LAB_EVIDENCE, CAESAR_EXPERIMENTAL_REFERENCE
    created_at = Column(DateTime, default=get_utc_now)

    waste_stream = relationship("WasteStream", back_populates="lab_results")


class TestAssessment(Base):
    __tablename__ = "test_assessments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    waste_stream_id = Column(Integer, ForeignKey("waste_streams.id", ondelete="CASCADE"), nullable=False)
    tws_score = Column(Float, nullable=True)  # 0 to 100, or None if insufficient data
    priority_level = Column(String(50), nullable=False)  # High, Medium, Low, Insufficient Data
    factor_breakdown = Column(JSON, nullable=False)  # Dict with normalized scores and contributions
    missing_critical_info = Column(JSON, nullable=True)  # List of identified gaps
    matched_rules = Column(JSON, nullable=True)  # List of matched WIR rules with IDs & confidence
    recommendation = Column(String(255), nullable=False)
    recommendation_details = Column(JSON, nullable=False)  # action, reason, evidence, limitations, next_step
    scoring_version = Column(String(50), default="v1.0-prototype")
    created_at = Column(DateTime, default=get_utc_now)

    waste_stream = relationship("WasteStream", back_populates="assessments")


class RecoveryScenario(Base):
    __tablename__ = "recovery_scenarios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    waste_stream_id = Column(Integer, ForeignKey("waste_streams.id", ondelete="CASCADE"), nullable=False)
    target_material = Column(String(100), nullable=False)  # e.g., Copper, Aluminium, Iron
    waste_quantity_kg_per_month = Column(Float, nullable=False)
    confirmed_material_fraction = Column(Float, nullable=False)  # 0 to 1.0 (from verified lab result)
    recovery_rate_assumption = Column(Float, nullable=False)  # 0 to 1.0 (explicitly marked assumption)
    market_price_per_kg = Column(Float, nullable=True)
    processing_cost_per_kg = Column(Float, nullable=True)
    testing_cost_fixed = Column(Float, nullable=True)
    transport_handling_cost = Column(Float, nullable=True)
    other_cost = Column(Float, nullable=True)
    
    theoretical_quantity_kg = Column(Float, nullable=False)
    estimated_recovered_quantity_kg = Column(Float, nullable=False)
    gross_value = Column(Float, nullable=True)
    net_value = Column(Float, nullable=True)
    calculation_status = Column(String(50), nullable=False)  # COMPLETE, INSUFFICIENT_COST_INPUTS, INSUFFICIENT_LAB_DATA
    scenario_type = Column(String(50), default="CONFIRMED_LAB_ASSAY")  # CONFIRMED_LAB_ASSAY, HYPOTHETICAL_SCENARIO
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    waste_stream = relationship("WasteStream", back_populates="recovery_scenarios")
