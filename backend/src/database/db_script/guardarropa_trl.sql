SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "-03:00";

CREATE DATABASE IF NOT EXISTS `guardarropa_trl` DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;
USE `guardarropa_trl`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clase_prenda`
--

CREATE TABLE `clase_prenda` (
  `id` int(11) NOT NULL,
  `tipo` varchar(45) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Volcado de datos para la tabla `clase_prenda`
--

INSERT INTO `clase_prenda` (`id`, `tipo`) VALUES
(1, 'mochila'),
(2, 'paraguas'),
(3, 'mochila'),
(4, 'matero'),
(5, 'gorro/a'),
(6, 'campera'),
(7, 'baston'),
(8, 'otro');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `nombre` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `apellido` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `dni` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `telefono` int(100) DEFAULT NULL,
  `estado_clientes_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_clientes`
--

CREATE TABLE `estado_clientes` (
  `id` int(11) NOT NULL,
  `tipo` varchar(45) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Volcado de datos para la tabla `estado_clientes`
--

INSERT INTO `estado_clientes` (`id`, `tipo`) VALUES
(1, 'activo hit'),
(2, 'nuevo'),
(3, 'extranjero'),
(4, 'observado'),
(5, 'expulsado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_prendas`
--

CREATE TABLE `estado_prendas` (
  `id` int(11) NOT NULL,
  `tipo` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Volcado de datos para la tabla `estado_prendas`
--

INSERT INTO `estado_prendas` (`id`, `tipo`) VALUES
(1, 'en guarda'),
(2, 'entregado'),
(3, 'olvidado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `log_carga_prenda`
--

CREATE TABLE `log_carga_prenda` (
  `id` int(11) NOT NULL,
  `usuarios_id` int(11) NOT NULL,
  `fecha_inicio` time NOT NULL,
  `fecha_fin` time NOT NULL,
  `promedio_tiempo` varchar(45) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prendas`
--

CREATE TABLE `prendas` (
  `id` int(11) NOT NULL,
  `estado_prendas_id` int(11) NOT NULL,
  `fecha_de_ingreso` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `fecha_de_egreso` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `usuario_ingreso_id` int(11) NOT NULL,
  `usuario_egreso_id` int(11) NOT NULL,
  `clientes_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prendas_detalles`
--

CREATE TABLE `prendas_detalles` (
  `id` int(11) NOT NULL,
  `clase_prenda_id` int(11) NOT NULL,
  `ubicacion` int(200) NOT NULL,
  `detalle` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `prenda_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `rol` varchar(45) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `rol`) VALUES
(1, 'administrador'),
(2, 'jefatura'),
(3, 'supervisor'),
(4, 'asistente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `turno`
--

CREATE TABLE `turno` (
  `id` int(11) NOT NULL,
  `numero_apertura` int(100) NOT NULL,
  `numero_cierre` int(100) NOT NULL,
  `usuario_id_apertura` int(11) NOT NULL,
  `usuarios_id_cierre` int(11) NOT NULL,
  `fecha_apertura` datetime NOT NULL,
  `fecha_cierre` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `apellido` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `legajo` int(11) NOT NULL,
  `estado` smallint(1) NOT NULL DEFAULT '1',
  `roles_id` int(11) NOT NULL,
  `clave` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `estado_clave` smallint(1) NOT NULL DEFAULT '0',
  `codigo_verificacion` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `email` varchar(45) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `clase_prenda`
--
ALTER TABLE `clase_prenda`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `estado_clientes_id_idx` (`estado_clientes_id`);

--
-- Indices de la tabla `estado_clientes`
--
ALTER TABLE `estado_clientes`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `estado_prendas`
--
ALTER TABLE `estado_prendas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `log_carga_prenda`
--
ALTER TABLE `log_carga_prenda`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_car_prenda_id_idx` (`usuarios_id`);

--
-- Indices de la tabla `prendas`
--
ALTER TABLE `prendas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_ingreso_id_prenda_idx` (`usuario_ingreso_id`),
  ADD KEY `usuario_egreso_id_prenda_idx` (`usuario_egreso_id`),
  ADD KEY `clientes_id_prenda_idx` (`clientes_id`);

--
-- Indices de la tabla `prendas_detalles`
--
ALTER TABLE `prendas_detalles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `clase_prenda_id_detalles_idx` (`clase_prenda_id`),
  ADD KEY `prenda_id_detalles_idx` (`prenda_id`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `turno`
--
ALTER TABLE `turno`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_apertura_id_idx` (`usuario_id_apertura`),
  ADD KEY `usuario_cierre_id_idx` (`usuarios_id_cierre`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `roles_id_usuario_idx` (`roles_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `clase_prenda`
--
ALTER TABLE `clase_prenda`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `estado_clientes`
--
ALTER TABLE `estado_clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `estado_prendas`
--
ALTER TABLE `estado_prendas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `log_carga_prenda`
--
ALTER TABLE `log_carga_prenda`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `prendas`
--
ALTER TABLE `prendas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `prendas_detalles`
--
ALTER TABLE `prendas_detalles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `turno`
--
ALTER TABLE `turno`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD CONSTRAINT `estado_clientes_id` FOREIGN KEY (`estado_clientes_id`) REFERENCES `estado_clientes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `log_carga_prenda`
--
ALTER TABLE `log_carga_prenda`
  ADD CONSTRAINT `usuario_car_prenda_id` FOREIGN KEY (`usuarios_id`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `prendas`
--
ALTER TABLE `prendas`
  ADD CONSTRAINT `clientes_id_prenda` FOREIGN KEY (`clientes_id`) REFERENCES `clientes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `usuario_egreso_id_prenda` FOREIGN KEY (`usuario_egreso_id`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `usuario_ingreso_id_prenda` FOREIGN KEY (`usuario_ingreso_id`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `prendas_detalles`
--
ALTER TABLE `prendas_detalles`
  ADD CONSTRAINT `clase_prenda_id_detalles` FOREIGN KEY (`clase_prenda_id`) REFERENCES `clase_prenda` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `prenda_id_detalles` FOREIGN KEY (`prenda_id`) REFERENCES `prendas` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `turno`
--
ALTER TABLE `turno`
  ADD CONSTRAINT `usuario_apertura_id` FOREIGN KEY (`usuario_id_apertura`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `usuario_cierre_id` FOREIGN KEY (`usuarios_id_cierre`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `roles_id_usuario` FOREIGN KEY (`roles_id`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

ALTER TABLE `guardarropa_trl`.`prendas` 
ADD INDEX `estado_prendas_id_prenda_idx` (`estado_prendas_id` ASC);
;
ALTER TABLE `guardarropa_trl`.`prendas` 
ADD CONSTRAINT `estado_prendas_id_prenda`
  FOREIGN KEY (`estado_prendas_id`)
  REFERENCES `guardarropa_trl`.`estado_prendas` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;
ALTER TABLE `guardarropa_trl`.`prendas_detalles` 
CHANGE COLUMN `ubicacion` `ubicacion` VARCHAR(200) NOT NULL ;

ALTER TABLE `guardarropa_trl`.`turno` 
DROP FOREIGN KEY `usuario_cierre_id`;
ALTER TABLE `guardarropa_trl`.`turno` 
CHANGE COLUMN `usuarios_id_cierre` `usuario_id_cierre` INT(11) NOT NULL ;
ALTER TABLE `guardarropa_trl`.`turno` 
ADD CONSTRAINT `usuario_cierre_id`
  FOREIGN KEY (`usuario_id_cierre`)
  REFERENCES `guardarropa_trl`.`usuarios` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `guardarropa_trl`.`turno` 
RENAME TO  `guardarropa_trl`.`turnos` ;

CREATE TABLE `black_list_token` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `jwt` VARCHAR(400) NOT NULL,
  PRIMARY KEY (`id`));
  
ALTER TABLE `guardarropa_trl`.`usuarios` 
CHANGE COLUMN `clave` `clave` VARCHAR(200) NOT NULL ;

ALTER TABLE `guardarropa_trl`.`prendas` 
CHANGE COLUMN `fecha_de_egreso` `fecha_de_egreso` TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ;

ALTER TABLE `guardarropa_trl`.`prendas` 
DROP FOREIGN KEY `usuario_egreso_id_prenda`;
ALTER TABLE `guardarropa_trl`.`prendas` 
CHANGE COLUMN `usuario_egreso_id` `usuario_egreso_id` INT(11) NOT NULL DEFAULT 1 ;
ALTER TABLE `guardarropa_trl`.`prendas` 
ADD CONSTRAINT `usuario_egreso_id_prenda`
  FOREIGN KEY (`usuario_egreso_id`)
  REFERENCES `guardarropa_trl`.`usuarios` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `guardarropa_trl`.`clientes` 
CHANGE COLUMN `telefono` `telefono` BIGINT(100) NULL DEFAULT NULL ;

UPDATE `guardarropa_trl`.`clase_prenda` SET `tipo` = 'Mochila' WHERE (`id` = '1');
UPDATE `guardarropa_trl`.`clase_prenda` SET `tipo` = 'Paraguas' WHERE (`id` = '2');
UPDATE `guardarropa_trl`.`clase_prenda` SET `tipo` = 'Bolso' WHERE (`id` = '3');
UPDATE `guardarropa_trl`.`clase_prenda` SET `tipo` = 'Matero' WHERE (`id` = '4');
UPDATE `guardarropa_trl`.`clase_prenda` SET `tipo` = 'Gorro/a' WHERE (`id` = '5');
UPDATE `guardarropa_trl`.`clase_prenda` SET `tipo` = 'Campera' WHERE (`id` = '6');
UPDATE `guardarropa_trl`.`clase_prenda` SET `tipo` = 'Baston' WHERE (`id` = '7');
UPDATE `guardarropa_trl`.`clase_prenda` SET `tipo` = 'Otro' WHERE (`id` = '8');

ALTER TABLE `guardarropa_trl`.`turnos` 
DROP FOREIGN KEY `usuario_cierre_id`;
ALTER TABLE `guardarropa_trl`.`turnos` 
CHANGE COLUMN `usuario_id_cierre` `usuario_id_cierre` INT(11) NULL ;
ALTER TABLE `guardarropa_trl`.`turnos` 
ADD CONSTRAINT `usuario_cierre_id`
  FOREIGN KEY (`usuario_id_cierre`)
  REFERENCES `guardarropa_trl`.`usuarios` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

 ALTER TABLE `guardarropa_trl`.`turnos` 
CHANGE COLUMN `numero_cierre` `numero_cierre` INT(100) NULL ;
 
ALTER TABLE `guardarropa_trl`.`turnos` 
CHANGE COLUMN `numero_apertura` `numero_apertura` BIGINT(100) NOT NULL ,
CHANGE COLUMN `numero_cierre` `numero_cierre` BIGINT(100) NULL DEFAULT NULL ;

ALTER TABLE `guardarropa_trl`.`turnos` 
CHANGE COLUMN `fecha_cierre` `fecha_cierre` DATETIME NULL ;

ALTER TABLE `guardarropa_trl`.`prendas` 
ADD COLUMN `alerta_enviada` SMALLINT(2) NOT NULL DEFAULT 0 AFTER `clientes_id`;

ALTER TABLE `guardarropa_trl`.`clientes` 
DROP FOREIGN KEY `estado_clientes_id`;
ALTER TABLE `guardarropa_trl`.`clientes` 
CHANGE COLUMN `email` `email` VARCHAR(45) NULL ,
CHANGE COLUMN `estado_clientes_id` `estado_clientes_id` INT(11) NOT NULL DEFAULT 2 ;
ALTER TABLE `guardarropa_trl`.`clientes` 
ADD CONSTRAINT `estado_clientes_id`
  FOREIGN KEY (`estado_clientes_id`)
  REFERENCES `guardarropa_trl`.`estado_clientes` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `guardarropa_trl`.`clientes` 
ADD UNIQUE INDEX `dni_UNIQUE` (`dni` ASC);


CREATE TABLE `guardarropa_trl`.`expulsados` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `clientes_id` INT NOT NULL,
  `motivo` LONGTEXT NULL,
  `fecha_expulsion` TIMESTAMP(3) NULL,
  `fecha_alta` TIMESTAMP(3) NULL,
  PRIMARY KEY (`id`),
  INDEX `id_clientes_expulsado_idx` (`clientes_id` ASC),
  CONSTRAINT `id_clientes_expulsado`
    FOREIGN KEY (`clientes_id`)
    REFERENCES `guardarropa_trl`.`clientes` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

UPDATE `guardarropa_trl`.`estado_clientes` SET `tipo` = 'Socio Hit' WHERE (`id` = '1');
UPDATE `guardarropa_trl`.`estado_clientes` SET `tipo` = 'Nuevo' WHERE (`id` = '2');
UPDATE `guardarropa_trl`.`estado_clientes` SET `tipo` = 'Extranjero' WHERE (`id` = '3');
UPDATE `guardarropa_trl`.`estado_clientes` SET `tipo` = 'Observado' WHERE (`id` = '4');
UPDATE `guardarropa_trl`.`estado_clientes` SET `tipo` = 'Expulsado' WHERE (`id` = '5');

ALTER TABLE `guardarropa_trl`.`clientes` 
CHANGE COLUMN `nombre` `nombre` VARCHAR(45) NULL DEFAULT 'sinRegistrarNombre' ,
CHANGE COLUMN `apellido` `apellido` VARCHAR(45) NULL DEFAULT 'sinRegistrarApellido' ;

UPDATE `guardarropa_trl`.`estado_prendas` SET `tipo` = 'En guarda' WHERE (`id` = '1');
UPDATE `guardarropa_trl`.`estado_prendas` SET `tipo` = 'Entregada' WHERE (`id` = '2');
UPDATE `guardarropa_trl`.`estado_prendas` SET `tipo` = 'Olvidada' WHERE (`id` = '3');

ALTER TABLE `guardarropa_trl`.`turnos` 
CHANGE COLUMN `numero_apertura` `numero_apertura` VARCHAR(200) NOT NULL ,
CHANGE COLUMN `numero_cierre` `numero_cierre` VARCHAR(200) NULL DEFAULT NULL ;

ALTER TABLE `guardarropa_trl`.`log_carga_prenda` 
ADD COLUMN `timestamp` TIMESTAMP(3) NULL AFTER `promedio_tiempo`;

ALTER TABLE `guardarropa_trl`.`log_carga_prenda` 
CHANGE COLUMN `timestamp` `timestamp` TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ;

UPDATE `guardarropa_trl`.`roles` SET `rol` = 'Administrador' WHERE (`id` = '1');
UPDATE `guardarropa_trl`.`roles` SET `rol` = 'Jefatura' WHERE (`id` = '2');
UPDATE `guardarropa_trl`.`roles` SET `rol` = 'Supervisor' WHERE (`id` = '3');
UPDATE `guardarropa_trl`.`roles` SET `rol` = 'Asistente' WHERE (`id` = '4');


ALTER TABLE `guardarropa_trl`.`clase_prenda` 
ADD COLUMN `capacidad_maxima` BIGINT(45) NOT NULL DEFAULT 1 AFTER `tipo`,
ADD COLUMN `capacidad_actual` BIGINT(45) NOT NULL DEFAULT 0 AFTER `capacidad_maxima`;

ALTER TABLE `guardarropa_trl`.`clase_prenda` 
ADD COLUMN `estado` SMALLINT(2) NOT NULL DEFAULT 1 AFTER `capacidad_actual`;


 UPDATE `guardarropa_trl`.`clase_prenda` SET `capacidad_maxima` = '1', `capacidad_actual` = '1' WHERE (`id` = '1');
 UPDATE `guardarropa_trl`.`clase_prenda` SET `capacidad_maxima` = '1', `capacidad_actual` = '1' WHERE (`id` = '2');
 UPDATE `guardarropa_trl`.`clase_prenda` SET `capacidad_maxima` = '1', `capacidad_actual` = '1' WHERE (`id` = '3');
 UPDATE `guardarropa_trl`.`clase_prenda` SET `capacidad_maxima` = '1', `capacidad_actual` = '1' WHERE (`id` = '4');
 UPDATE `guardarropa_trl`.`clase_prenda` SET `capacidad_maxima` = '1', `capacidad_actual` = '1' WHERE (`id` = '5');
 UPDATE `guardarropa_trl`.`clase_prenda` SET `capacidad_maxima` = '1' WHERE (`id` = '6');
 UPDATE `guardarropa_trl`.`clase_prenda` SET `capacidad_maxima` = '1', `capacidad_actual` = '1' WHERE (`id` = '7');
UPDATE `guardarropa_trl`.`clase_prenda` SET `capacidad_maxima` = '1', `capacidad_actual` = '1' WHERE (`id` = '8');


CREATE TABLE `guardarropa_trl`.`usuarios_log` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario_id` INT NOT NULL,
  `fecha_ingreso` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `fecha_egreso` TIMESTAMP(3) NULL,
  `detalle` VARCHAR(45) NULL,
  `estado` INT NOT NULL DEFAULT 1,
  `tiempo_sesion` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  INDEX `usuario_log_usuario_id_idx` (`usuario_id` ASC),
  CONSTRAINT `usuario_log_usuario_id`
    FOREIGN KEY (`usuario_id`)
    REFERENCES `guardarropa_trl`.`usuarios` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

ALTER TABLE `guardarropa_trl`.`usuarios_log` 
CHANGE COLUMN `detalle` `detalle` VARCHAR(200) NULL DEFAULT NULL ;

ALTER TABLE `guardarropa_trl`.`black_list_token` 
ADD COLUMN `fecha_creacion` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) AFTER `jwt`;

ALTER TABLE `guardarropa_trl`.`black_list_token` 
ADD COLUMN `usuario_id` INT NULL AFTER `fecha_creacion`,
ADD COLUMN `estado` SMALLINT(2) NOT NULL DEFAULT 0 AFTER `usuario_id`;


CREATE TABLE cambios_estado_prendas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prenda_id INT,
  estado_prendas_id INT,
  fecha_cambio TIMESTAMP,
  FOREIGN KEY (prenda_id) REFERENCES prendas(id)
);

ALTER TABLE `guardarropa_trl`.`cambios_estado_prendas` 
CHANGE COLUMN `fecha_cambio` `fecha_cambio` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP (3) ON UPDATE CURRENT_TIMESTAMP (3) ;

ALTER TABLE `guardarropa_trl`.`cambios_estado_prendas` 
ADD INDEX `cambio_estado_prenda_idx` (`estado_prendas_id` ASC);
;
ALTER TABLE `guardarropa_trl`.`cambios_estado_prendas` 
ADD CONSTRAINT `cambio_estado_prenda`
  FOREIGN KEY (`estado_prendas_id`)
  REFERENCES `guardarropa_trl`.`estado_prendas` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `turnos` ADD COLUMN `primera_vez` TINYINT(1) NOT NULL DEFAULT 1;

ALTER TABLE `guardarropa_trl`.`prendas` 
DROP FOREIGN KEY `usuario_egreso_id_prenda`;
ALTER TABLE `guardarropa_trl`.`prendas` 
CHANGE COLUMN `usuario_egreso_id` `usuario_egreso_id` INT(11) NULL ;
ALTER TABLE `guardarropa_trl`.`prendas` 
ADD CONSTRAINT `usuario_egreso_id_prenda`
  FOREIGN KEY (`usuario_egreso_id`)
  REFERENCES `guardarropa_trl`.`usuarios` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `guardarropa_trl`.`prendas_detalles` 
ADD COLUMN `fecha_egreso_parcial` TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3) AFTER `prenda_id`,
ADD COLUMN `entrega_parcial` SMALLINT(3) NOT NULL DEFAULT 1 AFTER `fecha_egreso_parcial`;

CREATE TABLE `guardarropa_trl`.`ultima_ubicacion` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ubicacion` INT UNSIGNED NOT NULL DEFAULT 0,
  `estado` SMALLINT(2) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`));

INSERT INTO `guardarropa_trl`.`ultima_ubicacion` (`id`, `ubicacion`, `estado`) VALUES ('1', '0', '1');

ALTER TABLE `guardarropa_trl`.`ultima_ubicacion` 
ADD COLUMN `motivo` VARCHAR(45) NULL DEFAULT 'Prenda agregada' AFTER `estado`;

ALTER TABLE `guardarropa_trl`.`ultima_ubicacion` 
MODIFY COLUMN `motivo` TEXT NOT NULL;

ALTER TABLE `guardarropa_trl`.`prendas` 
ADD COLUMN `borrado` SMALLINT(3) NOT NULL DEFAULT '1' AFTER `alerta_enviada`;

ALTER TABLE `guardarropa_trl`.`clientes` 
ADD COLUMN `borrado` SMALLINT(2) NULL DEFAULT 1 AFTER `estado_clientes_id`;

ALTER TABLE `guardarropa_trl`.`clientes` 
DROP INDEX `dni_UNIQUE` ;

ALTER TABLE `guardarropa_trl`.`prendas_detalles` 
ADD COLUMN `borrado` SMALLINT(2) NOT NULL DEFAULT 1 AFTER `entrega_parcial`;


CREATE TABLE `guardarropa_trl`.`sub_rol` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`));

INSERT INTO `guardarropa_trl`.`sub_rol` (`id`, `nombre`) VALUES ('1', 'Sala');
INSERT INTO `guardarropa_trl`.`sub_rol` (`id`, `nombre`) VALUES ('2', 'VIP');
INSERT INTO `guardarropa_trl`.`sub_rol` (`id`, `nombre`) VALUES ('3', 'Gift');
INSERT INTO `guardarropa_trl`.`sub_rol` (`id`, `nombre`) VALUES ('4', 'Valet Parking');
INSERT INTO `guardarropa_trl`.`sub_rol` (`id`, `nombre`) VALUES ('5', 'Guardarropa');

ALTER TABLE `guardarropa_trl`.`usuarios` 
ADD COLUMN `sub_rol` INT NOT NULL DEFAULT 5 AFTER `email`;

ALTER TABLE `guardarropa_trl`.`usuarios` 
ADD INDEX `sub_rol_id_usuario_idx` (`sub_rol` ASC);
;
ALTER TABLE `guardarropa_trl`.`usuarios` 
ADD CONSTRAINT `sub_rol_id_usuario`
  FOREIGN KEY (`sub_rol`)
  REFERENCES `guardarropa_trl`.`sub_rol` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `guardarropa_trl`.`usuarios` 
DROP FOREIGN KEY `sub_rol_id_usuario`;
ALTER TABLE `guardarropa_trl`.`usuarios` 
CHANGE COLUMN `sub_rol` `sub_rol_id` INT(11) NOT NULL DEFAULT '5' ;
ALTER TABLE `guardarropa_trl`.`usuarios` 
ADD CONSTRAINT `sub_rol_id_usuario`
  FOREIGN KEY (`sub_rol_id`)
  REFERENCES `guardarropa_trl`.`sub_rol` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `guardarropa_trl`.`sub_rol` 
ADD COLUMN `borrado` SMALLINT(1) NOT NULL DEFAULT 1 AFTER `nombre`;


------ VIP -------

CREATE TABLE `guardarropa_trl`.`premios_slot` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `numero_slot` VARCHAR(45) NOT NULL,
  `importe` VARCHAR(45) NOT NULL,
  `cliente_id` INT NULL,
  `usuario_id` INT NULL,
  `fecha` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `borrado` SMALLINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`));

ALTER TABLE `guardarropa_trl`.`premios_slot` 
ADD INDEX `premios_slot_cliente_id_idx` (`cliente_id` ASC),
ADD INDEX `premios_slot_usuario_id_idx` (`usuario_id` ASC);
;
ALTER TABLE `guardarropa_trl`.`premios_slot` 
ADD CONSTRAINT `premios_slot_cliente_id`
  FOREIGN KEY (`cliente_id`)
  REFERENCES `guardarropa_trl`.`clientes` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `premios_slot_usuario_id`
  FOREIGN KEY (`usuario_id`)
  REFERENCES `guardarropa_trl`.`usuarios` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;


CREATE TABLE `guardarropa_trl`.`registro_clientes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `cliente_id` INT NULL,
  `ingreso` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `egreso` TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
  `permanencia` VARCHAR(45) NOT NULL DEFAULT '0 minutos',
  `valor_cambio_total` VARCHAR(45) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`));

ALTER TABLE `guardarropa_trl`.`registro_clientes` 
ADD INDEX `registro_cliente_usuario_id_ingreso_idx` (`usuario_id_ingreso` ASC),
ADD INDEX `registro_cliente_usuario_id_egreso_idx` (`usuario_id_egreso` ASC),
ADD INDEX `registro_cliente_id_idx` (`cliente_id` ASC);
;
ALTER TABLE `guardarropa_trl`.`registro_clientes` 
ADD CONSTRAINT `registro_clientes_usuario_id_ingreso`
  FOREIGN KEY (`usuario_id_ingreso`)
  REFERENCES `guardarropa_trl`.`usuarios` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `registro_clientes_usuario_id_egreso`
  FOREIGN KEY (`usuario_id_egreso`)
  REFERENCES `guardarropa_trl`.`usuarios` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `registro_cliente_id`
  FOREIGN KEY (`cliente_id`)
  REFERENCES `guardarropa_trl`.`clientes` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

CREATE TABLE `guardarropa_trl`.`tipo_comida` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tipo` VARCHAR(45) NULL,
  PRIMARY KEY (`id`));

  CREATE TABLE `guardarropa_trl`.`gastronomia_vip` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tipo_comida_id` INT NULL,
  `observacion` LONGTEXT NULL,
  `plato` VARCHAR(45) NULL,
  PRIMARY KEY (`id`));

ALTER TABLE `guardarropa_trl`.`gastronomia_vip` 
ADD INDEX `gastronomia_vip_tipo_comida_idx` (`tipo_comida_id` ASC);
;
ALTER TABLE `guardarropa_trl`.`gastronomia_vip` 
ADD CONSTRAINT `gastronomia_vip_tipo_comida`
  FOREIGN KEY (`tipo_comida_id`)
  REFERENCES `guardarropa_trl`.`tipo_comida` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `guardarropa_trl`.`gastronomia_vip` 
ADD COLUMN `fecha` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) AFTER `plato`;

ALTER TABLE `guardarropa_trl`.`gastronomia_vip` 
ADD COLUMN `usuario_id` INT NULL AFTER `fecha`,
ADD INDEX `gastronomia_vip_usuario_id_idx` (`usuario_id` ASC);
;
ALTER TABLE `guardarropa_trl`.`gastronomia_vip` 
ADD CONSTRAINT `gastronomia_vip_usuario_id`
  FOREIGN KEY (`usuario_id`)
  REFERENCES `guardarropa_trl`.`usuarios` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

CREATE TABLE `guardarropa_trl`.`productos_canjeados` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `cliente_id` INT NULL,
  `producto` VARCHAR(45) NULL,
  `cantidad` INT NULL,
  `fecha` TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
  `usuario_id` INT NULL,
  `borrado` INT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  INDEX `productos_canjeados_cliente_id_idx` (`cliente_id` ASC),
  INDEX `productos_canjeados_usuario_id_idx` (`usuario_id` ASC),
  CONSTRAINT `productos_canjeados_cliente_id`
    FOREIGN KEY (`cliente_id`)
    REFERENCES `guardarropa_trl`.`clientes` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `productos_canjeados_usuario_id`
    FOREIGN KEY (`usuario_id`)
    REFERENCES `guardarropa_trl`.`usuarios` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

ALTER TABLE `guardarropa_trl`.`gastronomia_vip` 
ADD COLUMN `borrado` INT NOT NULL DEFAULT 1 AFTER `usuario_id`;

ALTER TABLE `guardarropa_trl`.`tipo_comida` 
ADD COLUMN `borrado` INT NULL DEFAULT 1 AFTER `tipo`;

ALTER TABLE `guardarropa_trl`.`tipo_comida` 
CHANGE COLUMN `borrado` `borrado` INT(11) NOT NULL DEFAULT '1' ;

ALTER TABLE `guardarropa_trl`.`registro_clientes` 
ADD COLUMN `borrado` INT NOT NULL DEFAULT 1 AFTER `usuario_id_egreso`;

CREATE TABLE `guardarropa_trl`.`turno_vip` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `fecha_apertura` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `usuario_id_apertura` INT NULL,
  `novedad_apertura` LONGTEXT NULL,
  `hora_tarde_uno` TIME NULL,
  `usuario_id_tarde_uno` INT NULL,
  `novedad_tarde_uno` LONGTEXT NULL,
  `hora_tarde_dos` TIME NULL,
  `usuario_id_tarde_dos` INT NULL,
  `novedad_tarde_dos` LONGTEXT NULL,
  `hora_noche_uno` TIME NULL,
  `usuario_id_noche_uno` INT NULL,
  `novedad_noche_uno` LONGTEXT NULL,
  `fecha_cierre` TIMESTAMP(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
  `usuario_id_cierre` INT NULL,
  `novedad_cierre` LONGTEXT NULL,
  PRIMARY KEY (`id`));

ALTER TABLE `guardarropa_trl`.`turno_vip` 
ADD INDEX `usuario_id_apertura_idx` (`usuario_id_apertura` ASC),
ADD INDEX `turno_vip_usuario_id_tarde_uno_idx` (`usuario_id_tarde_uno` ASC),
ADD INDEX `turno_vip_usuario_id_tarde_dos_idx` (`usuario_id_tarde_dos` ASC),
ADD INDEX `turno_vip_usuario_id_noche_uno_idx` (`usuario_id_noche_uno` ASC),
ADD INDEX `turno_vip_usuario_id_cierre_idx` (`usuario_id_cierre` ASC);
;
ALTER TABLE `guardarropa_trl`.`turno_vip` 
ADD CONSTRAINT `turno_vip_usuario_id_apertura`
  FOREIGN KEY (`usuario_id_apertura`)
  REFERENCES `guardarropa_trl`.`usuarios` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `turno_vip_usuario_id_tarde_uno`
  FOREIGN KEY (`usuario_id_tarde_uno`)
  REFERENCES `guardarropa_trl`.`usuarios` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `turno_vip_usuario_id_tarde_dos`
  FOREIGN KEY (`usuario_id_tarde_dos`)
  REFERENCES `guardarropa_trl`.`usuarios` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `turno_vip_usuario_id_noche_uno`
  FOREIGN KEY (`usuario_id_noche_uno`)
  REFERENCES `guardarropa_trl`.`usuarios` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `turno_vip_usuario_id_cierre`
  FOREIGN KEY (`usuario_id_cierre`)
  REFERENCES `guardarropa_trl`.`usuarios` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `guardarropa_trl`.`turno_vip` 
ADD COLUMN `borrado` INT NOT NULL DEFAULT 1 AFTER `novedad_cierre`;

CREATE TABLE `guardarropa_trl`.`venta_ticket` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `cliente_id` INT NULL,
  `fecha` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `monto` VARCHAR(45) NOT NULL DEFAULT 0,
  `usuario_id` INT NULL,
  `borrado` INT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `venta_ticket_cliente_id_idx` (`cliente_id` ASC),
  INDEX `venta_ticket_usuario_id_idx` (`usuario_id` ASC),
  CONSTRAINT `venta_ticket_cliente_id`
    FOREIGN KEY (`cliente_id`)
    REFERENCES `guardarropa_trl`.`clientes` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `venta_ticket_usuario_id`
    FOREIGN KEY (`usuario_id`)
    REFERENCES `guardarropa_trl`.`usuarios` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

CREATE TABLE `guardarropa_trl`.`categorias_clientes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tipo` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`));

INSERT INTO `guardarropa_trl`.`tipo_comida` (`id`, `tipo`, `borrado`) VALUES ('1', 'Desayuno', '1');
INSERT INTO `guardarropa_trl`.`tipo_comida` (`id`, `tipo`, `borrado`) VALUES ('2', 'Almuerzo', '1');
INSERT INTO `guardarropa_trl`.`tipo_comida` (`id`, `tipo`, `borrado`) VALUES ('3', 'Media Tarde', '1');
INSERT INTO `guardarropa_trl`.`tipo_comida` (`id`, `tipo`, `borrado`) VALUES ('4', 'Cena', '1');
INSERT INTO `guardarropa_trl`.`tipo_comida` (`id`, `tipo`, `borrado`) VALUES ('5', 'Bebida', '1');

CREATE TABLE `guardarropa_trl`.`clientes_detalle` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `fecha_nacimiento` DATE NULL,
  `gusto_gastronomico` LONGTEXT NULL,
  `equipo_futbol` VARCHAR(45) NULL,
  `profesion` VARCHAR(45) NULL,
  `gusto_musical` LONGTEXT NULL,
  `tiempo_de_socio` VARCHAR(45) NULL,
  `borrado` INT NOT NULL DEFAULT 1,
  `cliente_id` INT NULL,
  PRIMARY KEY (`id`),
  INDEX `clientes_detalle_cliente_id_idx` (`cliente_id` ASC),
  CONSTRAINT `clientes_detalle_cliente_id`
    FOREIGN KEY (`cliente_id`)
    REFERENCES `guardarropa_trl`.`clientes` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

ALTER TABLE `guardarropa_trl`.`categorias_clientes` 
ADD COLUMN `borrado` INT NOT NULL DEFAULT 1 AFTER `tipo`;

INSERT INTO `guardarropa_trl`.`categorias_clientes` (`id`, `tipo`, `borrado`) VALUES ('1', 'Hit', '1');
INSERT INTO `guardarropa_trl`.`categorias_clientes` (`id`, `tipo`, `borrado`) VALUES ('2', 'Gold', '1');
INSERT INTO `guardarropa_trl`.`categorias_clientes` (`id`, `tipo`, `borrado`) VALUES ('3', 'Black', '1');
INSERT INTO `guardarropa_trl`.`categorias_clientes` (`id`, `tipo`, `borrado`) VALUES ('4', 'Platinum', '1');

ALTER TABLE `guardarropa_trl`.`clientes` 
ADD COLUMN `categotia_cliente_id` INT NULL DEFAULT 1 AFTER `borrado`,
ADD INDEX `categoria_cliente_id_idx` (`categotia_cliente_id` ASC);
;
ALTER TABLE `guardarropa_trl`.`clientes` 
ADD CONSTRAINT `categoria_cliente_id`
  FOREIGN KEY (`categotia_cliente_id`)
  REFERENCES `guardarropa_trl`.`categorias_clientes` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `guardarropa_trl`.`clientes_detalle` 
CHANGE COLUMN `tiempo_de_socio` `fecha_alta` DATE NULL DEFAULT NULL ;

ALTER TABLE `guardarropa_trl`.`clientes_detalle` 
ADD COLUMN `fecha_baja` DATE NULL AFTER `cliente_id`,
ADD COLUMN `motivo_baja` VARCHAR(45) NULL AFTER `fecha_baja`;

ALTER TABLE `guardarropa_trl`.`gastronomia_vip` 
ADD COLUMN `cliente_id` INT NULL AFTER `borrado`,
ADD INDEX `gastornomia_vip_cliente_id_idx` (`cliente_id` ASC);
;
ALTER TABLE `guardarropa_trl`.`gastronomia_vip` 
ADD CONSTRAINT `gastornomia_vip_cliente_id`
  FOREIGN KEY (`cliente_id`)
  REFERENCES `guardarropa_trl`.`clientes` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `guardarropa_trl`.`gastronomia_vip` 
CHANGE COLUMN `cliente_id` `cliente_id` INT(11) NULL DEFAULT NULL AFTER `id`,
CHANGE COLUMN `borrado` `borrado` INT(11) NOT NULL DEFAULT '1' AFTER `cliente_id`;

ALTER TABLE `guardarropa_trl`.`registro_clientes` 
ADD COLUMN `observacion` LONGTEXT NULL AFTER `borrado`;

ALTER TABLE `guardarropa_trl`.`turno_vip` 
RENAME TO  `guardarropa_trl`.`turnos_vip` ;

ALTER TABLE `guardarropa_trl`.`turnos_vip` 
CHANGE COLUMN `fecha_cierre` `fecha_cierre` TIMESTAMP(3) NULL ;

ALTER TABLE `guardarropa_trl`.`clientes` 
DROP FOREIGN KEY `categoria_cliente_id`;
ALTER TABLE `guardarropa_trl`.`clientes` 
CHANGE COLUMN `categotia_cliente_id` `categoria_cliente_id` INT(11) NULL DEFAULT '1' ;
ALTER TABLE `guardarropa_trl`.`clientes` 
ADD CONSTRAINT `categoria_cliente_id`
  FOREIGN KEY (`categoria_cliente_id`)
  REFERENCES `guardarropa_trl`.`categorias_clientes` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `guardarropa_trl`.`registro_clientes` 
CHANGE COLUMN `egreso` `egreso` TIMESTAMP(3) NULL ;

ALTER TABLE `guardarropa_trl`.`registro_clientes` 
CHANGE COLUMN `permanencia` `permanencia` VARCHAR(45) NOT NULL DEFAULT 'En sala' ;

ALTER TABLE `guardarropa_trl`.`venta_ticket` 
CHANGE COLUMN `borrado` `borrado` INT(11) NULL DEFAULT 1 ;


-------- Nuevo del VIP

CREATE TABLE `guardarropa_trl`.`tipo_de_plato` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tipo` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`));

ALTER TABLE `guardarropa_trl`.`tipo_de_plato` 
ADD COLUMN `borrado` SMALLINT(2) NOT NULL AFTER `tipo`;

ALTER TABLE `guardarropa_trl`.`tipo_de_plato` 
CHANGE COLUMN `borrado` `borrado` SMALLINT(2) NOT NULL DEFAULT 1 ;


INSERT INTO `guardarropa_trl`.`tipo_de_plato` (`tipo`) VALUES ('Cafetería');
INSERT INTO `guardarropa_trl`.`tipo_de_plato` (`tipo`) VALUES ('Entrada');
INSERT INTO `guardarropa_trl`.`tipo_de_plato` (`tipo`) VALUES ('Principal');
INSERT INTO `guardarropa_trl`.`tipo_de_plato` (`tipo`) VALUES ('Postre');
INSERT INTO `guardarropa_trl`.`tipo_de_plato` (`tipo`) VALUES ('Sugerencia');

CREATE TABLE `menu_vip` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tipo_de_plato_id` int(11) DEFAULT NULL,
  `nombre` varchar(45) DEFAULT NULL,
  `detalle` longtext,
  `disponible` smallint(2) DEFAULT '1',
  `cantidad` int(11) DEFAULT NULL,
  `borrado` smallint(2) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `tipo_de_plato_id_menu_idx` (`tipo_de_plato_id`),
  CONSTRAINT `tipo_de_plato_id_menu` FOREIGN KEY (`tipo_de_plato_id`) REFERENCES `tipo_de_plato` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


ALTER TABLE `guardarropa_trl`.`gastronomia_vip` 
CHANGE COLUMN `plato` `menu_vip_id` INT NULL DEFAULT NULL ,
ADD INDEX `gastronomia_vip_menu_vip_id_idx` (`menu_vip_id` ASC);
;
ALTER TABLE `guardarropa_trl`.`gastronomia_vip` 
ADD CONSTRAINT `gastronomia_vip_menu_vip_id`
  FOREIGN KEY (`menu_vip_id`)
  REFERENCES `guardarropa_trl`.`menu_vip` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `guardarropa_trl`.`gastronomia_vip` 
ADD COLUMN `entrega` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) AFTER `usuario_id`;

ALTER TABLE `guardarropa_trl`.`gastronomia_vip` 
CHANGE COLUMN `entrega` `entrega` TIMESTAMP(3) NULL ;

ALTER TABLE `guardarropa_trl`.`gastronomia_vip` 
ADD COLUMN `cantidad` INT NULL DEFAULT 1 AFTER `entrega`;

ALTER TABLE `guardarropa_trl`.`menu_vip` 
ADD COLUMN `url_imagen` VARCHAR(100) NULL AFTER `borrado`;

UPDATE `guardarropa_trl`.`menu_vip` SET `detalle` = 'Napolitana con papas fritas.' WHERE (`id` = '1');

CREATE TABLE `guardarropa_trl`.`estado_pedido` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tipo` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`));

INSERT INTO `guardarropa_trl`.`estado_pedido` (`id`, `tipo`) VALUES ('1', 'Solicitado');
INSERT INTO `guardarropa_trl`.`estado_pedido` (`id`, `tipo`) VALUES ('2', 'En elaboración');
INSERT INTO `guardarropa_trl`.`estado_pedido` (`id`, `tipo`) VALUES ('3', 'Demorado');
INSERT INTO `guardarropa_trl`.`estado_pedido` (`id`, `tipo`) VALUES ('4', 'Para retirar');
INSERT INTO `guardarropa_trl`.`estado_pedido` (`id`, `tipo`) VALUES ('5', 'Entregado');
INSERT INTO `guardarropa_trl`.`estado_pedido` (`id`, `tipo`) VALUES ('6', 'Entregado con observación ');

ALTER TABLE `guardarropa_trl`.`gastronomia_vip` 
ADD COLUMN `estado_pedido_id` INT NULL AFTER `cantidad`,
ADD INDEX `gastronomia_vip_estado_pedido_id_idx` (`estado_pedido_id` ASC);
;
ALTER TABLE `guardarropa_trl`.`gastronomia_vip` 
ADD CONSTRAINT `gastronomia_vip_estado_pedido_id`
  FOREIGN KEY (`estado_pedido_id`)
  REFERENCES `guardarropa_trl`.`estado_pedido` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

UPDATE `guardarropa_trl`.`estado_pedido` SET `tipo` = 'Solicitado a Gastronomía' WHERE (`id` = '1');

INSERT INTO `guardarropa_trl`.`estado_prendas` (`id`, `tipo`) VALUES ('4', 'Olvidad Para donacion');
 
--- Nuevo a partir de aca 01/09/2024 

CREATE TABLE `guardarropa_trl`.`dni` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `dni_info` LONGTEXT NOT NULL,
  `registro` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`));

--- Nuevo a partir de 27/09/2024 PAÑOL ---

CREATE TABLE `guardarropa_trl`.`categorias` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  `borrado` SMALLINT(2) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`));

ALTER TABLE `guardarropa_trl`.`categorias` 
RENAME TO  `guardarropa_trl`.`categorias_laboratorio` ;

CREATE TABLE `guardarropa_trl`.`marcas_laboratorio` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  `borrado` SMALLINT(2) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`));

CREATE TABLE `guardarropa_trl`.`modelos_laboratorio` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  `borrado` SMALLINT(2) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`));

CREATE TABLE `guardarropa_trl`.`ubicacion_laboratorio` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  `detalle` LONGTEXT NULL,
  `borrado` SMALLINT(2) NULL DEFAULT 0,
  PRIMARY KEY (`id`));

CREATE TABLE `guardarropa_trl`.`estados_productos_laboratorio` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tipo` VARCHAR(45) NOT NULL,
  `borrado` SMALLINT(2) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`));

ALTER TABLE `guardarropa_trl`.`estados_productos_laboratorio` 
RENAME TO  `guardarropa_trl`.`estado_productos_laboratorio` ;

CREATE TABLE `guardarropa_trl`.`insumos_laboratorio` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `categorias_laboratorio_id` INT NULL,
  `marcas_laboratorio_id` INT NULL,
  `modelos_laboratorio_id` INT NULL,
  `ubicacion_laboratorio_id` INT NULL,
  `detalle` LONGTEXT NULL,
  `estado_productos_laboratorio` INT NULL,
  `serial` LONGTEXT NOT NULL,
  `borrado` SMALLINT(2) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`));

ALTER TABLE `guardarropa_trl`.`insumos_laboratorio` 
ADD INDEX `insumos_modelos_id_idx` (`modelos_laboratorio_id` ASC),
ADD INDEX `insumos_marcas_id_idx` (`marcas_laboratorio_id` ASC),
ADD INDEX `insumos_categorias_id_idx` (`categorias_laboratorio_id` ASC),
ADD INDEX `insumos_ubicacion_id_idx` (`ubicacion_laboratorio_id` ASC),
ADD INDEX `insumos_estado_productos_id_idx` (`estado_productos_laboratorio` ASC);
;
ALTER TABLE `guardarropa_trl`.`insumos_laboratorio` 
ADD CONSTRAINT `insumos_categorias_id`
  FOREIGN KEY (`categorias_laboratorio_id`)
  REFERENCES `guardarropa_trl`.`categorias_laboratorio` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `insumos_marcas_id`
  FOREIGN KEY (`marcas_laboratorio_id`)
  REFERENCES `guardarropa_trl`.`marcas_laboratorio` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `insumos_modelos_id`
  FOREIGN KEY (`modelos_laboratorio_id`)
  REFERENCES `guardarropa_trl`.`modelos_laboratorio` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `insumos_ubicacion_id`
  FOREIGN KEY (`ubicacion_laboratorio_id`)
  REFERENCES `guardarropa_trl`.`ubicacion_laboratorio` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `insumos_estado_productos_id`
  FOREIGN KEY (`estado_productos_laboratorio`)
  REFERENCES `guardarropa_trl`.`estado_productos_laboratorio` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

CREATE TABLE `guardarropa_trl`.`repuestos_laboratorio` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `categorias_laboratorio_id` INT NULL,
  `marcas_laboratorio_id` INT NULL,
  `modelos_laboratorio_id` INT NULL,
  `ubicacion_laboratorio_id` INT NULL,
  `detalle` LONGTEXT NULL,
  `estado_productos_laboratorio` INT NULL,
  `serial` LONGTEXT NOT NULL,
  `borrado` SMALLINT(2) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`));

ALTER TABLE `guardarropa_trl`.`repuestos_laboratorio` 
ADD INDEX `repuestos_modelos_id_idx` (`modelos_laboratorio_id` ASC),
ADD INDEX `repuestos_marcas_id_idx` (`marcas_laboratorio_id` ASC),
ADD INDEX `repuestos_categorias_id_idx` (`categorias_laboratorio_id` ASC),
ADD INDEX `repuestos_ubicacion_id_idx` (`ubicacion_laboratorio_id` ASC),
ADD INDEX `repuestos_estado_productos_id_idx` (`estado_productos_laboratorio` ASC);
;
ALTER TABLE `guardarropa_trl`.`repuestos_laboratorio` 
ADD CONSTRAINT `repuestos_categorias_id`
  FOREIGN KEY (`categorias_laboratorio_id`)
  REFERENCES `guardarropa_trl`.`categorias_laboratorio` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `repuestos_marcas_id`
  FOREIGN KEY (`marcas_laboratorio_id`)
  REFERENCES `guardarropa_trl`.`marcas_laboratorio` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `repuestos_modelos_id`
  FOREIGN KEY (`modelos_laboratorio_id`)
  REFERENCES `guardarropa_trl`.`modelos_laboratorio` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `repuestos_ubicacion_id`
  FOREIGN KEY (`ubicacion_laboratorio_id`)
  REFERENCES `guardarropa_trl`.`ubicacion_laboratorio` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `repuestos_estado_productos_id`
  FOREIGN KEY (`estado_productos_laboratorio`)
  REFERENCES `guardarropa_trl`.`estado_productos_laboratorio` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

CREATE TABLE `guardarropa_trl`.`herramientas_laboratorio` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `categorias_laboratorio_id` INT NULL,
  `marcas_laboratorio_id` INT NULL,
  `modelos_laboratorio_id` INT NULL,
  `fecha_entrega` DATETIME NOT NULL,
  `usuario_entrega_id` INT NULL,
  `personal_retira` VARCHAR(45) NOT NULL,
  `fecha_devolucion` DATETIME NULL,
  `estado_productos_laboratorio_retira` INT NULL,
  `detalle_retira` LONGTEXT NULL,
  `estado_productos_laboratorio_devuelve` INT NULL,
  `detalle_devolucion` LONGTEXT NULL,
  `email_personal_retira` VARCHAR(45) NULL,
  `borrado` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`));

ALTER TABLE `guardarropa_trl`.`herramientas_laboratorio` 
CHANGE COLUMN `email_personal_retira` `email_personal_retira` VARCHAR(45) NOT NULL ;

ALTER TABLE `guardarropa_trl`.`herramientas_laboratorio` 
ADD INDEX `herramientas_modelos_id_idx` (`modelos_laboratorio_id` ASC),
ADD INDEX `herramientas_marcas_id_idx` (`marcas_laboratorio_id` ASC),
ADD INDEX `herramientas_categorias_id_idx` (`categorias_laboratorio_id` ASC);
;
ALTER TABLE `guardarropa_trl`.`herramientas_laboratorio` 
ADD CONSTRAINT `herramientas_categorias_id`
  FOREIGN KEY (`categorias_laboratorio_id`)
  REFERENCES `guardarropa_trl`.`categorias_laboratorio` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `herramientas_marcas_id`
  FOREIGN KEY (`marcas_laboratorio_id`)
  REFERENCES `guardarropa_trl`.`marcas_laboratorio` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `herramientas_modelos_id`
  FOREIGN KEY (`modelos_laboratorio_id`)
  REFERENCES `guardarropa_trl`.`modelos_laboratorio` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `guardarropa_trl`.`herramientas_laboratorio` 
ADD INDEX `estado_productos_laboratorio_retira_idx` (`estado_productos_laboratorio_retira` ASC);
;
ALTER TABLE `guardarropa_trl`.`herramientas_laboratorio` 
ADD CONSTRAINT `estado_productos_laboratorio_retira`
  FOREIGN KEY (`estado_productos_laboratorio_retira`)
  REFERENCES `guardarropa_trl`.`estado_productos_laboratorio` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `guardarropa_trl`.`herramientas_laboratorio` 
DROP FOREIGN KEY `estado_productos_laboratorio_retira`;
ALTER TABLE `guardarropa_trl`.`herramientas_laboratorio` 
ADD CONSTRAINT `herramientas_estado_productos_laboratorio_retira`
  FOREIGN KEY (`estado_productos_laboratorio_retira`)
  REFERENCES `guardarropa_trl`.`estado_productos_laboratorio` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `guardarropa_trl`.`herramientas_laboratorio` 
ADD INDEX `estado_productos_laboratorio_devuelve_idx` (`estado_productos_laboratorio_devuelve` ASC);
;
ALTER TABLE `guardarropa_trl`.`herramientas_laboratorio` 
ADD CONSTRAINT `estado_productos_laboratorio_devuelve`
  FOREIGN KEY (`estado_productos_laboratorio_devuelve`)
  REFERENCES `guardarropa_trl`.`estado_productos_laboratorio` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `guardarropa_trl`.`herramientas_laboratorio` 
DROP FOREIGN KEY `estado_productos_laboratorio_devuelve`;
ALTER TABLE `guardarropa_trl`.`herramientas_laboratorio` 
ADD CONSTRAINT `herramientas_estado_productos_laboratorio_devuelve`
  FOREIGN KEY (`estado_productos_laboratorio_devuelve`)
  REFERENCES `guardarropa_trl`.`estado_productos_laboratorio` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

CREATE TABLE `guardarropa_trl`.`categoria_principal_laboratorio` (
  `id` INT NOT NULL,
  `nombre` VARCHAR(45) NULL,
  PRIMARY KEY (`id`));

INSERT INTO `guardarropa_trl`.`categoria_principal_laboratorio` (`id`, `nombre`) VALUES ('1', 'Insumos');
INSERT INTO `guardarropa_trl`.`categoria_principal_laboratorio` (`id`, `nombre`) VALUES ('2', 'Repuestos');
INSERT INTO `guardarropa_trl`.`categoria_principal_laboratorio` (`id`, `nombre`) VALUES ('3', 'Herramientas');

----- Para agregar nuevo Pañol ----- 

CREATE TABLE `guardarropa_trl`.`carga_insumo` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `insumo_laboratorio_id` INT NULL,
  `fecha_ingreso` DATETIME NOT NULL,
  `usuario_ingreso_id` INT NOT NULL,
  `fecha_egreso` DATETIME NULL,
  `usuario_egreso_id` INT NULL,
  `slot` VARCHAR(45) NULL,
  `mdc` VARCHAR(45) NULL,
  PRIMARY KEY (`id`));

ALTER TABLE `guardarropa_trl`.`carga_insumo` 
ADD INDEX `carga_insumo_laboratorio_id_idx` (`insumo_laboratorio_id` ASC),
ADD INDEX `carga_usuario_laboratorio_ingreso_id_idx` (`usuario_ingreso_id` ASC),
ADD INDEX `carga_usuario_laboratorio_egreso_id_idx` (`usuario_egreso_id` ASC);
;
ALTER TABLE `guardarropa_trl`.`carga_insumo` 
ADD CONSTRAINT `carga_insumo_laboratorio_id`
  FOREIGN KEY (`insumo_laboratorio_id`)
  REFERENCES `guardarropa_trl`.`insumos_laboratorio` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `carga_usuario_laboratorio_ingreso_id`
  FOREIGN KEY (`usuario_ingreso_id`)
  REFERENCES `guardarropa_trl`.`usuarios` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `carga_usuario_laboratorio_egreso_id`
  FOREIGN KEY (`usuario_egreso_id`)
  REFERENCES `guardarropa_trl`.`usuarios` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `guardarropa_trl`.`carga_insumo` 
CHANGE COLUMN `slot` `slot` VARCHAR(45) NULL DEFAULT 'No corresponde slot' ,
CHANGE COLUMN `mdc` `mdc` VARCHAR(45) NULL DEFAULT 'No corresponde slot' ;

CREATE TABLE `guardarropa_trl`.`carga_repuesto` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `repuestos_laboratorio_id` INT NULL,
  `fecha_ingreso` DATETIME NOT NULL,
  `usuario_ingreso_id` INT NOT NULL,
  `fecha_egreso` DATETIME NULL,
  `usuario_egreso_id` INT NULL,
  `slot` VARCHAR(45) NOT NULL,
  `mdc` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`));

ALTER TABLE `guardarropa_trl`.`carga_repuesto` 
ADD CONSTRAINT `carga_repuestos_laboratorio_id_idx`
  FOREIGN KEY (`repuestos_laboratorio_id`)
  REFERENCES `guardarropa_trl`.`repuestos_laboratorio` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `carga_usuario_laboratorio_ingreso_id_idx`
  FOREIGN KEY (`usuario_ingreso_id`)
  REFERENCES `guardarropa_trl`.`usuarios` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `carga_usuario_laboratorio_egreso_id_idx`
  FOREIGN KEY (`usuario_egreso_id`)
  REFERENCES `guardarropa_trl`.`usuarios` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

--- Nuevo a partir de 06/10/2024 ---

CREATE TABLE `guardarropa_trl`.`tipo_sala` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NULL,
  PRIMARY KEY (`id`));

INSERT INTO `guardarropa_trl`.`tipo_sala` (`id`, `nombre`) VALUES ('1', 'Trilenium');
INSERT INTO `guardarropa_trl`.`tipo_sala` (`id`, `nombre`) VALUES ('2', 'Del Mar');
INSERT INTO `guardarropa_trl`.`tipo_sala` (`id`, `nombre`) VALUES ('3', 'Miramar');
INSERT INTO `guardarropa_trl`.`tipo_sala` (`id`, `nombre`) VALUES ('4', 'Tandil');

CREATE TABLE `guardarropa_trl`.`usuario_laboratorio_sala` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario_id` INT NULL,
  `sala_id` INT NULL,
  PRIMARY KEY (`id`));

ALTER TABLE `guardarropa_trl`.`usuario_laboratorio_sala` 
ADD INDEX `usuario_id_laboratorio_sala_idx` (`usuario_id` ASC),
ADD INDEX `usuario_laboratorio_sala_id_idx` (`sala_id` ASC);
;
ALTER TABLE `guardarropa_trl`.`usuario_laboratorio_sala` 
ADD CONSTRAINT `usuario_id_laboratorio_sala`
  FOREIGN KEY (`usuario_id`)
  REFERENCES `guardarropa_trl`.`usuarios` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `usuario_laboratorio_sala_id`
  FOREIGN KEY (`sala_id`)
  REFERENCES `guardarropa_trl`.`tipo_sala` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

INSERT INTO `guardarropa_trl`.`sub_rol` (`id`, `nombre`, `borrado`) VALUES ('6', 'Laboratorio', '1');

--- Nuevo a partir de 09/10/2024 ---

ALTER TABLE `guardarropa_trl`.`herramientas_laboratorio` 
CHANGE COLUMN `fecha_entrega` `fecha_entrega` DATETIME NULL ,
CHANGE COLUMN `personal_retira` `personal_retira` VARCHAR(45) NULL ,
CHANGE COLUMN `email_personal_retira` `email_personal_retira` VARCHAR(45) NULL ;

--- Nuevo a partir de 12/10/2024 ---

ALTER TABLE `guardarropa_trl`.`carga_insumo` 
ADD COLUMN `borrado` INT NOT NULL DEFAULT 0 AFTER `mdc`;


--- Nuevo a partir de 22/10/2024 ---

DROP TABLE IF EXISTS `audits`;

CREATE TABLE `audits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuarios_id` int NOT NULL,
  `action` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `timestamp` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `details` json DEFAULT NULL,
  PRIMARY KEY (`id`)
);

--- Ya esta subido a la base de datos hasta acá ---