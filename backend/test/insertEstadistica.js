function getRandomDateInJuly2024(day) {
  return new Date(2024, 6, day);
}

function getRandomEstadoPrendasId() {
  return Math.random() < 0.5 ? 1 : 2;
}

let inserts = [];
let prendaId = 1;

for (let day = 1; day <= 31; day++) {
  for (let i = 0; i < 40; i++) {
    const fechaCambio =
      getRandomDateInJuly2024(day)
        .toISOString()
        .replace("T", " ")
        .substring(0, 10) +
      ` ${Math.floor(Math.random() * 24)
        .toString()
        .padStart(2, "0")}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, "0")}:${Math.floor(Math.random() * 60)
            .toString()
            .padStart(2, "0")}`;
    const estadoPrendasId = getRandomEstadoPrendasId();
    inserts.push(
      `INSERT INTO \`guardarropa_trl\`.\`cambios_estado_prendas\` (\`prenda_id\`, \`estado_prendas_id\`, \`fecha_cambio\`) VALUES ('${prendaId}', '${estadoPrendasId}', '${fechaCambio}');`
    );

    prendaId++;
    if (prendaId > 60) prendaId = 1;
  }
}

console.log(inserts.join("\n"));