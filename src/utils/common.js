import browser from 'webextension-polyfill';

const getText = browser.i18n.getMessage;

module.exports = {
  getText
};
