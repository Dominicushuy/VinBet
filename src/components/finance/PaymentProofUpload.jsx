// src/components/finance/PaymentProofUpload.jsx - Enhanced
'use client'

import { useState, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { Upload, X, Image, CheckCircle, Loader2, Info, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useUploadPaymentProofMutation } from '@/hooks/queries/useFinanceQueries'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function PaymentProofUpload({ requestId, onUploadComplete }) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [preview, setPreview] = useState(null)
  const [isUploaded, setIsUploaded] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const { isLoading, mutateAsync } = useUploadPaymentProofMutation()

  // Xử lý khi chọn file
  const handleFileChange = e => {
    const file = e.target.files?.[0]
    processFile(file)
  }

  // Xử lý file drag & drop
  const processFile = file => {
    if (!file) return

    // Kiểm tra kiểu file
    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ chấp nhận file ảnh')
      return
    }

    // Kiểm tra kích thước file (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 2MB')
      return
    }

    // Tạo preview
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Upload file
    uploadProof(file)
  }

  // Upload bằng chứng thanh toán
  const uploadProof = async file => {
    try {
      setUploadProgress(0)
      setIsUploaded(false)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 300)

      await mutateAsync({
        requestId,
        file
      })

      clearInterval(progressInterval)
      setUploadProgress(100)
      setIsUploaded(true)

      if (onUploadComplete) {
        setTimeout(() => {
          onUploadComplete()
        }, 1000)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadProgress(0)
      toast.error('Không thể tải lên bằng chứng thanh toán. Vui lòng thử lại.')
    }
  }

  // Xóa preview
  const clearPreview = () => {
    setPreview(null)
    setIsUploaded(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Xử lý drag events
  const handleDragOver = e => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = e => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = e => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    processFile(file)
  }

  return (
    <div className='space-y-4'>
      <Alert variant='default' className='bg-blue-50 text-blue-800 border-blue-200 mb-4'>
        <Info className='h-4 w-4' />
        <AlertDescription className='text-sm'>
          Tải lên ảnh chụp màn hình hoặc biên lai xác nhận giao dịch chuyển khoản đã hoàn thành.
        </AlertDescription>
      </Alert>

      <div className='flex flex-col items-center justify-center gap-4'>
        {preview ? (
          <div className='relative w-full max-w-md'>
            <img src={preview} alt='Payment proof' className='w-full rounded-lg border object-cover' />
            {isUploaded && (
              <div className='absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg'>
                <CheckCircle className='h-16 w-16 text-green-500' />
              </div>
            )}
          </div>
        ) : (
          <div
            className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer ${
              isDragging ? 'border-primary bg-primary/5' : 'bg-muted/30 hover:bg-muted/50'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Image className='h-10 w-10 text-muted-foreground mb-2' />
            <p className='text-sm text-muted-foreground'>
              Kéo và thả ảnh vào đây hoặc <span className='text-primary font-medium'>chọn file</span>
            </p>
            <p className='text-xs text-muted-foreground mt-1'>(PNG, JPG, JPEG tối đa 2MB)</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={handleFileChange}
          disabled={isLoading}
        />

        {isLoading && (
          <div className='w-full max-w-md space-y-2'>
            <Progress value={uploadProgress} className='h-2 w-full' />
            <p className='text-center text-sm text-muted-foreground'>Đang tải lên... {uploadProgress}%</p>
          </div>
        )}

        {preview && !isLoading && (
          <div className='flex items-center gap-2'>
            {!isUploaded && (
              <Button
                size='sm'
                onClick={() => {
                  const file = fileInputRef.current?.files?.[0]
                  if (file) {
                    uploadProof(file)
                  }
                }}
                disabled={!fileInputRef.current?.files?.[0]}
              >
                <Upload className='mr-2 h-4 w-4' />
                Tải lên lại
              </Button>
            )}
            <Button size='sm' variant='outline' onClick={clearPreview}>
              <X className='mr-2 h-4 w-4' />
              Hủy
            </Button>
          </div>
        )}

        {!preview && !isLoading && (
          <Button variant='outline' onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
            <Upload className='mr-2 h-4 w-4' />
            Tải lên bằng chứng thanh toán
          </Button>
        )}
      </div>

      {!isUploaded && (
        <Alert variant='destructive' className='mt-4'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Yêu cầu nạp tiền sẽ không được xử lý cho đến khi bạn tải lên bằng chứng thanh toán.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
