module.exports = (sequelize, dataTypes) => {
  let alias = 'MenuVip';
  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tipo_de_plato_id: {
      type: dataTypes.INTEGER
    },
    nombre: {
      type: dataTypes.STRING
    },
    detalle: {
      type: dataTypes.STRING
    },
    disponible: {
      type: dataTypes.INTEGER
    },
    cantidad: {
      type: dataTypes.INTEGER
    },
    borrado: {
      type: dataTypes.INTEGER
    },
    url_imagen: {
      type: dataTypes.STRING
    },
  };
  let config = {
    tableName: 'menu_vip',
    timestamps: false,
  };
  const MenuVip = sequelize.define(alias, cols, config);

  MenuVip.associate = function (models) {
    MenuVip.belongsTo(models.TipoDePlato, {
      as: 'tipoDePlato',
      foreignKey: 'tipo_de_plato_id'
    });
    MenuVip.hasMany(models.GastronomiaVIP, {
      as: 'gastronomiaVIP',
      foreignKey: 'menu_vip_id'
    });
  }

  return MenuVip;
}