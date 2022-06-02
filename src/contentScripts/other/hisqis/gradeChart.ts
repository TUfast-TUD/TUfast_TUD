import Chart from 'chart.js/auto'

type ExamGrades = Record<number, number>
type ModuleGrades = Record<number, { grade: number, cp: number }>

interface ParsedGrades {
  exams: ExamGrades
  modules: ModuleGrades
}

function parseGrades(): ParsedGrades {
  const examGrades: ExamGrades = {}
  const moduleGrades: ModuleGrades = {}

  const tableRows = document.querySelectorAll('form table:not([summary="Liste der Stammdaten des Studierenden"]) > tbody > tr')
  if(tableRows.length === 0) return null

  for (const row of tableRows) {
    const cells = row.getElementsByTagName('td')
    if (cells.length < 11) continue
    if (cells[0].bgColor === '#ADADAD') continue

    const isModule = cells[0].bgColor === '#DDDDDD'

    const entitiyNumber = Number.parseInt(cells[0].textContent.trim())
    if (Number.isNaN(entitiyNumber)) continue

    const entityGrade = Number.parseFloat(cells[3].textContent.trim().replace(',', '.'))
    if (Number.isNaN(entityGrade)) continue

    if (isModule) {
      const cp = Number.parseInt(cells[7].textContent.trim()) || 0
      moduleGrades[entitiyNumber] = { grade: entityGrade, cp }
    } else {
      if (examGrades[entitiyNumber]) {
        // If it exists in the list we overwrite it when it's better (we don't count 5.0)
        if (entityGrade < examGrades[entitiyNumber]) examGrades[entitiyNumber] = entityGrade
      } else {
        // If it doesn't exist we create it 
        examGrades[entitiyNumber] = entityGrade
      }
    }
  }

  return { exams: examGrades, modules: moduleGrades }
}

function countGrades(grades: ExamGrades): number[] {
  const gradesArr = [0, 0, 0, 0, 0]
  Object.values(grades).forEach(g => {
    const grade = Math.round(g)
    gradesArr[grade - 1] += 1
  })

  return gradesArr
}

function getWeightedAverage(grades: ModuleGrades): number {
  let sum = 0
  let count = 0
  for (const { grade, cp } of Object.values(grades)) {
    sum += grade * cp
    count += cp
  }
  return sum / count
}

(async () => {
  const container = document.getElementById('TUfastGradeContainer')
  if(!container) return

  const grades = parseGrades()
  if(!grades) return

  const canvas = document.createElement('canvas')

  const statistik = []
  for (let i = 0; i<3; i++) {
    const p = document.createElement('p')
    p.className = 'info'
    statistik.push(p)
  }

  statistik[0].innerHTML = `Deine Durchschnittnote (nach CP gewichtet): ${getWeightedAverage(grades.modules).toFixed(2)}`
  statistik[1].innerHTML = `Anzahl Module: ${Object.keys(grades.modules).length}`
  statistik[2].innerHTML = `Anzahl Prüfungen: ${Object.keys(grades.exams).length}`

  container.append(canvas, ...statistik)

  const ctx = canvas.getContext('2d')
  ctx.canvas.width = 500
  ctx.canvas.height = 250
  const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['1', '2', '3', '4', 'nicht bestanden'],
      datasets: [{
        data: countGrades(grades.exams),
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
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
})()
