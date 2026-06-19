import Link from "next/link";
import { DataTable, PageHeader, Section, StatCard } from "@zig/ui";
import { evidenceTemplates, labs, risks, vendors } from "@/app/lib/mvp-data";

export default function DemoPage() {
  return (
    <>
      <PageHeader eyebrow="Demo Mode" title="Demo Organization" description="Immediate product demonstration with demo risks, vendors, evidence, and labs." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Demo Risks" value={risks.length} detail="Risk register populated." />
        <StatCard label="Demo Vendors" value={vendors.length} detail="Vendor inventory populated." />
        <StatCard label="Demo Evidence" value={evidenceTemplates.length} detail="Evidence templates ready." />
        <StatCard label="Demo Labs" value={labs.length} detail="Practice labs ready." />
      </div>
      <Section title="Demo Launch Points">
        <DataTable
          columns={["Area", "Route"]}
          empty="No demo routes."
          rows={[
            ["Learning", <Link key="learning" href="/learning" className="underline underline-offset-4">/learning</Link>],
            ["Practice Labs", <Link key="labs" href="/labs" className="underline underline-offset-4">/labs</Link>],
            ["Risk Register", <Link key="risk" href="/risk" className="underline underline-offset-4">/risk</Link>],
            ["Vendors", <Link key="vendors" href="/vendors" className="underline underline-offset-4">/vendors</Link>],
            ["Portfolio", <Link key="portfolio" href="/portfolio" className="underline underline-offset-4">/portfolio</Link>],
          ]}
        />
      </Section>
    </>
  );
}
