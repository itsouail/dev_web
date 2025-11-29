<?php
require 'db_connect.php';
$conn = getConnection();
$message = "";

// Si formulaire soumis
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $fullname = trim($_POST['fullname']);
    $matricule = trim($_POST['matricule']);
    $group_id = trim($_POST['group_id']);

    // Vérification des champs
    if ($fullname && $matricule && $group_id) {

        // Vérifier si le matricule existe déjà
        $stmt = $conn->prepare("SELECT COUNT(*) FROM students WHERE matricule = ?");
        $stmt->execute([$matricule]);
        if ($stmt->fetchColumn() > 0) {
            $message = "A student with this matricule already exists!";
        } else {
            // Insertion de l'étudiant
            $stmt = $conn->prepare("INSERT INTO students (fullname, matricule, group_id) VALUES (?, ?, ?)");
            $stmt->execute([$fullname, $matricule, $group_id]);
            $message = "Student added successfully!";
        }

    } else {
        $message = "All fields are required.";
    }
}
?>
<link rel="stylesheet" href="stylee.css"> 
<div class="container">
<h2>Add Student</h2>
<p style="color:blue;"><?= $message ?></p>

<form method="POST">
    <label>Full Name:</label><br>
    <input type="text" name="fullname" required><br><br>

    <label>Matricule:</label><br>
    <input type="text" name="matricule" required><br><br>

    <label>Group ID:</label><br>
    <input type="text" name="group_id" required><br><br>

    <button type="submit">Add Student</button>
</form>

<br>
<a href="list_students.php">View All Students</a>
</div>