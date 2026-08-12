# AGENTS.md

## Purpose
Use this guide for all agent-generated code in this repository.
The goal is to keep CRUD modules consistent with the established category and product code style.

## Scope
Apply these rules to feature modules under components/*, especially CRUD pages under dashboard routes.

## Required Module Structure
For each CRUD entity (example: category, product), use this file layout:

- home.tsx
- table.tsx
- dialog-form.tsx
- toolbar.tsx
- list.tsx
- pagination.tsx

## Architecture Pattern

### 1) table.tsx is the orchestrator
- Mark as client component with "use client".
- Own all local UI state:
  - items list
  - search query
  - page and pageSize
  - selected item
  - dialog open/close
- Own form state and validation:
  - zod schema(s)
  - useForm + zodResolver
  - useFieldArray when needed
- Own action calls (create/update/delete).
- Own toast success/error messages.
- Pass only needed props down to child components.

### 2) dialog-form.tsx is presentational
- Receives form instance and handlers from table.tsx.
- Must not own server action logic.
- Renders Dialog + form fields + submit/cancel controls.
- Uses form.handleSubmit(onSubmit) from props.
- For list fields (like variants), receives field-array data and append/remove handlers via props.

### 3) toolbar/list/pagination are focused UI components
- toolbar.tsx: search and page-size controls only.
- list.tsx: table rendering and row actions only.
- pagination.tsx: summary text + previous/next controls only.

## Naming Conventions
- Use PascalCase for component names.
- Use explicit prop types named <ComponentName>Props.
- Use handler names:
  - openCreateModal
  - openEditModal
  - closeModal or resetModal
  - handleSubmit
  - handleDelete
- Use isEdit or isEditing as boolean derived from selected item.

## Form and Validation Rules
- Prefer zod schemas colocated in table.tsx.
- Export form value types from table.tsx when dialog-form.tsx needs them.
- Keep Input value conversion explicit:
  - Only parse numbers for fields that are numeric in schema.
  - Do not coerce numeric-looking strings unless schema expects numbers.
- Keep defaultValues centralized and reused for reset flows.

## UI and Styling Rules
- Match existing Tailwind usage and spacing scale.
- Use shadcn/ui components already present in repo.
- Keep class names simple and readable.
- Preserve existing rounded/border patterns used in category and product modules.

## Data and Side Effects
- Keep optimistic/local state updates in table.tsx after successful actions.
- Always handle errors with user-facing toast messages.
- Confirm destructive actions (window.confirm) before delete.

## Page Composition
- home.tsx should load data and render a Card wrapper with the table component.
- Prefer Promise.all for parallel data fetching when multiple resources are needed.

## Imports and Exports
- Prefer default export for main module components (table, dialog, list, toolbar, pagination).
- Keep import ordering clean:
  - external libs
  - internal types/actions/ui
  - local components

## Refactor Safety Checklist
Before finishing, ensure:
- No duplicated form state between table.tsx and dialog-form.tsx.
- No server action calls inside dialog-form.tsx.
- Type errors are clean in edited files.
- Build passes (`npm run build`) unless blocked by unrelated existing issues.

## Do Not
- Do not introduce new design patterns for one module only.
- Do not mix data orchestration and rendering concerns in one large file.
- Do not silently change API contracts of existing actions.
