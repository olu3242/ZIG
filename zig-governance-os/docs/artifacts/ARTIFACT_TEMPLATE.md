# Artifact Template (structure all artifact docs follow)

Every artifact template in `docs/artifacts/` defines a portfolio-ready deliverable a
learner produces while working through a track. None of these are new database tables —
each artifact is produced using data shaped by an existing entity (see "Backing Data"
below) and rendered/exported by the learner, consistent with "no orphan entities outside
the Universal Governance Model."

## Required sections

- **Purpose** — what real-world deliverable this mirrors and why a governance
  professional needs to be able to produce it.
- **Backing Data** — which real entity/service on `main` supplies the underlying data
  (e.g. `Risk`, `Control`, `ControlMapping`, `Asset`, `GovernanceScore`). If no backing
  service exists yet, this is stated explicitly rather than invented.
- **Structure** — the sections/fields the finished artifact must contain.
- **Track** — which learning track produces this artifact.
- **Lesson** — which lesson(s) introduce the concepts needed to produce it.
- **Lab** — which lab requires producing it as a deliverable.
- **Skill** — the named competency this artifact demonstrates.
- **Career Outcome** — the job-relevant capability this maps to (e.g. "can produce an
  audit-ready control matrix without supervision").

## What this wave does NOT do

- Does not create a new template-rendering service or export pipeline.
- Does not add new database tables — artifacts are views over existing entities.
- Each individual artifact template doc below states explicitly where its backing data
  is real today vs. a documented gap.
