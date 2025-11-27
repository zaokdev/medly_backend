import asyncHandler from "express-async-handler";
import { models } from "../db/mysql.js";

export const getAllDoctors = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const pageSize = 8;

  const { count, rows } = await models.usuarios.findAndCountAll({
    where: { id_rol: 2 },
    limit: pageSize,
    offset: (page - 1) * pageSize,
    attributes: ["nombre", "apellido", "email", "id"],
    include: [
      {
        model: models.especialidades,
        as: "especialidades_del_medico",
        attributes: ["nombre"],
        through: { attributes: [] },
      },
    ],
  });
  res.status(200).json({
    pagina_actual: page,
    total_paginas: pageSize > count ? 1 : parseInt(count / pageSize),
    doctores: rows,
  });
});
