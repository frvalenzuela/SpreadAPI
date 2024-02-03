import * as express from 'express'
import * as bodyParser from 'body-parser'
import { Application, Request, Response, NextFunction } from 'express'
import { Routes } from './routes'
import * as swaggerJSDoc from 'swagger-jsdoc'
import * as swaggerUi from 'swagger-ui-express'
import { SwaggerDefinition } from 'swagger-jsdoc'

interface Route {
    method: string
    route: string
    controller: any
    action: string
}

function registerRoute(app: Application, route: Route) {
    app[route.method](route.route, async (req: Request, res: Response, next: NextFunction) => {
        try {
            await new route.controller()[route.action](req, res, next)
        } catch (error) {
            next(error)
        }
    })
}

const app = express()
app.use(bodyParser.json())

// register express routes from defined application routes
Routes.forEach((route) => registerRoute(app, route))

const swaggerDefinition: SwaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Express API for SpreadAPI',
        version: '1.0.0',
        description:
            'This is a REST API application made with Express. It retrieves data from SpreadAPI from Buda.com.',
        license: {
            name: 'Licensed Under MIT',
            url: 'https://spdx.org/licenses/MIT.html',
        },
    },
}

// Swagger options
const swaggerOptions: swaggerJSDoc.Options = {
    definition: swaggerDefinition,
    // Paths to the API docs files
    apis: [`**/*.ts`],
}

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(swaggerOptions)
// Serve the Swagger UI at /api-docs
app.use(
    '/api-doc',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, { swaggerOptions: { url: '/api-doc' } }),
)

// start express server
app.listen(3000, () => {
    console.log('Express server has started on port 3000.')
    console.log('Open http://localhost:3000/api-doc to see Swagger documentation.')
})
