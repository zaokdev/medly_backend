import { models } from "../db/mysql.js";
import asyncHandler from "express-async-handler";

/**
 *Los doctores abren los espacios disponibles para consulta
 * @returns
 */
export const openSchedules = asyncHandler(async (req, res) => {
  const { horarios } = req.body;

  if (!horarios || !Array.isArray(horarios) || horarios.length === 0) {
    res.status(400);
    throw new Error(
      "Formato incorrecto: Se requiere un array de horarios con fecha y hora."
    );
  }

  const schedulesFormatted = horarios.map((horario) => {
    return {
      id_medico: req.session.user.id,
      fecha: horario.fecha,
      hora: horario.hora,
    };
  });

  const creatingSchedules = await models.agenda_medica.bulkCreate(
    schedulesFormatted,
    { ignoreDuplicates: true }
  );
  res.status(201).json(creatingSchedules);
});

export const getUserDoctorAppointments = asyncHandler(async (req, res) => {
  const userInSession = req.session.user.id;

  const appointments = await models.citas.findAll({
    where: {
      id_medico: userInSession,
      estado: "pendiente",
    },
    attributes: ["id", "estado"],
    include: [
      {
        model: models.agenda_medica,
        as: "agenda_info",
        attributes: ["fecha", "hora"],
        order: [
          ["fecha", "ASC"],
          ["hora", "ASC"],
        ],
      },
      {
        model: models.usuarios,
        as: "paciente_info",
        attributes: ["id", "nombre", "apellido", "email", "expediente_id"],
      },
      {
        model: models.usuarios,
        as: "medico_info",
        attributes: ["id", "nombre", "apellido", "email"],
      },
    ],
  });

  res.status(200).json(appointments);
});
