import { cn } from "@/lib/utils";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "destructive";
}

const alertVariants: Record<NonNullable<AlertProps["variant"]>, string> = {
  default: "border-border bg-surface text-foreground",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-900",
  destructive: "border-red-200 bg-red-50 text-red-900",
};

export function Alert({
  className,
  variant = "default",
  ...props
}: AlertProps) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-lg border p-4 shadow-sm",
        alertVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("ml-3 text-sm", className)} {...props} />;
}
