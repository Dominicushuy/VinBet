// src/components/profile/ProfileHeader.jsx
'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { AvatarUploader } from './AvatarUploader'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { DollarSign, Edit, ShieldCheck, Star } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export function ProfileHeader({ profile }) {
  const [showAvatarUploader, setShowAvatarUploader] = useState(false)

  // Get user initial for avatar fallback
  const getInitial = () => {
    if (profile?.display_name) return profile.display_name[0].toUpperCase()
    if (profile?.username) return profile.username[0].toUpperCase()
    return 'U'
  }

  return (
    <div className='flex flex-col md:flex-row items-center md:items-start gap-6 p-6 border rounded-xl bg-card relative overflow-hidden'>
      {/* Background pattern */}
      <div className='absolute top-0 right-0 w-full h-32 bg-gradient-to-r from-primary/10 to-primary/5 z-0' />

      {/* Avatar with upload trigger */}
      <div className='relative z-10'>
        <Avatar className='h-24 w-24 border-4 border-background'>
          <AvatarImage src={profile?.avatar_url} alt={profile?.display_name || profile?.username} />
          <AvatarFallback className='bg-primary text-primary-foreground text-2xl'>{getInitial()}</AvatarFallback>
        </Avatar>

        <Button
          variant='secondary'
          size='icon'
          className='absolute -bottom-2 -right-2 rounded-full w-8 h-8 shadow'
          onClick={() => setShowAvatarUploader(true)}
        >
          <Edit className='h-3.5 w-3.5' />
        </Button>

        <Dialog open={showAvatarUploader} onOpenChange={setShowAvatarUploader}>
          <DialogContent className='sm:max-w-md'>
            <AvatarUploader onSuccess={() => setShowAvatarUploader(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Profile info */}
      <div className='flex flex-col items-center md:items-start flex-1 z-10'>
        <div className='flex flex-col md:flex-row md:items-center gap-2'>
          <h2 className='text-2xl font-bold'>{profile?.display_name || profile?.username}</h2>

          {profile?.is_verified && (
            <Badge variant='outline' className='bg-green-500/10 text-green-600 border-green-200'>
              <ShieldCheck className='h-3 w-3 mr-1' /> Đã xác minh
            </Badge>
          )}

          {profile?.verification_level > 1 && (
            <Badge variant='outline' className='bg-amber-500/10 text-amber-600 border-amber-200'>
              <Star className='h-3 w-3 mr-1' /> VIP {profile.verification_level}
            </Badge>
          )}
        </div>

        <p className='text-muted-foreground text-sm mt-1'>@{profile?.username}</p>

        <div className='flex flex-col md:flex-row items-center gap-4 mt-4'>
          <div className='bg-primary/10 px-4 py-2 rounded-lg flex items-center gap-2'>
            <DollarSign className='h-5 w-5 text-primary' />
            <div>
              <p className='text-xs text-muted-foreground'>Số dư hiện tại</p>
              <p className='font-bold text-primary'>{formatCurrency(profile?.balance || 0)}</p>
            </div>
          </div>

          <div className='flex gap-2'>
            <Button asChild size='sm'>
              <a href='/finance/deposit'>Nạp tiền</a>
            </Button>
            <Button asChild variant='outline' size='sm'>
              <a href='/finance/withdrawal'>Rút tiền</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
