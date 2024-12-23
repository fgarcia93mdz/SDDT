module.exports = (sequelize, DataTypes) => {
  const EstadoProductoLaboratorio = sequelize.define('EstadoProductoLaboratorio', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tipo: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    borrado: {
      type: DataTypes.SMALLINT(2),
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'estado_productos_laboratorio',
    timestamps: false
  });

  EstadoProductoLaboratorio.associate = function(models) {
    EstadoProductoLaboratorio.hasMany(models.InsumoLaboratorio, {
      as: 'insumos',
      foreignKey: 'estado_productos_laboratorio'
    });
    EstadoProductoLaboratorio.hasMany(models.RepuestoLaboratorio, {
      as: 'repuestos',
      foreignKey: 'estado_productos_laboratorio'
    });
    EstadoProductoLaboratorio.hasMany(models.HerramientaLaboratorio, {
      as: 'herramientasRetira',
      foreignKey: 'estado_productos_laboratorio_retira'
    });
    EstadoProductoLaboratorio.hasMany(models.HerramientaLaboratorio, {
      as: 'herramientasDevuelve',
      foreignKey: 'estado_productos_laboratorio_devuelve'
    });
  };

  return EstadoProductoLaboratorio;
};