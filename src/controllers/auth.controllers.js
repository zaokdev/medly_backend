import { models } from "../db/mysql.js";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";

export const createUser = asyncHandler(async (req, res) => {
  const { email, nombre, apellido, id_rol, password } = req.body;
  if (
    !req.body.email ||
    !req.body.nombre ||
    !req.body.apellido ||
    !req.body.id_rol ||
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
    id_rol,
    password: passwordHashed,
  });

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

    // 5. Responder al Front
    // NO mando token. Solo dices "OK". La cookie va en los headers sola.
    res.status(200).json({
      mensaje: "Login exitoso",
      usuario: req.session.user,
    });
  });
});
