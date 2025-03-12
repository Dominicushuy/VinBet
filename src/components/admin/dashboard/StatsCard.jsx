import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StatsCard({ title, value, description, icon, trend, trendValue, isLoading = false, className }) {
  // Convert trendValue to number if it's not already
  const numericTrendValue = trendValue !== undefined ? Number(trendValue) : 0

  return (
    <Card className={cn('transition-all hover:shadow-md', className)}>
      <CardContent className='p-6'>
        {isLoading ? (
          <div className='space-y-2'>
            <Skeleton className='h-4 w-[100px]' />
            <Skeleton className='h-8 w-[120px]' />
            <Skeleton className='h-4 w-[80px]' />
          </div>
        ) : (
          <>
            <div className='flex items-center justify-between mb-3'>
              <p className='text-sm font-medium text-muted-foreground'>{title}</p>
              <div className='p-1 bg-muted rounded-md'>{icon}</div>
            </div>
            <div className='text-2xl font-bold truncate' title={value}>
              {value}
            </div>
            <div className='flex items-center mt-1'>
              {trend && (
                <span
                  className={cn(
                    'text-xs flex items-center mr-1',
                    trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                  )}
                >
                  {trend === 'up' ? (
                    <ArrowUp className='h-3 w-3 mr-0.5' />
                  ) : trend === 'down' ? (
                    <ArrowDown className='h-3 w-3 mr-0.5' />
                  ) : null}
                  {!isNaN(numericTrendValue) ? `${numericTrendValue}%` : '0%'}
                </span>
              )}
              <span className='text-xs text-muted-foreground'>{description}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
