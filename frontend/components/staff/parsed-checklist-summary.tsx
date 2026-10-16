import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RouteBadge } from "@/components/shared/route-badge";
import type { Case } from "@/lib/types";

export function ParsedChecklistSummary({ caseRecord }: { caseRecord: Case }) {
  return (
    <Card className="border-border/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Parsed from checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <p className="text-muted-foreground">UAN</p>
          <p className="font-mono font-medium">{caseRecord.uan}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Applicant</p>
          <p className="font-medium">
            {caseRecord.title} {caseRecord.applicantFullName}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Submitted date</p>
          <p className="font-medium">{caseRecord.submittedDate}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Suggested route</p>
          <RouteBadge route={caseRecord.route} />
        </div>
        <div className="sm:col-span-2">
          <p className="text-muted-foreground">Product / service</p>
          <p className="font-medium">{caseRecord.productLine ?? "—"}</p>
        </div>
        {caseRecord.checklistFileName ? (
          <div className="sm:col-span-2">
            <p className="text-muted-foreground">Checklist file</p>
            <p className="truncate font-medium">{caseRecord.checklistFileName}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
