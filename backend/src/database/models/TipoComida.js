module.exports = (sequelize, dataTypes) => {
  let alias = 'TipoComida';
  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tipo: {
      type: dataTypes.STRING
    },
    borrado: {
      type: dataTypes.INTEGER
    },
  };
  let config = {
    tableName: 'tipo_comida',
    timestamps: false,
  };
  const TipoComida = sequelize.define(alias, cols, config);

  TipoComida.associate = function (models) {
    TipoComida.hasMany(models.GastronomiaVIP, {
      as: 'gastronomia_vip',
      foreignKey: 'tipo_comida_id'
    });
  }

  return TipoComida;
}