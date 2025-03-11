// src/components/profile/AccountStatus.jsx
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Shield, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export function AccountStatus({ profile }) {
  // Calculate verification progress
  const verificationSteps = [
    { id: 'email', label: 'Email', completed: true }, // Always completed as registration requires email
    { id: 'phone', label: 'Số điện thoại', completed: !!profile?.phone_number },
    {
      id: 'kyc',
      label: 'Xác minh danh tính',
      completed: !!profile?.is_verified
    }
  ]

  const completedSteps = verificationSteps.filter(step => step.completed).length
  const progressPercentage = (completedSteps / verificationSteps.length) * 100

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-md flex items-center'>
          <Shield className='mr-2 h-4 w-4 text-primary' />
          Trạng thái tài khoản
        </CardTitle>
      </CardHeader>

      <CardContent className='pb-3'>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Mức độ xác minh</span>
              <span className='font-medium'>
                {completedSteps}/{verificationSteps.length}
              </span>
            </div>
            <Progress value={progressPercentage} className='h-2' />
          </div>

          <div className='space-y-2'>
            {verificationSteps.map(step => (
              <div key={step.id} className='flex items-center justify-between text-sm'>
                <span>{step.label}</span>
                {step.completed ? (
                  <CheckCircle className='h-4 w-4 text-green-500' />
                ) : (
                  <AlertCircle className='h-4 w-4 text-amber-500' />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className='pt-0'>
        {!profile?.is_verified && (
          <Button asChild variant='outline' size='sm' className='w-full'>
            <Link href='/profile/verify'>Hoàn tất xác minh</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
