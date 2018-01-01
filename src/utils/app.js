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

function getSelectOptionLabels(optionData) {
  const labels = {};
  for (const [group, values] of Object.entries(optionData)) {
    labels[group] = [];
    values.forEach(function(value) {
      labels[group].push({
        id: value,
        label: getText(`optionValue_${group}_${value}`)
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
  getSelectOptionLabels,
  showNotification
};
