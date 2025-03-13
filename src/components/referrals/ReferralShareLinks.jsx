// src/components/referrals/ReferralShareLinks.jsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Facebook, Instagram, Mail, MessageCircle, Twitter, Loader2 } from 'lucide-react'
import { useReferralCodeQuery } from '@/hooks/queries/useReferralQueries'
import { toast } from 'react-hot-toast'

export function ReferralShareLinks() {
  const { data, isLoading, error } = useReferralCodeQuery()

  const shareText = data?.referralCode
    ? `Đăng ký VinBet với mã giới thiệu của tôi và nhận thưởng: ${data.referralCode}`
    : 'Đăng ký VinBet với mã giới thiệu của tôi và nhận thưởng'

  const shareUrl = data?.shareUrl || ''

  const handleShare = platform => {
    // Validate if sharing is possible
    if (!shareUrl) {
      toast.error('Không có liên kết để chia sẻ')
      return
    }

    let url = ''

    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(
          shareText
        )}`
        break
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(
          shareUrl
        )}`
        break
      case 'email':
        url = `mailto:?subject=${encodeURIComponent('Tham gia VinBet')}&body=${encodeURIComponent(
          `${shareText}\n\n${shareUrl}`
        )}`
        break
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
        break
      case 'messenger':
        // Sử dụng web share nếu không có App ID
        url = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(
          shareUrl
        )}&redirect_uri=${encodeURIComponent(window.location.href)}`
        break
      default:
        return
    }

    // Safely open share window
    try {
      const windowFeatures = 'width=600,height=400,resizable=yes,scrollbars=yes'
      const shareWindow = window.open(url, '_blank', windowFeatures)

      if (!shareWindow || shareWindow.closed || typeof shareWindow.closed === 'undefined') {
        // Popup blocked or not supported
        toast.error('Không thể mở cửa sổ chia sẻ. Vui lòng kiểm tra popup blocker.')
      }
    } catch (err) {
      // Fallback for browsers that don't support window.open
      toast.error('Không thể chia sẻ. Vui lòng thử phương thức khác.')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chia sẻ mã giới thiệu</CardTitle>
          <CardDescription>Chia sẻ với bạn bè qua mạng xã hội</CardDescription>
        </CardHeader>
        <CardContent className='flex justify-center p-6'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chia sẻ mã giới thiệu</CardTitle>
          <CardDescription>Chia sẻ với bạn bè qua mạng xã hội</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-center text-muted-foreground'>Không thể tải thông tin chia sẻ. Vui lòng thử lại sau.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chia sẻ mã giới thiệu</CardTitle>
        <CardDescription>Chia sẻ với bạn bè qua mạng xã hội</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex flex-wrap gap-3 justify-center'>
          <Button
            variant='outline'
            className='bg-[#1877F2] text-white hover:bg-[#1877F2]/90 hover:text-white'
            onClick={() => handleShare('facebook')}
            disabled={!shareUrl}
          >
            <Facebook className='mr-2 h-4 w-4' />
            Facebook
          </Button>

          <Button
            variant='outline'
            className='bg-[#1DA1F2] text-white hover:bg-[#1DA1F2]/90 hover:text-white'
            onClick={() => handleShare('twitter')}
            disabled={!shareUrl}
          >
            <Twitter className='mr-2 h-4 w-4' />
            Twitter
          </Button>

          <Button
            variant='outline'
            className='bg-[#0088CC] text-white hover:bg-[#0088CC]/90 hover:text-white'
            onClick={() => handleShare('telegram')}
            disabled={!shareUrl}
          >
            <MessageCircle className='mr-2 h-4 w-4' />
            Telegram
          </Button>

          <Button
            variant='outline'
            className='bg-[#E1306C] text-white hover:bg-[#E1306C]/90 hover:text-white'
            onClick={() => handleShare('messenger')}
            disabled={!shareUrl}
          >
            <Instagram className='mr-2 h-4 w-4' />
            Messenger
          </Button>

          <Button variant='outline' onClick={() => handleShare('email')} disabled={!shareUrl}>
            <Mail className='mr-2 h-4 w-4' />
            Email
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
