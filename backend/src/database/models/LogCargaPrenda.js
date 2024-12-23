module.exports = (sequelize, dataTypes) => {
  let alias = "LogCargaPrenda";
  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    fecha_inicio: {
      type: dataTypes.TIME
    },
    fecha_fin: {
      type: dataTypes.TIME
    },
    usuarios_id: {
      type: dataTypes.INTEGER
    },
    promedio_tiempo: {
      type: dataTypes.STRING
    },
    timestamp: {
      type: dataTypes.DATE,
      allowNull: false,
      defaultValue: dataTypes.NOW
    }
  };
  let config = {
    tableName: "log_carga_prenda",
    timestamps: false
  };
  const LogCargaPrenda = sequelize.define(alias, cols, config);
  
  LogCargaPrenda.associate = function(models) {
    LogCargaPrenda.belongsTo(models.Usuario, {
      as: "usuario",
      foreignKey: "usuarios_id"
    });
  };
  
  return LogCargaPrenda;
}