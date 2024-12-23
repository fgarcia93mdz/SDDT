---- 1ER PASO: TRUNCAR TODAS LAS TABLAS DE LA BASE DE DATOS ----

SET FOREIGN_KEY_CHECKS = 0;
SELECT CONCAT('TRUNCATE TABLE ', table_name, ';') AS truncate_command
FROM information_schema.tables
WHERE table_schema = 'guardarropa_trl';
SET FOREIGN_KEY_CHECKS = 1;

---- 2DO PASO: TRUNCAR TODAS LAS TABLAS DE LA BASE DE DATOS ----
SET FOREIGN_KEY_CHECKS = 0;

LOCK TABLES 
black_list_token WRITE, 
cambios_estado_prendas WRITE, 
categorias_clientes WRITE, 
clase_prenda WRITE, 
clientes WRITE, 
clientes_detalle WRITE, 
estado_clientes WRITE, 
estado_prendas WRITE, 
expulsados WRITE, 
gastronomia_vip WRITE, 
log_carga_prenda WRITE, 
premios_slot WRITE, 
prendas WRITE, 
prendas_detalles WRITE, 
productos_canjeados WRITE, 
registro_clientes WRITE, 
roles WRITE, 
sub_rol WRITE, 
tipo_comida WRITE, 
turnos WRITE, 
turnos_vip WRITE, 
ultima_ubicacion WRITE, 
usuarios WRITE, 
usuarios_log WRITE, 
venta_ticket WRITE;

TRUNCATE TABLE black_list_token;
TRUNCATE TABLE cambios_estado_prendas;
TRUNCATE TABLE categorias_clientes;
TRUNCATE TABLE clase_prenda;
TRUNCATE TABLE clientes;
TRUNCATE TABLE clientes_detalle;
TRUNCATE TABLE estado_clientes;
TRUNCATE TABLE estado_prendas;
TRUNCATE TABLE expulsados;
TRUNCATE TABLE gastronomia_vip;
TRUNCATE TABLE log_carga_prenda;
TRUNCATE TABLE premios_slot;
TRUNCATE TABLE prendas;
TRUNCATE TABLE prendas_detalles;
TRUNCATE TABLE productos_canjeados;
TRUNCATE TABLE registro_clientes;
TRUNCATE TABLE roles;
TRUNCATE TABLE sub_rol;
TRUNCATE TABLE tipo_comida;
TRUNCATE TABLE turnos;
TRUNCATE TABLE turnos_vip;
TRUNCATE TABLE ultima_ubicacion;
TRUNCATE TABLE usuarios;
TRUNCATE TABLE usuarios_log;
TRUNCATE TABLE venta_ticket;

UNLOCK TABLES;

SET FOREIGN_KEY_CHECKS = 1;