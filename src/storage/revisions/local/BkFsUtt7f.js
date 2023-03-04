const message = 'Add installTime, useCount and contribPageLastOpen';

const revision = 'BkFsUtt7f';

async function upgrade() {
  const changes = {};
  changes.installTime = new Date().getTime();
  changes.useCount = 0;
  changes.contribPageLastOpen = 0;

  changes.storageVersion = revision;
  return browser.storage.local.set(changes);
}

export {message, revision, upgrade};
