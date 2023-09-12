import Queue from 'p-queue';

import {initStorage, migrateLegacyStorage} from 'storage/init';
import {isStorageReady} from 'storage/storage';
import storage from 'storage/storage';
import {getText, getActiveTab, getPlatform, isAndroid} from 'utils/common';
import {
  getEnabledDataTypes,
  showNotification,
  showPage,
  processAppUse,
  processMessageResponse
} from 'utils/app';
import {optionKeys} from 'utils/data';
import {targetEnv} from 'utils/config';

const queue = new Queue({concurrency: 1});

async function clearDataType(dataType, options = null, enDataTypes = null) {
  if (!options) {
    options = await storage.get(optionKeys);
  }

  await processAppUse({showContribPage: options.closeTabs !== 'exit'});

  let since;
  if (options.clearSince === 'epoch') {
    since = 0;
  } else {
    let timeDelta;
    switch (options.clearSince) {
      case '1minute':
        timeDelta = 1000 * 60;
        break;
      case '3minutes':
        timeDelta = 1000 * 60 * 3;
        break;
      case '10minutes':
        timeDelta = 1000 * 60 * 10;
        break;
      case '30minutes':
        timeDelta = 1000 * 60 * 30;
        break;
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
  // All *SELECTED* DataTypes
  if (dataType === 'allDataTypes') {
    // if enDataTypes is null
    if (!enDataTypes) {
      enDataTypes = await getEnabledDataTypes(options);
    }
    enDataTypes.forEach(function (item) {
      dataTypes[item] = true;
    });
  } else {
    dataTypes[dataType] = true;
  }

  let tempTabId;
  const {id: activeTabId} = await getActiveTab();
  const android = await isAndroid();

  if (options.closeTabs !== 'false') {
    if (['all', 'allButActive', 'exit'].includes(options.closeTabs)) {
      const backgroundWindowTabs = await browser.tabs.query({
        lastFocusedWindow: false
      });
      const tabIds = backgroundWindowTabs.reduce((results, tab) => {
        if (
          !tab.pinned ||
          options.closePinnedTabs ||
          options.closeTabs === 'exit'
        ) {
          results.push(tab.id);
        }
        return results;
      }, []);
      await browser.tabs.remove(tabIds);
    }

    const focusedWindowTabs = await browser.tabs.query({
      lastFocusedWindow: true
    });

    let pinnedTabIds = [];
    if (!options.closePinnedTabs || options.closeTabs === 'exit') {
      pinnedTabIds = focusedWindowTabs.reduce((results, tab) => {
        if (tab.pinned) {
          results.push(tab.id);
        }
        return results;
      }, []);
    }

    if (options.closeTabs === 'all') {
      if (!pinnedTabIds.length && !android) {
        ({id: tempTabId} = await browser.tabs.create({active: false}));
      }
      const tabIds = focusedWindowTabs.reduce((results, tab) => {
        if (!pinnedTabIds.includes(tab.id)) {
          results.push(tab.id);
        }
        return results;
      }, []);

      await browser.tabs.remove(tabIds);
    } else if (options.closeTabs === 'active') {
      if (!pinnedTabIds.length && focusedWindowTabs.length === 1 && !android) {
        ({id: tempTabId} = await browser.tabs.create({active: false}));
      }

      if (!pinnedTabIds.includes(activeTabId)) {
        await browser.tabs.remove(activeTabId);
      }
    } else if (options.closeTabs === 'allButActive') {
      const tabIds = focusedWindowTabs.reduce((results, tab) => {
        if (!pinnedTabIds.includes(tab.id) && tab.id !== activeTabId) {
          results.push(tab.id);
        }
        return results;
      }, []);

      await browser.tabs.remove(tabIds);
    } else if (options.closeTabs === 'exit') {
      if (!android) {
        ({id: tempTabId} = await browser.tabs.create({
          url: 'about:blank',
          active: false
        }));
      }

      await browser.tabs.remove(focusedWindowTabs.map(tab => tab.id));
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
    if (tempTabId) {
      browser.tabs.remove(tempTabId);
    }
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

async function onActionButtonClick() {
  const options = await storage.get(optionKeys);
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

async function processMessage(request, sender) {
  // Samsung Internet 13: extension messages are sometimes also dispatched
  // to the sender frame.
  if (sender.url === document.URL) {
    return;
  }

  if (targetEnv === 'samsung') {
    if (
      /^internet-extension:\/\/.*\/src\/action\/index.html/.test(
        sender.tab?.url
      )
    ) {
      // Samsung Internet 18: runtime.onMessage provides sender.tab
      // when the message is sent from the browser action,
      // and tab.id refers to a nonexistent tab.
      sender.tab = null;
    }

    if (sender.tab && sender.tab.id !== browser.tabs.TAB_ID_NONE) {
      // Samsung Internet 13: runtime.onMessage provides wrong tab index.
      sender.tab = await browser.tabs.get(sender.tab.id);
    }
  }

  if (request.id === 'actionPopupSubmit') {
    onActionPopupClick(request.item);
  } else if (request.id === 'getPlatform') {
    return getPlatform({fallback: false});
  } else if (request.id === 'optionChange') {
    await onOptionChange();
  } else if (request.id === 'showPage') {
    await showPage({url: request.url});
  }
}

function onMessage(request, sender, sendResponse) {
  const response = processMessage(request, sender);

  return processMessageResponse(response, sendResponse);
}

async function onOptionChange() {
  await setupUI();
}

async function setBrowserAction() {
  const options = await storage.get([
    'dataTypes',
    'disabledDataTypes',
    'clearAllDataTypesAction'
  ]);
  const enDataTypes = await getEnabledDataTypes(options);

  if (enDataTypes.length === 1) {
    browser.browserAction.setTitle({
      title: getText(`actionTitle_${enDataTypes[0]}`)
    });
    browser.browserAction.setPopup({popup: ''});
  } else if (
    options.clearAllDataTypesAction === 'main' &&
    enDataTypes.length > 1
  ) {
    browser.browserAction.setTitle({
      title: getText('actionTitle_allDataTypes')
    });
    browser.browserAction.setPopup({popup: ''});
  } else {
    browser.browserAction.setTitle({title: getText('extensionName')});
    if (enDataTypes.length === 0) {
      browser.browserAction.setPopup({popup: ''});
    } else {
      browser.browserAction.setPopup({popup: '/src/action/index.html'});
    }
  }
}

function addBrowserActionListener() {
  browser.browserAction.onClicked.addListener(onActionButtonClick);
}

function addMessageListener() {
  browser.runtime.onMessage.addListener(onMessage);
}

async function startup() {
  const options = await storage.get(optionKeys);
  if (options.clearOnBrowserStart) {
    await clearDataType('allDataTypes');
  }
}

async function setupUI() {
  await queue.add(setBrowserAction);
}

async function setup() {
  if (!(await isStorageReady())) {
    await migrateLegacyStorage();
    await initStorage();
  }

  await startup();
  await setupUI();
}

function init() {
  addBrowserActionListener();
  addMessageListener();

  setup();
}

init();
