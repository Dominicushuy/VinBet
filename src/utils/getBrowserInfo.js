// Helper function để lấy thông tin trình duyệt
export function getBrowserInfo() {
  const ua = navigator.userAgent
  let deviceInfo = 'Unknown Device'

  // Phát hiện thiết bị di động
  if (/Android/i.test(ua)) {
    deviceInfo = 'Android Device'
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    deviceInfo = 'iOS Device'
  } else if (/Windows/i.test(ua)) {
    deviceInfo = 'Windows PC'
  } else if (/Macintosh/i.test(ua)) {
    deviceInfo = 'Macbook/iMac'
  } else if (/Linux/i.test(ua)) {
    deviceInfo = 'Linux Device'
  }

  // Thêm thông tin trình duyệt
  if (/Chrome/i.test(ua)) {
    deviceInfo += ' (Chrome)'
  } else if (/Firefox/i.test(ua)) {
    deviceInfo += ' (Firefox)'
  } else if (/Safari/i.test(ua)) {
    deviceInfo += ' (Safari)'
  } else if (/Edge/i.test(ua)) {
    deviceInfo += ' (Edge)'
  }

  return deviceInfo
}
