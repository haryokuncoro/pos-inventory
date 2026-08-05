"use client"

import {authClient} from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useState } from "react"

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    await authClient.signOut()
    setIsLoading(false)
    window.location.href = "/login"
  }

  return (
    <Button onClick={handleLogout} disabled={isLoading}>
      {isLoading ? <Loader2 className="animate-spin size-4" /> : "Logout"}
    </Button>
  )
}