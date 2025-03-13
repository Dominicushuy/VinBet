// src/components/finance/deposit-steps/Step2PaymentInfo.jsx
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Alert, AlertCircle, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Copy, QrCode, ArrowLeft, ArrowRight } from 'lucide-react'
import { PaymentProofUpload } from '@/components/finance/PaymentProofUpload'
import { toast } from 'react-hot-toast'
import { formatCurrency } from '@/utils/formatUtils'

export function Step2PaymentInfo({
  selectedMethod,
  selectedAccount,
  setSelectedAccount,
  watchAmount,
  transferCode,
  getSelectedMethodDetails,
  getSelectedAccount,
  requestId,
  onPrev,
  onNext,
  onUploadComplete
}) {
  // Copy to clipboard
  const copyToClipboard = (text, successMessage = 'Đã sao chép vào clipboard') => {
    navigator.clipboard.writeText(text)
    toast.success(successMessage)
  }

  // Get instruction based on payment method
  const getPaymentInstructions = () => {
    const method = getSelectedMethodDetails()
    if (!method) return null

    const account = getSelectedAccount()
    if (!account) return null

    switch (method.id) {
      case 'bank_transfer': {
        const bankAccount = account
        return (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <Label>Ngân hàng:</Label>
                <div className='flex items-center'>
                  <span className='font-medium'>{bankAccount.bank_name}</span>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 ml-1'
                    onClick={() => copyToClipboard(bankAccount.bank_name)}
                  >
                    <Copy className='h-3 w-3' />
                  </Button>
                </div>
              </div>

              <div className='flex justify-between'>
                <Label>Số tài khoản:</Label>
                <div className='flex items-center'>
                  <span className='font-medium'>{bankAccount.account_number}</span>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 ml-1'
                    onClick={() => copyToClipboard(bankAccount.account_number)}
                  >
                    <Copy className='h-3 w-3' />
                  </Button>
                </div>
              </div>

              <div className='flex justify-between'>
                <Label>Tên tài khoản:</Label>
                <div className='flex items-center'>
                  <span className='font-medium'>{bankAccount.account_name}</span>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 ml-1'
                    onClick={() => copyToClipboard(bankAccount.account_name)}
                  >
                    <Copy className='h-3 w-3' />
                  </Button>
                </div>
              </div>

              {bankAccount.branch && (
                <div className='flex justify-between'>
                  <Label>Chi nhánh:</Label>
                  <div className='flex items-center'>
                    <span className='font-medium'>{bankAccount.branch}</span>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-6 w-6 ml-1'
                      onClick={() => bankAccount.branch && copyToClipboard(bankAccount.branch)}
                    >
                      <Copy className='h-3 w-3' />
                    </Button>
                  </div>
                </div>
              )}

              <div className='flex justify-between'>
                <Label>Số tiền:</Label>
                <div className='flex items-center'>
                  <span className='font-medium text-primary'>{formatCurrency(watchAmount)}</span>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 ml-1'
                    onClick={() => copyToClipboard(watchAmount.toString())}
                  >
                    <Copy className='h-3 w-3' />
                  </Button>
                </div>
              </div>

              <div className='flex justify-between'>
                <Label>Nội dung chuyển khoản:</Label>
                <div className='flex items-center'>
                  <code className='bg-muted px-1 py-0.5 rounded text-sm font-medium'>{transferCode}</code>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 ml-1'
                    onClick={() => copyToClipboard(transferCode)}
                  >
                    <Copy className='h-3 w-3' />
                  </Button>
                </div>
              </div>
            </div>

            <Alert variant='destructive' className='bg-red-50 text-red-800 border-red-200'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Quan trọng</AlertTitle>
              <AlertDescription>
                Bạn phải ghi chính xác nội dung chuyển khoản <strong>{transferCode}</strong>. Nếu không, hệ thống sẽ
                không ghi nhận giao dịch của bạn.
              </AlertDescription>
            </Alert>
          </div>
        )
      }

      case 'momo':
      case 'zalopay': {
        const eWalletAccount = account
        return (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <Label>Số điện thoại:</Label>
                <div className='flex items-center'>
                  <span className='font-medium'>{eWalletAccount.phone}</span>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 ml-1'
                    onClick={() => copyToClipboard(eWalletAccount.phone)}
                  >
                    <Copy className='h-3 w-3' />
                  </Button>
                </div>
              </div>

              <div className='flex justify-between'>
                <Label>Tên người nhận:</Label>
                <div className='flex items-center'>
                  <span className='font-medium'>{eWalletAccount.name}</span>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 ml-1'
                    onClick={() => copyToClipboard(eWalletAccount.name)}
                  >
                    <Copy className='h-3 w-3' />
                  </Button>
                </div>
              </div>

              <div className='flex justify-between'>
                <Label>Số tiền:</Label>
                <div className='flex items-center'>
                  <span className='font-medium text-primary'>{formatCurrency(watchAmount)}</span>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 ml-1'
                    onClick={() => copyToClipboard(watchAmount.toString())}
                  >
                    <Copy className='h-3 w-3' />
                  </Button>
                </div>
              </div>

              <div className='flex justify-between'>
                <Label>Nội dung chuyển khoản:</Label>
                <div className='flex items-center'>
                  <code className='bg-muted px-1 py-0.5 rounded text-sm font-medium'>{transferCode}</code>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 ml-1'
                    onClick={() => copyToClipboard(transferCode)}
                  >
                    <Copy className='h-3 w-3' />
                  </Button>
                </div>
              </div>
            </div>

            <div className='flex flex-col items-center space-y-2'>
              <div className='w-48 h-48 bg-white p-2 border rounded flex items-center justify-center'>
                <QrCode className='h-32 w-32 text-primary' />
              </div>
              <Button size='sm' variant='outline'>
                <QrCode className='h-4 w-4 mr-2' /> Tải mã QR
              </Button>
            </div>

            <Alert variant='destructive' className='bg-red-50 text-red-800 border-red-200'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Quan trọng</AlertTitle>
              <AlertDescription>
                Bạn phải ghi chính xác nội dung chuyển khoản <strong>{transferCode}</strong>. Nếu không, hệ thống sẽ
                không ghi nhận giao dịch của bạn.
              </AlertDescription>
            </Alert>
          </div>
        )
      }

      default:
        return null
    }
  }

  const method = getSelectedMethodDetails()

  return (
    <div className='space-y-6'>
      <div className='rounded-lg border bg-card p-6'>
        <h3 className='text-lg font-semibold mb-4'>Thông tin chuyển khoản</h3>

        {method && method.accounts.length > 1 ? (
          <Tabs
            value={selectedAccount.toString()}
            onValueChange={value => setSelectedAccount(parseInt(value))}
            className='mb-6'
          >
            <TabsList className='grid w-full grid-cols-2'>
              {method.accounts.map((account, index) => (
                <TabsTrigger key={index} value={index.toString()} className='text-xs'>
                  {selectedMethod === 'bank_transfer' ? account.bank_name : `Tài khoản ${index + 1}`}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={selectedAccount.toString()}>{getPaymentInstructions()}</TabsContent>
          </Tabs>
        ) : (
          getPaymentInstructions()
        )}
      </div>

      <div className='rounded-lg border bg-card p-6'>
        <h3 className='text-lg font-semibold mb-4'>Tải lên bằng chứng thanh toán</h3>
        {requestId && <PaymentProofUpload requestId={requestId} onUploadComplete={onUploadComplete} />}
      </div>

      <div className='pt-4 flex justify-between'>
        <Button variant='outline' onClick={onPrev}>
          <ArrowLeft className='mr-2 h-4 w-4' /> Quay lại
        </Button>
        <Button onClick={onNext}>
          Tiếp tục <ArrowRight className='ml-2 h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}
