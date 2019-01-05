function loadText(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.overrideMimeType("text/plain");
    xhr.send(null);
    if(xhr.status === 200)
        return xhr.responseText;
    else {
        return null;
    }
    
}

// variables globales du programme;
var canvas;
var gl; 
var program;
var buffers = [];

var attribPos; 
var attribColor;
var uniformTransformMat;
var uniformPerspectiveMat;
var uniformModelViewMat;

var positions = [];
var vertexColors = [];

var translationValues = {x: 0, y: 0, z: -6.0};
var scaleFactor = 1.0;
var rotationAngleX = 0;
var rotationAngleY = 0;
var rotationAngleZ = 0;
var fovY = 0.70;
var selectedPrimitive;



function initContext() {
    console.log('context');
    canvas = document.getElementById('canvas');
    gl = canvas.getContext('webgl');
    gl.clearColor(1, 1, 1, 1.0);
}

//Initialisation des shaders et du program
function initShaders() {
    console.log('init shader');
    var vertexShaderSource = loadText("vertex.glsl");
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);

    gl.compileShader(vertexShader);

    var fragmentShaderSource = loadText("fragment.glsl");
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);

    gl.compileShader(fragmentShader);
    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    gl.useProgram(program)
}


/*var AMORTIZATION = 0.95;
         var drag = false;
         var old_x, old_y;
         var dX = 0, dY = 0;*/
//Evenement souris
function initEvents() {
    /*canvas.onmousedown = function(e) {
        drag = true;
        old_x = e.pageX, old_y = e.pageY;
        e.preventDefault();
        return false;
    }
    canvas.onmousemove = function(e){
        if (drag)
        {
            dX = (e.pageX-old_x)*2*Math.PI/canvas.width,
            dY = (e.pageY-old_y)*2*Math.PI/canvas.height;
            //THETA+= dX;
            //PHI+=dY;
            old_x = e.pageX, old_y = e.pageY;
            e.preventDefault();
        }
        
    }
    canvas.onmouseup = function(e){
        drag= false;
    }*/


    window.addEventListener('keydown', function(e) {
        
    });
}


function initAttributes() {
    attribPos = gl.getAttribLocation(program, "position");
    attribColor = gl.getAttribLocation(program, "aVertexColor");
    uniformTransformMat = gl.getUniformLocation(program, "transformation");
    uniformPerspectiveMat = gl.getUniformLocation(program, "perspective");
}


function initBuffers() {
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 12, gl.STREAM_DRAW);
    gl.vertexAttribPointer(attribColor, 4, gl.FLOAT, true, 0, 0);
    gl.enableVertexAttribArray(attribColor);
    buffers["color"] = colorBuffer;

    var posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 9, gl.STREAM_DRAW);
    gl.vertexAttribPointer(attribPos, 3, gl.FLOAT, true, 0, 0);
    gl.enableVertexAttribArray(attribPos);
    buffers["pos"] = posBuffer;
}

function initPerspective() {
    const aspect = canvas.width / canvas.height;

    var perspectiveMat = mat4.create();
    mat4.perspective(perspectiveMat, fovY, aspect, 0.1);

    gl.uniformMatrix4fv(uniformPerspectiveMat, false, perspectiveMat);
}

function refreshBuffers() {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers["color"]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers["pos"]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
}


function draw() {
    requestAnimationFrame(draw);

    if (selectedPrimitive == undefined) {
        selectedPrimitive = gl.TRIANGLES;
    }
    initPerspective();
    let transformMat = generateTransformMatrix();
    gl.uniformMatrix4fv(uniformTransformMat, false, transformMat);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.drawArrays(selectedPrimitive, 0, positions.length / 3);
}

function generateTransformMatrix() {
    let result = mat4.create();
    let rotationQuat = quat.create();

    // Axe Z
    quat.rotateZ(rotationQuat, rotationQuat, -rotationAngleZ);

    // Axe Y
    quat.rotateY(rotationQuat, rotationQuat, -rotationAngleY);

    // Axe x
    quat.rotateX(rotationQuat, rotationQuat, -rotationAngleX);

    let translationVec = vec3.fromValues(translationValues.x, translationValues.y, translationValues.z);
    let scaleVec = vec3.fromValues(scaleFactor, scaleFactor, scaleFactor);

    mat4.fromRotationTranslationScale(result, rotationQuat, translationVec, scaleVec);
    return result;
}

function setCube() {
    positions.push(...[
        // Face avant
        -0.3, -0.3,  0.3,
        0.3,  0.3,  0.3,
        0.3, -0.3,  0.3,

        -0.3, -0.3,  0.3,
        0.3,  0.3,  0.3,
        -0.3,  0.3,  0.3,

        // Face du bas
        -0.3, -0.3, -0.3,
        0.3, -0.3,  0.3,
        0.3, -0.3, -0.3,

        -0.3, -0.3, -0.3,
        0.3, -0.3, 0.3,
        -0.3, -0.3, 0.3,

        // Face arrière
        -0.3, -0.3, -0.3,
        0.3,  0.3, -0.3,
        -0.3,  0.3, -0.3,

        -0.3, -0.3, -0.3,
        0.3,  0.3, -0.3,
        0.3, -0.3, -0.3,
        
        // Face du haut
        -0.3,  0.3, -0.3,
        0.3,  0.3,  0.3,
        -0.3,  0.3,  0.3,

        -0.3,  0.3, -0.3,
        0.3,  0.3,  0.3,
        0.3,  0.3, -0.3,

        // Face de gauche
        -0.3, -0.3, -0.3,
        -0.3,  0.3,  0.3,
        -0.3, -0.3,  0.3,

        -0.3, -0.3, -0.3,
        -0.3,  0.3,  0.3,
        -0.3,  0.3, -0.3,

        // Face de droite
        0.3, -0.3, -0.3,
        0.3,  0.3,  0.3,
        0.3,  0.3, -0.3,

        0.3, -0.3, -0.3,
        0.3,  0.3,  0.3,
        0.3, -0.3,  0.3,
    ]);

    vertexColors.push(...([
        Array(6).fill([1.0, 0.0, 0.0, 1.0]).flat(),
        Array(6).fill([0.0, 1.0, 0.0, 1.0]).flat(),
        Array(6).fill([0.0, 0.0, 1.0, 1.0]).flat(),
        Array(6).fill([1.0, 1.0, 0.0, 1.0]).flat(),
        Array(6).fill([0.0, 1.0, 1.0, 1.0]).flat(),
        Array(6).fill([1.0, 0.0, 1.0, 1.0]).flat()
    ].flat()));

    refreshBuffers();
}


function main() {
    initContext();
    initShaders();
    initEvents();
    initAttributes();
    initPerspective();
    initBuffers();
    initEvents();

    setCube();

    draw();
}
//Déclaration des sliders
//Translation
var slidertx = document.getElementById("txslider");
var sliderty = document.getElementById("tyslider");
var slidertz = document.getElementById("tzslider");
//Rotation
var sliderrx = document.getElementById("rxslider");
var sliderry = document.getElementById("ryslider");
var sliderrz = document.getElementById("rzslider");
//Camera
var zoom = document.getElementById("zoom");
var perspective = document.getElementById("perspective");

slidertx.oninput = function() {
    changeTranslationValue(this.value, sliderty.value, slidertz.value);
}

sliderty.oninput = function() {
    changeTranslationValue(slidertx.value, this.value, slidertz.value);
}

slidertz.oninput = function() {
    changeTranslationValue(slidertx.value, sliderty.value, this.value);
}

sliderrx.oninput = function() {
    changeRotationValue(this.value, sliderry.value, sliderrz.value);
}

sliderry.oninput = function() {
    changeRotationValue(sliderrx.value, this.value, sliderrz.value);
}

sliderrz.oninput = function() {
    changeRotationValue(sliderrx.value, sliderry.value, this.value);
}

zoom.oninput = function() {
    changeCameraValue(this.value, perspective.value);
}

perspective.oninput = function() {
    changeCameraValue(zoom.value, this.value);
}

  function changeTranslationValue(x,y,z)
  {
    translationValues.y = y;
    translationValues.x = x;
    translationValues.z = z;

  }

  function changeRotationValue(x,y,z)
  {
    rotationAngleY = y;
    rotationAngleX = x;
    rotationAngleZ = z;

  }

  function changeCameraValue(zoom,perspective)
  {
    scaleFactor = zoom;
    fovY = perspective;
  }

  //Couleur
  function update(picker)
  {
    vertexColors = [];
    console.log('hey');
    vertexColors.push(...([
        Array(6).fill([(picker.rgb[0]/255).toFixed(2), (picker.rgb[1]/255).toFixed(2), (picker.rgb[2]/255).toFixed(2), 1.0]).flat(),
        Array(6).fill([(picker.rgb[0]/255).toFixed(2), (picker.rgb[1]/255).toFixed(2), (picker.rgb[2]/255).toFixed(2), 1.0]).flat(),
        Array(6).fill([(picker.rgb[0]/255).toFixed(2), (picker.rgb[1]/255).toFixed(2), (picker.rgb[2]/255).toFixed(2), 1.0]).flat(),
        Array(6).fill([(picker.rgb[0]/255).toFixed(2), (picker.rgb[1]/255).toFixed(2), (picker.rgb[2]/255).toFixed(2), 1.0]).flat(),
        Array(6).fill([(picker.rgb[0]/255).toFixed(2), (picker.rgb[1]/255).toFixed(2), (picker.rgb[2]/255).toFixed(2), 1.0]).flat(),
        Array(6).fill([(picker.rgb[0]/255).toFixed(2), (picker.rgb[1]/255).toFixed(2), (picker.rgb[2]/255).toFixed(2), 1.0]).flat()
    ].flat()));
    refreshBuffers();
  }