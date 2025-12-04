import { models, sequelize } from "../db/mysql.js";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import Expediente from "../models/mongo/Expediente.js";

/**
 * Este endpoint solo crea pacientes
 */

export const createUser = asyncHandler(async (req, res) => {
  const { email, nombre, apellido, password, alergias, tipo_sangre } = req.body;

  if (!email || !nombre || !apellido || !password) {
    res.status(400);
    throw new Error("Datos incompletos");
  }

  const userFound = await models.usuarios.findOne({ where: { email } });
  if (userFound) {
    res.status(409);
    throw new Error("Este email ya fue registrado");
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHashed = await bcrypt.hash(password, salt);

  const t = await sequelize.transaction();

  let expedienteCreado = null; // Para poder borrarlo si algo falla después

  try {
    const user = await models.usuarios.create(
      {
        nombre,
        email,
        apellido,
        id_rol: 3,
        password: passwordHashed,
      },
      { transaction: t }
    );
    console.log("4. Intentando crear Expediente Mongo...");

    expedienteCreado = await Expediente.create({
      id_paciente_sql: user.id,
      nombre_paciente: `${nombre} ${apellido}`,
      alergias: alergias || [],
      tipo_sangre,
      historial_consultas: [],
    });

    console.log(expedienteCreado.id);

    user.expediente_id = expedienteCreado._id.toString();

    await user.save({ transaction: t });

    await t.commit();

    return res.status(201).json({
      mensaje: "Usuario creado con éxito",
      userId: user.id,
      expedienteId: expedienteCreado._id,
    });
  } catch (error) {
    await t.rollback();

    //Si hay un rollback, hay que eliminar el expediente que se creó
    if (expedienteCreado) {
      await Expediente.findByIdAndDelete(expedienteCreado._id);
      console.log(
        "Rollback Mongo: Expediente eliminado por fallo en transacción SQL"
      );
    }

    res.status(500);
    throw new Error(error.message || "Hubo un error al crear el usuario");
  }
});

/**
 * Este endpoint crea un doctor
 */
export const createDoctor = asyncHandler(async (req, res) => {
  const { email, nombre, apellido, password, especialidadeds } = req.body;
  if (
    !req.body.email ||
    !req.body.nombre ||
    !req.body.apellido ||
    !req.body.password
  ) {
    res.status(404);
    throw new Error("Datos incompletos");
  }

  const userFound = await models.usuarios.findOne({
    where: { email },
  });

  //Verificar si el usuario no esta registrado
  if (userFound) {
    res.status(404);
    throw new Error("Este email ya fue registrado");
  }

  //Hash de password
  const salt = await bcrypt.genSalt(10);
  const passwordHashed = await bcrypt.hash(password, salt);

  const user = await models.usuarios.create({
    nombre,
    email,
    apellido,
    id_rol: 2,
    password: passwordHashed,
  });

  //TODO: AGREGAR ESPECIALIDADES DE DOCTOR
  if (especialidadeds && especialidadeds.length > 0) {
    // Recorremos el array de IDs (ej: [2, 5]) y creamos la relación
    for (const especialidadId of especialidadeds) {
      await models.medicos_especialidades.create({
        id_medico: user.id,
        id_especialidad: especialidadId,
      });
    }
  }

  if (user) return res.status(201).json({ mensaje: "Usuario creado" });

  res.status(500);
  throw new Error("Hubo un error al crear el usuario");
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(401);
    throw new Error("Credenciales invalidas");
  }

  const userFound = await models.usuarios.findOne({
    where: { email },
  });

  if (!userFound) {
    res.status(401);
    throw new Error("Credenciales invalidas. Usuario no encontrado.");
  }

  const validPassword = await bcrypt.compare(password, userFound.password);

  if (!validPassword) {
    res.status(401);
    throw new Error("Credenciales invalidas.");
  }

  req.session.user = {
    id: userFound.id,
    nombre_completo: `${userFound.nombre} ${userFound.apellido}`,
    id_rol: userFound.id_rol,
  };

  req.session.save((err) => {
    if (err) {
      res.status(500);
      throw new Error("Hubo un error al iniciar la sesion");
    }

    res.status(200).json({
      mensaje: "Login exitoso",
      usuario: req.session.user,
    });
  });
});

/**
 * Verificar los datos del usuario
 */
export const verifySession = asyncHandler(async (req, res) => {
  // Verificamos si existe la sesión y el objeto de usuario guardado en el login
  if (req.session && req.session.user) {
    res.status(200).json({
      mensaje: "Sesión activa",
      usuario: req.session.user, // Devuelve: id, nombre_completo, id_rol
    });
  } else {
    res.status(401);
    throw new Error("No hay sesión activa");
  }
});

/**
 * Cierra la sesion del usuario
 */
export const logoutUser = asyncHandler(async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500);
      // Nota: Dentro del callback, throw new Error a veces no es atrapado por asyncHandler
      // dependiendo de la versión, así que respondemos directo por seguridad.
      return res.json({ message: "No se pudo cerrar la sesión" });
    }

    // 2. Borrar la cookie del navegador
    // IMPORTANTE: 'connect.sid' es el nombre por defecto de express-session.
    // Si en tu app.js pusiste un "name" diferente, cámbialo aquí.
    res.clearCookie("medly");

    res.status(200).json({ mensaje: "Sesión cerrada correctamente" });
  });
});
