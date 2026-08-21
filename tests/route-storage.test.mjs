import test from 'node:test';
import assert from 'node:assert/strict';
import { RouteStorage, LEGACY_STORAGE_KEY_ROUTES } from '../src/core/routeStorage.mjs';

// Mock localStorage for testing
function createMockLocalStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear()
  };
}

test('RouteStorage: initializes in fallback mode when indexedDB is absent', async () => {
  const storage = new RouteStorage({ indexedDB: null });
  await storage.init();
  assert.equal(storage.isInitialized, true);
  assert.equal(storage.useFallback, true);
});

test('RouteStorage: saves, retrieves by id and name, and lists routes', async () => {
  const storage = new RouteStorage({ indexedDB: null });
  await storage.init();

  const route1 = await storage.saveRoute({
    name: 'Ruta Montserrat BTT',
    xml: '<gpx><trk><name>Montserrat</name></trk></gpx>',
    distKm: '32.4',
    elevM: 850
  });

  assert.ok(route1.id);
  assert.equal(route1.name, 'Ruta Montserrat BTT');
  assert.equal(route1.distKm, '32.4');
  assert.equal(route1.elevM, 850);

  // Retrieve by ID
  const fetchedById = await storage.getRouteById(route1.id);
  assert.equal(fetchedById.name, 'Ruta Montserrat BTT');
  assert.equal(fetchedById.xml, route1.xml);

  // Retrieve by Name
  const fetchedByName = await storage.getRouteByName('Ruta Montserrat BTT');
  assert.equal(fetchedByName.id, route1.id);

  // List all routes
  const all = await storage.getAllRoutes();
  assert.equal(all.length, 1);
  assert.equal(all[0].name, 'Ruta Montserrat BTT');
});

test('RouteStorage: updates existing route with identical name without duplicating', async () => {
  const storage = new RouteStorage({ indexedDB: null });
  await storage.init();

  const r1 = await storage.saveRoute({
    name: 'Ruta Collserola',
    xml: '<gpx>v1</gpx>',
    distKm: '10.0',
    elevM: 200
  });

  const r2 = await storage.saveRoute({
    name: 'Ruta Collserola',
    xml: '<gpx>v2</gpx>',
    distKm: '12.0',
    elevM: 250
  });

  assert.equal(r1.id, r2.id, 'Should keep identical id on name match');
  const all = await storage.getAllRoutes();
  assert.equal(all.length, 1);
  assert.equal(all[0].distKm, '12.0');
});

test('RouteStorage: deletes route by ID or by Name', async () => {
  const storage = new RouteStorage({ indexedDB: null });
  await storage.init();

  const r1 = await storage.saveRoute({ name: 'Ruta 1', xml: '<gpx>1</gpx>' });
  const r2 = await storage.saveRoute({ name: 'Ruta 2', xml: '<gpx>2</gpx>' });

  assert.equal((await storage.getAllRoutes()).length, 2);

  // Delete by name
  const deleted1 = await storage.deleteRoute('Ruta 1');
  assert.equal(deleted1, true);
  assert.equal((await storage.getAllRoutes()).length, 1);

  // Delete by ID
  const deleted2 = await storage.deleteRoute(r2.id);
  assert.equal(deleted2, true);
  assert.equal((await storage.getAllRoutes()).length, 0);
});

test('RouteStorage: automatically migrates legacy localStorage routes on initialization', async () => {
  const mockLs = createMockLocalStorage({
    [LEGACY_STORAGE_KEY_ROUTES]: JSON.stringify([
      { name: 'Ruta Antiga 1', xml: '<gpx>legacy1</gpx>', distKm: '15.5', elevM: 300, date: '19/08/2026' },
      { name: 'Ruta Antiga 2', xml: '<gpx>legacy2</gpx>', distKm: '22.0', elevM: 540, date: '20/08/2026' }
    ])
  });

  const storage = new RouteStorage({ indexedDB: null, localStorage: mockLs });
  await storage.init();

  const all = await storage.getAllRoutes();
  assert.equal(all.length, 2);
  assert.ok(all.some(r => r.name === 'Ruta Antiga 1'));
  assert.ok(all.some(r => r.name === 'Ruta Antiga 2'));
});

test('RouteStorage: exports and imports backup JSON', async () => {
  const storage1 = new RouteStorage({ indexedDB: null });
  await storage1.init();
  await storage1.saveRoute({ name: 'Backup Track 1', xml: '<gpx>1</gpx>', distKm: '5.0', elevM: 100 });
  await storage1.saveRoute({ name: 'Backup Track 2', xml: '<gpx>2</gpx>', distKm: '15.0', elevM: 400 });

  const backupStr = await storage1.exportBackupJson();
  assert.ok(backupStr.includes('Backup Track 1'));
  assert.ok(backupStr.includes('Backup Track 2'));

  const storage2 = new RouteStorage({ indexedDB: null });
  await storage2.init();
  const importedCount = await storage2.importBackupJson(backupStr);
  assert.equal(importedCount, 2);

  const all2 = await storage2.getAllRoutes();
  assert.equal(all2.length, 2);
});

test('RouteStorage: importBackupJson safely handles corrupted or empty JSON inputs', async () => {
  const storage = new RouteStorage({ indexedDB: null });
  await storage.init();

  // Invalid JSON should reject
  await assert.rejects(async () => {
    await storage.importBackupJson('{ bad json');
  });

  // Non-string should reject
  await assert.rejects(async () => {
    await storage.importBackupJson(null);
  });

  // Empty or invalid route objects should simply be skipped
  const emptyBackup = JSON.stringify({ routes: [{ notAValidRoute: true }] });
  const count = await storage.importBackupJson(emptyBackup);
  assert.equal(count, 0);
});
