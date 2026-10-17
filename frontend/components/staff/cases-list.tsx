"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { RouteBadge } from "@/components/shared/route-badge";
import { StatusChip } from "@/components/shared/status-chip";
import { DeleteCaseDialog } from "@/components/staff/delete-case-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/config/routes";
import type { Case, CaseStatus, Route } from "@/lib/types";
import { ApiError } from "@/lib/api-client";
import { useCasesQuery } from "@/lib/hooks/use-case-api";
import { clearStaffAuth } from "@/lib/staff-auth";
import { clientUploadProgress } from "@/lib/client-portal";
import { staffCaseHref } from "@/lib/staff-routes";
import { cn } from "@/lib/utils";

type RouteFilter = "all" | Route;
type StatusFilter = "all" | CaseStatus;
type SortKey = "updated" | "name";

function formatUpdated(iso?: string): string {
  if (!iso) {
    return "—";
  }
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "live", label: "Live" },
  { value: "client_in_progress", label: "In progress" },
  { value: "submitted", label: "Submitted" },
  { value: "ready_to_zip", label: "Ready to zip" },
  { value: "zip_ready", label: "Zip ready" },
];

export function CasesList() {
  const router = useRouter();
  const apiQuery = useCasesQuery();

  const [routeFilter, setRouteFilter] = useState<RouteFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("updated");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Case | null>(null);

  const cases = useMemo(() => apiQuery.data ?? [], [apiQuery.data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = cases.filter((caseRecord) => {
      if (routeFilter !== "all" && caseRecord.route !== routeFilter) {
        return false;
      }
      if (statusFilter !== "all" && caseRecord.status !== statusFilter) {
        return false;
      }
      if (!q) {
        return true;
      }
      const hay = `${caseRecord.applicantFullName} ${caseRecord.uan}`.toLowerCase();
      return hay.includes(q);
    });

    list = [...list].sort((a, b) => {
      if (sortKey === "name") {
        return a.applicantFullName.localeCompare(b.applicantFullName);
      }
      const at = a.updatedAt ? Date.parse(a.updatedAt) : 0;
      const bt = b.updatedAt ? Date.parse(b.updatedAt) : 0;
      return bt - at;
    });

    return list;
  }, [cases, routeFilter, statusFilter, search, sortKey]);

  function openCase(caseRecord: Case) {
    router.push(staffCaseHref(caseRecord));
  }

  function handleCaseDeleted() {
    setDeleteTarget(null);
  }

  const sessionExpired =
    apiQuery.error instanceof ApiError && apiQuery.error.status === 401;

  useEffect(() => {
    if (!sessionExpired) {
      return;
    }
    clearStaffAuth();
    router.replace(`${ROUTES.staffLogin}?reason=401`);
  }, [sessionExpired, router]);

  if (sessionExpired) {
    return null;
  }

  if (apiQuery.isLoading) {
    return (
      <p className="text-muted-foreground" role="status">
        Loading cases…
      </p>
    );
  }

  if (apiQuery.isError) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-12 text-center">
        <h1 className="text-2xl font-semibold text-primary">Cases</h1>
        <p className="text-sm text-muted-foreground">
          Could not load cases. Check your connection or server configuration,
          then try again.
        </p>
        <Button
          type="button"
          className="min-h-11"
          onClick={() => void apiQuery.refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!cases.length) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-12 text-center">
        <h1 className="text-2xl font-semibold text-primary">Cases</h1>
        <p className="text-sm text-muted-foreground">
          No cases yet. Upload a Home Office checklist PDF to create your first
          case.
        </p>
        <Link
          href={ROUTES.staffCaseNew}
          className={cn(buttonVariants(), "min-h-11 inline-flex")}
        >
          Create first case
        </Link>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Cases</h1>
        <p className="text-sm text-muted-foreground">
          Open a case to review the checklist or see client uploads.
        </p>
      </div>

      <div className="space-y-3">
        <Label htmlFor="cases-search" className="sr-only">
          Search cases
        </Label>
        <Input
          id="cases-search"
          placeholder="Search by name or UAN"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md"
        />
        <details className="group max-w-md text-sm">
          <summary
            className="cursor-pointer list-none text-muted-foreground underline-offset-4 hover:text-foreground hover:underline marker:content-none [&::-webkit-details-marker]:hidden"
          >
            Filter & sort
          </summary>
          <div className="mt-3 flex flex-col gap-3 rounded-lg border border-border/80 bg-card/50 p-3 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="cases-route" className="text-xs">
                Route
              </Label>
              <select
                id="cases-route"
                className="flex h-9 w-full min-w-[10rem] rounded-lg border border-input bg-transparent px-2 text-sm"
                value={routeFilter}
                onChange={(e) => setRouteFilter(e.target.value as RouteFilter)}
              >
                <option value="all">All routes</option>
                <option value="skilled_worker">Skilled Worker</option>
                <option value="ilr">ILR</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cases-status" className="text-xs">
                Status
              </Label>
              <select
                id="cases-status"
                className="flex h-9 w-full min-w-[10rem] rounded-lg border border-input bg-transparent px-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cases-sort" className="text-xs">
                Sort
              </Label>
              <select
                id="cases-sort"
                className="flex h-9 w-full min-w-[10rem] rounded-lg border border-input bg-transparent px-2 text-sm"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
              >
                <option value="updated">Last updated</option>
                <option value="name">Applicant name</option>
              </select>
            </div>
          </div>
        </details>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No cases match your filters.
        </p>
      ) : null}

      <div className="hidden min-w-0 overflow-x-auto rounded-lg border lg:block">
        <Table className="min-w-[44rem]">
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>UAN</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="hidden lg:table-cell">Updated</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((caseRecord) => {
              const progress = clientUploadProgress(caseRecord);
              return (
                <TableRow
                  key={caseRecord.id}
                  className="cursor-pointer"
                  onClick={() => openCase(caseRecord)}
                >
                  <TableCell className="font-medium">
                    {caseRecord.applicantFullName}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {caseRecord.uan}
                  </TableCell>
                  <TableCell>
                    <RouteBadge route={caseRecord.route} />
                  </TableCell>
                  <TableCell>
                    <StatusChip status={caseRecord.status} />
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {progress.completed}/{progress.total}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {formatUpdated(caseRecord.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="min-h-9 text-destructive hover:text-destructive"
                      aria-label={`Delete case for ${caseRecord.applicantFullName}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setDeleteTarget(caseRecord);
                      }}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ul className="space-y-3 lg:hidden">
        {filtered.map((caseRecord) => {
          const progress = clientUploadProgress(caseRecord);
          return (
            <li key={caseRecord.id} className="relative">
              <button
                type="button"
                onClick={() => openCase(caseRecord)}
                className={cn(
                  "w-full rounded-xl border border-border bg-card p-4 pr-14 text-left shadow-sm transition hover:border-primary/40",
                  "min-h-[72px]",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-foreground">
                    {caseRecord.applicantFullName}
                  </p>
                  <StatusChip status={caseRecord.status} />
                </div>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {caseRecord.uan}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <RouteBadge route={caseRecord.route} />
                  <span className="text-xs text-muted-foreground">
                    Client {progress.completed}/{progress.total}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    · {formatUpdated(caseRecord.updatedAt)}
                  </span>
                </div>
              </button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-3 top-3 min-h-9 min-w-9 p-0 text-destructive hover:text-destructive"
                aria-label={`Delete case for ${caseRecord.applicantFullName}`}
                onClick={() => setDeleteTarget(caseRecord)}
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </li>
          );
        })}
      </ul>

      {deleteTarget ? (
        <DeleteCaseDialog
          caseRecord={deleteTarget}
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteTarget(null);
            }
          }}
          onDeleted={handleCaseDeleted}
        />
      ) : null}
    </div>
  );
}
