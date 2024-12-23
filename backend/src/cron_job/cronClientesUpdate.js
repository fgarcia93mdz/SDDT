const cron = require('node-cron');
const xlsx = require('xlsx');
const db = require('./models'); 

const Cliente = db.Cliente;

// Función para procesar el archivo de Excel y actualizar la base de datos
const actualizarClientesDesdeExcel = async () => {
  try {
    const workbook = xlsx.readFile('ruta/a/tu/archivo.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    for (const row of data) {
      const { dni, nombre, apellido, telefono, email } = row;

      const cliente = await Cliente.findOne({ where: { dni } });

      if (cliente) {
        await cliente.update({
          nombre: nombre || cliente.nombre,
          apellido: apellido || cliente.apellido,
          telefono: telefono || cliente.telefono,
          email: email || cliente.email
        });
      }
    }

    console.log('Actualización de clientes completada.');
  } catch (error) {
    console.error('Error al actualizar clientes desde Excel:', error);
  }
};

cron.schedule('0 9 * * 1', () => {
  console.log('Ejecutando tarea programada: Actualización de clientes desde Excel');
  actualizarClientesDesdeExcel();
});