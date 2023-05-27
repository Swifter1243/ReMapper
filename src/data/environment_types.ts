import {ColorType, GeoShader, KeyframesLinear} from "./types.ts";

/** The "BloomFogEnvironment" environment component.
 * Allows both animated and non animated variants. */
export type BloomFogEnvironment<T extends number | KeyframesLinear> = {
    attenuation?: T
    offset?: T
    startY?: T
    height?: T
}
/** The "TubeBloomPrePassLight" environment component.
 * Allows both animated and non animated variants. */
export type TubeBloomPrePassLight<T extends number | KeyframesLinear> = {
    colorAlphaMultiplier?: T
    bloomFogIntensityMultiplier?: T
}

/** A material used on a geometry object. Allows difficulty material references. */
export type GeometryMaterial = RawGeometryMaterial | string
/** All properties allowed for a material used on a geometry object. */
export type RawGeometryMaterial = {
    shader: GeoShader
    color?: ColorType
    track?: string
    shaderKeywords?: string[]
}
/** All components on environment objects. */
export type Components<N extends number | KeyframesLinear = number> = {
    ILightWithId?: ILightWithId<N>
    BloomFogEnvironment?: BloomFogEnvironment<N>
    TubeBloomPrePassLight?: TubeBloomPrePassLight<N>
}
/** The "ILightWithId" environment component.
 * Allows both animated and non animated variants. */
export type ILightWithId<T extends number | KeyframesLinear> = {
    lightID?: T
    type?: T
}