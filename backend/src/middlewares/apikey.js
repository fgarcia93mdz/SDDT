const db = require("../database/models");
const Apikey = db.Apikey;
const moment = require("moment");

/* 
  para probarlo ponen el middleware en la ruta que quieran

    Este middleware funciona de la siguiente manera
    en la base de datos hay una tabla que guarda la cantidad de veces que se accedió con determinada apikey
    la apikey es harcodeada y en caso de querer quitarle acceso a la apikey se borra del campo apikey
    la descripcion se pone por si a futuro tenemos mas de una apikey
    el ultimo acceso es meramente informativo

    !!!!en el model del apikey estan los campos que tiene la tabla en la base de datos
    no actualize la base de datos, tienen que crear la tabla manualmente

    se crea la tabla y se harcodea la id 1 con:
     una apikey y una descripcion.

     en el json de cualquier consulta tiene que venir un campo apikey con el valor de la api key
     ejemplo

     {
    "apikey":"93ce1af9-f970-4f35-8456-40be7db86891"
    }
 */

const verifyApikey = async (req, res, next) => {
  //console.log(req.body);
  if (!req?.body?.apikey)
    return res.status(401).json({ mensaje: "sin autorización" });

  try {
    const encontrada = await Apikey.findOne({
      where: {
        apikey: req.body.apikey,
      },
    });
    if (encontrada === null) {
      return res.status(401).json({ mensaje: "sin autorización" });
    }

    await Apikey.update(
      {
        contador: encontrada.dataValues.contador + 1,
        ultimo_acceso: moment().tz("America/Argentina/Buenos_Aires"),
      },
      {
        where: {
          apikey: encontrada.dataValues.apikey,
        },
      }
    );
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: "sin autorización" });
  }
};

module.exports = verifyApikey;
