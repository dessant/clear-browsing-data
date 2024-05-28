<template>
  <vn-app v-show="dataLoaded">
    <div class="header">
      <div class="header-content">
        <vn-select
          ref="clearSinceButton"
          class="clear-since-menu"
          v-model="clearSince"
          :menu-props="{
            contentClass: 'v-select__content clear-since-menu__content'
          }"
          :items="listItems.clearSince"
          :title="getText('buttonTooltip_clearSince')"
          transition="scale-transition"
          density="compact"
          v-ripple
        >
        </vn-select>
      </div>

      <div class="header-content header-buttons">
        <div class="header-content header-pinned-buttons">
          <vn-icon-button
            v-if="enableContributions && pinActionToolbarContribute"
            class="contribute-button"
            src="/src/assets/icons/misc/favorite-filled.svg"
            :title="getText('buttonTooltip_contribute')"
            @click="showContribute"
          ></vn-icon-button>

          <vn-icon-button
            v-if="pinActionToolbarOptions"
            class="options-button"
            src="/src/assets/icons/misc/settings.svg"
            :title="getText('buttonTooltip_options')"
            @click="showOptions"
          ></vn-icon-button>
        </div>

        <vn-menu-icon-button
          id="menu-button"
          class="menu-button"
          src="/src/assets/icons/misc/more-vert.svg"
          :title="getText('buttonTooltip_menu')"
          menu-ref="actionMenu"
          menu-list-ref="actionMenuList"
        >
        </vn-menu-icon-button>
      </div>

      <vn-menu
        ref="actionMenu"
        activator="#menu-button"
        content-class="action-menu__content"
        :close-on-content-click="false"
        transition="scale-transition"
        v-model="openActionMenu"
      >
        <vn-list ref="actionMenuList">
          <template
            v-for="(item, index) of listItems.actionMenu"
            :key="item.value"
          >
            <vn-list-item
              v-if="item.isVisible || this[item.isVisibleStateProp]"
              :title="item.title"
              @click="onActionMenuSelect(item.value)"
            >
              <template v-slot:prepend>
                <vn-icon
                  :src="`/src/assets/icons/misc/${item.icon}.svg`"
                ></vn-icon>
              </template>

              <template v-slot:append v-if="item.isPinnedStateProp">
                <vn-icon-button
                  src="/src/assets/icons/misc/keep-light.svg"
                  src-on="/src/assets/icons/misc/keep-filled-light.svg"
                  :title="getText('buttonTooltip_pin')"
                  :title-on="getText('buttonTooltip_unpin')"
                  :on="this[item.isPinnedStateProp]"
                  @update:on="updatePinnedButtonState(item, $event)"
                  @click.stop
                  @keydown.enter.stop
                  @keydown.space.stop
                ></vn-icon-button>
              </template>
            </vn-list-item>
          </template>
        </vn-list>
      </vn-menu>
    </div>

    <transition
      name="settings"
      v-if="dataLoaded"
      @before-enter="settingsBeforeEnter"
      @before-leave="settingsBeforeLeave"
      @after-enter="settingsAfterEnter"
      @after-leave="settingsAfterLeave"
    >
      <div class="settings" v-if="showSettings"></div>
    </transition>

    <vn-divider class="header-separator" :class="separatorClasses"></vn-divider>

    <div
      class="list-items-wrap"
      ref="items"
      @scroll="onListScroll"
      tabindex="-1"
    >
      <resize-observer @notify="onListSizeChange"></resize-observer>
      <vn-list class="list-items">
        <vn-list-item
          v-if="clearAllDataTypes"
          :title="getText('menuItemTitle_allDataTypes')"
          @click="selectItem('allDataTypes')"
        >
          <template v-slot:prepend v-if="showDataTypeIcons">
            <img
              class="list-item-icon"
              v-if="showDataTypeIcons"
              :src="getDataTypeIcon('allDataTypes', {variant: theme})"
            />
          </template>
        </vn-list-item>

        <vn-divider
          class="list-separator"
          v-if="clearAllDataTypes"
        ></vn-divider>

        <template v-for="item of dataTypes">
          <vn-list-item
            :title="getText(`menuItemTitle_${item}`)"
            @click="selectItem(item)"
          >
            <template v-slot:prepend v-if="showDataTypeIcons">
              <img
                class="list-item-icon"
                :src="getDataTypeIcon(item, {variant: theme})"
              />
            </template>
          </vn-list-item>
        </template>
      </vn-list>
    </div>

    <vn-dialog
      v-model="openConfirmationDialog"
      content-class="confirmation-dialog__content"
      transition="scale-transition"
    >
      <vn-card>
        <vn-card-title>{{
          getText('dialogTitle_clearConfirmation')
        }}</vn-card-title>

        <vn-card-text>{{
          getText('dialogText_clearConfirmation')
        }}</vn-card-text>

        <div class="vn-card-options">
          <vn-checkbox
            :label="getText('checkboxLabel_noConfirmation')"
            v-model="noConfirmation"
          ></vn-checkbox>
        </div>

        <vn-card-actions>
          <vn-button @click="openConfirmationDialog = false" variant="text">
            {{ getText('buttonLabel_cancel') }}
          </vn-button>
          <vn-button @click="confirmSelectedItem" variant="tonal">
            {{ getText('buttonLabel_clearData') }}
          </vn-button>
        </vn-card-actions>
      </vn-card>
    </vn-dialog>
  </vn-app>
</template>

<script>
import {toRaw} from 'vue';
import {ResizeObserver} from 'vue-resize';
import {
  App,
  Button,
  Card,
  CardActions,
  CardText,
  CardTitle,
  Checkbox,
  Dialog,
  Divider,
  Icon,
  IconButton,
  List,
  ListItem,
  Menu,
  MenuIconButton,
  Select
} from 'vueton';

import storage from 'storage/storage';
import {
  getEnabledDataTypes,
  getListItems,
  showContributePage,
  showOptionsPage,
  showSupportPage,
  getDataTypeIcon,
  handleActionEscapeKey,
  getAppTheme
} from 'utils/app';
import {getText, getActiveTab} from 'utils/common';
import {enableContributions} from 'utils/config';
import {optionKeys} from 'utils/data';

export default {
  components: {
    [App.name]: App,
    [Button.name]: Button,
    [Card.name]: Card,
    [CardActions.name]: CardActions,
    [CardText.name]: CardText,
    [CardTitle.name]: CardTitle,
    [Checkbox.name]: Checkbox,
    [Dialog.name]: Dialog,
    [Divider.name]: Divider,
    [Icon.name]: Icon,
    [IconButton.name]: IconButton,
    [List.name]: List,
    [ListItem.name]: ListItem,
    [Menu.name]: Menu,
    [MenuIconButton.name]: MenuIconButton,
    [Select.name]: Select,
    [ResizeObserver.name]: ResizeObserver
  },

  data: function () {
    return {
      dataLoaded: false,

      listItems: {
        ...getListItems(
          {
            actionMenu: [
              {
                value: 'options',
                icon: 'settings-light',
                isVisible: true,
                isPinnedStateProp: 'pinActionToolbarOptions'
              },
              {
                value: 'contribute',
                icon: 'favorite-light',
                isVisibleStateProp: 'enableContributions',
                isPinnedStateProp: 'pinActionToolbarContribute'
              },
              {
                value: 'support',
                icon: 'help-light',
                isVisible: true
              }
            ]
          },
          {scope: 'actionMenu'}
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
      hasScrollBar: false,
      isScrolled: false,

      dataTypes: [],
      clearAllDataTypes: false,
      showDataTypeIcons: false,

      clearSince: '',
      confirmDataRemoval: false,

      theme: '',

      pinActionToolbarOptions: false,
      pinActionToolbarContribute: false,

      openActionMenu: false,

      openConfirmationDialog: false,

      selectedItem: null,
      noConfirmation: false,

      enableContributions
    };
  },

  computed: {
    separatorClasses: function () {
      return {
        visible: this.isScrolled
      };
    },

    showSettings: function () {
      return false;
    }
  },

  methods: {
    getText,

    getDataTypeIcon,

    selectItem: async function (item) {
      if (this.confirmDataRemoval) {
        this.selectedItem = item;
        this.showConfirmationDialog();
      } else {
        this.processSelection(item);
      }
    },

    confirmSelectedItem: async function () {
      this.hideConfirmationDialog();

      if (this.noConfirmation) {
        await storage.set({confirmDataRemoval: false});
      }

      await this.processSelection(this.selectedItem);
    },

    processSelection: async function (item) {
      await browser.runtime.sendMessage({
        id: 'actionPopupSubmit',
        item
      });

      this.closeAction();
    },

    showContribute: async function () {
      await showContributePage();
      this.closeAction();
    },

    showOptions: async function () {
      await showOptionsPage();
      this.closeAction();
    },

    showSupport: async function () {
      await showSupportPage();
      this.closeAction();
    },

    showActionMenu: function () {
      this.openActionMenu = true;
    },

    hideActionMenu: function () {
      this.openActionMenu = false;
    },

    showConfirmationDialog: function () {
      this.noConfirmation = false;
      this.openConfirmationDialog = true;
    },

    hideConfirmationDialog: function () {
      this.openConfirmationDialog = false;
    },

    onActionMenuSelect: async function (item) {
      this.hideActionMenu();

      if (item === 'options') {
        await this.showOptions();
      } else if (item === 'contribute') {
        await this.showContribute();
      } else if (item === 'support') {
        await this.showSupport();
      }
    },

    setupPinnedButtons: function ({maxPins = 0} = {}) {
      const pinnedButtons = this.listItems.actionMenu.filter(
        item =>
          this[item.isPinnedStateProp] &&
          (item.isVisible || this[item.isVisibleStateProp])
      );

      for (const button of pinnedButtons.reverse().slice(maxPins)) {
        this[button.isPinnedStateProp] = false;
      }
    },

    updatePinnedButtonState: function (item, state) {
      if (state) {
        this.setupPinnedButtons({maxPins: 2});
      }

      this[item.isPinnedStateProp] = state;
    },

    closeAction: async function () {
      const currentTab = await browser.tabs.getCurrent();

      // Safari 14: tabs.getCurrent returns active tab instead of undefined.
      // Samsung Internet 18: tabs.getCurrent returns a tab
      // instead of undefined, and tab.id refers to a nonexistent tab.
      if (
        currentTab &&
        currentTab.id !== browser.tabs.TAB_ID_NONE &&
        !this.$env.isSafari &&
        !this.$env.isSamsung
      ) {
        browser.tabs.remove(currentTab.id);
      } else {
        window.close();
      }
    },

    settingsBeforeEnter: function () {
      this.lockPopupHeight();
    },

    settingsBeforeLeave: function () {
      this.lockPopupHeight();
    },

    settingsAfterEnter: function () {
      this.configureScrollBar();
    },

    settingsAfterLeave: function () {
      this.unlockPopupHeight();
      this.configureScrollBar();
    },

    onListSizeChange: function () {
      this.configureScrollBar();
      if (this.$env.isMobile && this.$env.isSafari) {
        // Safari 15: window.onresize is not always fired on mobile.
        this.setViewportSize();
      }
    },

    onListScroll: function () {
      this.configureScrollBar();
    },

    configureScrollBar: function () {
      const items = this.$refs.items;
      this.hasScrollBar = items.scrollHeight > items.clientHeight;
      this.isScrolled = Boolean(items.scrollTop);
    },

    lockPopupHeight: function () {
      if (
        (this.$env.isAndroid || this.$env.isFirefox) &&
        !document.documentElement.style.height
      ) {
        const {height} = document.documentElement.getBoundingClientRect();
        document.documentElement.style.height = `${height}px`;
      }
    },

    unlockPopupHeight: function () {
      if (
        (this.$env.isAndroid || this.$env.isFirefox) &&
        document.documentElement.style.height.endsWith('px')
      ) {
        document.documentElement.style.height = '';
      }
    },

    setViewportSize: async function () {
      const activeTab = await getActiveTab();
      const actionWidth = window.innerWidth;

      if (activeTab && actionWidth && activeTab.width > actionWidth) {
        // popup
        if (!document.documentElement.style.height.endsWith('px')) {
          document.documentElement.style.height = '';
        }
        if (this.$env.isMobile) {
          // mobile popup
          if (activeTab.width < 394) {
            document.body.style.minWidth = `${activeTab.width - 40}px`;
          } else {
            document.body.style.minWidth = '354px';
          }
          this.$el.style.maxHeight = `${activeTab.height - 40}px`;

          if (this.$env.isIpados) {
            // 9 * 48px (list item) + 8px (padding)
            this.$refs.items.style.maxHeight = '440px';
          }
        } else {
          // desktop popup
          // 9 * 48px (list item) + 8px (padding)
          this.$refs.items.style.maxHeight = '440px';
        }
      } else {
        // full-width page
        document.documentElement.style.height = '100%';
        if (activeTab && activeTab.width >= 354) {
          document.body.style.minWidth = '354px';
        } else {
          document.body.style.minWidth = 'initial';
        }
        this.$el.style.maxHeight = 'initial';
        this.$refs.items.style.maxHeight = 'initial';
      }
    },

    setup: async function () {
      window.addEventListener('resize', this.setViewportSize);
      window.addEventListener('orientationchange', () =>
        window.setTimeout(this.setViewportSize, 1000)
      );
      await this.setViewportSize();

      const options = await storage.get(optionKeys);
      const enDataTypes = await getEnabledDataTypes(options);

      if (
        this.$env.isFirefox &&
        this.$env.isAndroid &&
        (enDataTypes.length <= 1 || options.clearAllDataTypesAction === 'main')
      ) {
        // Removing the action popup has no effect on Firefox for Android
        showNotification({messageId: 'error_optionsNotApplied'});
        return;
      }

      this.dataTypes = enDataTypes;
      this.clearAllDataTypes =
        options.clearAllDataTypesAction === 'sub' && !this.$env.isSamsung;
      this.showDataTypeIcons = options.showDataTypeIcons;
      this.confirmDataRemoval = options.confirmDataRemoval;

      const syncOptions = [
        'clearSince',
        'pinActionToolbarOptions',
        'pinActionToolbarContribute'
      ];

      for (const option of syncOptions) {
        this[option] = options[option];

        this.$watch(
          option,
          async function (value) {
            await storage.set({[option]: toRaw(value)});
          },
          {deep: true}
        );
      }

      this.setupPinnedButtons({maxPins: 3});

      this.theme = await getAppTheme(options.appTheme);
      document.addEventListener('themeChange', ev => {
        this.theme = ev.detail;
      });

      this.dataLoaded = true;
    }
  },

  created: function () {
    this.setup();
  },

  mounted: function () {
    handleActionEscapeKey();

    window.setTimeout(() => {
      if (this.searchModeAction === 'url' && !this.$env.isMobile) {
        this.focusDocUrlInput();
      }

      if (this.$env.isMobile && this.$env.isSafari) {
        // Safari 15: window.onresize is not always fired on mobile.
        this.setViewportSize();
      }
    }, 500);
  }
};
</script>

<style lang="scss">
@use 'vueton/styles' as vueton;
@import 'vue-resize/dist/vue-resize';

@include vueton.theme-base;
@include vueton.transitions;

body,
.vn-app,
.v-application__wrap {
  height: 100%;
}

.v-application__wrap {
  display: flex;
  flex-direction: column;

  min-height: initial;
}

body {
  margin: 0;
  min-width: 354px;
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: 8px;
  white-space: nowrap;
  padding-left: 4px;
  padding-right: 4px;
  padding-top: 16px;
  padding-bottom: 16px;
}

.header-content {
  display: flex;
  align-items: center;
  height: 24px;
}

.header-buttons {
  column-gap: 4px;

  & .header-pinned-buttons {
    column-gap: 8px;
  }
}

.contribute-button {
  & .vn-icon {
    @include vueton.theme-prop(background-color, cta);
  }
}

.clear-since-menu__content {
  top: 56px !important;
  left: 16px !important;
  transform-origin: center top !important;
  max-height: calc(100% - 56px - 16px) !important;

  & .v-list-item {
    & .v-list-item-title {
      padding-left: 16px !important;
    }
  }
}

.action-menu__content {
  top: 56px !important;
  left: auto !important;
  right: 16px !important;
  transform-origin: right top !important;
  max-height: calc(100% - 56px - 16px) !important;

  & .v-list-item {
    & .v-list-item__append {
      margin-right: 4px !important;
    }
  }
}

.confirmation-dialog__content {
  transform-origin: center center !important;

  & .vn-card {
    @include vueton.theme-prop(background-color, menu-surface);

    & .vn-card-options {
      & .vn-checkbox {
        margin-left: -10px;
        margin-top: -4px;
        margin-bottom: -4px;
      }
    }

    & .vn-card-actions {
      & .vn-button {
        @include vueton.theme-prop(color, primary);
      }
    }
  }
}

.settings {
  padding-top: 8px;
  padding-bottom: 24px;
}

.settings-enter-active,
.settings-leave-active {
  max-height: 100px;
  padding-top: 8px;
  padding-bottom: 24px;
  transition:
    max-height 0.3s ease,
    padding-top 0.3s ease,
    padding-bottom 0.3s ease,
    opacity 0.2s ease;
}

.settings-enter-from,
.settings-leave-to {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
}

.header-separator {
  opacity: 0 !important;
  transition: opacity 0.1s ease;
}

.list-separator {
  margin-top: -1px;
}

.visible {
  opacity: 1 !important;
}

.list-items-wrap {
  overflow-y: auto;
}

.list-items {
  padding-bottom: 8px !important;
}

.list-item-icon {
  width: 24px;
  height: 24px;
}

html.firefox.android {
  height: 100%;
}

html.samsung {
  & .v-application__wrap {
    height: initial;
  }
}

// Safari 17: the popover opens after a delay the first time the action
// button is clicked on macOS 14, unless the height is declared.
@if $target-env == 'safari' {
  html {
    min-height: 56px;
  }
}
</style>
