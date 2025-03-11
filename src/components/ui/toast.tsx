// src/components/ui/toast.tsx (Enhanced)
'use client'

import * as React from 'react'
import * as ToastPrimitives from '@radix-ui/react-toast'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed bottom-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-4 sm:right-4 sm:top-auto sm:flex-col md:max-w-[420px] gap-2',
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full sm:data-[state=open]:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border-border bg-background text-foreground',
        destructive:
          'destructive group border-destructive bg-destructive text-destructive-foreground',
        success: 'border-green-500 bg-green-50 text-green-800',
        warning: 'border-yellow-500 bg-yellow-50 text-yellow-800',
        info: 'border-blue-500 bg-blue-50 text-blue-800',
        system: 'border-indigo-500 bg-indigo-50 text-indigo-800',
        game: 'border-purple-500 bg-purple-50 text-purple-800',
        transaction: 'border-emerald-500 bg-emerald-50 text-emerald-800',
        admin: 'border-red-500 bg-red-50 text-red-800',
        custom: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants> & {
      component?: React.ComponentType<{ onClose: () => void }>
    }
>(({ className, variant, component: Component, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}>
      {Component ? (
        <Component onClose={() => props.onOpenChange?.(false)} />
      ) : (
        props.children
      )}
    </ToastPrimitives.Root>
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive',
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600',
      className
    )}
    toast-close=''
    {...props}>
    <X className='h-4 w-4' />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn('text-sm font-semibold', className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}

// Custom hook for using toast
export function useToast() {
  const [toasts, setToasts] = React.useState<
    {
      id: string
      title?: React.ReactNode
      description?: React.ReactNode
      action?: ToastActionElement
      variant?:
        | 'default'
        | 'destructive'
        | 'success'
        | 'warning'
        | 'info'
        | 'system'
        | 'game'
        | 'transaction'
        | 'admin'
        | 'custom'
      duration?: number
      component?: React.ComponentType<{ onClose: () => void }>
    }[]
  >([])

  const toast = React.useCallback(
    ({
      title,
      description,
      action,
      variant,
      duration = 5000,
      component,
    }: {
      title?: React.ReactNode
      description?: React.ReactNode
      action?: ToastActionElement
      variant?:
        | 'default'
        | 'destructive'
        | 'success'
        | 'warning'
        | 'info'
        | 'system'
        | 'game'
        | 'transaction'
        | 'admin'
        | 'custom'
      duration?: number
      component?: React.ComponentType<{ onClose: () => void }>
    }) => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [
        ...prev,
        { id, title, description, action, variant, duration, component },
      ])

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((toast) => toast.id !== id))
        }, duration)
      }

      return {
        id,
        dismiss: () =>
          setToasts((prev) => prev.filter((toast) => toast.id !== id)),
        update: (props: {
          title?: React.ReactNode
          description?: React.ReactNode
          action?: ToastActionElement
          variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info'
          duration?: number
        }) => {
          setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...props, id } : t))
          )
        },
      }
    },
    []
  )

  const dismiss = React.useCallback((toastId?: string) => {
    if (toastId) {
      setToasts((prev) => prev.filter((toast) => toast.id !== toastId))
    } else {
      setToasts([])
    }
  }, [])

  return React.useMemo(
    () => ({
      toast,
      dismiss,
      toasts,
    }),
    [toast, dismiss, toasts]
  )
}

// Toast component for the app
export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, variant, component }) => (
        <Toast
          key={id}
          variant={variant}
          component={component}
          onOpenChange={(open) => {
            if (!open) {
              const { dismiss } = useToast()
              dismiss(id)
            }
          }}>
          {!component && (
            <>
              <div className='grid gap-1'>
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
              {action && <ToastAction altText='Close'>{action}</ToastAction>}
              <ToastClose />
            </>
          )}
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
