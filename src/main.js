import * as THREE from "three"
import "./style.css"
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import gsap from "gsap"

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100)
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#canvas'),
    antialias: true
})

renderer.setPixelRatio(Math.min(window.devicePixelRatio , 2))
renderer.setSize(window.innerWidth, window.innerHeight)
camera.position.z = 8 ;

const radius = 1.1 ; 
const segments = 64 ; 
const color = ["red" , "blue" , "green" , "blue"] ;
const textureArr = ["../public/csilla/color.png" , "../public/earth/map.jpg" , "../public/venus/map.jpg" , "../public/volcanic/color.png"];
const spheres = new THREE.Group() ; 

const loader = new  RGBELoader();
loader.load("https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonlit_golf_1k.hdr" , function(texture){
    texture.mapping = THREE.EquirectangularReflectionMapping ; 
    scene.environment = texture ; 
})

const sphereArray = [] ; 

for (let index = 0; index < 4; index++) {
  const geometry = new THREE.SphereGeometry(radius , segments , segments) ; 
  const texture = new THREE.TextureLoader().load(`${textureArr[index]}`);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshStandardMaterial({map : texture}) ; 
  const sphere = new THREE.Mesh(geometry , material) ;
  const angle = (index / 4) * ( Math.PI * 2 ) ; 
  const x = 4 * Math.cos(angle);
  const z = 4 * Math.sin(angle);
  sphere.position.x = x ;
  sphere.position.z = z ;
  spheres.add(sphere) ;  
  sphereArray.push(sphere);
}

spheres.rotation.x  = 0.1;
spheres.position.y = -0.8; 
scene.add(spheres) ; 

const starTexture = new THREE.TextureLoader().load("../public/stars.jpg") ;
starTexture.colorSpace = THREE.SRGBColorSpace ;
const geometry = new THREE.SphereGeometry(50 , 64 , 64) ; 
const material = new THREE.MeshStandardMaterial({map : starTexture , side: THREE.BackSide , transparent: true}) ; 
const bigSphere = new THREE.Mesh(geometry , material);
scene.add(bigSphere);

let lastWheelTime = 0;
const throttleDelay = 2000;  
let scrollCount = 0;
function throttled(event) {
    const currentTime = Date.now(); 
    if (currentTime - lastWheelTime >= throttleDelay) {
        scrollCount = (scrollCount + 1) % 4; 
        lastWheelTime = currentTime;
        const headings = document.querySelectorAll(".heading");
        const paragraphs = document.querySelectorAll(".paragraph")
        gsap.to(headings, {
            duration: 1,
            y: `-=${100}%`,
            ease: "power2.inOut"
        });
        gsap.to(paragraphs, {
            duration: 1,
            y: `-=${100}%`,
            ease: "power2.inOut"
        });
        gsap.to(spheres.rotation , {
            duration: 1,
            y: `-=${Math.PI / 2}`,
            ease:"power2.inOut"
        })
        if (scrollCount === 0) {
            gsap.to(headings, {
                duration: 1,
                y: `0`,
                ease: "power2.inOut"
            });
            gsap.to(paragraphs, {
                duration: 1,
                y: `0`,
                ease: "power2.inOut"
            });
        }
    }
}

window.addEventListener("wheel" , throttled)  
const clock = new THREE.Clock() ;
function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera);
    for(let i=0; i<sphereArray.length ;i++){
        const sphereObj = sphereArray[i] ;
        sphereObj.rotation.y = clock.getElapsedTime() * 0.01; 
    }
}
animate()

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})
