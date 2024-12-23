module.exports = (sequelize, dataTypes) => {
  let alias = 'TurnoVip';
  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    fecha_apertura: {
      type: dataTypes.DATE
    },
    usuario_id_apertura: {
      type: dataTypes.INTEGER
    },
    novedad_apertura: {
      type: dataTypes.STRING
    },
    hora_tarde_uno: {
      type: dataTypes.TIME
    },
    usuario_id_tarde_uno: {
      type: dataTypes.INTEGER
    },
    novedad_tarde_uno: {
      type: dataTypes.STRING
    },
    hora_tarde_dos: {
      type: dataTypes.TIME
    },
    usuario_id_tarde_dos: {
      type: dataTypes.INTEGER
    },
    novedad_tarde_dos: {
      type: dataTypes.STRING
    },
    hora_noche_uno: {
      type: dataTypes.TIME
    },
    usuario_id_noche_uno: {
      type: dataTypes.INTEGER
    },
    novedad_noche_uno: {
      type: dataTypes.STRING
    },
    fecha_cierre: {
      type: dataTypes.DATE
    },
    usuario_id_cierre: {
      type: dataTypes.INTEGER
    },
    novedad_cierre: {
      type: dataTypes.STRING
    },
    borrado: {
      type: dataTypes.INTEGER
    },
  };
  let config = {
    tableName: 'turnos_vip',
    timestamps: false,
  };
  const TurnoVip = sequelize.define(alias, cols, config);

    TurnoVip.associate = function (models) {
    TurnoVip.belongsTo(models.Usuario, {
      as: 'usuario_apertura',
      foreignKey: 'usuario_id_apertura'
    });
    TurnoVip.belongsTo(models.Usuario, {
      as: 'usuario_tarde_uno',
      foreignKey: 'usuario_id_tarde_uno'
    });
    TurnoVip.belongsTo(models.Usuario, {
      as: 'usuario_tarde_dos',
      foreignKey: 'usuario_id_tarde_dos'
    });
    TurnoVip.belongsTo(models.Usuario, {
      as: 'usuario_noche_uno',
      foreignKey: 'usuario_id_noche_uno'
    });
    TurnoVip.belongsTo(models.Usuario, {
      as: 'usuario_cierre',
      foreignKey: 'usuario_id_cierre'
    });
  };

  return TurnoVip;
}