import { lazyLoad } from '@react-page/editor';
import React from 'react';
import { createListItemPlugin } from '../../pluginFactories';
import createIndentionPlugin from '../../pluginFactories/createListIndentionPlugin';
import createListPlugin from '../../pluginFactories/createListPlugin';
import { LI, OL, UL } from './constants';

const ListIcon = lazyLoad(() =>
  import('@mui/icons-material/FormatListBulleted').then((module) => ({
    default: module.default,
  }))
);
const OrderedListIcon = lazyLoad(() =>
  import('@mui/icons-material/FormatListNumbered').then((module) => ({
    default: module.default,
  }))
);

const IncreaseIndentIcon = lazyLoad(() =>
  import('@mui/icons-material/FormatIndentIncrease').then((module) => ({
    default: module.default,
  }))
);
const DecreaseIndentIcon = lazyLoad(() =>
  import('@mui/icons-material/FormatIndentDecrease').then((module) => ({
    default: module.default,
  }))
);

const ol = createListPlugin({
  type: OL,
  icon: <OrderedListIcon />,
  label: 'Ordered List',
  tagName: 'ol',
});

const ul = createListPlugin({
  type: UL,
  icon: <ListIcon />,
  label: 'Unordered List',
  tagName: 'ul',
});

// only used for easier access on createCata
const li = createListItemPlugin({
  tagName: 'li',
  type: LI,
});

const indention = createIndentionPlugin({
  iconIncrease: <IncreaseIndentIcon />,
  iconDecrease: <DecreaseIndentIcon />,
  listItemType: LI,
  labelIncrease: 'Increase Indentation',
  labelDecrease: 'Decrease Indentation',
});

export default {
  ol,
  ul,
  li,
  indention,
};
