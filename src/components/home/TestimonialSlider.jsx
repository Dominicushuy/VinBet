'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function TestimonialSlider() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    // Trong ứng dụng thực, đây sẽ là một API call
    setLoading(true)
    setTimeout(() => {
      const mockTestimonials = [
        {
          id: '1',
          content:
            'VinBet là nền tảng tuyệt vời! Tôi đã thắng hơn 20 triệu đồng chỉ trong tuần đầu tiên tham gia. Rút tiền nhanh chóng và dễ dàng!',
          author: {
            name: 'Nguyễn Văn A',
            avatar: '/images/avatar-1.webp',
            title: 'Thành viên từ 2022'
          },
          rating: 5
        },
        {
          id: '2',
          content:
            'Giao diện dễ sử dụng và đội ngũ hỗ trợ làm việc chuyên nghiệp. Tôi rất hài lòng với trải nghiệm cá cược tại VinBet.',
          author: {
            name: 'Trần Thị B',
            avatar: '/images/avatar-2.webp',
            title: 'Thành viên VIP'
          },
          rating: 4
        },
        {
          id: '3',
          content:
            'Ban đầu tôi còn nghi ngờ, nhưng sau khi rút tiền thành công, tôi đã hoàn toàn tin tưởng VinBet. Đây là nền tảng cá cược uy tín!',
          author: {
            name: 'Lê Văn C',
            avatar: '/images/avatar-3.webp',
            title: 'Thành viên từ 2023'
          },
          rating: 5
        }
      ]

      setTestimonials(mockTestimonials)
      setLoading(false)
    }, 1500)
  }, [])

  const nextTestimonial = () => {
    setActiveIndex(prev => (prev === testimonials.length - 1 ? 0 : prev + 1))
  }

  const prevTestimonial = () => {
    setActiveIndex(prev => (prev === 0 ? testimonials.length - 1 : prev - 1))
  }

  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial()
    }, 5000)

    return () => clearInterval(interval)
  }, [testimonials.length])

  if (loading) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='space-y-4'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-4 w-1/2' />
            <div className='flex items-center pt-4 space-x-4'>
              <Skeleton className='h-12 w-12 rounded-full' />
              <div>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-3 w-32 mt-2' />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (testimonials.length === 0) {
    return null
  }

  const currentTestimonial = testimonials[activeIndex]

  return (
    <div className='relative'>
      <Card className='border-primary/20'>
        <CardContent className='p-6'>
          <div className='mb-4 flex'>
            {Array.from({ length: currentTestimonial.rating }).map((_, i) => (
              <Star key={i} className='h-5 w-5 fill-amber-500 text-amber-500' />
            ))}
            {Array.from({ length: 5 - currentTestimonial.rating }).map((_, i) => (
              <Star key={i} className='h-5 w-5 text-muted-foreground' />
            ))}
          </div>

          <blockquote className='text-lg italic mb-6'>&ldquo;{currentTestimonial.content}&rdquo;</blockquote>

          <div className='flex items-center space-x-4'>
            <Avatar>
              <AvatarImage src={currentTestimonial.author.avatar} alt={currentTestimonial.author.name} />
              <AvatarFallback>{currentTestimonial.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className='font-medium'>{currentTestimonial.author.name}</p>
              <p className='text-sm text-muted-foreground'>{currentTestimonial.author.title}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='absolute top-1/2 -translate-y-1/2 -left-4'>
        <Button
          variant='outline'
          size='icon'
          className='h-8 w-8 rounded-full bg-background shadow-md'
          onClick={prevTestimonial}
        >
          <ChevronLeft className='h-4 w-4' />
        </Button>
      </div>

      <div className='absolute top-1/2 -translate-y-1/2 -right-4'>
        <Button
          variant='outline'
          size='icon'
          className='h-8 w-8 rounded-full bg-background shadow-md'
          onClick={nextTestimonial}
        >
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>

      <div className='mt-4 flex justify-center space-x-2'>
        {testimonials.map((_, i) => (
          <button
            key={i}
            className={`h-2 w-2 rounded-full ${i === activeIndex ? 'bg-primary' : 'bg-muted'}`}
            onClick={() => setActiveIndex(i)}
          />
        ))}
      </div>
    </div>
  )
}
