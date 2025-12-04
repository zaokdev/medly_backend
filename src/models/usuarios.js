import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class usuarios extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        nombre: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        apellido: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING(150),
          allowNull: false,
          unique: "email",
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        activo: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: 1,
        },
        id_rol: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "roles",
            key: "id",
          },
        },
        expediente_id: {
          type: DataTypes.STRING(100),
        },
      },
      {
        sequelize,
        tableName: "usuarios",
        timestamps: false,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "id" }],
          },
          {
            name: "email",
            unique: true,
            using: "BTREE",
            fields: [{ name: "email" }],
          },
          {
            name: "fk_usuarios_rol",
            using: "BTREE",
            fields: [{ name: "id_rol" }],
          },
        ],
      }
    );
  }
}
