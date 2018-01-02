<template>
<div id="app" v-show="dataLoaded">
  <div class="header">
    <div class="title">
      {{ getText('extensionName') }}
    </div>
    <div class="header-buttons">
      <img class="contribute-icon"
          src="/src/contribute/assets/heart.svg"
          @click="showContribute">
      <img class="settings-icon" src="/src/icons/misc/settings.svg"
          @click="showSettings = !showSettings"/>
    </div>
  </div>

  <transition name="settings"
      @after-enter="handleSizeChange"
      @after-leave="handleSizeChange">
    <div class="settings" v-if="showSettings">
      <v-select v-model="clearSince" :options="selectOptions.clearSinceAction">
      </v-select>
    </div>
  </transition>

  <div class="list-padding-top"></div>
  <ul class="mdc-list list list-bulk-button" v-if="clearAllDataTypes">
    <li class="mdc-list-item list-item ripple-surface"
        @click="selectItem('allDataTypes')">
      <img class="mdc-list-item__start-detail list-item-icon"
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
      <li class="mdc-list-item list-item ripple-surface"
          v-for="dataType in dataTypes"
          :key="dataType.id"
          @click="selectItem(dataType)">
        <img class="mdc-list-item__start-detail list-item-icon"
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
import {Select} from 'ext-components';

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
    [Select.name]: Select,
    [ResizeObserver.name]: ResizeObserver
  },

  data: function() {
    return {
      dataLoaded: false,

      showSettings: false,
      selectOptions: getOptionLabels({
        clearSinceAction: [
          '1hour',
          '3hours',
          '1day',
          '1week',
          '4weeks',
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
    const currentTab = await browser.tabs.getCurrent();
    this.isPopup = !currentTab || currentTab instanceof Array;
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
  }
};
</script>

<style lang="scss">
$mdc-theme-primary: #1abc9c;

@import '@material/list/mdc-list';
@import '@material/theme/mixins';
@import '@material/typography/mixins';
@import "@material/ripple/mixins";

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
  min-width: 342px;
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;
  padding-top: 16px;
  padding-left: 16px;
  padding-right: 16px;
}

.title {
  overflow: hidden;
  text-overflow: ellipsis;
  @include mdc-typography('title');
  @include mdc-theme-prop('color', 'text-primary-on-light');
}

.header-buttons {
  display: flex;
  align-items: center;
  margin-left: 56px;
  @media (max-width: 341px) {
    margin-left: 32px;
  }
}

.contribute-icon {
  margin-right: 16px;
  cursor: pointer;
}

.settings-icon {
  cursor: pointer;
}

.settings {
  padding: 16px;
}

.settings-enter-active, .settings-leave-active {
  max-height: 100px;
  padding-top: 16px;
  padding-bottom: 16px;
  transition: max-height .3s ease,
              padding-top .3s ease,
              padding-bottom .3s ease,
              opacity .2s ease;
}

.settings-enter, .settings-leave-to {
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
  height: 48px;
}

.list-separator {
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

.ripple-surface {
  @include mdc-ripple-surface;
  @include mdc-states;
  @include mdc-ripple-radius;

  position: sticky;
  outline: none;
  overflow: hidden;
}
</style>
