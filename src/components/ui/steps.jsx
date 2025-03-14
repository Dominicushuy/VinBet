import { cn } from '@/lib/utils'

export function Steps({ children, className }) {
  return <div className={cn('space-y-4', className)}>{children}</div>
}

export function Step({ title, description, children, className }) {
  return (
    <div className={cn('relative pl-8 pb-8 border-l last:border-l-0 border-border', className)}>
      <div className='absolute left-0 top-0 -translate-x-1/2 h-5 w-5 rounded-full border-2 border-primary bg-background z-10'></div>
      <div className='space-y-1'>
        <h4 className='text-sm font-medium'>{title}</h4>
        {description && <p className='text-xs text-muted-foreground'>{description}</p>}
        {children && <div className='mt-2'>{children}</div>}
      </div>
    </div>
  )
}
