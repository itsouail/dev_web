<?php
/**
 * Migrate JSON attendance files into the DB attendance_records table.
 *
 * Usage: run via CLI (php migrate_attendance.php) or access in browser (only for local dev).
 */
require 'db_connect.php';

$pdo = getConnection();
if (!$pdo) {
    echo "Failed to connect to DB. Check config and db_errors.log\n";
    exit(1);
}

$pattern = __DIR__ . "/attendance_*.json";
$files = glob($pattern);

if (empty($files)) {
    echo "No JSON attendance files found to migrate.\n";
    exit(0);
}

$migrated = 0;
foreach ($files as $file) {
    $base = basename($file);
    // expected format: attendance_{sessionid}_YYYY-MM-DD.json
    if (!preg_match('/^attendance_(\d+)_.*\.json$/', $base, $matches)) {
        echo "Skipping file not matching pattern: $base\n";
        continue;
    }
    $session_id = (int)$matches[1];

    $data = json_decode(file_get_contents($file), true);
    if (!is_array($data)) {
        echo "Skipping $base (invalid JSON)\n";
        continue;
    }

    // Insert each attendance record
    $stmt = $pdo->prepare("INSERT INTO attendance_records (session_id, student_id, status, recorded_at) VALUES (:session_id, :student_id, :status, NOW()) ON DUPLICATE KEY UPDATE status = VALUES(status), recorded_at = NOW()");
    $pdo->beginTransaction();
    try {
        foreach ($data as $row) {
            $student_id = (int)($row['student_id'] ?? 0);
            $status = in_array($row['status'], ['present', 'absent']) ? $row['status'] : 'absent';
            if ($student_id <= 0) continue;
            $stmt->execute([
                ':session_id' => $session_id,
                ':student_id' => $student_id,
                ':status' => $status
            ]);
        }
        $pdo->commit();
        $migrated++;
        echo "Migrated $base -> DB (session id: $session_id)\n";
    } catch (Exception $e) {
        $pdo->rollBack();
        echo "Failed migrating $base: " . $e->getMessage() . "\n";
    }
}

echo "Migration completed: $migrated file(s) migrated.\n";

?>
