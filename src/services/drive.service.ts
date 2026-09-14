import type { DriveDatabase } from '@/sync/mapper'
import type {
  DriveApiErrorResponse,
  DriveFile,
  DriveFileListResponse,
} from '@/types/drive'
import type { JournalDatabase } from '@/types/journal'
import {
  getAccessToken,
  isJournalDate,
  isIsoDateString,
  isRecord,
} from '@/utils/driveHelpers'

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3'
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3'
const DATABASE_FILE_NAME = 'gratitude_db.json'
const GRATITUDE_DATABASE_FILE_NAME = DATABASE_FILE_NAME
const DATABASE_MIME_TYPE = 'application/json'

export class DriveServiceError extends Error {
  public readonly status: number | null
  public readonly code:
    | 'AUTHENTICATION'
    | 'NOT_FOUND'
    | 'NETWORK'
    | 'INVALID_RESPONSE'
    | 'CORRUPTED_DATABASE'
    | 'API'

  public constructor(
    code: DriveServiceError['code'],
    message: string,
    status: number | null = null
  ) {
    super(message)
    this.name = 'DriveServiceError'
    this.code = code
    this.status = status
  }
}

let databaseCreation: Promise<string> | null = null

function cloneDatabase(database: JournalDatabase): JournalDatabase {
  return {
    last_updated: database.last_updated,
    entries: database.entries.map((entry) => ({
      ...entry,
      items: [...entry.items],
    })),
  }
}

function requireToken(): string {
  const token = getAccessToken()
  if (!token) {
    throw new DriveServiceError(
      'AUTHENTICATION',
      'A Google access token is required.'
    )
  }
  return token
}

async function request(url: string, init: RequestInit = {}): Promise<Response> {
  const token = requireToken()

  try {
    return await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...init.headers,
      },
    })
  } catch (error: unknown) {
    const detail = error instanceof Error ? `: ${error.message}` : ''
    throw new DriveServiceError(
      'NETWORK',
      `Unable to reach Google Drive${detail}`
    )
  }
}

async function errorFromResponse(
  response: Response
): Promise<DriveServiceError> {
  let message = `Google Drive request failed with status ${response.status}.`

  try {
    const body: unknown = await response.json()
    if (isRecord(body)) {
      const apiError = body as DriveApiErrorResponse
      if (typeof apiError.error?.message === 'string')
        message = apiError.error.message
    }
  } catch {
    // A non-JSON error body is still a valid Drive failure.
  }

  if (response.status === 401)
    return new DriveServiceError('AUTHENTICATION', message, 401)
  if (response.status === 404)
    return new DriveServiceError('NOT_FOUND', message, 404)
  return new DriveServiceError('API', message, response.status)
}

async function readJsonResponse(response: Response): Promise<unknown> {
  if (!response.ok) throw await errorFromResponse(response)

  try {
    return await response.json()
  } catch {
    throw new DriveServiceError(
      'INVALID_RESPONSE',
      'Google Drive returned invalid JSON.',
      response.status
    )
  }
}

function parseDriveFile(value: unknown): DriveFile {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    value.id.length === 0 ||
    typeof value.name !== 'string' ||
    typeof value.mimeType !== 'string'
  ) {
    throw new DriveServiceError(
      'INVALID_RESPONSE',
      'Google Drive returned an invalid file resource.'
    )
  }

  return {
    id: value.id,
    name: value.name,
    mimeType: value.mimeType,
    ...(typeof value.createdTime === 'string'
      ? { createdTime: value.createdTime }
      : {}),
    ...(typeof value.modifiedTime === 'string'
      ? { modifiedTime: value.modifiedTime }
      : {}),
  }
}

function parseFileList(value: unknown): DriveFileListResponse {
  if (
    !isRecord(value) ||
    (value.files !== undefined && !Array.isArray(value.files))
  ) {
    throw new DriveServiceError(
      'INVALID_RESPONSE',
      'Google Drive returned an invalid file list.'
    )
  }

  return {
    ...(Array.isArray(value.files)
      ? { files: value.files.map(parseDriveFile) }
      : {}),
    ...(typeof value.nextPageToken === 'string'
      ? { nextPageToken: value.nextPageToken }
      : {}),
  }
}

function parseDatabase(value: unknown): JournalDatabase {
  if (
    !isRecord(value) ||
    !isIsoDateString(value.last_updated) ||
    !Array.isArray(value.entries)
  ) {
    throw new DriveServiceError(
      'CORRUPTED_DATABASE',
      'The Drive database has an invalid structure.'
    )
  }

  const entries = value.entries.map(
    (entry): JournalDatabase['entries'][number] => {
      if (
        !isRecord(entry) ||
        typeof entry.id !== 'string' ||
        entry.id.length === 0 ||
        !isJournalDate(entry.date) ||
        !Array.isArray(entry.items) ||
        !entry.items.every((item) => typeof item === 'string') ||
        typeof entry.mood !== 'string'
      ) {
        throw new DriveServiceError(
          'CORRUPTED_DATABASE',
          'The Drive database contains an invalid journal entry.'
        )
      }
      return {
        id: entry.id,
        date: entry.date,
        items: [...entry.items],
        mood: entry.mood,
      }
    }
  )

  if (new Set(entries.map((entry) => entry.id)).size !== entries.length) {
    throw new DriveServiceError(
      'CORRUPTED_DATABASE',
      'The Drive database contains duplicate entry IDs.'
    )
  }

  return { last_updated: value.last_updated, entries }
}

async function findFileByName(name: string): Promise<DriveFile | null> {
  const query = new URLSearchParams({
    q: `name = '${name}' and trashed = false`,
    spaces: 'appDataFolder',
    fields: 'nextPageToken,files(id,name,mimeType,createdTime,modifiedTime)',
    pageSize: '100',
  })
  const files: DriveFile[] = []

  do {
    const response = await request(`${DRIVE_API_URL}/files?${query.toString()}`)
    const page = parseFileList(await readJsonResponse(response))
    files.push(...(page.files ?? []).filter((file) => file.name === name))
    if (page.nextPageToken) query.set('pageToken', page.nextPageToken)
    else query.delete('pageToken')
  } while (query.has('pageToken'))

  // If legacy duplicates exist, consistently reuse the oldest rather than creating another.
  files.sort((a, b) => (a.createdTime ?? '').localeCompare(b.createdTime ?? ''))
  return files[0] ?? null
}

export async function findDatabaseFile(): Promise<string | null> {
  return (await findFileByName(DATABASE_FILE_NAME))?.id ?? null
}

function createMultipartBody(
  database: unknown,
  includeAppDataParent: boolean,
  name = DATABASE_FILE_NAME
): { boundary: string; body: string } {
  const boundary = `gratefully-db-${crypto.randomUUID()}`
  const metadata = JSON.stringify({
    name,
    mimeType: DATABASE_MIME_TYPE,
    ...(includeAppDataParent ? { parents: ['appDataFolder'] } : {}),
  })

  return {
    boundary,
    body: [
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`,
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(database)}\r\n`,
      `--${boundary}--`,
    ].join(''),
  }
}

export async function createDatabaseFile(): Promise<string> {
  const existingFileId = await findDatabaseFile()
  if (existingFileId) return existingFileId

  const initialDatabase: JournalDatabase = {
    last_updated: new Date().toISOString(),
    entries: [],
  }
  const { boundary, body } = createMultipartBody(initialDatabase, true)
  const response = await request(
    `${DRIVE_UPLOAD_URL}/files?uploadType=multipart&fields=id,name,mimeType,createdTime,modifiedTime`,
    {
      method: 'POST',
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body,
    }
  )
  return parseDriveFile(await readJsonResponse(response)).id
}

export async function getOrCreateDatabase(): Promise<string> {
  if (!databaseCreation) {
    databaseCreation = (async () => {
      const existingFileId = await findDatabaseFile()
      return existingFileId ?? createDatabaseFile()
    })().finally(() => {
      databaseCreation = null
    })
  }
  return databaseCreation
}

export async function readDatabase(fileId?: string): Promise<JournalDatabase> {
  const id = fileId ?? (await findDatabaseFile())
  if (!id)
    throw new DriveServiceError(
      'NOT_FOUND',
      'The gratefully database file was not found.',
      404
    )

  const response = await request(
    `${DRIVE_API_URL}/files/${encodeURIComponent(id)}?alt=media`
  )
  return cloneDatabase(parseDatabase(await readJsonResponse(response)))
}

export async function writeDatabase(
  database: JournalDatabase,
  fileId?: string
): Promise<JournalDatabase> {
  const id = fileId ?? (await getOrCreateDatabase())
  const updated = parseDatabase({
    ...database,
    last_updated: new Date().toISOString(),
  })
  const { boundary, body } = createMultipartBody(updated, false)
  const response = await request(
    `${DRIVE_UPLOAD_URL}/files/${encodeURIComponent(id)}?uploadType=multipart&fields=id,name,mimeType,createdTime,modifiedTime`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body,
    }
  )
  parseDriveFile(await readJsonResponse(response))
  return cloneDatabase(updated)
}

export async function findGratitudeDatabaseFile(): Promise<DriveFile | null> {
  return findFileByName(GRATITUDE_DATABASE_FILE_NAME)
}

export async function getGratitudeDatabaseFile(
  fileId: string
): Promise<DriveFile> {
  const response = await request(
    `${DRIVE_API_URL}/files/${encodeURIComponent(fileId)}?fields=id,name,mimeType,createdTime,modifiedTime`
  )
  const file = parseDriveFile(await readJsonResponse(response))
  if (file.name !== GRATITUDE_DATABASE_FILE_NAME) {
    throw new DriveServiceError(
      'NOT_FOUND',
      'The gratitude database file was not found.',
      404
    )
  }
  return file
}

export async function createGratitudeDatabaseFile(
  database: DriveDatabase
): Promise<DriveFile> {
  const existing = await findGratitudeDatabaseFile()
  if (existing) return existing

  const { boundary, body } = createMultipartBody(
    database,
    true,
    GRATITUDE_DATABASE_FILE_NAME
  )
  const response = await request(
    `${DRIVE_UPLOAD_URL}/files?uploadType=multipart&fields=id,name,mimeType,createdTime,modifiedTime`,
    {
      method: 'POST',
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body,
    }
  )
  return parseDriveFile(await readJsonResponse(response))
}

export async function downloadGratitudeDatabase(
  fileId: string
): Promise<unknown> {
  const response = await request(
    `${DRIVE_API_URL}/files/${encodeURIComponent(fileId)}?alt=media`
  )
  return readJsonResponse(response)
}

export async function uploadGratitudeDatabase(
  fileId: string,
  database: DriveDatabase
): Promise<DriveFile> {
  const { boundary, body } = createMultipartBody(
    database,
    false,
    GRATITUDE_DATABASE_FILE_NAME
  )
  const response = await request(
    `${DRIVE_UPLOAD_URL}/files/${encodeURIComponent(fileId)}?uploadType=multipart&fields=id,name,mimeType,createdTime,modifiedTime`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body,
    }
  )
  return parseDriveFile(await readJsonResponse(response))
}
