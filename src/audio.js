// on 8x8, list of keyboard matching buttons list
var keyList = [65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,
    49,50,51,52,53,54,55,56,57,48,32,
    96,97,98,99,100,101,102,103,104,105,
    111,106,109,107,110,
    189,187,8,219,221,220,186,222,188,190,191,192,16];
var url = 'http://127.0.0.1:9000'; //server address
var mobile = false;                         //mobile status identifier
var velocity;                               //color number
var opacity = ",1)";                        //opacity postfix
var select, songs, LEDList;                 //selected song, song list, song's LED list
var keyColor = [];                          //button velocity
var pressedKey = [];                        //pressing status idf
var coloredKey = [];                        //button LED Color
var oriPressedKey = [];                     
var oriColoredKey = [];                     //arr for init keys
var keyCount = [];                          //number of same button's sample
var counter = [];                           //press counter
var baseColor = "#FFFFFF";                  //base Color, dark gray
var strokeColor = "rgba(255,255,255,0.6)";  //outer of button color, light gray
var sound = [];                             //sample's url
var audio = [];                             //audio obj
var audioInstance = [];                     //arr for control audio obj
var autoData = [];                          //auto process data
var cirs = [];                              //page button position
var cirs2 = [];                             //page button obj
var rects = [];                             //button obj
var anim = [];                              //button LED animation arr
var canvas;                                 
var nowPage = 0;
var projectName;                            //Song name
var chain = 6;                              //Number of pages
var keyX = 8, keyY = 8;                     //Number of button
var timer;                                  //var for dynamic canvas size
var autoP = false;                          //auto process status
var stage;                                  //var for easelJS canvas control
var st;                                     //setTimer var
var keyTest = [];                           //for LEDList Test

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

// Application initialization
$(function() {
    var filter = "win16|win32|win64|mac";

    // on mobile env, for support multi touch, identify device status
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
            createjs.Ticker.on("tick", animate);
            createjs.Ticker.framerate = 48;
        }
    }

    // get canvas, context, stage
    canvas = document.getElementById('canv');
    ctx = canvas.getContext('2d');
    stage = new createjs.Stage("canv");

    // get Combo Box ctx
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

    // set LED Color
    getData("./Velocity", function(result){
        velocity = result.msg;
        document.getElementById("Velocity").innerText="Velocity:Loaded";
    });

    // initialize all arrays
    arrinit();
});

// if browser size change, dynamically set size to fit browsers'
function cnv2Resize() {
    canvas.width = window.innerWidth*19/20;
    canvas.height = window.innerHeight*19/20;

    initBtnEL();

    render();
}

// initialize touch/click listener
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

// onload process : set canvas size, add listener to check browser size changing
window.onload = function() {
    cnv2Resize();
    window.addEventListener('resize',function(){
        clearTimeout(timer);
        timer = setTimeout(cnv2Resize, 300);
    }, false);
}

// button click/touch offset checker
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

// page button's
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

// keyDown/Up listener
var keysDown = {};
window.addEventListener('keydown', function(e) {
    keysDown[e.keyCode] = true;
});
window.addEventListener('keyup', function(e) {
    delete keysDown[e.keyCode];
});

// Launchpad Canvas Renderer
function render() {
    if(canvas && stage){
        stage.removeAllChildren();
        stage.clear();

        var siz = canvas.width > canvas.height ? canvas.height : canvas.width;
        var cornerRad = siz/(keyX*keyY);

        // for background
        bg = new createjs.Shape();
        bg.graphics.beginFill("#444444");   // dark gray color
        bg.graphics.drawRoundRect(cornerRad/2, cornerRad/2, canvas.width-cornerRad, canvas.height-cornerRad, cornerRad);
        stage.addChild(bg);

        // set buttons offset
        for(var i = 0 ; i < (keyX*keyY); i++){
            rects[i] = {x: (canvas.width/2-(keyX/2)*siz/(keyX+1))+siz*(i%keyX)/(keyX+2), y: (canvas.height/2-(keyY/2)*siz/(keyY+2))+siz*parseInt(i/keyY)/(keyY+2), w: siz/(keyX+3), h: siz/(keyY+3)};
        }

        for(var i = 0 ; i < chain; i++){
            cirs[i] = {x: rects[(i+1)*keyX-1].x+rects[0].w+cornerRad/2, y: rects[(i+1)*keyX-1].y, w: rects[(i+1)*keyX-1].w, h: rects[(i+1)*keyX-1].h};
            cirs2[i] = {x: cirs[i].x+rects[0].w/2, y:cirs[i].y+rects[0].h/2, w:(cirs[i].w-cornerRad/2)/2, h:(cirs[i].w-cornerRad/2)/2};
        }

        // draw all buttons
        for(var i = 0; i < rects.length; i++) {
            var drect = new createjs.Shape();
            drect.graphics.setStrokeStyle(cornerRad*4/5, "round", "round", cornerRad);
            drect.graphics.beginStroke(strokeColor);
            drect.graphics.beginFill(baseColor);
            drect.graphics.drawRect(rects[i].x+cornerRad/2, rects[i].y+cornerRad/2, rects[i].w-cornerRad, rects[i].h-cornerRad);
            stage.addChild(drect);
        }
        for(var i = 0 ; i < chain; i++) {
            var dcir = new createjs.Shape();
            dcir.graphics.setStrokeStyle(cornerRad/2);
            dcir.graphics.beginStroke(strokeColor);
            if(nowPage == i)
                dcir.graphics.beginFill('rgba(0,255,255,0.75)');
            else
                dcir.graphics.beginFill(baseColor);
            dcir.graphics.drawCircle(cirs[i].x+rects[0].w/2, cirs[i].y+rects[0].h/2, (cirs[i].w-cornerRad/2)/2);
            stage.addChild(dcir);
        }
        stage.update();
    }
}

// PC animation Process
function animate(){
    var siz = canvas.width > canvas.height ? canvas.height : canvas.width;
    var cornerRad = siz/(keyX*keyY);

    //pressed buttons outter get glow
    for(var i = 0 ; i < rects.length; i++){
        stage.removeChild(anim[i]);
        if(pressedKey[nowPage][i]>0) {
            anim[i] = new createjs.Shape();
            // anim[key].graphics.setStrokeStyle(cornerRad/1.75, "round", "round", cornerRad);
            // anim[key].graphics.beginStroke(coloredKey[nowPage][key]);
            // anim[key].graphics.beginFill("transparent");
            // anim[key].graphics.drawRect(rects[key].x+cornerRad, rects[key].y+cornerRad, rects[key].w-cornerRad*2, rects[key].h-cornerRad*2);
                // Below code same as above 4 line, but performance is much much better
                // Inner Glow Version
            // anim[i].graphics.setStrokeStyle(cornerRad/2, "round", "round", cornerRad).beginStroke(coloredKey[nowPage][i]).beginFill("transparent").drawRect(rects[i].x+cornerRad, rects[i].y+cornerRad, rects[i].w-cornerRad*2, rects[i].h-cornerRad*2);
            // anim[i].shadow = new createjs.Shadow(coloredKey[nowPage][i], 0, 0, cornerRad*2);
                // Outer Glow Version
            anim[i].graphics.setStrokeStyle(cornerRad/2, "round", "round", cornerRad).beginStroke(coloredKey[nowPage][i]).beginFill("transparent").drawRect(rects[i].x+cornerRad/3, rects[i].y+cornerRad/3, rects[i].w-cornerRad*2/3, rects[i].h-cornerRad*2/3);
            anim[i].shadow = new createjs.Shadow(coloredKey[nowPage][i], 0, 0, cornerRad*2);
            stage.addChild(anim[i]);
        }
        else continue;
    }
    stage.update();
}

// Mobile animation Process
function animatecanv(key){
    var siz = canvas.width > canvas.height ? canvas.height : canvas.width;
    var cornerRad = siz/(keyX*keyY);

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
            ctx.strokeRect(rects[key].x+cornerRad/3, rects[key].y+cornerRad/3, rects[key].w-cornerRad*2/3, rects[key].h-cornerRad*2/3);
        }
    }
}

// Mobile Touch process, allow multi touches
function Touched(ev){
    var touch;
    touch = ev.touches;
    for(ii = 0 ; ii < touch.length; ii++)
    {
        collides(touch[ii].pageX, touch[ii].pageY);
        collides2(touch[ii].pageX, touch[ii].pageY);
    }
}

// PC Click process
function Clicked(e) {
    collides(e.offsetX, e.offsetY);
    collides2(e.offsetX, e.offsetY);
}

// PC Button Keyboard Input Listener
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

// Audio Play Process
function playAudio(page, key) {
    if(audio[page][key][counter[page][key]])
    {
        createjs.Sound.play(audio[page][key][counter[page][key]],0,0,0);
        counter[page][key] = (counter[page][key]+1)%keyCount[page][key];
    }
}

// Set all Text Loading
function LoadingStatus(){
    document.getElementById("Info").innerTex="Info:Loading";
    document.getElementById("KeySound").innerText="KeySound:Loading";
    document.getElementById("LEDList").innerText="LEDList:Loading";
    document.getElementById("AutoData").innerText="AutoData:Loading";
}

// set project
function setProject() {
    stopT();    // if autoplay process turned on, then off
    projectName = songs[select.selectedIndex];
    nowPage = 0;
    LoadingStatus();    // set all message to loading

    rects.length = 0;
    cirs.length = 0;
    cirs2.length = 0;

    //get all data
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
        arrinit();
        document.getElementById("Info").innerText="Info:Loaded";

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
    
        for(var pp = 0 ; pp < velocity.length; pp++){
            velocity[pp] = velocity[pp].replace(/\./gi,',');
            keyColor[pp] = "rgba("+velocity[pp]+opacity;
        }
    
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

// to get data, use AJAX
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
    stopT();
    autoP = true;
    autoProcess(0);
}

// autoPlay Process
function autoProcess(tt) {
    var dur = 0;
    if(tt < autoData.length && autoData.length > 0 && autoP)
    {
        //get data & split
        var temp = autoData[tt].split(' ');
        var tCase = temp[0].toLowerCase();
        //if need change page
        if(tCase == 'c' || tCase == "chain")
        {
            nowPage = parseInt(temp[1])-1;
            //render();
            // If want initialize button colors when page changed
            initz();
        }
        //if need duration to autoplay
        else if(tCase == 'd' || tCase == 'delay')
            dur += parseInt(temp[1]);
        //LED On
        else if(tCase == 'o')
        {
            var keyNum = (parseInt(temp[1])-1)*keyY+(parseInt(temp[2])-1);
            if(keyTest[nowPage][keyNum].length > 0)
                keyLED1(keyNum, counter[nowPage][keyNum], 0);
            playAudio(nowPage, keyNum);
        }
        //LED Off
        else if(tCase == 'f')

        //Recursively Turn on/off LED
        dur--;
        if(dur < 0)
            dur = 0;
        if(dur >= 1)
            setTimeout(autoProcess,dur,++tt);
        else
            autoProcess(++tt);
    }
}

//LED ON(without color)
function onLED(page, key) {
    pressedKey[page][key] = 1;
    if(mobile){
        requestAnimationFrame(function(){
            animatecanv(key);
        });
    }
}

//LED ON(with color)
function onLED2(page, key, color)
{
    pressedKey[page][key] = 1;
    if(parseInt(color) < keyColor.length)
        coloredKey[page][key] = keyColor[parseInt(color)];
    else    //if color is out of velocity, change color code to RGB
        coloredKey[page][key] = s2c(color);

    if(mobile){
        requestAnimationFrame(function(){
            animatecanv(key);
        });
    }
}

//LED OFF
function offLED(page, key) {
    pressedKey[page][key] = 0;
    if(mobile){
        requestAnimationFrame(function(){
            animatecanv(key);
        });
    }
}

//LED set Process
function keyLED1(key, cnt, tt) {
    var dur=0;

    var temp = keyTest[nowPage][key][cnt];
    //if there isn't LEDSET
    if(typeof temp == 'undefined')
        cnt = 0;
    
    temp = keyTest[nowPage][key][cnt][tt];
    
    if(tt < keyTest[nowPage][key][cnt].length)
    {
        var str = temp.split(' ');
        var sCase = str[0].toLowerCase();   //string checker

        //similar to autoprocess
        if(str.length > 0) {
            if(sCase == 'd' || sCase == 'delay')
                dur += parseInt(str[1]);
            else if(sCase == 'o' || sCase == 'on')
                if(str[3].toLowerCase() == 'a' || str[3].toLowerCase() == 'auto')
                    onLED2(nowPage, (parseInt(str[1])-1)*keyY+(parseInt(str[2])-1), str[4]);
                else
                    onLED2(nowPage, (parseInt(str[1])-1)*keyY+(parseInt(str[2])-1), str[3]);
            else if(sCase == 'f' || sCase == 'off')
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

//code for off the keyLED.. but not use
function keyLED2(key, tt) {
    var temp = keyTest[nowPage][key][counter[nowPage][key]][tt];
    if(tt < keyTest[nowPage][key][counter[nowPage][key]].length && temp.length > 0)
    {
        var str = temp.split(' ');
        var sCase = str[0].toLowerCase();
        if(str.length > 0)
            if(sCase == 'o' || sCase == 'f' || sCase == 'on' || sCase == 'off')
                offLED(nowPage, (parseInt(str[1])-1)*keyY+(parseInt(str[2])-1));

        keyLED2(key, tt+1);
    }
}

//stop auto process
function stopT() {
    //all timer out
    clearTimeout(st);
    autoP = false;
    initz();
}

//color chage code
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

// init all arrays
function arrinit() {
    sound.length = 0;
    audio.length = 0;
    pressedKey.length = 0;
    coloredKey.length = 0;
    keyCount.length = 0;
    counter.length = 0;
    keyTest.length=0;
    audioInstance.length=0;
    anim.length=0;
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
}

//button led initializer
function initz() {
    pressedKey[nowPage].fill(0);
    coloredKey[nowPage].fill(strokeColor);
    render();
}