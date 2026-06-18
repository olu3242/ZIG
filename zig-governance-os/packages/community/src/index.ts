export type CommunityFeature = "study_groups" | "peer_reviews" | "discussion_boards" | "challenges" | "leaderboards" | "career_communities";
export class CommunityPlatform {
  features(): CommunityFeature[] {
    return ["study_groups", "peer_reviews", "discussion_boards", "challenges", "leaderboards", "career_communities"];
  }
}
