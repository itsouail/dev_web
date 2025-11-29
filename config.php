<?php
// Load configuration from .env if present (simple loader), then from env vars, otherwise fallback to defaults
// .env format: KEY=VALUE (lines starting with # are comments)
if (file_exists(__DIR__ . '/.env')) {
    $envContent = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($envContent as $line) {
        $line = trim($line);
        if ($line === '' || strpos($line, '#') === 0) continue;
        // Only simple KEY=VALUE pairs; ignore export/quotes parsing for simplicity
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            // Only set env var if not already present in environment
            if (getenv($key) === false) {
                putenv(sprintf('%s=%s', $key, $value));
                $_ENV[$key] = $value;
            }
        }
    }
}

// Read from environment now
$host = getenv('DB_HOST') ?: 'localhost';
$dbname = getenv('DB_NAME') ?: 'attendance_db';
$username = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASS') ?: '';

return [
    'host'     => $host,
    'dbname'   => $dbname,
    'username' => $username,
    'password' => $password,
];
