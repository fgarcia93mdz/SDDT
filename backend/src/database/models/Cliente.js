module.exports = (sequelize, dataTypes) => { 
  let alias = 'Cliente';
  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: dataTypes.STRING
    },
    apellido: {
      type: dataTypes.STRING
    },
    email: {
      type: dataTypes.STRING
    },
    telefono: {
      type: dataTypes.STRING
    },
    dni: {
      type: dataTypes.STRING
    },
    estado_clientes_id: {
      type: dataTypes.INTEGER
    },
    borrado: {
      type: dataTypes.INTEGER
    },
    categoria_cliente_id: {
      type: dataTypes.INTEGER
    }
  };
  let config = {
    tableName: 'clientes',
    timestamps: false,
  };
  const Cliente = sequelize.define(alias, cols, config);

   Cliente.associate = function (models) {
      Cliente.belongsTo(models.EstadoCliente, {
        as: 'estadoCliente',
        foreignKey: 'estado_clientes_id'
      });
      Cliente.hasMany(models.Expulsado, {
        as: 'expulsados',
        foreignKey: 'clientes_id'
      });
      Cliente.hasMany(models.Prenda, {
        as: 'prendas',
        foreignKey: 'clientes_id'
      });
      Cliente.belongsTo(models.CategoriaCliente, {
        as: 'categoriaCliente',
        foreignKey: 'categoria_cliente_id'
      });
      Cliente.hasMany(models.PremioSlot, {
        as: 'premiosSlots',
        foreignKey: 'cliente_id'
      });
      Cliente.hasMany(models.RegistroCliente, {
        as: 'registrosClientes',
        foreignKey: 'cliente_id'
      });
      Cliente.hasMany(models.GastronomiaVIP, {
        as: 'gastronomiaVip',
        foreignKey: 'cliente_id'
      });
      Cliente.hasMany(models.ProductoCanjeado, {
        as: 'productosCanjeados',
        foreignKey: 'cliente_id'
      });
      Cliente.hasOne(models.ClienteDetalle, {
        as: 'detalleCliente',
        foreignKey: 'cliente_id'
      });
  };

  return Cliente;
}