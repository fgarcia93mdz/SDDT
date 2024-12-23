const createError = require("http-errors");
const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const https = require("https");
require("dotenv").config();
const publicPath = path.resolve("../public");
const methodOverride = require("method-override");
const session = require("express-session");
const cookies = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const { initialize } = require("./config/socket");

// Routes
const usuariosRouter = require("../src/routes/usuarios");
const autentificacionRouter = require("./routes/autentificacion");
const prendasRouter = require("./routes/prendas");
const clientesRouter = require("./routes/clientes");
const gestionVipRouter = require("./routes/gestionVip");
const laboratorioRouter = require("./routes/laboratorio");

const { swaggerDocs } = require("./Swagger/V1/swagger_v1");
swaggerDocs(app, process.env.PORT_DEV);

// Módulos alias
require('module-alias/register');

// Cookies
app.use(cookies());

// Session
app.use(
  session({
    secret: "asdsadsadsad",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static("public"));
app.use(express.static(publicPath));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.set("view engine", "ejs");
app.set("views", path.resolve("src/views"));
app.use(methodOverride("_method"));
app.use(cors());

const cookieParser = require("cookie-parser");
const logger = require("morgan");

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, `../`)));

app.use("/usuarios", usuariosRouter);
app.use("/autentificacion", autentificacionRouter);
app.use("/prendas", prendasRouter);
app.use("/clientes", clientesRouter);
app.use("/gestionVip", gestionVipRouter);
app.use("/laboratorio", laboratorioRouter);

app.get("/test-socket", (req, res) => {
  res.sendFile(path.join(__dirname, "test-socket.html"));
});

app.use(function (req, res, next) {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message
    }
  });
});

const port = process.env.NODE_ENV === 'development' ? process.env.PORT_DEV : process.env.PORT_PROD;
const host = process.env.NODE_ENV === 'development' ? 'localhost' : 'publicidadtd.com.ar';

let server;
if (process.env.NODE_ENV === "development") {
  server = http.createServer(app);
} else {
  server = https.createServer(app);
}

const io = initialize(server);

server.listen(port, () => {
  console.log(`Servidor escuchando en http://${host}:${port}`);
});

module.exports = { app, io };