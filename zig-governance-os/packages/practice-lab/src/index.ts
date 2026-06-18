export type SimulatedCompanyObject = "assets" | "risks" | "controls" | "evidence" | "audits" | "incidents" | "vendors" | "regulators" | "board" | "employees";
export interface SimulatedCompany {
  name: string;
  industry: string;
  objects: SimulatedCompanyObject[];
  maturity: number;
}
export class PracticeLabEngine {
  createCompany(name: string, industry: string): SimulatedCompany {
    return { name, industry, maturity: 55, objects: ["assets", "risks", "controls", "evidence", "audits", "incidents", "vendors", "regulators", "board", "employees"] };
  }
  readiness(company: SimulatedCompany): number {
    return Math.round((company.maturity + company.objects.length * 5) / 1.05);
  }
}
