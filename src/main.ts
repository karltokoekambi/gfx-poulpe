import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';

let camera: THREE.PerspectiveCamera, scene: THREE.Scene, renderer: THREE.WebGLRenderer;
let raycaster: THREE.Raycaster;
let mouse: THREE.Vector2;
let mixer: THREE.AnimationMixer;

init();

            function init() {
                const container = document.createElement('div');
                document.body.appendChild(container);

                camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 20);
                camera.position.set(-1.8, 0.6, 2.7);

                scene = new THREE.Scene();

                //scene.add(procGeom());

                new RGBELoader()
                    .setPath('textures/')
                    .load('desert.hdr', function (texture) {
                        texture.mapping = THREE.EquirectangularReflectionMapping;

                        scene.background = texture;
                        scene.environment = texture;

                        render();

                        //const loader = new GLTFLoader().setPath('models/gltf/poulpeanim/');
                        //loader.load('OctopusAcamer.gltf', async function (gltf) {
                            const loader = new GLTFLoader().setPath('models/gltf/tourpoulpe/');
                            loader.load('tourdepoulpe.gltf', async function (gltf) {
                            const model = gltf.scene;

                            model.scale.set(0.5, 0.5, 0.5);

                           //const quaternion = new THREE.Quaternion();
                           //const axis = new THREE.Vector3(1, 1, 1);
                           //const angle = 0.01;

                           //function animateOrbit() {
                           //    quaternion.setFromAxisAngle(axis, angle);
                           //    model.position.applyQuaternion(quaternion);
                           //    model.rotateOnAxis(axis, angle);
                           //    render();
                           //    requestAnimationFrame(animateOrbit);
                           //}

                           //animateOrbit();

                            await renderer.compileAsync(model, camera, scene);

                            scene.add(model);

                            mixer = new THREE.AnimationMixer(model);
                            gltf.animations.forEach((clip) => {
                                mixer.clipAction(clip).play();
                            }, (event: ErrorEvent) => {console.log("erreur"+event)});

                            animate(model)
                            render();
                        });
                    });

                renderer = new THREE.WebGLRenderer({ antialias: true });
                renderer.setPixelRatio(window.devicePixelRatio);
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.toneMapping = THREE.ACESFilmicToneMapping;
                renderer.toneMappingExposure = 1;
                container.appendChild(renderer.domElement);

                const controls = new OrbitControls(camera, renderer.domElement);
                controls.addEventListener('change', render);
                controls.minDistance = 2;
                controls.maxDistance = 10;
                controls.target.set(0, 0, -0.2);
                controls.update();

                raycaster = new THREE.Raycaster();
                mouse = new THREE.Vector2();

                //window.addEventListener('click', onMouseClick);

                //window.addEventListener('resize', onWindowResize);

                //window.addEventListener('click', procGeom);
            }

            function onWindowResize() {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();

                renderer.setSize(window.innerWidth, window.innerHeight);

                render();
            }

            function onMouseClick(event: MouseEvent) {
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

                raycaster.setFromCamera(mouse, camera);

                const intersects = raycaster.intersectObjects(scene.children, true);

                if (intersects.length > 0) {
                    const intersection = intersects[0];
                    const face = intersection.face;

                    if (face) {
                        if (intersection.object instanceof THREE.Mesh) {
                            const material = intersection.object.material as THREE.MeshStandardMaterial;
                            if (material) {
                                material.color.set(0xff0000);
                            }
                        }
                    }
                }

                const newCurve = deformCurve();
                scene.clear();
                scene.add(newCurve);

                checkCollision();

                render();
            }

            function render() {
                renderer.render(scene, camera);
            }
            function procGeom() {
                const curve = new THREE.CurvePath();
                const points = [];
                for (let i = 0; i <= 100; i++) {
                    const x = i * 0.1;
                    const y = Math.sin(x);
                    points.push(new THREE.Vector3(x, y, 0));
                }
                const path = new THREE.CatmullRomCurve3(points);
                curve.add(path);

                const tubeGeometry = new THREE.TubeGeometry(curve, 100, 0.05, 8, false);
                const tubeMaterial = new THREE.MeshStandardMaterial({
                    vertexColors: true,
                    flatShading: true,
                    side: THREE.DoubleSide
                    });
                const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
                const scene = new THREE.Scene();
                scene.add(tube);

                return scene;
            }

            function animate (model) {
                requestAnimationFrame( animate );

                //mesh.rotation.x += 0.05;
                //mesh.rotation.y += 0.01;

                const time = performance.now() / 1000; // Temps en secondes
                animateTentacles(model.getObjectByName("Armature"));

                mixer.update(1/50);

                renderer.render( scene, camera );
            }

            function animateTentacles(model) {

            }

function deformCurve() {
    const points = [];
    for (let i = 0; i <= 100; i++) {
        const x = i * 0.1;
        const y = Math.sin(x) + (Math.random() - 0.5) * 0.2;
        points.push(new THREE.Vector3(x, y, 0));
    }
    const path = new THREE.CatmullRomCurve3(points);
    const tubeGeometry = new THREE.TubeGeometry(path, 100, 0.05, 8, false);
    const tubeMaterial = new THREE.MeshStandardMaterial({
        vertexColors: true,
        flatShading: true,
        side: THREE.DoubleSide
    });
    return new THREE.Mesh(tubeGeometry, tubeMaterial);
}

function checkCollision(): boolean {
}