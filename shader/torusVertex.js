export const torusVertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vEye;

//three.jsの組み込み変数memo
//https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram

//normalについてのやつ
//https://webglfundamentals.org/webgl/lessons/ja/webgl-3d-lighting-directional.html
//https://zenn.dev/mebiusbox/books/619c81d2fbeafd/viewer/7c1069

void main() {
    vUv = uv;

    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(mat3(transpose(inverse(modelMatrix))) * normal);//ノーマルはローカル空間のやつなので、ワールド空間に変換する
    // vNormal = normalize(normalMatrix * normal);
    vEye = normalize(worldPos.xyz - cameraPosition);//カメラからトーラスへのベクトル。つまり視線

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`