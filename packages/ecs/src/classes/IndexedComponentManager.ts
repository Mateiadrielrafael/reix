import { ComponentManager } from '../types/ComponentManager'
import { BitFieldEmitter } from '@reix/bits'
import { componentEvents } from '../constants/componentEvents'

/**
 * Component manager which only stores a packed component
 * array and a map to quickly lookup any component by id.
 */
export class IndexedComponentManager<T> implements ComponentManager<T> {
    /**
     * MAp for getting the index of an entity from it's id
     */
    public readonly idToIndex = new Map<number, number>()

    /**
     * Map for getting the id of an entity from it's index.
     */
    public readonly indexToId = new Map<number, number>()

    /**
     * Array with all components.
     */
    public readonly components = new Array<T>()

    /**
     * Standard component manager emitter.
     */
    public emitter = new BitFieldEmitter<number>(3)

    /**
     * Add an entity to the manager.
     *
     * @param id The id of the entity
     * @param component The component to add.
     */
    public registerEntity(id: number, component: T) {
        this.idToIndex.set(id, this.components.length)
        this.indexToId.set(this.components.length, id)

        this.components.push(component)
        this.emitter.emit(componentEvents.added, id)

        return this
    }

    /**
     * Delete an entity.
     *
     * @param id The if of the entity to remove.
     */
    public deleteEntity(id: number) {
        const index = this.idToIndex.get(id)

        if (index !== undefined) {
            // move last element in the new free slot
            const lastElement = this.components.pop()

            // only do this if the index wasnt the last one
            if (index !== this.components.length) {
                this.components[index] = lastElement!

                // update index of the moved id
                const moveId = this.indexToId.get(this.components.length)!

                this.indexToId.delete(this.components.length)

                this.indexToId.set(index, moveId)
                this.idToIndex.set(moveId, index)
            } else {
                this.indexToId.delete(index)
            }

            // delete id from map
            this.idToIndex.delete(id)

            // emit event if the id did exist
            this.emitter.emit(componentEvents.removed, id)
        }
        return this
    }

    /**
     * Utility to get the emptyness of the manager.
     * Usefull for testing.
     */
    public isEmpty() {
        return (
            this.components.length === 0 &&
            this.idToIndex.size === 0 &&
            this.indexToId.size === 0
        )
    }

    /**
     * Do cleanup.
     */
    public clear() {
        this.components.splice(0, this.components.length)
        this.idToIndex.clear()
        this.indexToId.clear()

        return this
    }

    /**
     * Utility method for checking if an id has a registered component.
     *
     * @param id THe id of the entity.
     */
    public has(id: number) {
        return this.idToIndex.get(id) !== undefined
    }

    /**
     * Get the component of an entity by id.
     *
     * @param id The id of the entity to get the component of.
     */
    public get(id: number) {
        const index = this.idToIndex.get(id)

        if (index === undefined) {
            return null
        }

        return this.components[index]
    }

    /**
     * Set the value of an entity knowing it's id.
     *
     * @param id The id of the entity.
     * @param value The value of the entity.
     * @param mutate If set to true this will automatically emit the changed event.
     */
    public set(id: number, value: T, mutate = true) {
        const index = this.idToIndex.get(id)

        if (index !== undefined) {
            this.components[index] = value

            if (mutate) {
                this.mutateOne(id)
            }
        }

        return this
    }

    /**
     * Mark entities as mutated.
     *
     * @param ids The ids to emit.
     */
    public mutateMany(ids: number[]) {
        for (const id of ids) {
            this.emitter.emit(componentEvents.changed, id)
        }

        return this
    }

    /**
     * Mark entity as mutated.
     *
     * @param id The id to emit.
     */
    public mutateOne(id: number) {
        this.emitter.emit(componentEvents.changed, id)

        return this
    }

    /**
     * Runs callback and marks the return value as mutated.
     *
     * @param callback The callback to run.
     */
    public withMutations(callback: () => number[]) {
        this.mutateMany(callback())

        return this
    }

    /**
     * Runs callback and marks the return value as mutated.
     *
     * @param callback The callback to run.
     */
    public withMutation(callback: () => number) {
        this.mutateOne(callback())

        return this
    }
}
