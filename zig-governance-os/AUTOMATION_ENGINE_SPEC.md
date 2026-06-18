# Automation Engine Spec

The automation layer provides no-code workflows made of triggers, conditions, actions, executions, logs, and queues.

Execution modes: immediate, scheduled, recurring, event-driven, and manual.

Tables: `automation_workflows`, `automation_executions`, `automation_execution_logs`, and `automation_queue_items`.

Observability:
- workflow health
- retry queue
- failure queue
- dead letter queue
- execution latency and outcome metrics

Every workflow execution must record tenant, workflow, trigger, actor, timestamp, outcome, and logs.
