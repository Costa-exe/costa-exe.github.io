window.onload = function () {
    Particles.init({
        selector: '.background',
        color: '#d63892',
        connectParticles: true
    });
    document.getElementById("opener").onclick = () => {
        document.getElementById("disclaimer").style.display = "block";
    };
    document.getElementById("close").onclick = () => {
        document.getElementById("disclaimer").style.display = "none";
    };
};