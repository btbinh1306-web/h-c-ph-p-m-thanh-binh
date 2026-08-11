// IndexedDB & LocalStorage persistence service for uploaded audio & video files

const DB_NAME = 'pinyin_app_media_db';
const STORE_NAME = 'media_files';
const DB_VERSION = 1;
const LOCAL_STORAGE_PREFIX = 'pinyin_media_ls_';

interface StoredMediaRecord {
  arrayBuffer?: ArrayBuffer;
  type: string;
  base64?: string;
  updatedAt: number;
}

let dbPromiseCache: Promise<IDBDatabase | null> | null = null;

function openDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }
  if (dbPromiseCache) {
    return dbPromiseCache;
  }

  dbPromiseCache = new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = (err) => {
        console.warn('IndexedDB open error, falling back to LocalStorage:', err);
        resolve(null);
      };
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        try {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        } catch (e) {
          console.warn('Error creating object store:', e);
        }
      };
    } catch (e) {
      console.warn('IndexedDB not supported or blocked, using LocalStorage fallback:', e);
      resolve(null);
    }
  });

  return dbPromiseCache;
}

function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') {
    return blob.arrayBuffer();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(base64: string, defaultType = 'audio/mpeg'): Blob {
  try {
    const parts = base64.split(',');
    const mimeMatch = parts[0]?.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : defaultType;
    const byteString = atob(parts[1] || parts[0]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mime });
  } catch (e) {
    console.error('Error converting base64 to blob:', e);
    return new Blob([], { type: defaultType });
  }
}

/**
 * Save a Blob/File to IndexedDB & LocalStorage under a specific key, returning a playable URL.
 */
export async function saveMediaFile(key: string, file: Blob): Promise<string> {
  let mimeType = file.type;
  if (!mimeType || mimeType.trim() === '') {
    const fileName = (file as File).name?.toLowerCase() || '';
    if (key.startsWith('video_') || fileName.endsWith('.mp4') || fileName.endsWith('.webm') || fileName.endsWith('.mov')) {
      mimeType = fileName.endsWith('.webm') ? 'video/webm' : 'video/mp4';
    } else {
      mimeType = 'audio/mpeg';
    }
  }

  // Ensure video keys get video mime types
  if (key.startsWith('video_') && mimeType.startsWith('audio/')) {
    mimeType = 'video/mp4';
  }

  let createdUrl = '';

  try {
    const arrayBuffer = await blobToArrayBuffer(file);
    const base64Data = await blobToBase64(file);
    const record: StoredMediaRecord = {
      arrayBuffer,
      type: mimeType,
      base64: base64Data,
      updatedAt: Date.now(),
    };

    // 1. Try saving to IndexedDB
    const db = await openDB();
    if (db) {
      await new Promise<void>((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const req = store.put(record, key);
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
        } catch (e) {
          console.warn('IndexedDB put failed, continuing to LocalStorage:', e);
          resolve();
        }
      });
    }

    // 2. Also save to LocalStorage as fallback
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${key}`, base64Data);
    } catch (e) {
      console.warn('LocalStorage save quota exceeded or unavailable:', e);
    }

    // Create playable Blob URL
    const playableBlob = new Blob([arrayBuffer], { type: mimeType });
    createdUrl = URL.createObjectURL(playableBlob);
  } catch (e) {
    console.error('Failed to process media file for storage:', e);
    createdUrl = URL.createObjectURL(file);
  }

  return createdUrl;
}

/**
 * Retrieve all stored media files and return a key -> playable URL map.
 */
export async function getAllMediaFiles(): Promise<Record<string, string>> {
  const result: Record<string, string> = {};

  // 1. First load from IndexedDB if available
  try {
    const db = await openDB();
    if (db) {
      await new Promise<void>((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const request = store.openCursor();

          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {
              const key = String(cursor.key);
              const val = cursor.value;
              if (val) {
                try {
                  const isVideoKey = key.startsWith('video_');
                  let targetType = val.type || (isVideoKey ? 'video/mp4' : 'audio/mpeg');
                  if (isVideoKey && targetType.startsWith('audio/')) {
                    targetType = 'video/mp4';
                  }

                  if (val.arrayBuffer) {
                    const blob = new Blob([val.arrayBuffer], { type: targetType });
                    result[key] = URL.createObjectURL(blob);
                  } else if (val.base64) {
                    const blob = base64ToBlob(val.base64, targetType);
                    const finalBlob = isVideoKey && blob.type.startsWith('audio/') ? new Blob([blob], { type: 'video/mp4' }) : blob;
                    result[key] = URL.createObjectURL(finalBlob);
                  } else if (val instanceof Blob) {
                    const finalBlob = isVideoKey && val.type.startsWith('audio/') ? new Blob([val], { type: 'video/mp4' }) : val;
                    result[key] = URL.createObjectURL(finalBlob);
                  }
                } catch (e) {
                  console.warn(`Error restoring media key ${key}:`, e);
                }
              }
              cursor.continue();
            } else {
              resolve();
            }
          };
          request.onerror = () => resolve();
        } catch (e) {
          console.warn('IndexedDB openCursor failed:', e);
          resolve();
        }
      });
    }
  } catch (e) {
    console.warn('Failed to load from IndexedDB:', e);
  }

  // 2. Fall back / merge with LocalStorage entries
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const lsKey = localStorage.key(i);
        if (lsKey && lsKey.startsWith(LOCAL_STORAGE_PREFIX)) {
          const realKey = lsKey.replace(LOCAL_STORAGE_PREFIX, '');
          if (!result[realKey]) {
            const base64Data = localStorage.getItem(lsKey);
            if (base64Data) {
              const isVideoKey = realKey.startsWith('video_');
              const targetType = isVideoKey ? 'video/mp4' : 'audio/mpeg';
              const blob = base64ToBlob(base64Data, targetType);
              result[realKey] = URL.createObjectURL(blob);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
    }
  }

  // Merge the bundled Pinyin Pack so every device can play the built-in media.
  if (typeof window !== 'undefined') {
    try {
      const response = await fetch('/pinyin-media-manifest.json');
      if (response.ok) {
        const bundledMedia = (await response.json()) as Record<string, string>;
        for (const [key, url] of Object.entries(bundledMedia)) {
          if (!result[key]) {
            result[key] = url;
          }
        }
      }
    } catch (e) {
      console.warn('Could not load bundled Pinyin Pack:', e);
    }
  }

  return result;
}

/**
 * Delete a saved media file by key.
 */
export async function deleteMediaFile(key: string): Promise<void> {
  // 1. Delete from IndexedDB
  try {
    const db = await openDB();
    if (db) {
      await new Promise<void>((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const req = store.delete(key);
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    }
  } catch (e) {
    console.warn('IndexedDB delete error:', e);
  }

  // 2. Delete from LocalStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}${key}`);
    } catch (e) {
      console.warn('LocalStorage remove error:', e);
    }
  }
}

/**
 * Export all stored media files in IndexedDB / LocalStorage to a downloadable backup file (.pinyinpack).
 */
export async function exportMediaBackupFile(): Promise<number> {
  const allMedia = await getAllMediaFiles();
  const backupData: Record<string, { type: string; data: string }> = {};
  let fileCount = 0;

  for (const [key, url] of Object.entries(allMedia)) {
    if (url.startsWith('data:')) {
      backupData[key] = {
        type: url.split(';')[0]?.split(':')[1] || 'audio/mpeg',
        data: url,
      };
      fileCount++;
    } else if (url.startsWith('blob:')) {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const base64 = await blobToBase64(blob);
        backupData[key] = {
          type: blob.type || 'audio/mpeg',
          data: base64,
        };
        fileCount++;
      } catch (e) {
        console.warn('Could not fetch blob for export:', e);
      }
    }
  }

  const jsonString = JSON.stringify(backupData, null, 2);
  const jsonBlob = new Blob([jsonString], { type: 'application/json' });
  const downloadUrl = URL.createObjectURL(jsonBlob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  const dateStr = new Date().toISOString().slice(0, 10);
  a.download = `pinyin_media_backup_${dateStr}.pinyinpack`;
  a.click();
  URL.revokeObjectURL(downloadUrl);

  return fileCount;
}

/**
 * Import a backup file (.pinyinpack) and restore all media files into IndexedDB & LocalStorage.
 */
export async function importMediaBackupFile(file: File): Promise<number> {
  const text = await file.text();
  const backupData = JSON.parse(text) as Record<string, { type: string; data: string }>;

  let restoredCount = 0;
  for (const [key, item] of Object.entries(backupData)) {
    if (item && item.data) {
      const blob = base64ToBlob(item.data, item.type || 'audio/mpeg');
      await saveMediaFile(key, blob);
      restoredCount++;
    }
  }
  return restoredCount;
}

/**
 * Clear all saved media files from IndexedDB and LocalStorage.
 */
export async function clearAllMediaFiles(): Promise<void> {
  try {
    const db = await openDB();
    if (db) {
      await new Promise<void>((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const req = store.clear();
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    }
  } catch (e) {
    console.warn('IndexedDB clear error:', e);
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(LOCAL_STORAGE_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.warn('LocalStorage clear error:', e);
    }
  }
}
