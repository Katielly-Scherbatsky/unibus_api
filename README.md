# 🚌 Unibus - Gestor de Ônibus Acadêmico (API)

> **Trabalho de Conclusão de Curso (TCC)** - Sistema de gestão para associações de transporte universitário.

Este repositório contém a **API RESTful** do sistema Unibus, responsável por gerenciar as regras de negócio, autenticação, cadastro de associados, administradores, e controle de transportes.

## 🚀 Tecnologias Utilizadas
- **Framework:** [NestJS](https://nestjs.com/)
- **Linguagem:** TypeScript
- **ORM:** [Prisma](https://www.prisma.io/)
- **Banco de Dados:** MySQL
- **Segurança:** JWT (JSON Web Tokens) e Bcrypt

## ⚙️ Como executar o projeto localmente

### Pré-requisitos
- Node.js (v18+)
- MySQL rodando localmente (ou via nuvem)

### Passos
1. Clone este repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env` na raiz do projeto baseado no `.env.example` (se houver) e configure a sua `DATABASE_URL`.
4. Execute as migrations do Prisma para criar as tabelas no banco:
   ```bash
   npx prisma migrate dev
   ```
5. Inicie o servidor em modo de desenvolvimento:
   ```bash
   npm run start:dev
   ```

A API estará disponível em `http://localhost:3000`.
