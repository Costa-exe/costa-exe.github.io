function CalRender() {
    const req = new XMLHttpRequest();
    req.open('GET', './calendar.json', true);
    req.send();
    req.onload = () => {
        const result = JSON.parse(req.responseText);
        document.getElementById("Giornate").style.gridTemplateColumns = `repeat(${result.giornate.length}, 1fr)`;
        for (let i = 0; i < result.giornate.length; i++) {
            let div = document.createElement('div');
            div.setAttribute('class', 'border');
            let p = document.createElement('p');
            p.innerHTML = `Giornata ${i + 1}`;
            p.setAttribute('class', 'giornateTog');
            p.onclick = () => {
                document.getElementsByClassName('mainContentCal')[0].innerHTML = '';
                let titleDay = document.createElement('p');
                titleDay.innerHTML = p.innerHTML;
                titleDay.style.fontSize = '30px';
                let h2 = document.createElement('h2');
                document.getElementsByClassName('mainContentCal')[0].append(titleDay, h2);
                h2.innerHTML = result.giornate[i].date;
                for (let j = 0; j < result.giornate[i].match.length; j++) {
                    let matchContainer = document.createElement('div');
                    matchContainer.setAttribute('class', 'matchContainer');
                    let p1 = document.createElement('p');
                    p1.innerHTML = `${result.giornate[i].match[j].round[0].player1.name} VS ${result.giornate[i].match[j].round[0].player2.name}`;
                    matchContainer.appendChild(p1);
                    let RoundWonP1 = 0;
                    let RoundWonP2 = 0;
                    let winner = document.createElement('p');
                    let p2 = document.createElement('p');
                    p2.innerHTML = `MATCH ${j + 1}`;
                    for (let x = 0; x < result.giornate[i].match[j].round.length; x++) {
                        let p3 = document.createElement('p');
                        let p5 = document.createElement('p');
                        let matchbox = document.createElement('div');
                        matchbox.style.display = 'grid';
                        matchbox.style.gridTemplateColumns = `repeat(3 , 1fr)`;
                        matchbox.style.gridAutoRows = 'repeat(2, 1fr)';
                        let span1 = document.createElement('span');
                        span1.innerHTML = 'VS';
                        span1.style.color = '#d63892';
                        p3.innerHTML = `${result.giornate[i].match[j].round[x].player1.PG}`;
                        p5.innerHTML = `${result.giornate[i].match[j].round[x].player2.PG}`;
                        matchbox.append(p3, span1, p5);
                        let p6 = document.createElement('p');
                        let p7 = document.createElement('p');
                        let p8 = document.createElement('p');
                        p6.innerHTML = result.giornate[i].match[j].round[x].player1.SetWon;
                        p7.innerHTML = ''
                        p8.innerHTML = result.giornate[i].match[j].round[x].player2.SetWon;
                        if (result.giornate[i].match[j].round[x].player1.SetWon == 2) {
                            p6.style.color = '#1f7a15';
                            p8.style.color = '#941b2b';
                            RoundWonP1++;
                        } else {
                            p6.style.color = '#941b2b';
                            p8.style.color = '#1f7a15';
                            RoundWonP2++;
                        }
                        matchbox.append(p6, p7, p8);
                        matchContainer.appendChild(matchbox);
                    }
                    if (RoundWonP1 > RoundWonP2) {
                        winner.innerHTML = `${result.giornate[i].match[j].round[0].player1.name} WINS !`;
                    } else if (RoundWonP1 < RoundWonP2) {
                        winner.innerHTML = `${result.giornate[i].match[j].round[0].player2.name} WINS !`;
                    } else {
                        winner.innerHTML = 'DRAW';
                    }
                    winner.style.color = '#d63892';
                    matchContainer.appendChild(winner);
                    document.getElementsByClassName('mainContentCal')[0].appendChild(matchContainer);
                }
            };
            div.style.width = '100px';
            div.appendChild(p);
            document.getElementById("Giornate").appendChild(div);
            document.getElementsByClassName('giornateTog')[0].click();
        }
    }
}

window.onload = function () {
    Particles.init({
        selector: '.background',
        color: '#d63892',
        connectParticles: true
    });
    CalRender();
    document.getElementById("opener").onclick = () => {
        document.getElementById("disclaimer").style.display = "block";
    };
    document.getElementById("close").onclick = () => {
        document.getElementById("disclaimer").style.display = "none";
    };
};