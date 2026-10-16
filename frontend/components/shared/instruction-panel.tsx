import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SimpleMarkdown } from "@/lib/simple-markdown";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";

export function InstructionPanel({
  title = "Instructions",
  content,
  className,
}: {
  title?: string;
  content: string;
  className?: string;
}) {
  return (
    <Card className={cn("border-border/80", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <BookOpen className="size-4 text-primary" aria-hidden />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SimpleMarkdown content={content} />
      </CardContent>
    </Card>
  );
}
