module.exports = (sequelize, DataTypes) => {
  const MarcaLaboratorio = sequelize.define('MarcaLaboratorio', {
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
    tableName: 'marcas_laboratorio',
    timestamps: false
  });

  MarcaLaboratorio.associate = function(models) {
    MarcaLaboratorio.hasMany(models.InsumoLaboratorio, {
      as: 'insumos',
      foreignKey: 'marcas_laboratorio_id'
    });
    MarcaLaboratorio.hasMany(models.RepuestoLaboratorio, {
      as: 'repuestos',
      foreignKey: 'marcas_laboratorio_id'
    });
    MarcaLaboratorio.hasMany(models.HerramientaLaboratorio, {
      as: 'herramientas',
      foreignKey: 'marcas_laboratorio_id'
    });
  };

  return MarcaLaboratorio;
};