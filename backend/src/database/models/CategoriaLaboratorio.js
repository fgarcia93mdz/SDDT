module.exports = (sequelize, DataTypes) => {
  const CategoriaLaboratorio = sequelize.define('CategoriaLaboratorio', {
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
    tableName: 'categorias_laboratorio',
    timestamps: false
  });

  CategoriaLaboratorio.associate = function(models) {
    CategoriaLaboratorio.hasMany(models.InsumoLaboratorio, {
      as: 'insumos',
      foreignKey: 'categorias_laboratorio_id'
    });
    CategoriaLaboratorio.hasMany(models.RepuestoLaboratorio, {
      as: 'repuestos',
      foreignKey: 'categorias_laboratorio_id'
    });
    CategoriaLaboratorio.hasMany(models.HerramientaLaboratorio, {
      as: 'herramientas',
      foreignKey: 'categorias_laboratorio_id'
    });
  };

  return CategoriaLaboratorio;
};