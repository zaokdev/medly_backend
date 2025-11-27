import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class medicos_especialidades extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id_medico: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    id_especialidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'especialidades',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'medicos_especialidades',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_medico" },
          { name: "id_especialidad" },
        ]
      },
      {
        name: "fk_me_especialidad",
        using: "BTREE",
        fields: [
          { name: "id_especialidad" },
        ]
      },
    ]
  });
  }
}
