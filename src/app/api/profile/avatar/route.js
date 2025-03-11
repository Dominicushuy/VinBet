import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

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
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Giới hạn kích thước file (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 2MB' }, { status: 400 })
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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Lấy public URL của file
    const { data: publicUrlData } = supabase.storage.from('user_avatars').getPublicUrl(fileName)

    const avatarUrl = publicUrlData.publicUrl

    // Cập nhật avatar_url trong profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, avatarUrl }, { status: 200 })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json({ error: 'Avatar upload failed' }, { status: 500 })
  }
}
