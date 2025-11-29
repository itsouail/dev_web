<?php
require 'db_connect.php';
$conn = getConnection();

$message = "";

// Récupérer l’ID de session depuis GET
$session_id = (int)($_GET['session_id'] ?? 0);
if ($session_id <= 0) {
    die("Please provide a valid session_id in the URL, e.g. ?session_id=1");
}

// Vérifier que la session existe
$stmt = $conn->prepare("SELECT * FROM attendance_sessions WHERE id = :id");
$stmt->execute([':id' => $session_id]);
$session = $stmt->fetch();
if (!$session) die("No session found with this ID.");

// Mettre à jour le statut
$stmt = $conn->prepare("UPDATE attendance_sessions SET status = 'closed' WHERE id = :id");
if ($stmt->execute([':id' => $session_id])) {
    $message = "Session ID $session_id closed successfully.";
} else {
    $message = "Error closing the session.";
}

echo "<p style='color:blue'>$message</p>";
echo '<a href="create_session.php">Back to Create Session</a>';
