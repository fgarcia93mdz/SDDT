module.exports = (sequelize, DataTypes) => {
  const UsuarioLaboratorioSala = sequelize.define('UsuarioLaboratorioSala', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    sala_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'usuario_laboratorio_sala',
    timestamps: false
  });

  UsuarioLaboratorioSala.associate = function(models) {
    UsuarioLaboratorioSala.belongsTo(models.Usuario, {
      as: 'usuario',
      foreignKey: 'usuario_id'
    });
    UsuarioLaboratorioSala.belongsTo(models.TipoSala, {
      as: 'sala',
      foreignKey: 'sala_id'
    });
  };

  return UsuarioLaboratorioSala;
};