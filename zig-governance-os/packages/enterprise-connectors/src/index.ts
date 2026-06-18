export type EnterpriseConnector =
  | "microsoft_graph" | "google_workspace" | "aws" | "azure" | "google_cloud" | "github" | "gitlab" | "jira"
  | "servicenow" | "slack" | "teams" | "cloudflare" | "crowdstrike" | "defender" | "okta" | "auth0";
export interface ConnectorSyncPlan {
  connector: EnterpriseConnector;
  signedRequests: true;
  webhookVerification: true;
  credentialVaultRequired: true;
  healthMonitoring: true;
}
export class EnterpriseConnectorPlatform {
  plan(connector: EnterpriseConnector): ConnectorSyncPlan {
    return { connector, signedRequests: true, webhookVerification: true, credentialVaultRequired: true, healthMonitoring: true };
  }
}
