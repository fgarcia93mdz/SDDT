module.exports = (sequelize, DataTypes) => {
  const HerramientaLaboratorio = sequelize.define('HerramientaLaboratorio', {
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
    fecha_entrega: {
      type: DataTypes.DATE,
      allowNull: false
    },
    usuario_entrega_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    personal_retira: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    fecha_devolucion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    estado_productos_laboratorio_retira: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    detalle_retira: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    estado_productos_laboratorio_devuelve: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    detalle_devolucion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    email_personal_retira: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    borrado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'herramientas_laboratorio',
    timestamps: false
  });

  HerramientaLaboratorio.associate = function(models) {
    HerramientaLaboratorio.belongsTo(models.CategoriaLaboratorio, {
      as: 'categoria',
      foreignKey: 'categorias_laboratorio_id'
    });
    HerramientaLaboratorio.belongsTo(models.MarcaLaboratorio, {
      as: 'marca',
      foreignKey: 'marcas_laboratorio_id'
    });
    HerramientaLaboratorio.belongsTo(models.ModeloLaboratorio, {
      as: 'modelo',
      foreignKey: 'modelos_laboratorio_id'
    });
    HerramientaLaboratorio.belongsTo(models.EstadoProductoLaboratorio, {
      as: 'estadoRetira',
      foreignKey: 'estado_productos_laboratorio_retira'
    });
    HerramientaLaboratorio.belongsTo(models.EstadoProductoLaboratorio, {
      as: 'estadoDevuelve',
      foreignKey: 'estado_productos_laboratorio_devuelve'
    });
  };

  return HerramientaLaboratorio;
};