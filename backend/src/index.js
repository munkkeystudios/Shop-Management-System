const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const collection = require("./mongodb");
// test run2

const tempelatePath = path.join(__dirname, "../templates");

app.use(express.json());
app.set("view engine", "hbs");
app.set("views", tempelatePath);
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.render("login");
});
app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  if (password.length < 6) {
      return res.render("signup", {
          error: "Password must be at least 6 characters long.",
      });
  }

  const data = { username, password };

  await collection.insertMany([data]);

  res.render("home");
});


app.all("/login", async (req, res) => {
  if (req.method === "GET") {
      res.render("login");
  } else if (req.method === "POST") {
      try {
          const check = await collection.findOne({ username: req.body.username });

          if (check && check.password === req.body.password) {
              res.render("home");
          } else {
              res.send("Incorrect Password or Username");
          }
      } catch {
          res.send("Error!");
      }
  }
});


app.get("/logout", (req, res) => {
  res.redirect("/login");
});

app.listen(3000, () => {
  console.log("Port Connected at the following website http://localhost:3000/");
});
