# Project Overview

This project is a RESTful API for a tattoo business called "EdgarArtTattoo". It is built with Node.js, Express.js, and MongoDB. The API provides functionalities for managing users, reviews, products, and top tattoos. It also includes features like user authentication with JWT, file uploads to Cloudinary, and email notifications using Nodemailer.

## Building and Running

### Prerequisites

*   Node.js
*   npm
*   MongoDB

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/BrayanMen/EdgarArtTattooApi.git
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root directory and add the necessary environment variables. You can use `.env.example` as a template.

### Running the Application

*   **Development Mode:**
    ```bash
    npm start
    ```
    This command uses `nodemon` to automatically restart the server on file changes.

*   **Production Mode:**
    ```bash
    npm run dev
    ```

## Development Conventions

*   **Error Handling:** The project uses a centralized error handling middleware. Custom errors are created using the `AppError` class. Asynchronous functions are wrapped with `catchAsync` to handle exceptions.
*   **Routing:** The routes are organized in the `src/Routes` directory. The main router is in `src/Routes/index.js`, which then delegates to specific routers for each resource (e.g., `UserRouter`, `ReviewsRouter`).
*   **Controllers:** The business logic is separated into controllers, which are located in the `src/Controllers` directory. Each resource has its own controller (e.g., `UserController`, `ReviewsController`).
*   **Models:** The database models are defined using Mongoose and are located in the `src/Models` directory.
*   **Middleware:** The project uses several custom middleware for security, authentication, and file uploads. These are located in the `src/Middleware` directory.
*   **Linting and Formatting:** (TODO: Add information about linting and formatting tools if they are used in the project).
*   **Testing:** (TODO: Add information about the testing framework and how to run tests if they are available in the project).
