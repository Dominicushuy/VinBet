export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { handleApiError } from '@/utils/errorHandler'

// Helper functions
function getTransactionTypeName(type) {
  switch (type) {
    case 'deposit':
      return 'Nạp tiền'
    case 'withdrawal':
      return 'Rút tiền'
    case 'bet':
      return 'Đặt cược'
    case 'win':
      return 'Thắng cược'
    case 'referral_reward':
      return 'Thưởng giới thiệu'
    default:
      return type
  }
}

function getStatusName(status) {
  switch (status) {
    case 'completed':
      return 'Hoàn thành'
    case 'pending':
      return 'Đang xử lý'
    case 'failed':
      return 'Thất bại'
    case 'cancelled':
      return 'Đã hủy'
    default:
      return status
  }
}

function formatAmountWithPrefix(amount, type) {
  const isPositive = type === 'deposit' || type === 'win' || type === 'referral_reward'
  const prefix = isPositive ? '+' : '-'
  return `${prefix} ${amount.toLocaleString('vi-VN')} VND`
}

export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Parse query parameters
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const status = url.searchParams.get('status')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    const minAmount = url.searchParams.get('minAmount')
    const maxAmount = url.searchParams.get('maxAmount')
    const exportFormat = url.searchParams.get('format') || 'csv'

    // Build query
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })

    // Apply filters
    if (type) query = query.eq('type', type)
    if (status) query = query.eq('status', status)
    if (startDate) query = query.gte('created_at', new Date(startDate).toISOString())
    if (endDate) query = query.lte('created_at', new Date(endDate).toISOString())
    if (minAmount) query = query.gte('amount', parseFloat(minAmount))
    if (maxAmount) query = query.lte('amount', parseFloat(maxAmount))

    // Execute query
    const { data: transactions, error } = await query

    if (error) {
      return handleApiError(error, 'Lỗi khi lấy giao dịch để xuất')
    }

    // Get user info
    const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', userId).single()

    // Transform data for export
    const exportData =
      transactions?.map(transaction => ({
        'Mã giao dịch': transaction.id,
        'Thời gian': format(new Date(transaction.created_at), 'HH:mm:ss, dd/MM/yyyy', { locale: vi }),
        'Loại giao dịch': getTransactionTypeName(transaction.type),
        'Số tiền': formatAmountWithPrefix(transaction.amount, transaction.type),
        'Trạng thái': getStatusName(transaction.status),
        'Mô tả': transaction.description || '',
        'Mã tham chiếu': transaction.reference_id || ''
      })) || []

    // Export based on format
    switch (exportFormat) {
      case 'csv':
        return exportToCSV(exportData)
      case 'excel':
        return exportToExcel(exportData, userProfile)
      case 'pdf':
        return exportToPDF(exportData, userProfile)
      default:
        return NextResponse.json({ error: 'Unsupported format' }, { status: 400 })
    }
  } catch (error) {
    return handleApiError(error, 'Lỗi khi xuất giao dịch')
  }
}

// Export to CSV
async function exportToCSV(data) {
  const header = Object.keys(data[0]).join(',') + '\n'
  const rows = data
    .map(row =>
      Object.values(row)
        .map(value => `"${value}"`)
        .join(',')
    )
    .join('\n')
  const csv = header + rows

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="vinbet-giao-dich-${format(new Date(), 'dd-MM-yyyy', {
        locale: vi
      })}.csv"`
    }
  })
}

// Export to Excel
async function exportToExcel(data, userProfile) {
  const worksheet = XLSX.utils.json_to_sheet(data)

  XLSX.utils.sheet_add_aoa(
    worksheet,
    [
      [`LỊCH SỬ GIAO DỊCH - ${userProfile?.display_name || userProfile?.username || 'Người dùng'}`],
      [`Xuất ngày: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}`],
      ['']
    ],
    { origin: 'A1' }
  )

  const colWidths = [{ wch: 36 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 36 }]
  worksheet['!cols'] = colWidths

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Lịch sử giao dịch')

  const excelBuffer = XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx'
  })

  return new NextResponse(excelBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="vinbet-giao-dich-${format(new Date(), 'dd-MM-yyyy', {
        locale: vi
      })}.xlsx"`
    }
  })
}

// Export to PDF
async function exportToPDF(data, userProfile) {
  const pdfDoc = await PDFDocument.create()
  let page = pdfDoc.addPage([841.89, 595.28]) // A4 landscape

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const fontSize = 10
  const headerFontSize = 12
  const titleFontSize = 16

  page.drawText('LỊCH SỬ GIAO DỊCH', {
    x: 50,
    y: 550,
    size: titleFontSize,
    font: boldFont
  })

  page.drawText(`Tên người dùng: ${userProfile?.display_name || userProfile?.username || 'Người dùng'}`, {
    x: 50,
    y: 530,
    size: headerFontSize,
    font: font
  })

  page.drawText(`Xuất ngày: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}`, {
    x: 50,
    y: 510,
    size: headerFontSize,
    font: font
  })

  const headers = ['Mã giao dịch', 'Thời gian', 'Loại giao dịch', 'Số tiền', 'Trạng thái', 'Mô tả']
  const colWidths = [150, 100, 100, 100, 100, 200]
  const startX = 50
  let startY = 470

  for (let i = 0; i < headers.length; i++) {
    page.drawRectangle({
      x: startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
      y: startY - 20,
      width: colWidths[i],
      height: 20,
      color: rgb(0.9, 0.9, 0.9),
      borderColor: rgb(0, 0, 0),
      borderWidth: 1
    })

    page.drawText(headers[i], {
      x: startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + 5,
      y: startY - 15,
      size: headerFontSize,
      font: boldFont
    })
  }

  startY -= 20
  const rowHeight = 30

  for (let i = 0; i < Math.min(data.length, 15); i++) {
    if (startY - rowHeight < 50) {
      startY = 550
      page.drawText(`Trang ${pdfDoc.getPageCount()}`, {
        x: 750,
        y: 30,
        size: fontSize,
        font: font
      })

      const newPage = pdfDoc.addPage([841.89, 595.28])
      page = newPage

      for (let j = 0; j < headers.length; j++) {
        page.drawRectangle({
          x: startX + colWidths.slice(0, j).reduce((a, b) => a + b, 0),
          y: startY - 20,
          width: colWidths[j],
          height: 20,
          color: rgb(0.9, 0.9, 0.9),
          borderColor: rgb(0, 0, 0),
          borderWidth: 1
        })

        page.drawText(headers[j], {
          x: startX + colWidths.slice(0, j).reduce((a, b) => a + b, 0) + 5,
          y: startY - 15,
          size: headerFontSize,
          font: boldFont
        })
      }

      startY -= 20
    }

    for (let j = 0; j < headers.length; j++) {
      page.drawRectangle({
        x: startX + colWidths.slice(0, j).reduce((a, b) => a + b, 0),
        y: startY - rowHeight,
        width: colWidths[j],
        height: rowHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1
      })

      let value = data[i][headers[j]]
      if (value && value.length > 20) {
        value = value.substring(0, 20) + '...'
      }

      page.drawText(value || '', {
        x: startX + colWidths.slice(0, j).reduce((a, b) => a + b, 0) + 5,
        y: startY - 15,
        size: fontSize,
        font: font
      })
    }

    startY -= rowHeight
  }

  page.drawText(`Trang ${pdfDoc.getPageCount()} / ${Math.ceil(data.length / 15)}`, {
    x: 750,
    y: 30,
    size: fontSize,
    font: font
  })

  page.drawText('© VinBet. Tài liệu này được tạo tự động.', {
    x: 50,
    y: 30,
    size: fontSize,
    font: font
  })

  const pdfBytes = await pdfDoc.save()

  return new NextResponse(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="vinbet-giao-dich-${format(new Date(), 'dd-MM-yyyy', {
        locale: vi
      })}.pdf"`
    }
  })
}
