module.exports = (sequelize, dataTypes) => { 
  let alias = 'EstadoCliente';
  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tipo: {
      type: dataTypes.STRING
    }
  };
  let config = {
    tableName: 'estado_clientes',
    timestamps: false,
  };
  const EstadoCliente = sequelize.define(alias, cols, config);

  EstadoCliente.associate = function (models) {
    EstadoCliente.hasMany(models.Cliente, {
      as: 'clientes',
      foreignKey: 'estado_clientes_id'
    });
  }

  return EstadoCliente;
}