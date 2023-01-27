export const fragmentShader = `
varying vec2 vUv;
uniform sampler2D tTex;
uniform vec2 resolution;
uniform vec2 imageResolution;

void main() {
    // https://qiita.com/ykob/items/4ede3cb11684c8a403f8
    vec2 ratio = vec2(
        min((resolution.x / resolution.y) / (imageResolution.x / imageResolution.y), 1.0),
        min((resolution.y / resolution.x) / (imageResolution.y / imageResolution.x), 1.0)
    );
    vec2 uv = vec2(
        vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );

    vec4 tex = texture2D(tTex, uv);
    gl_FragColor = tex;
}
`