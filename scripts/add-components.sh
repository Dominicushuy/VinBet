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
  popover
  switch
  checkbox
  tooltip
  radio-group
  collapsible
  slider
  scroll-area
  hover-card
)

for comp in "${components[@]}"; do
  pnpm dlx shadcn@latest add "$comp"
done
