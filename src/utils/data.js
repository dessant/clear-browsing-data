const optionKeys = [
  'dataTypes',
  'disabledDataTypes',
  'clearAllDataTypesAction',
  'clearSince',
  'closeTabs',
  'closePinnedTabs',
  'reloadTabs',
  'clearOnBrowserStart',
  'notifyOnSuccess',
  'showDataTypeIcons',
  'confirmDataRemoval',
  'appTheme',
  'showContribPage',
  'pinActionToolbarOptions',
  'pinActionToolbarContribute'
];

const dataTypeIconAlias = {};

const dataTypeIconVariants = {
  appcache: ['dark'],
  cookies: ['dark'],
  history: ['dark'],
  cache: ['dark'],
  cacheStorage: ['dark'],
  fileSystems: ['dark'],
  formData: ['dark'],
  downloads: ['dark'],
  serviceWorkers: ['dark'],
  webSQL: ['dark'],
  pluginData: ['dark'],
  passwords: ['dark'],
  localStorage: ['dark'],
  indexedDB: ['dark']
};

const rasterDataTypeIcons = [];

const supportUrl = 'https://github.com/dessant/clear-browsing-data/issues';

export {
  optionKeys,
  dataTypeIconAlias,
  dataTypeIconVariants,
  rasterDataTypeIcons,
  supportUrl
};
