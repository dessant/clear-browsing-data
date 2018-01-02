import browser from 'webextension-polyfill';
import _ from 'lodash';

import storage from 'storage/storage';
import {getText} from 'utils/common';

async function getEnabledDataTypes(options) {
  if (typeof options === 'undefined') {
    options = await storage.get(['dataTypes', 'disabledDataTypes'], 'sync');
  }
  return _.difference(options.dataTypes, options.disabledDataTypes);
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

function showNotification(messageId) {
  return browser.notifications.create('cbd-notification', {
    type: 'basic',
    title: getText('extensionName'),
    message: getText(messageId),
    iconUrl: '/src/icons/app/icon-48.png'
  });
}

module.exports = {
  getEnabledDataTypes,
  getOptionLabels,
  showNotification
};
