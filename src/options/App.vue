<template>
  <div id="app" v-if="dataLoaded">
    <div class="section">
      <div class="section-title" v-once>
        {{ getText('optionSectionTitle_dataTypes') }}
      </div>
      <div class="section-desc" v-once>
        {{ getText('optionSectionDescription_dataTypes') }}
      </div>
      <v-draggable class="option-wrap" :list="options.dataTypes">
        <div
          class="option"
          v-for="dataType in options.dataTypes"
          :key="dataType.id"
        >
          <v-form-field
            :input-id="dataType"
            :label="getText(`optionTitle_${dataType}`)"
          >
            <v-checkbox
              :id="dataType"
              :checked="dataTypeEnabled(dataType)"
              @change="setDataTypeState(dataType, $event)"
            >
            </v-checkbox>
          </v-form-field>
        </div>
      </v-draggable>
    </div>

    <div class="section">
      <div class="section-title" v-once>
        {{ getText('optionSectionTitle_tabs') }}
      </div>
      <div class="option-wrap">
        <div class="option select">
          <v-select
            :label="getText('optionTitle_closeTabs')"
            v-model="options.closeTabs"
            :options="listItems.closeTabs"
          >
          </v-select>
        </div>
        <div
          class="option"
          v-show="!['exit', 'false'].includes(options.closeTabs)"
        >
          <v-form-field
            input-id="cpt"
            :label="getText('optionTitle_closePinnedTabs')"
          >
            <v-switch id="cpt" v-model="options.closePinnedTabs"> </v-switch>
          </v-form-field>
        </div>
        <div class="option select" v-show="options.closeTabs !== 'exit'">
          <v-select
            :label="getText('optionTitle_reloadTabs')"
            v-model="options.reloadTabs"
            :options="listItems.reloadTabs"
          >
          </v-select>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title" v-once>
        {{ getText('optionSectionTitle_misc') }}
      </div>
      <div class="option-wrap">
        <div class="option select">
          <v-select
            :label="getText('optionTitle_clearAllDataTypes')"
            v-model="options.clearAllDataTypesAction"
            :options="listItems.clearAllDataTypesAction"
          >
          </v-select>
        </div>
        <div class="option select">
          <v-select
            :label="getText('optionTitle_clearSince')"
            v-model="options.clearSince"
            :options="listItems.clearSince"
          >
          </v-select>
        </div>
        <div class="option">
          <v-form-field
            input-id="nos"
            :label="getText('optionTitle_notifyOnSuccess')"
          >
            <v-switch id="nos" v-model="options.notifyOnSuccess"></v-switch>
          </v-form-field>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import browser from 'webextension-polyfill';
import {includes, without} from 'lodash-es';
import draggable from 'vuedraggable';
import {Checkbox, Switch, Select, FormField} from 'ext-components';

import storage from 'storage/storage';
import {getListItems} from 'utils/app';
import {getText} from 'utils/common';
import {optionKeys} from 'utils/data';

export default {
  components: {
    'v-draggable': draggable,
    [Checkbox.name]: Checkbox,
    [Switch.name]: Switch,
    [Select.name]: Select,
    [FormField.name]: FormField
  },

  data: function() {
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
        )
      },

      options: {
        dataTypes: [],
        disabledDataTypes: [],
        clearAllDataTypesAction: '',
        clearSince: '',
        closeTabs: '',
        closePinnedTabs: false,
        reloadTabs: '',
        notifyOnSuccess: false
      }
    };
  },

  methods: {
    getText: getText,

    dataTypeEnabled: function(dataType) {
      return !includes(this.options.disabledDataTypes, dataType);
    },

    setDataTypeState: async function(dataType, enabled) {
      if (enabled) {
        this.options.disabledDataTypes = without(
          this.options.disabledDataTypes,
          dataType
        );
      } else {
        this.options.disabledDataTypes.push(dataType);
      }
    }
  },

  created: async function() {
    const options = await storage.get(optionKeys, 'sync');

    for (const option of Object.keys(this.options)) {
      this.options[option] = options[option];
      this.$watch(`options.${option}`, async function(value) {
        await storage.set({[option]: value}, 'sync');
      });
    }

    document.title = getText('pageTitle', [
      getText('pageTitle_options'),
      getText('extensionName')
    ]);

    this.dataLoaded = true;
  }
};
</script>

<style lang="scss">
$mdc-theme-primary: #1abc9c;

@import '@material/select/mdc-select';
@import '@material/theme/mixins';
@import '@material/typography/mixins';

body {
  margin: 0;
  @include mdc-typography-base;
  font-size: 100%;
  background-color: #ffffff;
  overflow: visible !important;
}

#app {
  display: grid;
  grid-row-gap: 32px;
  padding: 24px;
}

.mdc-checkbox {
  margin-right: 4px;
}

.mdc-switch {
  margin-right: 16px;
}

.section-title,
.section-desc {
  @include mdc-theme-prop(color, text-primary-on-light);
}

.section-title {
  @include mdc-typography(headline6);
}

.section-desc {
  @include mdc-typography(body2);
  padding-top: 8px;
}

.option-wrap {
  display: grid;
  grid-row-gap: 24px;
  padding-top: 24px;
  grid-auto-columns: min-content;
}

.option {
  display: flex;
  align-items: center;
  height: 24px;

  & .mdc-form-field {
    max-width: calc(100vw - 48px);

    & label {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}

.option.select {
  align-items: start;
  height: 56px;

  & .mdc-select__anchor,
  & .mdc-select__menu {
    max-width: calc(100vw - 48px);
  }

  & .mdc-select__selected-text {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
</style>
