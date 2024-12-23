module.exports = (sequelize, DataTypes) => {
  const CargaRepuesto = sequelize.define('CargaRepuesto', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    repuestos_laboratorio_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fecha_ingreso: {
      type: DataTypes.DATE,
      allowNull: false
    },
    usuario_ingreso_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fecha_egreso: {
      type: DataTypes.DATE,
      allowNull: true
    },
    usuario_egreso_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    slot: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    mdc: {
      type: DataTypes.STRING(45),
      allowNull: false
    }
  }, {
    tableName: 'carga_repuesto',
    timestamps: false
  });

  CargaRepuesto.associate = function(models) {
    CargaRepuesto.belongsTo(models.RepuestoLaboratorio, {
      as: 'repuesto',
      foreignKey: 'repuestos_laboratorio_id'
    });
    CargaRepuesto.belongsTo(models.Usuario, {
      as: 'usuarioIngreso',
      foreignKey: 'usuario_ingreso_id'
    });
    CargaRepuesto.belongsTo(models.Usuario, {
      as: 'usuarioEgreso',
      foreignKey: 'usuario_egreso_id'
    });
  };

  return CargaRepuesto;
};