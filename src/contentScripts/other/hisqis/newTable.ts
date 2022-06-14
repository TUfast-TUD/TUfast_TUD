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

  // Caption for our new table
  const newTableCaption = document.createElement('caption')
  newTableCaption.innerText = 'Deine Notenübersicht'

  // Header for the new table
  const newTableHead = document.createElement('thead')
  const newTableHeadRow = document.createElement('tr')
  for (const th of oldTableRows[1].getElementsByTagName('th')) {
    const newTh = document.createElement('th')
    newTh.style.textAlign = th.align
    newTh.style.width = th.width
    newTh.innerHTML = th.innerHTML
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
      newCell.style.textAlign = cell.align
      // newCell.style.width = cell.width
      newCell.innerText = cell.innerText
      newRow.appendChild(newCell)
    }

    switch (true) {
      case cells[0].bgColor === '#ADADAD':
        newRow.className = 'meta'
        break
      case cells[0].bgColor === '#DDDDDD':
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
  newTable.append(newTableCaption, newTableHead, newTableBody)

  /* let { hisqisPimpedTable } = { hisqisPimpedTable: true } // await new Promise<any>((resolve) => chrome.storage.local.get(['hisqisPimpedTable'], resolve))
  if (hisqisPimpedTable) oldTable.style.display = 'none'
  else newTable.style.display = 'none' */

  oldTable.parentNode?.insertBefore(newTable, oldTable)

  // eslint-disable-next-line no-unused-vars
  const dataTable = new DataTable(newTable, {
    sortable: true,
    searchable: false,
    paging: false,
    columns: [
      { select: 10, type: 'date', format: 'DD.MM.YYYY' }
    ]
  })
})()
