import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StatsCard({ title, value, description, icon, trend, trendValue, isLoading = false, className }) {
  return (
    <Card className={cn('transition-all hover:shadow-md', className)}>
      <CardContent className='p-6'>
        {isLoading ? (
          <div className='space-y-2' aria-label='Đang tải...'>
            <Skeleton className='h-4 w-[100px]' />
            <Skeleton className='h-8 w-[120px]' />
            <Skeleton className='h-4 w-[80px]' />
          </div>
        ) : (
          <>
            <div className='flex items-center justify-between mb-3'>
              <p className='text-sm font-medium text-muted-foreground' id={`stat-title-${title.replace(/\s+/g, '-')}`}>
                {title}
              </p>
              <div className='p-1 bg-muted rounded-md' aria-hidden='true'>
                {icon}
              </div>
            </div>
            <div
              className='text-2xl font-bold truncate'
              title={value}
              aria-labelledby={`stat-title-${title.replace(/\s+/g, '-')}`}
            >
              {value}
            </div>
            <div className='flex items-center mt-1'>
              {trend && (
                <span
                  className={`text-xs ${
                    trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'
                  } flex items-center mr-1`}
                  aria-label={`${trendValue ? `${trendValue.toFixed(1)}% ` : ''}${trend === 'up' ? 'tăng' : 'giảm'}`}
                >
                  {trend === 'up' ? (
                    <ArrowUp className='h-3 w-3 mr-0.5' aria-hidden='true' />
                  ) : trend === 'down' ? (
                    <ArrowDown className='h-3 w-3 mr-0.5' aria-hidden='true' />
                  ) : null}
                  {trendValue ? `${trendValue.toFixed(1)}%` : '0%'}
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
