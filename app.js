let db, countdown = 20, timer;

const dbInitSql = `
CREATE TABLE orders (id INTEGER, customer_id INTEGER);
INSERT INTO orders VALUES (1,1),(2,1),(3,2),(4,1),(5,3),(6,1);
`;

initSqlJs({ locateFile: f => "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/" + f }).then(SQL => {
  db = new SQL.Database();
  db.run(dbInitSql);
  startCountdown();
});

function startCountdown() {
  updateTimer();
  timer = setInterval(() => {
    countdown--;
    updateTimer();
    if (countdown === 0) {
      clearInterval(timer);
      document.getElementById("speech-bubble").textContent = "You're fired!";
      document.getElementById("speech-bubble").style.background = "#f44336";
      document.querySelector(".room").classList.add("shake");
    }
  }, 1000);
}

function updateTimer() {
  document.getElementById("timer").textContent = `⏳ ${countdown}s`;
}

document.getElementById("run-btn").addEventListener("click", () => {
  const code = document.getElementById("sql-input").value;
  try {
    const res = db.exec(code);
    let output = "";
    if (res.length > 0) {
      const cols = res[0].columns;
      const rows = res[0].values;
      output += "<table><tr>" + cols.map(c => `<th>${c}</th>`).join("") + "</tr>";
      rows.forEach(r => {
        output += "<tr>" + r.map(val => `<td>${val}</td>`).join("") + "</tr>";
      });
      output += "</table>";
    } else {
      output = "No results.";
    }
    document.getElementById("result-table").innerHTML = output;
    document.getElementById("feedback").textContent = "";
  } catch (e) {
    document.getElementById("result-table").textContent = e.message;
    document.getElementById("feedback").textContent = "⛔ Error in query.";
  }
});
