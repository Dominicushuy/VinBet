// src/app/(main)/page.jsx

import Link from 'next/link'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { DollarSign, Gamepad, Trophy, Users, CreditCard, Clock, ArrowRight, Star, Zap, Clock3 } from 'lucide-react'

import { GameCardShowcase } from '@/components/home/GameCardShowcase'
import { WinnersList } from '@/components/home/WinnersList'
import { StatsCounter } from '@/components/home/StatsCounter'
import { TestimonialSlider } from '@/components/home/TestimonialSlider'
import { JackpotCounter } from '@/components/home/JackpotCounter'
import { CTACard } from '@/components/home/CTACard'
import { getSupabaseServer } from '@/lib/supabase/server'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const metadata = {
  title: 'VinBet - Nền tảng cá cược trực tuyến hàng đầu Việt Nam',
  description:
    'Tham gia cá cược, trải nghiệm những ván chơi hấp dẫn và nhận thưởng tức thì tại VinBet. Jackpot lên đến hàng trăm triệu đồng!',
  keywords: 'vinbet, cá cược trực tuyến, casino online, cá cược Việt Nam, jackpot, đặt cược',
  openGraph: {
    title: 'VinBet - Nền tảng cá cược trực tuyến hàng đầu Việt Nam',
    description: 'Tham gia cá cược, trải nghiệm những ván chơi hấp dẫn và nhận thưởng tức thì tại VinBet',
    type: 'website',
    url: 'https://vinbet.vn',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'VinBet Gaming Platform'
      }
    ]
  }
}

export default async function HomePage() {
  try {
    const supabase = getSupabaseServer()

    // Lấy thống kê từ Database thực tế
    const { data: statsData, error: statsError } = await supabase.rpc('get_platform_statistics')
    if (statsError) console.error('Error loading statistics:', statsError)

    // Lấy danh sách người thắng gần đây
    const { data: recentWinners, error: winnersError } = await supabase
      .from('bets')
      .select(
        `
        id,
        amount,
        potential_win,
        created_at,
        profiles:profile_id(id, username, display_name, avatar_url),
        game_rounds:game_round_id(id, result)
      `
      )
      .eq('status', 'won')
      .order('created_at', { ascending: false })
      .limit(5)
    if (winnersError) console.error('Error loading winners:', winnersError)

    // Tính toán jackpot hiện tại
    const { data: jackpotData, error: jackpotError } = await supabase.rpc('calculate_current_jackpot')
    if (jackpotError) console.error('Error calculating jackpot:', jackpotError)
    const jackpotAmount = jackpotData?.jackpot_amount || 100000000

    // Lấy số liệu thống kê
    const userCount = statsData?.user_count || 5000
    const totalReward = statsData?.total_reward_paid || 50000000000
    const gameCount = statsData?.total_game_rounds || 10000
    const winRate = statsData?.win_rate || 95

    return (
      <div className='space-y-10 pb-10 -mt-6 -mx-6'>
        {/* Hero Section */}
        <section className='relative overflow-hidden bg-gradient-to-br from-primary/90 to-primary pt-20 pb-16 px-6'>
          <div className='absolute inset-0 bg-grid-white/5 bg-[size:16px_16px] opacity-30'></div>
          <div className='absolute inset-0 bg-gradient-to-t from-background via-transparent opacity-80'></div>

          <div className='relative z-10 max-w-screen-xl mx-auto'>
            <div className='flex flex-col md:flex-row gap-8 items-center'>
              <div className='space-y-4 md:w-1/2'>
                <Badge variant='outline' className='bg-white/10 text-primary-foreground border-white/20 py-1 px-4 mb-4'>
                  <Zap className='mr-1 h-3 w-3' />
                  Thưởng chào mừng 200%
                </Badge>

                <h1 className='h1 text-white text-3xl md:text-4xl lg:text-5xl font-bold'>
                  Cá cược thông minh, <span className='text-accent font-bold'>thắng lớn</span> cùng VinBet
                </h1>

                <p className='text-white/80 text-lg'>
                  Tham gia nền tảng cá cược hàng đầu Việt Nam với tỷ lệ thắng cao và rút tiền nhanh chóng
                </p>

                <div className='flex flex-wrap gap-4 pt-4'>
                  <Button size='lg' className='gap-2' asChild>
                    <Link href='/games'>
                      <Gamepad className='h-5 w-5' /> Tham gia ngay
                    </Link>
                  </Button>
                  <Button
                    size='lg'
                    variant='outline'
                    className='bg-white/10 border-white/20 text-white hover:bg-white/20'
                    asChild
                  >
                    <Link href='/about'>Tìm hiểu thêm</Link>
                  </Button>
                </div>

                <div className='flex flex-wrap gap-4 pt-2'>
                  <div className='flex items-center gap-2'>
                    <Users className='h-4 w-4 text-white/70' />
                    <span className='text-white/70 text-sm'>{userCount.toLocaleString()}+ người chơi</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Trophy className='h-4 w-4 text-white/70' />
                    <span className='text-white/70 text-sm'>{winRate}% tỷ lệ thắng</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Clock3 className='h-4 w-4 text-white/70' />
                    <span className='text-white/70 text-sm'>Rút tiền trong 24h</span>
                  </div>
                </div>
              </div>

              <div className='md:w-1/2 relative'>
                <div className='absolute -top-10 -left-10 w-40 h-40 bg-accent/30 rounded-full filter blur-3xl'></div>
                <div className='absolute -bottom-10 -right-10 w-40 h-40 bg-primary/30 rounded-full filter blur-3xl'></div>

                <Card className='bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden relative'>
                  <CardContent className='p-0'>
                    <Image
                      src='/images/hero-banner.webp'
                      alt='VinBet Games'
                      width={800}
                      height={400}
                      className='w-full h-auto'
                      priority
                    />
                    <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6'>
                      <JackpotCounter className='text-3xl font-bold text-accent mb-2' initialValue={jackpotAmount} />
                      <p className='text-white'>Jackpot đang chờ người chiến thắng!</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Counter */}
        <section className='max-w-screen-xl mx-auto px-6'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
            <StatsCounter
              icon={<Users className='h-6 w-6 text-primary' />}
              label='Người chơi'
              value={userCount}
              suffix='+'
            />
            <StatsCounter
              icon={<DollarSign className='h-6 w-6 text-primary' />}
              label='Tiền thưởng'
              value={totalReward}
              prefix='₫'
              isMonetary={true}
            />
            <StatsCounter
              icon={<Gamepad className='h-6 w-6 text-primary' />}
              label='Lượt chơi'
              value={gameCount}
              suffix='+'
            />
            <StatsCounter
              icon={<Trophy className='h-6 w-6 text-primary' />}
              label='Tỷ lệ thắng'
              value={winRate}
              suffix='%'
            />
          </div>
        </section>

        {/* Quick Actions */}
        <section className='max-w-screen-xl mx-auto px-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <CTACard
              title='Nạp tiền nhanh chóng'
              description='Nhiều phương thức thanh toán, nạp tiền trong vài giây'
              icon={<DollarSign className='h-10 w-10 text-primary' />}
              buttonText='Nạp ngay'
              buttonHref='/finance/deposit'
              buttonVariant='default'
              gradient='from-green-500/10 to-emerald-500/10'
            />

            <CTACard
              title='Bắt đầu chơi ngay'
              description='Tham gia các lượt chơi hấp dẫn với tỷ lệ thắng cao'
              icon={<Gamepad className='h-10 w-10 text-primary' />}
              buttonText='Chơi ngay'
              buttonHref='/games'
              buttonVariant='accent'
              gradient='from-blue-500/10 to-indigo-500/10'
            />

            <CTACard
              title='Rút tiền dễ dàng'
              description='Rút tiền về tài khoản ngân hàng trong 24 giờ'
              icon={<CreditCard className='h-10 w-10 text-primary' />}
              buttonText='Rút tiền'
              buttonHref='/finance/withdrawal'
              buttonVariant='outline'
              gradient='from-amber-500/10 to-orange-500/10'
            />
          </div>
        </section>

        {/* Game Showcase */}
        <section className='max-w-screen-xl mx-auto px-6'>
          <div className='flex flex-col md:flex-row items-start md:items-center justify-between mb-6'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight mb-1'>Trò chơi nổi bật</h2>
              <p className='text-muted-foreground'>Khám phá và tham gia các lượt chơi hấp dẫn</p>
            </div>

            <Button asChild variant='outline' className='mt-2 md:mt-0'>
              <Link href='/games'>
                Xem tất cả <ArrowRight className='ml-2 h-4 w-4' />
              </Link>
            </Button>
          </div>

          <Tabs defaultValue='active' className='w-full'>
            <div className='overflow-x-auto pb-2 -mx-1 px-1'>
              <TabsList className='grid min-w-[500px] w-full grid-cols-4 mb-6'>
                <TabsTrigger value='active'>
                  <Clock className='mr-2 h-4 w-4' /> <span className='hidden sm:inline'>Đang diễn ra</span>
                  <span className='sm:hidden'>Đang</span>
                </TabsTrigger>
                <TabsTrigger value='upcoming'>
                  <Clock3 className='mr-2 h-4 w-4' /> <span className='hidden sm:inline'>Sắp diễn ra</span>
                  <span className='sm:hidden'>Sắp tới</span>
                </TabsTrigger>
                <TabsTrigger value='popular'>
                  <Star className='mr-2 h-4 w-4' /> <span className='hidden sm:inline'>Phổ biến</span>
                  <span className='sm:hidden'>Hot</span>
                </TabsTrigger>
                <TabsTrigger value='jackpot'>
                  <Trophy className='mr-2 h-4 w-4' /> <span className='hidden sm:inline'>Jackpot</span>
                  <span className='sm:hidden'>Jackpot</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <ErrorBoundary fallback={<p className='text-center py-8'>Có lỗi xảy ra khi tải dữ liệu trò chơi.</p>}>
              <TabsContent value='active' className='mt-0'>
                <GameCardShowcase type='active' />
              </TabsContent>

              <TabsContent value='upcoming' className='mt-0'>
                <GameCardShowcase type='upcoming' />
              </TabsContent>

              <TabsContent value='popular' className='mt-0'>
                <GameCardShowcase type='popular' />
              </TabsContent>

              <TabsContent value='jackpot' className='mt-0'>
                <GameCardShowcase type='jackpot' />
              </TabsContent>
            </ErrorBoundary>
          </Tabs>
        </section>

        {/* Winners & Testimonials */}
        <section className='bg-muted/50 py-12 px-6'>
          <div className='max-w-screen-xl mx-auto'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
              <div>
                <h2 className='text-2xl font-bold tracking-tight mb-6 flex items-center'>
                  <Trophy className='mr-2 h-5 w-5 text-amber-500' />
                  Người thắng cuộc gần đây
                </h2>

                <WinnersList initialWinners={recentWinners || []} />

                <div className='mt-4 text-center'>
                  <Button variant='outline' asChild>
                    <Link href='/leaderboard'>
                      Xem thêm <ArrowRight className='ml-1 h-4 w-4' />
                    </Link>
                  </Button>
                </div>
              </div>

              <div>
                <h2 className='text-2xl font-bold tracking-tight mb-6 flex items-center'>
                  <Star className='mr-2 h-5 w-5 text-amber-500' />
                  Người chơi nói gì về chúng tôi
                </h2>

                <TestimonialSlider />
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className='max-w-screen-xl mx-auto px-6'>
          <Card className='w-full overflow-hidden border-primary/20'>
            <CardContent className='p-0'>
              <div className='bg-gradient-to-r from-primary/20 to-accent/20 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8'>
                <div className='md:w-2/3 space-y-4'>
                  <h2 className='text-2xl md:text-3xl font-bold'>Bắt đầu hành trình chiến thắng ngay hôm nay</h2>
                  <p className='text-muted-foreground'>
                    Đăng ký tài khoản VinBet để tham gia cá cược và nhận thưởng chào mừng lên đến 200%
                  </p>

                  <div className='flex flex-wrap gap-4 pt-2'>
                    <Button size='lg' className='gap-2' asChild>
                      <Link href='/register'>Đăng ký ngay</Link>
                    </Button>
                    <Button size='lg' variant='outline' asChild>
                      <Link href='/about'>Tìm hiểu thêm</Link>
                    </Button>
                  </div>
                </div>

                <div className='md:w-1/3 flex justify-center'>
                  <Image
                    src='/images/cta-illustration.webp'
                    alt='VinBet Rewards'
                    width={240}
                    height={240}
                    className='max-h-60 w-auto'
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    )
  } catch (error) {
    console.error('Error loading home page data:', error)
    // Fallback với các giá trị mặc định
    const jackpotAmount = 100000000
    const userCount = 5000
    const totalReward = 50000000000
    const gameCount = 10000
    const winRate = 95

    // Return component với các giá trị mặc định
    return (
      <div className='space-y-10 pb-10 -mt-6 -mx-6'>
        {/* Similar JSX structure with fallback values */}
        <section className='p-12 text-center'>
          <h2 className='text-2xl font-bold mb-4'>Dữ liệu đang được cập nhật</h2>
          <p className='text-muted-foreground mb-8'>Hệ thống đang tải dữ liệu, vui lòng tải lại trang sau giây lát</p>
          <Button>Tải lại trang</Button>
        </section>
      </div>
    )
  }
}
