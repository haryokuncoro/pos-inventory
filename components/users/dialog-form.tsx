import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Controller } from "react-hook-form"
import type * as ReactHookForm from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import type { SelectUser } from "@/db/schema"

type UserFormValues = {
  name: string
  email: string
  password: string
}

type UserDialogFormProps = {
  selectedUser: SelectUser | null
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  resetModal: () => void
  onSubmit: (data: UserFormValues) => void
  control: ReactHookForm.Control<UserFormValues>
  handleSubmit: ReactHookForm.UseFormHandleSubmit<UserFormValues>
  isSubmitting: boolean
  openCreateModal: () => void
}

export default function UserDialogForm({
  selectedUser,
  dialogOpen,
  setDialogOpen,
  resetModal,
  onSubmit,
  control,
  handleSubmit,
  isSubmitting,
  openCreateModal,
}: UserDialogFormProps) {
  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => {
      setDialogOpen(open)
      if (!open) {
        resetModal()
      }
    }}>
      <DialogTrigger
        render={<Button onClick={openCreateModal}>Add user</Button>}
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{selectedUser ? "Update user" : "Create user"}</DialogTitle>
          <DialogDescription>
            {selectedUser
              ? "Update the user information below."
              : "Create a new user account for your workspace."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-name">Name</Label>
            <Controller
              name="name"
              control={control}
              rules={{ required: "User name is required." }}
              render={({ field, fieldState }) => (
                <div className="space-y-1">
                  <Input
                    id="user-name"
                    placeholder="Enter user name"
                    value={field.value}
                    onChange={field.onChange}
                  />
                  {fieldState.error ? (
                    <p className="text-sm text-destructive">{fieldState.error.message}</p>
                  ) : null}
                </div>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-email">Email</Label>
            <Controller
              name="email"
              control={control}
              rules={{ required: "Email is required." }}
              render={({ field, fieldState }) => (
                <div className="space-y-1">
                  <Input
                    id="user-email"
                    type="email"
                    placeholder="email@example.com"
                    value={field.value}
                    onChange={field.onChange}
                  />
                  {fieldState.error ? (
                    <p className="text-sm text-destructive">{fieldState.error.message}</p>
                  ) : null}
                </div>
              )}
            />
          </div>

          {!selectedUser ? (
            <div className="space-y-2">
              <Label htmlFor="user-password">Password</Label>
              <Controller
                name="password"
                control={control}
                rules={{ required: "Password is required." }}
                render={({ field, fieldState }) => (
                  <div className="space-y-1">
                    <Input
                      id="user-password"
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={field.value}
                      onChange={field.onChange}
                    />
                    {fieldState.error ? (
                      <p className="text-sm text-destructive">{fieldState.error.message}</p>
                    ) : null}
                  </div>
                )}
              />
            </div>
          ) : null}

          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              }
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : selectedUser ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}