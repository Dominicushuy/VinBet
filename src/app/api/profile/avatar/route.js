export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { handleApiError } from '@/utils/errorHandler'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Hằng số cấu hình upload
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(request) {
  try {
    // Sử dụng client thông thường để xác thực người dùng
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Lấy form data từ request
    const formData = await request.formData()
    const file = formData.get('avatar')

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Kiểm tra kiểu file
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type',
          allowedTypes: ALLOWED_FILE_TYPES
        },
        { status: 400 }
      )
    }

    // Kiểm tra kích thước file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: 'File size must be less than 2MB',
          maxSize: MAX_FILE_SIZE
        },
        { status: 400 }
      )
    }

    // In thông tin file để debug
    console.log('File info:', {
      name: file.name,
      type: file.type,
      size: file.size
    })

    // Tạo tên file duy nhất
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`

    console.log('Attempting to upload to bucket: user_avatars with filename:', fileName)

    // Kiểm tra xem bucket tồn tại chưa
    const { data: bucketList } = await supabaseAdmin.storage.listBuckets()
    const userAvatarsBucketExists = bucketList.some(b => b.name === 'user_avatars')

    // Tạo bucket nếu chưa tồn tại
    if (!userAvatarsBucketExists) {
      console.log('Bucket "user_avatars" does not exist. Creating...')
      const { error: createBucketError } = await supabaseAdmin.storage.createBucket('user_avatars', {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE
      })

      if (createBucketError) {
        console.error('Failed to create bucket:', createBucketError)
        return NextResponse.json({ error: 'Storage configuration error' }, { status: 500 })
      }
    }

    // Upload file lên Supabase Storage sử dụng admin client để bỏ qua RLS
    let uploadResult
    try {
      uploadResult = await supabaseAdmin.storage.from('user_avatars').upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })
    } catch (uploadError) {
      console.error('Upload error details:', uploadError)
      return NextResponse.json(
        {
          success: false,
          error: 'Avatar upload failed',
          details: uploadError.message
        },
        { status: 500 }
      )
    }

    const { data, error } = uploadResult

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Avatar upload failed',
          details: error.message
        },
        { status: 500 }
      )
    }

    // Lấy public URL của file
    const { data: publicUrlData } = supabaseAdmin.storage.from('user_avatars').getPublicUrl(fileName)

    const avatarUrl = publicUrlData.publicUrl

    // Cập nhật avatar_url trong profile sử dụng admin client
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return handleApiError(updateError, 'Error updating profile avatar')
    }

    return NextResponse.json({
      success: true,
      avatarUrl,
      message: 'Avatar uploaded successfully'
    })
  } catch (error) {
    console.error('Unexpected error in avatar upload:', error)
    return handleApiError(error, 'Avatar upload error')
  }
}
