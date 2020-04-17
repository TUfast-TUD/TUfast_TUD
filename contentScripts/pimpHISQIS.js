console.log("Pimping up hisqis...")


//'<div style="text-align: center;"><canvas id="myChart" width="400" height="400" style="margin:0; display:inline-block"></canvas><p style="margin:0;  margin-top:0; display:inline-block;">test</p></div>'


chrome.storage.local.get(['isEnabled'], function(result) {
    if(result.isEnabled) {
        document.addEventListener("DOMContentLoaded", function() {
            let rawGrades = parseGrades()
            console.log("Avarage Grade: " + getAvarage(rawGrades))
            console.log("Grades Count: " + countGrades(rawGrades))
            console.log("Number of exams: " + countExams(rawGrades))
            $("table[summary!='Liste der Stammdaten des Studierenden']").parent().eq(2).children().eq(3).after(
                '<br><br><canvas id="myChart" style="margin:0 auto;"></canvas><p class="Konto" style="margin:0 auto;">Deine Durchschnittsnote: ' + getAvarage(rawGrades) + '</p><p class="Konto" style="margin:0 auto;">Anzahl Prüfungen: ' + countExams(rawGrades) + '</p><p class="normal">von <a href="https://chrome.google.com/webstore/detail/tu-dresden-auto-login/aheogihliekaafikeepfjngfegbnimbk?hl=de">TUDresdenAutoLogin</a></p>'
                )
            var ctx = document.getElementById('myChart').getContext('2d');
            ctx.canvas.width = 500;
            ctx.canvas.height = 250;
            var myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['1', '2', '3', '4', 'nicht bestanten'],
                    datasets: [{
                        data: countGrades(rawGrades),
                        backgroundColor: [
                            '#0b2a51',
                            '#0b2a51',
                            '#0b2a51',
                            '#0b2a51',
                            '#0b2a51',
                        ],
                        borderColor: [
                            '#0b2a51',
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: false,
                    maintainAspectRatio: false,
                    legend: {
                        display: false,
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }],
                        xAxes: [{
                            scaleLabel: {
                                //display: true,
                                //labelString: "<a href='http://www.yahoo.com'>here</a>"
                            }
                        }]
                    }
                }
            });

        })
    }
})
    

//returns: [{grade: X.X, isModule: true}]
//only count subjects (not modules!)
function parseGrades(){
    var grades = [] 
    var $ = this.$

    $("table[summary!='Liste der Stammdaten des Studierenden'] > tbody").children().each(function() {
        
        //Skip stuff
        if ($(this).children().attr('class') === 'Konto' ||
            $(this).children().attr('class') === 'tabelleheader' ||
            $(this).children().eq(1).text().trim() === 'Zurück'
            )  {return true;}
        
        let grade = $(this).children().eq(3).text().trim();
        let isModule = false;
        let exam = $(this).children().eq(1).text().trim();

        
        //Skip more stuff
        if (exam === '') {return true;}
        if ($(this).children().eq(1).attr('bgcolor') === '#ADADAD') {return}
        if (exam === 'Gesamtnote Zwischenprüfung') {return}
        if (grade === "") {return}
        
        if ($(this).children().eq(1).attr('class') === 'normalFett') {
            //Modul
            //isModule = true;
            //this.grades.push({ 'grade': grade, 'isModule': isModule, });
            return
        } else {
            //Fach
            grades.push({ 'grade': grade, 'isModule': isModule, });  
        }
    });
    return grades
}

//return number of exams
function countExams(rawGrades){
    let count = 0
    rawGrades.forEach(function(info) {
        count = count + 1
    })
    return count
}

//return counted number of rounded grades for display
function countGrades(rawGrades) {
    var gradesCount = [0, 0, 0, 0, 0]
    rawGrades.forEach(function(info) {
        let grade = Math.round(parseFloat(info.grade.replace(',', '.')));
        if(grade) {
          switch (grade) {
              case 1:
              gradesCount[0] = gradesCount[0] + 1;
              break;
            case 2:
              gradesCount[1] = gradesCount[1] + 1;
              break;
            case 3:
              gradesCount[2] = gradesCount[2] + 1;
              break;
            case 4:
              gradesCount[3] = gradesCount[3] + 1;
              break;
            case 5:
              gradesCount[4] = gradesCount[4] + 1;
              break;
            default:
              break;
          }
        }
    })
    return gradesCount
}

//return arithmetic grade avarage
function getAvarage(rawGrades) {
    let sum = 0
    let count = 0
    rawGrades.forEach(function(info) {
        let grade = parseFloat(info.grade.replace(',', '.'))
        if (grade) {
            count = count + 1
            sum = sum + grade 
        }
    })
    return isNaN((Math.round(sum * 10 / count) / 10).toFixed(1)) ? (0.0).toFixed(1) : (Math.round(sum * 10 / count) / 10).toFixed(1);
}
