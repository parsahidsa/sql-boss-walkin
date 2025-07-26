let db, stage = 0;

const stages = [
  {
    title: "Stage 1: Count Orders",
    mission: "Hey Analyst! Count how many orders exist in the orders table.",
    answerCheck: (rows) => rows[0]?.values[0] == 6
  },
  {
    title: "Stage 2: Loyal Customers",
    mission: "Find customers who placed more than 3 orders.",
    answerCheck: (rows) => rows.length === 1 && rows[0].values[0] == 1
  },
  {
  title: "Stage 3: Popular Products",
  mission: "List product_id(s) that appear more than once in order_items.",
  answerCheck: (rows) =>
    rows.length === 1 && rows[0].values[0] == 2
},
  {
  title: "Stage 4: Orders from Customer 1",
  mission: "Find all order IDs placed by customer with ID 1.",
  answerCheck: (rows) => {
    const ids = rows.map(r => r.values[0]);
    return JSON.stringify(ids.sort()) === JSON.stringify([1, 3, 5, 6]);
  }
},
  {
  title: "Stage 5: Items per Order",
  mission: "Show each order_id with how many items it has.",
  answerCheck: (rows) => {
    return rows.length === 6 && rows[0].values.length === 2;
  }
},
  {
  title: "Stage 6: Orders with no items",
  mission: "Find order_id(s) from 'orders' that have no matching rows in order_items.",
  answerCheck: (rows) => rows.length === 0
}
];

const dbInitSql = `
CREATE TABLE orders (id INTEGER, customer_id INTEGER);
INSERT INTO orders VALUES (1,1),(2,2),(3,1),(4,3),(5,1),(6,1);
CREATE TABLE order_items (id INTEGER, order_id INTEGER, product_id INTEGER);
INSERT INTO order_items VALUES (1,1,1),(2,2,2),(3,3,2),(4,4,3),(5,5,2),(6,6,2);
`;

function showStage() {
  document.getElementById("stage-title").textContent = stages[stage].title;
  document.getElementById("mission-text").textContent = stages[stage].mission;
  document.getElementById("feedback").textContent = "";
  document.getElementById("sql-input").value = "";
  document.getElementById("result-table").innerHTML = "Query result will appear here.";
}

function showTable(name) {
  const res = db.exec("SELECT * FROM " + name);
  if (res.length > 0) {
    const cols = res[0].columns;
    const rows = res[0].values;
    let html = cols.join(" | ") + "\n";
    html += "-".repeat(40) + "\n";
    for (const row of rows) {
      html += row.join(" | ") + "\n";
    }
    document.getElementById("table-preview").textContent = html;
  }
}

initSqlJs({ locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${filename}` }).then(SQL => {
  db = new SQL.Database();
  db.run(dbInitSql);
  showStage();
});

document.getElementById("run-btn").addEventListener("click", () => {
  const code = document.getElementById("sql-input").value;
  try {
    const res = db.exec(code);
    if (res.length > 0) {
      let output = "<table><tr>";
      res[0].columns.forEach(col => {
        output += `<th>${col}</th>`;
      });
      output += "</tr>";
      res[0].values.forEach(row => {
        output += "<tr>";
        row.forEach(val => {
          output += `<td>${val}</td>`;
        });
        output += "</tr>";
      });
      output += "</table>";
      document.getElementById("result-table").innerHTML = output;
    } else {
      document.getElementById("result-table").textContent = "No results.";
    }

    if (stages[stage].answerCheck(res)) {
      document.getElementById("feedback").textContent = "✅ Excellent! Moving to the next stage...";
      stage++;
      if (stage < stages.length) setTimeout(showStage, 1500);
      else document.getElementById("feedback").textContent += " 🎉 You've mastered the game!";
    } else {
      document.getElementById("feedback").textContent = "❌ Nope... check your query.";
    }
  } catch (e) {
    document.getElementById("result-table").textContent = e.message;
    document.getElementById("feedback").textContent = "⛔ Query error.";
  }
});
