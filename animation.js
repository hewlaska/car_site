// Импортируем библиотеки
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/RGBELoader.js";

// Создаем сцену
const scene = new THREE.Scene();

// Берём размеры контейнера
const container = document.getElementById("container3D");
const width = container.clientWidth;
const height = container.clientHeight;

// Камера
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

// Рендерер
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
container.appendChild(renderer.domElement);

renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

// HDR фон и окружение
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

function setHDREnvironment(hdrFile) {
  new RGBELoader()
    .setPath("./models/")
    .load(hdrFile, function (texture) {
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      scene.environment = envMap; // освещение сцены
      pmremGenerator.dispose();

      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.needsUpdate = true;

      scene.background = texture; // фон сцены
    });
}

const dayBtn = document.getElementById("DayBtn");
const nightBtn = document.getElementById("NightBtn");

// Загрузка изначального HDR
setHDREnvironment("countrytrax_midday_4k.hdr");
setActiveButton(dayBtn);
wireframeBtn.classList.add("active-b");
NotBtn.classList.add("active-b");

// Управление камерой
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.enablePan = true;
controls.target.set(0, 0, 0);

// === Анимации ===
const actions = {};
let mixer;
const loader = new GLTFLoader();
const loaderElement = document.getElementById("loader");

// Загружаем модель
let object;
loader.load("./models/10.gltf", function (gltf) {
  object = gltf.scene;
  scene.add(object);

  loaderElement.style.display = "none"; 

  object.traverse((child) => {
    if (child.isMesh) {
      child.material.wireframe = false; // Включаем сетку
    }
  });

  if (gltf.animations && gltf.animations.length > 0) {
    mixer = new THREE.AnimationMixer(object);
    gltf.animations.forEach((clip) => {
      actions[clip.name] = mixer.clipAction(clip);
    });
    console.log("Анимации:", Object.keys(actions));
  }

  // Центрируем модель и камеру
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  object.position.sub(center);
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let cameraZ = maxDim / 2 / Math.tan(fov / 2);

  camera.position.set(2.0165, 0.5727, 2.515);  // твоя сохранённая позиция
  controls.target.set(-0.4279, 0.0143, 0.5031); // твоя сохранённая цель
  controls.update();
});

/* Функция для логирования позиции камеры и её направления
function logCameraTransform() {
  console.log("Camera position:", camera.position);
  console.log("Camera target:", controls.target);
}

// Добавляем слушатель изменений
controls.addEventListener('change', logCameraTransform);*/

// Состояния
let hoodOpen = false;
let leftDoorOpen = false;
let rightDoorOpen = false;
let trunkOpen = false;

function playPair(action, pair) {
  for (const key of pair) {
    if (actions[key] && actions[key] !== action) {
      actions[key].fadeOut(0.2);
    }
  }

  action.reset();
  action.enabled = true;
  action.setLoop(THREE.LoopOnce, 1);
  action.clampWhenFinished = true;
  action.timeScale = 1;
  action.fadeIn(0.2).play();
}

// Левая дверь
document.getElementById("leftDoorBtn").addEventListener("click", () => {
  if (!actions["dl_o"] || !actions["dl_c"]) return;
  if (!leftDoorOpen) {
    playPair(actions["dl_o"], ["dl_o", "dl_c"]);
    leftDoorOpen = true;
    leftDoorBtn.classList.add("active-btn");
  } else {
    playPair(actions["dl_c"], ["dl_o", "dl_c"]);
    leftDoorOpen = false;
    leftDoorBtn.classList.remove("active-btn");
  }
});

// Правая дверь
document.getElementById("rightDoorBtn").addEventListener("click", () => {
  if (!actions["dr_o"] || !actions["dr_c"]) return;
  if (!rightDoorOpen) {
    playPair(actions["dr_o"], ["dr_o", "dr_c"]);
    rightDoorOpen = true;
    rightDoorBtn.classList.add("active-btn");
  } else {
    playPair(actions["dr_c"], ["dr_o", "dr_c"]);
    rightDoorOpen = false;
    rightDoorBtn.classList.remove("active-btn");
  }
});

// Капот
document.getElementById("hoodBtn").addEventListener("click", () => {
  if (!actions["h_o"] || !actions["h_c"]) return;
  if (!hoodOpen) {
    playPair(actions["h_o"], ["h_o", "h_c"]);
    hoodOpen = true;
    hoodBtn.classList.add("active-btn");
  } else {
    playPair(actions["h_c"], ["h_o", "h_c"]);
    hoodOpen = false;
    hoodBtn.classList.remove("active-btn");
  }
});

// Багажник
document.getElementById("trunkBtn").addEventListener("click", () => {
  if (!actions["t_o"] || !actions["t_c"]) return;
  if (!trunkOpen) {
    playPair(actions["t_o"], ["t_o", "t_c"]);
    trunkOpen = true;
    trunkBtn.classList.add("active-btn");
  } else {
    playPair(actions["t_c"], ["t_o", "t_c"]);
    trunkOpen = false;
    trunkBtn.classList.remove("active-btn");
  }
});

document.getElementById("NotBtn").addEventListener("click", () => {
  // Левая дверь
  if (leftDoorOpen && actions["dl_c"]) {
    playPair(actions["dl_c"], ["dl_o", "dl_c"]);
    leftDoorOpen = false;
    leftDoorBtn.classList.remove("active-btn");
  }

  // Правая дверь
  if (rightDoorOpen && actions["dr_c"]) {
    playPair(actions["dr_c"], ["dr_o", "dr_c"]);
    rightDoorOpen = false;
    rightDoorBtn.classList.remove("active-btn");
  }

  // Капот
  if (hoodOpen && actions["h_c"]) {
    playPair(actions["h_c"], ["h_o", "h_c"]);
    hoodOpen = false;
    hoodBtn.classList.remove("active-btn");
  }

  // Багажник
  if (trunkOpen && actions["t_c"]) {
    playPair(actions["t_c"], ["t_o", "t_c"]);
    trunkOpen = false;
    trunkBtn.classList.remove("active-btn");
  }
});

function setActiveButton(activeBtn) {
  // Снимаем активный класс со всех
  dayBtn.classList.remove("active-b");
  nightBtn.classList.remove("active-b");
  // Добавляем на активную
  activeBtn.classList.add("active-b");
}

nightBtn.addEventListener("click", () => {
  setHDREnvironment("moonless_golf_4k.hdr");
  setActiveButton(nightBtn);
});

dayBtn.addEventListener("click", () => {
  setHDREnvironment("countrytrax_midday_4k.hdr");
  setActiveButton(dayBtn);
});

let wireframeMode = false;

document.getElementById("wireframeBtn").addEventListener("click", () => {
  wireframeMode = !wireframeMode;
  object.traverse((child) => {
    if (child.isMesh) {
      child.material.wireframe = wireframeMode;
    }
  });
  wireframeBtn.textContent = wireframeMode ? "On" : "Off";
});

// Анимация
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Resize — тоже от контейнера
window.addEventListener("resize", () => {
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});
