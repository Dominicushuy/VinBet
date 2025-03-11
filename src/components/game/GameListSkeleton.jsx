import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function GameListSkeleton({ count = 6 }) {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader className='pb-2'>
            <div className='flex justify-between items-start'>
              <Skeleton className='h-6 w-[120px]' />
              <Skeleton className='h-6 w-[80px]' />
            </div>
          </CardHeader>
          <CardContent className='pb-2 space-y-4'>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-4 w-4 rounded-full' />
              <Skeleton className='h-4 w-[140px]' />
            </div>
            <div className='grid grid-cols-2 gap-2'>
              <div className='space-y-1'>
                <Skeleton className='h-3 w-16' />
                <Skeleton className='h-4 w-24' />
              </div>
              <div className='space-y-1'>
                <Skeleton className='h-3 w-16' />
                <Skeleton className='h-4 w-24' />
              </div>
            </div>
          </CardContent>
          <CardFooter className='pt-2'>
            <Skeleton className='h-9 w-full' />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
