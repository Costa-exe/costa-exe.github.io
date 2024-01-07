/* CONTROL */
var runnable = true;

/* FLIPPING COIN LOGIC */
async function random() {
    document.getElementById('result').classList.remove('visible');
    document.getElementById('result').classList.add('hidden');
    if (runnable == true) {
        runnable = false;
        document.getElementById('head').src = './imgs/head.png';
        var sorting = Math.floor(Math.random() * 2);
        document.getElementById('card').classList.add('card-active');
        document.getElementById('coin').classList.add('zooming');
        if (sorting == 0) {
            setTimeout(() => {
                document.getElementById('card').classList.remove('card-active');
                document.getElementById('coin').classList.remove('zooming');
                document.getElementById('result').innerHTML = 'Testa';
                document.getElementById('result').classList.remove('hidden');
                document.getElementById('result').classList.add('visible');
                runnable = true;
            }, 3000);
        } else {
            setTimeout(() => {
                document.getElementById('card').classList.remove('card-active');
                document.getElementById('coin').classList.remove('zooming');
                document.getElementById('result').innerHTML = 'Croce';
                document.getElementById('head').src = './imgs/tail.png';
                document.getElementById('result').classList.remove('hidden');
                document.getElementById('result').classList.add('visible');
                runnable = true;
            }, 3000);
        }
    }
}

function mainLoader() {
    document.getElementById('coin').onclick = random;
}

window.onload = mainLoader;