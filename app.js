let db, countdown = 20, timer, score = 0;

const brokenQuery = "SELECT customer_id, COUNT(*) FROM orders WHERE total > 100 GROUP BY product_id;";
const correctQuery = "SELECT customer_id, COUNT(*) FROM orders WHERE total > 100 GROUP BY customer_id;";

const dbInitSql = `
CREATE TABLE orders (id INTEGER, customer_id INTEGER, total INTEGER);
INSERT INTO orders VALUES
(1, 1, 120), (2, 1, 80), (3, 2, 200), (4, 3, 300), (5, 2, 50);
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
      showFeedback("❌ Time's up! You missed it!", false);
    }
  }, 1000);
}

function updateTimer() {
  document.getElementById("timer").textContent = `⏱ ${countdown}s`;
}

function showFeedback(msg, success) {
  const feedback = document.getElementById("feedback");
  feedback.textContent = msg;
  feedback.style.color = success ? "#4caf50" : "#f44336";
}

document.getElementById("run-btn").addEventListener("click", () => {
  const code = document.getElementById("sql-input").value.trim();
  try {
    const res = db.exec(code);
    if (code.replace(/\s+/g, " ") === correctQuery.replace(/\s+/g, " ")) {
      clearInterval(timer);
      score += 100;
      document.getElementById("score").textContent = `⭐ Score: ${score}`;
      showFeedback("✅ Correct! You're a SQL Sniper!", true);
    } else {
      showFeedback("💥 Wrong fix! Try again...", false);
    }

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
  } catch (e) {
    showFeedback("💥 Syntax Error!", false);
    document.getElementById("result-table").textContent = "";
  }
});
