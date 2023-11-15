const Sequelize = require("sequelize");
const mylibrary = require("./mylibrary");

// add mylibrary
const addToMyLibrary = async (
  email,
  bookId,
  bookTitle,
  bookAuthor,
  bookPublisher
) => {
  try {
    // Insert book details into the database
    const result = await mylibrary.create({
      email,
      book_id: bookId,
      book_title: bookTitle,
      book_author: bookAuthor,
      book_publisher: bookPublisher,
      borrowing_date: new Date(),
    });

    return result;
  } catch (error) {
    console.error("Error adding to my library:", error);
    throw error;
  }
};

const removeOldBooksFromMyLibrary = async () => {
  try {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    await mylibrary.destroy({
      where: {
        borrowing_date: {
          [Sequelize.Op.lt]: twoWeeksAgo,
        },
      },
    });
  } catch (error) {
    console.error("Error removing old books from my library:", error);
    throw error;
  }
};

// mylibrary-functions.js
const getMyLibraryData = async (email) => {
  try {
    const myLibraryData = await mylibrary.findAll({
      where: { email },
    });
    return myLibraryData;
  } catch (error) {
    console.error("Error getting my library data:", error);
    throw error;
  }
};

module.exports = {
  addToMyLibrary,
  removeOldBooksFromMyLibrary,
  getMyLibraryData,
};
