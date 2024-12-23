module.exports = (sequelize, DataTypes) => {
  const CategoriaPrincipalLaboratorio = sequelize.define('CategoriaPrincipalLaboratorio', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    tableName: 'categoria_principal_laboratorio',
    timestamps: false
  });

  return CategoriaPrincipalLaboratorio;
};