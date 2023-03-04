const message = 'Add closeTabs, closePinnedTabs and reloadTabs options';

const revision = 'kuZ4zBZDX';

async function upgrade() {
  const changes = {
    closeTabs: 'false', // 'all', 'active', 'allButActive', 'exit', 'false'
    closePinnedTabs: true,
    reloadTabs: 'false' // 'all', 'active', 'allButActive', 'false'
  };

  changes.storageVersion = revision;
  return browser.storage.local.set(changes);
}

export {message, revision, upgrade};
