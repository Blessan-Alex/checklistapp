"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { ApiError } from "@/lib/api-client";
import { useCaseQuery } from "@/lib/hooks/use-case-api";
import { useStaffUnauthorizedRedirect } from "@/lib/hooks/use-staff-unauthorized-redirect";

export function useStaffCasePage(params: Promise<{ id: string }>) {
  const router = useRouter();
  const { id: caseId } = use(params);
  const apiQuery = useCaseQuery(caseId);
  const sessionExpired = useStaffUnauthorizedRedirect(apiQuery.error);

  const notFound =
    apiQuery.error instanceof ApiError && apiQuery.error.status === 404;

  useEffect(() => {
    if (!notFound || sessionExpired) {
      return;
    }
    router.replace(ROUTES.staffCases);
  }, [sessionExpired, notFound, router]);

  const showLoading =
    !sessionExpired &&
    !notFound &&
    (apiQuery.isPending || (apiQuery.isFetching && !apiQuery.data));

  return {
    caseRecord: apiQuery.data,
    showLoading,
    sessionExpired,
    notFound,
    refreshCase: () => void apiQuery.refetch(),
  };
}
