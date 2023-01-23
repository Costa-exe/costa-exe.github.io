let players;
let playersName = [];
let finalPlayersAssing = [];
let razze = [{
    nome: 'Elfo',
    lifePt: -8
}, {
    nome: 'Nano',
    lifePt: 6
}, {
    nome: 'Ogre',
    lifePt: 10
}, {
    nome: 'Orco',
    lifePt: 4
}, {
    nome: 'Piccolo Popolo',
    lifePt: -15
}, {
    nome: 'Umano',
    lifePt: 0
}];

let classi = [{
    nome: 'Ranger',
    lifePt: 58
}, {
    nome: 'Chierico',
    lifePt: 55
}, {
    nome: 'Mago',
    lifePt: 50
}, {
    nome: 'Ladro',
    lifePt: 52
}, {
    nome: 'Guerriero',
    lifePt: 60
}, {
    nome: 'Base',
    lifePt: 50
}];

function secondStage() {
    players = document.getElementById("playersNum").value;
    if (players > 1 && players <= 6) {
        document.getElementById("stage1").style.display = "none";
        for (let i = 1; i <= players; i++) {
            let a = document.createElement('p');
            a.innerHTML = `Inserisci Il Nome Del Giocatore ${i} : `;
            a.style.fontWeight = "bold";
            let b = document.createElement("input");
            b.setAttribute("class", "playerName");
            b.type = "text";
            b.placeholder = "es. XX_NinoFrassica_XX";
            a.appendChild(b);
            document.getElementById("stage2").appendChild(a);
        }
        let c = document.createElement("div");
        c.setAttribute("class", "buttondiv");
        c.innerHTML = "Avanti";
        c.onclick = thirdStage;
        document.getElementById("stage2").appendChild(c);
        document.getElementById("stage2").style.display = "block";
    } else {
        document.getElementById("toast").style.display = "block";
        document.getElementById("toast").innerHTML = "Il Numero Di Giocatori Deve Essere Compreso Tra 2 e 6."
        setTimeout(() => { document.getElementById("toast").style.display = "none" }, 5000);
    }
}

function thirdStage() {
    playersName = [];
    for (let i = 0; i < document.getElementsByClassName("playerName").length; i++) {
        playersName.push(document.getElementsByClassName("playerName")[i].value);
        if (document.getElementsByClassName("playerName")[i].value == "") {
            document.getElementById("toast").style.display = "block";
            document.getElementById("toast").innerHTML = "Il Nome Dei Giocatori Deve Avere Un Valore."
            setTimeout(() => { document.getElementById("toast").style.display = "none" }, 5000);
            return 0
        }
    }
    for (let i = 0; i < playersName.length; i++) {
        occurences = 0;
        for (let j = 0; j < playersName.length; j++) {
            if (playersName[j] == playersName[i]) {
                occurences++;
                if (occurences > 1) {
                    document.getElementById("toast").style.display = "block";
                    document.getElementById("toast").innerHTML = "Il Nome Dei Giocatori Deve Essere Unico."
                    setTimeout(() => { document.getElementById("toast").style.display = "none" }, 5000);
                    return 0
                }
            }
        }
    }
    document.getElementById("stage2").style.display = "none";
    let a = document.createElement('p');
    let b = document.createElement('p');
    let c = document.createElement('p');
    c.innerHTML = 'Mostra i Giocatori >>';
    a.innerHTML = 'Partita 1 vs 1 >>';
    b.innerHTML = 'Partita a Squadre >>';
    c.onclick = () => {
        document.getElementById("blackBack").style.display = "block";
        document.getElementById("playersInfo").style.display = "block";
    };
    document.getElementById("stage3").append(c, a, b);
    classSorting(playersName);
    document.getElementById("stage3").style.display = "block";
}

function classSorting(x) {
    let RazzeB = razze;
    let classiB = classi;
    for (let i = 0; i < x.length; i++) {
        let random1 = 0;
        let random2 = 0;
        if (RazzeB.length > 1) {
            let random1 = Math.floor(Math.random() * (RazzeB.length - 1)) + 1;
            let random2 = Math.floor(Math.random() * (classiB.length - 1)) + 1;
            let lp = RazzeB[random1].lifePt + classiB[random2].lifePt;
            finalPlayersAssing.push({ name: x[i], razza: RazzeB[random1].nome, classe: classiB[random2].nome, puntiVita: lp });
            let Rinit = RazzeB[random1];
            let Rend = RazzeB[RazzeB.length - 1];
            RazzeB[RazzeB.length - 1] = Rinit;
            RazzeB[random1] = Rend;
            RazzeB.pop();
            let Cinit = classiB[random2];
            let Cend = classiB[classiB.length - 1];
            classiB[classi.Blength - 1] = Cinit;
            classiB[random2] = Cend;
            classiB.pop();
        } else {
            let lp = RazzeB[random1].lifePt + classiB[random2].lifePt;
            finalPlayersAssing.push({ name: x[i], razza: RazzeB[random1].nome, classe: classiB[random2].nome, puntiVita: lp });
            let Rinit = RazzeB[random1];
            let Rend = RazzeB[RazzeB.length - 1];
            RazzeB[RazzeB.length - 1] = Rinit;
            RazzeB[random1] = Rend;
            RazzeB.pop();
            let Cinit = classiB[random2];
            let Cend = classiB[classiB.length - 1];
            classiB[classi.Blength - 1] = Cinit;
            classiB[random2] = Cend;
            classiB.pop();
        }
    }
    let c = document.createElement("h1");
    c.innerHTML = 'X';
    document.getElementById("playersInfo").appendChild(c);
    c.onclick = () => {
        document.getElementById("blackBack").style.display = "none";
        document.getElementById("playersInfo").style.display = "none";
    };
    for (let i = 0; i < finalPlayersAssing.length; i++) {
        let div = document.createElement("div");
        div.setAttribute("class", "playerContainer");
        let a1 = document.createElement("p");
        let a2 = document.createElement("p");
        let a3 = document.createElement("p");
        let b = document.createElement("h2");
        b.innerHTML = finalPlayersAssing[i].name;
        a1.innerHTML = `Classe : <b>${finalPlayersAssing[i].classe}</b>`;
        a2.innerHTML = `Razza : <b>${finalPlayersAssing[i].razza}</b>`;
        a3.innerHTML = `Punti Vita : <b>${finalPlayersAssing[i].puntiVita}</b>`;
        div.append(b, a1, a2, a3);
        document.getElementById("playersInfo").appendChild(div);
    }
}

function main() {
    document.getElementById("stage1-button").onclick = secondStage;
}

window.onload = main;