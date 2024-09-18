const currentView = document.location.pathname;

if (currentView.startsWith("/APP/EXAMRESULTS/")) {
  // Prüfungen > Ergebnisse

  // Remove the "gut/befriedigend" section
  const headRow = document.querySelector("thead>tr")!;
  headRow.removeChild(headRow.children.item(3)!);

  const body = document.querySelector("tbody")!;
  for (const row of body.children) {
    row.removeChild(row.children.item(3)!);

    const firstCol = row.children.item(0)!;
    firstCol.querySelector("div")!.style.color = "rgb(102, 102, 102)";
  }
}
