import asyncHandler from "express-async-handler";
import { models } from "../db/mysql.js";
import { Op, Sequelize } from "sequelize";
import Expediente from "../models/mongo/Expediente.js";

export const getAllDoctors = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const especialidadId = Number(req.query.especialidad) || null;
  const searchInput = req.query.search || "";
  const pageSize = 8;

  const whereUsuarios = {
    id_rol: 2,
  };
  if (searchInput) {
    whereUsuarios[Op.and] = [
      Sequelize.where(
        Sequelize.fn(
          "concat",
          Sequelize.col("usuarios.nombre"),
          " ",
          Sequelize.col("usuarios.apellido")
        ),
        {
          // Buscamos si esa combinación se parece al texto de búsqueda
          [Op.like]: `%${searchInput}%`,
        }
      ),
    ];
  }

  const whereEspecialidad = {};

  if (especialidadId) {
    whereEspecialidad.id = especialidadId;
  }

  const { count, rows } = await models.usuarios.findAndCountAll({
    where: whereUsuarios,
    limit: pageSize,
    offset: (page - 1) * pageSize,
    attributes: ["nombre", "apellido", "email", "id"],
    distinct: true,
    order: [["nombre", "ASC"]],
    include: [
      {
        model: models.especialidades,
        as: "especialidades_del_medico",
        attributes: ["nombre"],

        where: whereEspecialidad,
        through: { attributes: [] },
        required: !!especialidadId, //si existe true, si no false
      },
    ],
  });
  res.status(200).json({
    pagina_actual: page,
    total_paginas: pageSize > count ? 1 : Math.ceil(count / pageSize),
    doctores: rows,
  });
});

export const getSchedules = asyncHandler(async (req, res) => {
  const { id } = req.query;
  if (!id) {
    res.status(400);
    throw new Error("Falta especificar el medico");
  }

  const actualDate = new Date();

  const docInfo = await models.usuarios.findOne({
    where: { id },
    attributes: ["id", "nombre", "apellido", "email", "id_rol"],
  });

  const schedule = await models.agenda_medica.findAll({
    where: {
      id_medico: id,
      disponible: true,
      fecha: { [Op.gte]: actualDate },
    },
    order: [
      ["fecha", "ASC"],
      ["hora", "ASC"],
    ],
  });

  res.status(200).json({ info_doctor: docInfo, schedule });
});

export const getAllPatients = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const searchInput = req.query.search || "";
  const pageSize = 8;

  const whereUsuarios = {
    id_rol: 3,
  };
  if (searchInput) {
    whereUsuarios[Op.and] = [
      Sequelize.where(
        Sequelize.fn(
          "concat",
          Sequelize.col("usuarios.nombre"),
          " ",
          Sequelize.col("usuarios.apellido")
        ),
        {
          // Buscamos si esa combinación se parece al texto de búsqueda
          [Op.like]: `%${searchInput}%`,
        }
      ),
    ];
  }

  const { count, rows } = await models.usuarios.findAndCountAll({
    where: whereUsuarios,
    limit: pageSize,
    offset: (page - 1) * pageSize,
    attributes: ["nombre", "apellido", "email", "id", "expediente_id"],
    distinct: true,
    order: [["nombre", "ASC"]],
  });
  res.status(200).json({
    pagina_actual: page,
    total_paginas: pageSize > count ? 1 : Math.ceil(count / pageSize),
    pacientes: rows,
  });
});

export const getRecord = asyncHandler(async (req, res) => {
  const { id } = req.query;

  if (!id) {
    res.status(400);
    throw new Error("Falta especificar el id");
  }

  const expediente = await Expediente.findById(id);

  res.status(200).json(expediente);
});
