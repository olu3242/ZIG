import { fromSnakeRecord, toSnakeRecord } from "../SupabaseRestAdapter";

const snake = toSnakeRecord({
  tenantId: "tenant_1",
  actorUserId: "user_1",
  createdAt: new Date("2026-06-18T00:00:00.000Z"),
});

if (snake.tenant_id !== "tenant_1" || snake.actor_user_id !== "user_1") {
  throw new Error("Supabase adapter did not convert camelCase to snake_case.");
}

const camel = fromSnakeRecord({
  tenant_id: "tenant_1",
  actor_user_id: "user_1",
});

if (camel.tenantId !== "tenant_1" || camel.actorUserId !== "user_1") {
  throw new Error("Supabase adapter did not convert snake_case to camelCase.");
}
