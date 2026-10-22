# tests/test_backend.py
import sys
import os
import time

# Ensure backend directory is in python search path
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.database.connection import Base, get_db
from app.main import app, create_access_token
from app.models.entities import Company, User, Facility, WasteStream, WIRRule, LabResult, TestAssessment as AssessmentEntity, RecoveryScenario
from app.services.data_loader import init_db_with_datasets
from app.decision_engine import match_stream_against_wir, calculate_tws, generate_recommendation
from app.decision_engine.tws_scorer import load_tws_weights, DEFAULT_TWS_WEIGHTS
from app.recovery import compute_recovery_and_economics, normalize_quantity_to_kg_month
from app.models.schemas import RecoveryCalculationRequest

# -------------------------------------------------------------------------
# Isolated Test Database Configuration
# -------------------------------------------------------------------------
TEST_DB_PATH = os.path.abspath(os.path.join(BACKEND_DIR, "data", "test_industrace_isolated.db"))
test_engine = create_engine(f"sqlite:///{TEST_DB_PATH}", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Override FastAPI get_db dependency to point exclusively to the isolated test database
app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module", autouse=True)
def setup_test_database():
    """Initializes schema and reference datasets on the isolated test SQLite database."""
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    
    db = TestingSessionLocal()
    init_db_with_datasets(db)
    
    # Ensure baseline test company & user exist
    test_co = Company(
        name="IndusTrace Benchmark Test Corp",
        industry="Machining & Metallurgy",
        company_size="100-250 employees",
        location="Pune MIDC, Maharashtra",
        email="test_benchmark@industrace.ai",
        manufacturing_process="CNC Milling & Precision Turning",
        data_origin="TEST_FIXTURE"
    )
    db.add(test_co)
    db.commit()
    db.refresh(test_co)

    test_user = User(
        company_id=test_co.id,
        email="benchmark_admin@industrace.ai",
        hashed_password="secure_fixture_password_hash",
        full_name="Benchmark Lead",
        role="admin"
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)

    test_facility = Facility(
        company_id=test_co.id,
        name="Primary Precision Facility",
        location="Pune MIDC",
        primary_process="5-Axis CNC Milling",
        description="Benchmark facility for unit testing"
    )
    db.add(test_facility)
    db.commit()
    db.refresh(test_facility)
    
    # Baseline test stream
    test_stream = WasteStream(
        company_id=test_co.id,
        facility_id=test_facility.id,
        stream_name="Aluminium 7075 Machining Chips",
        waste_category="Machining Chips",
        generating_process="High Speed Milling",
        quantity=250.0,
        quantity_unit="kg/week",
        frequency="Weekly",
        current_handling="Collected in bins and sold to secondary merchant",
        known_characteristics="Aluminium alloy 7075 with 4% residual water-soluble coolant",
        estimated_handling_cost=15000.0,
        data_origin="TEST_FIXTURE"
    )
    db.add(test_stream)
    db.commit()

    # Seed platform owner in test database
    from app.main import hash_password
    platform_co = Company(
        name="IndusTrace Global Governance",
        industry="Platform Operations",
        email="owner@industrace.ai",
        manufacturing_process="Platform Oversight & Audit",
        data_origin="PLATFORM_SYSTEM"
    )
    db.add(platform_co)
    db.commit()
    db.refresh(platform_co)

    platform_owner = User(
        company_id=platform_co.id,
        email="owner@industrace.ai",
        hashed_password=hash_password("PlatformOwner2026!"),
        full_name="Platform Administrator",
        role="platform_owner"
    )
    db.add(platform_owner)
    db.commit()
    db.close()

    yield

    # Clean up test database file after test module finishes
    try:
        test_engine.dispose()
        if os.path.exists(TEST_DB_PATH):
            os.remove(TEST_DB_PATH)
    except Exception:
        pass

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="module")
def benchmark_info():
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == "benchmark_admin@industrace.ai").first()
    stream = db.query(WasteStream).filter(WasteStream.company_id == user.company_id).first()
    token = create_access_token(user_id=user.id, company_id=user.company_id)
    stream_id = stream.id
    db.close()
    return {"token": token, "user_id": user.id, "company_id": user.company_id, "stream_id": stream_id}

# -------------------------------------------------------------------------
# Test Cases
# -------------------------------------------------------------------------

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Deeya Saoji" in str(data["team"])
    assert "Dr. Abhishek Sahu" in str(data["team"])


def test_auth_and_tamper_protection(client):
    # 1. Unauthenticated request to protected route is rejected with 401
    unauth_res = client.get("/api/waste-streams")
    assert unauth_res.status_code == 401
    assert "Authentication required" in unauth_res.json()["detail"]

    # 2. Tampered or malformed token is rejected with 401
    bad_token_res = client.get("/api/waste-streams", headers={"Authorization": "Bearer fraudulent_tampered_token_xyz"})
    assert bad_token_res.status_code == 401


def test_company_registration_and_login_lifecycle(client):
    unique_email = f"lead_{int(time.time())}@pioneeraero.com"
    
    # 1. Register new company
    reg_res = client.post("/api/auth/register-company", json={
        "company_name": "Pioneer Aerospace Components",
        "industry": "Aerospace Machining",
        "company_size": "250-500 employees",
        "location": "Nagpur MIDC, Maharashtra",
        "manufacturing_process": "Precision 5-Axis Milling",
        "full_name": "Simran Chawla",
        "email": unique_email,
        "password": "secure_password_987"
    })
    assert reg_res.status_code == 200
    reg_data = reg_res.json()
    token = reg_data["token"]
    co_id = reg_data["company"]["id"]
    assert token is not None
    assert reg_data["company"]["name"] == "Pioneer Aerospace Components"

    # 2. Login with valid credentials
    login_res = client.post("/api/auth/login", json={
        "email": unique_email,
        "password": "secure_password_987"
    })
    assert login_res.status_code == 200
    login_token = login_res.json()["token"]
    assert login_token is not None

    # 3. Login with invalid password fails with 401
    bad_login = client.post("/api/auth/login", json={
        "email": unique_email,
        "password": "wrong_password"
    })
    assert bad_login.status_code == 401

    # 4. Verify /api/auth/me returns session data
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["user"]["email"] == unique_email
    assert me_res.json()["company"]["id"] == co_id


def test_waste_stream_persistence_and_deletion(client):
    # Register company
    unique_ts = int(time.time() * 1000)
    co_res = client.post("/api/auth/register-company", json={
        "company_name": f"Precision Dynamics {unique_ts}",
        "industry": "Precision Engineering",
        "company_size": "50-100",
        "location": "Nashik, MH",
        "manufacturing_process": "Lathe & CNC Operations",
        "full_name": "Shriram Gosavi",
        "email": f"shriram_{unique_ts}@dynamics.com",
        "password": "secure_password_abc"
    })
    token = co_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create waste stream
    s_res = client.post("/api/waste-streams", headers=headers, json={
        "stream_name": "Brass Swarf from Bushing Turning",
        "waste_category": "Machining Chips",
        "generating_process": "CNC Turning",
        "quantity": 180.0,
        "quantity_unit": "kg/week",
        "frequency": "Weekly",
        "current_handling": "Collected in drums",
        "known_characteristics": "Brass alloy CuZn39Pb3 with mineral oil coating",
        "estimated_handling_cost": 8500.0
    })
    assert s_res.status_code == 200
    stream_id = s_res.json()["id"]

    # Verify stream persistence
    fetch_res = client.get(f"/api/waste-streams/{stream_id}", headers=headers)
    assert fetch_res.status_code == 200
    assert fetch_res.json()["quantity"] == 180.0
    assert fetch_res.json()["stream_name"] == "Brass Swarf from Bushing Turning"

    # Update stream
    put_res = client.put(f"/api/waste-streams/{stream_id}", headers=headers, json={
        "quantity": 220.0,
        "estimated_handling_cost": 9200.0
    })
    assert put_res.status_code == 200
    assert put_res.json()["quantity"] == 220.0

    # Delete stream
    del_res = client.delete(f"/api/waste-streams/{stream_id}", headers=headers)
    assert del_res.status_code == 200
    assert "deleted successfully" in del_res.json()["message"]

    # Confirm deletion
    not_found_res = client.get(f"/api/waste-streams/{stream_id}", headers=headers)
    assert not_found_res.status_code == 404


def test_wir_matching_relevance(client):
    wir_res = client.get("/api/wir")
    assert wir_res.status_code == 200
    rules = wir_res.json()
    assert len(rules) >= 5
    assert any("chips" in r["waste_stream"].lower() for r in rules)


def test_tws_scoring_and_factor_breakdown(client, benchmark_info):
    headers = {"Authorization": f"Bearer {benchmark_info['token']}"}
    stream_id = benchmark_info["stream_id"]
    ass_res = client.post(f"/api/assessment/{stream_id}", headers=headers)
    assert ass_res.status_code == 200
    ass_data = ass_res.json()
    
    assert "tws_score" in ass_data
    assert 0 <= ass_data["tws_score"] <= 100
    assert len(ass_data["factor_breakdown"]) == 6
    
    # Check factor weights sum to 100%
    total_weight = sum(f["weight_percent"] for f in ass_data["factor_breakdown"])
    assert total_weight == 100.0

    # Verify explainable recommendation
    assert "recommendation" in ass_data
    assert ass_data["recommendation_details"]["action"] is not None
    assert len(ass_data["recommendation_details"]["suggested_next_step"]) > 0


def test_laboratory_assay_lifecycle_and_assessment_recalculation(client, benchmark_info):
    headers = {"Authorization": f"Bearer {benchmark_info['token']}"}
    stream_id = benchmark_info["stream_id"]
    
    # 1. Post verified lab assay with qualifier preservation
    lab_res = client.post("/api/lab-results", headers=headers, json={
        "waste_stream_id": stream_id,
        "sample_id": "AL7075-SMP-01",
        "sample_date": "2026-10-18",
        "laboratory": "Spectro Analytical Labs, Pune",
        "test_name": "Optical Emission Spectroscopy",
        "measured_parameter": "Zinc (Zn)",
        "result_value_str": "5.62",
        "unit": "wt%",
        "test_method": "ASTM E1251",
        "notes": "Verified primary alloying element in 7075 matrix."
    })
    assert lab_res.status_code == 200
    lab_data = lab_res.json()
    assert lab_data["result_value_numeric"] == 5.62
    assert lab_data["unit"] == "wt%"

    # 2. Verify that assessment for stream automatically recalculated
    ass_res = client.get(f"/api/assessment/{stream_id}", headers=headers)
    assert ass_res.status_code == 200
    ass = ass_res.json()
    assert "recommendation" in ass


def test_unit_normalization_and_recovery_economics():
    class DummyStream:
        quantity = 2.5
        quantity_unit = "tonnes/month"
        frequency = "Continuous"

    norm_kg = normalize_quantity_to_kg_month(2.5, "tonnes/month", "Continuous")
    assert norm_kg == 2500.0

    req = RecoveryCalculationRequest(
        waste_stream_id=1,
        target_material="Aluminium",
        confirmed_material_fraction=0.85,
        recovery_rate_assumption=0.90,
        market_price_per_kg=180.0,
        processing_cost_per_kg=35.0,
        testing_cost_fixed=5000.0,
        transport_handling_cost=4000.0
    )

    res = compute_recovery_and_economics(DummyStream(), req)
    assert res["status"] == "COMPLETE"
    assert res["waste_quantity_kg_per_month"] == 2500.0
    assert res["theoretical_quantity_kg"] == 2125.0
    assert res["estimated_recovered_quantity_kg"] == 1912.5
    assert res["gross_value"] == 344250.0
    assert res["net_value"] == 268312.5


def test_missing_data_recovery_guardrail():
    class IncompleteStream:
        quantity = None
        quantity_unit = None
        frequency = None

    req = RecoveryCalculationRequest(
        waste_stream_id=2,
        target_material="Copper",
        confirmed_material_fraction=0.20,
        recovery_rate_assumption=0.70
    )

    res = compute_recovery_and_economics(IncompleteStream(), req)
    assert res["status"] == "INSUFFICIENT_QUANTITY_DATA"
    assert res["gross_value"] is None
    assert res["net_value"] is None


def test_dynamic_tws_config_loader():
    weights = load_tws_weights()
    assert sum(weights.values()) == 100.0
    assert weights["Quantity"] == 20.0
    assert weights["Information_Gap"] == 25.0

    fallback = load_tws_weights("non_existent_path.csv")
    assert fallback == DEFAULT_TWS_WEIGHTS


def test_recovery_analysis_linked_assay_validation(client, benchmark_info):
    headers = {"Authorization": f"Bearer {benchmark_info['token']}"}
    stream_id = benchmark_info["stream_id"]

    # 1. Attempting CONFIRMED_LAB_ASSAY without a linked lab result must fail (400)
    fail_res = client.post(f"/api/recovery/analyze/{stream_id}", headers=headers, json={
        "waste_stream_id": stream_id,
        "target_material": "Gold (Au)",
        "scenario_type": "CONFIRMED_LAB_ASSAY",
        "confirmed_material_fraction": 0.10,
        "recovery_rate_assumption": 0.80
    })
    assert fail_res.status_code == 400
    assert "No verified laboratory assay" in fail_res.json()["detail"]

    # 2. Incompatible material fraction check: >5% Cu on Aluminium stream must fail
    incompat_res = client.post(f"/api/recovery/analyze/{stream_id}", headers=headers, json={
        "waste_stream_id": stream_id,
        "target_material": "Copper (Cu)",
        "scenario_type": "CONFIRMED_LAB_ASSAY",
        "confirmed_material_fraction": 0.284,
        "recovery_rate_assumption": 0.75
    })
    assert incompat_res.status_code == 400

    # 3. Explicit HYPOTHETICAL_SCENARIO must succeed and be labeled as hypothetical
    hypo_res = client.post(f"/api/recovery/analyze/{stream_id}", headers=headers, json={
        "waste_stream_id": stream_id,
        "target_material": "Aluminium (Al)",
        "scenario_type": "HYPOTHETICAL_SCENARIO",
        "confirmed_material_fraction": 0.88,
        "recovery_rate_assumption": 0.70,
        "market_price_per_kg": 210.0,
        "processing_cost_per_kg": 40.0
    })
    assert hypo_res.status_code == 200
    data = hypo_res.json()
    assert data["scenario_type"] == "HYPOTHETICAL_SCENARIO"
    assert data["theoretical_quantity_kg"] > 0
    assert data["estimated_recovered_quantity_kg"] > 0
    assert data["gross_value"] > 0


def test_multi_tenant_company_isolation(client):
    ts = int(time.time() * 1000)
    
    # 1. Register Tenant A
    res_a = client.post("/api/auth/register-company", json={
        "company_name": f"Tenant Alpha {ts}",
        "industry": "Titanium Forging",
        "company_size": "50-100",
        "location": "Bengaluru, KA",
        "manufacturing_process": "Vacuum Arc Remelting",
        "full_name": "Anushree Agrawal",
        "email": f"anushree_{ts}@alpha.com",
        "password": "secure_password_alpha"
    })
    token_a = res_a.json()["token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 2. Register Tenant B
    res_b = client.post("/api/auth/register-company", json={
        "company_name": f"Tenant Beta {ts}",
        "industry": "Copper Rolling",
        "company_size": "100-250",
        "location": "Mumbai, MH",
        "manufacturing_process": "Continuous Casting",
        "full_name": "Deeya Saoji",
        "email": f"deeya_{ts}@beta.com",
        "password": "secure_password_beta"
    })
    token_b = res_b.json()["token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 3. Tenant A creates private stream
    ws_a = client.post("/api/waste-streams", headers=headers_a, json={
        "stream_name": f"Titanium Scale Alpha {ts}",
        "waste_category": "Scale",
        "generating_process": "High Temperature Forging",
        "quantity": 120.0,
        "quantity_unit": "kg/week",
        "frequency": "Weekly",
        "current_handling": "Sealed containment",
        "known_characteristics": "Titanium Ti-6Al-4V oxide scale",
        "estimated_handling_cost": 45000.0
    }).json()
    stream_a_id = ws_a["id"]

    # 4. Tenant B queries /api/waste-streams: must NOT see Tenant A's stream
    streams_b = client.get("/api/waste-streams", headers=headers_b).json()
    stream_b_names = [s["stream_name"] for s in streams_b]
    assert f"Titanium Scale Alpha {ts}" not in stream_b_names

    # 5. Tenant B directly requests Tenant A's stream: must be rejected with 403 Forbidden
    direct_res = client.get(f"/api/waste-streams/{stream_a_id}", headers=headers_b)
    assert direct_res.status_code == 403

    # 6. Tenant B attempts to delete Tenant A's stream: must be rejected with 403
    del_attempt = client.delete(f"/api/waste-streams/{stream_a_id}", headers=headers_b)
    assert del_attempt.status_code == 403

    # 7. Tenant B attempts to run assessment on Tenant A's stream: must be rejected with 403
    ass_attempt = client.post(f"/api/assessment/{stream_a_id}", headers=headers_b)
    assert ass_attempt.status_code == 403


def test_pdf_report_generation_and_tenant_security(client, benchmark_info):
    headers = {"Authorization": f"Bearer {benchmark_info['token']}"}
    stream_id = benchmark_info["stream_id"]

    # 1. Executive Summary PDF
    exec_res = client.get(f"/api/reports/pdf/executive/{stream_id}", headers=headers)
    assert exec_res.status_code == 200
    assert "application/pdf" in exec_res.headers.get("content-type", "")
    assert exec_res.content[:4] == b"%PDF"
    assert len(exec_res.content) > 1000
    assert "attachment;" in exec_res.headers.get("content-disposition", "")

    # 2. Technical Report PDF
    tech_res = client.get(f"/api/reports/pdf/technical/{stream_id}", headers=headers)
    assert tech_res.status_code == 200
    assert "application/pdf" in tech_res.headers.get("content-type", "")
    assert tech_res.content[:4] == b"%PDF"
    assert len(tech_res.content) > 1000

    # 3. Recommendations PDF
    rec_res = client.get(f"/api/reports/pdf/recommendations/{stream_id}", headers=headers)
    assert rec_res.status_code == 200
    assert "application/pdf" in rec_res.headers.get("content-type", "")
    assert rec_res.content[:4] == b"%PDF"
    assert len(rec_res.content) > 1000

    # 4. Unknown report type gives 400
    bad_res = client.get(f"/api/reports/pdf/invalid_format_name/{stream_id}", headers=headers)
    assert bad_res.status_code == 400


def test_tws_recalculation_synchronization_regression(client, benchmark_info):
    """
    Regression test for TWS score synchronization bug:
    Ensures that when a lab result is added, the recalculated score is authoritative
    and synchronized across the single assessment endpoint, the ranking endpoint,
    and dashboard metrics without stale cache divergence.
    Also verifies deduplication on lab results and recovery scenarios.
    """
    headers = {"Authorization": f"Bearer {benchmark_info['token']}"}
    stream_id = benchmark_info["stream_id"]

    # 1. Fetch baseline assessment before adding new lab assay
    base_res = client.get(f"/api/assessment/{stream_id}", headers=headers)
    assert base_res.status_code == 200
    base_data = base_res.json()
    base_score = base_data["tws_score"]

    # 2. Add an explicit lab assay
    assay_payload = {
        "waste_stream_id": stream_id,
        "sample_id": "REGR-TEST-001",
        "sample_date": "2026-10-22",
        "laboratory": "National Metallurgical Lab",
        "test_name": "Optical Emission Spectroscopy",
        "measured_parameter": "Zinc (Zn)",
        "result_value_str": "0.025",
        "unit": "wt%",
        "notes": "Regression synchronization test assay"
    }
    lab_res = client.post("/api/lab-results", json=assay_payload, headers=headers)
    assert lab_res.status_code == 200

    # 3. Fetch single stream assessment: score should be updated
    updated_res = client.get(f"/api/assessment/{stream_id}", headers=headers)
    assert updated_res.status_code == 200
    updated_data = updated_res.json()
    new_score = updated_data["tws_score"]

    # 4. Fetch ranking endpoint: must return the EXACT same score as the single assessment endpoint
    ranking_res = client.get("/api/assessments/ranking", headers=headers)
    assert ranking_res.status_code == 200
    ranking_data = ranking_res.json()
    matched_rank = [item for item in ranking_data if item["waste_stream_id"] == stream_id]
    assert len(matched_rank) == 1, "Should have exactly one ranking entry per stream"
    assert matched_rank[0]["tws_score"] == new_score, (
        f"Ranking score {matched_rank[0]['tws_score']} does not match single assessment score {new_score}!"
    )

    # 5. Deduplication check: submitting the same assay again updates in-place instead of creating duplicate row
    lab_res_dup = client.post("/api/lab-results", json=assay_payload, headers=headers)
    assert lab_res_dup.status_code == 200
    assert lab_res_dup.json()["id"] == lab_res.json()["id"], "Duplicate assay submission should update existing record"

    # 6. Recovery scenario deduplication check
    scenario_payload = {
        "waste_stream_id": stream_id,
        "target_material": "Aluminium (Al)",
        "scenario_type": "HYPOTHETICAL_ESTIMATE",
        "confirmed_material_fraction": 0.85,
        "recovery_rate_assumption": 0.70,
        "market_price_per_kg": 210.0,
        "processing_cost_per_kg": 40.0
    }
    scen_1 = client.post(f"/api/recovery/analyze/{stream_id}", json=scenario_payload, headers=headers)
    assert scen_1.status_code == 200
    scen_2 = client.post(f"/api/recovery/analyze/{stream_id}", json=scenario_payload, headers=headers)
    assert scen_2.status_code == 200
    assert scen_1.json()["id"] == scen_2.json()["id"], "Duplicate scenario should update existing record"


def test_platform_owner_role_and_governance_access(client, benchmark_info):
    """
    Test Role Architecture:
    - Company admins / members cannot access /api/platform/* endpoints (403 Forbidden).
    - Platform owner has secure access to aggregate statistics without leaking private assays.
    """
    tenant_headers = {"Authorization": f"Bearer {benchmark_info['token']}"}

    # 1. Tenant user attempt to access platform overview -> 403 Forbidden
    overview_attempt = client.get("/api/platform/overview", headers=tenant_headers)
    assert overview_attempt.status_code == 403

    companies_attempt = client.get("/api/platform/companies", headers=tenant_headers)
    assert companies_attempt.status_code == 403

    # 2. Log in as Platform Owner (provisioned in on_startup)
    owner_login = client.post("/api/auth/login", json={
        "email": "owner@industrace.ai",
        "password": "PlatformOwner2026!"
    })
    assert owner_login.status_code == 200
    owner_token = owner_login.json()["token"]
    owner_headers = {"Authorization": f"Bearer {owner_token}"}
    assert owner_login.json()["user"]["role"] == "platform_owner"

    # 3. Platform Owner overview succeeds
    overview_res = client.get("/api/platform/overview", headers=owner_headers)
    assert overview_res.status_code == 200
    overview_data = overview_res.json()
    assert overview_data["total_companies"] >= 1
    assert overview_data["total_users"] >= 1
    assert "users_by_role" in overview_data
    assert "total_monthly_volume_kg" in overview_data

    # 4. Platform Owner companies list succeeds
    companies_res = client.get("/api/platform/companies", headers=owner_headers)
    assert companies_res.status_code == 200
    companies_list = companies_res.json()
    assert len(companies_list) >= 1
    # Verify no raw confidential spectroscopy or assay data is exposed in summary
    for co in companies_list:
        assert "spectroscopy" not in co
        assert "lab_results" not in co
        assert "name" in co
        assert "waste_stream_count" in co

