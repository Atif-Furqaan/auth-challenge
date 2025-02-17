const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const jwtSecret = "mysecret";

const register = async (req, res) => {
  const { username, password } = req.body;
  const saltRounds = 7;
  bcrypt.hash(password, saltRounds).then(async function (hash) {
    const createdUser = await prisma.user.create({
      data: {
        username: username,
        password: hash,
      },
    });
    res.json({ data: createdUser });
  });
};

const login = async (req, res) => {
  const { username, password } = req.body;

  const foundUser = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });

  if (!foundUser) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  const passwordsMatch = await bcrypt.compare(password, foundUser.password);

  if (!passwordsMatch) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  const token = jwt.sign(username, jwtSecret);

  res.json({ data: token });
};

module.exports = {
  register,
  login,
};
