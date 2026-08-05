import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted p-6">
      <div className="flex flex-col items-center gap-6 rounded-xl border bg-background p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Welcome</h1>
        <p className="text-center text-muted-foreground">
          Choose an option to continue.
        </p>

        <div className="flex gap-3">
          <Button>
            <Link href="/login">Login</Link>
          </Button>

          <Button variant="outline">
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}