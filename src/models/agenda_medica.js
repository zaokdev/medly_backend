import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class agenda_medica extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_medico: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    hora: {
      type: DataTypes.TIME,
      allowNull: false
    },
    disponible: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'agenda_medica',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "id_medico",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_medico" },
          { name: "fecha" },
          { name: "hora" },
        ]
      },
      {
        name: "idx_agenda_busqueda",
        using: "BTREE",
        fields: [
          { name: "fecha" },
          { name: "id_medico" },
          { name: "disponible" },
        ]
      },
    ]
  });
  }
}
