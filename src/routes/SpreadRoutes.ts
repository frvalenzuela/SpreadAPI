import { SpreadController } from '../controller/SpreadController'

/**
 * @swagger
 * tags:
 *   name: Spreads
 *   description: API for managing spreads
 */

export const SpreadRoutes = [
    /**
     * @swagger
     * paths:
     *   /spread/{market_id}:
     *     get:
     *       summary: Get spread for a specific market
     *       tags: [Spreads]
     *       parameters:
     *         - in: path
     *           name: market_id
     *           required: true
     *           description: ID of the market
     *           schema:
     *             type: string
     *       responses:
     *         '200':
     *           description: The spread for the specified market
     *           content:
     *             application/json:
     *               example:
     *                 spread: "0.5"
     *         '400':
     *           description: Invalid request or insufficient data
     *           content:
     *             application/json:
     *               example:
     *                 error: 'Invalid request or insufficient data'
     *         '500':
     *           description: Internal server error
     *           content:
     *             application/json:
     *               example:
     *                 error: 'Internal server error'
     */
    {
        method: 'get',
        route: '/spread/:market_id',
        controller: SpreadController,
        action: 'one_market',
    },
    /**
     * @swagger
     * paths:
     *   /all:
     *     get:
     *       summary: Get spread for all markets (excluding markets with 'ARS' suffix)
     *       tags: [Spreads]
     *       responses:
     *         '200':
     *           description: Spread information for all markets (excluding 'ARS' markets)
     *           content:
     *             application/json:
     *               example:
     *                 [
     *                   { market: "market_id_1", spread: "0.5" },
     *                   { market: "market_id_2", spread: "0.8" },
     *                   // ... other market entries ...
     *                 ]
     *         '400':
     *           description: Invalid request or insufficient data
     *           content:
     *             application/json:
     *               example:
     *                 error: 'Invalid request or insufficient data'
     *         '500':
     *           description: Internal server error
     *           content:
     *             application/json:
     *               example:
     *                 error: 'Internal server error'
     */
    {
        method: 'get',
        route: '/all',
        controller: SpreadController,
        action: 'all_market',
    },
    /**
     * @swagger
     * paths:
     *   /set-alert/{market_id}/{value}/{type_of_alert}:
     *     post:
     *       summary: Set an alert for a specific market
     *       tags: [Alerts]
     *       parameters:
     *         - in: path
     *           name: market_id
     *           required: true
     *           description: ID of the market
     *           schema:
     *             type: string
     *         - in: path
     *           name: value
     *           required: true
     *           description: Value for the alert
     *           schema:
     *             type: number
     *         - in: path
     *           name: type_of_alert
     *           required: true
     *           description: Type of the alert (GREATER or LESS)
     *           schema:
     *             type: string
     *       responses:
     *         '201':
     *           description: Alert created successfully
     *           content:
     *             application/json:
     *               example:
     *                 alert: 'Alert created'
     *         '400':
     *           description: Invalid request or insufficient data
     *           content:
     *             application/json:
     *               example:
     *                 error: 'Invalid request or insufficient data'
     *         '500':
     *           description: Internal server error
     *           content:
     *             application/json:
     *               example:
     *                 error: 'Internal server error'
     */
    {
        method: 'post',
        route: '/set-alert/:market_id/:value/:type_of_alert',
        controller: SpreadController,
        action: 'set_alert',
    },
    /**
     * @swagger
     * paths:
     *   /alert/{market_id}/{type_of_alert}:
     *     get:
     *       summary: Check if an alert condition is met for a specific market
     *       tags: [Alerts]
     *       parameters:
     *         - in: path
     *           name: market_id
     *           required: true
     *           description: ID of the market
     *           schema:
     *             type: string
     *         - in: path
     *           name: type_of_alert
     *           required: true
     *           description: Type of the alert (GREATER or LESS)
     *           schema:
     *             type: string
     *       responses:
     *         '200':
     *           description: Alert condition met
     *           content:
     *             application/json:
     *               examples:
     *                 example1:
     *                   alert: 'Greater'
     *                 example2:
     *                   alert: 'Less'
     *         '304':
     *           description: Alert condition not met
     *           content:
     *             application/json:
     *               examples:
     *                 example:
     *                   alert: 'No alert'
     *         '400':
     *           description: Invalid request or insufficient data
     *           content:
     *             application/json:
     *               examples:
     *                 example1:
     *                   error: 'Type of Alert Invalid'
     *                 example2:
     *                   error: 'Alert not found'
     *         '500':
     *           description: Internal server error
     *           content:
     *             application/json:
     *               example:
     *                 error: 'Internal server error'
     */
    {
        method: 'get',
        route: '/alert/:market_id/:type_of_alert',
        controller: SpreadController,
        action: 'alert',
    },
]
