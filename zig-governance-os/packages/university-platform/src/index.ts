export type UniversityUser = "students" | "faculty" | "instructors" | "administrators" | "career_services" | "employers";
export class UniversityPlatform {
  users(): UniversityUser[] {
    return ["students", "faculty", "instructors", "administrators", "career_services", "employers"];
  }
}
