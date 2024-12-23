module.exports = (sequelize, dataTypes) => {
  let alias = 'PremioSlot';
  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    numero_slot: {
      type: dataTypes.STRING
    },
    importe: {
      type: dataTypes.STRING
    },
    borrado: {
      type: dataTypes.INTEGER
    },
    fecha: {
      type: dataTypes.DATE
    },
    cliente_id: {
      type: dataTypes.INTEGER
    },
    usuario_id: {
      type: dataTypes.INTEGER
    },
  };
  let config = {
    tableName: 'premios_slot',
    timestamps: false,
  };
  const PremioSlot = sequelize.define(alias, cols, config);

  PremioSlot.associate = function (models) {
    PremioSlot.belongsTo(models.Cliente, {
      as: 'cliente',
      foreignKey: 'cliente_id'
    });
    PremioSlot.belongsTo(models.Usuario, {
      as: 'usuario',
      foreignKey: 'usuario_id'
    });
  }

  return PremioSlot
}