getGradesFromTable();

function getGradesFromTable() {
    // create container for vuejs table
    const container = document.createElement('div');
    container.id = 'container';
    document.getElementsByTagName('table')[2].insertAdjacentElement('afterend', container);
    container.innerHTML = table_html;

    let table = [];
    // second table is the grade table
    // first table row index with useful information: 2
    const tableRows = [...document.getElementsByTagName('tbody')[2].getElementsByTagName('tr')];

    // collect all data from the table
    tableRows.forEach((row) => {
        let new_row = [];
        [...row.cells].forEach((table_data) => {
            if (table_data.lastElementChild === null) {
                new_row.push(table_data.innerHTML.trim().replace(/&.*;/, ''));
            } else {
                new_row.push(table_data.lastElementChild.innerHTML.trim().replace(/&.*;/, ''));
            }
        });
        table.push(new_row);
    });

    // remove ugly table from page
    document.getElementsByTagName('table')[2].style.display = 'none';

    let levels = {
        mainLevel: [],
        moduleLevel: [],
        examLevel: []
    };

    table.filter((row, index) => row[0][1] === '0' || parseInt(row[0]) < 1000 ? levels.mainLevel.push(index) : []);
    table.filter((row, index) => row[0][3] === '0' && levels.mainLevel.indexOf(index) < 0 ? levels.moduleLevel.push(index) : []);
    table.filter((row, index) => levels.mainLevel.indexOf(index) < 0 && levels.moduleLevel.indexOf(index) < 0 && index > 2 ? levels.examLevel.push(index) : []);

    runVue(table, levels);
}

function runVue(table, levels) {
    console.table(levels);

    let x = new Vue({
        el: '#container',
        mounted() {
            console.log('Hello World from Vue!');
        },
        data: {
            table,
            levels,
        },
        methods: {
            getColour(row_index, row) {
                row_index += 2;
                grade = parseFloat(row[3].replace(',', '.'));
                return this.levels.mainLevel.indexOf(row_index) > -1 ? 'dark' :
                this.levels.moduleLevel.indexOf(row_index) > -1 ? 'primary' :
                grade === '' ? 'dark' : parseFloat(grade) < 5.0 ? 'success' : 'danger'
                // if (this.levels.mainLevel.indexOf(row_index) > -1) {
                //     return 'dark';
                // } else if (this.levels.moduleLevel.indexOf(row_index) > -1) {
                //     return 'primary';
                // } else {
                //     return 'success';
                // }
            }
        }
    });
}

// Pimp old table
function applyCSSToTable(levels) {
    const table = document.getElementsByTagName('table')[2];
    const rows = [...table.getElementsByTagName('tr')];
    const header1 = rows[0];
    const header2 = rows[1];
    const mainLevelRows = rows.filter((_, index) => levels.mainLevel.indexOf(index) > -1);
    const moduleLevelRows = rows.filter((_, index) => levels.moduleLevel.indexOf(index) > -1);
    const examLevelRows = rows.filter((_, index) => levels.examLevel.indexOf(index) > -1);

    const cells = table.getElementsByTagName('td');

    // table styles
    table.style.borderCollapse = 'collapse';

    // all row styles
    rows.forEach((row) => {
        row.style.minHeight = '20em 0.1rem';
    });

    //header styles
    header1.style.backgroundColor = "#0b2a51";
    header1.style.color = "white";
    header1.getElementsByTagName('th')[0].colSpan = '12';

    header2.style.backgroundColor = "#0b2a51";
    header2.style.color = "white";

    // main level styles
    mainLevelRows.forEach((row) => {
        row.style.backgroundColor = '#3A4F7A';
        row.style.color = 'white';
        [...row.children].forEach((child) => {
            child.removeAttribute('bgcolor');
        });
    });

    // module level styles
    moduleLevelRows.forEach((row) => {
        row.style.backgroundColor = '#6477A5';
        row.style.color = 'white';
        [...row.children].forEach((child) => {
            child.removeAttribute('bgcolor');
        });
    });

    // exam level styles
    examLevelRows.forEach((row) => {
        row.style.backgroundColor = '#90A2D3';
        row.style.color = 'white';
        [...row.children].forEach((child) => {
            child.removeAttribute('bgcolor');
        });
    });
}