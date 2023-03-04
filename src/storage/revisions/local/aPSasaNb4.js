import {targetEnv} from 'utils/config';

const message = 'Add cacheStorage and remove serverBoundCertificates in Chrome';

const revision = 'aPSasaNb4';

async function upgrade() {
  const changes = {};

  if (targetEnv !== 'firefox') {
    const {dataTypes, disabledDataTypes} = await browser.storage.local.get([
      'dataTypes',
      'disabledDataTypes'
    ]);

    dataTypes.splice(dataTypes.indexOf('cache') + 1, 0, 'cacheStorage');

    changes.dataTypes = dataTypes.filter(function (item) {
      return item !== 'serverBoundCertificates';
    });
    changes.disabledDataTypes = disabledDataTypes.filter(function (item) {
      return item !== 'serverBoundCertificates';
    });
  }

  changes.storageVersion = revision;
  return browser.storage.local.set(changes);
}

export {message, revision, upgrade};
