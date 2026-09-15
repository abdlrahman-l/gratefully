/**
 * Converts an IndexedDB request from its event-based API into a Promise,
 * allowing it to be used with async/await.
 */
export function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => {
      reject(request.error ?? new Error('IndexedDB request failed.'))
    }
  })
}
