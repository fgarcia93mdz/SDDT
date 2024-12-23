const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");
const basicAuth = require("express-basic-auth");
const bcryptjs = require("bcryptjs");
require("dotenv").config();

const apiInfo = {
  openapi: "3.0.0",
  info: {
    title: "S.I.G - Sistema integral de gestión",
    version: "1.0.0",
    description: "Documentación de SIG API, endpoints consumibles para sistemas de gestión de Guardarropa y clientes VIP.",
    termsOfService: "http://example.com/terms/",
    contact: {
      name: "API Support",
      url: "http://www.example.com/support",
      email: "support@example.com"
    },
    license: {
      name: "Apache 2.0",
      url: "http://www.apache.org/licenses/LICENSE-2.0.html"
    }
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT_DEV}`,
      description: 'Servidor de desarrollo'
    },
    {
      url: `http://localhost:${process.env.PORT_PROD}`,
      description: 'Servidor de producción'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

const apiPaths = [
  path.join(__dirname, "./routes/autentificacion.yaml"),
  path.join(__dirname, "./routes/clientes.yaml"),
  path.join(__dirname, "./routes/usuarios.yaml"),
  path.join(__dirname, "./routes/prendas.yaml"),
  path.join(__dirname, "./routes/gestionVip.yaml"),
];

const options = {
  definition: apiInfo,
  apis: apiPaths,
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerDocs = (app, port) => {
  const customOptions = {
    swaggerOptions: {
      tagsSorter: "alpha", 
      docExpansion: "none", 
      defaultModelsExpandDepth: -1,
      defaultModelExpandDepth: 2,
      operationsSorter: "alpha",
      displayRequestDuration: true,
      filter: true,
      deepLinking: true,
      showExtensions: true,
      showCommonExtensions: true,
      defaultModelRendering: "model",
      supportedSubmitMethods: ["get", "post", "put", "delete"],
    }
  };

  app.use(
    "/api/v1/docs",
    basicAuth({
      authorizer: (username, password) => {
        const userMatches = basicAuth.safeCompare(username, process.env.AUTH_USERNAME);
        const passwordMatches = bcryptjs.compareSync(password, process.env.AUTH_PASSWORD);
        return userMatches && passwordMatches;
      },
      challenge: true,
      authorizeAsync: false,
    }),
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, customOptions)
  );

  app.get('/api/v1/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`Documentación API http://localhost:${port}/api/v1/docs`);
}

module.exports = { swaggerDocs };