module.exports = (sequelize, dataTypes) => {
  let alias = 'SubRol';
  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: dataTypes.STRING
    },
    borrado: {
      type: dataTypes.INTEGER
    },
  };
  let config = {
    tableName: 'sub_rol',
    timestamps: false,
  };
  const SubRol = sequelize.define(alias, cols, config);

  SubRol.associate = function (models) {
    SubRol.hasMany(models.Usuario, {
      as: 'usuarios',
      foreignKey: 'sub_rol_id'
    });
  };

  return SubRol;
}