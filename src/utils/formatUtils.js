// src/utils/formatUtils.js

/**
 * Format số sang định dạng tiền tệ VND
 * @param {number} value - Giá trị cần format
 * @param {boolean} showSymbol - Có hiển thị ký hiệu tiền tệ không
 * @param {number} maximumFractionDigits - Số chữ số thập phân tối đa
 * @returns {string} Chuỗi đã được format
 */
export const formatCurrency = (value, showSymbol = true, maximumFractionDigits = 0) => {
  if (value === undefined || value === null) return '0 ₫'

  try {
    return new Intl.NumberFormat('vi-VN', {
      style: showSymbol ? 'currency' : 'decimal',
      currency: 'VND',
      maximumFractionDigits
    }).format(value)
  } catch (error) {
    console.error('Currency format error:', error)
    return `${value} ₫`
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
