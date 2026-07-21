# 🚌 Unibus API - Sistema de Gestão de Transporte Universitário

> **Trabalho de Conclusão de Curso (TCC)**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

A **Unibus API** é o serviço backend responsável por toda a inteligência de negócio, controle financeiro, gestão de presenças, emissão de comunicados e isolamento de acessos do sistema Unibus.

---

## 🛠️ Stack Tecnológica

- **Framework Backend:** NestJS (Node.js & TypeScript)
- **ORM:** Prisma ORM
- **Banco de Dados:** MySQL / MariaDB
- **Autenticação:** JWT (JSON Web Tokens) com estratégias Passport e Bcrypt
- **Upload de Arquivos:** Multer com suporte a imagens (AVIF, WEBP, PNG, JPG) e documentos PDF

---

## 📋 Recursos e Módulos do Sistema

### 🔐 Autenticação & Controle de Acesso (RBAC)
- Autenticação JWT com decorators personalizados `@Roles('ADMIN', 'ASSOCIADO')` e `@Public()`.
- Rota de auto-cadastro público para novos associados (`PENDENTE`).
- Recuperação de senha com envio/validação de código de verificação.

### 👥 Gestão de Associados & Perfil
- Cadastro completo com dados acadêmicos (Faculdade, Curso, Período), endereço e contato.
- Aprovação de cadastros pendentes pelo Administrador e atribuição de **poltrona única e sequencial**.
- Visualização e atualização de perfil por associados e administradores.

### 🚌 Chamadas & Controle de Presença
- Registro de chamadas por data, período (`Matutino`, `Vespertino`, `Noturno`, `Integral`) e sentido (`IDA` / `VOLTA`).
- Listagem individualizada de presenças e confirmação de viagem por associado.

### 💰 Boletos & Saúde Financeira
- Emissão e acompanhamento de mensalidades (`PAGO`, `PENDENTE`, `EM ATRASO`).
- Cálculos estatísticos de inadimplência e arrecadação mensal no dashboard gerencial.

### 📩 Solicitações do Estudante
- Envio de solicitações para troca de ônibus, troca de poltrona, justificativa de falta e cancelamento de linha.
- Atendimento e alteração de status (`APROVADO`, `RECUSADO`, `PENDENTE`) pelo Administrador.

### 📢 Avisos & ⚠️ Advertências (Confirmação de Leitura)
- Emissão de avisos institucionais e advertências por tipo (`HIGIENE`, `CONDUTA`, `PERTURBACAO`, `HORARIO`).
- Registro individual de leitura por usuário (`avisoUsuarios`), permitindo que o associado confirme leitura diretamente na plataforma.

### 📊 Dashboard & Relatórios
- Métricas e gráficos consolidados para o Administrador.
- Visão restrita e contextual para o perfil de Associado (ocultando métricas administrativas sensíveis como cadastros pendentes).

---

## ⚙️ Configuração e Instalação

### Pré-requisitos
- **Node.js**: `v18.x` ou superior
- **MySQL / MariaDB**: Instância ativa rodando na porta 3306
- **npm** ou **yarn**

### 1. Clonar o repositório e instalar dependências
```bash
git clone https://github.com/Katielly-Scherbatsky/unibus_api.git
cd unibus_api
npm install
```

### 2. Configurar Variáveis de Ambiente (`.env`)
Crie o arquivo `.env` na raiz do projeto `unibus_api` informando a URL do seu banco de dados:
```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/unibus_db"
JWT_SECRET="sua_chave_secreta_super_segura"
PORT=3000
```

### 3. Migrações e População do Banco (Prisma)
Execute as migrações para criar as tabelas e rode o script de seed para popular os dados de teste:
```bash
# Executa as migrações no banco MySQL
npx prisma migrate dev

# Reseta e popula a base com dados padronizados
npx prisma db seed
```

### 4. Executar a Aplicação
```bash
# Modo de Desenvolvimento (watch mode)
npm run start:dev

# Compilação de Produção
npm run build
npm run start:prod
```

---

## 🔑 Credenciais Padrão de Teste (Geradas pelo Seed)

Após a execução do `npx prisma db seed`, as seguintes contas com nomes reais e Ji-Paraná / RO estarão prontas para uso:

| Perfil | Nome | E-mail / Login | Senha | Status / Observações |
| :--- | :--- | :--- | :--- | :--- |
| **Administrador** | Carlos Eduardo Silva | `admin@unibus.com` | `123` | Perfil `ADMIN` (Acesso total) |
| **Associado Aprovado** | Mariana Oliveira Santos | `aprovado@unibus.com` | `123` | Perfil `ASSOCIADO` (Poltrona 01 - IFRO Ji-Paraná) |
| **Associado Pendente** | Diego Ramos | `diego.ramos22@email.com` | `123` | Perfil `ASSOCIADO` (Status `PENDENTE` - Aguardando Aprovação) |

---

## 📁 Estrutura de Pastas e Rotas Principais

```text
unibus_api/
├── prisma/
│   ├── schema.prisma        # Modelo de dados e relacionamentos
│   └── seed.ts              # Script de população de teste
├── src/
│   ├── advertencias/        # Módulo de Advertências
│   ├── associados/          # Módulo de Associados
│   ├── auth/                # Módulo de Autenticação JWT e Guards
│   ├── avisos/              # Módulo de Avisos com tabela de leitura
│   ├── boletos/             # Módulo Financeiro
│   ├── chamadas/            # Módulo de Presença e Viagens
│   ├── dashboard/           # Módulo de Métricas e Dashboard
│   ├── documentos/          # Módulo de Envio de Documentos
│   ├── normas/              # Módulo de Normas e Regulamentos
│   ├── relatorios/          # Módulo de Relatórios e Filtros
│   ├── solicitacoes/        # Módulo de Chamados do Aluno
│   └── transportes/         # Módulo de Veículos e Rotas
└── main.ts                  # Ponto de entrada da aplicação NestJS
```

### Principais Endpoints da API

- `POST /api/auth/login` - Autenticação e geração de Token JWT.
- `POST /api/auth/auto-cadastro` - Cadastro público de novo estudante.
- `GET /api/associados` - Listagem de associados (Filtros por status, faculdade, período).
- `GET /api/chamadas` - Listagem de viagens e presenças.
- `GET /api/boletos` - Emissão e consulta de mensalidades.
- `GET /api/avisos` & `POST /api/avisos/:id/ler` - Leitura e marcação de avisos.
- `GET /api/advertencias` & `POST /api/advertencias/:id/ler` - Confirmação de leitura de advertências.
- `GET /api/relatorios/resumo` - Métricas para o Dashboard por perfil.

---

## 📜 Licença

Projeto desenvolvido para fins acadêmicos (TCC - IFRO Campus Ji-Paraná / RO).
