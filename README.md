# Backend E-commerce Application

This repository contains the backend code for an e-commerce application. It is responsible for handling business logic, data management, and providing APIs for the [frontend application](https://github.com/LuckyPrima/Frontend-Ecommerce).

## 🚀 Overview

This backend is built to support the core functionalities of an e-commerce platform, including product management, user authentication, order processing, and more. It is designed to be a robust and scalable **RESTful API**.

## ✨ Features

While specific details may vary, this backend likely includes essential features such as:

- **User Management:** User registration, login, and authentication (e.g., JWT).
- **Product Management:** CRUD (Create, Read, Update, Delete) for products, categories, and inventory.
- **Order Management:** Order creation, order status, and order history.
- **RESTful API:** Provides structured endpoints for interaction with the frontend application.
- **Database Handling:** Interaction with the database to store and retrieve data.

## 🛠️ Technologies Used

This project is built using the following key technologies:

- **JavaScript:** The primary programming language (100% of the codebase).
- **Node.js:** JavaScript runtime environment.
- **Express.js:** Web framework for Node.js, used for building RESTful APIs.
- **Sequelize:** ORM (Object-Relational Mapper) for database interaction (indicated by `.sequelizerc`).
- **Database:** PostgreSQL.
- **PM2:** (Indicated by `ecosystem.config.js`) A production process manager for Node.js applications.

## 📂 Repository Structure

The main folder structure of this repository:

- `config/`: Application configurations.
- `controllers/`: Business logic for API endpoints.
- `database/`: Database configuration and migrations.
- `lib/`: Utility or helper functions.
- `middleware/`: Middleware functions for Express.js.
- `models/`: Database model definitions (e.g., User, Product, Order).
- `routes/`: API endpoint definitions.
- `server.js`: Main entry point for the server application.
- Other configuration files: `.gitignore`, `package.json`, `package-lock.json`, etc.

## ⚙️ Getting Started

To get a local copy up and running, follow these simple steps:

### Prerequisites

Make sure you have Node.js and npm/yarn installed on your machine.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/LuckyPrima/Backend-Ecommercer.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd Backend-Ecommercer
    ```
3.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
4.  **Database Configuration:**
    - Create a `.env` file in the project root.
    - Add the necessary environment variables for your database connection (e.g., `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_DIALECT`).

### Running the Application

To start the development server:

```bash
npm run dev
# or
yarn dev
```

The server typically runs on `http://localhost:3000` or another configured port.
