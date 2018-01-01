<template>
<div id="app" v-show="dataLoaded">
  <div class="header">
    <div class="title">
      {{ getText('extensionName') }}
    </div>
    <img class="settings-icon" src="/src/icons/misc/settings.svg"
        @click="showSettings = !showSettings"/>
  </div>

  <transition name="settings">
    <div class="settings" v-if="showSettings">
      <v-select v-model="clearSince" :options="selectOptions.clearSinceAction">
      </v-select>
    </div>
  </transition>

  <ul class="mdc-list">
    <li class="mdc-list-item ripple-surface"
        v-if="clearAllDataTypes"
        @click="selectItem('allDataTypes')">
      <img class="mdc-list-item__start-detail"
          src="/src/icons/dataTypes/allDataTypes.svg">
      {{ getText('menuItemTitle_allDataTypes') }}
    </li>
    <li role="separator" class="mdc-list-divider"
        v-if="clearAllDataTypes || dataTypes.length > 8">
    </li>
    <div class="items-wrap">
      <div class="items">
        <li class="mdc-list-item ripple-surface"
            v-for="dataType in dataTypes"
            :key="dataType.id"
            @click="selectItem(dataType)">
          <img class="mdc-list-item__start-detail"
              :src="`/src/icons/dataTypes/${dataType}.svg`">
          {{ getText(`menuItemTitle_${dataType}`) }}
        </li>
      </div>
    </div>
  </ul>
</div>
</template>

<script>
import browser from 'webextension-polyfill';

import storage from 'storage/storage';
import {getEnabledDataTypes, getSelectOptionLabels} from 'utils/app';
import {getText} from 'utils/common';
import {optionKeys} from 'utils/data';

import Select from 'components/Select';

export default {
  components: {
    [Select.name]: Select
  },

  data: function() {
    return {
      dataLoaded: false,

      showSettings: false,
      selectOptions: getSelectOptionLabels({
        clearSinceAction: [
          '1hour',
          '3hours',
          '1day',
          '1week',
          '4weeks',
          'epoch'
        ]
      }),

      dataTypes: [],
      clearAllDataTypes: false,
      clearSince: ''
    };
  },

  methods: {
    getText: getText,

    selectItem: function(item) {
      browser.runtime.sendMessage({
        id: 'actionPopupSubmit',
        item
      });
      window.close();
    }
  },

  created: async function() {
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

body {
  margin: 0;
  min-width: 300px;
  min-height: 362px;
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  padding-left: 16px;
  padding-right: 16px;
}

.title {
  padding-right: 48px;
  white-space: nowrap;
  font-size: 1.13rem !important;
  @include mdc-typography('title');
  @include mdc-theme-prop('color', 'text-primary-on-light');
}

.settings-icon {
  width: 20px;
  height: 20px;
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

.items-wrap {
  max-height: 392px;
  overflow-y: auto;
}

.items {
  margin-bottom: 8px;
}

.mdc-list {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.mdc-list-item {
  padding-left: 16px;
  padding-right: 48px;
  white-space: nowrap;
  cursor: pointer;
}

.mdc-list-item__start-detail {
  margin-right: 16px !important;
}

.ripple-surface {
  @include mdc-ripple-base;
  @include mdc-ripple-bg((pseudo: "::before"));
  @include mdc-ripple-fg((pseudo: "::after"));

  overflow: hidden;
}
</style>
