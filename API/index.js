const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
app.use(express.json());

const users = [
  {
    id: 1,
    username: "Aan",
    password: "aan123",
    isAdmin: true,
  },
  {
    id: 2,
    username: "San",
    password: "san123",
    isAdmin: false,
  },
];

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => {
    return u.username === username && u.password === password;
  });

  if (user) {
    // Generate Token
    const accessToken = jwt.sign(
      {
        id: user.id,
        isAdmin: user.isAdmin,
      },
      "mySecretKey"
    );

    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      token: accessToken,
    });
  } else {
    res.status(400).json("Username & Password Incorrect");
  }
});

const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, "mySecretKey", (err, user) => {
      if (err) {
        res.status(403).json("Token Isn't Valid!");
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json("You Are Not Authenticated!");
  }
};

app.listen(5000, () => {
  console.log(`Backend is running on port 5000`);
});
