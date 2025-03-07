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
  toast
  table
  badge
  progress
  separator
  alert
)

for comp in "${components[@]}"; do
  pnpm dlx shadcn@latest add "$comp"
done
