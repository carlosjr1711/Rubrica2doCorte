import express from "express";
import swaggerUI from "swagger-ui-express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import morgan from "morgan";
import docs from "./docs/index.js";
import appRouter from "./router/index.js";
import "./db.js";

dotenv.config();

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: "*" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const httpsServer = http.createServer(app);

httpsServer.listen(process.env.PORT, () => {
  console.log(`Server is running on port: ${process.env.PORT}`);
});

app.use((req, res, next) => {
  if (req.secure) {
    res.redirect(`http://${req.headers.host}${req.url}`);
  } else next();
});

app.use("/api/v1", appRouter);
app.use("/", swaggerUI.serve, swaggerUI.setup(docs));

app.get("*", function (req, res) {
  res.status(404).send("Error 404 - Recurso no encontrado.");
});
