import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class citas extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        // --- CAMBIO: Nueva relación con la agenda ---
        id_agenda: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "agenda_medica", // Asegúrate que este nombre coincida con tableName del otro modelo
            key: "id",
          },
        },
        // --------------------------------------------
        id_paciente: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "usuarios",
            key: "id",
          },
        },
        id_medico: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "usuarios",
            key: "id",
          },
        },
        estado: {
          type: DataTypes.ENUM("pendiente", "finalizada", "cancelada"),
          allowNull: true,
          defaultValue: "pendiente",
        },
      },
      {
        sequelize,
        tableName: "citas",
        timestamps: false,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "id" }],
          },
          // --- NUEVO INDICE PARA LA FOREIGN KEY ---
          {
            name: "fk_citas_agenda",
            using: "BTREE",
            fields: [{ name: "id_agenda" }],
          },
          // ----------------------------------------
          {
            name: "fk_citas_paciente",
            using: "BTREE",
            fields: [{ name: "id_paciente" }],
          },
          {
            name: "fk_citas_medico",
            using: "BTREE",
            fields: [{ name: "id_medico" }],
          },
        ],
      }
    );
  }
}
