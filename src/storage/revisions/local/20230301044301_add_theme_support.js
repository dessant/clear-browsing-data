import {getDayPrecisionEpoch} from 'utils/common';

const message = 'Add theme support';

const revision = '20230301044301_add_theme_support';

async function upgrade() {
  const changes = {
    appTheme: 'auto', // auto, light, dark
    showContribPage: true,
    contribPageLastAutoOpen: 0,
    confirmDataRemoval: true,
    showDataTypeIcons: true,
    pinActionToolbarOptions: false,
    pinActionToolbarContribute: true
  };

  const {installTime} = await browser.storage.local.get('installTime');
  changes.installTime = getDayPrecisionEpoch(installTime);

  changes.storageVersion = revision;
  return browser.storage.local.set(changes);
}

export {message, revision, upgrade};
