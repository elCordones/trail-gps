/**
 * TrailGPS Route Storage & IndexedDB Manager
 * Handles asynchronous persistence of large GPX files, automatic migration from localStorage,
 * and graceful fallback for memory / restricted environments.
 */

export const DB_NAME = 'trailgps_db_v1';
export const DB_VERSION = 1;
export const STORE_ROUTES = 'routes';
export const LEGACY_STORAGE_KEY_ROUTES = 'trailgps_saved_routes_v1';

export class RouteStorage {
  constructor(options = {}) {
    this.dbName = options.dbName || DB_NAME;
    this.dbVersion = options.dbVersion || DB_VERSION;
    this.storeName = options.storeName || STORE_ROUTES;
    this.indexedDB = options.indexedDB || (typeof indexedDB !== 'undefined' ? indexedDB : null);
    this.localStorage = options.localStorage || (typeof localStorage !== 'undefined' ? localStorage : null);
    
    this.db = null;
    this.inMemoryStore = new Map();
    this.isInitialized = false;
    this.useFallback = !this.indexedDB;
  }

  /**
   * Initializes database and migrates legacy localStorage routes
   */
  async init() {
    if (this.isInitialized) return this;

    if (!this.indexedDB) {
      this.useFallback = true;
      this._migrateFromLocalStorageInMemory();
      this.isInitialized = true;
      return this;
    }
    try {
      this.db = await new Promise((resolve, reject) => {
        const req = this.indexedDB.open(this.dbName, this.dbVersion);

        req.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
            store.createIndex('name', 'name', { unique: false });
            store.createIndex('updatedAt', 'updatedAt', { unique: false });
            store.createIndex('createdAt', 'createdAt', { unique: false });
          }
        };

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      this.isInitialized = true;
      await this.migrateFromLocalStorage();
    } catch (e) {
      console.warn('IndexedDB initialization failed, falling back to memory store:', e);
      this.useFallback = true;
      this._migrateFromLocalStorageInMemory();
      this.isInitialized = true;
    }

    return this;
  }

  /**
   * Migrates routes from legacy localStorage into IndexedDB
   */
  async migrateFromLocalStorage() {
    if (!this.localStorage) return;
    try {
      const raw = this.localStorage.getItem(LEGACY_STORAGE_KEY_ROUTES);
      if (!raw) return;

      const legacyRoutes = JSON.parse(raw);
      if (Array.isArray(legacyRoutes) && legacyRoutes.length > 0) {
        for (const route of legacyRoutes) {
          if (route && route.name && route.xml) {
            await this.saveRoute({
              name: route.name,
              xml: route.xml,
              distKm: route.distKm || '0',
              elevM: route.elevM || 0,
              date: route.date || new Date().toLocaleDateString('ca-ES')
            });
          }
        }
        // Clear heavy XML payloads from localStorage to free memory
        this.localStorage.removeItem(LEGACY_STORAGE_KEY_ROUTES);
      }
    } catch (e) {
      console.warn('Migration from localStorage encountered an issue:', e);
    }
  }

  _migrateFromLocalStorageInMemory() {
    if (!this.localStorage) return;
    try {
      const raw = this.localStorage.getItem(LEGACY_STORAGE_KEY_ROUTES);
      if (!raw) return;
      const legacyRoutes = JSON.parse(raw);
      if (Array.isArray(legacyRoutes)) {
        for (const route of legacyRoutes) {
          if (route && route.name) {
            const id = 'route_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
            this.inMemoryStore.set(id, {
              id,
              name: route.name,
              xml: route.xml,
              distKm: route.distKm || '0',
              elevM: route.elevM || 0,
              date: route.date || new Date().toLocaleDateString('ca-ES'),
              createdAt: Date.now(),
              updatedAt: Date.now()
            });
          }
        }
      }
    } catch (e) {}
  }

  /**
   * Saves or updates a route record
   */
  async saveRoute(routeData) {
    if (!this.isInitialized) await this.init();
    if (!routeData || !routeData.name || typeof routeData.xml !== 'string') {
      throw new Error('Dades de ruta invàlides: el nom i el contingut GPX són obligatoris');
    }

    const now = Date.now();
    const existing = await this.getRouteByName(routeData.name);

    const record = {
      id: routeData.id || (existing ? existing.id : `route_${now}_${Math.random().toString(36).slice(2, 7)}`),
      name: String(routeData.name).trim().slice(0, 100),
      xml: routeData.xml,
      distKm: String(routeData.distKm || '0'),
      elevM: Number(routeData.elevM) || 0,
      date: routeData.date || new Date(now).toLocaleDateString('ca-ES'),
      createdAt: existing ? existing.createdAt : (routeData.createdAt || now),
      updatedAt: now
    };

    if (this.useFallback || !this.db) {
      this.inMemoryStore.set(record.id, record);
      return record;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const req = store.put(record);

      req.onsuccess = () => resolve(record);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Retrieves all saved routes sorted by updatedAt (newest first)
   */
  async getAllRoutes() {
    if (!this.isInitialized) await this.init();

    if (this.useFallback || !this.db) {
      const routes = Array.from(this.inMemoryStore.values());
      return routes.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const req = store.getAll();

      req.onsuccess = () => {
        const routes = req.result || [];
        routes.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        resolve(routes);
      };
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Retrieves a route by its unique ID
   */
  async getRouteById(id) {
    if (!this.isInitialized) await this.init();
    if (!id) return null;

    if (this.useFallback || !this.db) {
      return this.inMemoryStore.get(id) || null;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const req = store.get(id);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Retrieves a route by its name
   */
  async getRouteByName(name) {
    if (!this.isInitialized) await this.init();
    if (!name) return null;

    const trimmed = String(name).trim();

    if (this.useFallback || !this.db) {
      for (const r of this.inMemoryStore.values()) {
        if (r.name === trimmed) return r;
      }
      return null;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const index = store.index('name');
      const req = index.get(trimmed);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Deletes a route by ID or Name
   */
  async deleteRoute(idOrName) {
    if (!this.isInitialized) await this.init();
    if (!idOrName) return false;

    let targetId = idOrName;
    if (this.useFallback || !this.db) {
      if (this.inMemoryStore.has(idOrName)) {
        this.inMemoryStore.delete(idOrName);
        return true;
      }
      for (const [id, r] of this.inMemoryStore.entries()) {
        if (r.name === idOrName) {
          this.inMemoryStore.delete(id);
          return true;
        }
      }
      return false;
    }

    const existing = (await this.getRouteById(idOrName)) || (await this.getRouteByName(idOrName));
    if (!existing) return false;
    targetId = existing.id;

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const req = store.delete(targetId);

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Clears all routes from the storage
   */
  async clearAll() {
    if (!this.isInitialized) await this.init();

    if (this.useFallback || !this.db) {
      this.inMemoryStore.clear();
      return true;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const req = store.clear();

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Exports all routes as a backup JSON string
   */
  async exportBackupJson() {
    const routes = await this.getAllRoutes();
    return JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      routes
    }, null, 2);
  }

  /**
   * Imports routes from a backup JSON string
   */
  async importBackupJson(jsonStr) {
    if (typeof jsonStr !== 'string') throw new Error('Contingut JSON invàlid');
    const data = JSON.parse(jsonStr);
    const routes = Array.isArray(data) ? data : (data.routes || []);
    let count = 0;

    for (const r of routes) {
      if (r && r.name && r.xml) {
        await this.saveRoute(r);
        count++;
      }
    }
    return count;
  }
}
