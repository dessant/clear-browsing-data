import {targetEnv} from 'utils/config';

const message = 'Configure data types';

const revision = '20260222110606_configure_data_types';

async function upgrade() {
  const changes = {
    dataTypes: [
      'cookies',
      'history',
      'cache',
      'cacheStorage',
      'formData',
      'downloads',
      'serviceWorkers',
      'localStorage',
      'indexedDB',
      'webSQL',
      'fileSystems',
      'appcache',
      'pluginData'
    ],
    disabledDataTypes: []
  };

  const removeDataTypes =
    targetEnv === 'firefox'
      ? ['cacheStorage', 'webSQL', 'fileSystems', 'appcache']
      : ['pluginData'];

  changes.dataTypes = changes.dataTypes.filter(function (item) {
    return !removeDataTypes.includes(item);
  });

  changes.storageVersion = revision;
  return browser.storage.local.set(changes);
}

export {message, revision, upgrade};
