import browser from 'webextension-polyfill';

const message = 'Add installTime, useCount and contribPageLastOpen';

const revision = 'BkFsUtt7f';
const downRevision = 'xO0Hh1Vm2';

const storage = browser.storage.local;

async function upgrade() {
  const changes = {};
  changes.installTime = new Date().getTime();
  changes.useCount = 0;
  changes.contribPageLastOpen = 0;

  changes.storageVersion = revision;
  return storage.set(changes);
}

async function downgrade() {
  const changes = {};
  await storage.remove(['installTime', 'useCount', 'contribPageLastOpen']);

  changes.storageVersion = downRevision;
  return storage.set(changes);
}

export {message, revision, upgrade, downgrade};
