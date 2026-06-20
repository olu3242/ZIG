import { DataTable, FormField, PageHeader, SelectField, Section, StatCard } from "@zig/ui";
import { sendCoachMessageAction, startCoachConversationAction } from "@/app/lib/actions";
import { loadCoach } from "@/app/lib/data";

export default async function AiCommandPage() {
  const { conversations, messagesByConversationId } = await loadCoach();
  const allMessages = conversations.flatMap((conversation) => messagesByConversationId.get(conversation.id) ?? []);
  const coachMessages = allMessages.filter((message) => message.role === "coach");
  const confidences = coachMessages.map((message) => message.confidence ?? 0).filter((value) => value > 0);
  const averageConfidence = confidences.length ? Math.round((confidences.reduce((sum, value) => sum + value, 0) / confidences.length) * 100) : 0;
  const frameworkReferenceCount = coachMessages.filter((message) => message.frameworkReference).length;

  return (
    <>
      <PageHeader
        eyebrow="AI Command Center"
        title="AI Governance Coach"
        description="Real conversations, grounded in your tenant's risk/control data, persisted to coach_conversations/coach_messages — every coach reply carries reasoning, supporting data, and a confidence level."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Coach Messages" value={coachMessages.length} detail="Real rows in coach_messages with role = coach." />
        <StatCard label="Average Confidence" value={`${averageConfidence}%`} detail="Mean of each reply's persisted confidence score." />
        <StatCard label="Framework References" value={frameworkReferenceCount} detail="Coach replies that cited a specific framework." />
      </div>

      <Section title="Start a Conversation">
        <form action={startCoachConversationAction} className="grid gap-4 md:grid-cols-2">
          <SelectField
            label="Context"
            name="contextType"
            options={[
              { label: "General", value: "general" },
              { label: "Learning Path", value: "learning_path" },
              { label: "Lesson", value: "lesson" },
              { label: "Assessment", value: "assessment" },
              { label: "Lab", value: "lab" },
            ]}
          />
          <div className="flex items-end">
            <button className="rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)]">Start Conversation</button>
          </div>
        </form>
      </Section>

      {conversations.map((conversation) => {
        const messages = messagesByConversationId.get(conversation.id) ?? [];
        return (
          <Section key={conversation.id} title={`Conversation — ${conversation.contextType}`}>
            <DataTable
              columns={["Role", "Message", "Reasoning", "Confidence", "Framework"]}
              empty="No messages yet."
              rows={messages.map((message) => [
                message.role,
                message.content,
                message.reasoning ?? "—",
                message.confidence !== undefined ? `${Math.round(message.confidence * 100)}%` : "—",
                message.frameworkReference ?? "—",
              ])}
            />
            <form action={sendCoachMessageAction} className="mt-3 grid gap-2 md:grid-cols-[1fr_auto]">
              <input type="hidden" name="conversationId" value={conversation.id} />
              <FormField label="Your message" name="content" required />
              <div className="flex items-end">
                <button className="rounded-md border border-[var(--zig-ink)] px-3 py-2 text-sm font-medium">Send</button>
              </div>
            </form>
          </Section>
        );
      })}
    </>
  );
}
