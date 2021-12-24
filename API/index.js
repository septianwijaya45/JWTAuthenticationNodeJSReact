const { response, json } = require("express");
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

let refreshTokens = [];

app.post("/api/refresh", (req, res) => {
  // take the reflesh token from the user
  const refreshToken = req.body.token;
  // send error if there is no token or it's valid
  if (!refreshToken) return res.status(401).json("You are not authenticated!");
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json("Refresh Token Is Not Valid!");
  }
  jwt.verify(refreshToken, "myRefreshSecretKey", (err, user) => {
    err && console.log(err);
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    refreshTokens.push(newRefreshToken);

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });
  // if everything is ok, create new access token, refresh token and send to user
});

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      isAdmin: user.isAdmin,
    },
    "mySecretKey",
    { expiresIn: "20s" } // can s (second), m (minute)
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      isAdmin: user.isAdmin,
    },
    "myRefreshSecretKey"
  );
};

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => {
    return u.username === username && u.password === password;
  });

  if (user) {
    // Generate Token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    refreshTokens.push(refreshToken);

    res.json({
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      accessToken,
      refreshToken,
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

app.delete("/api/users/:userId", verify, (req, res) => {
  if (req.user.id === req.params.userId || req.user.isAdmin) {
    res.status(200).json("User has been deleted!");
  } else {
    res.status(403).json("You are not allowed to delete this user!");
  }
});

app.listen(5000, () => {
  console.log(`Backend is running on port 5000`);
});
