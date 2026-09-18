import type { DriveApiErrorResponse, DriveFile } from '@/types/drive'
import type { JournalDatabase } from '@/types/journal'
import { getValidAccessToken, invalidateAccessToken } from '@/services/google-token.service'
import { isRecord } from '@/utils/driveHelpers'

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3'
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3'
const JSON_MIME_TYPE = 'application/json'
export const LEGACY_DATABASE_FILE_NAME = 'gratitude_db.json'

export class DriveServiceError extends Error {
  public constructor(
    public readonly code: 'AUTHENTICATION' | 'NOT_FOUND' | 'NETWORK' | 'INVALID_RESPONSE' | 'API',
    message: string,
    public readonly status: number | null = null
  ) { super(message); this.name = 'DriveServiceError' }
}

async function fetchWithToken(url: string, init: RequestInit, token: string): Promise<Response> {
  try {
    return await fetch(url, { ...init, headers: { Authorization: `Bearer ${token}`, ...init.headers } })
  } catch (error) {
    throw new DriveServiceError('NETWORK', `Unable to reach Google Drive${error instanceof Error ? `: ${error.message}` : ''}`)
  }
}

async function request(url: string, init: RequestInit = {}): Promise<Response> {
  let token: string
  try {
    token = await getValidAccessToken()
  } catch (error) {
    throw new DriveServiceError('AUTHENTICATION', error instanceof Error ? error.message : 'Google Drive authorization is unavailable.')
  }

  const response = await fetchWithToken(url, init, token)
  if (response.status === 401) invalidateAccessToken()
  return response
}

async function errorFromResponse(response: Response): Promise<DriveServiceError> {
  let message = `Google Drive request failed with status ${response.status}.`
  try {
    const body: unknown = await response.json()
    const apiMessage = isRecord(body) ? (body as DriveApiErrorResponse).error?.message : undefined
    if (typeof apiMessage === 'string') message = apiMessage
  } catch { /* non-JSON errors still have a useful HTTP status */ }
  return new DriveServiceError(response.status === 401 ? 'AUTHENTICATION' : response.status === 404 ? 'NOT_FOUND' : 'API', message, response.status)
}

async function readJsonResponse(response: Response): Promise<unknown> {
  if (!response.ok) throw await errorFromResponse(response)
  try { return await response.json() } catch { throw new DriveServiceError('INVALID_RESPONSE', 'Google Drive returned invalid JSON.', response.status) }
}

function parseDriveFile(value: unknown): DriveFile {
  if (!isRecord(value) || typeof value.id !== 'string' || !value.id || typeof value.name !== 'string' || typeof value.mimeType !== 'string') {
    throw new DriveServiceError('INVALID_RESPONSE', 'Google Drive returned an invalid file resource.')
  }
  return { id: value.id, name: value.name, mimeType: value.mimeType,
    ...(typeof value.createdTime === 'string' ? { createdTime: value.createdTime } : {}),
    ...(typeof value.modifiedTime === 'string' ? { modifiedTime: value.modifiedTime } : {}), }
}

async function findFileByName(name: string): Promise<DriveFile | null> {
  const query = new URLSearchParams({ q: `name = '${name.replace(/'/g, "\\'")}' and trashed = false`, spaces: 'appDataFolder', fields: 'nextPageToken,files(id,name,mimeType,createdTime,modifiedTime)', pageSize: '100' })
  const files: DriveFile[] = []
  do {
    const value = await readJsonResponse(await request(`${DRIVE_API_URL}/files?${query}`))
    if (!isRecord(value) || (value.files !== undefined && !Array.isArray(value.files))) throw new DriveServiceError('INVALID_RESPONSE', 'Google Drive returned an invalid file list.')
    files.push(...(value.files ?? []).map(parseDriveFile).filter((file) => file.name === name))
    if (typeof value.nextPageToken === 'string') query.set('pageToken', value.nextPageToken)
    else query.delete('pageToken')
  } while (query.has('pageToken'))
  files.sort((a, b) => (a.createdTime ?? '').localeCompare(b.createdTime ?? ''))
  return files[0] ?? null
}

function createMultipartBody(name: string, data: unknown, includeAppDataParent: boolean): { boundary: string; body: string } {
  const boundary = `gratefully-json-${crypto.randomUUID()}`
  const metadata = JSON.stringify({ name, mimeType: JSON_MIME_TYPE, ...(includeAppDataParent ? { parents: ['appDataFolder'] } : {}) })
  return { boundary, body: [`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`, `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(data)}\r\n`, `--${boundary}--`].join('') }
}

export async function findAppDataFile(name: string): Promise<DriveFile | null> { return findFileByName(name) }
export async function downloadJsonFile(fileId: string): Promise<unknown> { return readJsonResponse(await request(`${DRIVE_API_URL}/files/${encodeURIComponent(fileId)}?alt=media`)) }
export async function createJsonFile(name: string, data: unknown): Promise<DriveFile> {
  const { boundary, body } = createMultipartBody(name, data, true)
  return parseDriveFile(await readJsonResponse(await request(`${DRIVE_UPLOAD_URL}/files?uploadType=multipart&fields=id,name,mimeType,createdTime,modifiedTime`, { method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${boundary}` }, body })))
}
export async function uploadJsonFile(fileId: string, name: string, data: unknown): Promise<DriveFile> {
  const { boundary, body } = createMultipartBody(name, data, false)
  return parseDriveFile(await readJsonResponse(await request(`${DRIVE_UPLOAD_URL}/files/${encodeURIComponent(fileId)}?uploadType=multipart&fields=id,name,mimeType,createdTime,modifiedTime`, { method: 'PATCH', headers: { 'Content-Type': `multipart/related; boundary=${boundary}` }, body })))
}

// Compatibility for the older, unused Journal service. New gratitude sync must
// use the monthly APIs above and never call these single-file helpers.
export async function getOrCreateDatabase(): Promise<string> {
  const existing = await findAppDataFile('journal_db.json')
  if (existing) return existing.id
  return (await createJsonFile('journal_db.json', { last_updated: new Date().toISOString(), entries: [] })).id
}
export async function readDatabase(fileId: string): Promise<JournalDatabase> {
  return (await downloadJsonFile(fileId)) as JournalDatabase
}
export async function writeDatabase(database: JournalDatabase, fileId: string): Promise<JournalDatabase> {
  const updated = { ...database, last_updated: new Date().toISOString() }
  await uploadJsonFile(fileId, 'journal_db.json', updated)
  return updated
}
