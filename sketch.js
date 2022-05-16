let canvas;
var pg;
var blurpass1;
var blurpass2;
var effectpass;

let helvetica;
let effect;
let blurH;
let blurV;

var envelope, osc;
var envelope2, osc2;

var cl1, cl2, cl3;

var heads = [];
var ofrq;
let mic;
let fft;
let oscCount = 10;
let allOscs = [];
let minFreq = 100;
let maxFreq = 1000;


function preload() {
    helvetica = loadFont('assets/HelveticaNeueBd.ttf');
    effect = loadShader('assets/effect.vert', 'assets/effect.frag');
    blurH = loadShader('assets/blur.vert', 'assets/blur.frag');
    blurV = loadShader('assets/blur.vert', 'assets/blur.frag');
}

function setup(){
    var mm = min(windowWidth, windowHeight)*.76;
    canvas = createCanvas(mm, mm, WEBGL);
    imageMode(CENTER);

    pg = createGraphics(width, height, WEBGL);
    pg.noStroke();
    pg.colorMode(HSB, 100);
    pg.ortho(-width/2, width/2, -height/2, height/2, 0, 2500);
    colorMode(HSB, 100);

    blurpass1 = createGraphics(width, height, WEBGL);
    blurpass2 = createGraphics(width, height, WEBGL);
    effectpass = createGraphics(width, height, WEBGL);
    blurpass1.noStroke();
    blurpass2.noStroke();
    effectpass.noStroke();
    imageMode(CENTER);
    noCursor();

    //envelope.play(osc);

    cl1 = color(0, 0, 90);
    cl2 = color(0, 0, 10);

    generateHeads(20);

}
var s = "HELLO";
var binsum = 0;
var timer = -1;

function draw(){

    /*let bins = fft.analyze();
    binsum = 0;
    for (let i = bins.length-10; i < bins.length; i++) {
        let val = bins[i];
        if(val>3 && timer < 0){
            binsum += val;
        }
    }
    if(binsum>50){
        generateHeads();
        timer = frameRate();
    }
    timer--;*/
    
/*effect.setUniform('u_tex', pg);
    effect.setUniform('u_resolution', [width, height]);
    effect.setUniform('u_mouse', [width, height]);
    effect.setUniform('u_time', frameCount);

    shader(effect);
    fill(255);
    quad(-1,-1,1,-1,1,1,-1,1);*/
    drawHeads();
    //pg.line(0,0,mouseX-width/2,mouseY-height/2);

    blurH.setUniform('tex0', pg);
    blurH.setUniform('texelSize', [1.0/width, 1.0/height]);
    blurH.setUniform('direction', [1.0, 0.0]);
    blurH.setUniform('u_time', frameCount);
    blurH.setUniform('amp', .13);
    blurpass1.shader(blurH);
    blurpass1.quad(-1,-1,1,-1,1,1,-1,1);
    
    blurV.setUniform('tex0', blurpass1);
    blurV.setUniform('texelSize', [1.0/width, 1.0/height]);
    blurV.setUniform('direction', [0.0, 1.0]);
    blurV.setUniform('u_time', frameCount);
    blurV.setUniform('amp', .05);
    blurpass2.shader(blurV);
    blurpass2.quad(-1,-1,1,-1,1,1,-1,1);

    effect.setUniform('tex0', blurpass2);
    effect.setUniform('tex1', pg);
    effect.setUniform('u_resolution', [width, height]);
    effect.setUniform('u_mouse', [width, height]);
    effect.setUniform('u_time', frameCount);
    effect.setUniform('incolor', [.93, .9, .88, 1.]);
    effectpass.shader(effect);
    effectpass.quad(-1,-1,1,-1,1,1,-1,1);
  
    // draw the second pass to the screen
    image(effectpass, 0,0, width, height);
}

function genHead(x0, y0, w0, h0){
    
    w = w0;
    h = h0;

    // HEAD
    var lim = radians(random(33, 34));
    headVerts = [];
    headVertsF = [];
    eyeVertsL = [];
    eyeVertsR = [];
    earVertsL = [];
    earVertsR = [];
    noseVerts = [];
    mouthVerts = [];
    var cx = -11110;
    var cy = -11110;
    var off = random(1000);
    var ww = w/2*random(1.06, 1.25);
    var hh = h/2;
    var namp = random(22, 23);
    var frq = 0.01;
    var namp2 = random(4, 6);
    var frq2 = 0.07;
    var fh = random(1.5, 2.1);
    var th = random(1.5, 2.15);
    var nh = random(1.3, 1.7);
    var chc = random(3);
    for(var a = 0; a < 2*PI+lim; a += 2*PI/200.){
        hh = h/2;
        var y = hh * sin(a+off);
        if(chc < 1){
            ww = ww + 0.01*(w/2*abs(map(abs(y), 0, hh, 1, nh)) - ww);
        }
        else if(chc < 2){
            ww = ww + 0.01*(w/2*abs(map(y, -hh, hh, 1, fh)) - ww);
        }
        else{
            ww = ww + 0.01*(w/2*abs(map(y, -hh, hh, th, 1)) - ww);
        }
        //ww = ww*abs(map(abs(y), 0, hh, 1, 1.5));
        var x = ww * cos(a+off);
        cx = cx + 0.1*(x - cx);
        cy = cy + 0.1*(y - cy);
        if(a == 0){
            cx = x;
            cy = y;
        }
        namp2 = 3 + 4*power(noise((x0+cx)*.01, (y0+cy)*.01, 911.131), 5);
        frq2 = 0.06 + 0.071*power(noise((x0+cx)*.01, (y0+cy)*.01, 83081.08113), 5);
        var dx = cx + namp * (-.5 + power(noise(cx*frq, 1932.314), 2)) + namp2 * (-.5 + power(noise(cx*frq2, 1332.724), 2));
        var dy = cy + namp * (-.5 + power(noise(cy*frq, 222.8623), 2)) + namp2 * (-.5 + power(noise(cy*frq2, 112.5623), 2));
        headVerts.push([dx*.94, dy*.94])
        headVertsF.push([dx*.87, dy*.87])
    }

    //EYES
    eyeoff = random(-w/4, w/4)*1.42;
    namp = random(4, 12);
    frq = 0.4;
    off = random(300);
    lim = radians(random(33, 34));
    var eyeSpacing = map(abs(eyeoff), 0, w/4, 0, 1);
    eyeSpacing = map(pow(eyeSpacing, 2), 0, 1, w/4, w/8);
    eyeSpacing = random(w/4, w/6);
    var eyew = random(6, 8); // / (abs(eyeoff*.5)+1);
    var eyeh = random(2, 4);
    var eyey = random(-h/12, -h/6);
    pupiloffx = random(eyew/2, eyew/2)*0;
    pupiloffy = -random(eyeh/2, eyeh/2)*3;
    var vec1 = createVector(0, 0);
    var vec2 = createVector(x0, y0);
    var vec = p5.Vector.sub(vec2, vec1);
    vec.normalize();
    vec.mult(-1);
    pupiloffx = vec.x*eyew;
    pupiloffy = vec.y*eyeh;
    for(var a = 0; a < 2*PI+lim; a += 2*PI/20){
        var dx = eyeSpacing+eyeoff + eyew * sin(a+off) + namp * (-.5 + power(noise(a*frq, 3332.44), 2));
        var dy = eyey + eyeh * cos(a+off) + namp * (-.5 + power(noise(a*frq, 142.5623), 2));
        //if(eyeSpacing+eyeoff < w/3)
            eyeVertsR.push([dx, dy])
    }
    for(var a = 0; a < 4*PI+lim; a += 2*PI/20){
        var dx = eyeSpacing+eyeoff+pupiloffx + 2 * sin(a+off) + namp/1 * (-.5 + power(noise(a*frq, 3332.44), 2));
        var dy = eyey+pupiloffy + 3 * cos(a+off) + namp/1 * (-.5 + power(noise(a*frq, 142.5623), 2));
        //if(eyeSpacing+eyeoff < w/3)
            eyeVertsR.push([dx, dy])
    }
    eyeVertsR.push([eyeoff+eyeSpacing-eyew, eyey]);
    eyeVertsR.push([eyeoff+eyeSpacing-eyew+3, eyey+5]);
    eyeVertsR.push([eyeoff+eyeSpacing-eyew+13+random(-2, 2), eyey+7+random(-2, 2)]);

    eyew = random(6, 8); // / (abs(eyeoff*.5)+1);
    eyeh = random(2, 4);
    off = random(300);
    lim = radians(random(33, 34));
    for(var a = 0; a < 2*PI+lim; a += 2*PI/20){
        var dx = -eyeSpacing+eyeoff + eyew * sin(a+off) + namp * (-.5 + power(noise(a*frq, 113432.44), 2));
        var dy = eyey + eyeh * cos(a+off) + namp * (-.5 + power(noise(a*frq, 14452.21323), 2));
        //if(-eyeSpacing+eyeoff > -w/3)
            eyeVertsL.push([dx, dy])
    }
    for(var a = 0; a < 4*PI+lim; a += 2*PI/20){
        var dx = -eyeSpacing+eyeoff+pupiloffx + 2 * sin(a+off) + namp/1 * (-.5 + power(noise(a*frq, 113432.44), 2));
        var dy = eyey+pupiloffy + 3 * cos(a+off) + namp/1 * (-.5 + power(noise(a*frq, 14452.21323), 2));
        //if(-eyeSpacing+eyeoff > -w/3)
            eyeVertsL.push([dx, dy])
    }
    eyeVertsL.push([eyeoff-eyeSpacing+eyew, eyey]);
    eyeVertsL.push([eyeoff-eyeSpacing+eyew-3, eyey+5]);
    eyeVertsL.push([eyeoff-eyeSpacing+eyew-13+random(-2, 2), eyey+7+random(-2, 2)]);

    
    //NOSE
    var nv = [];
    var ny1 = eyey;
    var ny2 = 0;
    var nx1 = eyeoff+eyeSpacing-eyew;
    var nx2 = eyeoff+eyeSpacing-eyew-12;
    namp = random(25,36);
    frq = 0.06;
    if(eyeoff < 0){
        nx1 = eyeoff-eyeSpacing+eyew;
        nx2 = eyeoff-eyeSpacing+eyew+12;
    }
    for(var k = 0; k < 10; k++){
        var dx = eyeoff+eyeSpacing-eyew;
        var dy = lerp(ny1, ny2, k/(10.-1));
        if(eyeoff < 0){
            dx = eyeoff-eyeSpacing+eyew;
        }
        dx += k/10. * namp * (-.5 + power(noise(x0+y0+k*frq, 32.44), 2));
        dy += k/10. * namp * (-.5 + power(noise(x0+y0+k*frq, 42.223), 2)); 
        noseVerts.push([dx, dy]);
    }
    for(var k = 0; k < 10; k++){
        var dx = lerp(nx1, nx2, k/(10.-1));
        var dy = 0;
        noseVerts.push([dx, dy]);
    }

    //MOUTH
    mouthoff = eyeoff * random(0.6, 1.);
    namp = random(4, 12);
    frq = 0.4;
    off = random(300);
    lim = radians(random(33, 34));
    var mouthw = random(6, 8);
    var mouthh = random(1, 3);
    var mouthy = random(h/12, h/4);
    for(var a = 0; a < 2*PI+lim; a += 2*PI/20){
        var dx = mouthoff + mouthw * sin(a+off) + namp * (-.5 + power(noise(a*frq, 3332.44), 2));
        var dy = mouthy + mouthh * cos(a+off) + namp * (-.5 + power(noise(a*frq, 142.5623), 2));
        mouthVerts.push([dx, dy])
    }

    
    //EARS
    earoff = eyeoff * random(0.6, 1.);
    earSpacing = random(w/3, w/3);
    namp = random(4, 12);
    frq = 0.4;
    off = random(300);
    lim = radians(random(33, 34));
    var earw = random(6, 8);
    var earh = random(1, 3);
    var eary = random(h/12, h/4);
    for(var a = 0; a < 2*PI+lim; a += 2*PI/20){
        var dx = earSpacing + earoff + earw * sin(a+off) + namp * (-.5 + power(noise(a*frq, 3332.44), 2));
        var dy = eary + earh * cos(a+off) + namp * (-.5 + power(noise(a*frq, 142.5623), 2));
        //earVertsL.push([dx, y0+dy])
    }
    for(var a = 0; a < 2*PI+lim; a += 2*PI/20){
        var dx = earSpacing + earoff + earw * sin(a+off) + namp * (-.5 + power(noise(a*frq, 3332.44), 2));
        var dy = eary + earh * cos(a+off) + namp * (-.5 + power(noise(a*frq, 142.5623), 2));
        //earVertsR.push([dx, y0+dy])
    }

    return {
        'head': headVerts,
        'headF': headVertsF,
        'nose': noseVerts,
        'mouth': mouthVerts,
        'eyeL': eyeVertsL,
        'eyeR': eyeVertsR,
        'earL': earVertsL,
        'earR': earVertsR,
        'x0': x0,
        'y0': y0,
    }
}

function generateHeads(num){
    heads = [];
    noiseSeed(round(random(millis()*314.1314131)));
    randomSeed(round(random(millis()*414.2222)));

    for(var k = 0; k < num; k++){
        var w = random(66, 90);
        var x = 0.66*width*(-.5+power(noise(k*6.1, 1312.3114),3));
        var y = 0.66*height*(-.5+power(noise(k*6.1, 224.666),3));
        heads.push(genHead(width/2*0+x, height/2*0+y, w, w*random(1.4, 1.9)));
    }
}

function drawHeads(){
    pg.clear();
    pg.background(cl1);
    // HEAD
    for(var k = 0; k < heads.length; k++){
        pg.push();
        var yy0 = heads[k].headF[0][1];
        var yyy = yy0;
        pg.translate(0, 0, yyy);
       
        pg.pop();
    }
    for(var k = 0; k < heads.length; k++){

        pg.push();
        var yy0 = heads[k].headF[0][1];
        var yyy = yy0;
        pg.translate(0, 0, yyy);

        pg.noStroke();
        pg.fill(0, 100, heads[k].headF[0][1]/height*200);
        pg.fill(3+2*(-.5 + power(noise(k*33.211, 133414.884), 4)), 33, 85 + 10*(-.5 + power(noise(k*532.41, 1314.884), 4)));
        pg.fill(cl1);
        pg.beginShape();
        var offx = 20*(-.5 + power(noise(k*13.41, 874.884), 4))*0;
        var offy = 20*(-.5 + power(noise(k*13.41, 314.411), 4))*0;
        for(var j = 0; j < heads[k].head.length; j++){
            var x = heads[k].headF[j][0];
            var y = heads[k].headF[j][1];
            var offxx = 14*(-.5 + power(noise(j*.01, 345.2284), 4))*0;
            var offyy = 14*(-.5 + power(noise(j*.01, 514.1121), 4))*0;
            pg.vertex(x+offx+offxx, y+offy+offyy);
        }
        pg.endShape();

        pg.noFill();
        pg.stroke(cl2);
        pg.strokeWeight(4);
        pg.beginShape();
        for(var j = 0; j < heads[k].head.length; j++){
            var x = heads[k].head[j][0];
            var y = heads[k].head[j][1];
            pg.vertex(x+random(-.5,.5), y+random(-.5,.5));
        }
        pg.endShape();
        pg.beginShape();
        for(var j = 0; j < heads[k].nose.length; j++){
            var x = heads[k].nose[j][0];
            var y = heads[k].nose[j][1];
            pg.vertex(x+random(-.5,.5), y+random(-.5,.5));
        }
        pg.endShape();
        pg.beginShape();
        for(var j = 0; j < heads[k].mouth.length; j++){
            var x = heads[k].mouth[j][0];
            var y = heads[k].mouth[j][1];
            var jj = 1.*pow((j+1)/heads[k].mouth.length, 2);
            pg.vertex(x+random(-.5,.5), y+random(-.5,.5));
        }
        pg.endShape();
        pg.beginShape();
        for(var j = 0; j < heads[k].eyeL.length; j++){
            var x = heads[k].eyeL[j][0];
            var y = heads[k].eyeL[j][1];
            pg.vertex(x+random(-.5,.5), y+random(-.5,.5));
        }
        pg.endShape();
        pg.beginShape();
        for(var j = 0; j < heads[k].eyeR.length; j++){
            var x = heads[k].eyeR[j][0];
            var y = heads[k].eyeR[j][1];
            pg.vertex(x+random(-.5,.5), y+random(-.5,.5));
        }
        pg.endShape();
        pg.beginShape();
        for(var j = 0; j < heads[k].earL.length; j++){
            var x = heads[k].earL[j][0];
            var y = heads[k].earL[j][1];
            pg.vertex(x+random(-.5,.5), y+random(-.5,.5));
        }
        pg.endShape();
        pg.beginShape();
        for(var j = 0; j < heads[k].earR.length; j++){
            var x = heads[k].earR[j][0];
            var y = heads[k].earR[j][1];
            pg.vertex(x+random(-.5,.5), y+random(-.5,.5));
        }
        pg.endShape();
        pg.pop();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    pg = createGraphics(width, height);
}

function power(p, g) {
    if (p < 0.5)
        return 0.5 * pow(2*p, g);
    else
        return 1 - 0.5 * pow(2*(1 - p), g);
}

var zas = 0;
var started = false;

var autoPanner;
// route an oscillator through the panner and start it
var oscillator;

function mouseClicked(){
    Tone.start()
    //getAudioContext().resume();
    //osc.start();
    //osc2.start();
    //envelope.play(osc);
    //envelope.play(osc2);
    zas = (zas+1)%2;

    const now = Tone.now()
    // trigger the attack immediately
    
    var N = 4;
    if(!started){
        started = true;
        for(var k = 0; k < N; k++){
            //const synth = new Tone.Synth().toDestination();
            //synth.triggerAttackRelease(random(100, 1000), 1.1, now+.1*k/N)

            // create an autopanner and start it
            autoPanner = new Tone.AutoPanner("16n").toDestination().start();
            // route an oscillator through the panner and start it
            oscillator = new Tone.Oscillator(200, "sine").toDestination().start();
        }
    }
    else{
        oscillator.frequency.value = random(100, 500);
    }
    generateHeads(20);
}
function keyPressed(){

    //getAudioContext().resume();
    num = 20;

    if(keyCode-48 >=0 && keyCode-48 <= 9){
        num = (keyCode-48);
        if(num <= 3)
            num = num;
        else if(num == 4)
            num = 7;
        else if(num == 5)
            num = 12;
        else if(num == 6)
            num = 15;
        else if(num == 7)
            num = 20;
        else if(num == 8)
            num = 24;
        else if(num == 9)
            num = 30;
    }

    //getAudioContext().resume();
    
    //osc.start();
    //osc2.start();
    //envelope.play(osc);
    //envelope.play(osc2);
    zas = (zas+1)%2;

    generateHeads(num);
}
