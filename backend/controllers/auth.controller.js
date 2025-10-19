const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, nome: user.nome, email: user.email, tipo: user.tipo },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
};

const sendRefreshToken = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
};

const register = async (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  if (!nome || !email || !senha || !tipo) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email já cadastrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);

    const [result] = await pool.query(
      'INSERT INTO users (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
      [nome, email, hashedPassword, tipo]
    );

    res.status(201).json({ message: 'Usuário criado com sucesso!', userId: result.insertId });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erro no servidor ao registrar usuário.' });
  }
};

const login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await pool.query('DELETE FROM refresh_tokens WHERE user_id = ?', [user.id]);
    
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [user.id, refreshTokenHash, expiresAt]
    );

    sendRefreshToken(res, refreshToken);
    
    delete user.senha;
    res.json({ accessToken, user });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erro no servidor ao tentar fazer login.' });
  }
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Acesso negado. Nenhum token de atualização.' });
  }

  try {
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    const [rows] = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token_hash = ? AND expires_at > NOW()',
      [refreshTokenHash]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: 'Token de atualização inválido ou expirado.' });
    }

    const tokenData = rows[0];
    const [userRows] = await pool.query('SELECT * FROM users WHERE id = ?', [tokenData.user_id]);

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    
    const user = userRows[0];
    const accessToken = generateAccessToken(user);
    
    delete user.senha;
    res.json({ accessToken, user });
    
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erro no servidor ao atualizar token.' });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await pool.query('DELETE FROM refresh_tokens WHERE token_hash = ?', [refreshTokenHash]);
    }
    
    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0)
    });

    res.status(200).json({ message: 'Logout realizado com sucesso.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erro no servidor ao fazer logout.' });
  }
};

const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nome, email, tipo FROM users WHERE id = ?', [req.user.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erro no servidor ao buscar perfil.' });
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getProfile,
};