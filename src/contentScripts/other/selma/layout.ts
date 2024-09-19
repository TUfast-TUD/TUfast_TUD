const currentView = document.location.pathname;
// Regex for extracting Programm name and arguments from a popup Script
// This is used to get the URL which would be opened in a popup
const popupScriptsRegex =
  /Message = dl_popUp\("\/scripts\/mgrqispi\.dll\?APPNAME=CampusNet&PRGNAME=(\w+)&ARGUMENTS=([^"]+)"/;

function scriptToURL(script: string): string {
  const matches = script.match(popupScriptsRegex)!;

  const porgamName = matches.at(1)!;
  const prgArguments = matches.at(2)!;

  return `https://selma.tu-dresden.de/APP/${porgamName}/${prgArguments}`;
}

if (currentView.startsWith("/APP/EXAMRESULTS/")) {
  // Prüfungen > Ergebnisse

  // Remove the "gut/befriedigend" section
  const headRow = document.querySelector("thead>tr")!;
  headRow.removeChild(headRow.children.item(3)!);

  const body = document.querySelector("tbody")!;
  const promises: Promise<{ doc: Document; elm: Element }>[] = [];
  for (const row of body.children) {
    // Remove useless inline styles which set the vertical alignment
    for (const col of row.children) col.removeAttribute("style");

    row.removeChild(row.children.item(3)!);

    const lastCol = row.children.item(3)!;
    const scriptContent = lastCol.children.item(1)!.innerHTML;

    const url = scriptToURL(scriptContent);

    promises.push(
      fetch(url).then(async (s) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(await s.text(), "text/html");

        return { doc, elm: lastCol };
      }),
    );
  }

  (async () => {
    const gradeOverviews = await Promise.all(promises);

    for (let i = 0; i < gradeOverviews.length; i++) {
      // Parse the grade distributions
      const { doc, elm } = gradeOverviews[i];
      const tableBody = doc.querySelector("tbody")!;
      const values = [...tableBody.children].map((tr) => {
        const gradeText = tr.children.item(0)!.textContent!.replace(",", ".");
        const grade = parseFloat(gradeText);

        const countText = tr.children.item(1)!.textContent!;
        let count: number;
        if (countText === "---") count = 0;
        else count = parseInt(countText);

        return {
          grade,
          count,
        };
      });
      // .slice(0, -2); // Remove the 5.0 from all lists

      // Present the bar chart
      const graphSVG = Graphing.createSVGGradeDistributionGraph(values);
      elm.innerHTML = graphSVG;
    }

    // Remove the inline style that sets a width on the top right table cell
    const tableHeadRow = document.querySelector("thead>tr")!;
    tableHeadRow.children.item(3)!.removeAttribute("style");
  })();
}

/*













































Proabably a proper bundler config would be better

*/

namespace Graphing {
  type GradeStat = {
    grade: number;
    count: number;
  };

  function maxGradeCount(values: GradeStat[]): number {
    let max = 0;
    for (const { count } of values) {
      if (count > max) max = count;
    }
    return max;
  }

  function totalGradeCount(values: GradeStat[]): number {
    return values.map(({ grade, count }) => count).reduce((p, c) => p + c);
  }

  function calculateAverage(values: GradeStat[]): number {
    return (
      values.map(({ grade, count }) => grade * count).reduce((p, c) => p + c) /
      totalGradeCount(values)
    );
  }

  // Reduce the grade increments
  function pickGradeSubset(values: GradeStat[]): GradeStat[] {
    const increments = [1, 1.3, 1.7, 2, 2.3, 2.7, 3, 3.3, 3.7, 4, 5];

    const newValues = increments.map((inc) => ({
      grade: inc,
      count: 0,
    }));

    let currentIncIndex = 0;
    for (const { grade, count } of values) {
      // Skip to next increment if we reached it's lower end
      if (currentIncIndex !== increments.length - 1) {
        const nextIncrement = increments[currentIncIndex + 1];
        if (grade >= nextIncrement) currentIncIndex++;
      }
      newValues[currentIncIndex].count += count;
    }

    return newValues;
  }

  export function createSVGGradeDistributionGraph(
    values: GradeStat[],
    width = 200,
    height = 100,
  ): string {
    // Reduce the bar count / pick bigger intervals
    const coarseValues = pickGradeSubset(values);

    // Spacing in percent of bar width
    const spacing = 0.1;
    const barWidth = (width * (1 - spacing)) / coarseValues.length;

    // Drawing the Chart
    let barsSvg = "";
    const maxCount = maxGradeCount(coarseValues);
    for (let x = 0; x < coarseValues.length - 1; x++) {
      const { count } = coarseValues[x];
      const barHeight = (count / maxCount) * height;

      barsSvg += `
            <rect
              class="passed"
              x="${x * barWidth * (1 + spacing)}" y="${height - barHeight}"
              width="${barWidth}" height="${barHeight}"
              rx="5" ry="5"
            />
          `;
    }

    // Color the last rect for 5.0 / failed differently
    {
      const x = coarseValues.length - 1;
      const { count } = coarseValues[x];
      const barHeight = (count / maxCount) * height;

      barsSvg += `
            <rect
              class="failed"
              x="${x * barWidth * (1 + spacing)}" y="${height - barHeight}"
              width="${barWidth}" height="${barHeight}"
              rx="5" ry="5"
            />
        `;
    }

    return `
      <svg
        viewBox="0 0 ${width} ${height}"
        xmlns="http://www.w3.org/2000/svg">
        ${barsSvg}
      </svg>
    `;
  }
}
