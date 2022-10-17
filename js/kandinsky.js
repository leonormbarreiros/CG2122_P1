/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/* * * Variables refering to the clock, renderer, cameras and scene  * * * * */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

var clock = new THREE.Clock();
var dt = clock.getDelta();
var timeTarget = 0;

var camera1, camera2, camera3;
var camera, scene, renderer;

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/* * * * * * * * * * Variables refering to the entire object * * * * * * * * */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

var kandinsky; // entire object
var cones, planet, hammer, cylinder; // sub-elements of the scene
var geometry, material, mesh;

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/* * * * * Variables refering to the articulate object (orbital cross) * * * */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

var ball1, cube1, cube2; // components
var cross_elm; // grandson
var cross; // grandson and son
var orbital_cross; // grandson, son and father (whole object)

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/* * * * * * * * * * * * * Generic support variables * * * * * * * * * * * * */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

var wires = true;
var is_camera1 = true, is_camera2 = false, is_camera3 = false;
var is_v1_active = false, is_v1_positive = false;
var is_v2_active = false, is_v2_positive = false;
var is_v3_active = false, is_v3_positive = false;
var translate_x_pos = false, translate_x_neg = false; 
var translate_y_pos = false, translate_y_neg = false; 
var translate_z_pos = false, translate_z_neg = false; 

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/**
 * Init fucntion that defines the renderer and calls the auxiliary functions 
 * to create the scene and the cameras.
 * 
 */
function init() {
    'use strict';
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
   
    createScene();
    createCamera();
    camera = camera1;
    
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
}

/**
 * Implements the update/display cycle.
 */
function animate() {
    'use strict';

    update(); // update the scene
    render(); // display the new scene
    requestAnimationFrame(animate);
}

/**
 * For each object in the scene, updates its representation.
 * For example, implements the rotation/translation of the articulate object, 
 * and the alternation between wireframe and solid materials.
 */
function update() {
    // 1. set appropriate camera
    if (is_camera1) {
        camera = camera1;
    }
    if (is_camera2) {
        camera = camera2;
    }
    if (is_camera3) {
        camera = camera3;
    }

    // 2. set each object's material to the correct one (wireframe/solid)
    scene.traverse(function (node) {
        if (node instanceof THREE.Mesh) {
            node.material.wireframe = wires;
        }
    });

    // 3. rotate the articulate object
    if (is_v1_active) {
        if (is_v1_positive) {
            orbital_cross.rotateZ(orbital_cross.userData.v1);
        }
        else {
            orbital_cross.rotateZ(- orbital_cross.userData.v1);
        }
    }
    if (is_v2_active) {
        if (is_v2_positive) {
            cross.rotateX(cross.userData.v2);
        }
        else {
            cross.rotateX(- cross.userData.v2);
        }
    }
    if (is_v3_active) {
        if (is_v3_positive) {
            cross_elm.rotateY(cross_elm.userData.v3);
        }
        else {
            cross_elm.rotateY(- cross_elm.userData.v3);
        }
    }

    // 4. translate the articulate object

    a = new THREE.Vector3( 0, 0, 0 );
    if (translate_x_pos) {
        a.add(new THREE.Vector3(10, 0, 0));
    }
    if (translate_x_neg) {
        a.add(new THREE.Vector3(-10, 0, 0));
    }
    if (translate_y_pos) {
        a.add(new THREE.Vector3(0, 10, 0));
    }
    if (translate_y_neg) {
        a.add(new THREE.Vector3(0, -10, 0));
    }
    if (translate_z_pos) {
        a.add(new THREE.Vector3(0, 0, -10));
        /* AQUI, MULTIPLICAR ISTO PELO DELTA TIME! */
    }
    if (translate_z_neg) {
        a.add(new THREE.Vector3(0, 0, 10));
    }
    a.normalize();
    a.multiplyScalar(10);

    orbital_cross.translateX(a.getComponent(0));
    orbital_cross.translateY(a.getComponent(1));
    orbital_cross.translateZ(a.getComponent(2));
}

/**
 * The rendering is done with a time delta value, in order to ensure a 
 * consistent duration over different update frequencies. Therefore, a 1 
 * second animation will always have such duration, no matter how many 
 * times we rendered per second
 */
function render() {
    'use strict';

    if (Date.now() >= timeTarget) {
        renderer.render(scene, camera);
    
        timeTarget += dt;
        if (Date.now() >= timeTarget) {
          timeTarget = Date.now();
        }
    } 
} 

/**
 * Handle onKeyDown events
 * 
 * @param {*} e - event that activate this function
 */
function onKeyDown(e) {
    'use strict';

    switch (e.keyCode) {
    case 49: //1
        is_camera1 = true;
        is_camera2 = false;
        is_camera3 = false;
        break;
    case 50:  //2
        is_camera1 = false;
        is_camera2 = true;
        is_camera3 = false;
        break;
    case 51: //3
        is_camera1 = false;
        is_camera2 = false;
        is_camera3 = true;
        break;
    case 52: //4
        wires = !wires;
        break;
    case 81: //Q
    case 113: //q
        is_v1_active = true;
        is_v1_positive = true;
        break;
    case 87: //W
    case 119: //w
        is_v1_active = true;
        is_v1_positive = false;
        break;
    case 65: //A
    case 97: //a
        is_v2_active = true;
        is_v2_positive = true;
        break;
    case 83: //S
    case 115: //s
        is_v2_active = true;
        is_v2_positive = false;
        break;
    case 90: //Z
    case 122: //z
        is_v3_active = true;
        is_v3_positive = true;
        break;
    case 88: //X
    case 120: //x
        is_v3_active = true;
        is_v3_positive = false;
        break;
    case 38: //up
        translate_y_pos = true;
        break;
    case 40: //down
        translate_y_neg = true;
        break;
    case 39: //right
        translate_x_pos = true;
        break;
    case 37: //left
        translate_x_neg = true;
        break;
    case 68: //D
    case 100: //d
        translate_z_pos = true;
        break;
    case 67: //C
    case 99: //c
        translate_z_neg = true;
        break;
    }
}

/**
 * Handle onKeyUp events
 * 
 * @param {*} e - event that activate this function
 */
function onKeyUp(e) {
    'use strict';
    switch (e.keyCode) {
    case 81: //Q
    case 113: //q
    case 87: //W
    case 119: //w
        is_v1_active = false;
        break;
    case 65: //A
    case 97: //a
    case 83: //S
    case 115: //s
        is_v2_active = false;
        break;
    case 90: //Z
    case 122: //z
    case 88: //X
    case 120: //x
        is_v3_active = false;
        break;
    case 38: //up
        translate_y_pos = false;
        break;
    case 40: //down
        translate_y_neg = false;
        break;
    case 39: //right
        translate_x_pos = false;
        break;
    case 37: //left
        translate_x_neg = false;
        break;
    case 68: //D
    case 100: //d
        translate_z_pos = false;
        break;
    case 67: //C
    case 99: //c
        translate_z_neg = false;
        break;
    }
}

/**
 * Set up the Scene 
 */
function createScene() {
    'use strict';
    
    scene = new THREE.Scene();

    scene.add(new THREE.AxisHelper(10));
    
    kandinsky = new THREE.Object3D();

    createOrbitalCross(0, 0, 0);
    createPlanet(-350, -150, 200);
    createHammer(100, 100, -200);
    createCones(100, -150, 0);
    createCylinder(-300, 150, 50);

    scene.add(kandinsky);
    kandinsky.position.x = 0;
    kandinsky.position.y = 0;
    kandinsky.position.z = 0;
}

/**
 * Creates three cameras in three different positions
 */
function createCamera() {
    'use strict';
    camera1 = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );

    camera1.position.x = 0;
    camera1.position.y = 0;
    camera1.position.z = 500;
    camera1.lookAt(scene.position);

    camera2 = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );

    camera2.position.x = 0;
    camera2.position.y = 500;
    camera2.position.z = 0;
    camera2.lookAt(scene.position);

    camera3 = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );

    camera3.position.x = 500;
    camera3.position.y = 0;
    camera3.position.z = 0;
    camera3.lookAt(scene.position);
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/* * * * * * * * * * * * * * * * * OBJECTS * * * * * * * * * * * * * * * * * */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/**
 * Articulate object. Contains a sphere and two prisms (which form a cross).
 * The cross orbitates around the sphere - hence the name.
 * 
 * @param {*} x - x coordinate of the object
 * @param {*} y - y coordinate of the object
 * @param {*} z - z coordinate of the object
 */
function createOrbitalCross(x, y, z) {
    material = new THREE.MeshBasicMaterial({ color: 0x8D99AE, wireframe: true });

    /* meshes - 2 cube and 1 sphere */
    cube1 = new THREE.Mesh(new THREE.CubeGeometry(20, 20, 500), material);
    cube1.position.set(0, 60, 0); 

    cube2 = new THREE.Mesh(new THREE.CubeGeometry(200, 20, 20), material);
    cube2.position.set(0, 60, 0);

    material = new THREE.MeshBasicMaterial({ color: 0xFB8500, wireframe: true });

    ball1 = new THREE.Mesh(new THREE.SphereGeometry(50, 20, 20), material);
    ball1.position.set(0, 0, 0);

    /**
     * First, we define the bottom layer of the hierarchy - the grandson.
     * The grandson rotates around the y axis, according to an angle v3.
     */
    cross_elm = new THREE.Object3D();
    cross_elm.userData = { v3: 0.01 };

    cross_elm.add(cube2);

    /**
     * Then, we define the next hierarchical level - the cross. The cross 
     * aggregates the grandson and the son.
     * The cross rotates around the x axis, according to an angle v2.
     */
    cross = new THREE.Object3D();
    cross.userData = { v2: 0.01 };

    cross.add(cube1);
    cross.add(cross_elm);

    cross.position.set(0, 0, 0); 

    /**
     * Finally, we define the whole articulate object - the orbital cross.
     * The orbital cross aggregates the cross and the ball it orbitates around.
     * It rotates around the z axis, according to an angle v1.
     */
    orbital_cross = new THREE.Object3D();
    orbital_cross.userData = { v1: 0.01 };

    orbital_cross.add(ball1);
    orbital_cross.add(cross);

    orbital_cross.position.set(x, y, z);

    kandinsky.add(orbital_cross);
}

/**
 * Planet object. Contains a ball, a torus and a cube.
 * 
 * @param {*} x - x coordinate of the object
 * @param {*} y - y coordinate of the object
 * @param {*} z - z coordinate of the object
 */
function createPlanet(x, y, z){
    'use strict';
    
    planet = new THREE.Object3D();
       
    addPlanetBall(planet, 0, 0, 0);
    addPlanetTorus(planet, 0, 0, 0);
    addPlanetCube(planet, 15, 0, 110);

    planet.rotateY(Math.PI / 6);
    planet.rotateX(Math.PI / 6);

    planet.position.x = x;
    planet.position.y = y;
    planet.position.z = z;

    kandinsky.add(planet);
}

/**
 * Hammer object. Contains two cubes (which form a hammer) and two balls.
 * 
 * @param {*} x - x coordinate of the object
 * @param {*} y - y coordinate of the object
 * @param {*} z - z coordinate of the object
 */
function createHammer(x, y, z){
    'use strict';
    
    hammer = new THREE.Object3D();
   
    addHammerHandler(hammer, x, y, z);
    addHammerHead(hammer, x, y, z);
    addHammerBalls(hammer, x, y, z);

    hammer.rotateX(Math.PI / 4);
    hammer.rotateY(- Math.PI / 4);
    
    hammer.position.x = x;
    hammer.position.y = y;
    hammer.position.z = z;

    kandinsky.add(hammer);
}

/**
 * Cones object. Contains two cones.
 * 
 * @param {*} x - x coordinate of the object
 * @param {*} y - y coordinate of the object
 * @param {*} z - z coordinate of the object
 */
function createCones(x, y, z) {
    'use strict';

    cones = new THREE.Object3D();
    
    var cone1 = new THREE.Object3D();
    material = new THREE.MeshBasicMaterial({ color: 0xE9C46A, wireframe: true });
    geometry = new THREE.ConeGeometry( 100, 200, 100 );    
    mesh = new THREE.Mesh(geometry, material);
    
    cone1.add(mesh);
    cone1.position.set(x, y, z);
    
    var cone2 = new THREE.Object3D();
    
    material = new THREE.MeshBasicMaterial({ color: 0xE9C46A, wireframe: true });
    geometry = new THREE.ConeGeometry( 50, 100, 100 );    
    mesh = new THREE.Mesh(geometry, material);
    
    cone2.add(mesh);
    cone2.position.set(x, y + 150, z );

    cone2.rotateX(Math.PI);

    cones.add(cone1);
    cones.add(cone2);
    cones.rotateZ(Math.PI / 4);
    
    cones.position.set(0, 0, 0);
    cones.position.set(x, y, z);
    
    kandinsky.add(cones);
}

/**
 * Cylinder object. Contains a cylinder, a tube and a Tetrahedron.
 * 
 * @param {*} x - x coordinate of the object
 * @param {*} y - y coordinate of the object
 * @param {*} z - z coordinate of the object
 */
function createCylinder(x, y, z){
    'use strict';
    
    cylinder = new THREE.Object3D();
   
    addCylinder(cylinder, 0, 0, 0);
    addTube(cylinder, 150, 50, 50);
    addTetrahedron(cylinder, 215, 60, 50)

    scene.add(cylinder);
    
    cylinder.position.x = x;
    cylinder.position.y = y;
    cylinder.position.z = z;

}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/**
 * Sphere object of Planet object.
 * 
 * @param {*} obj - the father object
 * @param {*} x - x coordinate of the object
 * @param {*} y - y coordinate of the object
 * @param {*} z - z coordinate of the object
 */
function addPlanetBall(obj, x, y, z){
    'use strict';

    //Creating and defining all the parameters regarding the sphere and adding it.
    geometry = new THREE.SphereGeometry(50, 20, 20);
    material = new THREE.MeshBasicMaterial({ color: 0xD90429, wireframe: true });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

/**
 * Cube objects of Planet object.
 * 
 * @param {*} obj, the sub-element "Planet"
 * @param {*} x, x coordinate of the object
 * @param {*} y, y coordinate of the object
 * @param {*} z, z coordinate of the object
 */
 function addPlanetCube(obj, x, y, z){
    'use strict';

    //Creating and defining all the parameters regarding the first cube and adding it.
    var cube_aux = new THREE.Object3D();
    geometry = new THREE.CubeGeometry(30, 30, 100);
    material = new THREE.MeshBasicMaterial({ color: 'darkorange', wireframe: true });
    mesh = new THREE.Mesh(geometry, material);

    cube_aux.add(mesh);
    cube_aux.position.set(x, y - 70, z);
    cube_aux.rotateX(Math.PI / 4);
    obj.add(cube_aux);

    //Creating and defining all the parameters regarding the second cube and adding it.
    cube_aux = new THREE.Object3D();
    geometry = new THREE.CubeGeometry(30, 30, 100);
    material = new THREE.MeshBasicMaterial({ color: 'orangered', wireframe: true });
    mesh = new THREE.Mesh(geometry, material);

    cube_aux.add(mesh);
    cube_aux.position.set(x, y + 70, z);
    cube_aux.rotateX(- Math.PI / 4);
    obj.add(cube_aux);

    //Creating and defining all the parameters regarding the third cube and adding it.
    cube_aux = new THREE.Object3D();
    geometry = new THREE.CubeGeometry(30, 30, 100);
    material = new THREE.MeshBasicMaterial({ color: 'orange', wireframe: true });
    mesh = new THREE.Mesh(geometry, material);

    cube_aux.add(mesh);
    cube_aux.position.set(x, y, z);
    obj.add(cube_aux);
}

/**
 * Torus object of Planet object.
 * 
 * @param {*} obj, the sub-element "Planet"
 * @param {*} x, x coordinate of the object
 * @param {*} y, y coordinate of the object
 * @param {*} z, z coordinate of the object
 */
function addPlanetTorus(obj, x, y, z){
    'use strict';

    //Creating and defining all the parameters regarding the Torus and adding it.
    geometry = new THREE.TorusGeometry(100, 20, 30, 30);    
    material = new THREE.MeshBasicMaterial({ color: 0x457B9D, wireframe: true });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.rotateX(3.2);
    obj.rotateY(0.5);
    obj.add(mesh);
}

/**
 * Sphere objects of Hammer object.
 * 
 * @param {*} obj, the sub-element "Hammer"
 * @param {*} x, x coordinate of the object
 * @param {*} y, y coordinate of the object
 * @param {*} z, z coordinate of the object
 */
function addHammerBalls(obj, x, y, z) {
    'use strict';

    //Creating and defining all the parameters regarding the first Sphere and adding it.
    material = new THREE.MeshBasicMaterial({ color: 0xD90429, wireframe: true });
    geometry = new THREE.SphereGeometry(12, 10, 10);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z + 200);
    obj.add(mesh);

    //Creating and defining all the parameters regarding the second Sphere and adding it.
    material = new THREE.MeshBasicMaterial({ color: 0xEF233C, wireframe: true });
    geometry = new THREE.SphereGeometry(10, 10, 10);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z + 250);
    obj.add(mesh);
}

/**
 * Cube object of Hammer object, defines the handle.
 * 
 * @param {*} obj, the sub-element "Hammer"
 * @param {*} x, x coordinate of the object
 * @param {*} y, y coordinate of the object
 * @param {*} z, z coordinate of the object
 */
function addHammerHandler(obj, x, y, z) {
    'use strict';

    //Creating and defining all the parameters regarding the Cube and adding it.
    material = new THREE.MeshBasicMaterial({ color: 0x90E0EF, wireframe: true });
    geometry = new THREE.CubeGeometry(20, 20, 120);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z + 95);
    obj.add(mesh);
}

/**
 * Cube object of Hammer object, that defines the "head".
 * 
 * @param {*} obj, the sub-element "Hammer"
 * @param {*} x, x coordinate of the object
 * @param {*} y, y coordinate of the object
 * @param {*} z, z coordinate of the object
 */
function addHammerHead(obj, x, y, z) {
    'use strict';

    //Creating and defining all the parameters regarding the Cube and adding it.
    material = new THREE.MeshBasicMaterial({ color: 0xA8DADC, wireframe: true });
    geometry = new THREE.CubeGeometry(70, 70, 70);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

/**
 * Cylinder object of the Cylinder object.
 * 
 * @param {*} obj, the sub-element "Cylinder"
 * @param {*} x, x coordinate of the object
 * @param {*} y, y coordinate of the object
 * @param {*} z, z coordinate of the object
 */
function addCylinder(obj, x, y, z){
    'use strict';

    //Creating and defining all the parameters regarding the Cylinder object and adding it.
    var cylinder_aux = new THREE.Object3D();
    geometry = new THREE.CylinderGeometry(50, 50, 120, 20);
    material = new THREE.MeshBasicMaterial({ color: 0x006D77, wireframe: true });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    cylinder_aux.add(mesh);
    cylinder_aux.rotateX(0.5);
    cylinder_aux.rotateZ(0.8);
    obj.add(cylinder_aux);
}

/**
 * Tube object of the Cylinder object.
 * 
 * @param {*} obj, the sub-element "Cylinder"
 * @param {*} x, x coordinate of the object
 * @param {*} y, y coordinate of the object
 * @param {*} z, z coordinate of the object
 */
function addTube(obj, x, y, z){
    'use strict';

    //Creating and defining all the parameters regarding the Tube object and adding it.
    var tube_aux = new THREE.Object3D();
    const path = new CustomSinCurve( 40 );
    geometry = new THREE.TubeGeometry( path, 20, 8, 5, false);
    material = new THREE.MeshBasicMaterial({ color: 0x023E8A, wireframe: true });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    tube_aux.add(mesh)
    tube_aux.rotateY(0.8);
    tube_aux.rotateZ(-0.5);
    obj.add(tube_aux);
}

/**
 * Tetrahedron object of the Cylinder object.
 * 
 * @param {*} obj, the sub-element "Cylinder"
 * @param {*} x, x coordinate of the object
 * @param {*} y, y coordinate of the object
 * @param {*} z, z coordinate of the object
 */
function addTetrahedron(obj, x, y, z){
    'use strict';
    
    var tetrahedron_aux = new THREE.Object3D();
    geometry = new THREE.TetrahedronGeometry(40, 1);
    material = new THREE.MeshBasicMaterial({ color: 0x52796F, wireframe: true });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    tetrahedron_aux.add(mesh)
    tetrahedron_aux.rotateY(0.8);
    tetrahedron_aux.rotateZ(-0.5);
    obj.add(tetrahedron_aux);
}

/**
 * Class that defines the parameter "path" of the Tube object.
 */
class CustomSinCurve extends THREE.Curve {

	constructor( scale = 1 ) {

		super();

		this.scale = scale;

	}

	getPoint( t, optionalTarget = new THREE.Vector3() ) {

		const tx = t * 3 - 1.5;
		const ty = Math.sin( 2 * Math.PI * t );
		const tz = 0;

		return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.scale );

	}

}