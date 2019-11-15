import browser from 'webextension-polyfill';

import {targetEnv} from 'utils/config';

const message = 'Add cacheStorage and remove serverBoundCertificates in Chrome';

const revision = 'aPSasaNb4';
const downRevision = 'kuZ4zBZDX';

const storage = browser.storage.local;

async function upgrade() {
  const changes = {};

  if (targetEnv !== 'firefox') {
    const {dataTypes, disabledDataTypes} = await storage.get([
      'dataTypes',
      'disabledDataTypes'
    ]);

    dataTypes.splice(dataTypes.indexOf('cache') + 1, 0, 'cacheStorage');

    changes.dataTypes = dataTypes.filter(function(item) {
      return item !== 'serverBoundCertificates';
    });
    changes.disabledDataTypes = disabledDataTypes.filter(function(item) {
      return item !== 'serverBoundCertificates';
    });
  }

  changes.storageVersion = revision;
  return storage.set(changes);
}

async function downgrade() {
  const changes = {};

  const {dataTypes, disabledDataTypes} = await storage.get([
    'dataTypes',
    'disabledDataTypes'
  ]);

  if (targetEnv !== 'firefox') {
    changes.dataTypes = dataTypes
      .filter(function(item) {
        return item !== 'cacheStorage';
      })
      .concat('serverBoundCertificates');
    changes.disabledDataTypes = disabledDataTypes
      .filter(function(item) {
        return item !== 'cacheStorage';
      })
      .concat('serverBoundCertificates');
  }

  changes.storageVersion = downRevision;
  return storage.set(changes);
}

export {message, revision, upgrade, downgrade};
