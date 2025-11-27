import asyncHandler from "express-async-handler";
import { models } from "../db/mysql.js";
import { Op, Sequelize } from "sequelize";

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
