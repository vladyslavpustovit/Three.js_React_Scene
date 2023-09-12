import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

function ModelCanvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const mouse = new THREE.Vector2();
    const modelRotation = new THREE.Vector3();
    const maxRotationY = Math.PI / 16;
    const maxRotationX = 0.050;

    useEffect(() => {
        if (!canvasRef.current) return;

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(60,
            canvasRef.current.clientWidth / canvasRef.current.clientHeight, 20, 300);
        camera.position.set(  -50.27690766473809, 50.51968591900898, -125.75458808295977);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
        renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);

        renderer.shadowMap.enabled = true; // Enable shadows
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Choose shadow type

        const backgroundTexture = new THREE.TextureLoader().load('/assets/textureBG.jpg');
        scene.background = backgroundTexture;

        const directionalLight = new THREE.DirectionalLight(0xffeedd, 1);
        directionalLight.position.set(1, 1, 1);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        directionalLight.shadow.mapSize.width = 1024; // Resolution of the shadow map
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.1; // Near and far shadow distances
        directionalLight.shadow.camera.far = 100;
        directionalLight.shadow.camera.top = 50; // Shadow camera frustum dimensions
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.bottom = -50;
        directionalLight.shadow.camera.left = -50;

        const ambientLight = new THREE.AmbientLight(0xffffee, 0.5); // Slight warm tint
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffaa00, 1, 100); // Warm, golden color
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);


        // Scene setup and rendering logic
        const controls = new OrbitControls(camera, renderer.domElement);
        const mixer = new THREE.AnimationMixer(scene);

        const loader = new GLTFLoader();
        let model: THREE.Object3D | null = null;
        loader.load('assets/scene.glb', function (gltf) {
            model = gltf.scene;
            scene.add(model);

            const animations = gltf.animations;
            if (animations && animations.length) {
                animations.forEach(animation => {
                    console.log(animation)
                    const action = mixer.clipAction(animation); // Create the action
                    action.timeScale = 0.020;
                    // @ts-ignore
                    action.setLoop(THREE.LoopRepeat); // Set loop mode
                    action.play(); // Play the animation
                });
            }
        }, undefined, function (error) {
            console.error(error);
        });

        function onMouseMove(event: MouseEvent) {
            const canvasRect = canvasRef.current!.getBoundingClientRect();
            mouse.x = ((event.clientX - canvasRect.left) / canvasRect.width) * 2 - 1;
            mouse.y = -((event.clientY - canvasRect.top) / canvasRect.height) * 2 + 1;

            if (model) {
                modelRotation.x = mouse.y * maxRotationX;
                modelRotation.y = mouse.x * maxRotationY;
                model.rotation.set(modelRotation.x, modelRotation.y, 0);
            }
        }




        // window.addEventListener('mousemove', onMouseMove);

        function animate() {
            requestAnimationFrame(animate);
            mixer.update(1);
            renderer.render(scene, camera);
        }

        window.addEventListener('keydown', ()=>{
            console.log('Camera Position:', camera.position.x, camera.position.y, camera.position.z);
        });

        animate();

        return () => {
            // Dispose resources and perform any cleanup
            window.removeEventListener('mousemove', onMouseMove);
            controls.dispose();
        };
    }, );

    return <canvas className="min-h-screen" id="three-canvas" ref={canvasRef} />
}

export default ModelCanvas;