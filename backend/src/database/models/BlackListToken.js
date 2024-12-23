module.exports = (sequelize, dataTypes) => {
  let alias = 'BlackListToken';
  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    jwt: {
      type: dataTypes.STRING(500),
      allowNull: false,
    },
    estado: {
      type: dataTypes.INTEGER,
      allowNull: false,
    },
    usuario_id: {
      type: dataTypes.INTEGER,
      allowNull: true,
    },
  };
  let config = {
    tableName: 'black_list_token',
    timestamps: false
  }
  const BlackListToken = sequelize.define(alias, cols, config);
  return BlackListToken
};