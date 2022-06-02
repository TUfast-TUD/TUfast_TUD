(async () => {
  const form = document.getElementsByTagName('form')[0]
  const table = document.querySelector('table[summary="Liste der Stammdaten des Studierenden"]')
  const afterTable = table.nextElementSibling
  if (!form || !table || !afterTable) return

  form.insertBefore(document.createElement('p'), afterTable) // Spacer

  const gradeContainer = document.createElement('div')
  gradeContainer.id = 'TUfastGradeContainer'
  form.insertBefore(gradeContainer, afterTable)

  const tableInfoContainer = document.createElement('div')
  tableInfoContainer.id = 'TUfastTableInfo'
  form.insertBefore(tableInfoContainer, afterTable)

  const imgUrl = chrome.runtime.getURL('/assets/images/tufast48.png')
  const credits = document.createElement('p')
  credits.id = 'TUfastCredits'
  credits.innerHTML = `Powered by <img src="${imgUrl}" style="position:relative; right: 2px;height: 15px;"><a href="https://www.tu-fast.de" target="_blank">TUfast</a> (entwickelt von <a href="https://github.com/Noxdor" target="_blank">Noxdor</a> & <a href="https://github.com/C0ntroller" target="_blank">C0ntroller</a>)`
  form.insertBefore(credits, afterTable)


  const gradeScript = document.createElement('script')
  gradeScript.type = 'module'
  gradeScript.src = chrome.extension.getURL('/contentScripts/other/hisqis/gradeChart.js')

  const tableScript = document.createElement('script')
  tableScript.type = 'module'
  tableScript.src = chrome.extension.getURL('/contentScripts/other/hisqis/newTable.js')

  document.head.append(gradeScript, tableScript)
})()
