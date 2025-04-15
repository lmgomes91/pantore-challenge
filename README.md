
# 📦 User Management API

Project developed as part of the Backend technical assessment for Pantore.

## 📑 Description

This application is a RESTful API for user management, allowing:

- 📄 Create a user
- ✏️ Update a user profile
- 🔍 Retrieve and list all users
- 🎯 Filter users by name using a query parameter

The project was built with a focus on clean code practices, code organization, scalability, and Clean Architecture principles.

---

## 🛠️ Technologies Used

- **Node.js**
- **TypeScript**
- **NestJS**
- **MongoDB** (via Mongoose)
- **Jest** (for automated tests)
- **ESLint + Prettier** (for code standardization)

---

## 📦 Installation & Execution

### Prerequisites

- [Node.js LTS](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)

### Clone the repository

```bash
git clone https://github.com/lmgomes91/pantore-challenge.git
cd pantore-challenge
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

Copy the \`.env.example\` file to \`.env\` and fill in the required variables.

### Start the application

```bash
npm run start:dev
```

The API will be available at: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Running Tests

To run the automated tests:

```bash
npm run test
```

---

## 📖 API Documentation

### Endpoints

-   `POST /users`: Cria um novo usuário.
-   `PUT /users/:id`: Atualiza o perfil de um usuário existente.
-   `GET /users/:id`: Busca um usuário pelo ID.
-   `GET /users`: Lista todos os usuários (com opção de filtros por query parameters).
-   `POST /auth/login`: Endpoint para autenticação de usuário e obtenção de token.

Maiores detalhes sobre como utilizar os endpoints podem ser obtidos atraves do [swagger](http://localhost:3000/api)

---

## 📊 Implemented Highlights

- ✅ Clean Architecture
- ✅ TypeScript
- ✅ NestJS framework
- ✅ MongoDB with Mongoose
- ✅ Unit and integration tests with Jest
- ✅ ESLint and Prettier configured
- ✅ Validation and exception handling

---


## 📬 Contact

For questions or suggestions, feel free to reach out:

📧 lgomes@post.com

---

## 📌 About the Challenge

This project was developed for Pantore’s Backend technical assessment, with the goal of evaluating skills in:

- Software architecture
- API structuring
- Database modeling
- Code efficiency and clean practices
- Problem-solving with security and scalability in mind

---

