// src/components/ui/toast.tsx (Enhanced)
'use client'

import * as React from 'react'
import * as ToastPrimitives from '@radix-ui/react-toast'
import { cva } from 'class-variance-authority'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef((props, ref) => {
  const { className, ...rest } = props
  return (
    <ToastPrimitives.Viewport
      ref={ref}
      className={cn(
        'fixed bottom-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-4 sm:right-4 sm:top-auto sm:flex-col md:max-w-[420px] gap-2',
        className
      )}
      {...rest}
    />
  )
})
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full sm:data-[state=open]:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border-border bg-background text-foreground',
        destructive: 'destructive group border-destructive bg-destructive text-destructive-foreground',
        success: 'border-green-500 bg-green-50 text-green-800',
        warning: 'border-yellow-500 bg-yellow-50 text-yellow-800',
        info: 'border-blue-500 bg-blue-50 text-blue-800',
        system: 'border-indigo-500 bg-indigo-50 text-indigo-800',
        game: 'border-purple-500 bg-purple-50 text-purple-800',
        transaction: 'border-emerald-500 bg-emerald-50 text-emerald-800',
        admin: 'border-red-500 bg-red-50 text-red-800',
        custom: ''
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

const Toast = React.forwardRef((props, ref) => {
  const { className, variant, component: Component, ...rest } = props
  return (
    <ToastPrimitives.Root ref={ref} className={cn(toastVariants({ variant }), className)} {...rest}>
      {Component ? <Component onClose={() => rest.onOpenChange?.(false)} /> : rest.children}
    </ToastPrimitives.Root>
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef((props, ref) => {
  const { className, ...rest } = props
  return (
    <ToastPrimitives.Action
      ref={ref}
      className={cn(
        'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive',
        className
      )}
      {...rest}
    />
  )
})
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef((props, ref) => {
  const { className, ...rest } = props
  return (
    <ToastPrimitives.Close
      ref={ref}
      className={cn(
        'absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600',
        className
      )}
      toast-close=''
      {...rest}
    >
      <X className='h-4 w-4' />
    </ToastPrimitives.Close>
  )
})
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef((props, ref) => {
  const { className, ...rest } = props
  return <ToastPrimitives.Title ref={ref} className={cn('text-sm font-semibold', className)} {...rest} />
})
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef((props, ref) => {
  const { className, ...rest } = props
  return <ToastPrimitives.Description ref={ref} className={cn('text-sm opacity-90', className)} {...rest} />
})
ToastDescription.displayName = ToastPrimitives.Description.displayName

// Custom hook for using toast
export function useToast() {
  const [toasts, setToasts] = React.useState([])

  const toast = React.useCallback(({ title, description, action, variant, duration = 5000, component }) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { id, title, description, action, variant, duration, component }])

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
      }, duration)
    }

    return {
      id,
      dismiss: () => setToasts(prev => prev.filter(toast => toast.id !== id)),
      update: props => {
        setToasts(prev => prev.map(t => (t.id === id ? { ...t, ...props, id } : t)))
      }
    }
  }, [])

  const dismiss = React.useCallback(toastId => {
    if (toastId) {
      setToasts(prev => prev.filter(toast => toast.id !== toastId))
    } else {
      setToasts([])
    }
  }, [])

  return React.useMemo(
    () => ({
      toast,
      dismiss,
      toasts
    }),
    [toast, dismiss, toasts]
  )
}

// Toast component for the app
export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, variant, component }) => (
        <Toast
          key={id}
          variant={variant}
          component={component}
          onOpenChange={open => {
            if (!open) {
              dismiss(id)
            }
          }}
        >
          {!component && (
            <>
              <div className='grid gap-1'>
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
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

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction }
