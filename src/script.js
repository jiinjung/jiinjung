import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import enfj from '../static/images/enfj_white.png'
import Typed from 'typed.js'

/** 
 * loading page 
 */
const loadingPage = document.querySelector('.loading_page');

var typed = new Typed('.typed', {
    strings: ["안녕하세요!"," Hi, I'm <span class='name'> <b>Ji-In", "I'm a <span class='job'> Ph.D. candidate in Geophysics studying <b>Lunar Dynamo</span>"],
    typeSpeed: 20,
    backSpeed: 20,
});

function finishGreeting() {
    document.body.style.visibility = 'visible';
    // add class name to loading page
    loadingPage.style.opacity = '0';
    loadingPage.style.visibility = 'hidden';
}

//find the skip button
const skipButton = document.querySelector('.skip_button');
skipButton.addEventListener('click', finishGreeting);

setTimeout(finishGreeting, 6500);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


/**
 * Mouse
 */
const mouse = new THREE.Vector2()

window.addEventListener('mousemove', (event) =>
{
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1
})

// get the absolute position of an element id in the page
function getAbsolutePosition(el) {
    var r = { x: el.offsetLeft, y: el.offsetTop };
    if (el.offsetParent) {
        var tmp = getAbsolutePosition(el.offsetParent);
        r.x += tmp.x;
        r.y += tmp.y;
    }
    return r;
}

let a = getAbsolutePosition(document.getElementById('last'))


/*
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color('#FFFFFF')


/**
 * ENFJ
 */
// plane
const ENFJplaneGeometry = new THREE.PlaneGeometry(1, 1, 10, 10)
const ENFJplaneTexture = new THREE.TextureLoader().load(enfj)
const ENFJplaneMaterial = new THREE.MeshBasicMaterial({map: ENFJplaneTexture})

ENFJplaneMaterial.opacity = 0.8
ENFJplaneMaterial.transparent = true

const ENFJplane = new THREE.Mesh(ENFJplaneGeometry, ENFJplaneMaterial)

ENFJplane.name = 'ENFJ'
ENFJplane.position.set(0, 20, 0)
ENFJplane.scale.set(1, 1,1)
ENFJplane.rotation.set(0, 0, 0)
scene.add(ENFJplane)



/**
 * Capybara 
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let mixer = null
let capybaraGLTF
let capybaraAnimation
let action


// Texture
const textureLoader = new THREE.TextureLoader()
const hologramTexture = textureLoader.load('textures/gradients/hologram.jpg')
hologramTexture.magFilter = THREE.NearestFilter



gltfLoader.load(
    '/models/rainbow_capibara.glb',
    (gltf) =>
    {
        gltf.scene.scale.set(0.06, 0.06, 0.06)
        gltf.scene.rotation.y = -3.14/2

        capybaraGLTF = gltf.scene
        capybaraAnimation = gltf.animations
        scene.add(gltf.scene)


        // Animation
        mixer = new THREE.AnimationMixer(gltf.scene)
        action = mixer.clipAction(capybaraAnimation[1])
        action.play()

        //set material color to rainbow
        gltf.scene.traverse((child) => {
            
            if (child.isMesh) {
            
                console.log(child)
                child.material.color = new THREE.Color(0xffc0cb)

                // make a standard material
                const material = new THREE.MeshStandardMaterial({ 
                    map : hologramTexture,
                    emissive: 0xffc0cb,
                    emissiveIntensity: 0.7,
                    roughness: 0.01,
                    color: 0xffc0cb,
                    transparent: true,
                    opacity: 0.96,
                })

                // set the material of the mesh
                child.material = material
            }
        })
    },
    undefined, 
    (error) =>
    {
        console.error(error)
    }
)


/**
 * Objects
 */

// Objects
const objectsDistance = 4


/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 0.5)
directionalLight.position.set(1, 1, 1)
scene.add(directionalLight)


/**
 * Camera
 */
// Group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Scroll
 */
let scrollY = window.scrollY
let currentSection = 0

window.addEventListener('scroll', () =>
{
    scrollY = window.scrollY
    const newSection = Math.round(scrollY / sizes.height)

    if(newSection != currentSection)
    {
        currentSection = newSection
    }
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

/*
raycaster
*/
const raycaster = new THREE.Raycaster()
let currentIntersect = null

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime


    // Animate camera
    camera.position.y = - scrollY / sizes.height * objectsDistance
    
    if (capybaraGLTF){

        let htmlPosition = getAbsolutePosition(document.getElementById('aboutme'))
        let b = new THREE.Vector3(a.x, 0, a.y)
        let translateX =  htmlPosition.x / sizes.width * 2
        let translateY =  htmlPosition.y / sizes.height * 4 - 0.5


        capybaraGLTF.position.x =  translateX 
        capybaraGLTF.position.y =  -translateY 

        ENFJplane.position.x =  translateX - 1
        ENFJplane.position.y =  - translateY + 0.07
        ENFJplane.rotation.z =  Math.sin(elapsedTime * 5) * 0.01

        raycaster.setFromCamera(mouse, camera)
        const objects = [capybaraGLTF, ENFJplane]
        const intersects = raycaster.intersectObjects(objects)


        if(mixer)
        {
            mixer.update(deltaTime)
        }

    if(intersects.length)
    {
        if(!currentIntersect)
        {
            // make cursor pointer when hover grabbable object
            document.body.style.cursor = 'grab'

            if (intersects[0].object.name == 'Quad_Sphere'){
                console.log('mouse enter capybara')
                action.stop()
                action = mixer.clipAction(capybaraAnimation[3])
                action.play()
            }
            if (intersects[0].object.name == 'ENFJ'){
                console.log('mouse enter ENFJ')
                ENFJplane.material.opacity = 0.95
            }
        }
        currentIntersect = intersects[0]
    }
    else
    {
        document.body.style.cursor = 'default'
        if(currentIntersect)
        {
            if (currentIntersect.object.name == 'Quad_Sphere'){
                action.stop()
                action = mixer.clipAction(capybaraAnimation[1])
                action.play()
            }
            if (currentIntersect.object.name == 'ENFJ'){
                console.log('mouse leave ENFJ')
                console.log(ENFJplane)
                ENFJplane.material.opacity = 0.8
    
                //chage color of enfj white
                ENFJplane.material.color = new THREE.Color(0xffffff)
            }
        }
        
        
        currentIntersect = null
    }

    }


    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()