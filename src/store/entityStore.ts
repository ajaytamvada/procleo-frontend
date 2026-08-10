import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EntityInfo {
  id: number;
  code: string;
  name: string;
  type: string;
}

interface EntityState {
  entities: EntityInfo[];
  selectedEntityId: number | null;
  isLoaded: boolean;

  setScope: (entities: EntityInfo[], defaultEntityId: number | null) => void;
  selectEntity: (entityId: number | null) => void;
  clearScope: () => void;
}

/**
 * Entity (plant) scope store — which entities the user may work in and which
 * one is currently selected. The selected entity is sent as X-Entity-Id on
 * every API request so the backend stamps new documents correctly.
 */
export const useEntityStore = create<EntityState>()(
  persist(
    set => ({
      entities: [],
      selectedEntityId: null,
      isLoaded: false,

      setScope: (entities, defaultEntityId) =>
        set(state => {
          // Keep a previously chosen entity if it's still valid
          const stillValid = entities.some(
            e => e.id === state.selectedEntityId
          );
          return {
            entities,
            isLoaded: true,
            selectedEntityId: stillValid
              ? state.selectedEntityId
              : (defaultEntityId ?? entities[0]?.id ?? null),
          };
        }),

      selectEntity: entityId => set({ selectedEntityId: entityId }),

      clearScope: () =>
        set({ entities: [], selectedEntityId: null, isLoaded: false }),
    }),
    {
      name: 'entity-storage',
      partialize: state => ({
        entities: state.entities,
        selectedEntityId: state.selectedEntityId,
        isLoaded: state.isLoaded,
      }),
    }
  )
);
