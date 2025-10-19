const express = require('express');
const router = express.Router();
const {
  createTicket,
  getAllTickets,
  getUserTickets,
  getTicketById,
  updateTicketStatus,
  createMessage,
  getTicketMessages,
  getTicketAttachments,
} = require('../controllers/ticket.controller');
const { auth, isSupport } = require('../middleware/auth');
const upload = require('../config/multer');

router.post('/', auth, upload.single('anexo'), createTicket);

router.get('/', auth, isSupport, getAllTickets);

router.get('/user', auth, getUserTickets);

router.get('/:id', auth, getTicketById);

router.put('/:id/status', auth, isSupport, updateTicketStatus);

router.get('/:id/messages', auth, getTicketMessages);

router.post('/:id/messages', auth, createMessage);

router.get('/:id/attachments', auth, getTicketAttachments);

module.exports = router;