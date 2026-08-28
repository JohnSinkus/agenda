CREATE DATABASE IF NOT EXISTS controle_clientes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE controle_clientes;

CREATE TABLE IF NOT EXISTS clientes (
    id VARCHAR(40) NOT NULL,
    nome_cliente VARCHAR(160) NOT NULL,
    data_prevista DATE NULL,
    os VARCHAR(80) NULL,
    concluido TINYINT(1) NOT NULL DEFAULT 0,
    observacao VARCHAR(500) NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_clientes_data (data_prevista),
    INDEX idx_clientes_status (concluido),
    INDEX idx_clientes_os (os),
    INDEX idx_clientes_nome (nome_cliente)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
