"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import UserDialogForm from "./dialog-form"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { SelectUser } from "@/db/schema"
import {
  createUser,
  deleteUser,
  updateUser,
} from "@/lib/actions/users"

type UsersTableProps = {
  initialUsers: SelectUser[]
}

const userSchema = z.object({
  name: z.string().trim().min(1, "User name is required."),
  email: z.string().trim().email("Valid email is required."),
  password: z.string().min(8, "Password must be at least 8 characters.").or(z.literal("")),
})

type UserFormValues = z.infer<typeof userSchema>

export function UsersTable({ initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState<SelectUser[]>(initialUsers)
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [selectedUser, setSelectedUser] = useState<SelectUser | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", email: "", password: "" },
  })

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return users
    }

    return users.filter((user) =>
      user.name.toLowerCase().includes(normalizedQuery) ||
      user.email.toLowerCase().includes(normalizedQuery)
    )
  }, [query, users])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const safePage = Math.min(page, totalPages)

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const pagedUsers = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize
    return filteredUsers.slice(startIndex, startIndex + pageSize)
  }, [filteredUsers, pageSize, safePage])

  const resetModal = () => {
    setDialogOpen(false)
    setSelectedUser(null)
    reset({ name: "", email: "", password: "" })
  }

  const openCreateModal = () => {
    setSelectedUser(null)
    reset({ name: "", email: "", password: "" })
    setDialogOpen(true)
  }

  const openEditModal = (user: SelectUser) => {
    setSelectedUser(user)
    reset({ name: user.name, email: user.email, password: "" })
    setDialogOpen(true)
  }

  const onSubmit = async (values: UserFormValues) => {
    try {
      if (selectedUser) {
        const updatedUser = await updateUser(selectedUser.id, {
          name: values.name,
          email: values.email,
        })

        setUsers((currentUsers) =>
          currentUsers.map((user) =>
            user.id === selectedUser.id
              ? {
                ...user,
                name: updatedUser?.name ?? values.name,
                email: updatedUser?.email ?? values.email,
              }
              : user
          )
        )
        toast.success("User updated")
      } else {
        const createdUser = await createUser({
          name: values.name,
          email: values.email,
          password: values.password,
        })

        if (createdUser) {
          setUsers((currentUsers) => [createdUser, ...currentUsers])
        }
        toast.success("User created")
      }

      resetModal()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save user.")
    }
  }

  const handleDelete = async (userId: string) => {
    const confirmed = window.confirm("Delete this user?")
    if (!confirmed) {
      return
    }

    try {
      await deleteUser(userId)
      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== userId)
      )
      toast.success("User deleted")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete user.")
    }
  }

  return (
    <div className="space-y-4 p-4">

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Search by name or email"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setPage(1)
          }}
          className="max-w-sm"
        />

        <div className="flex items-center gap-2 text-sm">
          <Label htmlFor="page-size" className="text-sm text-muted-foreground">
            Rows
          </Label>
          <select
            id="page-size"
            className="h-9 rounded-4xl border border-input bg-input/30 px-3 text-sm"
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value))
              setPage(1)
            }}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <UserDialogForm
          selectedUser={selectedUser}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          resetModal={resetModal}
          onSubmit={onSubmit}
          control={control}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          openCreateModal={openCreateModal}
        />
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedUsers.length > 0 ? (
              pagedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.emailVerified ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditModal(user)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}>
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {pagedUsers.length} of {filteredUsers.length} users
        </p>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))} disabled={safePage === 1}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {safePage} of {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => setPage((currentPage) => Math.min(currentPage + 1, totalPages))} disabled={safePage === totalPages}>
            Next
          </Button>
        </div>
      </div>


    </div>
  )
}
