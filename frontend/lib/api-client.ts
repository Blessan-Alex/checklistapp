import type { Case } from "@/lib/types";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type JsonBody = Record<string, unknown> | unknown[];

async function parseJsonSafe(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text) as JsonBody;
  } catch {
    return text;
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    ...init,
    headers: {
      ...(init?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
  });

  const body = await parseJsonSafe(response);

  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof (body as { error: unknown }).error === "string"
        ? (body as { error: string }).error
        : response.statusText || "Request failed";
    throw new ApiError(message, response.status, body);
  }

  return body as T;
}

export const api = {
  login(password: string) {
    return apiFetch<{ ok: true }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
  },

  logout() {
    return apiFetch<{ ok: true }>("/api/auth/logout", {
      method: "POST",
    });
  },

  listCases() {
    return apiFetch<{ cases: Case[] }>("/api/cases");
  },

  getCase(id: string) {
    return apiFetch<{ case: Case }>(`/api/cases/${id}`);
  },

  createCase(file: File) {
    const form = new FormData();
    form.append("file", file);
    return apiFetch<{ case: Case }>("/api/cases", {
      method: "POST",
      body: form,
    });
  },

  patchCase(id: string, patch: Partial<Case>) {
    return apiFetch<{ case: Case }>(`/api/cases/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },

  publishCase(id: string) {
    return apiFetch<{ case: Case; clientUrl: string }>(
      `/api/cases/${id}/publish`,
      { method: "POST" },
    );
  },

  rejectSlotUpload(caseId: string, slotId: string, message: string) {
    return apiFetch<{ case: Case }>(
      `/api/cases/${caseId}/slots/${slotId}/reject`,
      {
        method: "POST",
        body: JSON.stringify({ message }),
      },
    );
  },

  approveSlotUpload(caseId: string, slotId: string) {
    return apiFetch<{ case: Case }>(
      `/api/cases/${caseId}/slots/${slotId}/approve`,
      { method: "POST" },
    );
  },

  completeStaffReview(caseId: string) {
    return apiFetch<{ case: Case }>(`/api/cases/${caseId}/complete-review`, {
      method: "POST",
    });
  },

  staffSlotFileUrl(caseId: string, slotId: string): string {
    return `/api/cases/${caseId}/slots/${slotId}/file`;
  },

  staffChecklistFileUrl(caseId: string): string {
    return `/api/cases/${caseId}/checklist-file`;
  },

  clientSlotFileUrl(token: string, slotId: string): string {
    return `/api/client/${token}/slots/${slotId}/file`;
  },

  reopenCase(caseId: string, note: string) {
    return apiFetch<{ case: Case }>(`/api/cases/${caseId}/reopen`, {
      method: "POST",
      body: JSON.stringify({ note }),
    });
  },

  getClientCase(token: string) {
    return apiFetch<{ case: Case }>(`/api/client/${token}`);
  },

  uploadClientSlot(token: string, slotId: string, file: File) {
    const form = new FormData();
    form.append("file", file);
    return apiFetch<{ case: Case }>(
      `/api/client/${token}/slots/${slotId}/upload`,
      { method: "POST", body: form },
    );
  },

  uploadClientSlotWithProgress(
    token: string,
    caseId: string,
    slotId: string,
    file: File,
    onProgress: (percent: number) => void,
    signal?: AbortSignal,
  ): Promise<{ case: Case }> {
    return import("@/lib/client-slot-upload").then(({ uploadClientSlotFile }) =>
      uploadClientSlotFile({
        token,
        caseId,
        slotId,
        file,
        onProgress,
        signal,
      }),
    );
  },

  submitClientCase(token: string) {
    return apiFetch<{ case: Case }>(`/api/client/${token}/submit`, {
      method: "POST",
    });
  },

  async downloadCaseZip(caseId: string): Promise<Blob> {
    const response = await fetch(`/api/cases/${caseId}/zip`, {
      credentials: "include",
    });
    if (!response.ok) {
      const body = await parseJsonSafe(response);
      const message =
        typeof body === "object" &&
        body !== null &&
        "error" in body &&
        typeof (body as { error: unknown }).error === "string"
          ? (body as { error: string }).error
          : response.statusText;
      throw new ApiError(message, response.status, body);
    }
    return response.blob();
  },
};

export const queryKeys = {
  cases: ["cases"] as const,
  case: (id: string) => ["cases", id] as const,
  clientCase: (token: string) => ["client", token] as const,
};
