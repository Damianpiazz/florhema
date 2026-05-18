import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import type { Request, Response } from 'express'
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Florhema API',
      version: '1.0.0',
      description: 'API del Sistema de Gestión del Servicio de Hemoterapia'
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Desarrollo local' }
    ]
  },
  apis: ['./src/modules/**/*.controller.ts']
}
const swaggerSpec = swaggerJsdoc(options)
export function setupSwagger(app: import('express').Application) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  app.get('/api/docs.json', (_req: Request, res: Response) => res.json(swaggerSpec))
}