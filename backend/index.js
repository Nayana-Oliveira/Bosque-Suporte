const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const allRoutes = require('./routes');
const pool = require('./db');

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? 'https://seu-dominio-frontend.com'
    : 'http://localhost:3000',
  optionsSuccessStatus: 200,
  credentials: true
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, 
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos.' 
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, 
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Muitas tentativas de login. Tente novamente mais tarde.' 
});

app.use('/api', generalLimiter); 
app.use('/api/auth/login', loginLimiter); 

app.use('/api', allRoutes);

app.get('/', (req, res) => {
  res.send('API do Sistema de Suporte Escola Bosque está no ar!');
});

const startServer = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Conexão com o MySQL estabelecida com sucesso.');
    app.listen(port, () => {
      console.log(`Servidor backend rodando em http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Falha ao conectar com o banco de dados:', error.message);
    process.exit(1);
  }
};

startServer();