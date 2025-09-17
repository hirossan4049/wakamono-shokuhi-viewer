import { Product, ProductData, ProductItem } from '../types/Product';

const DB_NAME = 'wakamono-shokuhi';
const DB_VERSION = 1;

// Store names
export const STORE_PRODUCTS = 'products';
export const STORE_ITEMS = 'items';
export const STORE_META = 'meta';

type IDBDatabaseEx = IDBDatabase;

function openDB(): Promise<IDBDatabaseEx> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      // products store: key by id, index by category/name/totals
      if (!db.objectStoreNames.contains(STORE_PRODUCTS)) {
        const store = db.createObjectStore(STORE_PRODUCTS, { keyPath: 'id' });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('totals', 'totals', { unique: false });
      }

      // items store: auto inc key, index by productId
      if (!db.objectStoreNames.contains(STORE_ITEMS)) {
        const store = db.createObjectStore(STORE_ITEMS, { keyPath: 'key', autoIncrement: true });
        store.createIndex('productId', 'productId', { unique: false });
      }

      // meta store: simple key-value
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function tx(db: IDBDatabaseEx, mode: IDBTransactionMode, stores: string[]): IDBTransaction {
  return db.transaction(stores, mode);
}

export type NormalizedItem = ProductItem & { productId: string; index: number };

// Normalize and save ProductData into IndexedDB
export async function saveProductDataToDB(data: ProductData): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = tx(db, 'readwrite', [STORE_PRODUCTS, STORE_ITEMS, STORE_META]);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);

    const productsStore = transaction.objectStore(STORE_PRODUCTS);
    const itemsStore = transaction.objectStore(STORE_ITEMS);
    const metaStore = transaction.objectStore(STORE_META);

    // Clear existing data to avoid duplicates
    productsStore.clear();
    itemsStore.clear();

    // Put products and items
    data.products.forEach((p: Product) => {
      productsStore.put(p);
      p.items.forEach((it: ProductItem, idx: number) => {
        const normalized: NormalizedItem = { ...it, productId: p.id, index: idx };
        itemsStore.put(normalized);
      });
    });

    // Save meta info
    metaStore.put({ key: 'lastImportedAt', value: new Date().toISOString() });
    metaStore.put({ key: 'counts', value: { products: data.products.length } });
  });
}

export async function getCountsFromDB(): Promise<{ products: number; items: number } | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = tx(db, 'readonly', [STORE_PRODUCTS, STORE_ITEMS]);
      const productsStore = transaction.objectStore(STORE_PRODUCTS);
      const itemsStore = transaction.objectStore(STORE_ITEMS);

      const req1 = productsStore.count();
      const req2 = itemsStore.count();

      let c1: number | null = null;
      let c2: number | null = null;

      const maybeResolve = () => {
        if (c1 !== null && c2 !== null) resolve({ products: c1, items: c2 });
      };

      req1.onsuccess = () => {
        c1 = req1.result;
        maybeResolve();
      };
      req1.onerror = () => reject(req1.error);

      req2.onsuccess = () => {
        c2 = req2.result;
        maybeResolve();
      };
      req2.onerror = () => reject(req2.error);
    });
  } catch {
    return null;
  }
}

export async function clearDB(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = tx(db, 'readwrite', [STORE_PRODUCTS, STORE_ITEMS, STORE_META]);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.objectStore(STORE_PRODUCTS).clear();
    transaction.objectStore(STORE_ITEMS).clear();
    transaction.objectStore(STORE_META).clear();
  });
}

// Load all products and reconstruct ProductData
export async function loadProductDataFromDB(): Promise<ProductData | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = tx(db, 'readonly', [STORE_PRODUCTS]);
      const store = transaction.objectStore(STORE_PRODUCTS);

      // Prefer getAll when available (use runtime check without TS narrowing)
      const anyStore = store as any;
      if (typeof anyStore.getAll === 'function') {
        const req = anyStore.getAll() as IDBRequest<Product[]>;
        req.onsuccess = () => {
          const products = req.result || [];
          resolve(products.length ? { products } : null);
        };
        req.onerror = () => reject(req.error);
      } else {
        const products: Product[] = [];
        const cursorReq = store.openCursor();
        cursorReq.onsuccess = () => {
          const cursor = cursorReq.result as IDBCursorWithValue | null;
          if (cursor) {
            products.push(cursor.value as Product);
            cursor.continue();
          } else {
            resolve(products.length ? { products } : null);
          }
        };
        cursorReq.onerror = () => reject(cursorReq.error);
      }
    });
  } catch {
    return null;
  }
}
