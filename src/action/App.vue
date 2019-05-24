<!-- prettier-ignore -->
<template>
<div id="app" v-show="dataLoaded">
  <div class="header">
    <div class="title">
      {{ getText('extensionName') }}
    </div>
    <div class="header-buttons">
      <v-icon-button class="contribute-button"
          :ripple="false"
          src="/src/contribute/assets/heart.svg"
          @click="showContribute">
      </v-icon-button>

      <v-icon-button class="settings-button"
          :ripple="false"
          src="/src/icons/misc/time.svg"
          @click="showSettings = !showSettings">
      </v-icon-button>
    </div>
  </div>

  <transition name="settings"
      @after-enter="handleSizeChange"
      @after-leave="handleSizeChange">
    <div class="settings" v-if="showSettings">
      <v-select :label="getText('optionTitle_clearSince')"
          v-model="clearSince"
          :options="selectOptions.clearSince">
      </v-select>
    </div>
  </transition>

  <div class="list-padding-top"></div>
  <ul class="mdc-list list list-bulk-button" v-if="clearAllDataTypes">
    <li class="mdc-list-item list-item"
        @click="selectItem('allDataTypes')">
      <img class="mdc-list-item__graphic list-item-icon"
          src="/src/icons/dataTypes/allDataTypes.svg">
      {{ getText('menuItemTitle_allDataTypes') }}
    </li>
  </ul>
  <ul class="mdc-list list list-separator"
      v-if="clearAllDataTypes || hasScrollBar">
    <li role="separator" class="mdc-list-divider"></li>
  </ul>
  <div class="list-items-wrap" ref="items" :class="listClasses">
    <resize-observer @notify="handleSizeChange"></resize-observer>
    <ul class="mdc-list list list-items">
      <li class="mdc-list-item list-item"
          v-for="dataType in dataTypes"
          :key="dataType.id"
          @click="selectItem(dataType)">
        <img class="mdc-list-item__graphic list-item-icon"
            :src="`/src/icons/dataTypes/${dataType}.svg`">
        {{ getText(`menuItemTitle_${dataType}`) }}
      </li>
    </ul>
  </div>
</div>
</template>

<script>
import browser from 'webextension-polyfill';
import {ResizeObserver} from 'vue-resize';
import {MDCList} from '@material/list';
import {MDCRipple} from '@material/ripple';
import {IconButton, Select} from 'ext-components';

import storage from 'storage/storage';
import {
  getEnabledDataTypes,
  getOptionLabels,
  showContributePage
} from 'utils/app';
import {getText} from 'utils/common';
import {optionKeys} from 'utils/data';

export default {
  components: {
    [IconButton.name]: IconButton,
    [Select.name]: Select,
    [ResizeObserver.name]: ResizeObserver
  },

  data: function() {
    return {
      dataLoaded: false,

      showSettings: false,
      selectOptions: getOptionLabels({
        clearSince: [
          '1hour',
          '3hours',
          '1day',
          '1week',
          '4weeks',
          '90days',
          '365days',
          'epoch'
        ]
      }),
      hasScrollBar: false,
      isPopup: false,

      dataTypes: [],
      clearAllDataTypes: false,
      clearSince: ''
    };
  },

  computed: {
    listClasses: function() {
      return {
        'list-items-max-height': this.isPopup
      };
    }
  },

  methods: {
    getText,

    selectItem: function(item) {
      browser.runtime.sendMessage({
        id: 'actionPopupSubmit',
        item
      });

      this.closeAction();
    },

    showContribute: async function() {
      await showContributePage();
      this.closeAction();
    },

    closeAction: async function() {
      if (!this.isPopup) {
        browser.tabs.remove((await browser.tabs.getCurrent()).id);
      } else {
        window.close();
      }
    },

    handleSizeChange: function() {
      const items = this.$refs.items;
      this.hasScrollBar = items.scrollHeight > items.clientHeight;
    }
  },

  created: async function() {
    this.isPopup = !(await browser.tabs.getCurrent());
    if (!this.isPopup) {
      document.documentElement.style.height = '100%';
      document.body.style.minWidth = 'initial';
    }

    const options = await storage.get(optionKeys, 'sync');
    const enDataTypes = await getEnabledDataTypes(options);

    this.dataTypes = enDataTypes;
    this.clearAllDataTypes = options.clearAllDataTypesAction === 'sub';
    this.clearSince = options.clearSince;

    this.$watch('clearSince', async function(value) {
      await storage.set({clearSince: value}, 'sync');
    });

    this.dataLoaded = true;
  },

  mounted: function() {
    window.setTimeout(() => {
      for (const listEl of document.querySelectorAll(
        '.list-bulk-button, .list-items'
      )) {
        const list = new MDCList(listEl);
        for (const el of list.listElements) {
          MDCRipple.attachTo(el);
        }
      }
    }, 500);
  }
};
</script>

<style lang="scss">
$mdc-theme-primary: #1abc9c;

@import '@material/list/mdc-list';
@import '@material/select/mdc-select';
@import '@material/icon-button/mixins';
@import '@material/theme/mixins';
@import '@material/typography/mixins';

@import 'vue-resize/dist/vue-resize';

body,
#app {
  height: 100%;
}

#app {
  display: flex;
  flex-direction: column;
}

body {
  margin: 0;
  min-width: 355px;
  overflow: hidden;
  @include mdc-typography-base;
  font-size: 100%;
  background-color: #ffffff;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;
  padding-top: 16px;
  padding-left: 16px;
  padding-right: 12px;
}

.title {
  overflow: hidden;
  text-overflow: ellipsis;
  @include mdc-typography(headline6);
  @include mdc-theme-prop(color, text-primary-on-light);
}

.header-buttons {
  display: flex;
  align-items: center;
  height: 24px;
  margin-left: 56px;
  @media (max-width: 354px) {
    margin-left: 32px;
  }
}

.contribute-button,
.settings-button {
  @include mdc-icon-button-size(24px, 24px, 8px);
}

.contribute-button {
  margin-right: 4px;
}

.settings {
  padding: 16px;
}

.settings-enter-active,
.settings-leave-active {
  max-height: 100px;
  padding-top: 16px;
  padding-bottom: 16px;
  transition: max-height 0.3s ease, padding-top 0.3s ease,
    padding-bottom 0.3s ease, opacity 0.2s ease;
}

.settings-enter,
.settings-leave-to {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
}

.list {
  padding: 0 !important;
}

.list-padding-top {
  margin-bottom: 8px;
}

.list-bulk-button {
  position: relative;
  height: 48px;
}

.list-separator {
  position: relative;
  height: 1px;
}

.list-items-wrap {
  overflow-y: auto;
}

.list-items-max-height {
  max-height: 392px;
}

.list-items {
  padding-bottom: 8px !important;
}

.list-item {
  padding-left: 16px;
  padding-right: 48px;
  cursor: pointer;
}

.list-item-icon {
  margin-right: 16px !important;
}
</style>
