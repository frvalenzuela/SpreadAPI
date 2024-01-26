import { UserRoutes } from './UserRoutes'
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve a list of JSONPlaceholder users
 *     description: Retrieve a list of users from JSONPlaceholder. Can be used to populate a list of fake users when prototyping or testing an API.
 */
export const Routes = [
    ...UserRoutes,
    // Add more route arrays from other modules if needed
]
