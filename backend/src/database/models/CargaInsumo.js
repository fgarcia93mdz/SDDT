module.exports = (sequelize, DataTypes) => {
  const CargaInsumo = sequelize.define('CargaInsumo', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    insumo_laboratorio_id: {
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
      allowNull: true,
      defaultValue: 'No corresponde slot'
    },
    mdc: {
      type: DataTypes.STRING(45),
      allowNull: true,
      defaultValue: 'No corresponde slot'
    }
  }, {
    tableName: 'carga_insumo',
    timestamps: false
  });

  CargaInsumo.associate = function(models) {
    CargaInsumo.belongsTo(models.InsumoLaboratorio, {
      as: 'insumo',
      foreignKey: 'insumo_laboratorio_id'
    });
    CargaInsumo.belongsTo(models.Usuario, {
      as: 'usuarioIngreso',
      foreignKey: 'usuario_ingreso_id'
    });
    CargaInsumo.belongsTo(models.Usuario, {
      as: 'usuarioEgreso',
      foreignKey: 'usuario_egreso_id'
    });
  };

  return CargaInsumo;
};