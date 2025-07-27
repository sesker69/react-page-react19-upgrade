import type { Dispatch, AnyAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
import React from 'react';
import type { TypedUseSelectorHook } from 'react-redux';
import {
  createDispatchHook,
  createSelectorHook,
  createStoreHook,
  Provider,
} from 'react-redux';
import type { RootState } from './types/state';

// Create a properly typed context
export const ReduxContext = React.createContext<any>(null);

// Provider component with proper typing
export const ReduxProvider = ({ store, ...props }: any) => (
  <Provider store={store} context={ReduxContext as any} {...props} />
);

// Create typed hooks
export const useStore = createStoreHook<RootState>(ReduxContext as any);
export const useDispatch = createDispatchHook(
  ReduxContext as any
) as () => ThunkDispatch<RootState, unknown, AnyAction>;
export const useSelector: TypedUseSelectorHook<RootState> = createSelectorHook(
  ReduxContext as any
);
