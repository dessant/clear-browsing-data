import browser from 'webextension-polyfill';

const message = 'Add closeTabs, closePinnedTabs and reloadTabs options';

const revision = 'kuZ4zBZDX';
const downRevision = 'ByCtvupNz';

const storage = browser.storage.sync;

async function upgrade() {
  const changes = {
    closeTabs: 'false', // 'all', 'active', 'allButActive', 'exit', 'false'
    closePinnedTabs: true,
    reloadTabs: 'false' // 'all', 'active', 'allButActive', 'false'
  };

  changes.storageVersion = revision;
  return storage.set(changes);
}

async function downgrade() {
  const changes = {};
  await storage.remove(['closeTabs', 'closePinnedTabs', 'reloadTabs']);

  changes.storageVersion = downRevision;
  return storage.set(changes);
}

export {message, revision, upgrade, downgrade};
