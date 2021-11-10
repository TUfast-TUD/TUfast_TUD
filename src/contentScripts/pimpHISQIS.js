// returns: [{grade: X.X, isModule: true}]
// only count subjects (not modules!)
function parseGrades () {
  const grades = []

  const tableRows = document.querySelector('form table:not([summary="Liste der Stammdaten des Studierenden"]) > tbody').children
  for (const row of tableRows) {
    if (row.children.length < 7) continue

    const background = row.children[1].getAttribute('bgcolor')
    if (background === '#ADADAD') continue
    const grade = Number.parseFloat(row.children[3].innerHTML.trim().replace(',', '.'))
    if (Number.isNaN(grade)) continue
    const isModule = background === '#DDDDDD'
    let weight = isModule ? Number.parseInt(row.children[7].innerHTML.trim()) : 0
    if (Number.isNaN(weight)) weight = 0
    const exam = row.children[1].innerHTML.trim()
    if (exam === '' || exam === 'Gesamtnote Zwischenprüfung') continue

    grades.push({ grade, isModule, weight })
  }

  return grades
}

// return counted number of rounded grades for display
// also showing failed exams which were passed later
function countGrades (rawGrades) {
  const gradesCount = [0, 0, 0, 0, 0]
  rawGrades.forEach((info) => {
    const grade = Math.round(info.grade)
    switch (grade) {
      case 1:
        gradesCount[0] = gradesCount[0] + 1
        break
      case 2:
        gradesCount[1] = gradesCount[1] + 1
        break
      case 3:
        gradesCount[2] = gradesCount[2] + 1
        break
      case 4:
        gradesCount[3] = gradesCount[3] + 1
        break
      case 5:
        gradesCount[4] = gradesCount[4] + 1
        break
      default:
        break
    }
  })
  return gradesCount
}

// return arithmetic grade average
// not counting failed exams!
// function getArithAverage (rawGrades) {
//   // first get all grade-objects that aren't failed, then map it directly as number
//   const grades = rawGrades.filter(x => x.grade !== 5.0 && !x.isModule).map(x => x.grade)
//   return grades.length ? (grades.reduce((acc, value) => acc + value, 0) / grades.length).toFixed(1) : 0
// }

// return weighted grade average
// not counting failed modules!
function getWeightedAverage (rawGrades) {
  const grades = rawGrades.filter(x => x.grade !== 5.0 && x.isModule)
  const totalWeight = grades.reduce((acc, value) => acc + value.weight, 0) // BUG:
  return totalWeight ? (grades.reduce((acc, value) => acc + value.grade * value.weight, 0) / totalWeight).toFixed(1) : 0
}


console.log('Pimping up hisqis...')

const imgUrl = chrome.runtime.getURL('../assets/images/tufast48.png')
const rawGrades = parseGrades()
const table = document.querySelector('table[summary="Liste der Stammdaten des Studierenden"]')
const notenStatistik = `<br><br>
  <canvas id="myChart" style="margin:0 auto;"></canvas>
  <p class="Konto" style="margin:0 auto;">Deine Durchschnittnote (nach CP gewichtet): ${getWeightedAverage(rawGrades)}</p>
  <p class="Konto" style="margin:0 auto;">Anzahl Module: ${rawGrades.filter(x => x.isModule).length}</p>
  <p class="Konto" style="margin:0 auto;">Anzahl Prüfungen: ${rawGrades.filter(x => !x.isModule).length}</p>
  <p class="normal" style="margin-bottom:0">powered by <img src="${imgUrl}" style="position:relative; right: 2px;height: 15px;"><a href="https://www.tu-fast.de">TUfast</a> (entwickelt von <a href="https://github.com/Noxdor" target="_blank">Noxdor</a>, <a href="https://github.com/C0ntroller" target="_blank">C0ntroller</a>)</p>
  <p class="normal" style="margin-bottom:-20px" id="changeTable">Wechsle zur <a id="changeTableLink" href="javascript:void(0)">... nocht nicht f&uuml;r Firefox!</a></p>`
table.insertAdjacentHTML('afterend', notenStatistik)
const ctx = document.getElementById('myChart').getContext('2d')
ctx.canvas.width = 500
ctx.canvas.height = 250
// eslint-disable-next-line no-unused-vars, no-undef
const myChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['1', '2', '3', '4', 'nicht bestanden'],
    datasets: [{
      data: countGrades(rawGrades.filter(x => !x.isModule)),
      backgroundColor: [
        '#0b2a51',
        '#0b2a51',
        '#0b2a51',
        '#0b2a51',
        '#0b2a51'
      ],
      borderColor: [
        '#0b2a51'
      ],
      borderWidth: 1
    }]
  },
  options: {
    responsive: false,
    maintainAspectRatio: false,
    legend: {
      display: false
    },
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }],
      xAxes: [{
        scaleLabel: {
          // display: true,
          // labelString: "<a href='http://www.yahoo.com'>here</a>"
        }
      }]
    }
  }
})
