import express from "express";
import { body, validationResult } from "express-validator";
import {
  errorFormatter,
  formatErrorResponse,
  formatResponse,
} from "../helper/errorFormatter.js";
import connection from "../db.js";

const roomRouter = express.Router();

// VER TODAS LAS HABITACIONES
roomRouter.get("/rooms", async (req, res) => {
  const resultErrors = validationResult(req).formatWith(errorFormatter);
  if (!resultErrors.isEmpty()) {
    const errorResponse = formatErrorValidator(resultErrors);
    return res.status(422).json(formatResponse({}, errorResponse));
  }

  const newConnection = await connection.getConnection();

  try {
    const [rows] = await newConnection.query("SELECT * FROM habitaciones");

    newConnection.release();

    return res.status(201).json(
      formatResponse(
        {
          message: `Numero de habitaciones obtenidas ${rows.length} `,
          habitaciones: rows,
        },
        ""
      )
    );
  } catch (error) {
    console.log(error);
    newConnection.release();
    const errorFormated = formatErrorResponse(error);
    return res.status(500).json(errorFormated);
  }
});

// CONSULTAR HABITACION POR CODIGO
roomRouter.get("/rooms/:codigo", async (req, res) => {
  const resultErrors = validationResult(req).formatWith(errorFormatter);
  if (!resultErrors.isEmpty()) {
    const errorResponse = formatErrorValidator(resultErrors);
    return res.status(422).json(formatResponse({}, errorResponse));
  }

  const newConnection = await connection.getConnection();

  try {
    const { codigo } = req.params;

    const [rows] = await newConnection.query(
      "SELECT * FROM habitaciones WHERE codigo= ?",
      [codigo]
    );

    if (!rows[0]) {
      newConnection.release();
      return res
        .status(422)
        .json(
          formatResponse(
            {},
            `No se encontro una habitacion registrada con el codigo : ${codigo}.`
          )
        );
    }

    newConnection.release();

    return res.status(201).json(
      formatResponse(
        {
          message: `Numero de habitaciones obtenidas ${rows.length} `,
          habitaciones: rows,
        },
        ""
      )
    );
  } catch (error) {
    console.log(error);
    newConnection.release();
    const errorFormated = formatErrorResponse(error);
    return res.status(500).json(errorFormated);
  }
});

export default roomRouter;
