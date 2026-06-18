export type SdkTarget = "typescript" | "python" | "java" | "csharp" | "go";
export interface DeveloperPortalCapability {
  apiKeys: true;
  oauth: true;
  openapi: true;
  swagger: true;
  postman: true;
  cli: true;
  sandbox: true;
  webhookManagement: true;
}
export class DeveloperPlatform {
  capabilities(): DeveloperPortalCapability {
    return { apiKeys: true, oauth: true, openapi: true, swagger: true, postman: true, cli: true, sandbox: true, webhookManagement: true };
  }
  sdkTargets(): SdkTarget[] {
    return ["typescript", "python", "java", "csharp", "go"];
  }
}
