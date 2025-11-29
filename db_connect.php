<?php

/**
 * getConnection()
 * Returns a PDO connection using settings from `config.php`.
 *
 * Usage:
 *  require 'db_connect.php';
 *  $conn = getConnection();
 *  // do queries using $conn (PDO)
 */
function getConnection() {
    // 1. Charger la configuration
    $config = require 'config.php';

    // 2. Construire le DSN (Data Source Name)
    $dsn = "mysql:host={$config['host']};dbname={$config['dbname']};charset=utf8";

    try {
        // 3. Créer la connexion PDO
        $pdo = new PDO($dsn, $config['username'], $config['password']);

        // 4. Définir le mode d'erreur sur Exception
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // 5. Return the PDO instance
        return $pdo;

    } catch (PDOException $e) {
        // 6. Optionnel : enregistrer l'erreur dans un fichier de log
        $logMessage = date('Y-m-d H:i:s') . " - Connection failed: " . $e->getMessage() . "\n";
        file_put_contents('db_errors.log', $logMessage, FILE_APPEND);

        // 7. Optionally, display a user-friendly message (don't show full error in production)
        if (php_sapi_name() !== 'cli') {
            echo "<p style='color:red'>Connection failed. Please check the log file.</p>";
        }

        return null; // renvoie null si échec
    }
}
