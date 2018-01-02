import browser from 'webextension-polyfill';

const getText = browser.i18n.getMessage;

function createTab(url, index, active = true) {
  const props = {url: url, active: active};
  if (typeof index !== 'undefined') {
    props['index'] = index;
  }
  return browser.tabs.create(props);
}

async function getActiveTab() {
  const [tab] = await browser.tabs.query({
    lastFocusedWindow: true,
    active: true
  });
  return tab;
}

module.exports = {
  getText,
  createTab,
  getActiveTab
};
