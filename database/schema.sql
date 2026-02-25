SET NAMES utf8mb4;

-- AUTH
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `email_verified_at` TIMESTAMP NULL DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `rol` VARCHAR(30) NOT NULL DEFAULT 'cliente',
  `status` VARCHAR(10) NOT NULL DEFAULT 'activo',
  `remember_token` VARCHAR(100) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_rol_index` (`rol`),
  KEY `users_status_index` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `password_reset_tokens` (
  `email` VARCHAR(255) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `sessions` (
  `id` VARCHAR(255) NOT NULL,
  `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `ip_address` VARCHAR(45) NULL DEFAULT NULL,
  `user_agent` TEXT NULL DEFAULT NULL,
  `payload` LONGTEXT NOT NULL,
  `last_activity` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CATÁLOGOS
CREATE TABLE `marcas` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(120) NOT NULL,
  `status` VARCHAR(10) NOT NULL DEFAULT 'activo',
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `marcas_nombre_unique` (`nombre`),
  KEY `marcas_status_index` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `categorias` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(120) NOT NULL,
  `tipo` VARCHAR(20) NOT NULL DEFAULT 'PRODUCTO',
  `status` VARCHAR(10) NOT NULL DEFAULT 'activo',
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categorias_nombre_tipo` (`nombre`, `tipo`),
  KEY `categorias_status_index` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PERSONAS (FK -> users)
CREATE TABLE `personas` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `usuario_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `nombre` VARCHAR(120) NOT NULL,
  `apellido_paterno` VARCHAR(120) NULL DEFAULT NULL,
  `apellido_materno` VARCHAR(120) NULL DEFAULT NULL,
  `telefono` VARCHAR(30) NULL DEFAULT NULL,
  `empresa` VARCHAR(160) NULL DEFAULT NULL,
  `rfc` VARCHAR(20) NULL DEFAULT NULL,
  `direccion` TEXT NULL DEFAULT NULL,
  `status` VARCHAR(10) NOT NULL DEFAULT 'activo',
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_personas_usuario` (`usuario_id`),
  KEY `personas_status_index` (`status`),
  CONSTRAINT `personas_usuario_id_foreign`
    FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PRODUCTOS (FK -> marcas, categorias, users x3)
CREATE TABLE `productos` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `marca_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `categoria_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `sku` VARCHAR(80) NOT NULL,
  `nombre` VARCHAR(200) NOT NULL,
  `descripcion` TEXT NULL DEFAULT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `costo_lista` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `precio_venta` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `created_by` BIGINT UNSIGNED NULL DEFAULT NULL,
  `updated_by` BIGINT UNSIGNED NULL DEFAULT NULL,
  `deleted_by` BIGINT UNSIGNED NULL DEFAULT NULL,
  `status` VARCHAR(10) NOT NULL DEFAULT 'activo',
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `productos_sku_unique` (`sku`),
  KEY `productos_status_index` (`status`),
  KEY `idx_productos_marca_status` (`marca_id`, `status`),
  KEY `idx_productos_categoria_status` (`categoria_id`, `status`),
  KEY `idx_productos_nombre` (`nombre`),
  CONSTRAINT `productos_marca_id_foreign`
    FOREIGN KEY (`marca_id`) REFERENCES `marcas` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `productos_categoria_id_foreign`
    FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `productos_created_by_foreign`
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `productos_updated_by_foreign`
    FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `productos_deleted_by_foreign`
    FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `producto_medias` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `producto_id` BIGINT UNSIGNED NOT NULL,
  `tipo` VARCHAR(10) NOT NULL DEFAULT 'imagen',
  `url` VARCHAR(2048) NOT NULL,
  `orden` INT UNSIGNED NOT NULL DEFAULT 1,
  `principal` TINYINT(1) NOT NULL DEFAULT 0,
  `status` VARCHAR(10) NOT NULL DEFAULT 'activo',
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `producto_medias_status_index` (`status`),
  KEY `idx_producto_medias_producto_status` (`producto_id`, `status`),
  KEY `idx_producto_medias_orden` (`producto_id`, `orden`),
  CONSTRAINT `producto_medias_producto_id_foreign`
    FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SERVICIOS
CREATE TABLE `servicios` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `categoria_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `nombre` VARCHAR(200) NOT NULL,
  `descripcion` TEXT NULL DEFAULT NULL,
  `precio` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `status` VARCHAR(10) NOT NULL DEFAULT 'activo',
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `servicios_status_index` (`status`),
  KEY `idx_servicios_categoria_status` (`categoria_id`, `status`),
  KEY `idx_servicios_nombre` (`nombre`),
  CONSTRAINT `servicios_categoria_id_foreign`
    FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- COTIZACIONES (FK -> users, personas)
CREATE TABLE `cotizacions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `usuario_id` BIGINT UNSIGNED NULL DEFAULT NULL,0
  `persona_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `folio` VARCHAR(40) NOT NULL,
  `token` CHAR(36) NOT NULL,
  `estatus` VARCHAR(20) NOT NULL DEFAULT 'BORRADOR',
  `email_destino` VARCHAR(190) NULL DEFAULT NULL,
  `telefono_destino` VARCHAR(30) NULL DEFAULT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `total` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `status` VARCHAR(10) NOT NULL DEFAULT 'activo',
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cotizacions_folio_unique` (`folio`),
  UNIQUE KEY `cotizacions_token_unique` (`token`),
  KEY `cotizacions_status_index` (`status`),
  KEY `idx_cotizacions_usuario_status` (`usuario_id`, `status`),
  KEY `idx_cotizacions_estatus_status` (`estatus`, `status`),
  CONSTRAINT `cotizacions_usuario_id_foreign`
    FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `cotizacions_persona_id_foreign`
    FOREIGN KEY (`persona_id`) REFERENCES `personas` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cotizacion_detalles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `cotizacion_id` BIGINT UNSIGNED NOT NULL,
  `producto_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `servicio_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `cantidad` DECIMAL(12,2) NOT NULL DEFAULT 1,
  `precio_unitario` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `total_linea` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `status` VARCHAR(10) NOT NULL DEFAULT 'activo',
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_detalle_item` (`cotizacion_id`, `producto_id`, `servicio_id`),
  KEY `cotizacion_detalles_status_index` (`status`),
  KEY `idx_detalles_cotizacion_status` (`cotizacion_id`, `status`),
  KEY `idx_detalles_producto` (`producto_id`),
  KEY `idx_detalles_servicio` (`servicio_id`),
  CONSTRAINT `cotizacion_detalles_cotizacion_id_foreign`
    FOREIGN KEY (`cotizacion_id`) REFERENCES `cotizacions` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cotizacion_detalles_producto_id_foreign`
    FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `cotizacion_detalles_servicio_id_foreign`
    FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- LOGS (FK -> users)
CREATE TABLE `logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `usuario_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `accion` VARCHAR(30) NOT NULL,
  `tabla` VARCHAR(80) NOT NULL,
  `registro_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `detalle` VARCHAR(255) NULL DEFAULT NULL,
  `status` VARCHAR(10) NOT NULL DEFAULT 'activo',
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `logs_status_index` (`status`),
  KEY `idx_logs_tabla_registro` (`tabla`, `registro_id`),
  KEY `idx_logs_accion` (`accion`),
  KEY `idx_logs_usuario_status` (`usuario_id`, `status`),
  CONSTRAINT `logs_usuario_id_foreign`
    FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
