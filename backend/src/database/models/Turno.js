module.exports = (sequelize, dataTypes) => { 
  let alias = 'Turno';
  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    numero_apertura: {
      type: dataTypes.STRING
    },
    numero_cierre: {
      type: dataTypes.STRING
    },
    usuario_id_apertura: {
      type: dataTypes.INTEGER
    },
    usuario_id_cierre: {
      type: dataTypes.INTEGER
    },
    fecha_apertura: {
      type: dataTypes.DATE
    },
    fecha_cierre: {
      type: dataTypes.DATE
    },
    primera_vez: {
      type: dataTypes.INTEGER,
      defaultValue: true
    }
  };
  let config = {
    tableName: 'turnos',
    timestamps: false,
  };
  const Turno = sequelize.define(alias, cols, config);

  Turno.associate = function(models) {
    Turno.belongsTo(models.Usuario, {
      as: 'usuario_apertura',
      foreignKey: 'usuario_id_apertura'
    });
    Turno.belongsTo(models.Usuario, {
      as: 'usuario_cierre',
      foreignKey: 'usuario_id_cierre'
    });
  };

  return Turno;
}