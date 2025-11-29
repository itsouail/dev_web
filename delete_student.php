<?php
require 'db_connect.php';
$conn = getConnection();

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) {
    die("Invalid student ID.");
}

try {
    $stmt = $conn->prepare("DELETE FROM students WHERE id = :id");
    $stmt->execute([':id' => $id]);
    header("Location: list_students.php");
    exit;
} catch (Exception $e) {
    die("Error deleting student: " . htmlspecialchars($e->getMessage()));
}
