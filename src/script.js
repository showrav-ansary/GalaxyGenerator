'use strict';



import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as lil from 'lil-gui';

/**
 * Base
 */

// Canvas
const canvas = document.querySelector('canvas.webgl');


// Display size
const size = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Main scene
const scene = new THREE.Scene();

// Main camera
const camera = new THREE.PerspectiveCamera(75, size.width / size.height, 0.1, 15);
camera.position.set(2, 2, 5);
scene.add(camera);


// Main renderer
const webGLRenderer = new THREE.WebGLRenderer({
    canvas: canvas
});


webGLRenderer.shadowMap.enabled = true;
webGLRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

const updateRenderer = () => {
    webGLRenderer.setSize(size.width, size.height);
    webGLRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    //webGLRenderer.setClearColor(0x262837);
}
updateRenderer();



/**
 * Orbit Controls
 */
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;



/**
 * Window Resize
 */
window.addEventListener('resize', () => {
    // Take update the dimensions
    size.width = window.innerWidth;
    size.height = window.innerHeight;

    // Update the perspective camera aspect
    camera.aspect = size.innerWidth / size.innerHeight;
    camera.updateProjectMatrix();

    // Update the pixel ratio
    updateRenderer();
});



/**
 * Objects
 */

// Galaxy
const parametersGalaxy = {
    count: 100000,
    size: 0.01,
    radius: 5,
    branch: 3,
    spin:1,
    randomness: 0.2,
    randomnessPower: 3,
    inwardColor: 0xe55e15,
    outwardColor:0x4848db
}

let galaxyGeometry = null;
let galaxyMaterial = null;
let galaxyParticles = null;

const GenerateGalaxy = () => {
    // Destroy previous Galaxy
    if(galaxyParticles != null){
        galaxyGeometry.dispose();
        galaxyMaterial.dispose();
        scene.remove(galaxyParticles);
    }

    // Geometry
    galaxyGeometry = new THREE.BufferGeometry();
    
    const pointsPosition= new Float32Array(parametersGalaxy.count * 3);
    
    const pointsColor = new Float32Array(parametersGalaxy.count * 3);

    const colorInwards = new THREE.Color(parametersGalaxy.inwardColor);
    const colorOutwards = new THREE.Color(parametersGalaxy.outwardColor);


    for (let i = 0; i < parametersGalaxy.count * 3; i++) {
        const pointStartIndex = i * 3;
       
        const radius = Math.random() * parametersGalaxy.radius;
       
        const branchAngle = (i%parametersGalaxy.branch)/parametersGalaxy.branch*Math.PI*2;
       
        const spinAngle = parametersGalaxy.spin * radius;
       
        const randomXShift = Math.pow(Math.random(), parametersGalaxy.randomnessPower) * (Math.random() < 0.5 ? 1:-1);
       
        const randomYShift =  Math.pow(Math.random(), parametersGalaxy.randomnessPower) * (Math.random() < 0.5 ? 1:-1);
        const randomZShift =  Math.pow(Math.random(), parametersGalaxy.randomnessPower) * (Math.random() < 0.5 ? 1:-1);
       
        pointsPosition[pointStartIndex] = Math.cos(branchAngle + spinAngle) * radius + randomXShift;
        pointsPosition[pointStartIndex + 1] = randomYShift
        pointsPosition[pointStartIndex + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZShift;
        

        // Colors
        const mixedColor = colorInwards.clone();
        mixedColor.lerp(colorOutwards, radius/ parametersGalaxy.radius);

        pointsColor[pointStartIndex] = mixedColor.r;
        pointsColor[pointStartIndex+1] = mixedColor.g;
        pointsColor[pointStartIndex+2] = mixedColor.b; 
    }
    galaxyGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(pointsPosition,3)
    );
    galaxyGeometry.setAttribute(
        'color',
        new THREE.BufferAttribute(pointsColor,3)
    );
    
    // Material
    galaxyMaterial = new THREE.PointsMaterial({
        size: parametersGalaxy.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    });

    // Points
    galaxyParticles = new THREE.Points(galaxyGeometry, galaxyMaterial);
    scene.add(galaxyParticles);


}
GenerateGalaxy();

/**
 * Animation
 */

const clock = new THREE.Clock();

const animatingFunction = () => {
    const elaspedTime = clock.getElapsedTime();

    // Update controls
    controls.update();

    // Render
    webGLRenderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(animatingFunction);
}
animatingFunction();


/**
 * DebugUI
 */

const debugUI = new lil.GUI();
debugUI.add(parametersGalaxy, 'count').min(1000).max(1000000).step(100).name('Particles').onFinishChange(GenerateGalaxy);
debugUI.add(parametersGalaxy, 'size').min(0.001).max(0.1).step(0.001).name('Particle Size').onFinishChange(GenerateGalaxy);
debugUI.add(parametersGalaxy, 'radius').min(0.01).max(20).step(0.01).name('Galaxy Radius').onFinishChange(GenerateGalaxy);
debugUI.add(parametersGalaxy, 'branch').min(2).max(20).step(1).name('Galaxy Branch').onFinishChange(GenerateGalaxy);
debugUI.add(parametersGalaxy, 'spin').min(-2).max(2).step(0.1).name('Galaxy Spin').onFinishChange(GenerateGalaxy);
debugUI.add(parametersGalaxy, 'randomness').min(0).max(1).step(0.1).name('Particle Randomness').onFinishChange(GenerateGalaxy);
debugUI.addColor(parametersGalaxy, 'inwardColor').min(0).max(10).step(0.1).name('Galaxy Inward').onFinishChange(GenerateGalaxy);
debugUI.addColor(parametersGalaxy, 'outwardColor').min(0).max(10).step(0.1).name('Galaxy Outward').onFinishChange(GenerateGalaxy);