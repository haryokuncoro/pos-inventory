import SalesHomePage from "@/components/sales/home"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AccessDenied } from "@/components/auth/permission-guard"
import { checkPermission } from "@/lib/actions/users"

type SalesPageProps = {
  searchParams?: Promise<{
    query?: string
    page?: string
  }>
}

export default async function SalesPage({
  searchParams,
}: SalesPageProps) {
  const resolvedSearchParams = await searchParams
  const query = resolvedSearchParams?.query?.trim() ?? ""
  const parsedPage = Number.parseInt(resolvedSearchParams?.page ?? "1", 10)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1

  const allowed = await checkPermission({
    sales: ["view"],
  });

  if (!allowed) {
    return <AccessDenied />;
  }
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Transactions</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Sales</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <SalesHomePage query={query} page={page} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
