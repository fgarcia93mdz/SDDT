module.exports = (sequelize, DataTypes) => {
  let alias = 'Dni';
  let cols = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    dni_info: {
      type: DataTypes.STRING
    },
    registro: {
      type: DataTypes.DATE
    }
  };
  let config = {
    tableName: 'dni',
    timestamps: false,
  };
  const Dni = sequelize.define(alias, cols, config);

  return Dni;
}