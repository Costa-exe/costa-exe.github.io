var icn;
var icnframes;
var status = 0;

function overlaymanager () {
    switch (this.id) {
        case "close":
            blockActions.style.display = "none";
            iconsToSelect.style.display = "none";
            for (let i = 0; i < icn.length; i++) {
                icn[i].dataset.active = "false";
                icn[i].style.backgroundColor = "#ffffff";
                let pathicn = icn[i].getElementsByTagName("path");
                for (let i = 0; i < pathicn.length; i++) {
                    pathicn[i].style.fill = "#000000";
                }
            }
            break;
        case "add":
            blockActions.style.display = "block";
            iconsToSelect.style.display = "block";
            break;
        case "close21":
            blockActions.style.display = "none";
            frame2.style.display = "none";
            break;
        case "dots":
            blockActions.style.display = "block";
            frame2.style.display = "block";
            if (icnframes) {
                for (let i = 0; i < icnframes.length; i++) {
                    icnframes[i].onclick = () => {
                        if (icnframes[i].dataset.active == "active") {
                            document.getElementsByClassName("iconSelSec")[1].getElementsByClassName("frame1Div")[i].dataset.active = "false";
                            icnframes[i].dataset.active = "false";
                            icnframes[i].style.opacity = "100%";
                        } else {
                            icnframes[i].dataset.active = "active";
                            document.getElementsByClassName("iconSelSec")[1].getElementsByClassName("frame1Div")[i].dataset.active = "active"
                            icnframes[i].style.opacity = "85%";
                        }
                        if (document.getElementsByClassName("verify")[i].style.display == "none") {
                            document.getElementsByClassName("verify")[i].style.display = "block";
                        } else {
                            document.getElementsByClassName("verify")[i].style.display = "none";
                        }
                    };
                    let pathicn = icnframes[i].getElementsByTagName("path");
                    icnframes[i].onmouseover = () => {
                        for (let i = 0; i < pathicn.length; i++) {
                            pathicn[i].style.opacity = "85%";
                        }
                    }
                    icnframes[i].onmouseout = () => {
                        for (let i = 0; i < pathicn.length; i++) {
                            pathicn[i].style.opacity = "100%";
                        }
                    }
                    for (let i = 0; i < document.getElementsByClassName("verify").length; i++) {
                        document.getElementsByClassName("verify")[i].onclick = () => {
                            document.getElementsByClassName("verify")[i].checked = true;
                        }
                    }
                }
            }
            break;
    }
}

function icnSelection () {
    if (this.dataset.active == "active") {
        this.dataset.active = "false";
        this.style.backgroundColor = "#ffffff";
        let pathicn = this.getElementsByTagName("path");
        for (let i = 0; i < pathicn.length; i++) {
            pathicn[i].style.fill = "#000000";
        }
    } else {
        this.dataset.active = "active";
        this.style.backgroundColor = "#3366cc";
        let pathicn = this.getElementsByTagName("path");
        for (let i = 0; i < pathicn.length; i++) {
            pathicn[i].style.fill = "#ffffff";
        }
    }
}

function setIcons () {
    for (let i = 0; i < icn.length; i++) {
        if (icn[i].dataset.active == "active") {
            if (!(document.getElementById("icn" + i))) {
                let div = document.createElement("div");
                let div2 = document.createElement("div");
                let check = document.createElement("input");
                check.setAttribute("type", "checkbox");
                check.setAttribute("class", "verify");
                check.checked = true;
                check.style.display = "none";
                div.setAttribute("class", "frame1Div");
                div2.setAttribute("class", "frame1Div");
                div.setAttribute("id", "icn" + i);
                div2.setAttribute("id", "icn-2" + i);
                div.innerHTML = icn[i].innerHTML;
                div2.innerHTML = icn[i].innerHTML;
                div2.appendChild(check);
                document.getElementsByClassName("iconSelSec")[1].appendChild(div);
                document.getElementsByClassName("frame2Content")[2].appendChild(div2);
            }
            icn[i].dataset.active = "false";
            icn[i].style.backgroundColor = "#ffffff";
            let pathicn = icn[i].getElementsByTagName("path");
            for (let i = 0; i < pathicn.length; i++) {
                pathicn[i].style.fill = "#000000";
            }
        }
    }
    let frames1 = document.getElementsByClassName("frame1Div");
    for (let i = 0; i < frames1.length; i++) {
        let frames1Path = frames1[i].getElementsByTagName("path");
        for (let i = 0; i < frames1Path.length; i++) {
            frames1Path[i].style.fill = "#000000";
        }
    }
    blockActions.style.display = "none";
    iconsToSelect.style.display = "none";
    icnframes = frame2.getElementsByClassName("frame1Div");
}

function selectAllIcons () {
    switch (this.id) {
        case "selector":
            for (let i = 0; i < icn.length; i++) {
                icn[i].dataset.active = "active";
                icn[i].style.backgroundColor = "#3366cc";
                let pathicn = icn[i].getElementsByTagName("path");
                for (let i = 0; i < pathicn.length; i++) {
                    pathicn[i].style.fill = "#ffffff";
                }
            }
            break;
        case "deselector":
            for (let i = 0; i < icn.length; i++) {
                icn[i].dataset.active = "false";
                icn[i].style.backgroundColor = "#ffffff";
                let pathicn = icn[i].getElementsByTagName("path");
                for (let i = 0; i < pathicn.length; i++) {
                    pathicn[i].style.fill = "#000000";
                }
            }
            break;
    }
    
}

function deleteAllIcons () {
    document.getElementsByClassName("frame2Content")[2].innerHTML = "";
    document.getElementsByClassName("iconSelSec")[1].innerHTML = "";
    icnframes = frame2.getElementsByClassName("frame1Div");
    blockActions.style.display = "none";
    frame2.style.display = "none";
}

function removeIcon () {
    let arr1 = [...icnframes];
    let arr2 = [...document.getElementsByClassName("iconSelSec")[1].getElementsByClassName("frame1Div")];
    arr1.forEach(element => {
        if (element.dataset.active == "active") {
            element.remove();
        }
    });
    arr2.forEach(element => {
        if (element.dataset.active == "active") {
            element.remove();
        }
    });
    icnframes = frame2.getElementsByClassName("frame1Div");
    blockActions.style.display = "none";
    frame2.style.display = "none";
}

function setColorToSvg () {
    if (icnframes) {
        for (let i = 0; i < icnframes.length; i++) {
            let pathicn1 = icnframes[i].getElementsByTagName("path");
            let pathicn2 = document.getElementsByClassName("iconSelSec")[1].getElementsByClassName("frame1Div")[i].getElementsByTagName("path");
            for (let i = 0; i < pathicn1.length; i++) {
                pathicn1[i].style.fill = document.getElementById("hexa").value;
                pathicn2[i].style.fill = document.getElementById("hexa").value;
            }
        }
    }
}

function pause(msec) {
    return new Promise(
        (resolve, reject) => {
            setTimeout(resolve, msec);
        }
    );
}

async function download () {
    if (document.getElementsByClassName("iconSelSec")[1].getElementsByClassName("frame1Div")) {
        downloadCounter.style.display = "flex";
        blockActions.style.display = "block";
        for (let i = 0; i < document.getElementsByClassName("iconSelSec")[1].getElementsByClassName("frame1Div").length; i++) {
            document.getElementById("counter").innerHTML = (i+1) + "/" + document.getElementsByClassName("iconSelSec")[1].getElementsByClassName("frame1Div").length;
            let blob = new Blob([document.getElementsByClassName("iconSelSec")[1].getElementsByClassName("frame1Div")[i].innerHTML.toString()]);
            let link = document.createElement("a");
            link.download = "icon" + (i+1) + ".svg";
            link.href = window.URL.createObjectURL(blob);
            link.click();
            link.remove();
            await pause(1000);
        }
        document.getElementById("counter").innerHTML = "";
        downloadCounter.style.display = "none";
        blockActions.style.display = "none";
    }
}

function main () {
    const set = document.getElementById("setButton");
    icn = document.getElementsByClassName("icn");
    const add = document.getElementById("add");
    const blockActions = document.getElementById("blockActions");
    const iconsToSelect = document.getElementById("iconsToSelect");
    const close = document.getElementById("close");
    const selectAll = document.getElementById("selector");
    const close21 = document.getElementById("close21");
    const remove = document.getElementById("remove");
    const frame2 = document.getElementById("frame2");
    const dots = document.getElementById("dots");
    const removeAll = document.getElementById("deleteAll"); 
    const deselctAll = document.getElementById("deselector");
    const palette = document.getElementById("palette");
    const hex = document.getElementById("hexa");
    const setColor = document.getElementById("setColor");
    const downButton = document.getElementById("download");
    const downloadCounter = document.getElementById("downloadCounter");
    downButton.onclick = download;
    hex.value = palette.value;
    setColor.onclick = setColorToSvg;
    palette.onchange = () => {
        hex.value = palette.value;
    }
    hex.onchange = () => {
        palette.value = hex.value;
    }
    close.onmouseover = () => {
        close.src = "./img/close2.svg";
    }
    close.onmouseout = () => {
        close.src = "./img/close.svg";
    }
    close21.onmouseover = () => {
        close21.src = "./img/close22.svg";
    }
    close21.onmouseout = () => {
        close21.src = "./img/close21.svg";
    }
    remove.onmouseover = () => {
        remove.src = "./img/remove2.svg";
    }
    remove.onmouseout = () => {
        remove.src = "./img/remove.svg";
    }
    close21.onclick = overlaymanager;
    close.onclick = overlaymanager;
    dots.onclick = overlaymanager;
    add.onclick = overlaymanager;
    removeAll.onclick = deleteAllIcons;
    for (let i = 0; i < icn.length; i++) {
        icn[i].onclick = icnSelection;
        let pathicn = icn[i].getElementsByTagName("path");
        icn[i].onmouseover = () => {
            for (let i = 0; i < pathicn.length; i++) {
                pathicn[i].style.fill = "#999999";
            }
        }
        icn[i].onmouseout = () => {
            if (icn[i].dataset.active == "active") {
                    for (let i = 0; i < pathicn.length; i++) {
                        pathicn[i].style.fill = "#ffffff";
                    }
            } else {
                    for (let i = 0; i < pathicn.length; i++) {
                        pathicn[i].style.fill = "#000000";
                    }
            }
        }
    }
    set.onclick = setIcons;
    selectAll.onclick = selectAllIcons;
    deselctAll.onclick = selectAllIcons;
    remove.onclick = removeIcon;
}

window.onload = main;