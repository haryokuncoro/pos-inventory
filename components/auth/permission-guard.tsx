import { Link } from "lucide-react";

export function AccessDenied() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Link
        size={48}
        className="mb-4 text-muted-foreground"
      />

      <h1 className="text-2xl font-semibold">
        Access Denied
      </h1>

      <p className="text-muted-foreground">
        You do not have permission to view this page.
      </p>

      <a
        href="/dashboard"
        className="mt-2 text-blue-500 hover:underline"
      >
        Back to Dashboard
      </a>
    </div>
  );
}