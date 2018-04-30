var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( getOption('fov'), window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio * (getOption('gfxq') / 100));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var controls = new THREE.OrbitControls(camera, render.domElement);
controls.enableDamping = true;
controls.dampingFactor = 1;
controls.screenSpacePanning = false;
controls.minDistance = 1;
controls.maxDistance = 100;
controls.maxPolarAngle = (Math.PI / 2) * 0.9;

var models = {};
function loadObj(path, pos, rot, load) {
    if (!load) {
        load = function(obj) {
            obj.position.x += pos.x;
            obj.position.y += pos.y;
            obj.position.z += pos.z;

            obj.rotation.x += rot.x;
            obj.rotation.y += rot.y;
            obj.rotation.z += rot.z;

            scene.add(obj);
        }
    }

    if (models[path]) {
        load(models[path].clone());
        return;
    }

    var loader = new THREE.ObjectLoader();
    loader.load(
        path,
        function(obj) {
            models[path] = obj;
            load(obj);
        },
        function ( xhr ) {},
        function ( err ) {
            console.error( 'An error happened' );
        }
    );
}

var animated = [];
function loadAnimated(mainJsonPath, pos, rot, loadAnim) {
    var req = new XMLHttpRequest();
    req.addEventListener('load', function() {
        var json = JSON.parse(this.responseText);
        loadObj(json.body, pos, rot);
        for (var i = 0; i < json.animated.length; i++) {
            var i2 = i + 0;
            if (!loadAnim) {
                loadAnim = function(obj, code) {
                    obj.position.x += pos.x;
                    obj.position.y += pos.y;
                    obj.position.z += pos.z;
                    
                    obj.rotation.x += rot.x;
                    obj.rotation.y += rot.y;
                    obj.rotation.z += rot.z;
    
                    scene.add(obj);
                    animated.push({obj: obj, code: code});
                };
            }
            loadObj(json.animated[i].body, pos, rot, function(obj) {
                loadAnim(obj, json.animated[i2].code);
            });
        }
    });
    req.open('GET', mainJsonPath);
    req.send();
}

if (getOption('light')) {
    var light = new THREE.PointLight(0xffffff, 1, 500, 2);
    scene.add(light);
}

function render(animate) {
    if (animate)
        for (var xyz = 0; xyz < animated.length; xyz++) {
            var el = animated[xyz].obj;
            eval(animated[xyz].code);
        }
    renderer.render(scene, camera);
}

if (getOption('fog'))
    scene.fog = new THREE.FogExp2( 0xffffff, 0.0045 );

scene.background = new THREE.Color( 0xffffff );