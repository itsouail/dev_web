<?php 
require 'db_connect.php';
$conn = getConnection();

$message = "";
$messageType = ""; // "success" ou "error"

// ✅ On ne traite que si le formulaire est soumis
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $course_id = trim($_POST['course_id']);
    $group_id  = trim($_POST['group_id']);
    $prof_id   = trim($_POST['prof_id']);

    if ($course_id && $group_id && $prof_id) {
        try {
            $stmt = $conn->prepare("INSERT INTO attendance_sessions (course_id, group_id, opened_by, status, date) VALUES (:course, :group, :prof, 'open', NOW())");
            $stmt->execute([
                ':course' => $course_id,
                ':group'  => $group_id,
                ':prof'   => $prof_id
            ]);

            $session_id = $conn->lastInsertId();
            $messageType = "success";
            $message = "✅ Session created successfully! Session ID: <b>$session_id</b>";

        } catch (PDOException $e) {
            $messageType = "error";
            $message = "❌ Error creating session: " . $e->getMessage();
        }
    } else {
        $messageType = "error";
        $message = "❌ Please fill all fields!";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Create Attendance Session</title>
<link rel="stylesheet" href="stylee.css">
</head>
<body>

<div class="container">
    <h2>Create Attendance Session</h2>

    <!-- ✅ Affiche uniquement si formulaire soumis -->
    <?php if($_SERVER['REQUEST_METHOD'] === 'POST' && $message): ?>
      <div class="confirmation <?= $messageType ?>"><?= $message ?></div>
    <?php endif; ?>

    <form method="post" class="session-form">
        <label>Course ID:</label><br>
        <input type="text" name="course_id" required><br><br>

        <label>Group ID:</label><br>
        <input type="text" name="group_id" required><br><br>

        <label>Professor ID:</label><br>
        <input type="text" name="prof_id" required><br><br>

        <button type="submit" class="btn-submit">Create Session</button>
    </form>

    <div class="center-link">
        <a class="btn-link" href="take_attendance.php">Take Attendance</a>
    </div>
</div>

<script>
  const msg = document.querySelector('.confirmation');
  if(msg){
    msg.classList.add('show'); 
    setTimeout(() => { msg.classList.remove('show'); }, 3000);
  }
</script>

</body>
</html>
