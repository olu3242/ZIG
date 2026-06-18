export type KnowledgeNode = "organizations" | "frameworks" | "controls" | "policies" | "risks" | "audits" | "evidence" | "vendors" | "regulations" | "certifications";
export type KnowledgeRelationship = "maps_to" | "depends_on" | "mitigates" | "requires" | "tests" | "references" | "owns" | "certifies";
export interface KnowledgeEdge {
  from: KnowledgeNode;
  relationship: KnowledgeRelationship;
  to: KnowledgeNode;
}
export class KnowledgeGraph {
  edge(from: KnowledgeNode, relationship: KnowledgeRelationship, to: KnowledgeNode): KnowledgeEdge {
    return { from, relationship, to };
  }
}
