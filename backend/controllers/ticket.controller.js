const pool = require('../db');
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const createTicket = async (req, res) => {
  const titulo = DOMPurify.sanitize(req.body.titulo);
  const descricao = DOMPurify.sanitize(req.body.descricao);
  const { categoria } = req.body;
  const usuario_id = req.user.id;

  if (!titulo || !descricao || !categoria) {
    return res.status(400).json({ message: 'Título, descrição e categoria são obrigatórios.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [ticketResult] = await connection.query(
      'INSERT INTO tickets (titulo, descricao, categoria, status, prioridade, usuario_id) VALUES (?, ?, ?, ?, ?, ?)',
      [titulo, descricao, categoria, 'aberto', 'baixa', usuario_id]
    );
    
    const ticketId = ticketResult.insertId;

    if (req.file) {
      const { originalname, filename } = req.file;
      await connection.query(
        'INSERT INTO attachments (ticket_id, nome_arquivo, caminho) VALUES (?, ?, ?)',
        [ticketId, originalname, filename]
      );
    }
    
    await connection.commit();
    
    const [newTicket] = await connection.query('SELECT * FROM tickets WHERE id = ?', [ticketId]);

    res.status(201).json({ message: 'Ticket criado com sucesso!', ticket: newTicket[0] });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error(error.message);
    res.status(500).json({ message: 'Erro no servidor ao criar ticket.' });
  } finally {
    if (connection) connection.release();
  }
};

const getAllTickets = async (req, res) => {
  const { status, categoria, search } = req.query;
  
  let query = `
    SELECT t.*, u.nome as nome_usuario 
    FROM tickets t
    JOIN users u ON t.usuario_id = u.id
  `;
  
  const params = [];
  const whereClauses = [];

  if (status) {
    whereClauses.push('t.status = ?');
    params.push(status);
  }
  
  if (categoria) {
    whereClauses.push('t.categoria = ?');
    params.push(categoria);
  }
  
  if (search) {
    whereClauses.push('(t.titulo LIKE ? OR t.descricao LIKE ?)');
    params.push(`%${search}%`);
    params.push(`%${search}%`);
  }

  if (whereClauses.length > 0) {
    query += ' WHERE ' + whereClauses.join(' AND ');
  }
  
  query += ' ORDER BY t.data_criacao DESC';

  try {
    const [tickets] = await pool.query(query, params);
    res.json(tickets);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erro no servidor ao buscar tickets.' });
  }
};

const getUserTickets = async (req, res) => {
  const usuario_id = req.user.id;

  try {
    const [tickets] = await pool.query(
      `SELECT t.*, u.nome as nome_usuario 
       FROM tickets t
       JOIN users u ON t.usuario_id = u.id
       WHERE t.usuario_id = ? 
       ORDER BY t.data_criacao DESC`,
      [usuario_id]
    );
    res.json(tickets);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erro no servidor ao buscar tickets do usuário.' });
  }
};

const getTicketById = async (req, res) => {
  const { id } = req.params;
  const usuario_id = req.user.id;
  const usuario_tipo = req.user.tipo;

  try {
    const [rows] = await pool.query(
      `SELECT t.*, u.nome as nome_usuario 
       FROM tickets t
       JOIN users u ON t.usuario_id = u.id
       WHERE t.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Ticket não encontrado.' });
    }
    
    const ticket = rows[0];
    
    if (usuario_tipo !== 'suporte' && ticket.usuario_id !== usuario_id) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    res.json(ticket);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erro no servidor ao buscar ticket.' });
  }
};

const updateTicketStatus = async (req, res) => {
  const { id } = req.params;
  const { status, prioridade } = req.body;
  const suporte_id = req.user.id;

  if (!status || !prioridade) {
    return res.status(400).json({ message: 'Status e prioridade são obrigatórios.' });
  }

  try {
    await pool.query(
      'UPDATE tickets SET status = ?, prioridade = ?, suporte_id = ? WHERE id = ?',
      [status, prioridade, suporte_id, id]
    );
    
    const [updatedTicket] = await pool.query(
      `SELECT t.*, u.nome as nome_usuario 
       FROM tickets t
       JOIN users u ON t.usuario_id = u.id
       WHERE t.id = ?`,
      [id]
    );

    res.json(updatedTicket[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erro no servidor ao atualizar ticket.' });
  }
};

const createMessage = async (req, res) => {
  const { id: ticket_id } = req.params;
  const mensagem = DOMPurify.sanitize(req.body.mensagem);
  const usuario_id = req.user.id;

  if (!mensagem) {
    return res.status(400).json({ message: 'Mensagem é obrigatória.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO messages (ticket_id, usuario_id, mensagem) VALUES (?, ?, ?)',
      [ticket_id, usuario_id, mensagem]
    );

    const [newMessage] = await pool.query(
      `SELECT m.*, u.nome as nome_usuario, u.tipo as tipo_usuario
       FROM messages m
       JOIN users u ON m.usuario_id = u.id
       WHERE m.id = ?`,
      [result.insertId]
    );

    res.status(201).json(newMessage[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erro no servidor ao enviar mensagem.' });
  }
};

const getTicketMessages = async (req, res) => {
  const { id: ticket_id } = req.params;

  try {
    const [messages] = await pool.query(
      `SELECT m.*, u.nome as nome_usuario, u.tipo as tipo_usuario
       FROM messages m
       JOIN users u ON m.usuario_id = u.id
       WHERE m.ticket_id = ? 
       ORDER BY m.data_envio ASC`,
      [ticket_id]
    );
    res.json(messages);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erro no servidor ao buscar mensagens.' });
  }
};

const getTicketAttachments = async (req, res) => {
  const { id: ticket_id } = req.params;

  try {
    const [attachments] = await pool.query(
      'SELECT * FROM attachments WHERE ticket_id = ? ORDER BY data_upload DESC',
      [ticket_id]
    );
    res.json(attachments);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erro no servidor ao buscar anexos.' });
  }
};

module.exports = {
  createTicket,
  getAllTickets,
  getUserTickets,
  getTicketById,
  updateTicketStatus,
  createMessage,
  getTicketMessages,
  getTicketAttachments,
};