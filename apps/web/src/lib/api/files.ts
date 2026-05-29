import { apiFetch, ApiError, BASE_URL } from './client'

export function deleteFile(token: string, fileId: string): Promise<void> {
  return apiFetch(`/files/${fileId}`, { method: 'DELETE', token }).then(
    () => undefined,
  )
}

export async function downloadFile(
  token: string,
  fileId: string,
  fileName: string,
): Promise<void> {
  const response = await fetch(`${BASE_URL}/files/${fileId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new ApiError(response.status, 'Не вдалося завантажити файл')
  }
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}
