import browser from 'webextension-polyfill';
import {difference} from 'lodash-es';

import storage from 'storage/storage';
import {getText, createTab, getActiveTab} from 'utils/common';

async function getEnabledDataTypes(options) {
  if (typeof options === 'undefined') {
    options = await storage.get(['dataTypes', 'disabledDataTypes'], 'sync');
  }
  return difference(options.dataTypes, options.disabledDataTypes);
}

function getOptionLabels(data, scope = 'optionValue') {
  const labels = {};
  for (const [group, items] of Object.entries(data)) {
    labels[group] = [];
    items.forEach(function(value) {
      labels[group].push({
        id: value,
        label: getText(`${scope}_${group}_${value}`)
      });
    });
  }
  return labels;
}

function showNotification({message, messageId, title, type = 'info'}) {
  if (!title) {
    title = getText('extensionName');
  }
  if (messageId) {
    message = getText(messageId);
  }
  return browser.notifications.create(`cbd-notification-${type}`, {
    type: 'basic',
    title: title,
    message: message,
    iconUrl: '/src/icons/app/icon-48.png'
  });
}

async function showContributePage(action = false) {
  await storage.set({contribPageLastOpen: new Date().getTime()}, 'sync');
  const activeTab = await getActiveTab();
  let url = browser.extension.getURL('/src/contribute/index.html');
  if (action) {
    url = `${url}?action=${action}`;
  }
  await createTab(url, activeTab.index + 1);
}

export {
  getEnabledDataTypes,
  getOptionLabels,
  showNotification,
  showContributePage
};
