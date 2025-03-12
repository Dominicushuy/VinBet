export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { handleApiError } from '@/utils/errorHandler'

export async function GET(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check session
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
      return handleApiError(error, 'Error fetching notification')
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
      }
    }

    return NextResponse.json({
      notification: {
        ...notification,
        reference_data: referenceData
      }
    })
  } catch (error) {
    return handleApiError(error, 'Notification detail request error')
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id
    const notificationId = params.id

    // Delete notification
    const { error } = await supabase.from('notifications').delete().eq('id', notificationId).eq('profile_id', userId)

    if (error) {
      return handleApiError(error, 'Error deleting notification')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'Delete notification error')
  }
}
