// on 8x8, list of keyboard matching buttons list
var url = 'http://127.0.0.1:9000'; //server address
var mobile = false;                         //mobile status identifier
var IE = false;
var velocity;                               //color number
var opacity = ",1)";                        //opacity postfix
var select, songs, LEDList;                 //selected song, song list, song's LED list
var keyColor = [];                          //button velocity
var pressedKey = [];                        //pressing status idf
var coloredKey = [];                        //button LED Color
var keyCount = [];                          //number of same button's sample
var counter = [];                           //press counter
var baseColor = "#FFFFFF";                  //base Color, dark gray
var strokeColor = "rgba(255,255,255,0.65)";  //outer of button color, light gray
var sound = [];                             //sample's url
var audio = [];                             //audio obj
var autoData = [];                          //auto process data
var cirs = [];                              //page button position
var rects = [];                             //button obj
var rects2 = [];
var velrects = [];
var veldrects = [];
var anim = [];                              //button LED animation arr
var drect = [];
var drect2 = [];
var dcir = [];
var bg, bg2;
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

var autoE;
var keyE;
var ledE;

var vt = [];                                //velocity text
var oSelector=0;
var oIdx;
var oDesc;
var sInfo;
var cnode = [];
var cspan = [];
var cspace = [];
var creset = [];
var sList = [];
var lstring = [];
var ablob = [];
var dirs = [];
var zip;
var choosedcolor = 0;
var pageKeyColor = [];
var choosedkey;
var keyLEDList = [];
var upKeyList = [];

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
window.onload = function() {
    var filter = "win16|win32|win64|mac";
    // Opera 8.0+
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== 'undefined';
    // Safari 3.0+ "[object HTMLElementConstructor]" 
    var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    // Edge 20+
    var isEdge = !isIE && !!window.StyleMedia;
    // Chrome 1+
    var isChrome = !!window.chrome && !!window.chrome.webstore;
    // Blink engine detection
    var isBlink = (isChrome || isOpera) && !!window.CSS;

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
            if(!isIE && !isEdge){
                IE = false;
                createjs.Ticker.on("tick", render);
                createjs.Ticker.framerate = 144;
            }
            else{
                IE = true;
                if(isIE)
                    alert("Audio almost not working well on IE...\nplease use other browser T^T\nSorry")
            }
        }
    }

    if(!mobile){
        // get canvas, context, stage
        canvas = document.getElementById('canv');
        ctx = canvas.getContext('2d');
        stage = new createjs.Stage("canv");

        autoE = document.getElementById("autoEditor");
        keyE = document.getElementById("keyEditor");
        ledE = document.getElementById("ledEditor");

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
            keyColor.length=0;
            for(var pp = 0 ; pp < velocity.length; pp++){
                velocity[pp] = velocity[pp].replace(/\./gi,',');
                keyColor[pp] = "rgba("+velocity[pp]+opacity;
            }
            // initialize all arrays
            arrinit();
            cnv2Resize();
            window.addEventListener('resize',function(){
                clearTimeout(timer);
                timer = setTimeout(cnv2Resize, 300);
            }, false);
            document.getElementById("Velocity").innerText="Velocity:Loaded";
        });
    }
    else
        alert("Mobile is not supported")
}

// if browser size change, dynamically set size to fit browsers'
function cnv2Resize() {
    canvas.width = window.innerWidth*19/20;
    canvas.height = window.innerHeight*19/40;

    initBtnEL();

    render();
}

// initialize touch/click listener
function initBtnEL(){
    if(!mobile) {
        canvas.removeEventListener('click', Clicked, false);
        canvas.addEventListener('click', Clicked, false);
    }
}

// PC Click process
function Clicked(e) {
    collides(e.offsetX, e.offsetY);
    collides2(e.offsetX, e.offsetY);
    collides3(e.offsetX, e.offsetY);
    collides4(e.offsetX, e.offsetY);
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
            
            if(event.ctrlKey){
                myFunction(nowPage, i);
                choosedkey = -1;
            }
            else{
                initz();
                choosedkey = i;
                var ckstring = "Page:"+(nowPage+1)+" Button:"+parseInt(i/8+1)+","+(i%8+1)+"-"+counter[nowPage][i];
                if(!keyTest[nowPage][choosedkey][counter[nowPage][choosedkey]])
                    keyTest[nowPage][choosedkey][counter[nowPage][choosedkey]] = [];
                if(keyTest[nowPage][i][counter[nowPage][i]])
                    ledE = setOptList(ledE, keyTest[nowPage][i][counter[nowPage][i]]);
                if(keyTest[nowPage][i].length > 0)
                    keyLED1(nowPage, i, counter[nowPage][i], 0)
                if(sound[nowPage][i][counter[nowPage][i]]){
                    playAudio(nowPage,i);
                    ckstring = ckstring.concat(" Duration:"+sound[nowPage][i][counter[nowPage][i]].duration);
                }
                document.getElementById("choosedKeyStat").innerText = ckstring;
            }
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
            render();
        }
    }
    return isCollision;
}

function collides3(x, y) {
    var isCollision = false;
    for (var i = 0, len = rects2.length; i < len; i++) {
        var left = rects2[i].x, right = rects2[i].x+rects2[i].w;
        var top = rects2[i].y, bottom = rects2[i].y+rects2[i].h;
        if (right >= x
            && left <= x
            && bottom >= y
            && top <= y) {
            isCollision = rects2[i];
            if(!event.ctrlKey){
                pageKeyColor[nowPage][i] = keyColor[choosedcolor];
                var stest = "on "+parseInt(i/8+1)+" "+(i%8+1)+" a "+choosedcolor;
                var kt = keyTest[nowPage][choosedkey][counter[nowPage][choosedkey]];
                kt.push(stest);
                //keyLEDList[nowPage][choosedkey].push((nowPage+1)+" "+(parseInt(i/8)+1)+" "+((i%8)+1));
                ledE = setOptList(ledE, kt);
            }
            else {
                var stest = "off "+parseInt(i/8+1)+" "+(i%8+1);
                pageKeyColor[nowPage][i] = baseColor;
                var kt = keyTest[nowPage][choosedkey][counter[nowPage][choosedkey]];
                kt.push(stest);
                ledE = setOptList(ledE, kt);
            }
        }
    }
    return isCollision;
}

function collides4(x, y) {
    var isCollision = false;
    for (var i = 0, len = velrects.length; i < len; i++) {
        var left = velrects[i].x, right = velrects[i].x+velrects[i].w;
        var top = velrects[i].y, bottom = velrects[i].y+velrects[i].h;
        if (right >= x
            && left <= x
            && bottom >= y
            && top <= y) {
            isCollision = velrects[i];
            choosedcolor = i;
        }
    }
    return isCollision;
}

function myFunction(x, y) {
    for(var i = 0 ; i < cspace.length; i++)
        for(var j = 0 ; j < cspace[i].length; j++)
            if(cspace[i][j].className.toLowerCase() == 'popuptext show')
                cspace[i][j].classList.toggle("show");
            else if(x == i && y == j)
                cspace[x][y].classList.toggle("show");
}

function resetFile(){
    document.getElementById("zipUp").files.length = 0;
    selinit();
    arrinit();
    nowPage = 0;
    choosedkey = -1;
    choosedcolor = 0;
    LoadingStatus();
}
// Launchpad Canvas Renderer
function render() {
    var siz = canvas.width > canvas.height ? canvas.height : canvas.width;
    var cornerRad = siz/(keyX*keyY);

    if(canvas && stage && (canvas.width >= 3.74*canvas.height)){
        // stage.removeAllChildren();
        // stage.clear();

        // for background
        stage.removeChild(bg);
        bg = new createjs.Shape();
        // background:dark gray
        bg.graphics.beginFill("#444444").drawRoundRect(0, 0, (canvas.width-cornerRad)/3, (canvas.height-cornerRad), cornerRad/2);
        bg.graphics.beginFill("#444444").drawRoundRect((canvas.width-cornerRad+6)/3, 0, (canvas.width-cornerRad), (canvas.height-cornerRad), cornerRad/2);
        stage.addChild(bg);

        for(var i = 0 ; i < (keyX*keyY); i++){
            rects[i] = {x: (canvas.width/6-(keyX/2)*siz/(keyX+1))+siz*(i%keyX)/(keyX+2), y: (canvas.height/2-(keyY/2)*siz/(keyY+2))+siz*parseInt(i/keyY)/(keyY+2), w: siz/(keyX+3), h: siz/(keyY+3)};
            rects2[i] = {x: (canvas.width/3+(keyX/8)*siz/(keyX+1))+siz*(i%keyX)/(keyX+2), y: (canvas.height/2-(keyY/2)*siz/(keyY+2))+siz*parseInt(i/keyY)/(keyY+2), w: siz/(keyX+3), h: siz/(keyY+3)};
            stage.removeChild(drect[i]);
            stage.removeChild(drect2[i]);
            drect[i] = new createjs.Shape();
            drect2[i] = new createjs.Shape();
            if(pressedKey[i]>0){
                drect[i].graphics.setStrokeStyle(cornerRad/2, "round", "round", cornerRad).beginStroke(coloredKey[i]).beginFill(baseColor).drawRect(rects[i].x+cornerRad/3, rects[i].y+cornerRad/3, rects[i].w-cornerRad*2/3, rects[i].h-cornerRad*2/3);
                if(!IE)
                    drect[i].shadow = new createjs.Shadow(coloredKey[i], 0, 0, cornerRad*2);
            } else
                drect[i].graphics.setStrokeStyle(cornerRad*4/5, "round", "round", cornerRad).beginStroke(strokeColor).beginFill(baseColor).drawRect(rects[i].x+cornerRad/2, rects[i].y+cornerRad/2, rects[i].w-cornerRad, rects[i].h-cornerRad);
            if(i == choosedkey)
                drect2[i].graphics.setStrokeStyle(cornerRad/2, "round", "round", cornerRad).beginStroke(pageKeyColor[nowPage][i]).beginFill(keyColor[120]).drawRect(rects2[i].x+cornerRad/2, rects2[i].y+cornerRad/2, rects2[i].w-cornerRad, rects2[i].h-cornerRad);
            else
                drect2[i].graphics.setStrokeStyle(cornerRad/2, "round", "round", cornerRad).beginStroke(pageKeyColor[nowPage][i]).beginFill(baseColor).drawRect(rects2[i].x+cornerRad/2, rects2[i].y+cornerRad/2, rects2[i].w-cornerRad, rects2[i].h-cornerRad);
            stage.addChild(drect[i]);
            stage.addChild(drect2[i]);
        }

        for(var i = 0 ; i < keyColor.length; i++){
            velrects[i] = {x: (canvas.width/3+(1.1*8)*siz/(8+1))+siz*(i%(8+10))/(8+4), y: (canvas.height/2-(8/2)*siz/(8+2))+siz*parseInt(i/(8+10))/(8+4), w: siz/(8+4), h: siz/(8+4)};
            stage.removeChild(veldrects[i]);
            stage.removeChild(vt[i]);
            vt[i] = new createjs.Text(i, siz/32+"px Arial", "#FF7700");
            vt[i].x = (velrects[i].x+siz/64);
            vt[i].y = (velrects[i].y+siz/64);
            veldrects[i] = new createjs.Shape();
            veldrects[i].graphics.beginFill(keyColor[i]).drawRect(velrects[i].x+siz/128, velrects[i].y+siz/128, velrects[i].w-siz/64, velrects[i].h-siz/64);
            stage.addChild(veldrects[i]);
            stage.addChild(vt[i]);
        }

        for(var i = 0 ; i < chain; i++){
            cirs[i] = {x: rects[(i+1)*keyX-1].x+rects[0].w+cornerRad/2, y: rects[(i+1)*keyX-1].y, w: rects[(i+1)*keyX-1].w, h: rects[(i+1)*keyX-1].h};
            stage.removeChild(dcir[i]);
            dcir[i] = new createjs.Shape();
            dcir[i].graphics.setStrokeStyle(cornerRad/2);
            if(nowPage == i){
                dcir[i].graphics.beginStroke('rgba(50,200,200,0.65)');
                dcir[i].shadow = new createjs.Shadow('rgba(50,200,200,0.65)',0,0,cornerRad*2);
            }
            else
                dcir[i].graphics.beginStroke(strokeColor);
            dcir[i].graphics.beginFill(baseColor).drawCircle(cirs[i].x+rects[0].w/2, cirs[i].y+rects[0].h/2, (cirs[i].w-cornerRad/2)/2);
            stage.addChild(dcir[i]);
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
        if(pressedKey[i]>0) {
            anim[i] = new createjs.Shape();
            // Inner Glow Version
            // anim[i].graphics.setStrokeStyle(cornerRad/2, "round", "round", cornerRad).beginStroke(coloredKey[nowPage][i]).beginFill("transparent").drawRect(rects[i].x+cornerRad, rects[i].y+cornerRad, rects[i].w-cornerRad*2, rects[i].h-cornerRad*2);
            // anim[i].shadow = new createjs.Shadow(coloredKey[nowPage][i], 0, 0, cornerRad*2);
            // Outer Glow Version
            anim[i].graphics.setStrokeStyle(cornerRad/2, "round", "round", cornerRad).beginStroke(coloredKey[i]).beginFill("transparent").drawRect(rects[i].x+cornerRad/3, rects[i].y+cornerRad/3, rects[i].w-cornerRad*2/3, rects[i].h-cornerRad*2/3);
            anim[i].shadow = new createjs.Shadow(coloredKey[i], 0, 0, cornerRad*2);
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
        if(pressedKey[key]>0)
        {
            ctx.lineJoin="round";
            ctx.lineWidth = cornerRad/(keyY*0.25);
            ctx.strokeStyle=coloredKey[key];
            ctx.strokeRect(rects[key].x+cornerRad/3, rects[key].y+cornerRad/3, rects[key].w-cornerRad*2/3, rects[key].h-cornerRad*2/3);
        }
    }
}

// Audio Play Process
function playAudio(page, key) {
    if(sound[page][key][counter[page][key]]){
        sound[page][key][counter[page][key]].currentTime = 0;
        sound[page][key][counter[page][key]].play();
        //createjs.Sound.play(audio[page][key][counter[page][key]],{interrupt: createjs.Sound.INTERRUPT_ANY});
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

// // set project
// function setProject() {
//     stopT();    // if autoplay process turned on, then off
//     projectName = "Projects/"+songs[select.selectedIndex];
//     nowPage = 0;
//     LoadingStatus();    // set all message to loading

//     //get all data
//     getData(projectName+'/info', function(result){
//         setInfo(result.msg);
//         initBtnEL();
//         getData(projectName+'/keySound', function(result){
//             setKey(result.msg);
//         });
//         getData(projectName+"/LEDList", function(result){
//             setLED(result.msg);
//         });
//         getData(projectName+'/autoPlay', function(result){
//             autoData.length=0;
//             autoData = result.msg;
//             document.getElementById("AutoData").innerText="AutoData:Loaded";
//         });
//     });
// }

function setOptList(cList, content){
    cList.options.length=0;
    for(var i = 0 ; i < content.length; i++){
        var option = document.createElement("option");
        option.text = content[i];
        cList.add(option, i);
    }
    return cList;
}

function sc(ocase){
    switch(ocase){
        case 1:
        oSelector = 1;
        optSet(autoE, "AutoData");
        break;
        case 2:
        oSelector = 2;
        optSet(keyE, "KeyData");
        break;
        case 3:
        oSelector = 3;
        optSet(ledE, "LEDData");
        break;
    }
}

function scSet(){
    oIdx = document.getElementById("oIdx").value;
    switch(oSelector){
        case 1:
        autoData[oIdx] = document.getElementById("oDesc").value;
        autoE = setOptList(autoE, autoData);
        break;
        case 2:
        sList[oIdx] = document.getElementById("oDesc").value;
        keyE = setOptList(keyE, sList);
        break;
        case 3:
        keyTest[nowPage][choosedkey][counter[nowPage][choosedkey]][oIdx] = document.getElementById("oDesc").value;
        ledE = setOptList(ledE, keyTest[nowPage][choosedkey][counter[nowPage][choosedkey]]);
        break;
    }
}

function scInsertA(){
    oIdx = document.getElementById("oIdx").value;
    switch(oSelector){
        case 1:
        autoData.splice(oIdx,0,document.getElementById("oDesc").value);
        autoE = setOptList(autoE, autoData);
        break;
        case 2:
        sList.splice(oIdx,0,document.getElementById("oDesc").value);
        keyE = setOptList(keyE, sList);
        break;
        case 3:
        keyTest[nowPage][choosedkey][counter[nowPage][choosedkey]].splice(oIdx,0,document.getElementById("oDesc").value);
        ledE = setOptList(ledE, keyTest[nowPage][choosedkey][counter[nowPage][choosedkey]]);
        break;
    }
}

function scInsertB(){
    oIdx = document.getElementById("oIdx").value;
    switch(oSelector){
        case 1:
        autoData.splice(oIdx+1,0,document.getElementById("oDesc").value);
        autoE = setOptList(autoE, autoData);
        break;
        case 2:
        sList.splice(oIdx+1,0,document.getElementById("oDesc").value);
        keyE = setOptList(keyE, sList);
        break;
        case 3:
        keyTest[nowPage][choosedkey][counter[nowPage][choosedkey]].splice(oIdx+1,0,document.getElementById("oDesc").value);
        ledE = setOptList(ledE, keyTest[nowPage][choosedkey][counter[nowPage][choosedkey]]);
        break;
    }
}

function scDelete(){
    switch(oSelector){
        case 1:
        autuData = listDel(autoE, autoData);
        autoE = setOptList(autoE, autoData);
        break;
        case 2:
        sList = listDel(keyE, sList);
        keyE = setOptList(keyE, sList);
        break;
        case 3:
        keyTest[nowPage][choosedkey][counter[nowPage][choosedkey]] = listDel(ledE,keyTest[nowPage][choosedkey][counter[nowPage][choosedkey]]);
        ledE = setOptList(ledE, keyTest[nowPage][choosedkey][counter[nowPage][choosedkey]]);
        break;
    }
}

function scDur() {
    switch(oSelector){
        case 1:
        autoData.push("d "+document.getElementById("sDur").value)
        autoE = setOptList(autoE, autoData);
        break;
        case 3:
        keyTest[nowPage][choosedkey][counter[nowPage][choosedkey]].push("d "+document.getElementById("sDur").value)
        ledE = setOptList(ledE, keyTest[nowPage][choosedkey][counter[nowPage][choosedkey]]);
        break;
    }
}

function listDel(dlist, content) {
    var dmin=0, dmax=0;
    var i = dlist.options.length;
    while(i > 0){
        i--;
        if(dlist.options[i].selected)
            content.splice(i,1);
    }
    
    return content;
}

function optSet(content, ename){
    document.getElementById("eName").innerText=ename;
    for(var i=0; i<content.options.length; i++){
        if(content.options[i].selected){
            document.getElementById("oIdx").value=i;
            document.getElementById("oDesc").value=content.options[i].innerText;
        }
    }
}

function setInfo(content){
    sInfo = content;
    console.log(sInfo);
    for(var i = 0 ; i < content.length ; i++)
    {
        var str = content[i].split('=');
        if(str[0] == "chain")
            chain = parseInt(str[1]);
        if(str[0] == "buttonX")
            keyX = parseInt(str[1]);
        if(str[0] == "buttonY")
            keyY = parseInt(str[1]);
    }

    arrinit();
    stage.removeAllChildren();
    stage.clear();
    render();

    setUpForm();

    document.getElementById("Info").innerText="Info:Loaded";
}

function setUpForm() {
    var popup = document.getElementById('popSpace');
    
    while(popup.firstChild && popup.hasChildNodes)
        popup.removeChild(popup.firstChild);

    cnode.length = 0;
    cspan.length = 0;
    cspace.length = 0;
    creset.length = 0;
    for(var i = 0 ; i < chain; i++){
        cnode[i] = [];
        cspan[i] = [];
        cspace[i] = [];
        creset[i] = [];
        for(var j = 0 ; j < keyX*keyY; j++){
            cspace[i][j] = document.createElement("form");
            cspace[i][j].setAttribute('class', 'popuptext');
            cspan[i][j] = document.createElement("span");
            cspan[i][j].innerText = "Page:"+(i+1)+"/Button:"+(j+1);
            cnode[i][j] = document.createElement("input");
            cnode[i][j].setAttribute('type', 'file');
            cnode[i][j].setAttribute('id', 'myPopup_'+i+"_"+j);
            cnode[i][j].setAttribute('accept', 'audio/*');
            cnode[i][j].setAttribute('multiple', "");
            cnode[i][j].setAttribute('onchange', 'fileLoader('+i+','+j+')');
            creset[i][j] = document.createElement("input");
            creset[i][j].setAttribute('type','reset');
            creset[i][j].setAttribute('onclick', 'formReset('+i+','+j+')');
            cspace[i][j].appendChild(cspan[i][j]);
            cspace[i][j].appendChild(cnode[i][j]);
            cspace[i][j].appendChild(creset[i][j]);
            popup.appendChild(cspace[i][j]);
        }
    }
}

function formReset(page, key){
    setTimeout(function(){
        fileLoader(page,key);
    }, 50);
}

function fileLoader(page, key) {
    cnode[page][key].files.length = 0;
    sound[page][key].length = 0;
    keyCount[page][key] = 0;
    counter[page][key] = 0;
    var files = cnode[page][key].files;
    upKeyList[page][key].length = 0;    
    var reader = new FileReader();
    function readMassFiles(index){
        if(index >= files.length) {
            keyE.options.length = 0;
            sList.length = 0;
            for(var i = 0 ; i < chain ; i++)
                for(var j = 0 ; j < keyX*keyY; j++)
                    if(upKeyList[i][j].length > 0)
                        sList = sList.concat(upKeyList[i][j]);
            keyE = setOptList(keyE, sList);
            return;
        }
        var file = files[index];
        var soundString = (page+1)+" "+(parseInt(key/8)+1)+" "+((key%8)+1)+" "+file.name;
        upKeyList[page][key].push(soundString);
        reader.onload = function(e) {
            audio[page][key][keyCount[page][key]] = file.name;
            sound[page][key][keyCount[page][key]] = new Audio();
            sound[page][key][keyCount[page][key]].src = e.target.result;
            keyCount[page][key]++;
            readMassFiles(index+1);
        }
        reader.readAsDataURL(file);
    }
    readMassFiles(0);
}

function alz(){
    var lstrtmp = [];
    lstrtmp[0]=[];
    lstrtmp[1]=[];
    lstring[0].length=0;
    lstring[1].length=0;

    for(var i = 0 ; i < chain; i++)
        for(var j = 0 ; j < keyX*keyY; j++)
            for(var k = 0 ; k < keyCount[i][j]; k++)
                if(keyTest[i][j][k]){
                    lstring[0].push((i+1)+' '+parseInt(j/8+1)+' '+(j%8+1)+' '+'1'+' '+(k+1));
                    lstring[1].push(keyTest[i][j][k].join(''));
                }

    for(var i = 0 ; i < lstring[0].length; i++){
        zip.folder('keyLED').file(lstring[0][i], lstring[1][i]);
    }
}

function pj2zip() {
    alz();

    var aptxt="";
    var kstxt="";
    var iftxt="";

    for(var i = 0 ; i < sInfo.length; i++)
        iftxt = iftxt.concat(sInfo[i]+'\n');
    for(var i = 0 ; i < autoData.length; i++)
        aptxt = aptxt.concat(autoData[i]+'\n');
    for(var i = 0 ; i < sList.length; i++)
        kstxt = kstxt.concat(sList[i]+'\n');

    zip.file('info', iftxt);
    zip.file('autoPlay', aptxt);
    zip.file('keySound', kstxt);

    zip.generateAsync({type:"base64"}).then(function (base64) {
        location.href="data:application/zip;base64," + base64;
    });
}

function setKey(content){
    for(var i=0; i < content.length; i++)
    {
        var str = content[i].split(' ');
        if(str.length == 4)
        {
            var page = parseInt(str[0])-1;
            var num = ((parseInt(str[1])-1)*keyY)+(parseInt(str[2])-1);
            sound[page][num].push(new Audio('Server/'+projectName+'/sounds/'+str[3]));
            audio[page][num][keyCount[page][num]] = str[3];
            //createjs.Sound.registerSound(sound[page][num][keyCount[page][num]], audio[page][num][keyCount[page][num]], 1);
            keyCount[page][num]++;
        }
        else continue;
    }
    document.getElementById("KeySound").innerText="KeySound:Loaded";
}

function setLED(content){
    for(var p = 0 ; p < content.length; p++)
    {
        (function(p){
            var tmp = content[p].split(' ');
            getData(projectName+"/keyLED/"+content[p], function(result){
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
}

function handleFile(f){
    var title = f.name;
    var dateBefore = new Date();
    JSZip.loadAsync(f)
    .then(function(zip){
        var dateAfter = new Date();
        zip.forEach(function(relativePath, zipEntry){
            if(zipEntry.name.toLowerCase() == "info"){
                zipEntry.async("string")
                .then(function(content){
                    setInfo(content.split('\n'));
                });
            } else if(zipEntry.name.toLowerCase() == "autoplay"){
                zipEntry.async("string")
                .then(function(content){
                    autoData.length=0;
                    autoData = content.split('\n');
                    autoE = setOptList(autoE, autoData);
                    document.getElementById("AutoData").innerText="AutoData:Loaded";
                });
            } else if(zipEntry.name.toLowerCase() == "keysound"){
                zipEntry.async("string")
                .then(function(content){
                    sList = content.split('\n');
                    keyE = setOptList(keyE, sList);
                    for (var i = 0 ; i < sList.length; i++)
                        if((str = sList[i].split(' ')).length >= 4){
                            var kstr = sList[i];
                            upKeyList[parseInt(str[0])-1][(parseInt(str[1])-1)*8+(parseInt(str[2])-1)] = kstr;
                        }
                });
            }
            if(zipEntry.dir == true){
                dirs.push(relativePath.replace(/\//gi, ''));
            }
        });
        for(var i = 0 ; i < dirs.length; i++){
            if(dirs[i].toLowerCase() == "sounds")
                zip.folder(dirs[i]).forEach(function(relativePath, zipEntry){
                    zip.file(zipEntry.name).async("blob")
                    .then(function(blob){
                        ablob[0].push(relativePath);
                        ablob[1].push(URL.createObjectURL(blob));
                    });
                });
            else if(dirs[i].toLowerCase() == "keyled")
                zip.folder(dirs[i]).forEach(function(relativePath, zipEntry){
                    zip.file(zipEntry.name).async("string")
                    .then(function(content){
                        if(relativePath.split('.').length == 1){
                            lstring[0].push(relativePath);
                            lstring[1].push(content);
                        }
                    });
                });
        }
    });
}

function setKeyZip(content){
    for(var i=0; i < content.length; i++)
    {
        var str = content[i].split(' ');
        if(str.length == 4)
        {
            var page = parseInt(str[0])-1;
            var num = ((parseInt(str[1])-1)*keyY)+(parseInt(str[2])-1);
            var stmp = ablob[0].indexOf(str[3].replace(/\r/gi,""));
            if( stmp >-1 ){
                audio[page][num][keyCount[page][num]] = ablob[0][stmp];
                sound[page][num].push(new Audio(ablob[1][stmp]));
                //createjs.Sound.alternateExtensions = ["mp3", "ogg", "wav"];
                //createjs.Sound.registerSound(sound[page][num][keyCount[page][num]], audio[page][num][keyCount[page][num]], 1);
                keyCount[page][num]++;
            }
        }
        else continue;
    }
    document.getElementById("KeySound").innerText="KeySound:Loaded";
}

function setLEDZip(content){
    for(var p = 0 ; p < content[0].length; p++)
    {
        var tmp = content[0][p].split(' ');
        var ltmp = content[1][p].split('\n')
        var pNum = parseInt(tmp[0])-1;
        var keyNum = (parseInt(tmp[1])-1)*keyX+(parseInt(tmp[2])-1);
        keyTest[pNum][keyNum].push(ltmp);
        var keyCnt = keyTest[pNum][keyNum].length-1;
        for(ir=0; ir<parseInt(tmp[3])-1; ir++){
            keyTest[pNum][keyNum][keyCnt] = keyTest[pNum][keyNum][keyCnt].concat(ltmp);
        }
    }
    document.getElementById("LEDList").innerText="LEDList:Loaded";
}

// set project
function setProjectFile() {
    zip = new JSZip();
    stopT();    // if autoplay process turned on, then off
    nowPage = 0;
    LoadingStatus();    // set all message to loading

    autoData.length=0;
    keyColor.length=0;
    for(var pp = 0 ; pp < velocity.length; pp++){
        velocity[pp] = velocity[pp].replace(/\./gi,',');
        keyColor[pp] = "rgba("+velocity[pp]+opacity;
    }

    var files = document.getElementById("zipUp");

    for(var i = 0 ; i < files.files.length; i++)
        handleFile(files.files[i]);

    render();
}

function setNewPJ() {
    zip = new JSZip();
    var pjName = document.getElementById("pjName").value;
    var pjChain = document.getElementById("pjChain").value;
    var pjX = document.getElementById("pjX").value;
    var pjY = document.getElementById("pjY").value;

    autoData.length=0;
    sList.length=0;
    sInfo=[];

    chain = parseInt(pjChain);
    keyX = parseInt(pjX);
    keyY = parseInt(pjY);

    sInfo.push("title="+pjName);
    sInfo.push("chain="+pjChain);
    sInfo.push("ButtonX="+pjY);
    sInfo.push("ButtonY="+pjX);

    selinit();
    arrinit();

    setUpForm();
}

function setFile() {
    setKeyZip(sList);
    setLEDZip(lstring);
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
    tt = 0;
    for(var i=0; i<autoE.options.length; i++){
        if(autoE.options[i].selected){
            tt=i;
            break;
        }
    }
    autoProcess(tt);
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
            render();
        }
        //if need duration to autoplay
        else if(tCase == 'd' || tCase == 'delay')
            dur += parseInt(temp[1]);
        //LED On
        else if(tCase == 'o' || tCase == 'on')
        {
            var keyNum = (parseInt(temp[1])-1)*keyY+(parseInt(temp[2])-1);
            if(keyTest[nowPage][keyNum].length > 0){
                choosedkey = keyNum;
                keyLED1(nowPage, keyNum, counter[nowPage][keyNum], 0);
            }
            playAudio(nowPage, keyNum);
        }

        //Recursively Turn on/off LED
        dur--;
        if(dur < 0)
            dur = 0;
        if(dur >= 1)
            setTimeout(autoProcess,dur,++tt);
        else
            autoProcess(++tt);
    }
    else
        stopT();
}

//LED ON(without color)
function onLED(page, key) {
    pressedKey[key] = 1;
    coloredKey[key] = keyColor[120];
    if(mobile || IE){
        requestAnimationFrame(function(){
            animatecanv(key);
        });
    }
}

//LED ON(with color)
function onLED2(page, key, color)
{
    pressedKey[key] = 1;
    if(parseInt(color) < keyColor.length)
        coloredKey[key] = keyColor[parseInt(color)];
    else    //if color is out of velocity, change color code to RGB
        coloredKey[key] = s2c(color);

    if(mobile || IE){
        requestAnimationFrame(function(){
            animatecanv(key);
        });
    }
}

//LED OFF
function offLED(page, key) {
    pressedKey[key] = 0;
    if(mobile || IE){
        requestAnimationFrame(function(){
            animatecanv(key);
        });
    }
}

//LED set Process
function keyLED1(page, key, cnt, tt) {
    var dur=0;

    var temp = keyTest[page][key][cnt];
    //if there isn't LEDSET
    if(typeof temp == 'undefined')
        cnt = 0;
    
    temp = keyTest[page][key][cnt][tt];

    if(tt < keyTest[page][key][cnt].length)
    {
        var str = temp.split(' ');
        var sCase = str[0].toLowerCase();   //string checker

        //similar to autoprocess
        if(str.length > 0) {
            if(sCase == 'd' || sCase == 'delay')
                dur += parseInt(str[1]);
            else if(sCase == 'o' || sCase == 'on')
                if(str[3].toLowerCase() == 'a' || str[3].toLowerCase() == 'auto')
                    onLED2(page, (parseInt(str[1])-1)*keyY+(parseInt(str[2])-1), str[4]);
                else
                    onLED2(page, (parseInt(str[1])-1)*keyY+(parseInt(str[2])-1), str[3]);
            else if(sCase == 'f' || sCase == 'off')
                offLED(page, (parseInt(str[1])-1)*keyY+(parseInt(str[2])-1));
        }

        dur--;
        if(dur < 0)
            dur = 0;

        if(dur >= 1)
            st = setTimeout(keyLED1,dur,page,key,cnt,tt+1);
        else
            keyLED1(page, key, cnt, tt+1);
    }
}

//stop auto process
function stopT() {
    //all timer out
    choosedkey = null;
    clearTimeout(st);
    autoP = false;
    initz();
    render();
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

function selinit() {
    autoE.options.length = 0;
    keyE.options.length = 0;
    ledE.options.length = 0;
}

// init all arrays
function arrinit() {
    // zip init
    ablob.length=0;
    lstring.length=0;
    sList.length=0;
    ablob = [];
    lstring = [];
    ablob[0] = [];
    ablob[1] = [];
    lstring[0] = [];
    lstring[1] = [];
    // songs list init
    sound.length = 0;
    audio.length = 0;
    pressedKey.length = 0;
    coloredKey.length = 0;
    keyCount.length = 0;
    counter.length = 0;
    keyTest.length=0;
    anim.length=0;
    drect.length=0;
    drect2.length=0;
    veldrects.length=0;
    dcir.length=0;
    rects.length = 0;
    rects2.length = 0;
    velrects.length = 0;
    cirs.length = 0;
    pageKeyColor.length = 0;
    keyLEDList.length = 0;
    upKeyList.length = 0;
    for(var j = 0 ; j < chain; j++)
    {
        sound[j] = [];
        audio[j] = [];
        keyCount[j] = [];
        counter[j] = [];
        keyTest[j] = [];
        pageKeyColor[j] = [];
        keyLEDList[j] = [];
        upKeyList[j] = [];
        for(var i = 0 ; i < keyX*keyY; i++)
        {
            sound[j][i] = [];
            audio[j][i] = [];
            pressedKey[i] = 0
            coloredKey[i] = "#FF0000";
            keyCount[j][i] = 0;
            counter[j][i] = 0;
            keyTest[j][i] = [];
            pageKeyColor[j][i] = strokeColor;
            keyLEDList[j][i] = [];
            upKeyList[j][i] = [];
        }
    }
}

//button led initializer
function initz() {
    pressedKey.fill(0);
    coloredKey.fill(strokeColor);
}