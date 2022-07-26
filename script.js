function contentManager () {
    switch (this.innerHTML) {
        case "About Me":
        case "Learn More About Me":
            aboutMe.style.display = "block";
            intro.style.display = "none";
            skills.style.display = "none"
            demos.style.display = "none";
            pageName.innerHTML = "About Me";
            document.getElementsByClassName("nav")[0].style.color = "#1bff41";
            document.getElementsByClassName("nav")[1].style.color = "#ffffff";
            document.getElementsByClassName("nav")[2].style.color = "#ffffff";
            break;
        case "Skills":
            aboutMe.style.display = "none";
            intro.style.display = "none";
            skills.style.display = "block";
            demos.style.display = "none";
            pageName.innerHTML = "Skills";
            document.getElementsByClassName("nav")[0].style.color = "#ffffff";
            document.getElementsByClassName("nav")[1].style.color = "#1bff41";
            document.getElementsByClassName("nav")[2].style.color = "#ffffff";
            break;
        case "Demos":
            aboutMe.style.display = "none";
            intro.style.display = "none";
            skills.style.display = "none";
            demos.style.display = "block";
            pageName.innerHTML = "Demos";
            document.getElementsByClassName("nav")[0].style.color = "#ffffff";
            document.getElementsByClassName("nav")[1].style.color = "#ffffff";
            document.getElementsByClassName("nav")[2].style.color = "#1bff41";
            break;
    }
    menuBlock.style.display = "none";
    menuBox.style.display = "none";
    menuItems.style.display = "none";
}

function animationsTiming () {
    setTimeout(() => {
        document.getElementsByClassName("paraIntro")[0].style.display = "block";
        document.getElementsByClassName("paraIntro")[1].style.display = "block";
        document.getElementsByClassName("paraIntro")[2].style.display = "block";
    }, 500);
    setTimeout(() => {
        document.getElementsByClassName("paraIntro")[3].style.display = "block";
    }, 1500);
    setTimeout(() => {
        document.getElementById("aboutCont").style.display = "block";
    }, 2000);
    setTimeout(() => {
        document.getElementById("headerContainer").style.display = "grid";
    }, 2500);
}

function menuManager () {
    if (this.id == "menuIcon") {
        menuBlock.style.display = "block";
        menuBox.style.display = "block";
        menuItems.style.display = "block";
    } else {
        menuBlock.style.display = "none";
        menuBox.style.display = "none";
        menuItems.style.display = "none";
    }
}

function main () {
    const intro = document.getElementById("intro");
    const aboutMe = document.getElementById("aboutMe");
    const learnAboutMe = document.getElementById("about");
    const options = document.getElementsByClassName("menuText");
    const skills = document.getElementById("skills");
    const demos = document.getElementById("demos");
    const menuBox = document.getElementById("menuBox");
    const close = document.getElementById("close");
    const menuIcon = document.getElementById("menuIcon");
    const menuBlock = document.getElementById("menuBlock");
    const menuItems = document.getElementById("menuItems");
    const pageName = document.getElementById("pageName");
    animationsTiming();
    learnAboutMe.onclick = contentManager;
    for (let i = 0; i < options.length; i++) {
        options[i].onclick = contentManager;
    }
    close.onmouseover = () => {
        close.src = "./imgs/close2.svg";
    }
    close.onmouseout = () => {
        close.src = "./imgs/close.svg";
    }
    menuIcon.onmouseover = () => {
        menuIcon.src = "./imgs/menu2.svg";
    }
    menuIcon.onmouseout = () => {
        menuIcon.src = "./imgs/menu.svg";
    }
    menuIcon.onclick = menuManager;
    close.onclick = menuManager;

}

window.onload = main;