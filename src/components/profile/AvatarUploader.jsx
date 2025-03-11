// src/components/profile/AvatarUploader.jsx
'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import Cropper from 'react-easy-crop'
import { useUploadAvatarMutation } from '@/hooks/queries/useProfileQueries'
import { toast } from 'react-hot-toast'
import { Loader2, UploadCloud, ZoomIn } from 'lucide-react'
import { DialogTitle, DialogDescription } from '@/components/ui/dialog'

export function AvatarUploader({ onSuccess }) {
  const [image, setImage] = useState(null)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const uploadMutation = useUploadAvatarMutation()

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleFileChange = e => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const reader = new FileReader()

      reader.addEventListener('load', () => {
        setImage(reader.result)
      })

      reader.readAsDataURL(file)
    }
  }

  const createImage = url => {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', error => reject(error))
      image.src = url
    })
  }

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    )

    return new Promise(resolve => {
      canvas.toBlob(blob => {
        resolve(blob)
      }, 'image/jpeg')
    })
  }

  const uploadAvatar = async () => {
    if (!image || !croppedAreaPixels) return

    try {
      setIsUploading(true)

      const croppedImage = await getCroppedImg(image, croppedAreaPixels)

      // Create file from blob
      const file = new File([croppedImage], 'avatar.jpg', {
        type: 'image/jpeg'
      })

      // Create form data
      const formData = new FormData()
      formData.append('avatar', file)

      await uploadMutation.mutateAsync(formData)

      toast.success('Cập nhật ảnh đại diện thành công')
      onSuccess?.()
    } catch (error) {
      toast.error(error.message || 'Cập nhật ảnh đại diện thất bại')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className='space-y-6'>
      <div>
        <DialogTitle>Cập nhật ảnh đại diện</DialogTitle>
        <DialogDescription>Tải lên và điều chỉnh ảnh đại diện mới của bạn</DialogDescription>
      </div>

      <div className='space-y-4'>
        {image ? (
          <>
            <div className='relative w-full h-64 overflow-hidden rounded-lg'>
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label className='text-xs'>Phóng to</Label>
                <span className='text-xs text-muted-foreground'>{zoom.toFixed(1)}x</span>
              </div>
              <div className='flex items-center gap-2'>
                <ZoomIn className='h-4 w-4 text-muted-foreground' />
                <Slider value={[zoom]} min={1} max={3} step={0.1} onValueChange={vals => setZoom(vals[0])} />
              </div>
            </div>

            <div className='flex justify-between'>
              <Button type='button' variant='outline' onClick={() => setImage(null)}>
                Chọn lại
              </Button>
              <Button onClick={uploadAvatar} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Đang tải lên...
                  </>
                ) : (
                  'Lưu ảnh đại diện'
                )}
              </Button>
            </div>
          </>
        ) : (
          <div
            className='border-2 border-dashed border-muted-foreground/20 rounded-lg p-12 text-center hover:border-primary/50 transition-colors'
            onClick={() => fileInputRef.current?.click()}
          >
            <div className='flex flex-col items-center gap-2'>
              <UploadCloud className='h-10 w-10 text-muted-foreground' />
              <h3 className='font-medium'>Tải ảnh lên</h3>
              <p className='text-xs text-muted-foreground'>Kéo thả hoặc click để chọn ảnh</p>
              <p className='text-xs text-muted-foreground'>PNG, JPG (tối đa 2MB)</p>
              <Button type='button' variant='outline' size='sm' className='mt-2'>
                Chọn file
              </Button>
            </div>
            <input ref={fileInputRef} className='hidden' type='file' accept='image/*' onChange={handleFileChange} />
          </div>
        )}
      </div>
    </div>
  )
}
