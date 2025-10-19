# Escola Bosque - Sistema de Tickets de Suporte

Este é um projeto full-stack de um Sistema de Tickets de Suporte, desenvolvido para a Escola Bosque. Ele permite que usuários abram chamados que são gerenciados pela equipe de suporte através de um painel de administração seguro e moderno.

---

## Funcionalidades Principais

* **Arquitetura de Segurança Avançada:**
    * **Access/Refresh Tokens:** Autenticação robusta usando tokens de acesso de curta duração (15min) e tokens de atualização (30d) armazenados em cookies `httpOnly` para prevenir ataques XSS.
    * **Rate Limiting:** Proteção contra ataques de força bruta (5 tentativas de login) e DoS.
    * **Headers de Segurança:** Uso do `Helmet` para proteção contra vulnerabilidades web comuns.
    * **Sanitização de Input:** Prevenção contra ataques XSS (Cross-Site Scripting) em todos os inputs de usuário.

* **Dois Níveis de Acesso:**
    * **Usuário (Padrão):** Pode abrir novos tickets (com título, descrição, categoria e anexos), acompanhar o status dos seus chamados e interagir com o suporte através de um chat.
    * **Suporte (Admin):** Tem um painel para visualizar *todos* os tickets, filtrar por status, categoria ou buscar por texto. Pode responder aos chamados, alterar seu status (Aberto, Pendente, Concluído) e prioridade.

* **Criação de Contas (Segura):** Apenas usuários "Suporte" (Admins) podem criar novas contas (ex: "Biblioteca", "Financeiro"), garantindo controle total de quem acessa o sistema.

* **Interface Moderna:** Design limpo e responsivo (React) utilizando as cores institucionais da Escola Bosque.

---

## Tecnologias Utilizadas

Este projeto é dividido em duas partes principais:

| Área | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Frontend** | React (com Vite) | Para a construção da interface de usuário reativa. |
| | React Router | Para gerenciamento de rotas no lado do cliente. |
| | Axios | Para fazer requisições à API (com interceptors para Refresh Token). |
| | React Hot Toast | Para notificações e alertas. |
| | React Icons | Para os ícones da interface. |
| **Backend** | Node.js / Express | Framework para a construção da API REST. |
| | MySQL2 | Driver para conexão com o banco de dados MySQL. |
| | JWT & `cookie-parser`| Para o sistema de Access/Refresh Tokens. |
| | `bcryptjs` | Para criptografar (hash) as senhas dos usuários. |
| | `multer` | Middleware para o upload de arquivos/anexos. |
| | `helmet` | Para adicionar headers de segurança HTTP. |
| | `express-rate-limit` | Para prevenir ataques de força bruta e DoS. |
| | `dompurify` | Para sanitizar inputs e prevenir XSS. |
| **Banco de Dados** | MySQL | Sistema de gerenciamento de banco de dados relacional. |

---

## Como Executar o Projeto

Siga os passos abaixo para rodar o projeto localmente.

### Pré-requisitos

* [Node.js](https://nodejs.org/en/) (v18 ou superior)
* [MySQL](https://dev.mysql.com/downloads/workbench/) (Workbench ou qualquer outro cliente MySQL)

### 1. Banco de Dados (MySQL)

1.  Abra seu cliente MySQL.
2.  Crie um novo banco de dados. (O nome `escola_bosque_suporte` é recomendado).
3.  Execute o script `database.sql` (disponível no projeto) para criar todas as tabelas, incluindo `refresh_tokens`.

### 2. Backend (Servidor)

1.  Navegue até a pasta do backend:
    ```bash
    cd backend
    ```
2.  Instale as dependências (incluindo as de segurança):
    ```bash
    npm install
    npm install express-rate-limit helmet dompurify jsdom cookie-parser
    ```
3.  Crie um arquivo `.env` na raiz da pasta `backend/` e preencha-o com suas credenciais. **Use o modelo abaixo**:

    ```ini
    # Configuração do Banco de Dados
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=sua_senha_do_mysql
    DB_NAME=escola_bosque_suporte
    
    # Configuração do Servidor
    PORT=5000
    
    # Chaves Secretas do JWT (NOVAS)
    JWT_ACCESS_SECRET=gere_uma_chave_longa_aqui_com_crypto
    JWT_REFRESH_SECRET=gere_outra_chave_longa_aqui_com_crypto
    ```

4.  Inicie o servidor backend:
    ```bash
    npm run dev
    ```
5.  O servidor estará rodando em `http://localhost:5000`.

### 3. Frontend (Cliente Web)

1.  Em um **novo terminal**, navegue até a pasta do frontend:
    ```bash
    cd frontend
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Crie um arquivo `.env` na raiz da pasta `frontend/`:
    ```ini
    VITE_API_URL=http://localhost:5000/api
    ```

4.  Inicie o servidor de desenvolvimento do Vite:
    ```bash
    npm run dev
    ```
5.  O frontend estará acessível em `http://localhost:3000`.

### 4. Criando seu Primeiro Admin

A rota de registro é protegida e só pode ser usada por um admin. Para criar seu **primeiro** admin, você deve inseri-lo manualmente no banco de dados:

1.  Abra o MySQL e execute o seguinte comando SQL (a senha será `senha123`):
    ```sql
    INSERT INTO users (nome, email, senha, tipo) 
    VALUES 
    ('Admin Suporte', 'suporte@escola.com', '$2a$10$f/e3/R5/5vAsu5pI8o/7aOb.P.T7kU3d.xK/aC6.M8F.go8D.H/5q', 'suporte');
    ```
2.  Agora, vá para `http://localhost:3000` e faça login com:
    * **Email:** `suporte@escola.com`
    * **Senha:** `senha123`
3.  Você está logado como Admin. Use o botão **"Criar Novo Usuário"** no seu painel para cadastrar todas as outras contas (Marketing, Biblioteca, outros usuários, etc.) de forma segura.

---

## Licença

Este projeto está licenciado sob a **Licença MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.