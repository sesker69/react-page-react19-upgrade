import React from 'react';

import { lazyLoad } from '@react-page/editor';
import createMarkPlugin from '../../pluginFactories/createMarkPlugin';

const BoldIcon = lazyLoad(() =>
  import('@mui/icons-material/FormatBold').then((module) => ({
    default: module.default,
  }))
);

export default createMarkPlugin({
  type: 'EMPHASIZE/STRONG',
  tagName: 'strong',
  icon: <BoldIcon />,
  label: 'Bold',
  hotKey: 'mod+b',
});
