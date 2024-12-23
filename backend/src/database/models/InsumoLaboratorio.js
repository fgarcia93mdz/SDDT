module.exports = (sequelize, DataTypes) => {
  const InsumoLaboratorio = sequelize.define('InsumoLaboratorio', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    categorias_laboratorio_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    marcas_laboratorio_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    modelos_laboratorio_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ubicacion_laboratorio_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    detalle: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    estado_productos_laboratorio: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    serial: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    borrado: {
      type: DataTypes.SMALLINT(2),
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'insumos_laboratorio',
    timestamps: false
  });

  InsumoLaboratorio.associate = function(models) {
    InsumoLaboratorio.belongsTo(models.CategoriaLaboratorio, {
      as: 'categoria',
      foreignKey: 'categorias_laboratorio_id'
    });
    InsumoLaboratorio.belongsTo(models.MarcaLaboratorio, {
      as: 'marca',
      foreignKey: 'marcas_laboratorio_id'
    });
    InsumoLaboratorio.belongsTo(models.ModeloLaboratorio, {
      as: 'modelo',
      foreignKey: 'modelos_laboratorio_id'
    });
    InsumoLaboratorio.belongsTo(models.UbicacionLaboratorio, {
      as: 'ubicacion',
      foreignKey: 'ubicacion_laboratorio_id'
    });
    InsumoLaboratorio.belongsTo(models.EstadoProductoLaboratorio, {
      as: 'estado',
      foreignKey: 'estado_productos_laboratorio'
    });
  };

  return InsumoLaboratorio;
};