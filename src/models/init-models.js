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

  // --- Relaciones Muchos a Muchos (Especialidades) ---
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
  medicos_especialidades.belongsTo(usuarios, {
    as: "id_medico_usuario",
    foreignKey: "id_medico",
  });
  usuarios.hasMany(medicos_especialidades, {
    as: "medicos_especialidades",
    foreignKey: "id_medico",
  });

  // --- Relaciones de Roles ---
  usuarios.belongsTo(roles, { as: "id_rol_role", foreignKey: "id_rol" });
  roles.hasMany(usuarios, { as: "usuarios", foreignKey: "id_rol" });

  // --- Relaciones de Agenda Médica (Dueño del horario) ---
  agenda_medica.belongsTo(usuarios, {
    as: "id_medico_usuario",
    foreignKey: "id_medico",
  });
  usuarios.hasMany(agenda_medica, {
    as: "agenda_medicas",
    foreignKey: "id_medico",
  });

  // --- Relaciones de Citas (Médico y Paciente) ---
  citas.belongsTo(usuarios, {
    as: "medico_info",
    foreignKey: "id_medico",
  });
  usuarios.hasMany(citas, { as: "citas_como_medico", foreignKey: "id_medico" }); // Ajusté el alias ligeramente para claridad

  citas.belongsTo(usuarios, {
    as: "paciente_info",
    foreignKey: "id_paciente",
  });
  usuarios.hasMany(citas, {
    as: "citas_como_paciente", // Ajusté el alias para evitar conflicto con el de arriba
    foreignKey: "id_paciente",
  });

  // =========================================================
  // NUEVAS RELACIONES: Citas <-> Agenda Médica (Slot)
  // =========================================================

  // 1. Una Cita pertenece a una Agenda (para saber fecha y hora)
  citas.belongsTo(agenda_medica, {
    as: "agenda_info", // Alias útil para el include
    foreignKey: "id_agenda",
  });

  // 2. Una Agenda tiene (a lo mucho) una Cita
  agenda_medica.hasOne(citas, {
    as: "cita_asignada",
    foreignKey: "id_agenda",
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
