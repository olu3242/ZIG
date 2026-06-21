import { getSupabaseConfig } from "./supabase";

export interface LifecycleFramework {
  frameworkId: string;
  code: string;
  name: string;
  version: string;
  description: string;
}

export interface LifecycleProject {
  projectId: string;
  organizationId: string;
  name: string;
  industry: string;
  frameworkFocus: string;
  frameworkName?: string;
  description: string;
  status: string;
  healthScore: number;
  createdAt: string;
}

export interface LifecycleAsset {
  assetId: string;
  projectId: string;
  name: string;
  assetType: string;
  ownerUserId?: string;
  classification: string;
  criticality: string;
  description: string;
  aiClassification: string;
  status: string;
}

export interface LifecycleControl {
  controlId: string;
  projectId: string;
  name: string;
  description: string;
  ownerUserId?: string;
  status: string;
  effectiveness: number;
}

export interface LifecycleAssetControlMapping {
  mappingId: string;
  projectId: string;
  assetId: string;
  controlId: string;
  relationshipType: string;
  createdAt: string;
}

export interface LifecycleActivity {
  activityId: string;
  projectId?: string;
  lifecycleStage: string;
  action: string;
  entityType: string;
  createdAt: string;
}

interface RestProjectRow {
  project_id: string;
  organization_id: string;
  name: string;
  industry: string;
  framework_focus: string;
  description: string;
  status: string;
  health_score: number;
  created_at: string;
}

interface RestFrameworkRow {
  framework_id: string;
  code: string;
  name: string;
  version: string;
  description: string;
}

interface RestAssetRow {
  asset_id: string;
  project_id: string;
  name: string;
  asset_type: string;
  owner_user_id?: string;
  classification: string;
  criticality: string;
  description: string;
  ai_classification: string;
  status: string;
}

interface RestControlRow {
  control_id: string;
  project_id: string;
  name: string;
  description: string;
  owner_user_id?: string;
  status: string;
  effectiveness: number;
}

interface RestAssetControlMappingRow {
  mapping_id: string;
  project_id: string;
  asset_id: string;
  control_id: string;
  relationship_type: string;
  created_at: string;
}

interface RestActivityRow {
  activity_id: string;
  project_id?: string;
  lifecycle_stage: string;
  action: string;
  entity_type: string;
  created_at: string;
}

export async function listLifecycleFrameworks(): Promise<LifecycleFramework[]> {
  const rows = await restGet<RestFrameworkRow>("frameworks", {
    select: "framework_id,code,name,version,description",
    status: "eq.active",
    order: "name.asc",
  });
  return rows.map((row) => ({
    frameworkId: row.framework_id,
    code: row.code,
    name: row.name,
    version: row.version,
    description: row.description,
  }));
}

export async function listLifecycleProjects(organizationId: string): Promise<LifecycleProject[]> {
  const [projects, frameworks] = await Promise.all([
    restGet<RestProjectRow>("projects", {
      select: "project_id,organization_id,name,industry,framework_focus,description,status,health_score,created_at",
      organization_id: `eq.${organizationId}`,
      order: "created_at.desc",
    }),
    listLifecycleFrameworks(),
  ]);
  const frameworkNames = new Map(frameworks.map((framework) => [framework.frameworkId, framework.name]));
  return projects.map((row) => projectFromRow(row, frameworkNames.get(row.framework_focus)));
}

export async function getLifecycleProject(organizationId: string, projectId: string) {
  const [project] = await restGet<RestProjectRow>("projects", {
    select: "project_id,organization_id,name,industry,framework_focus,description,status,health_score,created_at",
    organization_id: `eq.${organizationId}`,
    project_id: `eq.${projectId}`,
    limit: "1",
  });
  if (!project) {
    return null;
  }
  const [assets, controls, mappings, activities, frameworks] = await Promise.all([
    listLifecycleAssets(organizationId, project.project_id),
    listLifecycleControls(organizationId, project.project_id),
    listLifecycleAssetControlMappings(organizationId, project.project_id),
    listLifecycleActivities(organizationId, project.project_id),
    listLifecycleFrameworks(),
  ]);
  const framework = frameworks.find((item) => item.frameworkId === project.framework_focus);
  return {
    project: projectFromRow(project, framework?.name),
    assets,
    controls,
    mappings,
    activities,
  };
}

export async function listLifecycleAssets(organizationId: string, projectId?: string): Promise<LifecycleAsset[]> {
  const params: Record<string, string> = {
    select: "asset_id,project_id,name,asset_type,owner_user_id,classification,criticality,description,ai_classification,status",
    organization_id: `eq.${organizationId}`,
    order: "created_at.desc",
  };
  if (projectId) {
    params.project_id = `eq.${projectId}`;
  }
  const rows = await restGet<RestAssetRow>("assets", params);
  return rows.map((row) => ({
    assetId: row.asset_id,
    projectId: row.project_id,
    name: row.name,
    assetType: row.asset_type,
    ownerUserId: row.owner_user_id,
    classification: row.classification,
    criticality: row.criticality,
    description: row.description,
    aiClassification: row.ai_classification,
    status: row.status,
  }));
}

export async function listLifecycleControls(organizationId: string, projectId?: string): Promise<LifecycleControl[]> {
  const params: Record<string, string> = {
    select: "control_id,project_id,name,description,owner_user_id,status,effectiveness",
    organization_id: `eq.${organizationId}`,
    order: "created_at.desc",
  };
  if (projectId) {
    params.project_id = `eq.${projectId}`;
  }
  const rows = await restGet<RestControlRow>("controls", params);
  return rows.map((row) => ({
    controlId: row.control_id,
    projectId: row.project_id,
    name: row.name,
    description: row.description,
    ownerUserId: row.owner_user_id,
    status: row.status,
    effectiveness: row.effectiveness,
  }));
}

export async function listLifecycleAssetControlMappings(organizationId: string, projectId?: string): Promise<LifecycleAssetControlMapping[]> {
  const params: Record<string, string> = {
    select: "mapping_id,project_id,asset_id,control_id,relationship_type,created_at",
    organization_id: `eq.${organizationId}`,
    order: "created_at.desc",
  };
  if (projectId) {
    params.project_id = `eq.${projectId}`;
  }
  const rows = await restGet<RestAssetControlMappingRow>("asset_control_mappings", params);
  return rows.map((row) => ({
    mappingId: row.mapping_id,
    projectId: row.project_id,
    assetId: row.asset_id,
    controlId: row.control_id,
    relationshipType: row.relationship_type,
    createdAt: row.created_at,
  }));
}

export async function listLifecycleActivities(organizationId: string, projectId?: string): Promise<LifecycleActivity[]> {
  const params: Record<string, string> = {
    select: "activity_id,project_id,lifecycle_stage,action,entity_type,created_at",
    organization_id: `eq.${organizationId}`,
    order: "created_at.desc",
    limit: "10",
  };
  if (projectId) {
    params.project_id = `eq.${projectId}`;
  }
  const rows = await restGet<RestActivityRow>("activities", params);
  return rows.map((row) => ({
    activityId: row.activity_id,
    projectId: row.project_id,
    lifecycleStage: row.lifecycle_stage,
    action: row.action,
    entityType: row.entity_type,
    createdAt: row.created_at,
  }));
}

export async function createLifecycleProject(input: {
  organizationId: string;
  actorUserId: string;
  name: string;
  industry: string;
  frameworkFocus: string;
  description: string;
  status: string;
}) {
  const [project] = await restPost<RestProjectRow>("projects", {
    organization_id: input.organizationId,
    name: input.name,
    industry: input.industry,
    framework_focus: input.frameworkFocus,
    description: input.description,
    status: input.status,
    health_score: input.status === "active" ? 25 : 10,
  });
  await createLifecycleActivity({
    organizationId: input.organizationId,
    projectId: project.project_id,
    actorUserId: input.actorUserId,
    action: "CREATE_PROJECT",
    entityType: "project",
    entityId: project.project_id,
  });
  await refreshProjectCreateScore(project.project_id);
  return projectFromRow(project);
}

export async function createLifecycleAsset(input: {
  organizationId: string;
  projectId: string;
  actorUserId: string;
  name: string;
  assetType: string;
  classification: string;
  criticality: string;
  description: string;
}) {
  const [asset] = await restPost<RestAssetRow>("assets", {
    organization_id: input.organizationId,
    project_id: input.projectId,
    name: input.name,
    asset_type: input.assetType,
    owner_user_id: input.actorUserId,
    classification: input.classification,
    criticality: input.criticality,
    description: input.description,
    status: "active",
    ai_classification: classifyAsset(input.assetType, input.classification, input.criticality),
    framework_relevance: [input.classification, input.criticality],
  });
  await createLifecycleActivity({
    organizationId: input.organizationId,
    projectId: input.projectId,
    actorUserId: input.actorUserId,
    action: "CREATE_ASSET",
    entityType: "asset",
    entityId: asset.asset_id,
  });
  await refreshProjectCreateScore(input.projectId);
  return asset;
}

export async function createLifecycleControl(input: {
  organizationId: string;
  projectId: string;
  actorUserId: string;
  name: string;
  description: string;
  status: string;
  effectiveness: number;
}) {
  const [control] = await restPost<RestControlRow>("controls", {
    organization_id: input.organizationId,
    project_id: input.projectId,
    name: input.name,
    description: input.description,
    owner_user_id: input.actorUserId,
    status: input.status,
    effectiveness: input.effectiveness,
    framework_mapping: [{ source: "CREATE", reason: "User-created operational control" }],
  });
  await createLifecycleActivity({
    organizationId: input.organizationId,
    projectId: input.projectId,
    actorUserId: input.actorUserId,
    action: "CREATE_CONTROL",
    entityType: "control",
    entityId: control.control_id,
  });
  await refreshProjectCreateScore(input.projectId);
  return control;
}

export async function linkLifecycleAssetControl(input: {
  organizationId: string;
  projectId: string;
  actorUserId: string;
  assetId: string;
  controlId: string;
  relationshipType: string;
}) {
  const [mapping] = await restPost<RestAssetControlMappingRow>("asset_control_mappings", {
    organization_id: input.organizationId,
    project_id: input.projectId,
    asset_id: input.assetId,
    control_id: input.controlId,
    relationship_type: input.relationshipType,
    created_by: input.actorUserId,
  }, "resolution=merge-duplicates,return=representation");
  await createLifecycleActivity({
    organizationId: input.organizationId,
    projectId: input.projectId,
    actorUserId: input.actorUserId,
    action: "LINK_CONTROL_TO_ASSET",
    entityType: "asset_control_mapping",
    entityId: mapping.mapping_id,
  });
  await refreshProjectCreateScore(input.projectId);
  return mapping;
}

export async function updateLifecycleProject(input: {
  organizationId: string;
  projectId: string;
  actorUserId: string;
  name: string;
  industry: string;
  description: string;
  status: string;
}) {
  await restPatch("projects", {
    name: input.name,
    industry: input.industry,
    description: input.description,
    status: input.status,
  }, {
    organization_id: `eq.${input.organizationId}`,
    project_id: `eq.${input.projectId}`,
  });
  await createLifecycleActivity({
    organizationId: input.organizationId,
    projectId: input.projectId,
    actorUserId: input.actorUserId,
    action: "UPDATE_PROJECT",
    entityType: "project",
    entityId: input.projectId,
  });
  await refreshProjectCreateScore(input.projectId);
}

export async function updateLifecycleAsset(input: {
  organizationId: string;
  projectId: string;
  actorUserId: string;
  assetId: string;
  name: string;
  assetType: string;
  classification: string;
  criticality: string;
  description: string;
  status: string;
}) {
  await restPatch("assets", {
    name: input.name,
    asset_type: input.assetType,
    classification: input.classification,
    criticality: input.criticality,
    description: input.description,
    status: input.status,
    ai_classification: classifyAsset(input.assetType, input.classification, input.criticality),
    framework_relevance: [input.classification, input.criticality],
  }, {
    organization_id: `eq.${input.organizationId}`,
    project_id: `eq.${input.projectId}`,
    asset_id: `eq.${input.assetId}`,
  });
  await createLifecycleActivity({
    organizationId: input.organizationId,
    projectId: input.projectId,
    actorUserId: input.actorUserId,
    action: "UPDATE_ASSET",
    entityType: "asset",
    entityId: input.assetId,
  });
  await refreshProjectCreateScore(input.projectId);
}

export async function updateLifecycleControl(input: {
  organizationId: string;
  projectId: string;
  actorUserId: string;
  controlId: string;
  name: string;
  description: string;
  status: string;
  effectiveness: number;
}) {
  await restPatch("controls", {
    name: input.name,
    description: input.description,
    status: input.status,
    effectiveness: input.effectiveness,
  }, {
    organization_id: `eq.${input.organizationId}`,
    project_id: `eq.${input.projectId}`,
    control_id: `eq.${input.controlId}`,
  });
  await createLifecycleActivity({
    organizationId: input.organizationId,
    projectId: input.projectId,
    actorUserId: input.actorUserId,
    action: "UPDATE_CONTROL",
    entityType: "control",
    entityId: input.controlId,
  });
  await refreshProjectCreateScore(input.projectId);
}

export async function archiveLifecycleProject(input: {
  organizationId: string;
  projectId: string;
  actorUserId: string;
}) {
  await restPatch("projects", { status: "archived" }, {
    organization_id: `eq.${input.organizationId}`,
    project_id: `eq.${input.projectId}`,
  });
  await createLifecycleActivity({
    organizationId: input.organizationId,
    projectId: input.projectId,
    actorUserId: input.actorUserId,
    action: "ARCHIVE_PROJECT",
    entityType: "project",
    entityId: input.projectId,
  });
  await refreshProjectCreateScore(input.projectId);
}

export async function archiveLifecycleAsset(input: {
  organizationId: string;
  projectId: string;
  actorUserId: string;
  assetId: string;
}) {
  await restPatch("assets", { status: "archived" }, {
    organization_id: `eq.${input.organizationId}`,
    project_id: `eq.${input.projectId}`,
    asset_id: `eq.${input.assetId}`,
  });
  await createLifecycleActivity({
    organizationId: input.organizationId,
    projectId: input.projectId,
    actorUserId: input.actorUserId,
    action: "ARCHIVE_ASSET",
    entityType: "asset",
    entityId: input.assetId,
  });
  await refreshProjectCreateScore(input.projectId);
}

export async function archiveLifecycleControl(input: {
  organizationId: string;
  projectId: string;
  actorUserId: string;
  controlId: string;
}) {
  await restPatch("controls", { status: "archived" }, {
    organization_id: `eq.${input.organizationId}`,
    project_id: `eq.${input.projectId}`,
    control_id: `eq.${input.controlId}`,
  });
  await createLifecycleActivity({
    organizationId: input.organizationId,
    projectId: input.projectId,
    actorUserId: input.actorUserId,
    action: "ARCHIVE_CONTROL",
    entityType: "control",
    entityId: input.controlId,
  });
  await refreshProjectCreateScore(input.projectId);
}

export async function loadCreateLifecycleMetrics(organizationId: string) {
  const [projects, assets, controls, mappings, activities] = await Promise.all([
    listLifecycleProjects(organizationId),
    listLifecycleAssets(organizationId),
    listLifecycleControls(organizationId),
    listLifecycleAssetControlMappings(organizationId),
    listLifecycleActivities(organizationId),
  ]);
  const activeProjects = projects.filter((project) => project.status !== "archived");
  const activeAssets = assets.filter((asset) => asset.status !== "archived");
  const activeControls = controls.filter((control) => control.status !== "archived");
  const score = calculateCreateGovernanceScore({
    projectCount: activeProjects.length,
    assetCount: activeAssets.length,
    controlCount: activeControls.length,
    relationshipCount: mappings.length,
  });

  return {
    projects,
    assets,
    controls,
    mappings,
    activities,
    activeProjects,
    activeAssets,
    activeControls,
    score,
  };
}

export function calculateCreateGovernanceScore(input: {
  projectCount: number;
  assetCount: number;
  controlCount: number;
  relationshipCount: number;
}) {
  return (input.projectCount > 0 ? 20 : 0)
    + (input.assetCount > 0 ? 30 : 0)
    + (input.controlCount > 0 ? 30 : 0)
    + (input.relationshipCount > 0 ? 20 : 0);
}

async function createLifecycleActivity(input: {
  organizationId: string;
  projectId: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
}) {
  await restPost("activities", {
    organization_id: input.organizationId,
    project_id: input.projectId,
    actor_user_id: input.actorUserId,
    lifecycle_stage: "CREATE",
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId,
  });
}

async function refreshProjectCreateScore(projectId: string) {
  await restRpc<number>("refresh_project_create_score", { target_project_id: projectId });
}

async function restGet<T>(table: string, params: Record<string, string>): Promise<T[]> {
  const config = getSupabaseConfig();
  const search = new URLSearchParams(params);
  const response = await fetch(`${config.url}/rest/v1/${table}?${search.toString()}`, {
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
    },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<T[]>;
}

async function restPost<T>(table: string, payload: Record<string, unknown>, prefer = "return=representation"): Promise<T[]> {
  const config = getSupabaseConfig();
  const response = await fetch(`${config.url}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: prefer,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<T[]>;
}

async function restPatch(table: string, payload: Record<string, unknown>, params: Record<string, string>): Promise<void> {
  const config = getSupabaseConfig();
  const search = new URLSearchParams(params);
  const response = await fetch(`${config.url}/rest/v1/${table}?${search.toString()}`, {
    method: "PATCH",
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
}

async function restRpc<T>(fn: string, payload: Record<string, unknown>): Promise<T> {
  const config = getSupabaseConfig();
  const response = await fetch(`${config.url}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<T>;
}

function projectFromRow(row: RestProjectRow, frameworkName?: string): LifecycleProject {
  return {
    projectId: row.project_id,
    organizationId: row.organization_id,
    name: row.name,
    industry: row.industry,
    frameworkFocus: row.framework_focus,
    frameworkName,
    description: row.description,
    status: row.status,
    healthScore: row.health_score,
    createdAt: row.created_at,
  };
}

function classifyAsset(assetType: string, classification: string, criticality: string): string {
  if (classification === "restricted" || criticality === "critical") {
    return `${assetType}: high governance relevance`;
  }
  if (criticality === "high") {
    return `${assetType}: control mapping recommended`;
  }
  return `${assetType}: baseline inventory coverage`;
}
