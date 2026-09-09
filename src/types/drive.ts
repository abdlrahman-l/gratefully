export interface DriveFile {
  id: string
  name: string
  mimeType: string
  createdTime?: string
  modifiedTime?: string
}

export interface DriveFileListResponse {
  files?: DriveFile[]
  nextPageToken?: string
}

export interface DriveApiErrorDetail {
  domain?: string
  reason?: string
  message?: string
  locationType?: string
  location?: string
}

export interface DriveApiErrorResponse {
  error?: {
    code?: number
    message?: string
    status?: string
    errors?: DriveApiErrorDetail[]
  }
}
