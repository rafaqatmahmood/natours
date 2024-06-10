const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.status(404).send({
    message: "Hello from the server side!",
    app: "Natours",
  });
});

const port = 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
