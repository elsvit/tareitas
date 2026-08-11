import { createEntityAdapter, EntityAdapter, PayloadAction } from '@reduxjs/toolkit';

// Generic interface for entity actions with isUpsert option
export interface EntityAction<T> {
  entity: T;
  isUpsert?: boolean; // true by default
}

export interface EntityManyAction<T> {
  entities: T[];
  isUpsert?: boolean; // true by default
}

// Generic interface for update actions
export interface EntityUpdateAction<T> {
  id: string;
  changes: Partial<T>;
}

export interface EntityUpdateManyAction<T> {
  updates: EntityUpdateAction<T>[];
}

// Create a generic entity adapter factory where { id: string }
export function createGenericEntityAdapter<T extends { id: string }>(
  sortComparer?: (a: T, b: T) => number
): EntityAdapter<T, string> {
  return createEntityAdapter<T, string>({
    selectId: (entity: T) => entity.id,
    sortComparer,
  });
}

// Generic reducers for entity operations
export function createEntityReducers<T extends { id: string }>(
  adapter: EntityAdapter<T, string>
) {
  return {
    // Add single entity with upsert option
    addEntity: (state: any, action: PayloadAction<EntityAction<T>>) => {
      const { entity, isUpsert = true } = action.payload;
      const existingEntity = state.entities[entity.id];
      
      if (existingEntity) {
        if (isUpsert) {
          // Update existing entity
          adapter.updateOne(state, {
            id: entity.id,
            changes: entity
          });
        } else {
          // Replace existing entity completely
          adapter.setOne(state, entity);
        }
      } else {
        // Add new entity
        adapter.addOne(state, entity);
      }
    },

    // Add multiple entities with upsert option
    addEntities: (state: any, action: PayloadAction<EntityManyAction<T>>) => {
      const { entities, isUpsert = true } = action.payload;
      
      if (isUpsert) {
        // Update existing entities, add new ones
        adapter.upsertMany(state, entities);
      } else {
        // Replace existing entities completely, add new ones
        entities.forEach(entity => {
          const existingEntity = state.entities[entity.id];
          if (existingEntity) {
            adapter.setOne(state, entity);
          } else {
            adapter.addOne(state, entity);
          }
        });
      }
    },

    // Standard entity operations
    removeEntity: (state: any, action: PayloadAction<string>) => {
      adapter.removeOne(state, action.payload);
    },

    removeEntities: (state: any, action: PayloadAction<string[]>) => {
      adapter.removeMany(state, action.payload);
    },

    updateEntity: (state: any, action: PayloadAction<EntityUpdateAction<T>>) => {
      adapter.updateOne(state, action.payload);
    },

    updateEntities: (state: any, action: PayloadAction<EntityUpdateManyAction<T>>) => {
      adapter.updateMany(state, action.payload.updates);
    },

    upsertEntity: (state: any, action: PayloadAction<T>) => {
      adapter.upsertOne(state, action.payload);
    },

    upsertEntities: (state: any, action: PayloadAction<T[]>) => {
      adapter.upsertMany(state, action.payload);
    },

    clearEntities: (state: any) => {
      adapter.removeAll(state);
    },

    resetEntities: (state: any, action: PayloadAction<T[]>) => {
      adapter.setAll(state, action.payload);
    },
  };
}
