import React, { Component } from 'react';
import * as THREE from 'three';
import Orbitcontrols from 'three-orbitcontrols';

class App extends Component {

  constructor(props) {
    super(props);
    this.mount = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
  }

  componentDidMount() {
    this.init();
  }

  init = () => {
    this.initScene();
    this.createCube()
    this.createLine()
    this.animate();
    this.initControls();
  }

  initScene = () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75, this.mount.clientWidth / this.mount.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    renderer.setSize(this.mount.clientWidth, this.mount.clientHeight);
    this.mount.appendChild(renderer.domElement);
    camera.position.z = 5;
  }

  createCube = () => {
    const geometry = new THREE.BoxGeometry(1, 2, 1, 4);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    this.cube = cube
    this.scene.add(cube);
  }

  createLine = () => {
    const material = new THREE.LineBasicMaterial({ color: 0x0f00ff }) //定义线的材质
    const geometry = new THREE.Geometry()
    geometry.vertices.push(new THREE.Vector3(-2, 0, 0))
    geometry.vertices.push(new THREE.Vector3(0, 2, 0)); //相当于是从 将前两个坐标连成一条线
    const line = new THREE.Line(geometry, material)
    this.line = line
    line.position.x = -1
    line.position.y = 2
    this.scene.add(line)
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;
    this.line.rotation.x += 0.02
    this.renderer.render(this.scene, this.camera);
  }

  initControls = () => {
    const controls = new Orbitcontrols(this.camera, this.renderer.domElement);
    this.controls = controls;
    controls.enableDamping = true
    controls.dampingFactor = 0.25
    controls.enableZoom = false

  }

  componentWillUnmount() {
    this.mount.removeChild(this.renderer.domElement)
  }

  render() {
    return (
      <div
        id="canvas"
        style={{ width: '100vw', height: '100vh', background: '#888' }}
        ref={(mount) => { this.mount = mount }}
      />
    );
  }
}

export default App;