// src/components/notifications/NotificationToast.jsx
'use client'

import * as Toast from '@/components/ui/toast'
import { X, Bell, DollarSign, Gamepad, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const TOAST_TYPES = {
  system: {
    icon: <Bell className='h-5 w-5' />,
    className: 'border-blue-500 bg-blue-50 text-blue-700'
  },
  transaction: {
    icon: <DollarSign className='h-5 w-5' />,
    className: 'border-green-500 bg-green-50 text-green-700'
  },
  game: {
    icon: <Gamepad className='h-5 w-5' />,
    className: 'border-purple-500 bg-purple-50 text-purple-700'
  },
  admin: {
    icon: <ShieldAlert className='h-5 w-5' />,
    className: 'border-red-500 bg-red-50 text-red-700'
  },
  default: {
    icon: <Bell className='h-5 w-5' />,
    className: 'border-gray-500 bg-gray-50 text-gray-700'
  }
}

export function NotificationToast({ notification, onClose = () => {} }) {
  const type = notification.type || 'default'
  const { icon, className } = TOAST_TYPES[type] || TOAST_TYPES.default

  return (
    <Toast.Root
      className={cn(
        'group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full',
        className
      )}
    >
      <div className='flex items-start gap-3 w-full'>
        <div className='flex-shrink-0 p-1 rounded-full bg-white/20'>{icon}</div>
        <div className='flex-1 min-w-0'>
          <Toast.Title className='font-semibold [&:has([role=link])]:underline-offset-4 line-clamp-1'>
            {notification.title}
          </Toast.Title>
          <Toast.Description className='mt-1 text-sm opacity-90 line-clamp-2'>{notification.content}</Toast.Description>
          {notification.id && (
            <Link
              href={`/notifications?id=${notification.id}`}
              className='mt-1.5 inline-flex items-center text-xs font-medium opacity-90 hover:opacity-100'
            >
              Xem chi tiết
            </Link>
          )}
        </div>
      </div>
      <Toast.Close
        className='absolute right-1 top-1 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100'
        onClick={onClose}
      >
        <X className='h-4 w-4' />
      </Toast.Close>
    </Toast.Root>
  )
}

export function NotificationToastViewport() {
  return (
    <Toast.Provider>
      <AnimatePresence>
        <Toast.Viewport className='fixed bottom-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-4 sm:right-4 sm:top-auto sm:flex-col md:max-w-[420px] gap-2' />
      </AnimatePresence>
    </Toast.Provider>
  )
}

export function useNotificationToast() {
  const { toast } = Toast.useToast()

  const showNotificationToast = notification => {
    toast({
      title: notification.title,
      description: notification.content,
      custom: true,
      duration: 5000,
      variant: notification.type || 'default',
      action: notification.action,
      component: ({ onClose }) => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <NotificationToast notification={notification} onClose={onClose} />
        </motion.div>
      )
    })
  }

  return {
    showNotificationToast
  }
}
