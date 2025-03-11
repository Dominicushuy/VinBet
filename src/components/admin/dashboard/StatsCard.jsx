import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowUp, ArrowDown } from 'lucide-react'

export function StatsCard({ title, value, description, icon, trend, trendValue, isLoading = false }) {
  return (
    <Card>
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
            <div className='text-2xl font-bold'>{value}</div>
            <div className='flex items-center mt-1'>
              <span
                className={`text-xs ${
                  trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'
                } flex items-center mr-1`}
              >
                {trend === 'up' ? (
                  <ArrowUp className='h-3 w-3 mr-0.5' />
                ) : trend === 'down' ? (
                  <ArrowDown className='h-3 w-3 mr-0.5' />
                ) : null}
                {trendValue.toFixed(1)}%
              </span>
              <span className='text-xs text-muted-foreground'>{description}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
