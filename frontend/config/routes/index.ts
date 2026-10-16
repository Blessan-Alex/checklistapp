/** Route path helpers — expanded in later prompts. */
export const ROUTES = {
  home: "/",
  staffLogin: "/staff/login",
  staffCases: "/staff/cases",
  staffCaseNew: "/staff/cases/new",
  staffCase: (id: string) => `/staff/cases/${id}`,
  staffCaseReview: (id: string) => `/staff/cases/${id}/review`,
  clientPortal: (token: string) => `/c/${token}`,
  clientSlot: (token: string, slotId: string) =>
    `/c/${token}/slot/${slotId}`,
  clientFinish: (token: string) => `/c/${token}/finish`,
  clientDone: (token: string) => `/c/${token}/done`,
} as const;
