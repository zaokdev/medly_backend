import asyncHandler from "express-async-handler";
import { models, sequelize } from "../db/mysql.js";
import Expediente from "../models/mongo/Expediente.js";

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

// GET /appointments/:id
export const getCitaById = asyncHandler(async (req, res) => {
  const cita = await models.citas.findByPk(req.params.id, {
    include: [{ model: models.usuarios, as: "paciente_info" }],
  });
  if (!cita) throw new Error("Cita no encontrada");
  res.json(cita);
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

export const createDiagnosis = asyncHandler(async (req, res) => {
  // 1. Recibimos los datos del formulario
  const { id_cita, diagnostico, signos_vitales, receta, notas_adicionales } =
    req.body;
  const id_medico = req.session.user.id; // Sacamos el ID del doctor de la sesión (seguridad)

  // 2. Validaciones básicas
  if (!id_cita || !diagnostico) {
    res.status(400);
    throw new Error("Faltan datos obligatorios (Cita o Diagnóstico)");
  }

  // 3. Buscar la cita en SQL para obtener datos del paciente
  const citaSQL = await models.citas.findOne({
    where: { id: id_cita, id_medico: id_medico, estado: "pendiente" },
    include: [{ model: models.usuarios, as: "paciente_info" }], // Necesitamos saber quién es el paciente
  });

  if (!citaSQL) {
    res.status(404);
    throw new Error("Cita no encontrada o ya finalizada");
  }

  const id_paciente_sql = citaSQL.id_paciente;
  const nombre_doctor = req.session.user.nombre_completo; // O búscalo en BD si prefieres
  console.log("ID DE PACIENTE SQL   " + id_paciente_sql);

  // --- INICIO DE LA OPERACIÓN MIXTA ---

  // 4. Paso 1: Guardar en MongoDB (Hacemos PUSH al array)
  // Usamos findOneAndUpdate para buscar por el ID SQL del paciente y actualizar
  const expedienteActualizado = await Expediente.findOneAndUpdate(
    { id_paciente_sql: id_paciente_sql },
    {
      $push: {
        historial_consultas: {
          id_cita_sql: id_cita,
          id_doctor_sql: id_medico,
          nombre_doctor: nombre_doctor,
          fecha: new Date(),
          diagnostico: diagnostico,
          signos_vitales: signos_vitales, // { peso, altura, temperatura... }
          receta: receta, // Array de medicamentos
          notas_adicionales: notas_adicionales,
        },
      },
    },
    { new: true } // Para que nos devuelva el documento actualizado (opcional)
  );

  if (!expedienteActualizado) {
    // Si no tiene expediente, podrías crearlo aquí, pero asumimos que ya existe al registrarse
    res.status(404);
    throw new Error("El paciente no tiene un expediente digital creado.");
  }

  try {
    // 5. Paso 2: Actualizar SQL (Cerrar la cita)
    citaSQL.estado = "finalizada";
    await citaSQL.save();

    // ¡ÉXITO TOTAL!
    res.status(200).json({ mensaje: "Consulta finalizada correctamente" });
  } catch (sqlError) {
    // --- ROLLBACK MANUAL (CRÍTICO) ---
    // Si SQL falló, debemos sacar la consulta que acabamos de meter en Mongo
    // para que no quede registro de una consulta que "nunca terminó" legalmente.
    console.error("Error en SQL, haciendo rollback en Mongo...");

    await Expediente.findOneAndUpdate(
      { id_paciente_sql: id_paciente_sql },
      {
        $pull: {
          historial_consultas: { id_cita_sql: id_cita },
        },
      }
    );

    res.status(500);
    throw new Error(
      "Error al finalizar la cita en el sistema. Se han revertido los cambios."
    );
  }
});
