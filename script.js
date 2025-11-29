// --- Fonction de mise à jour du tableau ---
function updateTable() {
    const rows = document.querySelectorAll(".table tr");

    rows.forEach((row, index) => {
        if (index < 2) return;

        const checkboxes = row.querySelectorAll("input[type='checkbox']");
        let absences = 0;
        let participations = 0;

        for (let i = 0; i < checkboxes.length; i += 2) {
            const presenceBox = checkboxes[i];
            const participationBox = checkboxes[i + 1];
            if (!presenceBox.checked) absences++;
            if (participationBox.checked) participations++;
        }

        let messageCell = row.querySelector(".message-cell");
        if (!messageCell) {
            messageCell = document.createElement("td");
            messageCell.classList.add("message-cell");
            row.appendChild(messageCell);
        }

        let message = "";
        if (absences === 0) {
            row.style.backgroundColor = "#a9e7a9";
            message = "Perfect attendance!";
        } else if (absences <= 2) {
            row.style.backgroundColor = "#b5f0b5";
            message = "Good attendance";
        } else if (absences >= 3 && absences <= 4) {
            row.style.backgroundColor = "#f8e98f";
            message = "Warning – attendance low";
        } else {
            row.style.backgroundColor = "#f4a7a7";
            message = "Excluded – too many absences";
        }

        messageCell.textContent = `${absences} Abs, ${participations} Par — ${message}`;
    });
}

updateTable();

document.querySelectorAll("input[type='checkbox']").forEach(box => {
    box.addEventListener("change", updateTable);
});

// --- Validation + Ajout de l'étudiant ---
const form = document.querySelector("form");

if (form) {
form.addEventListener("submit", function (event) {
    event.preventDefault();
    document.querySelectorAll(".error").forEach(e => e.remove());

    let valid = true;
    const id = document.getElementById("student-id").value.trim();
    const last = document.getElementById("lastname").value.trim();
    const first = document.getElementById("firstname").value.trim();
    const email = document.getElementById("email").value.trim();

    function showError(input, message) {
        const span = document.createElement("span");
        span.className = "error";
        span.style.color = "red";
        span.textContent = message;
        input.insertAdjacentElement("afterend", span);
    }

    if (id === "" || !/^[0-9]+$/.test(id)) {
        showError(document.getElementById("student-id"), "ID must be numbers only");
        valid = false;
    }

    if (last === "" || !/^[A-Za-z]+$/.test(last)) {
        showError(document.getElementById("lastname"), "Last name only letters");
        valid = false;
    }

    if (first === "" || !/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(first)) {
        showError(document.getElementById("firstname"), "First name only letters and spaces");
        valid = false;
    }

    if (email === "" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError(document.getElementById("email"), "Invalid email");
        valid = false;
    }

    if (valid) {
        const table = document.querySelector(".table");
        const newRow = document.createElement("tr");

        newRow.innerHTML = `
            <td>${id}</td>
            <td>${last}</td>
            <td>${first}</td>
            ${Array(6)
                .fill('<td><input type="checkbox"></td><td><input type="checkbox"></td>')
                .join("")}
            <td class="message-cell"></td>
        `;

        table.appendChild(newRow);
        newRow.querySelectorAll("input[type='checkbox']").forEach(box => {
            box.addEventListener("change", updateTable);
        });

        updateTable();

        const confirmation = document.getElementById("confirmation");
        confirmation.classList.add("show");
        setTimeout(() => confirmation.classList.remove("show"), 4000);
        form.reset();
    }
});
}

// --- Bouton "Show Report" ---
const showReportBtn = document.getElementById("showReport");
const reportSection = document.getElementById("reportSection");

// Variables pour stocker les instances de graphiques
let attendanceChartInstance = null;
let participationChartInstance = null;

if (showReportBtn && reportSection) {
showReportBtn.addEventListener("click", () => {
    reportSection.style.display = "block";

    const rows = document.querySelectorAll(".table tr");
    let totalStudents = 0;
    let totalPresences = 0;
    let totalAbsences = 0;
    let labels = [];
    let presencesData = [];
    let participationsData = [];

    rows.forEach((row, index) => {
        if (index < 2) return;

        const checkboxes = row.querySelectorAll("input[type='checkbox']");
        let studentPresences = 0;
        let studentParticipations = 0;

        for (let i = 0; i < checkboxes.length; i += 2) {
            const presenceBox = checkboxes[i];
            const participationBox = checkboxes[i + 1];
            if (presenceBox.checked) {
                studentPresences++;
                totalPresences++;
            } else {
                totalAbsences++;
            }
            if (participationBox.checked) studentParticipations++;
        }

        totalStudents++;
        labels.push(row.cells[1].textContent + " " + row.cells[2].textContent);
        presencesData.push(studentPresences);
        participationsData.push(studentParticipations);
    });

    // --- Graphique anneau ---
    const ctxAttendance = document.getElementById("attendanceChart");
    // Détruire le graphique existant s'il existe
    if (attendanceChartInstance) {
        attendanceChartInstance.destroy();
    }
    attendanceChartInstance = new Chart(ctxAttendance, {
        type: "doughnut",
        data: {
            labels: ["Présents", "Absents"],
            datasets: [{
                data: [totalPresences, totalAbsences],
                backgroundColor: ["#4CAF50", "#F44336"],
                borderWidth: 1
            }]
        },
        options: {
            cutout: "70%",
            plugins: {
                legend: { position: "bottom" },
                title: { display: true }
            }
        }
    });

    document.getElementById("attendanceCenter").textContent = `${totalStudents} étudiants`;

    // --- Graphique barres ---
    const ctxParticipation = document.getElementById("participationChart");
    // Détruire le graphique existant s'il existe
    if (participationChartInstance) {
        participationChartInstance.destroy();
    }
    participationChartInstance = new Chart(ctxParticipation, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                { label: "Présences", data: presencesData, backgroundColor: "#4CAF50" },
                { label: "Participations", data: participationsData, backgroundColor: "#2196F3" }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                legend: { position: "bottom" },
                title: { display: true }
            },
            scales: { x: { beginAtZero: true } }
        }
    });
});
}



$(document).ready(function() {

$(".table").on("mouseenter", "tbody tr", function () {
  $(this).addClass("hovered");
});

$(".table").on("mouseleave", "tbody tr", function () {
  $(this).removeClass("hovered");
});


  // Clic sur les lignes à partir de la 3e
  $(".table tr").slice(2).click(function(event) {
    // Empêche d’ouvrir la popup si on clique sur une checkbox
    if ($(event.target).is("input[type='checkbox']")) return;

    const lastName = $(this).find("td:nth-child(2)").text().trim();
    const firstName = $(this).find("td:nth-child(3)").text().trim();

    // On prend les colonnes P : 4, 6, 8, 10, 12, 14
    const pCheckboxes = $(this).find(
      "td:nth-child(4) input, td:nth-child(6) input, td:nth-child(8) input, td:nth-child(10) input, td:nth-child(12) input, td:nth-child(14) input"
    );

    // Compter les absences = cases P NON cochées
    let absences = 0;
    pCheckboxes.each(function() {
      if (!$(this).is(":checked")) absences++;
    });

    if (lastName && firstName) {
      $("#popupText").html(`👤 <b>${firstName} ${lastName}</b><br>❌ Absences : <b>${absences}</b>`);
      $("#popupMessage").fadeIn(200);
    }
  });

  // Fermer la popup
  $(".close-btn").click(function() {
    $("#popupMessage").fadeOut(200);
  });

  // Fermer si on clique en dehors
  $("#popupMessage").click(function(e) {
    if ($(e.target).is("#popupMessage")) {
      $(this).fadeOut(200);
    }
  });
});





$(document).ready(function() {
    // Bouton pour mettre en surbrillance les excellents étudiants
    $("#highlightExcellent").click(function() {
        $(".table tr").slice(2).each(function() { // ignore les entêtes
            let absences = 0;
            // Compter les absences : cases P non cochées
            $(this).find("td:nth-child(4), td:nth-child(6), td:nth-child(8), td:nth-child(10), td:nth-child(12), td:nth-child(14)").each(function() {
                if (!$(this).find("input").is(":checked")) absences++;
            });

            if (absences < 3) {
                // Ligne "dorée" avec fade in/out
                $(this).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200);
                $(this).css("background-color", "gold");
            }
        });
    });

    // Bouton pour remettre les couleurs d'origine
    $("#resetColors").click(function() {
        $(".table tr").slice(2).each(function() {
            let absences = 0;
            $(this).find("td:nth-child(4), td:nth-child(6), td:nth-child(8), td:nth-child(10), td:nth-child(12), td:nth-child(14)").each(function() {
                if (!$(this).find("input").is(":checked")) absences++;
            });

            // Remet les couleurs vert / jaune / rouge selon ton code
            if (absences === 0) $(this).css("background-color", "#a9e7a9");
            else if (absences <= 2) $(this).css("background-color", "#b5f0b5");
            else if (absences >= 3 && absences <= 4) $(this).css("background-color", "#f8e98f");
            else $(this).css("background-color", "#f4a7a7");
        });
    });
});





// Filtre par nom / prénom
$("#searchInput").on("keyup", function() {
    const search = $(this).val().toLowerCase();
    $(".table tr").slice(2).filter(function() {
        const text = $(this).find("td:nth-child(2), td:nth-child(3)").text().toLowerCase();
        $(this).toggle(text.includes(search));
    });
});

function countAbsences(row) {
    let absences = 0;
    $(row).find("td:nth-child(4), td:nth-child(6), td:nth-child(8), td:nth-child(10), td:nth-child(12), td:nth-child(14)").each(function() {
        if (!$(this).find("input").is(":checked")) absences++;
    });
    return absences;
}

function countParticipations(row) {
    let participations = 0;
    $(row).find("td:nth-child(5), td:nth-child(7), td:nth-child(9), td:nth-child(11), td:nth-child(13), td:nth-child(15)").each(function() {
        if ($(this).find("input").is(":checked")) participations++;
    });
    return participations;
}




// Tri par absences (ascendant)
$("#sortAbs").click(function() {
    let rows = $(".table tr").slice(2).get();
    rows.sort((a, b) => countAbsences(a) - countAbsences(b));
    // Retirer toutes les lignes de données
    $(".table tr").slice(2).remove();
    // Ajouter les lignes triées
    $(".table").append(rows);
    $("#sortMessage").text("Currently sorted by absences");
});

// Tri par participation (descendant)
$("#sortPar").click(function() {
    let rows = $(".table tr").slice(2).get();
    rows.sort((a, b) => countParticipations(b) - countParticipations(a));
    // Retirer toutes les lignes de données
    $(".table tr").slice(2).remove();
    // Ajouter les lignes triées
    $(".table").append(rows);
    $("#sortMessage").text("Currently sorted by participation");
});

