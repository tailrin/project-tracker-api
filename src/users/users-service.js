const bcrypt = require("bcryptjs");
const xss = require("xss");

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const UsersService = {
  getEmployees(db, id) {
    return db
      .from("users")
      .select("users.id", "users.full_name", "users.email", "users.isadmin")
      .where("users.companyid", id);
  },
  hasUserWithUserName(db, email) {
    return db("users")
      .where({ email })
      .first()
      .then((user) => !!user);
  },
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into("users")
      .returning("*")
      .then(([user]) => user);
  },
  validatePassword(password) {
    if (password.length < 8) {
      return "Password must be longer than 8 characters";
    }
    if (password.length > 72) {
      return "Password must be less than 72 characters";
    }
    if (password.startsWith(" ") || password.endsWith(" ")) {
      return "Password must not start or end with empty spaces";
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return "Password must contain one upper case, lower case, number and special character";
    }
    return null;
  },
  hashPassword(password) {
    return bcrypt.hash(password, 10);
  },
  serializeUser(user) {
    return {
      id: user.id,
      full_name: xss(user.full_name),
      email: xss(user.email),
      companyid: user.companyid,
      isadmin: user.isadmin,
    };
  },
  updateUser(db, id, newUserFields) {
    return db("users").where({ id }).update(newUserFields);
  }
};

module.exports = UsersService;
