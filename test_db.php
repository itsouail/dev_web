<?php
require 'db_connect.php';

$pdo = getConnection();

if ($pdo) {
    echo "✅ Database connection successful!<br>";
    $stmt = $pdo->query("SELECT DATABASE() AS db");
    $current = $stmt->fetch();
    echo "Connected to database: " . htmlspecialchars($current['db']);
} else {
    echo "❌ Failed to connect to database. Check config and logs (db_errors.log).";
}

?>
