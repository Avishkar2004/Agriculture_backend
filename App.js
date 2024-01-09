import express from "express";
import cors from "cors";
import adminRoute from "./routes/admin.js";
const app = express();

app.use(cors());
app.use(express.json()); // Add this line for JSON parsing

app.use(express.urlencoded({ extended: false }));
app.use("/", adminRoute);

app.get("/", (req, res) => {
  res.send("Hello world");
});

const port = 8080;

app.listen(port, () =>
  console.log(`Server running on port ${port}, http://localhost:${port}`)
);
