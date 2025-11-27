import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _agenda_medica from "./agenda_medica.js";
import _citas from "./citas.js";
import _especialidades from "./especialidades.js";
import _medicos_especialidades from "./medicos_especialidades.js";
import _roles from "./roles.js";
import _usuarios from "./usuarios.js";

export default function initModels(sequelize) {
  const agenda_medica = _agenda_medica.init(sequelize, DataTypes);
  const citas = _citas.init(sequelize, DataTypes);
  const especialidades = _especialidades.init(sequelize, DataTypes);
  const medicos_especialidades = _medicos_especialidades.init(
    sequelize,
    DataTypes
  );
  const roles = _roles.init(sequelize, DataTypes);
  const usuarios = _usuarios.init(sequelize, DataTypes);

  especialidades.belongsToMany(usuarios, {
    as: "id_medico_usuarios",
    through: medicos_especialidades,
    foreignKey: "id_especialidad",
    otherKey: "id_medico",
  });
  usuarios.belongsToMany(especialidades, {
    as: "especialidades_del_medico",
    through: medicos_especialidades,
    foreignKey: "id_medico",
    otherKey: "id_especialidad",
  });
  medicos_especialidades.belongsTo(especialidades, {
    as: "id_especialidad_especialidade",
    foreignKey: "id_especialidad",
  });
  especialidades.hasMany(medicos_especialidades, {
    as: "medicos_especialidades",
    foreignKey: "id_especialidad",
  });
  usuarios.belongsTo(roles, { as: "id_rol_role", foreignKey: "id_rol" });
  roles.hasMany(usuarios, { as: "usuarios", foreignKey: "id_rol" });
  agenda_medica.belongsTo(usuarios, {
    as: "id_medico_usuario",
    foreignKey: "id_medico",
  });
  usuarios.hasMany(agenda_medica, {
    as: "agenda_medicas",
    foreignKey: "id_medico",
  });
  citas.belongsTo(usuarios, {
    as: "id_medico_usuario",
    foreignKey: "id_medico",
  });
  usuarios.hasMany(citas, { as: "cita", foreignKey: "id_medico" });
  citas.belongsTo(usuarios, {
    as: "id_paciente_usuario",
    foreignKey: "id_paciente",
  });
  usuarios.hasMany(citas, {
    as: "id_paciente_cita",
    foreignKey: "id_paciente",
  });
  medicos_especialidades.belongsTo(usuarios, {
    as: "id_medico_usuario",
    foreignKey: "id_medico",
  });
  usuarios.hasMany(medicos_especialidades, {
    as: "medicos_especialidades",
    foreignKey: "id_medico",
  });

  return {
    agenda_medica,
    citas,
    especialidades,
    medicos_especialidades,
    roles,
    usuarios,
  };
}
