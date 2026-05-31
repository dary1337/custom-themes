import { STORAGE_SCHEMA_VERSION } from '@/shared/constants';
import { beforeEach, describe, expect, it } from 'vitest';
import { installChromeMock } from './chrome-mock';

async function freshStorage() {
	return import('@/services/storage');
}

describe('storage migration', () => {
	let store: Record<string, unknown>;

	beforeEach(() => {
		({ store } = installChromeMock());
	});

	it('backfills missing UserTheme fields from legacy data', async () => {
		store.userSettings = {
			abc: {
				id: 'abc',
				name: 'Legacy Local',
				checked: true,
				sourceCSS: 'body{}',
				local: true,
			},
			'1706780460': {
				id: 1706780460,
				name: 'Repo Theme',
				checked: true,
				compiledCss: 'x',
				version: '1.0.0',
			},
		};

		const storage = await freshStorage();
		await storage.migrateStorage();

		const migrated = await storage.getUserSettings();
		expect(migrated.abc).toMatchObject({
			id: 'abc',
			name: 'Legacy Local',
			link: '',
			checked: true,
			compiledCss: '',
			sourceCSS: 'body{}',
			edited: false,
			local: true,
		});
		// numeric id preserved untouched
		expect(migrated['1706780460'].id).toBe(1706780460);
		expect(migrated['1706780460'].version).toBe('1.0.0');
	});

	it('stamps schema version and is idempotent', async () => {
		const storage = await freshStorage();
		await storage.migrateStorage();

		const settings = await storage.getExtensionSettings();
		expect(settings.storageSchemaVersion).toBe(STORAGE_SCHEMA_VERSION);

		// Second run must not throw or change the version.
		await storage.migrateStorage();
		const again = await storage.getExtensionSettings();
		expect(again.storageSchemaVersion).toBe(STORAGE_SCHEMA_VERSION);
	});

	it('skips migration when already at current version', async () => {
		store.extensionSettings = {
			storageSchemaVersion: STORAGE_SCHEMA_VERSION,
		};
		store.userSettings = { x: { id: 'x', name: 'untouched' } };

		const storage = await freshStorage();
		await storage.migrateStorage();

		// userSettings left as-is because migration short-circuits
		const migrated = await storage.getUserSettings();
		expect(migrated.x).toEqual({ id: 'x', name: 'untouched' });
	});

	it('provides default extension settings', async () => {
		const storage = await freshStorage();
		const settings = await storage.getExtensionSettings();
		expect(settings).toMatchObject({
			useLocalJsonRepo: false,
			checkForUpdate: true,
			showScreenshots: true,
			backgroundUpdate: true,
		});
	});

	it('resetAll clears user settings and re-stamps version', async () => {
		store.userSettings = { x: { id: 'x', name: 'gone' } };
		const storage = await freshStorage();
		await storage.resetAll();

		expect(await storage.getUserSettings()).toEqual({});
		const settings = await storage.getExtensionSettings();
		expect(settings.storageSchemaVersion).toBe(STORAGE_SCHEMA_VERSION);
	});
});
