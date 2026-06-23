type ExpectedAuthRoute = {
  name: string;
  path: string;
  expected: "public" | "protected" | "repair";
};

export const authE2ESpec: ExpectedAuthRoute[] = [
  { name: "signup", path: "/signup", expected: "public" },
  { name: "login", path: "/login", expected: "public" },
  { name: "password reset", path: "/forgot-password", expected: "public" },
  { name: "dashboard", path: "/dashboard", expected: "protected" },
  { name: "profile repair", path: "/onboarding/profile", expected: "repair" },
  { name: "organization repair", path: "/onboarding/organization", expected: "repair" },
  { name: "access repair", path: "/onboarding/access", expected: "repair" },
  { name: "learning", path: "/learning", expected: "protected" },
  { name: "frameworks", path: "/frameworks", expected: "protected" },
  { name: "labs", path: "/labs", expected: "protected" },
  { name: "portfolio", path: "/portfolio", expected: "protected" },
  { name: "certifications", path: "/certifications", expected: "protected" },
];

export function expectedAuthJourney() {
  return [
    "Signup",
    "Email Verification",
    "Login",
    "Session",
    "Dashboard",
    "Logout",
    "Password Reset",
  ];
}
