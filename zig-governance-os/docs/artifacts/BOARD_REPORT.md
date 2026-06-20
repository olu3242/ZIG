# Artifact: Board Report

## Purpose
Translates governance score, risk posture, and roadmap into business language for an
executive audience — the artifact that closes the loop from "governance work done" to
"governance work communicated and funded."

## Backing Data
`GovernanceService` (`packages/services/src/GovernanceService.ts`, extends
`BaseService<GovernanceScoreRecord>`) and `GovernanceService.findRecommendations` /
`GovernanceScore` (fields: `controlsImplemented`, `evidenceCoverage`, `riskTreatment`,
`assessmentCompletion`, `explanation`) — real, exist on `main`.

## Structure
- Executive summary
- Score trend and decomposition in business language
- Top risks (translated, not raw risk-register language)
- Recommendations and roadmap (12-month, dependency-sequenced)
- The ask (budget, headcount, executive sponsorship)

## Track
Executive Leadership

## Lesson
`docs/learning/lessons/executive_leadership/01_*` through
`05_EXECUTIVE_COMMUNICATION_DELIVERY.md`

## Lab
`docs/learning/labs/EXECUTIVE_LEADERSHIP_LAB_BOARD_READY_REPORT.md`

## Skill
Translating a governance score into board-appropriate language without becoming alarmist
or dismissive.

## Career Outcome
Can deliver a board-ready governance report and defend it under live Q&A.
