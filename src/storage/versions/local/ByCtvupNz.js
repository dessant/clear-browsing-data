import browser from 'webextension-polyfill';

import {targetEnv} from 'utils/config';

const message = 'Enable localStorage and indexedDB for Firefox';

const revision = 'ByCtvupNz';
const downRevision = 'BkFsUtt7f';

const storage = browser.storage.local;

async function upgrade() {
  const changes = {};

  if (targetEnv === 'firefox') {
    const {dataTypes} = await storage.get('dataTypes');

    changes.dataTypes = dataTypes.concat('localStorage', 'indexedDB');
  }

  changes.storageVersion = revision;
  return storage.set(changes);
}

async function downgrade() {
  const changes = {};

  if (targetEnv === 'firefox') {
    const {dataTypes, disabledDataTypes} = await storage.get([
      'dataTypes',
      'disabledDataTypes'
    ]);

    const unsupportedDataTypes = ['indexedDB', 'localStorage'];
    changes.dataTypes = dataTypes.filter(
      x => unsupportedDataTypes.indexOf(x) === -1
    );
    changes.disabledDataTypes = disabledDataTypes.filter(
      x => unsupportedDataTypes.indexOf(x) === -1
    );
  }

  changes.storageVersion = downRevision;
  return storage.set(changes);
}

module.exports = {
  message,
  revision,
  upgrade,
  downgrade
};
