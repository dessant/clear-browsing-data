import {targetEnv} from 'utils/config';

const message = 'Enable localStorage and indexedDB for Firefox';

const revision = 'ByCtvupNz';

async function upgrade() {
  const changes = {};

  if (targetEnv === 'firefox') {
    const {dataTypes} = await browser.storage.local.get('dataTypes');

    changes.dataTypes = dataTypes.concat('localStorage', 'indexedDB');
  }

  changes.storageVersion = revision;
  return browser.storage.local.set(changes);
}

export {message, revision, upgrade};
