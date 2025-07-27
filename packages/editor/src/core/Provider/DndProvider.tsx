import React from 'react';
import { DndProvider as DndProviderOrg } from 'react-dnd';
import { useOption } from '../components/hooks';

const DndProvider = ({ children }: any) => {
  const dndBackend = useOption('dndBackend');
  return dndBackend ? (
    <DndProviderOrg backend={dndBackend}>{children}</DndProviderOrg>
  ) : (
    <>{children}</>
  );
};

export default DndProvider;
