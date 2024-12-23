module.exports = (sequelize, dataTypes) => {
  let alias = 'TipoDePlato';
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
    tableName: 'tipo_de_plato',
    timestamps: false,
  };
  const TipoDePlato = sequelize.define(alias, cols, config);

  TipoDePlato.associate = function (models) {
    TipoDePlato.hasMany(models.MenuVip, {
      as: 'menuVip',
      foreignKey: 'tipo_de_plato_id'
    });
  }

  return TipoDePlato;
}

// tipo_de_plato_id_platos