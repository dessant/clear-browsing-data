const optionKeys = [
  'dataTypes',
  'disabledDataTypes',
  'clearAllDataTypesAction',
  'clearSince',
  'closeTabs',
  'closePinnedTabs',
  'reloadTabs',
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
  localStorage: ['dark'],
  indexedDB: ['dark']
};

const sponsorLogoVariants = {
  lenso: ['dark']
};

const rasterDataTypeIcons = [];

const supportUrl = 'https://github.com/dessant/clear-browsing-data/issues';

const sponsors = ['lenso'];

const sponsorSites = {
  lenso: 'https://go.vapps.dev/c2/sponsor/lenso'
};

export {
  optionKeys,
  dataTypeIconAlias,
  dataTypeIconVariants,
  sponsorLogoVariants,
  rasterDataTypeIcons,
  supportUrl,
  sponsors,
  sponsorSites
};
