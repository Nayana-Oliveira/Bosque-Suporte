import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';
import './index.css';

const NewTicketModal = ({ isOpen, onClose, onTicketCreated }) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [anexo, setAnexo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo || !descricao || !categoria) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descricao', descricao);
    formData.append('categoria', categoria);
    if (anexo) {
      formData.append('anexo', anexo);
    }

    try {
      const { data } = await api.post('/tickets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Ticket criado com sucesso!');
      onTicketCreated(data.ticket);
      setTitulo('');
      setDescricao('');
      setCategoria('');
      setAnexo(null);
      onClose();
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
      toast.error(error.response?.data?.message || 'Falha ao criar ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    setAnexo(e.target.files[0]);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content card">
        <header className="modal-header">
          <h3>Abrir Novo Ticket</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="titulo">Título *</label>
            <input
              type="text"
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Problema com projetor da Sala 10"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="categoria">Categoria *</label>
            <select
              id="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              required
            >
              <option value="" disabled>Selecione uma categoria</option>
              <option value="tecnologia">Tecnologia (Projetor, PC, Wi-Fi)</option>
              <option value="infraestrutura">Infraestrutura (Ar, Lâmpada, Cadeira)</option>
              <option value="administrativo">Administrativo (Documentos, Matrícula)</option>
              <option value="financeiro">Financeiro (Boletos, Pagamentos)</option>
              <option value="pedagogico">Pedagógico (Notas, Aulas)</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="descricao">Descrição *</label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o problema em detalhes..."
              required
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="anexo">Anexo (Opcional)</label>
            <input
              type="file"
              id="anexo"
              onChange={handleFileChange}
            />
            <small>Tamanho máximo: 5MB</small>
          </div>

          <footer className="modal-footer">
            <button
              type="button"
              className="btn-secundario"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-principal"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : (
                <>
                  <FaPaperPlane /> Enviar
                </>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default NewTicketModal;