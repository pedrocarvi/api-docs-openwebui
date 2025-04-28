// src/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi    = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mi API con Express',
      version: '1.0.0',
      description: 'Documentación de endpoints para RAG & file uploads'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'API Key'
        }
      },
      schemas: {
        FileMetadata: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '4405fabb-603e-4919-972b-2b39d6ad7f5b'
            },
            originalName: {
              type: 'string',
              example: 'documento.pdf'
            },
            mimeType: {
              type: 'string',
              example: 'application/pdf'
            },
            size: {
              type: 'integer',
              example: 34567
            },
            uploadDate: {
              type: 'string',
              format: 'date-time',
              example: '2025-04-28T12:34:56Z'
            }
          }
        },
        KnowledgeBase: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: 'c1733430-6ddd-4bf8-b9ee-ba4e346838dd'
            },
            name: {
              type: 'string',
              example: 'Open Web UI Docs'
            },
            description: {
              type: 'string',
              example: 'Documentación oficial de Open WebUI'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Descripción del error'
            }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
