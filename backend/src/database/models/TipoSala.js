module.exports = (sequelize, DataTypes) => {
  const TipoSala = sequelize.define('TipoSala', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    tableName: 'tipo_sala',
    timestamps: false
  });

  TipoSala.associate = function(models) {
    TipoSala.hasMany(models.UsuarioLaboratorioSala, {
      as: 'usuariosLaboratorioSala',
      foreignKey: 'sala_id'
    });
  };

  return TipoSala;
};