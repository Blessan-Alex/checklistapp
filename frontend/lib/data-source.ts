/** When true, staff/client use localStorage mock store (Phase 1). */
export function useMockDataSource(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_STORE !== "false";
}
