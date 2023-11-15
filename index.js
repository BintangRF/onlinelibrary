const express = require("express");
const session = require("express-session");
const app = express();
const ejs = require("ejs");
const path = require("path");
const axios = require("axios");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const sequelize = require("./config/database");
const User = require("./models/user");
const mylibraryFunctions = require("./models/mylibrary-functions");
const bookmarkFunctions = require("./models/bookmark-functions");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

sequelize
  .sync()
  .then(() => {
    console.log("Tabel telah disinkronkan dengan database.");
  })
  .catch((err) => {
    console.error("Gagal menyeimbangkan tabel:", err);
  });

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/uploads/");
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + "-" + file.originalname);
//   },
// });

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

app.use((req, res, next) => {
  res.locals.loggedIn = false;
  next();
});

function loggedIn(req, res, next) {
  if (req.session.userId && req.session.email) {
    User.findOne({
      where: { id_user: req.session.userId, email: req.session.email },
    })
      .then((user) => {
        if (user) {
          res.locals.loggedIn = true;
          res.locals.user = user;
        }
        next();
      })
      .catch((error) => {
        console.error("Error retrieving user:", error);
        next();
      });
  } else {
    next();
  }
}

require("dotenv").config();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Bookshelves
app.get("/", (req, res) => {
  res.redirect("/bookshelves");
});

// bookshelves
app.get("/bookshelves", async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

    // Mengambil data dari URL pertama
    const apiUrl1 = `https://www.googleapis.com/books/v1/volumes?q=filter=free-ebooks&key=${apiKey}`;
    const response1 = await axios.get(apiUrl1);
    const books1 = response1.data.items;

    // Mengambil data dari URL kedua
    const apiUrl2 = `https://www.googleapis.com/books/v1/volumes?q=filter=paid-ebooks&key=${apiKey}`;
    const response2 = await axios.get(apiUrl2);
    const books2 = response2.data.items;

    // Mengambil data dari URL ketiga
    const apiUrl3 = `https://www.googleapis.com/books/v1/volumes?q=filter=subject:history&key=${apiKey}`;
    const response3 = await axios.get(apiUrl3);
    const books3 = response3.data.items;

    res.render("bookshelves", {
      books1: books1,
      books2: books2,
      books3: books3,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil data buku" });
  }
});

// journal
app.get("/journal", async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

    // Mengambil data dari URL pertama
    const apiUrl1 = `https://www.googleapis.com/books/v1/volumes?q=quilting&key=${apiKey}`;
    const response1 = await axios.get(apiUrl1);
    const books1 = response1.data.items;

    // Mengambil data dari URL kedua
    const apiUrl2 = `https://www.googleapis.com/books/v1/volumes?q=Type=books&key=${apiKey}`;
    const response2 = await axios.get(apiUrl2);
    const books2 = response2.data.items;

    res.render("journal", {
      books1: books1,
      books2: books2,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil data buku" });
  }
});

//book-detail
app.get("/book-detail", loggedIn, (req, res) => {
  const bookId = req.query.id;
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

  const apiUrl = `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${apiKey}`;

  axios
    .get(apiUrl)
    .then((response) => {
      const book = response.data;
      res.render("book-detail", { book, loggedIn: res.locals.loggedIn });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Gagal mengambil detail buku" });
    });
});

app.post("/book-detail", loggedIn, async (req, res) => {
  const { action, ...bookDetails } = req.body;
  const { email } = res.locals;

  try {
    if (action === "borrow") {
      // Borrow book logic
      await mylibraryFunctions.addToMyLibrary(
        email,
        bookDetails.bookId,
        bookDetails.bookTitle,
        bookDetails.bookAuthor,
        bookDetails.bookPublisher
      );
      res.status(200).json({ message: "Book borrowed successfully" });
    } else if (action === "toggleBookmark") {
      // Toggle bookmark logic
      const existingBookmark = await bookmarkFunctions.findBookmark(
        email,
        bookDetails.bookId
      );
      if (existingBookmark) {
        await bookmarkFunctions.removeFromBookmark(
          existingBookmark.id_bookmark
        );
        res.status(200).json({ message: "Bookmark removed successfully" });
      } else {
        await bookmarkFunctions.addToBookmark(
          email,
          bookDetails.bookId,
          bookDetails.bookTitle,
          bookDetails.bookAuthor,
          bookDetails.bookPublisher
        );
        res.status(200).json({ message: "Bookmark added successfully" });
      }
    } else {
      res.status(400).json({ error: "Invalid action" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to perform action" });
  }
});

//random
app.get("/random-book", loggedIn, async (req, res) => {
  try {
    async function getRandomBook() {
      const randomPage = Math.floor(Math.random() * 100);
      const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=page=${randomPage}&key=${apiKey}`
      );
      const books = response.data.items;
      const randomIndex = Math.floor(Math.random() * books.length);
      return books[randomIndex];
    }
    const randomBook = await getRandomBook();
    res.render("random-book", {
      book: randomBook,
      loggedIn: res.locals.loggedIn,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Navbar
app.get("/navbar", loggedIn, (req, res) => {
  const { loggedIn, user } = res.locals;

  if (loggedIn) {
    // If user is logged in, render the logged-in navbar
    res.render("navbar", { loggedIn, user });
  } else {
    // If user is not logged in, render the non-logged-in navbar
    res.render("navbar", { loggedIn });
  }
});

// Login
app.get("/login", async (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.password === password) {
      // Set user information in the session
      req.session.userId = user.id_user;
      req.session.email = user.email;

      return res.redirect("/bookshelves");
    } else {
      return res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Register
app.get("/register", async (req, res) => {
  res.render("register");
});

function getDefaultPhotoBuffer() {
  const defaultPhotoPath = path.join(
    __dirname,
    "public/uploads/poto-profil.png"
  );
  // Use a function to read the file synchronously and return the buffer
  const defaultPhotoBuffer = fs.readFileSync(defaultPhotoPath);
  return defaultPhotoBuffer;
}

app.post("/register", upload.single("user_photo"), async (req, res) => {
  const { email, password, verifyPassword } = req.body;
  const userPhoto = req.file;
  let errorMessage = null;

  if (password !== verifyPassword) {
    errorMessage = "Passwords do not match.";
    return res.render("register", { errorMessage });
  }

  try {
    const photoBuffer = userPhoto ? userPhoto.buffer : getDefaultPhotoBuffer();

    const newUser = await User.create({
      email,
      password,
      foto: photoBuffer,
    });

    return res.send(
      '<script>alert("Registration successful. Please log in."); window.location="/login";</script>'
    );
  } catch (error) {
    console.error("Error during registration:", error);
    errorMessage = "Internal Server Error";
    return res.status(500).render("register", { errorMessage });
  }
});

// Navbar
app.get("/navbar", loggedIn, (req, res) => {
  const { loggedIn } = res.locals;
  res.render("navbar", { loggedIn });
});

// Footer
app.get("/footer", async (req, res) => {
  res.render("footer");
});

// Profile
app.get("/profile", loggedIn, async (req, res) => {
  const { loggedIn, user } = res.locals;

  if (!loggedIn) {
    res.redirect("/login");
    return;
  }

  try {
    const myLibraryData = await mylibraryFunctions.getMyLibraryData(user.email);
    const bookmarkData = await bookmarkFunctions.getBookmarkData(user.email);

    console.log("My Library Data:", myLibraryData); // Add this line

    res.render("profile", {
      loggedIn,
      user,
      myLibraryData,
      bookmarkData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch profile data" });
  }
});

// logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/bookshelves");
  });
});

app.get("/logout", (req, res) => {
  res.redirect("/bookshelves");
});

// Menjalankan server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
