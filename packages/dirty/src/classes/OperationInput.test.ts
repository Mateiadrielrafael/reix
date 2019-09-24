import { OperationInputNode } from './OperationInput'
import { operationEvents } from '../constants/operationEvents'

describe('The OperationInpput instance', () => {
    let input: OperationInputNode<number>

    beforeEach(() => {
        input = new OperationInputNode(7)
    })

    describe('The get method', () => {
        test('should initially return the initial value', () => {
            // assert
            expect(input.get()).toEqual(7)
        })

        test('should return the new value after calling set', () => {
            // arrange
            const random = Math.random()

            // act
            input.set(random)

            // assert
            expect(input.get()).toEqual(random)
        })
    })

    describe('The set method', () => {
        test('calling set(a) should get to the same state as calling set(a) and then set(b)', () => {
            // arrange
            const input1 = new OperationInputNode(0)
            const input2 = new OperationInputNode(0)

            const random = Math.random()

            // act
            input1.set(random)
            input2.set(random + Math.random()).set(random)

            // assert
            expect(input1.get()).toEqual(input2.get())
        })

        test('should emit a changed event', () => {
            // arrange
            const mock = jest.fn()
            input.emitter.on(operationEvents.changed, mock)

            // act
            input.set(Math.random())

            // assert
            expect(mock).toBeCalled()
        })

        test('should ignore the current value', () => {
            // arrange
            const mock = jest.fn()
            input.emitter.on(operationEvents.changed, mock)

            const random = Math.random()

            // act
            input.set(random).set(random)

            // assert
            expect(mock).toHaveBeenCalledTimes(1)
        })
    })

    describe('The dispose method', () => {
        test('should emit the dispose event', () => {
            // arrange
            const mock = jest.fn()
            input.emitter.on(operationEvents.disposed, mock)

            // act
            input.dispose()

            // assert
            expect(mock).toBeCalled()
        })

        test("should do nothing if the node isn't active anymroe", () => {
            // arrange
            const mock = jest.fn()
            input.emitter.on(operationEvents.disposed, mock)

            // act
            input.dispose().dispose()

            // assert
            expect(mock).toHaveBeenCalledTimes(1)
        })
    })
})
