# Secrets Project

The Secrets project is a learning platform for authentication and security features. It allows users to submit their secrets anonymously, progressing through different levels of security.

## Levels of Security

### Level 1: Username and Password
- Simple authentication using username and password.

### Level 2: Encryption
- Adds encryption for improved security.
- Environment variables used for sensitive information.

### Level 3: Hashing with MD5
- Introduces MD5 hashing for password storage.

### Level 4: Hashing and Salting with Bcrypt
- Implements bcrypt for password hashing and salting.

### Level 5: Cookies and Session
- Utilizes sessions, Passport, and Passport Local Mongoose for improved authentication.

### Level 6: Google OAuth 2.0
- Implements Google OAuth 2.0 for secure user authentication.

## Getting Started

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Set up environment variables.
4. Run the application with `node app.js`.

## Project Structure

- `app.js`: Main application file.
- `models/user.js`: User model for MongoDB.
- `views/`: Contains EJS views.
- `public/`: Static files (CSS, images).
- `routes/`: Route handlers.

## Dependencies

- Express
- EJS
- MongoDB & Mongoose
- Passport & Passport Local
- Bcrypt
- Google OAuth 2.0

## Contributing

Feel free to contribute and enhance the project! Follow the standard GitHub workflow:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/new-feature`.
3. Commit your changes: `git commit -m 'Add new feature'`.
4. Push to the branch: `git push origin feature/new-feature`.
5. Submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

