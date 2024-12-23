module.exports = (sequelize, dataTypes) => {
  let alias = 'Usuario';
  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: dataTypes.STRING
    },
    apellido: {
      type: dataTypes.STRING
    },
    email: {
      type: dataTypes.STRING
    },
    legajo: {
      type: dataTypes.INTEGER
    },
    estado: {
      type: dataTypes.INTEGER
    },
    roles_id: {
      type: dataTypes.INTEGER
    },
    clave: {
      type: dataTypes.STRING
    },
    estado_clave: {
      type: dataTypes.INTEGER
    },
    codigo_verificacion: {
      type: dataTypes.STRING
    },
    sub_rol_id: {
      type: dataTypes.INTEGER
    },
  };
  let config = {
    tableName: 'usuarios',
    timestamps: false,
  };
  const Usuario = sequelize.define(alias, cols, config);

  Usuario.associate = function (models) {
    Usuario.belongsTo(models.Rol, {
      as: 'roles',
      foreignKey: 'roles_id'
    });
    Usuario.hasMany(models.Turno, {
      as: 'turnos_apertura',
      foreignKey: 'usuario_id_apertura'
    });
    Usuario.hasMany(models.Turno, {
      as: 'turnos_cierre',
      foreignKey: 'usuario_id_cierre'
    });
    Usuario.hasMany(models.Prenda, {
      as: 'prendasIngreso',
      foreignKey: 'usuario_ingreso_id'
    });
    Usuario.hasMany(models.Prenda, {
      as: 'prendasEgreso',
      foreignKey: 'usuario_egreso_id'
    });
    Usuario.hasMany(models.UsuariosLog, {
      as: 'logs',
      foreignKey: 'usuario_id'
    });
    Usuario.belongsTo(models.SubRol, {
      as: 'sub_roles',
      foreignKey: 'sub_rol_id'
    });
    Usuario.hasMany(models.PremioSlot, {
      as: 'premiosSlots',
      foreignKey: 'usuario_id'
    });
    Usuario.hasMany(models.RegistroCliente, {
      as: 'registrosClientesIngreso',
      foreignKey: 'usuario_id_ingreso'
    });
    Usuario.hasMany(models.RegistroCliente, {
      as: 'registrosClientesEgreso',
      foreignKey: 'usuario_id_egreso'
    });
    Usuario.hasMany(models.GastronomiaVIP, {
      as: 'gastronomiaVip',
      foreignKey: 'usuario_id'
    });
    Usuario.hasMany(models.ProductoCanjeado, {
      as: 'productosCanjeados',
      foreignKey: 'usuario_id'
    });
    Usuario.hasMany(models.TurnoVip, {
      as: 'turnosVipApertura',
      foreignKey: 'usuario_id_apertura'
    });
    Usuario.hasMany(models.TurnoVip, {
      as: 'turnosVipCierre',
      foreignKey: 'usuario_id_cierre'
    });
    Usuario.hasMany(models.TurnoVip, {
      as: 'turnosVipTardeUno',
      foreignKey: 'usuario_id_tarde_uno'
    });
    Usuario.hasMany(models.TurnoVip, {
      as: 'turnosVipTardeDos',
      foreignKey: 'usuario_id_tarde_dos'
    });
    Usuario.hasMany(models.TurnoVip, {
      as: 'turnosVipNocheUno',
      foreignKey: 'usuario_id_noche_uno'
    });
    Usuario.hasMany(models.VentaTicket, {
      as: 'ventaTickets',
      foreignKey: 'usuario_id'
    });
    Usuario.hasMany(models.UsuarioLaboratorioSala, {
      as: 'laboratorioSalas',
      foreignKey: 'usuario_id'
    });
  };

  return Usuario;


};