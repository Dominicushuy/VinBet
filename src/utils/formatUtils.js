// src/utils/formatUtils.js (cải tiến)
/**
 * Format số sang định dạng tiền tệ VND
 * @param {number} value - Giá trị cần format
 * @param {boolean} showSymbol - Có hiển thị ký hiệu tiền tệ không
 * @param {number} maximumFractionDigits - Số chữ số thập phân tối đa
 * @returns {string} Chuỗi đã được format
 */
export const formatCurrency = (value, showSymbol = true, maximumFractionDigits = 0) => {
  if (value === undefined || value === null) return showSymbol ? '0 ₫' : '0'

  try {
    return new Intl.NumberFormat('vi-VN', {
      style: showSymbol ? 'currency' : 'decimal',
      currency: 'VND',
      maximumFractionDigits
    }).format(value)
  } catch (error) {
    console.error('Currency format error:', error)
    return `${value} ${showSymbol ? '₫' : ''}`
  }
}

/**
 * Format số dạng compact (1K, 1M, v.v.)
 * @param {number} value - Giá trị cần format
 * @returns {string} Chuỗi đã được format
 */
export const formatCompact = value => {
  if (value === undefined || value === null) return '0'

  try {
    return new Intl.NumberFormat('vi-VN', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value)
  } catch (error) {
    console.error('Compact format error:', error)
    return String(value)
  }
}

/**
 * Format phần trăm
 * @param {number} value - Giá trị (đã là tỷ lệ phần trăm)
 * @param {number} fractionDigits - Số chữ số thập phân
 * @returns {string} Chuỗi đã được format
 */
export const formatPercent = (value, fractionDigits = 1) => {
  if (value === undefined || value === null) return '0%'

  try {
    return `${value.toFixed(fractionDigits)}%`
  } catch (error) {
    console.error('Percent format error:', error)
    return `${value}%`
  }
}

/**
 * Định dạng số lớn
 * @param {number} value - Giá trị cần format
 * @returns {string} Chuỗi đã được format
 */
export const formatNumber = value => {
  if (value === undefined || value === null) return '0'

  try {
    return new Intl.NumberFormat('vi-VN').format(value)
  } catch (error) {
    console.error('Number format error:', error)
    return String(value)
  }
}

/**
 * Format ngày giờ theo locale Việt Nam
 * @param {Date|string} date - Ngày cần format
 * @param {string} formatStr - Định dạng
 * @returns {string} Chuỗi đã được format
 */
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return 'N/A'

  try {
    const { format } = require('date-fns')
    const { vi } = require('date-fns/locale')
    return format(new Date(date), formatStr, { locale: vi })
  } catch (error) {
    console.error('Date format error:', error)
    return String(date)
  }
}

/**
 * Format loại giao dịch
 * @param {string} type - Loại giao dịch
 * @returns {string} Tên hiển thị
 */
export const formatTransactionType = type => {
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

/**
 * Format trạng thái giao dịch
 * @param {string} status - Trạng thái
 * @returns {string} Tên hiển thị
 */
export const formatTransactionStatus = status => {
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
