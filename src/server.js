require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors")
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const multer = require('multer')
const routes = require("./Routes/index.js");
const connectDB = require("./Config/db");
const errorHandler = require('./Middleware/errorMiddlewarw');

const server = express();

server.use(cors());
server.use(express.json());
server.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
server.use(bodyParser.json({ limit: '50mb' }));
server.use(cookieParser());
server.use(morgan('dev'));
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

server.use('/', routes);

//Almacenador de Imagenes
const storage = multer.diskStorage({
  destination: "./Upload/Images",
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  }
});

const upload = multer({ storage: storage })

//Crear ruta de upload
server.use("/images", express.static("Upload/Images"))

server.post("/upload", upload.single('product'), (req, res) => {
  res.json({
    sucess: 1,
    image_url: `http://localhost:${process.env.PORT}/images/${req.file.filename}`
  })
})


//Conecta la DB

connectDB().then(() => {
  console.log('Base de Datos Establecida');
}).catch((err) => {
  console.error('Error al iniciar DB', err.message);
})

server.use(errorHandler);

module.exports = server;