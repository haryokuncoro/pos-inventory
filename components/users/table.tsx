"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import type { SelectUser } from "@/db/schema"
import {
  createUser,
  deleteUser,
  updateUser,
} from "@/lib/actions/users"

import UserDialogForm from "./dialog-form"
import UserList from "./list"
import UserPagination from "./pagination"
import UserToolbar from "./toolbar"

const userSchema = z.object({
  name: z.string().trim().min(1, "User name is required."),
  email: z.string().trim().email("Valid email is required."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .or(z.literal("")),
})

export type UserFormValues = z.infer<typeof userSchema>

type UsersTableProps = {
  initialUsers: SelectUser[]
}

export default function UsersTable({ initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState<SelectUser[]>(initialUsers)
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const [selectedUser, setSelectedUser] = useState<SelectUser | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return users
    }

    return users.filter(
      (user) =>
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

    form.reset({
      name: "",
      email: "",
      password: "",
    })
  }

  const openCreateModal = () => {
    setSelectedUser(null)

    form.reset({
      name: "",
      email: "",
      password: "",
    })

    setDialogOpen(true)
  }

  const openEditModal = (user: SelectUser) => {
    setSelectedUser(user)

    form.reset({
      name: user.name,
      email: user.email,
      password: "",
    })

    setDialogOpen(true)
  }

  const handleSubmit = async (values: UserFormValues) => {
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
      toast.error(
        error instanceof Error ? error.message : "Unable to save user."
      )
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
      toast.error(
        error instanceof Error ? error.message : "Unable to delete user."
      )
    }
  }

  return (
    <div className="space-y-4 p-4">
      <UserToolbar
        query={query}
        pageSize={pageSize}
        onQueryChange={(value) => {
          setQuery(value)
          setPage(1)
        }}
        onPageSizeChange={(value) => {
          setPageSize(value)
          setPage(1)
        }}
      />

      <div className="flex justify-end">
        <UserDialogForm
          form={form}
          selectedUser={selectedUser}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onClose={resetModal}
          onCreate={openCreateModal}
          onSubmit={handleSubmit}
        />
      </div>

      <UserList
        users={pagedUsers}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <UserPagination
        page={safePage}
        totalPages={totalPages}
        totalItems={filteredUsers.length}
        currentItems={pagedUsers.length}
        onPrevious={() => setPage((current) => Math.max(current - 1, 1))}
        onNext={() => setPage((current) => Math.min(current + 1, totalPages))}
      />
    </div>
  )
}
