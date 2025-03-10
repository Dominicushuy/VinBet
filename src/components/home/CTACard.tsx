// src/components/home/CTACard.tsx
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface CTACardProps {
  title: string
  description: string
  icon: React.ReactNode
  buttonText: string
  buttonHref: string
  buttonVariant?: 'default' | 'outline' | 'accent'
  gradient?: string
}

export function CTACard({
  title,
  description,
  icon,
  buttonText,
  buttonHref,
  buttonVariant = 'default',
  gradient = 'from-primary/10 to-primary/5',
}: CTACardProps) {
  return (
    <Card className='overflow-hidden transition-all duration-300 hover:shadow-md group'>
      <CardContent className={cn('p-6 bg-gradient-to-br', gradient)}>
        <div className='flex flex-col items-center text-center space-y-4'>
          <div className='p-3 bg-background rounded-full shadow-sm group-hover:scale-110 transition-transform'>
            {icon}
          </div>

          <h3 className='text-lg font-semibold'>{title}</h3>
          <p className='text-muted-foreground text-sm'>{description}</p>

          <Button
            asChild
            variant={buttonVariant as any}
            className='mt-2 w-full'>
            <Link href={buttonHref}>{buttonText}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
