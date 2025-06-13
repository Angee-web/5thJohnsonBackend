const express = require("express");
const app = express();

app.get("/test", (req, res) => {
  console.log("Test route hit");
  res.send("Server is working");
});

const PORT = 7000;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});