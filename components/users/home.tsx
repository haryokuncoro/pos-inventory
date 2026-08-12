import { Card } from "@/components/ui/card"
import { getAllUsers } from "@/lib/actions/users"
import UsersTable from "./table"

export default async function UsersHomePage() {
  const users = await getAllUsers()

  return (
    <Card className="w-full">
      <UsersTable initialUsers={users} />
    </Card>
  )
}
