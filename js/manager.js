import * as THREE from 'https://unpkg.com/three@0.142.0/build/three.module.js';
import { fragmentShader } from "../shader/fragment.js";
import { vertexShader } from "../shader/vertex.js";
import { torusFragmentShader } from "../shader/torusFragment.js";
import { torusVertexShader } from "../shader/torusVertex.js";

//img: <a href="https://unsplash.com/ja/%E5%86%99%E7%9C%9F/zYtWF7I9sbM?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>の<a href="https://unsplash.com/es/@danrang?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Kim Hyun</a>が撮影した写真
export class SceneManager {
    constructor() {
        this.init();
    }

    getDimension() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.aspect = this.width / this.height;
    }

    async init() {
        await this.loadImage();
        this.getDimension();
        this.setupThree();

        this.setupRenderTarget();
        this.setupPlane();
        this.render();
    }

    setupThree() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById("app").appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();
        // this.camera = new THREE.OrthographicCamera( this.width / - 2, this.width / 2, this.height / 2, this.height / - 2, 1, 1000 );
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 2000);
        this.camera.position.z = 5;
    }

    async loadImage() {
        this.texture = await new THREE.TextureLoader().loadAsync("/img/biei.jpg");

        return new Promise((resolve) => {
            resolve();
        })
    }

    setupRenderTarget() {
        this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height);
    }

    calcPlanePos() {
        const fovAtRadian = (this.camera.fov / 2) * (Math.PI / 180);
        const screenHeight = this.camera.position.z * Math.tan(fovAtRadian) * 2;
        const screenWidth = screenHeight * this.aspect;

        return {
            screenWidth,
            screenHeight
        };
    }

    setupPlane() {
        this.planeGeo = new THREE.PlaneGeometry(1,1);
        this.planeMat = new THREE.ShaderMaterial({
            fragmentShader,
            vertexShader,
            uniforms: {
                tTex: { value: this.texture },
                resolution: { value: new THREE.Vector2(this.width * window.devicePixelRatio, this.height * window.devicePixelRatio) },
                imageResolution: { value: new THREE.Vector2(16, 9) },
            }
        });
        const { screenWidth, screenHeight } = this.calcPlanePos();
        this.screenMesh = new THREE.Mesh(this.planeGeo, this.planeMat);
        this.screenMesh.scale.set(screenWidth, screenHeight, 1);
        this.scene.add(this.screenMesh);

        this.torusGeo = new THREE.TorusGeometry( 0.7, 0.25, 20, 100 );
        // this.torusGeo = new THREE.PlaneGeometry( 1, 1 );
        this.torusMat = new THREE.ShaderMaterial({
            fragmentShader: torusFragmentShader,
            vertexShader: torusVertexShader,
            uniforms: {
                tScene: { value: this.renderTarget.texture },
                uRefractPower: { value: 0.4 },
                resolution: { value: new THREE.Vector2(this.width * window.devicePixelRatio, this.height * window.devicePixelRatio) },
                uIorR: { value: 1.15 },
                uIorG: { value: 1.18 },
                uIorB: { value: 1.22 },
                uChromaticAberration: { value: 0.5 },
            },
            // side: THREE.DoubleSide
        });
        this.torusMesh = new THREE.Mesh(this.torusGeo, this.torusMat);
        this.torusMesh.position.z = 1;
        this.scene.add(this.torusMesh);
    }

    render() {
        requestAnimationFrame(this.render.bind(this));

        //torus以外の背景PlaneだけFBOに描画する
        this.renderer.setRenderTarget(this.renderTarget);
        this.torusMesh.visible = false;
        this.renderer.render(this.scene, this.camera);

        //その後トーラスも描画
        this.renderer.setRenderTarget(null);
        this.torusMesh.visible = true;
        this.torusMat.uniforms.tScene.value = this.renderTarget.texture;
        // this.torusMesh.rotation.x += 0.005;
        this.torusMesh.rotation.y += 0.005;
        this.renderer.render(this.scene, this.camera);

    }
}