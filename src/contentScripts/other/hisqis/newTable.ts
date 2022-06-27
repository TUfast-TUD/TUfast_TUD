import { DataTable } from 'simple-datatables'

(async () => {
  // Get the container for the information
  // Currently this means there's the link located for switching the tables
  const tableInfoContainer = document.getElementById('TUfastTableInfo')
  if (!tableInfoContainer) return

  // The old table and it's content
  const oldTable = document.getElementsByTagName('table')[2]
  if (!oldTable) return
  oldTable.id = 'oldGradeTable'
  const oldTableRows = (oldTable as HTMLTableElement).querySelectorAll('tr')

  // Create a new table
  const newTable = document.createElement('table')
  newTable.id = 'gradeTable'
  newTable.style.display = 'none' // Hide by default so there's less flickering

  // Header for our new table
  const caption = document.createElement('caption')
  const tableHeader = document.createElement('div')
  tableHeader.classList.add('table-header')
  caption.append(tableHeader)

  // title element
  const title = document.createElement('h3')
  title.classList.add('table-header__title')
  title.innerText = 'Deine Notenübersicht'

  // flex div to display small color helpers
  const colorHelpers = document.createElement('div')
  colorHelpers.classList.add('table-header__helpers')

  // create small color helpers
  for (const [i, descriptor] of ['Modul', 'Bestandene Prüfung', 'Verhauene Prüfung'].entries()) {
    const colorHelper = document.createElement('div')
    colorHelper.classList.add('table-header__helper')
    colorHelper.classList.add(`table-header__helper--${i}`)

    const color = document.createElement('div')
    color.classList.add('table-header__color')
    color.classList.add(`table-header__color--${i}`)
    colorHelper.append(color)

    const colorText = document.createElement('div')
    colorText.classList.add('table-header__color-text')
    colorText.classList.add(`table-header__color-text--${i}`)
    colorText.innerText = descriptor
    colorHelper.append(colorText)

    colorHelpers.append(colorHelper)
  }

  tableHeader.append(title, colorHelpers)

  // Header for the new table
  const newTableHead = document.createElement('thead')
  const newTableHeadRow = document.createElement('tr')
  for (const th of oldTableRows[1].getElementsByTagName('th')) {
    const newTh = document.createElement('th')
    newTh.style.textAlign = th.style.textAlign
    newTh.style.width = th.style.width
    newTh.innerText = th.innerText.trim()
    newTableHeadRow.append(newTh)
  }
  newTableHead.appendChild(newTableHeadRow)

  // Body for the new table
  const newTableBody = document.createElement('tbody')
  // Create rows from the old table
  for (const oldRow of oldTableRows) {
    const cells = oldRow.getElementsByTagName('td')
    if (cells.length < 11) continue

    const newRow = document.createElement('tr')
    for (const cell of cells) {
      const newCell = document.createElement('td')
      newCell.style.textAlign = cell.style.textAlign
      newCell.style.width = cell.style.width
      newCell.innerText = cell.innerText
      newRow.appendChild(newCell)
    }

    const computedStyleCell = window.getComputedStyle(cells[0])
    const backgroundColorCell = computedStyleCell.getPropertyValue('background-color')
    switch (true) {
      case backgroundColorCell === 'rgb(173, 173, 173)':
        newRow.className = 'meta'
        break
      case backgroundColorCell === 'rgb(221, 221, 221)':
        newRow.className = 'module'
        break
      case Number.parseFloat(cells[3].textContent?.trim().replace(',', '.') || '') === 5:
        newRow.className = 'exam-nopass'
        break
      default:
        newRow.className = 'exam'
    }
    newTableBody.appendChild(newRow)
  }

  // Append everything together
  newTable.append(caption, newTableHead, newTableBody)

  /* let { hisqisPimpedTable } = { hisqisPimpedTable: true } // await new Promise<any>((resolve) => chrome.storage.local.get(['hisqisPimpedTable'], resolve))
  if (hisqisPimpedTable) oldTable.style.display = 'none'
  else newTable.style.display = 'none' */

  oldTable.parentNode?.insertBefore(newTable, oldTable)

  // eslint-disable-next-line no-unused-vars
  const _dataTable = new DataTable(newTable, {
    sortable: true,
    searchable: false,
    paging: false,
    columns: [
      { select: 10, type: 'date', format: 'DD.MM.YYYY' }
    ]
  })
})()
