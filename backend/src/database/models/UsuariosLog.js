module.exports = (sequelize, dataTypes) => {
  let alias = "UsuariosLog";
  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    usuario_id: {
      type: dataTypes.INTEGER,
      allowNull: false
    },
    fecha_ingreso: {
      type: dataTypes.DATE(3),
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP(3)')
    },
    fecha_egreso: {
      type: dataTypes.DATE(3),
      allowNull: true
    },
    detalle: {
      type: dataTypes.STRING(45),
      allowNull: true
    },
    estado: {
      type: dataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    tiempo_sesion: {
      type: dataTypes.STRING(45),
      allowNull: true
    }
  };
  let config = {
    tableName: "usuarios_log",
    timestamps: false
  };
  const UsuariosLog = sequelize.define(alias, cols, config);

  UsuariosLog.associate = function (models) {
    UsuariosLog.belongsTo(models.Usuario, {
      as: "usuario",
      foreignKey: "usuario_id"
    });
  };

  return UsuariosLog;
}