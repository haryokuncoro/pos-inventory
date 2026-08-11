import {
  Card,
} from "@/components/ui/card"
import { CategoryTable } from "./table"

export default function CategoryHomePage() {
  return (
    <Card className="w-full">
      <CategoryTable />
    </Card>
  )
}
