module.exports = (sequelize, dataTypes) => {

  let alias = "Expulsado";
  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    clientes_id: {
      type: dataTypes.INTEGER
    },
    fecha_expulsion: {
      type: dataTypes.DATE
    },
    motivo: {
      type: dataTypes.STRING
    },
    fecha_alta: {
      type: dataTypes.DATE
    }
  };
  let config = {
    tableName: "expulsados",
    timestamps: false
  };
  const Expulsado = sequelize.define(alias, cols, config);
  Expulsado.associate = function (models) {
    Expulsado.belongsTo(models.Cliente, {
      as: "cliente",
      foreignKey: "clientes_id"
    });
  };
  return Expulsado;
};