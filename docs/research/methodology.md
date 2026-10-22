# Research Evidence & Scientific Methodology — IndusTrace AI

## 1. Scientific Guardrails & Boundaries

IndusTrace AI strictly enforces the separation of empirical facts, user records, and research literature:

1. **No Hallucination of Composition:** An AI model cannot determine exact chemical concentrations from stream descriptions alone. Compositional analysis requires laboratory testing (e.g., ICP-OES, XRF, OES).
2. **Process Matching as Indicator Only:** Alignment with WIR rules indicates potential characteristics and recommended tests, never proof of actual composition.
3. **Preservation of Analytical Qualifiers:** Qualifiers such as `<0.030`, `ND`, `N.T.`, and `bal.` are preserved as strings and never blindly converted into numeric zeroes or floats.
4. **Source Separation:** Public reference datasets (Plant C Zenodo 17633305, CAESAR Zenodo 15737122) are kept strictly separate from company operational records.

## 2. Test Worthiness Score (TWS) Formulation

The initial prototype TWS is an explainable, 0–100 weighted index evaluating testing urgency under incomplete information:

| Factor | Weight | Normalization Strategy |
|---|---|---|
| **Quantity** | 20% | Normalized by volume (e.g., >500 kg/mo $\rightarrow$ 95, 100-500 kg $\rightarrow$ 75, <25 kg $\rightarrow$ 25). Unknown volumes flagged. |
| **Generation Frequency** | 15% | Continuous/Daily (90), Weekly (70), Batch/Episodic (50), Sporadic (35). |
| **Information Gap** | 25% | Testing urgency increases with critical uncertainty ($>4$ missing gaps $\rightarrow$ 95; lab results present $\rightarrow$ 35). |
| **Recovery Potential** | 20% | High-value non-ferrous matrix (90), ferrous/industrial candidates (70), effluent (50). |
| **Evidence Confidence** | 10% | Corroborated by high-confidence literature (85), moderate peer-reviewed literature (65), unlisted (30). |
| **Economic Relevance** | 10% | Handling/disposal fees documented (85), scrap monetization (65), unrecorded (40). |

## 3. Mass Balance and Recovery Calculations

- **Theoretical Material Quantity:** $Q_{theoretical} = Q_{waste} \times f_{confirmed}$
- **Estimated Recovered Quantity:** $Q_{recovered} = Q_{theoretical} \times \eta_{assumed}$
- **Estimated Net Value:** $V_{net} = (Q_{recovered} \times P_{market}) - (C_{proc} + C_{test} + C_{trans} + C_{other})$

All assumptions are explicitly flagged as user scenario parameters.
