import type { SlatePlugin, SlatePluginCollection } from '../types/SlatePlugin';
import flattenDeep from './flattenDeep';

export default (plugins: SlatePluginCollection) => {
  return Object.keys(plugins).reduce((acc, groupKey) => {
    const group = plugins[groupKey];
    const groupPlugins = Object.keys(group).reduce((innerAcc, key) => {
      const pluginOrFactory = plugins[groupKey][key];

      const result = (pluginOrFactory as any).toPlugin
        ? (pluginOrFactory as any).toPlugin()
        : pluginOrFactory;

      return [...innerAcc, ...flattenDeep(result)] as SlatePlugin[];
    }, [] as SlatePlugin[]);

    return [...acc, ...groupPlugins];
  }, [] as SlatePlugin[]);
};
