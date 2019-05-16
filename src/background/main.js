import browser from 'webextension-polyfill';

import {initStorage} from 'storage/init';
import storage from 'storage/storage';
import {getText, getActiveTab} from 'utils/common';
import {
  getEnabledDataTypes,
  showNotification,
  showContributePage
} from 'utils/app';
import {optionKeys} from 'utils/data';
import {targetEnv} from 'utils/config';

async function clearDataType(dataType, options = null, enDataTypes = null) {
  if (!options) {
    options = await storage.get(optionKeys, 'sync');
  }

  let {useCount} = await storage.get('useCount', 'sync');
  useCount += 1;
  await storage.set({useCount}, 'sync');
  if ([10, 50].includes(useCount) && options.closeTabs !== 'exit') {
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
      case '90days':
        timeDelta = 1000 * 60 * 60 * 24 * 90;
        break;
      case '365days':
        timeDelta = 1000 * 60 * 60 * 24 * 365;
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

  let tempTabId;
  const {id: activeTabId} = await getActiveTab();

  if (options.closeTabs !== 'false') {
    if (['all', 'allButActive', 'exit'].includes(options.closeTabs)) {
      const windows = await browser.windows.getAll({populate: true});
      for (const window of windows) {
        if (!window.focused) {
          const tabIds = window.tabs.reduce((results, tab) => {
            if (!tab.pinned || options.closePinnedTabs) {
              results.push(tab.id);
            }
            return results;
          }, []);
          await browser.tabs.remove(tabIds);
        }
      }
    }

    const activeWindow = await browser.windows.getLastFocused({populate: true});

    let pinnedTabIds = [];
    if (!options.closePinnedTabs) {
      pinnedTabIds = activeWindow.tabs.reduce((results, tab) => {
        if (tab.pinned) {
          results.push(tab.id);
        }
        return results;
      }, []);
    }

    if (options.closeTabs === 'all') {
      if (!pinnedTabIds.length) {
        ({id: tempTabId} = await browser.tabs.create({active: false}));
      }
      const tabIds = activeWindow.tabs.reduce((results, tab) => {
        if (!pinnedTabIds.includes(tab.id)) {
          results.push(tab.id);
        }
        return results;
      }, []);

      await browser.tabs.remove(tabIds);
    } else if (options.closeTabs === 'active') {
      if (!pinnedTabIds.length && activeWindow.tabs.length === 1) {
        ({id: tempTabId} = await browser.tabs.create({active: false}));
      }

      if (!pinnedTabIds.includes(activeTabId)) {
        await browser.tabs.remove(activeTabId);
      }
    } else if (options.closeTabs === 'allButActive') {
      const tabIds = activeWindow.tabs.reduce((results, tab) => {
        if (!pinnedTabIds.includes(tab.id) && tab.id !== activeTabId) {
          results.push(tab.id);
        }
        return results;
      }, []);

      await browser.tabs.remove(tabIds);
    } else if (options.closeTabs === 'exit') {
      ({id: tempTabId} = await browser.tabs.create({
        url: 'about:blank',
        active: false
      }));
      await browser.tabs.remove(activeWindow.tabs.map(tab => tab.id));
    }
  }

  try {
    if (dataTypes.localStorage && since && targetEnv === 'firefox') {
      await browser.browsingData.removeLocalStorage({});
      delete dataTypes.localStorage;
    }
    if (Object.keys(dataTypes).length) {
      await browser.browsingData.remove({since}, dataTypes);
    }
  } catch (err) {
    await showNotification({
      messageId: 'error_dataTypeNotCleared',
      type: 'error'
    });
    throw err;
  }

  if (options.closeTabs === 'exit') {
    browser.tabs.remove(tempTabId);
    return;
  }

  if (options.notifyOnSuccess) {
    const notification = await showNotification({
      messageId: 'info_dataTypeCleared'
    });
    window.setTimeout(() => {
      browser.notifications.clear(notification);
    }, 6000); // 6 seconds
  }

  if (options.reloadTabs !== 'false') {
    if (options.reloadTabs === 'all') {
      const reloadingTabs = [];
      const tabs = await browser.tabs.query({});
      for (const tab of tabs) {
        if (tab.id !== tempTabId) {
          reloadingTabs.push(browser.tabs.reload(tab.id, {bypassCache: true}));
        }
      }

      await Promise.all(reloadingTabs);
    } else if (options.reloadTabs === 'active') {
      if (['allButActive', 'false'].includes(options.closeTabs)) {
        await browser.tabs.reload(activeTabId, {bypassCache: true});
      }
    } else if (options.reloadTabs === 'allButActive') {
      const reloadingTabs = [];
      const tabs = await browser.tabs.query({});
      for (const tab of tabs) {
        if (![activeTabId, tempTabId].includes(tab.id)) {
          reloadingTabs.push(browser.tabs.reload(tab.id, {bypassCache: true}));
        }
      }

      await Promise.all(reloadingTabs);
    }
  }
}

async function onActionClick() {
  const options = await storage.get(optionKeys, 'sync');
  const enDataTypes = await getEnabledDataTypes(options);

  if (enDataTypes.length === 0) {
    await showNotification({
      messageId: 'error_allDataTypesDisabled',
      type: 'error'
    });
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
  await clearDataType(dataType);
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
  await initStorage('sync');
  await setBrowserAction();
  addStorageListener();
  addMessageListener();
}

document.addEventListener('DOMContentLoaded', onLoad);
