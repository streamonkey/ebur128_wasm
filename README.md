# EBU R128 in WASM

This Package bundles [the ebur128 Rust crate](https://crates.io/crates/ebur128) as compiled WASM, so it can be used in the browser.

the calls are blocking and take some time to execute, calling this from a WebWorker is advised for best UX.

currently the following methods are exposed:

```ts
/**
* @param {number} sample_rate
* @param {Float32Array} samples
* @returns {number}
*/
export function ebur128_integrated_mono(sample_rate: number, samples: Float32Array): number;
/**
* @param {number} sample_rate
* @param {Float32Array} left
* @param {Float32Array} right
* @returns {number}
*/
export function ebur128_integrated_stereo(sample_rate: number, left: Float32Array, right: Float32Array): number;
/**
* @param {number} sample_rate
* @param {Float32Array} samples
* @returns {number}
*/
export function ebur128_true_peak_mono(sample_rate: number, samples: Float32Array): number;
/**
* @param {number} sample_rate
* @param {Float32Array} left
* @param {Float32Array} right
* @returns {Float64Array}
*/
export function ebur128_true_peak_stereo(sample_rate: number, left: Float32Array, right: Float32Array): Float64Array;
```

these methods correspond to the EBU R128 defined [Loudness Normalization functions](https://tech.ebu.ch/docs/r/r128.pdf) 

see [./www/index.js](./www/index.js) for a demo usage

## Local demo app

you can play with the features in a local demo app:

```bash
wasm-pack build
cd www
npm run start # goto http://localhost:8080/
```

## License

Apache License, Version 2.0, ([LICENSE](LICENSE) or http://www.apache.org/licenses/LICENSE-2.0)