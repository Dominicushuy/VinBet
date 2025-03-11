export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id
    const notificationId = params.id

    // Get notification detail
    const { data: notification, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .eq('profile_id', userId)
      .single()

    if (error) {
      console.error('Error fetching notification:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    // Get additional reference data if available
    let referenceData = null
    if (notification.reference_id) {
      // Try to get reference data based on notification type
      switch (notification.type) {
        case 'transaction': {
          const { data: transactionData } = await supabase
            .from('transactions')
            .select('*')
            .eq('id', notification.reference_id)
            .single()
          referenceData = transactionData
          break
        }
        case 'game': {
          const { data: gameData } = await supabase
            .from('game_rounds')
            .select('*')
            .eq('id', notification.reference_id)
            .single()
          referenceData = gameData
          break
        }
        // Add more types as needed
      }
    }

    return NextResponse.json({
      notification: {
        ...notification,
        reference_data: referenceData
      }
    })
  } catch (error) {
    console.error('Notification detail request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id
    const notificationId = params.id

    // Delete notification
    const { error } = await supabase.from('notifications').delete().eq('id', notificationId).eq('profile_id', userId)

    if (error) {
      console.error('Error deleting notification:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete notification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
