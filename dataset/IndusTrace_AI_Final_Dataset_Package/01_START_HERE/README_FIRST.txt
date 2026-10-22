INDUSTRACE AI — FINAL DATASET PACKAGE
Version: 1.0 | Prepared: 13 October 2026

READ THIS FIRST
This ZIP is an organized data package for the IndusTrace AI prototype. It is not a trained AI model and it is not a complete application. It deliberately separates public raw data, processed data, research-derived rules, templates, synthetic examples, and design assumptions.

FOLDER GUIDE
01_START_HERE/
  DATA_PROVENANCE_REGISTER.csv — what each file is, its source, whether it is real or synthetic, and its limitations.

02_PUBLIC_RAW_DATA/
  PlantC_scrap_C_RAW.csv — public scrap-arrival/logistics dataset from Zenodo record 17633305.
  CAESAR_original_characterization_workbook.xlsx — original public experimental characterization workbook from Zenodo record 15737122.

03_PROCESSED_PUBLIC_DATA/
  PlantC summaries — derived aggregations of public arrival records.
  CAESAR long-format chemistry CSVs and sample summary — reshaped from the original experimental workbook.

04_RESEARCH_INTELLIGENCE/
  WIR_Starter.csv — small initial repository of research-derived investigation rules. It is NOT measured company data.
  Research_Source_Library.csv — sources and notes/caveats. Some records still require bibliographic/full-text verification.

05_INPUT_AND_LAB_TEMPLATES/
  Company_Input_Schema.csv — proposed fields for company data entry; schema only.
  Laboratory_Result_Template.csv — structure for future lab measurements; template only, not results.

06_SYNTHETIC_DEMO_DATA/
  Company_Demo_Cases.csv — fictional examples to test the software. They are not real factory records.

07_SCHEMA_AND_WORKBOOK/
  TWS_Prototype_Config.csv — proposed scoring weights; design assumptions, not scientifically validated.
  starter_schema.sql — initial database schema.
  IndusTrace_AI_Main_Dataset_Workbook.xlsx — workbook view of selected data and audit material.

TRUSTED PUBLIC SOURCES
1) Plant C scrap dataset: https://zenodo.org/records/17633305
   Its official description identifies Weight in kg and Soil/Water/Other contamination amounts in kg. It is arrival/logistics data, not chemical composition or recovery outcomes.
2) CAESAR scrap characterization dataset: https://zenodo.org/records/15737122
   Experimental data for selected ferrous scrap samples and recovered copper-rich/aluminium-rich fractions. It is not representative of all factories.

HOW THE PROJECT USES THE DATA
- Company enters waste-stream details in the application.
- WIR provides research-backed prompts about relevant characteristics, missing information, possible tests and routes.
- TWS ranks which stream to investigate first using explicitly stated prototype weights.
- Plant C data can demonstrate arrival/quantity/frequency analysis, subject to the meanings of code values.
- CAESAR data demonstrates how sample-specific lab chemistry can be stored and viewed.
- Synthetic company cases are used only to test the UI and API.
- Actual company-specific recovery calculations require relevant verified lab results, recovery assumptions and cost inputs. Do not infer exact composition from the Plant C dataset.

IMPORTANT LIMITATIONS
- Do not merge every file into one table. These datasets describe different things and have different units/granularity.
- Do not label synthetic cases as real.
- Do not label research rules as measured values.
- Do not treat CAESAR samples as company-specific laboratory results.
- Do not assume scrap-type codes have meanings unless a codebook confirms them.
- The TWS weights are prototype assumptions and must be disclosed as such.
- Any numeric recovery estimate must state its input source and assumptions.

RECOMMENDED MVP FILES TO LOAD FIRST
1) WIR_Starter.csv
2) Company_Input_Schema.csv (schema only)
3) TWS_Prototype_Config.csv
4) Company_Demo_Cases.csv (testing only)
5) PlantC_scrap_C_RAW.csv (for separate arrival analytics, not chemistry)
6) CAESAR chemistry CSVs (for sample-specific lab-data demonstration)

Do not load all files into a single database table. Keep raw source files unchanged and store derived summaries separately.
