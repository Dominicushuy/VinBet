'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
  const variantStyles = {
    default: 'bg-gray-100/40 dark:bg-gray-800/40',
    outline: 'border border-gray-200 dark:border-gray-800 bg-transparent',
    pills: 'gap-2 p-1',
    underline: 'border-b border-gray-200 dark:border-gray-800 bg-transparent'
  }

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-lg p-1 text-muted-foreground transition-all',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
  const variantStyles = {
    default: 'data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-sm',
    outline:
      'data-[state=active]:border-primary data-[state=active]:text-primary dark:data-[state=active]:border-primary',
    pills:
      'rounded-full border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary',
    underline:
      'rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:text-primary shadow-none'
  }

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        'relative inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all',
        'hover:bg-gray-50 dark:hover:bg-gray-800/50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        'data-[state=active]:text-foreground',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        'mt-3 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      asChild
      {...props}
    >
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 5 }}
        transition={{ duration: 0.2 }}
      >
        {props.children}
      </motion.div>
    </TabsPrimitive.Content>
  )
})
TabsContent.displayName = TabsPrimitive.Content.displayName

// Example usage component
const TabsDemo = () => {
  return (
    <Tabs defaultValue='account' className='w-full max-w-3xl mx-auto'>
      <TabsList className='grid w-full grid-cols-4' variant='pills'>
        <TabsTrigger value='account'>Account</TabsTrigger>
        <TabsTrigger value='password'>Password</TabsTrigger>
        <TabsTrigger value='settings'>Settings</TabsTrigger>
        <TabsTrigger value='notifications'>Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value='account'>
        <div className='p-6 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm'>
          <h3 className='text-lg font-medium mb-2'>Account Settings</h3>
          <p className='text-gray-500 dark:text-gray-400'>Update your account information and preferences.</p>
        </div>
      </TabsContent>
      <TabsContent value='password'>
        <div className='p-6 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm'>
          <h3 className='text-lg font-medium mb-2'>Password Management</h3>
          <p className='text-gray-500 dark:text-gray-400'>Change your password and security settings.</p>
        </div>
      </TabsContent>
      <TabsContent value='settings'>
        <div className='p-6 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm'>
          <h3 className='text-lg font-medium mb-2'>General Settings</h3>
          <p className='text-gray-500 dark:text-gray-400'>Manage your application preferences and settings.</p>
        </div>
      </TabsContent>
      <TabsContent value='notifications'>
        <div className='p-6 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm'>
          <h3 className='text-lg font-medium mb-2'>Notification Preferences</h3>
          <p className='text-gray-500 dark:text-gray-400'>Control how and when you receive notifications.</p>
        </div>
      </TabsContent>
    </Tabs>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsDemo }
