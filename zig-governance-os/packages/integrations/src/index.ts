export type IntegrationCategory = "identity" | "ticketing" | "communication" | "storage" | "source_control" | "cloud" | "security" | "compliance" | "billing";
export type IntegrationStatus = "not_connected" | "connected" | "degraded" | "failed";

export interface IntegrationProvider {
  key: string;
  name: string;
  category: IntegrationCategory;
  supportsOAuth: boolean;
  supportsWebhooks: boolean;
}

export interface IntegrationHealth {
  providerKey: string;
  status: IntegrationStatus;
  lastSyncAt?: Date;
  failedSyncs: number;
  webhookHealth: "healthy" | "degraded" | "offline";
  rateLimitRemaining?: number;
  credentialExpiresAt?: Date;
  errors: string[];
}

export const integrationProviders: IntegrationProvider[] = [
  provider("microsoft_entra_id", "Microsoft Entra ID", "identity", true, true),
  provider("google_workspace", "Google Workspace", "identity", true, true),
  provider("okta", "Okta", "identity", true, true),
  provider("auth0", "Auth0", "identity", true, true),
  provider("jira", "Jira", "ticketing", true, true),
  provider("servicenow", "ServiceNow", "ticketing", true, true),
  provider("linear", "Linear", "ticketing", true, true),
  provider("monday", "Monday.com", "ticketing", true, true),
  provider("slack", "Slack", "communication", true, true),
  provider("microsoft_teams", "Microsoft Teams", "communication", true, true),
  provider("resend", "Resend", "communication", false, true),
  provider("sendgrid", "SendGrid", "communication", false, true),
  provider("twilio", "Twilio", "communication", false, true),
  provider("google_drive", "Google Drive", "storage", true, true),
  provider("onedrive", "OneDrive", "storage", true, true),
  provider("dropbox", "Dropbox", "storage", true, true),
  provider("box", "Box", "storage", true, true),
  provider("sharepoint", "SharePoint", "storage", true, true),
  provider("github", "GitHub", "source_control", true, true),
  provider("gitlab", "GitLab", "source_control", true, true),
  provider("bitbucket", "Bitbucket", "source_control", true, true),
  provider("azure_devops", "Azure DevOps", "source_control", true, true),
  provider("aws", "AWS", "cloud", false, true),
  provider("azure", "Azure", "cloud", true, true),
  provider("google_cloud", "Google Cloud", "cloud", true, true),
  provider("cloudflare", "Cloudflare", "cloud", true, true),
  provider("microsoft_defender", "Microsoft Defender", "security", true, true),
  provider("crowdstrike", "CrowdStrike", "security", true, true),
  provider("sentinelone", "SentinelOne", "security", true, true),
  provider("wiz", "Wiz", "security", true, true),
  provider("tenable", "Tenable", "security", true, true),
  provider("rapid7", "Rapid7", "security", true, true),
  provider("drata", "Drata", "compliance", true, true),
  provider("vanta", "Vanta", "compliance", true, true),
  provider("secureframe", "Secureframe", "compliance", true, true),
  provider("stripe", "Stripe", "billing", true, true),
];

export class IntegrationRegistry {
  list(): IntegrationProvider[] {
    return integrationProviders;
  }

  byCategory(category: IntegrationCategory): IntegrationProvider[] {
    return integrationProviders.filter((item) => item.category === category);
  }
}

function provider(key: string, name: string, category: IntegrationCategory, supportsOAuth: boolean, supportsWebhooks: boolean): IntegrationProvider {
  return { key, name, category, supportsOAuth, supportsWebhooks };
}
