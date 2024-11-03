//This file is automatically rebuilt by the Cesium build process.
export default "precision highp float;\n\
\n\
uniform sampler2D randomTexture;\n\
uniform sampler2D depthTexture;\n\
uniform float intensity;\n\
uniform float bias;\n\
uniform float lengthCap;\n\
uniform float stepSize;\n\
uniform float frustumLength;\n\
\n\
vec3 pixelToEye(vec2 screenCoordinate)\n\
{\n\
    vec2 uv = screenCoordinate / czm_viewport.zw;\n\
    float depth = czm_readDepth(depthTexture, uv);\n\
    vec2 xy = 2.0 * uv - vec2(1.0);\n\
    vec4 posEC = czm_inverseProjection * vec4(xy, depth, 1.0);\n\
    return posEC.xyz / posEC.w;\n\
}\n\
\n\
// Reconstruct surface normal in eye coordinates, avoiding edges\n\
vec3 getNormalXEdge(vec3 positionEC)\n\
{\n\
    // Find the 3D surface positions at adjacent screen pixels\n\
    vec2 centerCoord = gl_FragCoord.xy;\n\
    vec3 positionLeft = pixelToEye(centerCoord + vec2(-1.0, 0.0));\n\
    vec3 positionRight = pixelToEye(centerCoord + vec2(1.0, 0.0));\n\
    vec3 positionUp = pixelToEye(centerCoord + vec2(0.0, 1.0));\n\
    vec3 positionDown = pixelToEye(centerCoord + vec2(0.0, -1.0));\n\
\n\
    // Compute potential tangent vectors\n\
    vec3 dx0 = positionEC - positionLeft;\n\
    vec3 dx1 = positionRight - positionEC;\n\
    vec3 dy0 = positionEC - positionDown;\n\
    vec3 dy1 = positionUp - positionEC;\n\
\n\
    // The shorter tangent is more likely to be on the same surface\n\
    vec3 dx = length(dx0) < length(dx1) ? dx0 : dx1;\n\
    vec3 dy = length(dy0) < length(dy1) ? dy0 : dy1;\n\
\n\
    return normalize(cross(dx, dy));\n\
}\n\
\n\
void main(void)\n\
{\n\
    vec3 positionEC = pixelToEye(gl_FragCoord.xy);\n\
\n\
    if (positionEC.z > frustumLength)\n\
    {\n\
        out_FragColor = vec4(1.0);\n\
        return;\n\
    }\n\
\n\
    vec3 normalEC = getNormalXEdge(positionEC);\n\
\n\
    float ao = 0.0;\n\
\n\
    const int ANGLE_STEPS = 4;\n\
    float angleStepScale = 1.0 / float(ANGLE_STEPS);\n\
    float angleStep = angleStepScale * czm_twoPi;\n\
    float cosStep = cos(angleStep);\n\
    float sinStep = sin(angleStep);\n\
    mat2 rotateStep = mat2(cosStep, sinStep, -sinStep, cosStep);\n\
\n\
    // Initial sampling direction (different for each pixel)\n\
    const float randomTextureSize = 255.0;\n\
    vec2 randomTexCoord = fract(gl_FragCoord.xy / randomTextureSize);\n\
    float randomVal = texture(randomTexture, randomTexCoord).x;\n\
    vec2 sampleDirection = vec2(cos(angleStep * randomVal), sin(angleStep * randomVal));\n\
\n\
    // Loop over sampling directions\n\
    for (int i = 0; i < ANGLE_STEPS; i++)\n\
    {\n\
        sampleDirection = rotateStep * sampleDirection;\n\
\n\
        float localAO = 0.0;\n\
        vec2 radialStep = stepSize * sampleDirection;\n\
\n\
        for (int j = 0; j < 6; j++)\n\
        {\n\
            // Step along sampling direction, away from output pixel\n\
            vec2 newCoords = floor(gl_FragCoord.xy + float(j + 1) * radialStep) + vec2(0.5);\n\
\n\
            // Exit if we stepped off the screen\n\
            if (clamp(newCoords, vec2(0.0), czm_viewport.zw) != newCoords)\n\
            {\n\
                break;\n\
            }\n\
\n\
            vec3 stepPositionEC = pixelToEye(newCoords);\n\
            vec3 stepVector = stepPositionEC - positionEC;\n\
            float stepLength = length(stepVector);\n\
\n\
            if (stepLength > lengthCap)\n\
            {\n\
                break;\n\
            }\n\
\n\
            float dotVal = clamp(dot(normalEC, normalize(stepVector)), 0.0, 1.0);\n\
            if (dotVal < bias)\n\
            {\n\
                dotVal = 0.0;\n\
            }\n\
\n\
            float weight = stepLength / lengthCap;\n\
            weight = 1.0 - weight * weight;\n\
            localAO = max(localAO, dotVal * weight);\n\
        }\n\
        ao += localAO;\n\
    }\n\
\n\
    ao *= angleStepScale;\n\
    ao = 1.0 - clamp(ao, 0.0, 1.0);\n\
    ao = pow(ao, intensity);\n\
    out_FragColor = vec4(vec3(ao), 1.0);\n\
}\n\
";
