const DATABASE_NAME = 'gratefully-journal'
const DATABASE_VERSION = 3

let databasePromise: Promise<IDBDatabase> | undefined

export function openDatabase(): Promise<IDBDatabase> {
  if (databasePromise) return databasePromise

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)

    request.onupgradeneeded = () => {
      const database = request.result

      if (!database.objectStoreNames.contains('entries')) {
        const entries = database.createObjectStore('entries', { keyPath: 'id' })
        entries.createIndex('date', 'date', { unique: false })
        entries.createIndex('accountId', 'accountId', { unique: false })
      } else {
        const entries = request.transaction?.objectStore('entries')
        if (entries && !entries.indexNames.contains('accountId')) {
          entries.createIndex('accountId', 'accountId', { unique: false })
        }
      }

      if (!database.objectStoreNames.contains('metadata')) {
        database.createObjectStore('metadata', { keyPath: 'key' })
      }
    }

    request.onsuccess = () => {
      const database = request.result
      database.onversionchange = () => {
        database.close()
        databasePromise = undefined
      }
      resolve(database)
    }

    request.onerror = () => {
      databasePromise = undefined
      reject(
        request.error ??
          new Error('Unable to open the gratefully journal database.')
      )
    }

    request.onblocked = () => {
      databasePromise = undefined
      reject(new Error('Unable to upgrade the gratefully journal database.'))
    }
  })

  return databasePromise
}
