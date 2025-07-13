import { DBConfig } from 'ngx-indexed-db';

const storeNameSleeperPlayers = 'sleeperPlayers';
const storeNameSchedule = 'schedule';
const storeNamePlayers = 'players';
const storeNameSettings = 'settings';
const storeNameDrafts = 'drafts';
const storeNameLastUpdate = 'lastUpdate';

export const INDEXED_DB_CONFIG: DBConfig = {
  name: 'IndexedDB',
  version: 1,
  objectStoresMeta: [
    {
      store: storeNameSleeperPlayers,
      storeConfig: { keyPath: 'player_id', autoIncrement: false },
      storeSchema: [],
    },
    {
      store: storeNameSchedule,
      storeConfig: { keyPath: 'objectId', autoIncrement: false },
      storeSchema: [],
    },
    {
      store: storeNamePlayers,
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [],
    },
    {
      store: storeNameSettings,
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [],
    },
    {
      store: storeNameDrafts,
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [],
    },
    {
      store: storeNameLastUpdate,
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [],
    },
  ],
};

export const STORE_NAME_SLEEPER_PLAYERS = storeNameSleeperPlayers;
export const STORE_NAME_SCHEDULE = storeNameSchedule;
export const STORE_NAME_PLAYERS = storeNamePlayers;
export const STORE_NAME_SETTINGS = storeNameSettings;
export const STORE_NAME_DRAFTS = storeNameDrafts;
export const STORE_NAME_LAST_UPDATE = storeNameLastUpdate;
