import browser from 'webextension-polyfill';

import storage from 'storage/storage';
import {getText} from 'utils/common';
import {
  getEnabledDataTypes,
  showNotification,
  showContributePage
} from 'utils/app';
import {optionKeys} from 'utils/data';

async function clearDataType(dataType, options, enDataTypes = null) {
  let {useCount} = await storage.get('useCount', 'sync');
  useCount += 1;
  await storage.set({useCount}, 'sync');
  if ([10, 50].includes(useCount)) {
    await showContributePage('clear');
  }

  let since;
  if (options.clearSince === 'epoch') {
    since = 0;
  } else {
    let timeDelta;
    switch (options.clearSince) {
      case '1hour':
        timeDelta = 1000 * 60 * 60;
        break;
      case '3hours':
        timeDelta = 1000 * 60 * 60 * 3;
        break;
      case '1day':
        timeDelta = 1000 * 60 * 60 * 24;
        break;
      case '1week':
        timeDelta = 1000 * 60 * 60 * 24 * 7;
        break;
      case '4weeks':
        timeDelta = 1000 * 60 * 60 * 24 * 7 * 4;
        break;
    }
    since = new Date().getTime() - timeDelta;
  }

  const dataTypes = {};
  if (dataType === 'allDataTypes') {
    if (!enDataTypes) {
      enDataTypes = await getEnabledDataTypes(options);
    }
    enDataTypes.forEach(function(item) {
      dataTypes[item] = true;
    });
  } else {
    dataTypes[dataType] = true;
  }

  try {
    await browser.browsingData.remove({since}, dataTypes);
  } catch (e) {
    console.log(e);
    await showNotification('error_dataTypeNotCleared');
    return;
  }

  if (options.notifyOnSuccess) {
    await showNotification('info_dataTypeCleared');
  }
}

async function onActionClick() {
  const options = await storage.get(optionKeys, 'sync');
  const enDataTypes = await getEnabledDataTypes(options);

  if (enDataTypes.length === 0) {
    await showNotification('error_allDataTypesDisabled');
    return;
  }

  let dataType;
  if (options.clearAllDataTypesAction === 'main' && enDataTypes.length > 1) {
    dataType = 'allDataTypes';
  } else {
    dataType = enDataTypes[0];
  }

  await clearDataType(dataType, options, enDataTypes);
}

async function onActionPopupClick(dataType) {
  const options = await storage.get(
    ['dataTypes', 'disabledDataTypes', 'clearSince', 'notifyOnSuccess'],
    'sync'
  );
  await clearDataType(dataType, options);
}

function onMessage(request, sender, sendResponse) {
  if (request.id === 'actionPopupSubmit') {
    onActionPopupClick(request.item);
  }
}

async function onStorageChange(changes, area) {
  await setBrowserAction();
}

async function setBrowserAction() {
  const options = await storage.get(
    ['dataTypes', 'disabledDataTypes', 'clearAllDataTypesAction'],
    'sync'
  );
  const enDataTypes = await getEnabledDataTypes(options);
  const hasListener = browser.browserAction.onClicked.hasListener(
    onActionClick
  );

  if (enDataTypes.length === 1) {
    if (!hasListener) {
      browser.browserAction.onClicked.addListener(onActionClick);
    }
    browser.browserAction.setTitle({
      title: getText(`actionTitle_${enDataTypes[0]}`)
    });
    browser.browserAction.setPopup({popup: ''});
    return;
  }

  if (options.clearAllDataTypesAction === 'main' && enDataTypes.length > 1) {
    if (!hasListener) {
      browser.browserAction.onClicked.addListener(onActionClick);
    }
    browser.browserAction.setTitle({
      title: getText('actionTitle_allDataTypes')
    });
    browser.browserAction.setPopup({popup: ''});
    return;
  }

  browser.browserAction.setTitle({title: getText('extensionName')});
  if (enDataTypes.length === 0) {
    if (!hasListener) {
      browser.browserAction.onClicked.addListener(onActionClick);
    }
    browser.browserAction.setPopup({popup: ''});
  } else {
    if (hasListener) {
      browser.browserAction.onClicked.removeListener(onActionClick);
    }
    browser.browserAction.setPopup({popup: '/src/action/index.html'});
  }
}

function addStorageListener() {
  browser.storage.onChanged.addListener(onStorageChange);
}

function addMessageListener() {
  browser.runtime.onMessage.addListener(onMessage);
}

async function onLoad() {
  await storage.init('sync');
  await setBrowserAction();
  addStorageListener();
  addMessageListener();
}

document.addEventListener('DOMContentLoaded', onLoad);
