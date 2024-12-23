module.exports = (sequelize, dataTypes) => {
  let alias = 'CategoriaCliente';
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
    }
  }

  let config = {
    tableName: 'categorias_clientes',
    timestamps: false,
  };
  const CategoriaCliente = sequelize.define(alias, cols, config);

  CategoriaCliente.associate = function (models) {
    
    CategoriaCliente.hasMany(models.Cliente, {
      as: 'clientes',
      foreignKey: 'categoria_cliente_id'
    });
  };

  return CategoriaCliente
}