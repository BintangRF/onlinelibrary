const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("tb_user", {
  id_user: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: Sequelize.STRING,
  password: Sequelize.STRING,
  foto: Sequelize.BLOB,
});

User.sync()
  .then(() => {
    console.log("Tabel disinkronkan.");
  })
  .catch((err) => {
    console.error("Gagal menyinkronkan tabel:", err);
  });

module.exports = User;
