const bookmark = require("./bookmark");

// add bookmark
const addToBookmark = async (
  email,
  bookId,
  bookTitle,
  bookAuthor,
  bookPublisher
) => {
  try {
    const result = await bookmark.create({
      email,
      book_id: bookId,
      book_title: bookTitle,
      book_author: bookAuthor,
      book_publisher: bookPublisher,
    });
    return result;
  } catch (error) {
    console.error("Error adding to bookmark:", error);
    throw error;
  }
};

const removeFromBookmark = async (id) => {
  try {
    await bookmark.destroy({
      where: {
        id_bookmark: id,
      },
    });
  } catch (error) {
    console.error("Error removing from bookmark:", error);
    throw error;
  }
};

const getBookmarkData = async (email) => {
  try {
    const bookmarkData = await bookmark.findAll({
      where: { email },
    });
    return bookmarkData;
  } catch (error) {
    console.error("Error getting bookmark data:", error);
    throw error;
  }
};

module.exports = {
  addToBookmark,
  removeFromBookmark,
  getBookmarkData,
};
