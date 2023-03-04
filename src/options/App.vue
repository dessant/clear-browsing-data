<template>
  <vn-app id="app" v-if="dataLoaded">
    <div class="section-datatypes">
      <div class="section-title" v-once>
        {{ getText('optionSectionTitle_dataTypes') }}
      </div>
      <div class="section-desc" v-once>
        {{ getText('optionSectionDescription_dataTypes') }}
      </div>

      <v-draggable
        class="option-wrap"
        v-model="options.dataTypes"
        item-key="id"
        :delay="120"
      >
        <template #item="{element}">
          <div class="option">
            <vn-checkbox
              :label="getText(`optionTitle_${element}`)"
              :model-value="dataTypeEnabled(element)"
              @click="setDataTypeState(element, $event.target.checked)"
            >
            </vn-checkbox>
          </div>
        </template>
      </v-draggable>
    </div>

    <div class="section-tabs">
      <div class="section-title" v-once>
        {{ getText('optionSectionTitle_tabs') }}
      </div>
      <div class="option-wrap">
        <div class="option select">
          <vn-select
            :label="getText('optionTitle_closeTabs')"
            :items="listItems.closeTabs"
            v-model="options.closeTabs"
            transition="scale-transition"
          >
          </vn-select>
        </div>
        <div
          class="option"
          v-show="!['exit', 'false'].includes(options.closeTabs)"
        >
          <vn-switch
            :label="getText('optionTitle_closePinnedTabs')"
            v-model="options.closePinnedTabs"
          ></vn-switch>
        </div>
        <div class="option select" v-show="options.closeTabs !== 'exit'">
          <vn-select
            :label="getText('optionTitle_reloadTabs')"
            :items="listItems.reloadTabs"
            v-model="options.reloadTabs"
            transition="scale-transition"
          >
          </vn-select>
        </div>
      </div>
    </div>

    <div class="section-misc">
      <div class="section-title" v-once>
        {{ getText('optionSectionTitle_misc') }}
      </div>
      <div class="option-wrap">
        <div class="option select">
          <vn-select
            :label="getText('optionTitle_appTheme')"
            :items="listItems.appTheme"
            v-model="options.appTheme"
            transition="scale-transition"
          >
          </vn-select>
        </div>
        <div class="option select">
          <vn-select
            :label="getText('optionTitle_clearAllDataTypes')"
            :items="listItems.clearAllDataTypesAction"
            v-model="options.clearAllDataTypesAction"
            transition="scale-transition"
          >
          </vn-select>
        </div>
        <div class="option select">
          <vn-select
            :label="getText('optionTitle_clearSince')"
            :items="listItems.clearSince"
            v-model="options.clearSince"
            transition="scale-transition"
          >
          </vn-select>
        </div>
        <div class="option">
          <vn-switch
            :label="getText('optionTitle_notifyOnSuccess')"
            v-model="options.notifyOnSuccess"
          ></vn-switch>
        </div>
        <div class="option">
          <vn-switch
            :label="getText('optionTitle_showDataTypeIcons')"
            v-model="options.showDataTypeIcons"
          ></vn-switch>
        </div>
        <div class="option">
          <vn-switch
            :label="getText('optionTitle_confirmDataRemoval')"
            v-model="options.confirmDataRemoval"
          ></vn-switch>
        </div>
        <div class="option" v-if="enableContributions">
          <vn-switch
            :label="getText('optionTitle_showContribPage')"
            v-model="options.showContribPage"
          ></vn-switch>
        </div>
        <div class="option button" v-if="enableContributions">
          <vn-button
            class="contribute-button vn-icon--start"
            @click="showContribute"
            ><vn-icon
              src="/src/assets/icons/misc/favorite-filled.svg"
            ></vn-icon>
            {{ getText('buttonLabel_contribute') }}
          </vn-button>
        </div>
      </div>
    </div>
  </vn-app>
</template>

<script>
import {toRaw} from 'vue';
import {App, Button, Checkbox, Icon, Select, Switch} from 'vueton';
import {includes, without} from 'lodash-es';
import draggable from 'vuedraggable';

import storage from 'storage/storage';
import {getListItems, showContributePage} from 'utils/app';
import {getText} from 'utils/common';
import {enableContributions} from 'utils/config';
import {optionKeys} from 'utils/data';

export default {
  components: {
    'v-draggable': draggable,
    [App.name]: App,
    [Button.name]: Button,
    [Checkbox.name]: Checkbox,
    [Icon.name]: Icon,
    [Switch.name]: Switch,
    [Select.name]: Select
  },

  data: function () {
    return {
      dataLoaded: false,

      listItems: {
        ...getListItems(
          {
            closeTabs: ['all', 'active', 'allButActive', 'exit', 'false']
          },
          {scope: 'optionValue_closeTabs'}
        ),
        ...getListItems(
          {
            reloadTabs: ['all', 'active', 'allButActive', 'false']
          },
          {scope: 'optionValue_reloadTabs'}
        ),
        ...getListItems(
          {
            clearAllDataTypesAction: ['main', 'sub', 'false']
          },
          {scope: 'optionValue_clearAllDataTypesAction'}
        ),
        ...getListItems(
          {
            clearSince: [
              '1minute',
              '3minutes',
              '10minutes',
              '30minutes',
              '1hour',
              '3hours',
              '1day',
              '1week',
              '4weeks',
              '90days',
              '365days',
              'epoch'
            ]
          },
          {scope: 'optionValue_clearSince'}
        ),
        ...getListItems(
          {appTheme: ['auto', 'light', 'dark']},
          {scope: 'optionValue_appTheme'}
        )
      },

      enableContributions,

      options: {
        dataTypes: [],
        disabledDataTypes: [],
        clearAllDataTypesAction: '',
        clearSince: '',
        closeTabs: '',
        closePinnedTabs: false,
        reloadTabs: '',
        notifyOnSuccess: false,
        showDataTypeIcons: false,
        confirmDataRemoval: false,
        appTheme: false,
        showContribPage: false
      }
    };
  },

  methods: {
    getText,

    setup: async function () {
      const options = await storage.get(optionKeys);

      for (const option of Object.keys(this.options)) {
        this.options[option] = options[option];

        this.$watch(
          `options.${option}`,
          async function (value) {
            await storage.set({[option]: toRaw(value)});
            await browser.runtime.sendMessage({id: 'optionChange'});
          },
          {deep: true}
        );
      }

      this.dataLoaded = true;
    },

    dataTypeEnabled: function (dataType) {
      return !includes(this.options.disabledDataTypes, dataType);
    },

    setDataTypeState: async function (dataType, enabled) {
      if (enabled) {
        this.options.disabledDataTypes = without(
          this.options.disabledDataTypes,
          dataType
        );
      } else {
        this.options.disabledDataTypes.push(dataType);
      }
    },

    showContribute: async function () {
      await showContributePage();
    }
  },

  created: function () {
    document.title = getText('pageTitle', [
      getText('pageTitle_options'),
      getText('extensionName')
    ]);

    this.setup();
  }
};
</script>

<style lang="scss">
@use 'vueton/styles' as vueton;

@include vueton.theme-base;
@include vueton.transitions;

.v-application__wrap {
  display: grid;
  grid-row-gap: 32px;
  grid-column-gap: 48px;
  padding: 24px;
  grid-auto-rows: min-content;
  grid-auto-columns: min-content;
}

.section-title {
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0.25px;
  line-height: 32px;
}

.section-desc {
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.25px;
  line-height: 20px;

  padding-top: 8px;
  width: 272px;
}

.option-wrap {
  display: grid;
  grid-row-gap: 24px;
  padding-top: 24px;
}

.option {
  display: flex;
  align-items: center;
  height: 20px;

  &.button {
    height: 40px;
  }

  &.select,
  &.text-field {
    height: 56px;
  }
}

.contribute-button {
  @include vueton.theme-prop(color, primary);

  & .vn-icon {
    @include vueton.theme-prop(background-color, cta);
  }
}

@media (min-width: 1024px) {
  .v-application__wrap {
    grid-template-columns: 464px 464px;
    grid-template-rows: min-content 1fr;
    grid-template-areas:
      'datatypes tabs'
      'datatypes misc';
  }

  .section-datatypes {
    grid-area: datatypes;
  }

  .section-tabs {
    grid-area: tabs;
  }

  .section-misc {
    grid-area: misc;
  }
}
</style>
