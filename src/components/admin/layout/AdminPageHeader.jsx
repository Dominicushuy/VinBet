'use client'

import { AdminBreadcrumb } from './AdminBreadcrumb'

export function AdminPageHeader({ title, description, actions }) {
  return (
    <div className='mb-8'>
      <AdminBreadcrumb />

      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>{title}</h1>
          {description && <p className='text-muted-foreground'>{description}</p>}
        </div>

        {actions && <div className='flex items-center space-x-2 mt-2 sm:mt-0'>{actions}</div>}
      </div>
    </div>
  )
}
