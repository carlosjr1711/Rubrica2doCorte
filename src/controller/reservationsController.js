import express from "express";
import { body, validationResult } from "express-validator";
import connection from "../db.js";
import {
  errorFormatter,
  formatErrorResponse,
  formatErrorValidator,
  formatResponse,
} from "../helper/errorFormatter.js";

const reservationsRouter = express.Router();

// CREAR NUEVA RESERVA
reservationsRouter.post(
  "/bookings",
  [
    body("codigo_habitacion")
      .notEmpty()
      .withMessage("El codigo de la habitacion es un campo obligatorio."),
    body("nombre")
      .notEmpty()
      .withMessage("El nombre del cliente es un campo obligatorio."),
    body("telefono")
      .notEmpty()
      .withMessage("El telefono del cliente es un campo obligatorio."),

    body("fecha_reservacion")
      .notEmpty()
      .withMessage("La fecha de reservacion es un campo obligatorio."),

    body("fecha_reservacion")
      .isDate()
      .withMessage(
        "YYYY/MM/DD"
      ),

    body("fecha_entrada")
      .notEmpty()
      .withMessage("La fecha de entrada es un campo obligatorio."),

    body("fecha_entrada")
      .isDate()
      .withMessage(
        "YYYY/MM/DD"
      ),

    body("fecha_salida")
      .notEmpty()
      .withMessage("La fecha de salida es un campo obligatorio."),

    body("fecha_salida")
      .isDate()
      .withMessage(
        "YYYY/MM/DD"
      ),
  ],
  async (req, res) => {
    const resultErrors = validationResult(req).formatWith(errorFormatter);
    if (!resultErrors.isEmpty()) {
      const errorResponse = formatErrorValidator(resultErrors);
      return res.status(422).json(formatResponse({}, errorResponse));
    }

    const newConnection = await connection.getConnection();
    await newConnection.beginTransaction();

    try {
      const {
        codigo_habitacion,
        nombre,
        telefono,
        fecha_reservacion,
        fecha_entrada,
        fecha_salida,
      } = req.body;

      const [data] = await newConnection.query(
        "SELECT * FROM habitaciones WHERE codigo= ?",
        [codigo_habitacion]
      );

      if (!data[0]) {
        newConnection.release();
        return res
          .status(422)
          .json(
            formatResponse(
              {},
              `No se encontro una habitacion registrada con el codigo : ${codigo_habitacion}.`
            )
          );
      }

      const newReserva = await newConnection.query(
        `INSERT INTO reservas(codigo_habitacion, nombre_cliente, telefono_cliente, fecha_reservacion, fecha_entrada, fecha_salida)
        VALUES(?, ?, ?, ?, ?, ?)
        `,
        [
          codigo_habitacion,
          nombre,
          telefono,
          fecha_reservacion,
          fecha_entrada,
          fecha_salida,
        ]
      );

      const newReservaID = newReserva.insertId;

      const [rows] = await newConnection.query(
        "SELECT * FROM reservas WHERE codigo= ?",
        [newReservaID]
      );

      await newConnection.commit();
      newConnection.release();

      return res.status(201).json(
        formatResponse(
          {
            message: `Reservacion registrada con exito`,
            habitaciones: rows,
          },
          ""
        )
      );
    } catch (error) {
      console.log(error);
      newConnection.rollback();
      newConnection.release();
      const errorFormated = formatErrorResponse(error);
      return res.status(500).json(errorFormated);
    }
  }
);

// ACTUALIZAR LA RESERVA
reservationsRouter.patch(
  "/bookings/:codigo",
  [
    body("codigo_habitacion")
      .notEmpty()
      .withMessage("El codigo de la habitacion es un campo obligatorio."),
    body("nombre")
      .notEmpty()
      .withMessage("El nombre del cliente es un campo obligatorio."),
    body("telefono")
      .notEmpty()
      .withMessage("El telefono del cliente es un campo obligatorio."),

    body("fecha_reservacion")
      .notEmpty()
      .withMessage("La fecha de reservacion es un campo obligatorio."),

    body("fecha_reservacion")
      .isDate()
      .withMessage(
        "YYYY/MM/DD"
      ),

    body("fecha_entrada")
      .notEmpty()
      .withMessage("La fecha de entrada es un campo obligatorio."),

    body("fecha_entrada")
      .isDate()
      .withMessage(
        "YYYY/MM/DD"
      ),

    body("fecha_salida")
      .notEmpty()
      .withMessage("La fecha de salida es un campo obligatorio."),

    body("fecha_salida")
      .isDate()
      .withMessage(
        "YYYY/MM/DD"
      ),
  ],
  async (req, res) => {
    const resultErrors = validationResult(req).formatWith(errorFormatter);
    if (!resultErrors.isEmpty()) {
      const errorResponse = formatErrorValidator(resultErrors);
      return res.status(422).json(formatResponse({}, errorResponse));
    }

    const newConnection = await connection.getConnection();
    await newConnection.beginTransaction();

    try {
      const { codigo } = req.params;

      const {
        codigo_habitacion,
        nombre,
        telefono,
        fecha_reservacion,
        fecha_entrada,
        fecha_salida,
      } = req.body;

      const [rows] = await newConnection.query(
        "SELECT * FROM reservas WHERE codigo= ?",
        [codigo]
      );

      if (!rows[0]) {
        newConnection.release();
        return res
          .status(422)
          .json(
            formatResponse(
              {},
              `No se encontro una reserva registrada con el codigo : ${codigo}.`
            )
          );
      }

      const [validacion] = await newConnection.query(
        "SELECT * FROM habitaciones WHERE codigo= ?",
        [codigo_habitacion]
      );

      if (!validacion[0]) {
        newConnection.release();
        return res
          .status(422)
          .json(
            formatResponse(
              {},
              `No se encontro una habitacion registrada con el codigo : ${codigo_habitacion}.`
            )
          );
      }

      await newConnection.query(
        `UPDATE reservas SET codigo_habitacion= ?, nombre_cliente= ?, telefono_cliente= ?, 
        fecha_reservacion= ?, fecha_entrada= ?, fecha_salida= ? WHERE codigo= ?
        `,
        [
          codigo_habitacion,
          nombre,
          telefono,
          fecha_reservacion,
          fecha_entrada,
          fecha_salida,
          codigo,
        ]
      );

      await newConnection.commit();
      newConnection.release();

      const [data] = await newConnection.query(
        "SELECT * FROM reservas WHERE codigo= ?",
        [codigo]
      );
      return res.status(201).json(
        formatResponse(
          {
            message: `Reservacion actualizada con exito`,
            reservacion: data,
          },
          ""
        )
      );
    } catch (error) {
      console.log(error);
      newConnection.rollback();
      newConnection.release();
      const errorFormated = formatErrorResponse(error);
      return res.status(500).json(errorFormated);
    }
  }
);

// ALIMINAR LA RESERVA
reservationsRouter.delete("/bookings/:codigo", async (req, res) => {
  const resultErrors = validationResult(req).formatWith(errorFormatter);
  if (!resultErrors.isEmpty()) {
    const errorResponse = formatErrorValidator(resultErrors);
    return res.status(422).json(formatResponse({}, errorResponse));
  }

  const newConnection = await connection.getConnection();
  await newConnection.beginTransaction();

  try {
    const { codigo } = req.params;

    const [rows] = await newConnection.query(
      "SELECT * FROM reservas WHERE codigo= ?",
      [codigo]
    );

    if (!rows[0]) {
      newConnection.release();
      return res
        .status(422)
        .json(
          formatResponse(
            {},
            `No se encontro una reserva registrada con el codigo : ${codigo}.`
          )
        );
    }

    await newConnection.query(`DELETE FROM reservas WHERE codigo= ?`, [codigo]);

    await newConnection.commit();
    newConnection.release();

    return res.status(201).json(
      formatResponse(
        {
          message: `Reservacion eliminada con exito`,
        },
        ""
      )
    );
  } catch (error) {
    console.log(error);
    newConnection.rollback();
    newConnection.release();
    const errorFormated = formatErrorResponse(error);
    return res.status(500).json(errorFormated);
  }
});

export default reservationsRouter;
