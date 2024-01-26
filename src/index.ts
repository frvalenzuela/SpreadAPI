import * as express from 'express'
import * as bodyParser from 'body-parser'
import { Request, Response } from 'express'
import { AppDataSource } from './data-source'
import { Routes } from './routes'
import * as swaggerJSDoc from 'swagger-jsdoc'
import * as swaggerUi from 'swagger-ui-express'
import { SwaggerDefinition } from 'swagger-jsdoc'

AppDataSource.initialize()
    .then(async () => {
        // create express app
        const app = express()
        app.use(bodyParser.json())

        // register express routes from defined application routes
        Routes.forEach((route) => {
            ;(app as any)[route.method](
                route.route,
                (req: Request, res: Response, next: Function) => {
                    const result = new (route.controller as any)()[route.action](req, res, next)
                    if (result instanceof Promise) {
                        result.then((result) =>
                            result !== null && result !== undefined ? res.send(result) : undefined,
                        )
                    } else if (result !== null && result !== undefined) {
                        res.json(result)
                    }
                },
            )
        })

        const swaggerDefinition: SwaggerDefinition = {
            openapi: '3.0.0',
            info: {
                title: 'Express API for JSONPlaceholder',
                version: '1.0.0',
                description:
                    'This is a REST API application made with Express. It retrieves data from JSONPlaceholder.',
                license: {
                    name: 'Licensed Under MIT',
                    url: 'https://spdx.org/licenses/MIT.html',
                },
            },
            servers: [
                {
                    url: 'http://localhost:3000',
                    description: 'Development server',
                },
            ],
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
    })
    .catch((error) => console.log(error))
