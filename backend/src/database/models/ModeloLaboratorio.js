module.exports = (sequelize, DataTypes) => {
  const ModeloLaboratorio = sequelize.define('ModeloLaboratorio', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    borrado: {
      type: DataTypes.SMALLINT(2),
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'modelos_laboratorio',
    timestamps: false
  });

  ModeloLaboratorio.associate = function(models) {
    ModeloLaboratorio.hasMany(models.InsumoLaboratorio, {
      as: 'insumos',
      foreignKey: 'modelos_laboratorio_id'
    });
    ModeloLaboratorio.hasMany(models.RepuestoLaboratorio, {
      as: 'repuestos',
      foreignKey: 'modelos_laboratorio_id'
    });
    ModeloLaboratorio.hasMany(models.HerramientaLaboratorio, {
      as: 'herramientas',
      foreignKey: 'modelos_laboratorio_id'
    });
  };

  return ModeloLaboratorio;
};