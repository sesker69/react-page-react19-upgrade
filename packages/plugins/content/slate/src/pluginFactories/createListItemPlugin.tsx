import type React from 'react';
import createSimpleHtmlBlockPlugin from './createSimpleHtmlBlockPlugin';

type ListItemDef = {
  type: string;
  tagName: keyof React.JSX.IntrinsicElements;
};

export default function <T>(def: ListItemDef) {
  return createSimpleHtmlBlockPlugin<T>({
    noButton: true,
    tagName: def.tagName,
    type: def.type,
  });
}
