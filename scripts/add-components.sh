#!/bin/bash
components=(
  button
  input
  form
  card
  dialog
  dropdown-menu
  avatar
  tabs
  sheet
  sonner
  table
  badge
  progress
  separator
  alert
  select
  alert-dialog
  textarea
)

for comp in "${components[@]}"; do
  pnpm dlx shadcn@latest add "$comp"
done
