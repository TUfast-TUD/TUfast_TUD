/* eslint-disable no-multi-str */
console.log('pimping table ... maybe :)')

// eslint-disable-next-line no-template-curly-in-string
const tableHtml = "<div id='pimpedTable' style='display:none'> \
<vs-table hover-flat :data='table'> \
  <template slot='header'> \
    <h1>Deine Notenübersicht</h1> \
    <div class='info-row'> \
  <div class='info-row__info'> \
   <div class='square blue'></div><h5>Module</h5> \
  </div> \
  <div class='info-row__info'> \
    <div class='square green'></div><h5>Bestandene Prüfung</h5> \
  </div> \
  <div class='info-row__info'> \
    <div class='square red'></div><h5>Nicht bestandene Prüfung</h5> \
  </div> \
</div> \
  </template> \
  <template slot='thead'> \
    <vs-th v-for='(header_text, index) in table[1]'  :sort-key='`${index}`' :key='index'> {{header_text}} </vs-th> \
  </template> \
  <template slot-scope='{data}'> \
    <vs-tr :class='getColour(indextr, tr)' style='background-color=red' :state='getColour(indextr, tr)' :key='indextr' v-for='(tr, indextr) in data.slice(2)'> \
      <vs-td v-for='(td, index) in tr' :key='index' :data='td'> {{td}} </vs-td> \
    </vs-tr> \
  </template> \
</vs-table> \
</div>"

// this needs to be done first
const oldTable = document.getElementsByTagName('table')[2]
const changeTableLink = document.getElementById('changeTableLink')

// insert pimped table with style display:none
getGradesFromTable()
const pimpedTable = document.getElementById('pimpedTable')

// check if hisqisPimpedTable is activated
chrome.storage.local.get(['hisqisPimpedTable'], (result) => {
  result.hisqisPimpedTable ? setPimpedTable() : setOldTable()
})

// listen for event for switching table
changeTableLink.onclick = () => {
  const pimpedTableActivated = pimpedTable.style.display !== 'none'

  // switch table
  pimpedTableActivated ? setOldTable() : setPimpedTable()
  // store permanently
  chrome.storage.local.set({ hisqisPimpedTable: !pimpedTableActivated })
}

function setPimpedTable () {
  oldTable.style.display = 'none'
  pimpedTable.style.display = 'block'
  changeTableLink.innerHTML = 'langweiligen, alten Tabelle.'
}

function setOldTable () {
  oldTable.style.display = 'block'
  pimpedTable.style.display = 'none'
  changeTableLink.innerHTML = 'neuen, coolen TUfast-Tabelle 🔥 (Beta).'
}

function getGradesFromTable () {
  // create container for vuejs table and insert it after the old table
  const container = document.createElement('div')
  container.id = 'container'
  oldTable.insertAdjacentElement('afterend', container)
  container.innerHTML = tableHtml

  const table = []
  // second table is the grade table
  // first table row index with useful information: 2
  const tableRows = [...document.getElementsByTagName('tbody')[2].getElementsByTagName('tr')]

  // collect all data from the table
  tableRows.forEach((row) => {
    const newRow = [];
    [...row.cells].forEach((tableData) => {
      if (tableData.lastElementChild === null) {
        newRow.push(tableData.innerHTML.trim().replace(/&.*;/, ''))
      } else {
        newRow.push(tableData.lastElementChild.innerHTML.trim().replace(/&.*;/, ''))
      }
    })
    table.push(newRow)
  })

  // if first row is Prüfungsnr., then we need to add dummy row[0]
  // this is required, because there are two different views of the hisqis table, dependent on how you navigate there
  if (table[0][0] === 'Prüfungsnr.') table.unshift(['dummy'])

  // remove that ugly table from the page
  oldTable.style.display = 'none'

  const levels = {
    mainLevel: [],
    moduleLevel: [],
    examLevel: []
  }

  // Logic to figure out which row is a section, module or exam
  table.filter((row, index) => row[0][1] === '0' || parseInt(row[0]) < 1000 ? levels.mainLevel.push(index) : [])
  table.filter((row, index) => row[0].slice(-2)[0] === '0' && levels.mainLevel.indexOf(index) < 0 ? levels.moduleLevel.push(index) : [])
  table.filter((_row, index) => levels.mainLevel.indexOf(index) < 0 && levels.moduleLevel.indexOf(index) < 0 && index > 2 ? levels.examLevel.push(index) : [])

  runVue(table, levels)
}

// Vue.js logic, attaches Vue to the new container under the old table and draws the new table
function runVue (table, levels) {
  // eslint-disable-next-line no-new, no-undef
  new Vue({
    el: '#container',
    data: {
      table,
      levels
    },
    methods: {
      getColour (rowIndex, row) {
        rowIndex += 2
        const passedText = row[5]
        return this.levels.mainLevel.indexOf(rowIndex) > -1
          ? 'dark'
          : this.levels.moduleLevel.indexOf(rowIndex) > -1
            ? 'primary'
            : passedText === ''
              ? 'dark'
              : passedText === 'bestanden'
                ? 'success'
                : passedText === 'in Bearbeitung' ? 'warn' : 'danger'
      }
    }
  })
}
