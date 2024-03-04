function rankRender() {
    const req = new XMLHttpRequest();
    req.open('GET', './rank.json', true);
    req.send();
    req.onload = () => {
        const result = JSON.parse(req.responseText);
        result.players.sort((a, b) => b.punti - a.punti);
        let steps = 0;
        for (let i = 0; i < result.players.length; i++) {
            steps++;
            let row = document.createElement('div');
            row.setAttribute('class', 'rankRow');
            let rankNumb = document.createElement('p');
            let actualRank = i + 1;
            if (i != 0 && result.players[i].punti == result.players[i - 1].punti) {
                rankNumb.innerHTML = actualRank - steps;
            } else {
                rankNumb.innerHTML = i + 1;
                steps = 0;
            }
            row.appendChild(rankNumb);
            let name = document.createElement('p');
            name.innerHTML = result.players[i].nome;
            row.appendChild(name);
            let points = document.createElement('p');
            points.innerHTML = result.players[i].punti;
            row.appendChild(points);
            let pg = document.createElement('p');
            pg.innerHTML = `${result.players[i].PG[0].substring(3, 0)} & ${result.players[i].PG[1].substring(3, 0)}`;
            row.appendChild(pg);
            let dynamicColumn = document.createElement('p');
            let rate = 0;
            if (result.players[i].punti == 0) {
                rate = (result.players[i].totalSetWon - result.players[i].totalSetLost) / 1;
            } else {
                rate = (result.players[i].totalSetWon - result.players[i].totalSetLost) / result.players[i].punti;
            }
            dynamicColumn.innerHTML = rate.toFixed(2);
            row.appendChild(dynamicColumn);
            document.getElementsByClassName("mainContent")[0].appendChild(row);
        }
    }
}

window.onload = function () {
    Particles.init({
        selector: '.background',
        color: '#d63892',
        connectParticles: true
    });
    rankRender();
    document.getElementById("opener").onclick = () => {
        document.getElementById("disclaimer").style.display = "block";
    };
    document.getElementById("close").onclick = () => {
        document.getElementById("disclaimer").style.display = "none";
    };
};