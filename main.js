// 1. 初始化场景
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. 添加照明
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // 强度提升至1.5
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5); // 强度2.5
directionalLight.position.set(3, 5, 2); // 从右上前方照射
directionalLight.castShadow = true; // 开启阴影
scene.add(directionalLight);
const backLight = new THREE.DirectionalLight(0xffffff, 1.2);
backLight.position.set(-2, 3, -1); // 左后上方
scene.add(backLight);
const spotLight = new THREE.SpotLight(0xffffff, 3);
spotLight.position.set(0, 6, 0);
spotLight.angle = Math.PI / 6; // 30度锥角
spotLight.penumbra = 0.5; // 柔化边缘
spotLight.target.position.set(0, 0, 0); // 聚焦产品中心
scene.add(spotLight);

  // 3. 加载防潮柜模型
let doorMesh = null; // 存储柜门对象
const loader = new THREE.GLTFLoader();
loader.load(
  'models/cabinet_optimized.glb',
  (gltf) => {
    const cabinet = gltf.scene;
    cabinet.position.set(0, -1, 0);
    cabinet.scale.set(0.7, 0.7, 0.7);

    // 查找柜门部件
    cabinet.traverse((child) => {
      if (child.isMesh && child.name.toLowerCase().includes('door')) {
        doorMesh = child;
      }
    });

    scene.add(cabinet);
  },
  undefined,
  (error) => console.error('模型加载失败:', error)
);

// 4. 相机控制
const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(0, 1.5, 3);

// 5. 柜门开关动画
let isDoorOpen = false;
function toggleDoor() {
  if (!doorMesh) return;
  
  isDoorOpen = !isDoorOpen;
  new TWEEN.Tween(doorMesh.rotation)
    .to({ y: isDoorOpen ? Math.PI/2 : 0 }, 800)
    .easing(TWEEN.Easing.Back.InOut)
    .start();
}

// 6. 点击柜门交互
renderer.domElement.addEventListener('click', (event) => {
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );
  
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  
  const intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length > 0 && intersects[0].object === doorMesh) {
    toggleDoor();
  }
});

// 7. 动画循环
function animate() {
  requestAnimationFrame(animate);
  TWEEN.update();
  controls.update();
  renderer.render(scene, camera);
}
animate();

// 8. 窗口自适应
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});