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

app.listen(5000, () => {
  console.log(`Backend is running on port 5000`);
});
