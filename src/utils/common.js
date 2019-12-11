import browser from 'webextension-polyfill';

const getText = browser.i18n.getMessage;

async function createTab(
  url,
  {index = null, active = true, openerTabId = null} = {}
) {
  const props = {url, active};
  if (index !== null) {
    props.index = index;
  }
  if (
    openerTabId !== null &&
    openerTabId !== browser.tabs.TAB_ID_NONE &&
    !(await isAndroid())
  ) {
    props.openerTabId = openerTabId;
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

async function isAndroid() {
  const {os} = await browser.runtime.getPlatformInfo();
  return os === 'android';
}

export {getText, createTab, getActiveTab};
