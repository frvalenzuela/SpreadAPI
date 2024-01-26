import { UserController } from '../controller/UserController'

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API for managing users
 */

export const UserRoutes = [
    /**
     * @swagger
     * paths:
     *   /users:
     *     get:
     *       summary: Get all users
     *       tags: [Users]
     *       responses:
     *         '200':
     *           description: A list of users
     *           content:
     *             application/json:
     *               example:
     *                 - id: 1
     *                   firstName: John
     *                   lastName: Doe
     *                   age: 30
     */
    {
        method: 'get',
        route: '/users',
        controller: UserController,
        action: 'all',
    },

    /**
     * @swagger
     * paths:
     *   /users:
     *     post:
     *       summary: Create a new user
     *       tags: [Users]
     *       requestBody:
     *         required: true
     *         content:
     *           application/json:
     *             example:
     *               firstName: John
     *               lastName: Doe
     *               age: 30
     *       responses:
     *         '201':
     *           description: User created successfully
     */
    {
        method: 'post',
        route: '/users',
        controller: UserController,
        action: 'save',
    },

    /**
     * @swagger
     * paths:
     *   /users/{id}:
     *     get:
     *       summary: Get a user by ID
     *       tags: [Users]
     *       parameters:
     *         - in: path
     *           name: id
     *           required: true
     *           description: ID of the user
     *           schema:
     *             type: integer
     *       responses:
     *         '200':
     *           description: The user details
     *           content:
     *             application/json:
     *               example:
     *                 id: 1
     *                 firstName: John
     *                 lastName: Doe
     *                 age: 30
     */
    {
        method: 'get',
        route: '/users/:id',
        controller: UserController,
        action: 'one',
    },

    /**
     * @swagger
     * paths:
     *   /users/{id}:
     *     delete:
     *       summary: Delete a user by ID
     *       tags: [Users]
     *       parameters:
     *         - in: path
     *           name: id
     *           required: true
     *           description: ID of the user
     *           schema:
     *             type: integer
     *       responses:
     *         '204':
     *           description: User deleted successfully
     */
    {
        method: 'delete',
        route: '/users/:id',
        controller: UserController,
        action: 'remove',
    },
]
