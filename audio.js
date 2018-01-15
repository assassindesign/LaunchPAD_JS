// 버튼 리스트 
var keyList = [65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,
    49,50,51,52,53,54,55,56,57,48,32,
    96,97,98,99,100,101,102,103,104,105,
    106,107,108,109,110,111,
    186,187,188,189,190,191,192,219,220,221,222];
var velocity = getData("velocity").split('\n');
var keyColor = [];
var pressedKey = [];
var oriPressedKey = null;
var coloredKey = [];
var keyCount = [];
var counter = [];
var baseColor = "#FFFFFF";
var strokeColor = "rgba(255,255,255,0.5)";
var sound = [];
var audio = [];
var autoData = [];
var cirs = [];
var rects = [];
var canvas;
var ctx;
var nowPage = 0;
var projectName;
var chain = 6;
var keyX = 8, keyY = 8;
var timer;
var autoP = false;

$(function() {
    canvas = document.getElementById('canv');
    ctx = canvas.getContext('2d');

    for(var j = 0 ; j < chain; j++)
    {
        sound[j] = [];
        audio[j] = [];
        pressedKey[j] = [];
        coloredKey[j] = [];
        keyCount[j] = [];
        counter[j] = [];
        for(var i = 0 ; i < keyX*keyY; i++)
        {
            sound[j][i] = [];
            audio[j][i] = [];
            pressedKey[j][i] = 0
            coloredKey[j][i] = "#FF0000";
            keyCount[j][i] = 0;
            counter[j][i] = 0;
        }
    }
});

// 캔버스 크기 조정
function cnv2Resize() {
    canvas.width = window.innerWidth*19/20;
    canvas.height = window.innerHeight*19/20;
    render();
}

// 화면 리사이즈 이벤트
window.onload = function() {
    cnv2Resize();
    window.addEventListener('resize',function(){
        clearTimeout(timer);
        timer = setTimeout(cnv2Resize, 300);
    }, false);
}

function collides(x, y) {
    var isCollision = false;
    for (var i = 0, len = rects.length; i < len; i++) {
        var left = rects[i].x, right = rects[i].x+rects[i].w;
        var top = rects[i].y, bottom = rects[i].y+rects[i].h;
        if (right >= x
            && left <= x
            && bottom >= y
            && top <= y) {
            isCollision = rects[i];
            if(!isNaN(audio[nowPage][i][counter[nowPage][i]].duration))
            {
                //onLED(nowPage, i);
                //setTimeout(offLED, 50, nowPage, i);
                test2(i, 0)
                playAudio(nowPage,i);
            }
            else return null;
        }
    }
    return isCollision;
}

function collides2(x, y) {
    var isCollision = false;
    for (var i = 0, len = cirs.length; i < len; i++) {
        var left = cirs[i].x, right = cirs[i].x+cirs[i].w;
        var top = cirs[i].y, bottom = cirs[i].y+cirs[i].h;
        if (right >= x
            && left <= x
            && bottom >= y
            && top <= y) {
            isCollision = cirs[i];
            nowPage = i;
            render();
        }
    }
    return isCollision;
}

var keysDown = {};
window.addEventListener('keydown', function(e) {
    keysDown[e.keyCode] = true;
});
window.addEventListener('keyup', function(e) {
    delete keysDown[e.keyCode];
});

function render() {
    if(canvas && canvas.getContext) {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        var siz = canvas.width > canvas.height ? canvas.height : canvas.width;
        var cornerRad = siz/(keyX*keyY);

        ctx.fillStyle="#444444";
        ctx.strokeStyle="#444444";
        ctx.lineJoin = "round";
        ctx.lineWidth = cornerRad;
        ctx.strokeRect(cornerRad/2, cornerRad/2, canvas.width-cornerRad, canvas.height-cornerRad);
        ctx.fillRect(cornerRad/2, cornerRad/2, canvas.width-cornerRad, canvas.height-cornerRad);

        for(var i = 0 ; i < (keyX*keyY); i++){
            rects[i] = {x: (canvas.width/2-(keyX/2)*siz/(keyX+2))+siz*(i%keyX)/(keyX+2), y: (canvas.height/2-(keyY/2)*siz/(keyY+2))+siz*parseInt(i/keyY)/(keyY+2), w: siz/(keyX+3), h: siz/(keyY+3)};
        }
        
        if(ctx) {
            for(var i = 0 ; i < rects.length; i++) {
                if(pressedKey[nowPage][i] > 0)
                    ctx.strokeStyle=coloredKey[nowPage][i];
                else ctx.strokeStyle=strokeColor;
                ctx.fillStyle=baseColor;
                ctx.strokeRect(rects[i].x+cornerRad/2, rects[i].y+cornerRad/2, rects[i].w-cornerRad, rects[i].h-cornerRad);
                ctx.fillRect(rects[i].x+cornerRad/2, rects[i].y+cornerRad/2, rects[i].w-cornerRad, rects[i].h-cornerRad);
                //ctx.fillRect(rects[i].x, rects[i].y, rects[i].w, rects[i].h);
            }
            for(var i = 0 ; i < chain ; i++) {
                cirs[i] = {x: rects[(i+1)*keyX-1].x+rects[0].w+cornerRad/2, y: rects[(i+1)*keyX-1].y, w: rects[(i+1)*keyX-1].w, h: rects[(i+1)*keyX-1].h};
                ctx.beginPath();
                ctx.arc(rects[(i+1)*keyX-1].x+cornerRad*(keyY+2), rects[(i+1)*keyX-1].y+cornerRad*(Math.PI), rects[(i+1)*keyX-1].w/2.5, 0, 2*Math.PI, false);
                if(nowPage == i)
                    ctx.fillStyle = 'grey';
                else
                    ctx.fillStyle = 'white';
                ctx.lineWidth = cornerRad/keyY;
                ctx.strokeStyle = '#FFFFFF';
                ctx.fill();
                ctx.stroke();
            }
            canvas.removeEventListener('click', Clicked, false);
            canvas.addEventListener('click', Clicked, false);
        }
    }
}

function animate(key){
    var siz = canvas.width > canvas.height ? canvas.height : canvas.width;
    var cornerRad = siz/(keyX*keyY);

    if(key < rects.length) {
        //ctx.clearRect(rects[key].x, rects[key].y, rects[key].w, rects[key].h);
        ctx.clearRect(rects[key].x+cornerRad/2, rects[key].y+cornerRad/2, rects[key].w-cornerRad, rects[key].h-cornerRad);
        ctx.fillStyle="#444444";
        ctx.lineJoin = "round";
        ctx.lineWidth = cornerRad;
        ctx.fillRect(rects[key].x, rects[key].y, rects[key].w, rects[key].h);

        if(pressedKey[nowPage][key] > 0)
            ctx.strokeStyle=coloredKey[nowPage][key];
        else ctx.strokeStyle=strokeColor
        ctx.fillStyle=baseColor;
        ctx.strokeRect(rects[key].x+cornerRad/2, rects[key].y+cornerRad/2, rects[key].w-cornerRad, rects[key].h-cornerRad);
        ctx.fillRect(rects[key].x+cornerRad/2, rects[key].y+cornerRad/2, rects[key].w-cornerRad, rects[key].h-cornerRad);
    }
}

function Clicked(e) {
    console.log('click: ' + e.offsetX + '/' + e.offsetY);
    var rect = collides(e.offsetX, e.offsetY);
    var cir = collides2(e.offsetX, e.offsetY);
    if(rect) {
        console.log('collision1: '+rect.x+'/'+rect.y);
    } else if(cir) {
        console.log('collision2: '+rect.x+'/'+rect.y);
    } else {
        console.log('no collision');
    }
}

window.addEventListener("keydown", function(e) {
    // 입력키 제외하고는 무시
    if(keyList.indexOf(e.keyCode) > -1) {
        if(!isNaN(audio[nowPage][keyList.indexOf(e.keyCode)][counter[nowPage][keyList.indexOf(e.keyCode)]].duration))
        {
            test2(keyList.indexOf(e.keyCode), 0);
            playAudio(nowPage, keyList.indexOf(e.keyCode));
        }
        e.preventDefault();
    }
}, false);

function playAudio(page, key) {
    if(audio[page][key][counter[page][key]])
    {
        audio[page][key][counter[page][key]].currentTime = 0;
        audio[page][key][counter[page][key]].play();
        counter[page][key] = ++counter[page][key]%keyCount[page][key];
    }
}

var keyTest = [];

function setProject() {
    projectName = document.getElementById("pName").value;

    for(var j = 0 ; j < chain; j++)
    {
        sound[j] = [];
        audio[j] = [];
        pressedKey[j] = [];
        coloredKey[j] = [];
        keyCount[j] = [];
        counter[j] = [];
        for(var i = 0 ; i < keyX*keyY; i++)
        {
            sound[j][i] = [];
            audio[j][i] = [];
            pressedKey[j][i] = 0
            coloredKey[j][i] = "#FF0000";
            keyCount[j][i] = 0;
            counter[j][i] = 0;
        }
    }

    var keyS = getData(projectName+'/keySound').split("\n");
    for(var i=0; i < keyS.length; i++)
    {
        var str = keyS[i].split(' ');
        if(str.length == 4)
        {
            var page = str[0]-1;
            var num = ((str[1]-1)*keyY)+(str[2]-1);
            sound[page][num].push(projectName+'/sounds/'+str[3]);
            audio[page][num][keyCount[page][num]] = new Audio(sound[page][num][keyCount[page][num]]);
            keyCount[page][num]++;
        }
        else continue;
    }

    info = getData(projectName+'/info').split("\n");
    for(var i = 0 ; i < info.length ; i++)
    {
        var str = info[i].split('=');
        if(str[0] == "chain")
            chain = parseInt(str[1]);
        if(str[0] == "buttonX")
            keyX = parseInt(str[1]);
        if(str[0] == "buttonY")
            keyY = parseInt(str[1]);
    }

    for(var j = 0 ; j < chain; j++)
    {
        keyTest[j] = [];
        for(var i = 0 ; i < keyX*keyY; i++)
            keyTest[j][i] = getData(projectName+'/keyLED/'+(j+1)+' '+(parseInt(i/keyY)+1)+' '+(i%keyY+1)+' 1').split('\n');
    }

    autoData = getData(projectName+'/autoPlay').split("\n");
    for(var pp = 0 ; pp < velocity.length; pp++)
        keyColor[pp] = "rgba("+velocity[pp]+",0.5)";

    render();
}

function getData(fName) {
    var xmlDoc;
    xmlhttp=new XMLHttpRequest();
    xmlhttp.open("GET", fName, false);
    xmlhttp.send();
    if(xmlhttp.readyState == 4 && xmlhttp.status == 200)
        xmlDoc=xmlhttp.responseText;
    else
        xmlDoc='';
    return xmlDoc;
}

function auto() {
    autoP = true;
    autoProcess(0);
}

function autoProcess(tt) {
    var dur = 0;
    if(tt < autoData.length && autoData.length > 0 && autoP)
    {
        var temp = autoData[tt].split(' ');
        if(temp[0] == 'c' || temp[0] == "chain")
        {
            nowPage = parseInt(temp[1])-1;
            render();
        }
        else if(temp[0] == 'd' || temp[0] == 'delay')
            dur += parseInt(temp[1]);
        else if(temp[0] == 'o')
        {
            test2((parseInt(temp[1])-1)*keyY+(parseInt(temp[2])-1), 0)
            playAudio(nowPage, (parseInt(temp[1])-1)*keyY+(parseInt(temp[2])-1));
        }
        else if(temp[0] == 'f')
            test3(((parseInt(temp[1])-1)*keyY+(parseInt(temp[2])-1), 0))

        dur--;
        if(dur < 0)
            dur = 0;
        if(dur >= 1)
            setTimeout(autoProcess,dur,++tt);
        else
            autoProcess(++tt);
    }
}

function onLED(page, key)
{
    pressedKey[page][key] = 1;
    requestAnimationFrame(function(){
        animate(key);
    });
}

function onLED2(page, key, color)
{
    pressedKey[page][key] = 1;
    if(parseInt(color) < keyColor.length)
        coloredKey[page][key] = keyColor[parseInt(color)];
    else
        coloredKey[page][key] = s2c(color);
    requestAnimationFrame(function(){
        animate(key);
    });
}

function offLED(page, key)
{
    pressedKey[page][key] = 0;
    requestAnimationFrame(function(){
        animate(key);
    });
}

var st;

function test2(key, tt) {
    var dur=0;
    var temp = keyTest[nowPage][key][tt];
    if(tt < keyTest[nowPage][key].length && temp.length > 0)
    {
        var str = temp.split(' ');
        if(str.length > 0)
        {
            if(str[0] == 'd' || str[0] == 'delay')
                dur += parseInt(str[1]);
            else if(str[0] == 'o' || str[0] == 'on')
            {
                if(str[3] == 'a' || str[3] == 'auto')
                    onLED2(nowPage, (parseInt(str[1])-1)*keyY+(parseInt(str[2])-1), str[4]);
                else
                    onLED2(nowPage, (parseInt(str[1])-1)*keyY+(parseInt(str[2])-1), str[3]);
            }
            else if(str[0] == 'f' || str[0] == 'off')
                offLED(nowPage, (parseInt(str[1])-1)*keyY+(parseInt(str[2])-1));
        }

        dur--;
        if(dur < 0)
            dur = 0;

        if(dur >= 1)
            st = setTimeout(test2,dur,key,tt+1);
        else
            test2(key, tt+1);
    }
}

function test3(key, tt) {
    var temp = keyTest[nowPage][key][tt];
    if(tt < keyTest[nowPage][key].length && temp.length > 0)
    {
        var str = temp.split(' ');
        if(str.length > 0)
            if(str[0] == 'o' || str[0] == 'f')
                offLED(nowPage, (parseInt(str[1])-1)*keyY+(parseInt(str[2])-1));

        test3(key, tt+1);
    }
}

function stopT() {
    clearTimeout(st);
    autoP = false;
}

function s2c(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
}