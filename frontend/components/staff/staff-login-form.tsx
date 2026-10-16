"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FIRM_NAME } from "@/lib/constants";
import { ROUTES } from "@/config/routes";
import { api } from "@/lib/api-client";
import { useMockDataSource } from "@/lib/data-source";
import {
  setStaffApiAuthed,
  setStaffAuthed,
  validateStaffLoginPassword,
} from "@/lib/staff-auth";
import { loadMockStore } from "@/lib/mock-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function StaffLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get("reason") === "401";
  const mockData = useMockDataSource();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validateStaffLoginPassword(password)) {
      setError("Invalid password.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      if (mockData) {
        loadMockStore();
        setStaffAuthed();
      } else {
        await api.login(password);
        setStaffApiAuthed();
      }
      router.push(ROUTES.staffCases);
    } catch {
      setError("Invalid password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md border-border/80 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Staff portal
          </p>
          <CardTitle className="text-2xl font-semibold text-primary">
            {FIRM_NAME}
          </CardTitle>
          <CardDescription>
            Sign in to manage client document checklists.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessionExpired ? (
            <p
              className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              role="status"
            >
              Your session expired (401). Please sign in again.
            </p>
          ) : null}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Staff password"
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">{error}</p>
            ) : null}
            <Button
              className="w-full min-h-11"
              type="submit"
              disabled={submitting}
            >
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
