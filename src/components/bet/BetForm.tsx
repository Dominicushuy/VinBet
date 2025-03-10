'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2,
  AlertCircle,
  DollarSign,
  CreditCard,
  HelpCircle,
} from 'lucide-react'
import { toast } from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { BetConfirmation } from './BetConfirmation'
import { BetSuccess } from './BetSuccess'
import { usePlaceBetMutation } from '@/hooks/queries/useBetQueries'
import { GameRound, Bet } from '@/types/database'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

// Validation schema for the bet form
const betFormSchema = z.object({
  chosenNumber: z.string().min(1, 'Vui lòng chọn số'),
  amount: z
    .number({
      required_error: 'Vui lòng nhập số tiền',
      invalid_type_error: 'Số tiền phải là số',
    })
    .min(10000, 'Số tiền cược tối thiểu là 10,000đ')
    .max(10000000, 'Số tiền cược tối đa là 10,000,000đ'),
})

type BetFormValues = z.infer<typeof betFormSchema>

interface BetFormProps {
  gameRound: GameRound
  className?: string
}

export function BetForm({ gameRound, className }: BetFormProps) {
  const router = useRouter()
  const { profile, isLoading: authLoading } = useAuth()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successBet, setSuccessBet] = useState<Bet | null>(null)
  const [formValues, setFormValues] = useState<BetFormValues | null>(null)
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null)
  const [preferredTab, setPreferredTab] = useState<'quick' | 'custom'>('quick')

  // Place bet mutation
  const placeBetMutation = usePlaceBetMutation()

  // Predefined betting amounts
  const quickAmounts = [10000, 20000, 50000, 100000, 200000, 500000]

  // Numbers that can be bet on
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

  // Form setup
  const form = useForm<BetFormValues>({
    resolver: zodResolver(betFormSchema),
    defaultValues: {
      chosenNumber: '',
      amount: 10000,
    },
  })

  // Watch amount for potential win calculation
  const amount = form.watch('amount')

  // Calculate potential winnings (9x for this game)
  const calculatePotentialWin = (betAmount: number) => {
    return betAmount * 9
  }

  // Format money as VND
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  // Submit form handler
  function onSubmit(data: BetFormValues) {
    if (!profile) {
      toast.error('Vui lòng đăng nhập để đặt cược')
      return
    }

    if (profile.balance < data.amount) {
      toast.error('Số dư không đủ để đặt cược')
      return
    }

    setFormValues(data)
    setShowConfirmation(true)
  }

  // Confirm bet handler
  async function handleConfirmBet() {
    if (!formValues) return

    try {
      const result = await placeBetMutation.mutateAsync({
        gameRoundId: gameRound.id,
        chosenNumber: formValues.chosenNumber,
        amount: formValues.amount,
      })

      // Save success bet for display
      if (result.bet) {
        setSuccessBet(result.bet)
      }

      // Reset form and close confirmation dialog
      form.reset()
      setSelectedNumber(null)
      setShowConfirmation(false)
      setShowSuccess(true)

      // Refresh the page to show the new bet
      router.refresh()
    } catch (error) {
      console.error('Error placing bet:', error)
      setShowConfirmation(false)

      // Show error toast
      toast.error('Đặt cược thất bại. Vui lòng thử lại sau.')
    }
  }

  // Handle number selection
  const handleNumberSelect = (num: string) => {
    setSelectedNumber(num)
    form.setValue('chosenNumber', num)
  }

  // Handle quick amount selection
  const handleQuickAmountSelect = (amount: number) => {
    form.setValue('amount', amount)
  }

  // Check if game is active
  if (gameRound.status !== 'active') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <DollarSign className='mr-2 h-5 w-5 text-muted-foreground' />
            Đặt cược
          </CardTitle>
          <CardDescription>
            Lượt chơi này không còn nhận cược mới.
          </CardDescription>
        </CardHeader>
        <CardContent className='pt-4'>
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Không thể đặt cược</AlertTitle>
            <AlertDescription>
              {gameRound.status === 'scheduled'
                ? 'Lượt chơi chưa bắt đầu. Vui lòng quay lại sau.'
                : gameRound.status === 'completed'
                ? 'Lượt chơi đã kết thúc.'
                : 'Lượt chơi đã bị hủy.'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Check if user is logged in
  if (authLoading) {
    // Loading state for authentication
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Đặt cược</CardTitle>
          <CardDescription>Đang tải thông tin người dùng...</CardDescription>
        </CardHeader>
        <CardContent className='flex justify-center py-6'>
          <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Đặt cược</CardTitle>
          <CardDescription>Vui lòng đăng nhập để đặt cược</CardDescription>
        </CardHeader>
        <CardContent className='pt-4'>
          <Alert>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Yêu cầu đăng nhập</AlertTitle>
            <AlertDescription>
              Bạn cần đăng nhập để tham gia đặt cược vào lượt chơi này.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button className='w-full' asChild>
            <a href='/login'>Đăng nhập ngay</a>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <>
      <Card className={cn('relative overflow-hidden', className)}>
        {/* Decorative elements */}
        <div className='absolute top-0 right-0 w-40 h-40 rounded-full bg-primary/5 -mr-20 -mt-20'></div>
        <div className='absolute bottom-0 left-0 w-40 h-40 rounded-full bg-primary/5 -ml-20 -mb-20'></div>

        <CardHeader>
          <CardTitle className='flex items-center'>
            <DollarSign className='mr-2 h-5 w-5 text-primary' />
            Đặt cược
          </CardTitle>
          <CardDescription>
            Chọn số và nhập số tiền để đặt cược vào lượt chơi này
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              {/* Number selection */}
              <FormField
                control={form.control}
                name='chosenNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center justify-between'>
                      <span>Chọn số</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              type='button'
                              className='h-5 w-5'>
                              <HelpCircle className='h-3 w-3' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className='w-80 p-3'>
                            <p className='text-sm'>
                              Chọn 1 số từ 0-9. Nếu số này trùng với kết quả,
                              bạn sẽ thắng gấp 9 lần số tiền cược.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>

                    <div className='grid grid-cols-5 gap-2'>
                      <AnimatePresence mode='wait'>
                        {numbers.map((number) => (
                          <motion.div
                            key={number}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}>
                            <Button
                              type='button'
                              variant={
                                field.value === number ? 'default' : 'outline'
                              }
                              className={cn(
                                'h-14 text-xl font-bold w-full transition-all',
                                field.value === number
                                  ? 'bg-primary text-primary-foreground shadow-md'
                                  : 'hover:border-primary/50'
                              )}
                              onClick={() => handleNumberSelect(number)}>
                              {number}
                            </Button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount selection */}
              <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center justify-between'>
                      <span>Số tiền cược (₫)</span>
                      <Badge variant='outline' className='font-normal'>
                        Tối thiểu: 10,000₫
                      </Badge>
                    </FormLabel>

                    <Tabs
                      defaultValue='quick'
                      value={preferredTab}
                      onValueChange={(v) =>
                        setPreferredTab(v as 'quick' | 'custom')
                      }>
                      <TabsList className='grid grid-cols-2 mb-2'>
                        <TabsTrigger value='quick'>Nhanh</TabsTrigger>
                        <TabsTrigger value='custom'>Tùy chỉnh</TabsTrigger>
                      </TabsList>

                      <TabsContent value='quick' className='space-y-3'>
                        <div className='grid grid-cols-3 gap-2'>
                          {quickAmounts.map((quickAmount) => (
                            <Button
                              key={quickAmount}
                              type='button'
                              variant={
                                amount === quickAmount ? 'default' : 'outline'
                              }
                              className={
                                amount === quickAmount ? 'border-primary' : ''
                              }
                              onClick={() =>
                                handleQuickAmountSelect(quickAmount)
                              }>
                              {formatMoney(quickAmount).replace('₫', '')}
                            </Button>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value='custom'>
                        <FormControl>
                          <div className='relative'>
                            <DollarSign className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                            <Input
                              type='number'
                              min={10000}
                              max={10000000}
                              step={10000}
                              placeholder='Nhập số tiền cược'
                              className='pl-9'
                              {...field}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value)
                                field.onChange(isNaN(value) ? 0 : value)
                              }}
                            />
                          </div>
                        </FormControl>
                      </TabsContent>
                    </Tabs>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bet Summary */}
              <div className='bg-muted/50 rounded-lg p-4 space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm'>Số đã chọn:</span>
                  <span className='font-medium text-lg'>
                    {selectedNumber ? (
                      <Badge
                        variant='outline'
                        className='font-bold text-lg px-3'>
                        {selectedNumber}
                      </Badge>
                    ) : (
                      'Chưa chọn'
                    )}
                  </span>
                </div>

                <div className='flex justify-between items-center'>
                  <span className='text-sm'>Số tiền cược:</span>
                  <span className='font-medium'>
                    {formatMoney(amount || 0)}
                  </span>
                </div>

                <Separator />

                <div className='flex justify-between items-center'>
                  <div className='flex items-center gap-1'>
                    <span className='text-sm font-medium'>
                      Tiền thưởng tiềm năng:
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            type='button'
                            className='h-5 w-5'>
                            <HelpCircle className='h-3 w-3' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className='text-xs'>
                            Tiền thưởng nếu số bạn chọn trùng với kết quả (x9)
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className='font-bold text-lg text-primary'>
                    {formatMoney(calculatePotentialWin(amount || 0))}
                  </span>
                </div>
              </div>

              {/* User balance and action buttons */}
              <div className='flex items-center justify-between'>
                <div className='text-sm text-muted-foreground flex items-center'>
                  <CreditCard className='mr-2 h-4 w-4' />
                  Số dư hiện tại:{' '}
                  <span className='font-medium ml-1'>
                    {formatMoney(profile?.balance || 0)}
                  </span>
                </div>

                <div className='flex gap-2'>
                  {amount > (profile?.balance || 0) && (
                    <Button type='button' variant='outline' asChild>
                      <a href='/finance/deposit'>Nạp tiền</a>
                    </Button>
                  )}

                  <Button
                    type='submit'
                    disabled={
                      !selectedNumber ||
                      amount <= 0 ||
                      placeBetMutation.isLoading ||
                      amount > (profile?.balance || 0)
                    }>
                    {placeBetMutation.isLoading ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Đang xử lý...
                      </>
                    ) : (
                      'Đặt cược'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>

        {/* Warning message if insufficient balance */}
        {amount > (profile?.balance || 0) && (
          <CardFooter className='pt-0'>
            <Alert variant='destructive' className='mt-2'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                Số dư không đủ để đặt cược. Vui lòng nạp thêm tiền.
              </AlertDescription>
            </Alert>
          </CardFooter>
        )}
      </Card>

      {/* Bet confirmation dialog */}
      {showConfirmation && formValues && (
        <BetConfirmation
          open={showConfirmation}
          onOpenChange={setShowConfirmation}
          gameRound={gameRound}
          chosenNumber={formValues.chosenNumber}
          amount={formValues.amount}
          onConfirm={handleConfirmBet}
          isLoading={placeBetMutation.isLoading}
        />
      )}

      {/* Success notification */}
      {showSuccess && successBet && (
        <BetSuccess
          open={showSuccess}
          onOpenChange={setShowSuccess}
          bet={successBet}
        />
      )}
    </>
  )
}
