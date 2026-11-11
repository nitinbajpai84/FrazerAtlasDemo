import { createContext, useContext } from 'react';

export interface AtlasWorkspaceContextValue {
  openAtlas: (responseId?: string) => void;
  closeAtlas: () => void;
  atlasOpen: boolean;
}

export const AtlasWorkspaceContext =
  createContext<AtlasWorkspaceContextValue | null>(null);

export function useAtlasWorkspace(): AtlasWorkspaceContextValue {
  const context = useContext(AtlasWorkspaceContext);

  if (!context) {
    throw new Error(
      'useAtlasWorkspace must be used within the Finance Atlas application shell.',
    );
  }

  return context;
}