document.addEventListener("DOMContentLoaded", () => {
  const table = document.querySelector("#attendanceTable");

  // ======= UPDATE ROWS =======
  function updateRow(row) {
    const cells = row.querySelectorAll("td");
    const attendanceCells = Array.from(cells).slice(3, 9);   // S1–S6
    const participationCells = Array.from(cells).slice(9, 15); // P1–P6
    const messageCell = cells[15];

    const absences = attendanceCells.filter(c => {
      const checkbox = c.querySelector("input[type='checkbox']");
      return !checkbox || !checkbox.checked;
    }).length;

    const participations = participationCells.filter(c => {
      const checkbox = c.querySelector("input[type='checkbox']");
      return checkbox && checkbox.checked;
    }).length;

    row.classList.remove("green", "yellow", "red");
    if (absences < 3) row.classList.add("green");
    else if (absences >= 3 && absences <= 4) row.classList.add("yellow");
    else row.classList.add("red");

    let message = "";
    if (absences < 3 && participations >= 4)
      message = "Good attendance – Excellent participation";
    else if (absences >= 3 && absences <= 4)
      message = "Warning – attendance low – You need to participate more";
    else
      message = "Excluded – too many absences – You need to participate more";

    messageCell.textContent = `${absences} Abs, ${participations} Par — ${message}`;
  }

  function updateAllRows() {
    table.querySelectorAll("tbody tr").forEach(updateRow);
  }

  updateAllRows();

  function attachCheckboxListeners() {
    table.querySelectorAll("input[type='checkbox']").forEach(box => {
      box.removeEventListener("change", updateAllRows);
      box.addEventListener("change", updateAllRows);
    });
  }

  attachCheckboxListeners();

  // ======= ADD NEW STUDENT =======
  document.querySelector("#studentForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const studentID = document.getElementById("studentID").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const firstName = document.getElementById("firstName").value.trim();

    const existingIDs = Array.from(document.querySelectorAll("tbody tr td:first-child"))
      .map(td => td.textContent.trim());

    if (existingIDs.includes(studentID)) {
      alert("This student already exists in the attendance list.");
      return;
    }

    const tbody = document.querySelector("tbody");
    const newRow = document.createElement("tr");

    let rowHTML = `
      <td>${studentID}</td>
      <td>${lastName}</td>
      <td>${firstName}</td>`;
    
    for (let i = 1; i <= 6; i++) {
      rowHTML += `<td class="center"><input type="checkbox" aria-label="Present for student ${studentID}"></td>`;
    }
    for (let i = 1; i <= 6; i++) {
      rowHTML += `<td class="center"><input type="checkbox" aria-label="Participated for student ${studentID}"></td>`;
    }

    rowHTML += `<td></td>`;
    newRow.innerHTML = rowHTML;

    tbody.appendChild(newRow);

    attachCheckboxListeners();
    updateRow(newRow);

    event.target.reset();
  });
});

// ======= REPORT FEATURE =======
document.getElementById("showReportBtn").addEventListener("click", () => {
  const rows = document.querySelectorAll("#attendanceTable tbody tr");

  const studentNames = [];
  const attendanceCounts = [];
  const participationCounts = [];

  rows.forEach(row => {
    const firstName = row.cells[2].textContent.trim();
    const lastName = row.cells[1].textContent.trim();
    const studentLabel = `${firstName} ${lastName}`;
    studentNames.push(studentLabel);

    const attendanceBoxes = Array.from(row.querySelectorAll("td input[type='checkbox']")).slice(0, 6);
    const participationBoxes = Array.from(row.querySelectorAll("td input[type='checkbox']")).slice(6, 12);

    attendanceCounts.push(attendanceBoxes.filter(b => b.checked).length);
    participationCounts.push(participationBoxes.filter(b => b.checked).length);
  });

  document.getElementById("reportSection").style.display = "block";

  const ctx = document.getElementById("reportChart").getContext("2d");

  if (window.attendanceChart) {
    window.attendanceChart.destroy();
  }

  window.attendanceChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: studentNames,
      datasets: [
        { label: 'Attendance', data: attendanceCounts, backgroundColor: '#2196F3' },
        { label: 'Participation', data: participationCounts, backgroundColor: '#4CAF50' }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      aspectRatio: 1.5,
      scales: {
        x: {
          beginAtZero: true,
          max: 6,
          title: { display: true, text: 'Sessions (max 6)' }
        },
        y: {
          title: { display: true, text: 'Students' }
        }
      },
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Attendance & Participation per Student' }
      },
      animation: {
        duration: 1000,
        easing: 'easeOutBounce'
      }
    }
  });
});


// ======= HOVER COLOR EFFECT (BACKGROUND CHANGES) =======
$(document).ready(function () {

  $("#attendanceTable tbody").on("mouseenter", "tr", function () {
    if ($(this).hasClass("green")) $(this).addClass("green-hover");
    if ($(this).hasClass("yellow")) $(this).addClass("yellow-hover");
    if ($(this).hasClass("red")) $(this).addClass("red-hover");
  });

  $("#attendanceTable tbody").on("mouseleave", "tr", function () {
    $(this).removeClass("green-hover yellow-hover red-hover");
  });

});

// ======= HIGHLIGHT EXCELLENT STUDENTS =======
$("#highlightBtn").click(function () {
  $("#attendanceTable tbody tr").each(function () {
    const row = $(this);
    const attendanceCells = row.find("td").slice(3, 9);
    const absences = attendanceCells.filter(function () {
      const checkbox = $(this).find("input[type='checkbox']");
      return !checkbox.prop("checked");
    }).length;

    if (absences < 3) {
      row.addClass("highlight");
    }
  });
});

// ======= RESET COLORS BUTTON =======
$("#resetBtn").click(function () {
  $("#attendanceTable tbody tr").removeClass("highlight");
  // Optionally also reapply row color classes
  $("#attendanceTable tbody tr").each(function () {
    const row = $(this);
    const cells = row.find("td");
    const attendanceCells = cells.slice(3, 9);
    const absences = attendanceCells.filter(function () {
      const checkbox = $(this).find("input[type='checkbox']");
      return !checkbox.prop("checked");
    }).length;

    row.removeClass("green yellow red");
    if (absences < 3) row.addClass("green");
    else if (absences <= 4) row.addClass("yellow");
    else row.addClass("red");
  });
});
