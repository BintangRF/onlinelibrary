const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const bookmark = sequelize.define("tb_bookmark", {
  id_bookmark: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: Sequelize.STRING,
  book_id: Sequelize.STRING,
  book_title: Sequelize.STRING,
  book_author: Sequelize.STRING,
  book_publisher: Sequelize.STRING,
});

bookmark
  .sync()
  .then(() => {
    console.log("Tabel disinkronkan.");
  })
  .catch((err) => {
    console.error("Gagal menyinkronkan tabel:", err);
  });

module.exports = bookmark;
