// src/utils/fetchUtils.js

/**
 * Hàm tiện ích để fetch data
 * @param {string} url - URL của API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<any>} Dữ liệu đã parse từ response JSON
 * @throws {Error} Throw lỗi nếu request thất bại
 */
export async function fetchData(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

/**
 * Hàm để build query string từ params object
 * @param {object} params - Object chứa các query parameters
 * @returns {string} Query string đã format với dấu ? ở đầu nếu có params
 */
export function buildQueryString(params = {}) {
  const queryParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString())
    }
  })

  const queryString = queryParams.toString()
  return queryString ? `?${queryString}` : ''
}

/**
 * Hàm POST data lên server
 * @param {string} url - URL của API endpoint
 * @param {any} data - Dữ liệu gửi lên server
 * @param {object} options - Fetch options bổ sung
 * @returns {Promise<any>} Dữ liệu đã parse từ response JSON
 */
export async function postData(url, data, options = {}) {
  return fetchData(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options
  })
}

/**
 * Hàm PUT data lên server
 * @param {string} url - URL của API endpoint
 * @param {any} data - Dữ liệu gửi lên server
 * @param {object} options - Fetch options bổ sung
 * @returns {Promise<any>} Dữ liệu đã parse từ response JSON
 */
export async function putData(url, data, options = {}) {
  return fetchData(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options
  })
}

/**
 * Hàm DELETE resource trên server
 * @param {string} url - URL của API endpoint
 * @param {object} options - Fetch options bổ sung
 * @returns {Promise<any>} Dữ liệu đã parse từ response JSON
 */
export async function deleteData(url, options = {}) {
  return fetchData(url, {
    method: 'DELETE',
    ...options
  })
}
