# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [4.0.0](https://github.com/dessant/clear-browsing-data/compare/v3.2.0...v4.0.0) (2023-03-04)


### ⚠ BREAKING CHANGES

* browser versions older than Chrome 92, Edge 92,
Firefox 91, and Opera 78 are no longer supported

### Features

* Dark mode
* Ask before removing data
* Option to hide data type icons
* migrate to Vuetify ([2739cad](https://github.com/dessant/clear-browsing-data/commit/2739cad852328ea7635757612e25e0cf477ef778))


### Bug Fixes

* update extension CSP ([5575014](https://github.com/dessant/clear-browsing-data/commit/557501492e0366c954ae2728a94b2c9a7728dd4b))

## [3.2.0](https://github.com/dessant/clear-browsing-data/compare/v3.1.1...v3.2.0) (2020-09-28)


### Features

* add support for Android ([30b5e88](https://github.com/dessant/clear-browsing-data/commit/30b5e8802b90661386e1e7782df20e0c993736e0))
* support Chrome Incognito ([4dcc944](https://github.com/dessant/clear-browsing-data/commit/4dcc944241765acadb0bd43caac80bc99e577f33))


### Bug Fixes

* increase favicon size ([7b8c254](https://github.com/dessant/clear-browsing-data/commit/7b8c254f4da0b3e9fa90bbb1b6ffc8cc91a3c2aa))

### [3.1.1](https://github.com/dessant/clear-browsing-data/compare/v3.1.0...v3.1.1) (2019-12-19)


### Bug Fixes

* adjust options page layout ([4562e99](https://github.com/dessant/clear-browsing-data/commit/4562e997c8196030a844f3f742ce4a34b484693f))
* flip button positions ([95b62ab](https://github.com/dessant/clear-browsing-data/commit/95b62ab26973eaf93acc392044a2bf884a63b53f))

## [3.1.0](https://github.com/dessant/clear-browsing-data/compare/v3.0.0...v3.1.0) (2019-12-11)


### Features

* add overflow menu with options and website buttons ([82f3f3c](https://github.com/dessant/clear-browsing-data/commit/82f3f3ca4ac66292644a6e027798b6c503234863))

## [3.0.0](https://github.com/dessant/clear-browsing-data/compare/v2.4.1...v3.0.0) (2019-11-15)


### ⚠ BREAKING CHANGES

* browser versions before Chrome 76, Firefox 68 and Opera 63
are no longer supported.

### Features

* add cacheStorage and remove serverBoundCertificates in Chrome and Opera ([c102d6c](https://github.com/dessant/clear-browsing-data/commit/c102d6cabf684fa9d7526a1616dcfe74721739f3))

### [2.4.1](https://github.com/dessant/clear-browsing-data/compare/v2.4.0...v2.4.1) (2019-11-10)


### Bug Fixes

* hide scrollbar during action popup height transitions ([65b2d82](https://github.com/dessant/clear-browsing-data/commit/65b2d828f06ac2811907b33b76d458fcba95318f))
* increase spacing between option components ([cba69fe](https://github.com/dessant/clear-browsing-data/commit/cba69fe14f8cb68740d8819aa3a235de5bc87551))
* remove unused permission ([1ddf2bd](https://github.com/dessant/clear-browsing-data/commit/1ddf2bdc7e81906dfebea3b5ae244aeb730d4e31))

## [2.4.0](https://github.com/dessant/clear-browsing-data/compare/v2.3.0...v2.4.0) (2019-09-06)


### Features

* clear browsing data from the past 1, 3, 10, and 30 minutes ([1d91308](https://github.com/dessant/clear-browsing-data/commit/1d91308)), closes [#17](https://github.com/dessant/clear-browsing-data/issues/17)

## [2.3.0](https://github.com/dessant/clear-browsing-data/compare/v2.2.0...v2.3.0) (2019-05-24)


### Features

* build with travis ([ebf3318](https://github.com/dessant/clear-browsing-data/commit/ebf3318))



## [2.2.0](https://github.com/dessant/clear-browsing-data/compare/v2.1.3...v2.2.0) (2019-05-16)


### Features

* add options for closing and reloading tabs ([62b780d](https://github.com/dessant/clear-browsing-data/commit/62b780d))
* automatically remove success notification ([8b912f1](https://github.com/dessant/clear-browsing-data/commit/8b912f1)), closes [#8](https://github.com/dessant/clear-browsing-data/issues/8)
* change license to GPLv3 ([4d0b7fb](https://github.com/dessant/clear-browsing-data/commit/4d0b7fb))
* update dependencies and refresh user interface ([ca31096](https://github.com/dessant/clear-browsing-data/commit/ca31096))



<a name="2.1.3"></a>
## [2.1.3](https://github.com/dessant/clear-browsing-data/compare/v2.1.2...v2.1.3) (2018-07-12)



<a name="2.1.2"></a>
## [2.1.2](https://github.com/dessant/clear-browsing-data/compare/v2.1.1...v2.1.2) (2018-05-01)


### Bug Fixes

* set default background color ([4723ed8](https://github.com/dessant/clear-browsing-data/commit/4723ed8)), closes [#6](https://github.com/dessant/clear-browsing-data/issues/6)



<a name="2.1.1"></a>
## [2.1.1](https://github.com/dessant/clear-browsing-data/compare/v2.1.0...v2.1.1) (2018-04-30)


### Bug Fixes

* add labels for select components and fix their position ([3deba4e](https://github.com/dessant/clear-browsing-data/commit/3deba4e))
* copy assets as the last build step ([2981d71](https://github.com/dessant/clear-browsing-data/commit/2981d71))



<a name="2.1.0"></a>
# [2.1.0](https://github.com/dessant/clear-browsing-data/compare/v2.0.0...v2.1.0) (2018-03-10)


### Bug Fixes

* do not pass `since` when removing localStorage in Firefox ([4e5e500](https://github.com/dessant/clear-browsing-data/commit/4e5e500))
* update dependencies ([853e367](https://github.com/dessant/clear-browsing-data/commit/853e367))


### Features

* clear browsing data from the past 90 and 365 days ([3018c89](https://github.com/dessant/clear-browsing-data/commit/3018c89)), closes [#5](https://github.com/dessant/clear-browsing-data/issues/5)



<a name="2.0.0"></a>
# [2.0.0](https://github.com/dessant/clear-browsing-data/compare/v1.1.0...v2.0.0) (2018-01-20)


### Features

* drop support for older Firefox versions ([21a929e](https://github.com/dessant/clear-browsing-data/commit/21a929e))
* enable Local Storage and IndexedDB clearing for Firefox ([a6306be](https://github.com/dessant/clear-browsing-data/commit/a6306be))


### BREAKING CHANGES

* Firefox < 57 is not supported anymore.



<a name="1.1.0"></a>
# [1.1.0](https://github.com/dessant/clear-browsing-data/compare/v1.0.0...v1.1.0) (2018-01-03)


### Bug Fixes

* add app favicon ([06db846](https://github.com/dessant/clear-browsing-data/commit/06db846))
* follow md spec for title and icon size ([ffc4623](https://github.com/dessant/clear-browsing-data/commit/ffc4623))
* reduce size of imported background code ([7a83c56](https://github.com/dessant/clear-browsing-data/commit/7a83c56))
* show options in a new tab ([5531604](https://github.com/dessant/clear-browsing-data/commit/5531604))
* switch to ext-components ([df65bac](https://github.com/dessant/clear-browsing-data/commit/df65bac))
* typo ([fbfad8c](https://github.com/dessant/clear-browsing-data/commit/fbfad8c))
* use correct document scale on hdpi screens ([3956b83](https://github.com/dessant/clear-browsing-data/commit/3956b83))


### Features

* add contribution page ([94c70ee](https://github.com/dessant/clear-browsing-data/commit/94c70ee))



<a name="1.0.0"></a>
# 1.0.0 (2017-09-24)
