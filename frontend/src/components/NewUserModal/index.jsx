import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FaTimes, FaUserCheck } from 'react-icons/fa';
import './index.css';

const NewUserModal = ({ isOpen, onClose }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState('usuario');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !email || !senha || !tipo) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/auth/register', {
        nome,
        email,
        senha,
        tipo,
      });
      toast.success('Usuário criado com sucesso!');
      setNome('');
      setEmail('');
      setSenha('');
      setTipo('usuario');
      onClose();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast.error(error.response?.data?.message || 'Falha ao criar usuário.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content card">
        <header className="modal-header">
          <h3>Criar Novo Usuário</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="nome">Nome Completo</label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Setor da Biblioteca"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: biblioteca@escola.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha Provisória</label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tipo">Tipo de Conta</label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              required
            >
              <option value="usuario">Usuário (Padrão)</option>
              <option value="suporte">Suporte (Admin)</option>
            </select>
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
              {isSubmitting ? 'Salvando...' : (
                <>
                  <FaUserCheck /> Criar Conta
                </>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default NewUserModal;