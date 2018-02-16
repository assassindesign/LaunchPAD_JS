// ��ư ����Ʈ 
var keyList = [65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,
    49,50,51,52,53,54,55,56,57,48,32,
    96,97,98,99,100,101,102,103,104,105,
    111,106,109,107,110,
    189,187,8,219,221,220,186,222,188,190,191,192,16];
var url = 'http://rmrouis.iptime.org:9000';
var mobile = false;
var velocity;
var opacity = ",1)";
var select, songs, LEDList;
var keyColor = [];
var pressedKey = [];
var coloredKey = [];
var oriPressedKey = [];
var oriColoredKey = [];
var keyCount = [];
var counter = [];
var baseColor = "#FFFFFF";
var strokeColor = "rgba(255,255,255,0.6)";
var sound = [];
var audio = [];
var audioInstance = [];
var autoData = [];
var cirs = [];
var cirs2 = [];
var rects = [];
var canvas;
var ctx;
var nowPage = 0;
var projectName;
var chain = 6;
var keyX = 8, keyY = 8;
var timer;
var autoP = false;
var stage;
var anim = [];
var st;

//Script for Array Initialization
if (!Array.prototype.fill) {
    Object.defineProperty(Array.prototype, 'fill', {
        value: function(value) {
            // Steps 1-2.
            if (this == null) {
            throw new TypeError('this is null or not defined');
            }
            var O = Object(this);
            // Steps 3-5.
            var len = O.length >>> 0;
            // Steps 6-7.
            var start = arguments[1];
            var relativeStart = start >> 0;
            // Step 8.
            var k = relativeStart < 0 ?
            Math.max(len + relativeStart, 0) :
            Math.min(relativeStart, len);
            // Steps 9-10.
            var end = arguments[2];
            var relativeEnd = end === undefined ?
            len : end >> 0;
            // Step 11.
            var final = relativeEnd < 0 ?
            Math.max(len + relativeEnd, 0) :
            Math.min(relativeEnd, len);
            // Step 12.
            while (k < final) {
            O[k] = value;
            k++;
            }
            // Step 13.
            return O;
        }
    });
}

// initialization
$(function() {
    var filter = "win16|win32|win64|mac";

    if(navigator.platform){
        if(0 > filter.indexOf(navigator.platform.toLowerCase())){
            //alert("Mobile");
            mobile = true;
            document.getElementById("Env").innerText = "Mobile";
        }
        else{
            //alert("PC");
            mobile = false;
            document.getElementById("Env").innerText = "PC";
        }
    }

    canvas = document.getElementById('canv');
    ctx = canvas.getContext('2d');
    stage = new createjs.Stage("canv");

    select = document.getElementById("Selector");
    getData("./Songs", function(result){
        songs = result.msg;
        for(var s = 0; s < songs.length; s++){
            var option = document.createElement('option');
            option.value = s;
            option.text = songs[s].split('\n')[0];
            select.add(option);
        }
    });

    getData("./Velocity", function(result){
        velocity = result.msg;
        document.getElementById("Velocity").innerText="Velocity:Loaded";
    });

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

function cnv2Resize() {
    canvas.width = window.innerWidth*19/20;
    canvas.height = window.innerHeight*19/20;

    initBtnEL();

    render();
}

function initBtnEL(){
    if(!mobile) {
        canvas.removeEventListener('click', Clicked, false);
        canvas.addEventListener('click', Clicked, false);
    }
    else {
        canvas.removeEventListener('touchstart', Touched);
        canvas.addEventListener('touchstart', Touched);
    }
}

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
            if(audio[nowPage][i][counter[nowPage][i]])
            {
                if(keyTest[nowPage][i].length > 0)
                    keyLED1(i, counter[nowPage][i], 0)
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
            initz();
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
        ctx.shadowBlur=0;
        ctx.shadowColor="transparent";
        var siz = canvas.width > canvas.height ? canvas.height : canvas.width;
        var cornerRad = siz/(keyX*keyY);


        ctx.fillStyle="#444444";
        ctx.strokeStyle="#444444";
        ctx.lineJoin = "round";
        ctx.lineWidth = cornerRad/(keyY*0.15);
        ctx.strokeRect(cornerRad/2, cornerRad/2, canvas.width-cornerRad, canvas.height-cornerRad);
        ctx.fillRect(cornerRad/2, cornerRad/2, canvas.width-cornerRad, canvas.height-cornerRad);

        for(var i = 0 ; i < (keyX*keyY); i++){
            rects[i] = {x: (canvas.width/2-(keyX/2)*siz/(keyX+1))+siz*(i%keyX)/(keyX+2), y: (canvas.height/2-(keyY/2)*siz/(keyY+2))+siz*parseInt(i/keyY)/(keyY+2), w: siz/(keyX+3), h: siz/(keyY+3)};
        }
        
        if(ctx) {
            for(var i = 0 ; i < rects.length; i++) {
                ctx.strokeStyle=strokeColor;
                ctx.fillStyle=baseColor;
                ctx.strokeRect(rects[i].x+cornerRad/2, rects[i].y+cornerRad/2, rects[i].w-cornerRad, rects[i].h-cornerRad);
                ctx.fillRect(rects[i].x+cornerRad/2, rects[i].y+cornerRad/2, rects[i].w-cornerRad, rects[i].h-cornerRad);
                ctx.shadowBlur=0;
                ctx.shadowColor="transparent";
            }
            for(var i = 0 ; i < chain ; i++) {
                cirs[i] = {x: rects[(i+1)*keyX-1].x+rects[0].w+cornerRad/2, y: rects[(i+1)*keyX-1].y, w: rects[(i+1)*keyX-1].w, h: rects[(i+1)*keyX-1].h};
                ctx.beginPath();
                ctx.arc(rects[(i+1)*keyX-1].x+cornerRad*(keyY+2), rects[(i+1)*keyX-1].y+cornerRad*(Math.PI), rects[(i+1)*keyX-1].w/2.5, 0, 2*Math.PI, false);
                if(nowPage == i)
                    ctx.fillStyle = 'rgba(0,255,255,0.75)';
                else
                    ctx.fillStyle = 'white';
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth=cornerRad/(keyY*0.5);
                ctx.fill();
                ctx.stroke();
            }
        }
    }

    // When Use EaselJS
    // if(canvas && stage){
    //     stage.removeAllChildren();
    //     stage.clear();

    //     var siz = canvas.width > canvas.height ? canvas.height : canvas.width;
    //     var cornerRad = siz/(keyX*keyY);

    //     bg = new createjs.Shape();
    //     bg.graphics.beginFill("#444444");
    //     bg.graphics.drawRoundRect(cornerRad/2, cornerRad/2, canvas.width-cornerRad, canvas.height-cornerRad, cornerRad);
    //     stage.addChild(bg);

    //     for(var i = 0 ; i < (keyX*keyY); i++){
    //         rects[i] = {x: (canvas.width/2-(keyX/2)*siz/(keyX+1))+siz*(i%keyX)/(keyX+2), y: (canvas.height/2-(keyY/2)*siz/(keyY+2))+siz*parseInt(i/keyY)/(keyY+2), w: siz/(keyX+3), h: siz/(keyY+3)};
    //     }

    //     for(var i = 0 ; i < chain; i++){
    //         cirs[i] = {x: rects[(i+1)*keyX-1].x+rects[0].w+cornerRad/2, y: rects[(i+1)*keyX-1].y, w: rects[(i+1)*keyX-1].w, h: rects[(i+1)*keyX-1].h};
    //         cirs2[i] = {x: cirs[i].x+rects[0].w/2, y:cirs[i].y+rects[0].h/2, w:(cirs[i].w-cornerRad/2)/2, h:(cirs[i].w-cornerRad/2)/2};
    //     }

    //     for(var i = 0; i < rects.length; i++) {
    //         var drect = new createjs.Shape();
    //         drect.graphics.setStrokeStyle(cornerRad*4/5, "round", "round", cornerRad);
    //         drect.graphics.beginStroke(strokeColor);
    //         drect.graphics.beginFill(baseColor);
    //         drect.graphics.drawRect(rects[i].x+cornerRad/2, rects[i].y+cornerRad/2, rects[i].w-cornerRad, rects[i].h-cornerRad);
    //         stage.addChild(drect);
    //     }
    //     for(var i = 0 ; i < chain; i++) {
    //         var dcir = new createjs.Shape();
    //         dcir.graphics.setStrokeStyle(cornerRad/2);
    //         dcir.graphics.beginStroke(strokeColor);
    //         if(nowPage == i)
    //             dcir.graphics.beginFill('rgba(0,255,255,0.75)');
    //         else
    //             dcir.graphics.beginFill(baseColor);
    //         dcir.graphics.drawCircle(cirs[i].x+rects[0].w/2, cirs[i].y+rects[0].h/2, (cirs[i].w-cornerRad/2)/2);
    //         stage.addChild(dcir);
    //     }

    //     for(var i = 0 ; i < rects.length; i++){
    //         stage.removeChild(anim[i]);
    //         if(pressedKey[nowPage][i]>0) {
    //             anim[i] = new createjs.Shape();
    //             // anim[key].graphics.setStrokeStyle(cornerRad/1.75, "round", "round", cornerRad);
    //             // anim[key].graphics.beginStroke(coloredKey[nowPage][key]);
    //             // anim[key].graphics.beginFill("transparent");
    //             // anim[key].graphics.drawRect(rects[key].x+cornerRad, rects[key].y+cornerRad, rects[key].w-cornerRad*2, rects[key].h-cornerRad*2);
    //             anim[i].graphics.setStrokeStyle(cornerRad/1.75, "round", "round", cornerRad).beginStroke(coloredKey[nowPage][i]).beginFill("transparent").drawRect(rects[i].x+cornerRad, rects[i].y+cornerRad, rects[i].w-cornerRad*2, rects[i].h-cornerRad*2);
    //             anim[i].shadow = new createjs.Shadow(coloredKey[nowPage][i], 0, 0, cornerRad);
    //             stage.addChild(anim[i]);
    //         }
    //     }
    //     stage.update();
    // }
}

function animate(key){
    var siz = canvas.width > canvas.height ? canvas.height : canvas.width;
    var cornerRad = siz/(keyX*keyY);
    ctx.shadowBlur=0;
    ctx.shadowColor="transparent";

    if(key < rects.length) {
        ctx.clearRect(rects[key].x+cornerRad/2, rects[key].y+cornerRad/2, rects[key].w-cornerRad, rects[key].h-cornerRad);
        ctx.fillStyle="#444444";
        ctx.lineJoin = "round";
        ctx.lineWidth = cornerRad/(keyY*0.15);
        ctx.fillRect(rects[key].x, rects[key].y, rects[key].w, rects[key].h);

        ctx.strokeStyle=strokeColor;
        ctx.fillStyle=baseColor;
        ctx.strokeRect(rects[key].x+cornerRad/2, rects[key].y+cornerRad/2, rects[key].w-cornerRad, rects[key].h-cornerRad);
        ctx.fillRect(rects[key].x+cornerRad/2, rects[key].y+cornerRad/2, rects[key].w-cornerRad, rects[key].h-cornerRad);
        if(pressedKey[nowPage][key]>0)
        {
            ctx.lineJoin="round";
            ctx.lineWidth = cornerRad/(keyY*0.25);
            ctx.strokeStyle=coloredKey[nowPage][key];
            ctx.shadowBlur=cornerRad;
            ctx.shadowColor=coloredKey[nowPage][key];//"rgba(0,0,0,0.66)";
            ctx.strokeRect(rects[key].x+cornerRad, rects[key].y+cornerRad, rects[key].w-cornerRad*2, rects[key].h-cornerRad*2)
        }
    }


    // when use EaselJS
    // var siz = canvas.width > canvas.height ? canvas.height : canvas.width;
    // var cornerRad = siz/(keyX*keyY);
    
    // stage.removeChild(anim[key]);
    // if(pressedKey[nowPage][key]>0) {
    //     anim[key] = new createjs.Shape();
    //     // anim[key].graphics.setStrokeStyle(cornerRad/1.75, "round", "round", cornerRad);
    //     // anim[key].graphics.beginStroke(coloredKey[nowPage][key]);
    //     // anim[key].graphics.beginFill("transparent");
    //     // anim[key].graphics.drawRect(rects[key].x+cornerRad, rects[key].y+cornerRad, rects[key].w-cornerRad*2, rects[key].h-cornerRad*2);
    //     anim[key].graphics.setStrokeStyle(cornerRad/1.75, "round", "round", cornerRad).beginStroke(coloredKey[nowPage][key]).beginFill("transparent").drawRect(rects[key].x+cornerRad, rects[key].y+cornerRad, rects[key].w-cornerRad*2, rects[key].h-cornerRad*2);
    //     anim[key].shadow = new createjs.Shadow(coloredKey[nowPage][key], 0, 0, cornerRad);
    //     stage.addChild(anim[key]);
    // }
    // stage.update();
}

function Touched(ev){
    var touch;
    touch = ev.touches;
    for(ii = 0 ; ii < touch.length; ii++)
    {
        collides(touch[ii].pageX, touch[ii].pageY);
        collides2(touch[ii].pageX, touch[ii].pageY);
    }
}

function Clicked(e) {
    collides(e.offsetX, e.offsetY);
    collides2(e.offsetX, e.offsetY);
}

window.addEventListener("keydown", function(e) {
    if(keyList.indexOf(e.keyCode) > -1) {
        if(audio[nowPage][keyList.indexOf(e.keyCode)][counter[nowPage][keyList.indexOf(e.keyCode)]])
        {
            var keyNum = keyList.indexOf(e.keyCode);
            if(keyTest[nowPage][keyNum].length > 0)
                keyLED1(keyNum, counter[nowPage][keyNum], 0);
            playAudio(nowPage, keyNum);
        }
        e.preventDefault();
    }
}, false);

function playAudio(page, key) {
    if(audio[page][key][counter[page][key]])
    {
        createjs.Sound.play(audio[page][key][counter[page][key]],0,0,0);
        counter[page][key] = (counter[page][key]+1)%keyCount[page][key];
    }
}

var keyTest = [];

function LoadingStatus(){
    document.getElementById("Info").innerTex="Info:Loading";
    document.getElementById("KeySound").innerText="KeySound:Loading";
    document.getElementById("LEDList").innerText="LEDList:Loading";
    document.getElementById("AutoData").innerText="AutoData:Loading";
}

function setProject() {
    // createjs.Ticker.on("tick", render);
    // createjs.Ticker.framerate = 60;
    stopT();
    projectName = songs[select.selectedIndex];
    nowPage = 0;
    LoadingStatus();

    rects.length = 0;
    cirs.length = 0;
    cirs2.length = 0;

    getData(projectName+'/info', function(result){
        info = result.msg;
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

        sound.length = 0;
        audio.length = 0;
        pressedKey.length = 0;
        coloredKey.length = 0;
        keyCount.length = 0;
        counter.length = 0;
        keyTest.length=0;
        audioInstance.length=0;
        for(var j = 0 ; j < chain; j++)
        {
            sound[j] = [];
            audio[j] = [];
            pressedKey[j] = [];
            coloredKey[j] = [];
            keyCount[j] = [];
            counter[j] = [];
            keyTest[j] = [];
            for(var i = 0 ; i < keyX*keyY; i++)
            {
                sound[j][i] = [];
                audio[j][i] = [];
                pressedKey[j][i] = 0
                coloredKey[j][i] = "#FF0000";
                keyCount[j][i] = 0;
                counter[j][i] = 0;
                keyTest[j][i] = [];
            }
        }
        document.getElementById("Info").innerText="Info:Loaded";

        ctx.clearRect(0,0,canvas.width,canvas.height);
        initBtnEL();

        getData(projectName+'/keySound', function(result){
            var keyS = result.msg;
            for(var i=0; i < keyS.length; i++)
            {
                var str = keyS[i].split(' ');
                if(str.length == 4)
                {
                    var page = parseInt(str[0])-1;
                    var num = ((parseInt(str[1])-1)*keyY)+(parseInt(str[2])-1);
                    sound[page][num].push(projectName+'/sounds/'+str[3]);
                    audio[page][num][keyCount[page][num]] = str[3];
                    createjs.Sound.registerSound(sound[page][num][keyCount[page][num]], audio[page][num][keyCount[page][num]], 1);
                     keyCount[page][num]++;
                }
                else continue;
            }
            document.getElementById("KeySound").innerText="KeySound:Loaded";
        });
        
        getData(projectName+"/LEDList", function(result){
            LEDList = result.msg;
    
            for(var p = 0 ; p < LEDList.length; p++)
            {
                (function(p){
                    var tmp = LEDList[p].split(' ');
                    getData(projectName+"/keyLED/"+LEDList[p], function(result){
                        var pNum = parseInt(tmp[0])-1;
                        var keyNum = (parseInt(tmp[1])-1)*keyX+(parseInt(tmp[2])-1);
                        keyTest[pNum][keyNum].push(result.msg);
                        var keyCnt = keyTest[pNum][keyNum].length-1;
                        for(ir=0; ir<parseInt(tmp[3])-1; ir++)
                            keyTest[pNum][keyNum][keyCnt] = keyTest[pNum][keyNum][keyCnt].concat(result.msg);
                    });
                })(p);
            }
            document.getElementById("LEDList").innerText="LEDList:Loaded";
        });
    
        autoData.length=0;
        keyColor.length=0;
    
        for(var pp = 0 ; pp < velocity.length; pp++)
            keyColor[pp] = "rgba("+velocity[pp]+opacity;
    
        getData(projectName+'/autoPlay', function(result){
            autoData = result.msg;
            document.getElementById("AutoData").innerText="AutoData:Loaded";
        });
    
        oriPressedKey.length=0;
        oriColoredKey.length=0;
        for(var i=0; i<chain; i++)
        {
            oriPressedKey[i] = [];
            oriColoredKey[i] = [];
            for(var j=0; j<keyX*keyY; j++)
            {
                oriPressedKey[i][j] = 0;
                oriColoredKey[i][j] = strokeColor;
            }
        }
    
        stopT();
    });
}

function getData(fName, callback) {
    var msg = JSON.stringify(fName);

    jQuery.ajax({
        url: url,
        data: {'msg':msg},
        dataType: "jsonp",
        success: function(data){
            callback(data);
        }
    });
}

function auto() {
    console.log(keyTest);
    stopT();
    autoP = true;
    autoProcess(0);
}

function initz() {
    pressedKey[nowPage].fill(0);
    coloredKey[nowPage].fill(strokeColor);
    render();
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
            //initz();
        }
        else if(temp[0] == 'd' || temp[0] == 'delay')
            dur += parseInt(temp[1]);
        else if(temp[0] == 'o')
        {
            var keyNum = (parseInt(temp[1])-1)*keyY+(parseInt(temp[2])-1);
            if(keyTest[nowPage][keyNum].length > 0)
                keyLED1(keyNum, counter[nowPage][keyNum], 0);
            playAudio(nowPage, keyNum);
        }
        else if(temp[0] == 'f')

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

function keyLED1(key, cnt, tt) {
    var dur=0;

    var temp = keyTest[nowPage][key][cnt];
    if(typeof temp == 'undefined')
        cnt = 0;
    
    temp = keyTest[nowPage][key][cnt][tt];
    
    if(tt < keyTest[nowPage][key][cnt].length)
    {
        var str = temp.split(' ');

        if(str.length > 0) {
            if(str[0] == 'd' || str[0] == 'delay')
                dur += parseInt(str[1]);
            else if(str[0] == 'o' || str[0] == 'on')
                if(str[3] == 'a' || str[3] == 'auto')
                    onLED2(nowPage, (parseInt(str[1])-1)*keyY+(parseInt(str[2])-1), str[4]);
                else
                    onLED2(nowPage, (parseInt(str[1])-1)*keyY+(parseInt(str[2])-1), str[3]);
            else if(str[0] == 'f' || str[0] == 'off')
                offLED(nowPage, (parseInt(str[1])-1)*keyY+(parseInt(str[2])-1));
        }

        dur--;
        if(dur < 0)
            dur = 0;

        if(dur >= 1)
            st = setTimeout(keyLED1,dur,key,cnt,tt+1);
        else
            keyLED1(key, cnt, tt+1);
    }
}

function keyLED2(key, tt) {
    var temp = keyTest[nowPage][key][counter[nowPage][key]][tt];
    if(tt < keyTest[nowPage][key][counter[nowPage][key]].length && temp.length > 0)
    {
        var str = temp.split(' ');
        if(str.length > 0)
            if(str[0] == 'o' || str[0] == 'f' || str[0] == 'on' || str[0] == 'off')
                offLED(nowPage, (parseInt(str[1])-1)*keyY+(parseInt(str[2])-1));

        keyLED2(key, tt+1);
    }
}

function stopT() {
    clearTimeout(st);
    autoP = false;
    initz();
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