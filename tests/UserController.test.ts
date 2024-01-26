import { AppDataSource } from '../src/data-source'
import { UserController } from '../src/controller/UserController'
import { User } from '../src/entity/User'
import { mocked } from 'jest-mock'

const mockedAppDataSource = AppDataSource as jest.Mocked<typeof AppDataSource>

const mockFind = jest.fn(() => {})
const mockFindOne = jest.fn(() => {})
const mockFindOneBy = jest.fn(() => {})
const mockSave = jest.fn(() => {})
const mockRemove = jest.fn(() => {})

jest.mock('../src/data-source', () => ({
    AppDataSource: {
        getRepository: jest.fn(() => ({
            find: mockFind,
            findOne: mockFindOne,
            save: mockSave,
            remove: mockRemove,
            findOneBy: mockFindOneBy,
        })),
    },
}))

describe('UserController', () => {
    let userController: UserController

    beforeEach(() => {
        userController = new UserController()
        // Reset mock calls before each test
        mockedAppDataSource.getRepository.mockClear()
    })

    test('should get all users', async () => {
        const mockUsers = [{ id: 1, firstName: 'John', lastName: 'Doe', age: 30 }] as User[]
        const userRepositoryMock = mocked(mockedAppDataSource.getRepository(User))
        userRepositoryMock.find.mockResolvedValueOnce(mockUsers)

        const response = await userController.all({} as any, {} as any, {} as any)

        expect(response).toEqual(mockUsers)
    })

    test('should get one user by id', async () => {
        const mockUser = {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            age: 30,
        } as User
        const userFindOne = mocked(mockedAppDataSource.getRepository(User).findOne)
        userFindOne.mockResolvedValue(mockUser)

        const response = await userController.one(
            { params: { id: '1' } } as any,
            {} as any,
            {} as any,
        )

        expect(response).toEqual(mockUser)
    })

    test('should handle unregistered user in one function', async () => {
        const userFindOne = mocked(mockedAppDataSource.getRepository(User).findOne)
        userFindOne.mockResolvedValue(null)

        const response = await userController.one(
            { params: { id: '1' } } as any,
            {} as any,
            {} as any,
        )

        expect(response).toEqual('unregistered user')
    })

    test('should save a new user', async () => {
        const mockUser = {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            age: 30,
        } as User
        const userSave = mocked(mockedAppDataSource.getRepository(User).save)
        userSave.mockResolvedValue(mockUser)

        const requestMock = {
            body: { firstName: 'John', lastName: 'Doe', age: 30 },
        } as any
        const response = await userController.save(requestMock, {} as any, {} as any)

        expect(response).toEqual(mockUser)
    })

    test('should remove an existing user', async () => {
        const userFindOneBy = mocked(mockedAppDataSource.getRepository(User).findOneBy)
        userFindOneBy.mockResolvedValue({ id: 1 } as User)

        const response = await userController.remove(
            { params: { id: '1' } } as any,
            {} as any,
            {} as any,
        )

        expect(response).toEqual('user has been removed')
    })

    test('should handle non-existing user in remove function', async () => {
        const userFindOneBy = mocked(mockedAppDataSource.getRepository(User).findOneBy)
        userFindOneBy.mockResolvedValue(null)

        const response = await userController.remove(
            { params: { id: '1' } } as any,
            {} as any,
            {} as any,
        )

        expect(response).toEqual('this user not exist')
    })
})
