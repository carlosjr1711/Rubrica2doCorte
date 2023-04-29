import express from "express";
import reservationsRouter from "../controller/reservationsController.js";
import roomRouter from "../controller/roomController.js";

const appRouter = express.Router();

appRouter.use("/", reservationsRouter);
appRouter.use("/", roomRouter);

export default appRouter;
