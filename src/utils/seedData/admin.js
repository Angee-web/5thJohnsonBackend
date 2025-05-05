const bcrypt = require("bcryptjs");

// Create a hashed password
const createHashedPassword = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

module.exports = [
  {
    username: "admin",
    password: createHashedPassword("admin123"),
    email: "admin@5thjohnson.com",
    name: "Admin User",
    isActive: true,
    lastLogin: new Date(),
  },
];
