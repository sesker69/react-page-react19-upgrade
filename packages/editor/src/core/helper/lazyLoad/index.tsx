import type { ComponentProps, ComponentType, ReactElement } from 'react';
import React, { useEffect, useState } from 'react';

import { Suspense } from 'react';
import { lazyWithPreload } from 'react-lazy-with-preload';

function useIsServer() {
  const [isServer, setIsServer] = useState(true);
  useEffect(() => {
    setIsServer(false);
  }, []);
  return isServer;
}
/**
 *
 * @param factory function that retuns a promise of a component
 * @returns a lazy loaded component. you can pass a fallback to the component that renders on server or when the component is not loaded
 */

const loadable = <T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) => {
  const Component = lazyWithPreload(factory);

  const LoadableComponent = React.forwardRef<
    any,
    ComponentProps<T> & {
      /**
       * render a fallback on server or if the component is not loaded
       */
      fallback?: ReactElement;
    }
  >(({ fallback = null, ...props }, ref) => {
    const isServer = useIsServer();
    if (isServer) {
      return fallback ?? null;
    }

    const Inner = Component as any;

    return (
      <Suspense fallback={fallback}>
        <Inner ref={ref} {...props} />
      </Suspense>
    );
  });

  const LoadableComponentWithPreload: typeof LoadableComponent & {
    load: () => Promise<unknown>;
  } = LoadableComponent as any;
  LoadableComponentWithPreload.load = Component.preload;

  return LoadableComponentWithPreload;
};

export default loadable;
