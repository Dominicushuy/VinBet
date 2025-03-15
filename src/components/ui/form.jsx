'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { Controller, FormProvider, useFormContext } from 'react-hook-form'

import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

const Form = FormProvider

const FormFieldContext = React.createContext({})

const FormField = props => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const FormItemContext = React.createContext({})

const FormItem = React.forwardRef(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn('space-y-2', className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = 'FormItem'

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const formContext = useFormContext()

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>')
  }

  if (!formContext) {
    throw new Error('useFormField should be used within a FormProvider')
  }

  const { name } = fieldContext
  const { id } = itemContext
  const { formState } = formContext

  // Safely access form state properties
  const error = formState?.errors?.[name]
  const touched = formState?.touchedFields?.[name]
  const dirty = formState?.dirtyFields?.[name]

  return {
    id,
    name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    error,
    touched,
    dirty
  }
}

const FormLabel = React.forwardRef((props, ref) => {
  const { className, ...rest } = props
  const { error, formItemId } = useFormField()

  return <Label ref={ref} className={cn(error && 'text-destructive', className)} htmlFor={formItemId} {...rest} />
})
FormLabel.displayName = 'FormLabel'

const FormControl = React.forwardRef((props, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = 'FormControl'

const FormDescription = React.forwardRef(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p ref={ref} id={formDescriptionId} className={cn('text-[0.8rem] text-muted-foreground', className)} {...props} />
  )
})
FormDescription.displayName = 'FormDescription'

const FormMessage = React.forwardRef(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? '') : children

  if (!body) {
    return null
  }

  return (
    <p ref={ref} id={formMessageId} className={cn('text-[0.8rem] font-medium text-destructive', className)} {...props}>
      {body}
    </p>
  )
})
FormMessage.displayName = 'FormMessage'

export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField }
