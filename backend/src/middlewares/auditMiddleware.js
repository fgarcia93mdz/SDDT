const db = require("../database/models");
const Audit = db.Audit;

const auditMiddleware = async (req, res, next) => {
 
  const usuario_id = req.usuario && req.usuario.id_usuario;
  const action = req.path;
  const timestamp = new Date();
  const details = {
    requestBody: req.body,
  };

  /* if (usuario_id) {
    const auditRecord = await Audit.create({ usuario_id, action, timestamp, details });
  }*/


  next();
};

module.exports = auditMiddleware;