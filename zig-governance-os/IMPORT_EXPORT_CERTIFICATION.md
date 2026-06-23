# Import / Export Certification

Date: 2026-06-18  
Status: PARTIAL

## Findings

Import/export package contracts and tables exist, but production upload/download runtime is incomplete.

Implemented:

- Import pipeline contract.
- Export pipeline contract.
- Import/export tables.
- UI route surfaces.

Missing:

- File upload route.
- Large-file handling.
- Download route.
- Audit package export runtime.
- Evidence/risk/report export runtime.
- Tenant-isolation negative tests for exports.

## Certification Decision

PARTIAL. Import/export is not production-certified.
