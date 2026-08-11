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
import type { SelectCategory } from "@/db/schema"

type CategoryFormValues = {
  name: string
}

type CategoryDialogFormProps = {
  selectedCategory: SelectCategory | null
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  resetModal: () => void
  onSubmit: (data: CategoryFormValues) => void
  control: ReactHookForm.Control<CategoryFormValues>
  handleSubmit: ReactHookForm.UseFormHandleSubmit<CategoryFormValues>
  isSubmitting: boolean
  openCreateModal: () => void
}

export default function CategoryDialogForm({
  selectedCategory,
  dialogOpen,
  setDialogOpen,
  resetModal,
  onSubmit,
  control,
  handleSubmit,
  isSubmitting,
  openCreateModal,
}: CategoryDialogFormProps) {
    return (
        <>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open)
        if (!open) {
          resetModal()
        }
      }}>
        <DialogTrigger
          render={<Button onClick={openCreateModal}>Add category</Button>}
        />

        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCategory ? "Update category" : "Create category"}</DialogTitle>
            <DialogDescription>
              {selectedCategory
                ? "Update the category name below."
                : "Create a new product category for your inventory."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Name</Label>
              <Controller
                name="name"
                control={control}
                rules={{ required: "Category name is required." }}
                render={({ field, fieldState }) => (
                  <div className="space-y-1">
                    <Input
                      id="category-name"
                      placeholder="Enter category name"
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

            <DialogFooter>
              <DialogClose
                render={
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                }
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : selectedCategory ? "Save changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
        </>
    )
}