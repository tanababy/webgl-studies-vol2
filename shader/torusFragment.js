export const torusFragmentShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vEye;
uniform vec2 resolution;
uniform sampler2D tScene;
uniform float uRefractPower;

uniform float uIorR;
uniform float uIorG;
uniform float uIorB;

float specular(vec3 eye, vec3 normal) {
    return pow(1.0 + dot(eye, normal), 2.);
}

float fresnel(vec3 eyeVector, vec3 worldNormal, float power) {
    float fresnelFactor = abs(dot(eyeVector, worldNormal));
    float inversefresnelFactor = 1.0 - fresnelFactor;

    return pow(inversefresnelFactor, power);
}

void main() {
    float iorRatioRed = 1.0 / uIorR;
    float iorRatioGreen = 1.0 / uIorG;
    float iorRatioBlue = 1.0 / uIorB;

    vec2 screenUV = gl_FragCoord.xy / resolution;
    vec4 tex = texture2D(tScene, vUv);//1パス目でトーラス以外をレンダリングしたテクスチャ

    //uvのずらしにrefract関数を使って屈折ベクトルを使う場合？
    // vec3 refractVecR = refract(vEye, vNormal, iorRatioRed);
    // vec3 refractVecG = refract(vEye, vNormal, iorRatioGreen);
    // vec3 refractVecB = refract(vEye, vNormal, iorRatioBlue);
    // float r = texture2D(tScene, screenUV + refractVecR.xy).r;
    // float g = texture2D(tScene, screenUV + refractVecG.xy).g;
    // float b = texture2D(tScene, screenUV + refractVecB.xy).b;

    //uvのずらしにnormalを活用する場合？
    float f = specular(vEye, vNormal);
    float refractPower = (1.0 - uRefractPower) * (1.0 - 0.6) + 0.6;
    f = smoothstep(0.1, refractPower, f);

    vec3 normalVecR = vNormal * f * (0.1 + 0.1 * 1.0);
    vec3 normalVecG = vNormal * f * (0.1 + 0.1 * 1.5);
    vec3 normalVecB = vNormal * f * (0.1 + 0.1 * 2.0);
    float r = texture2D(tScene, screenUV - normalVecR.xy).r;
    float g = texture2D(tScene, screenUV - normalVecG.xy).g;
    float b = texture2D(tScene, screenUV - normalVecB.xy).b;

    vec3 color = vec3(r, g, b);

    //フレネル反射を追加
    float f1 = fresnel(vEye, vNormal, 8.0);
    color.rgb += f1 * vec3(1.0);

    gl_FragColor = vec4(color, 1.0);
}
`