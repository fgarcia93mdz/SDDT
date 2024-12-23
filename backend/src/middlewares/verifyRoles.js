const ROLES = require("../config/roles");
const SUBROLES = require("../config/subroles");

const verifyRoles = (allowedRoles, allowedSubRoles) => {
    return (req, res, next) => {
        if (!req?.usuario?.rol_id || !req?.usuario?.sub_rol_id) {
            return res.status(401).json({ mensaje: "sin autorización generada" });
        }

        const rolesArray = allowedRoles === "*" ? Object.values(ROLES) : allowedRoles.map(role => ROLES[role]);

        const subRolesArray = allowedSubRoles === "*" ? Object.values(SUBROLES) : Array.isArray(allowedSubRoles) ? allowedSubRoles.map(subRole => SUBROLES[subRole]) : [];

        const roleResult = rolesArray.find(val => val === req.usuario.rol_id);
        const subRoleResult = subRolesArray.find(val => val === req.usuario.sub_rol_id);

        if (!roleResult || !subRoleResult) {
            return res.status(401).json({ mensaje: "sin autorización" });
        }

        next();
    }
}

module.exports = verifyRoles;