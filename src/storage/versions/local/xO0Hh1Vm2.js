import browser from 'webextension-polyfill';

import {targetEnv} from 'utils/config';

const message = 'Initial version';

const revision = 'xO0Hh1Vm2';
const downRevision = null;

const storage = browser.storage.local;

async function upgrade() {
  let dataTypes = [
    'cookies',
    'history',
    'cache',
    'formData',
    'downloads',
    'serviceWorkers',
    'localStorage',
    'indexedDB',
    'fileSystems',
    'pluginData',
    'webSQL',
    'passwords',
    'appcache',
    'serverBoundCertificates'
  ];
  let disabledDataTypes = [
    'appcache',
    'fileSystems',
    'passwords',
    'pluginData',
    'serverBoundCertificates',
    'webSQL'
  ];

  if (targetEnv === 'firefox') {
    const unsupportedDataTypes = [
      'appcache',
      'fileSystems',
      'indexedDB',
      'localStorage',
      'serverBoundCertificates',
      'webSQL'
    ];
    dataTypes = dataTypes.filter(x => unsupportedDataTypes.indexOf(x) === -1);
    disabledDataTypes = disabledDataTypes.filter(
      x => unsupportedDataTypes.indexOf(x) === -1
    );
  }

  const changes = {
    dataTypes,
    disabledDataTypes,
    clearAllDataTypesAction: 'sub', // 'main', 'sub', 'false'
    clearSince: 'epoch', // '1hour', '3hours', '1day', '1week', '4weeks', '90days', '365days', 'epoch'
    notifyOnSuccess: true
  };

  changes.storageVersion = revision;
  return storage.set(changes);
}

async function downgrade() {
  return storage.clear();
}

module.exports = {
  message,
  revision,
  upgrade,
  downgrade
};
