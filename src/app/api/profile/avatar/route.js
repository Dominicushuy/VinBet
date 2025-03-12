export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { handleApiError } from '@/utils/errorHandler'

// Hằng số cấu hình upload
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(request) {
  try {
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

    // Tạo tên file duy nhất
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`

    // Upload file lên Supabase Storage
    const { data, error } = await supabase.storage.from('user_avatars').upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    })

    if (error) {
      return handleApiError(error, 'Avatar upload failed')
    }

    // Lấy public URL của file
    const { data: publicUrlData } = supabase.storage.from('user_avatars').getPublicUrl(fileName)

    const avatarUrl = publicUrlData.publicUrl

    // Cập nhật avatar_url trong profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      return handleApiError(updateError, 'Error updating profile avatar')
    }

    return NextResponse.json({
      success: true,
      avatarUrl,
      message: 'Avatar uploaded successfully'
    })
  } catch (error) {
    return handleApiError(error, 'Avatar upload error')
  }
}
