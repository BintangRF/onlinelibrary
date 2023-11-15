const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const mylibrary = sequelize.define("tb_mylibrary", {
  id_borrow: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: Sequelize.STRING,
  book_id: Sequelize.STRING,
  book_title: Sequelize.STRING,
  book_author: Sequelize.STRING,
  book_publisher: Sequelize.STRING,
  borrowing_date: Sequelize.DATE,
  return_date: Sequelize.DATE,
});

mylibrary
  .sync()
  .then(() => {
    console.log("Tabel disinkronkan.");
  })
  .catch((err) => {
    console.error("Gagal menyinkronkan tabel:", err);
  });

module.exports = mylibrary;
