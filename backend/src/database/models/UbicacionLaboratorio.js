module.exports = (sequelize, DataTypes) => {
  const UbicacionLaboratorio = sequelize.define('UbicacionLaboratorio', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    detalle: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    borrado: {
      type: DataTypes.SMALLINT(2),
      allowNull: true,
      defaultValue: 0
    }
  }, {
    tableName: 'ubicacion_laboratorio',
    timestamps: false
  });

  UbicacionLaboratorio.associate = function(models) {
    UbicacionLaboratorio.hasMany(models.InsumoLaboratorio, {
      as: 'insumos',
      foreignKey: 'ubicacion_laboratorio_id'
    });
    UbicacionLaboratorio.hasMany(models.RepuestoLaboratorio, {
      as: 'repuestos',
      foreignKey: 'ubicacion_laboratorio_id'
    });
  };

  return UbicacionLaboratorio;
};