import asyncHandler from "express-async-handler";
import { models, sequelize } from "../db/mysql.js";

export const bookAppointment = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    res.status(400);
    throw new Error("Falta especificar la cita");
  }

  await sequelize.transaction(async (t) => {
    const agenda = await models.agenda_medica.findOne({
      where: { id },
      transaction: t,
      lock: true,
    });

    if (!agenda) throw new Error("No existe esta cita");

    const appointmentExists = await models.citas.findOne({
      where: { id_agenda: id, estado: "pendiente" },
    });

    if (appointmentExists) {
      res.status(400);
      throw new Error("Horario ya ocupado. Seleccione otro.");
    }

    agenda.update({ disponible: false }, { transaction: t });

    const agendarCita = await models.citas.create(
      {
        id_agenda: agenda.id,
        estado: "pendiente",
        id_paciente: req.session.user.id,
        id_medico: agenda.id_medico,
      },
      { transaction: t }
    );

    res.status(201).json({ mensaje: "Cita agendada con exito", agendarCita });
  });
});

export const cancelAppointment = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const userInSession = req.session.user.id;

  if (!id) {
    res.status(400);
    throw new Error("Falta especificar la cita");
  }

  await sequelize.transaction(async (t) => {
    const appointmentFound = await models.citas.findOne({
      where: { id },
      include: {
        model: models.agenda_medica,
        as: "agenda_info",
        attributes: ["fecha", "hora"],
      },
      transaction: t,
      lock: true,
    });

    if (!appointmentFound) {
      res.status(404);
      throw new Error(
        "Hubo un error al encontrar tu cita, verifica los datos."
      );
    }

    if (
      userInSession != appointmentFound.id_paciente &&
      userInSession != appointmentFound.id_medico
    ) {
      res.status(403);
      throw new Error("No eres parte de esta cita");
    }

    // Actualizar estado de la cita
    await appointmentFound.update({ estado: "cancelada" }, { transaction: t });

    const schedule = await models.agenda_medica.findOne({
      where: { id: appointmentFound.id_agenda },
      transaction: t,
      lock: true,
    });

    // Poner agenda como disponible otra vez
    await schedule.update({ disponible: true }, { transaction: t });
  });

  res.status(200).json({ mensaje: `Cita cancelada` });
});

export const finishAppointment = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const userInSession = req.session.user.id;

  if (!id) {
    res.status(400);
    throw new Error("Falta especificar la cita");
  }

  // Buscar la cita
  const appointment = await models.citas.findOne({
    where: { id },
  });

  if (!appointment) {
    res.status(404);
    throw new Error("No existe esta cita");
  }

  // Checar que el usuario sea el médico asignado
  if (appointment.id_medico !== userInSession) {
    res.status(403);
    throw new Error("Solo el médico puede finalizar la cita");
  }

  /**
   *
   *
   * AGREGAR EL EXPEDIENTE DE MONGODB DE LA CITA
   *
   *
   *
   */

  // Actualizar estado
  await appointment.update({
    estado: "finalizada",
    //mongo_id_expediente
  });

  res.status(200).json({
    mensaje: "Cita finalizada",
  });
});

export const getUserPatientAppointments = asyncHandler(async (req, res) => {
  const userInSession = req.session.user.id;

  const appointments = await models.citas.findAll({
    where: {
      id_paciente: userInSession,
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
        attributes: ["id", "nombre", "apellido", "email"],
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
