pub mod utils;
mod analyzer;

use ebur128::Mode;
use utils::{interleave_channels, set_panic_hook};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn ebur128_integrated_mono(sample_rate : u32, samples : &[f32]) -> f64 {
    set_panic_hook();
    let channels = 1;

    let data = interleave_channels(vec![samples]);

    let an = analyzer::setup_analyzer(sample_rate, channels, data, Mode::I);

    an.loudness_global().unwrap_or_else(|_| panic!("Error getting loudness"))
}

#[wasm_bindgen]
pub fn ebur128_integrated_stereo(sample_rate : u32, left : &[f32], right : &[f32]) -> f64 {
    set_panic_hook();
    if left.len() != right.len() {
        panic!("left and right channel must have the same length");
    }

    let channels = 2;

    let data = interleave_channels(vec![left, right]);

    let an = analyzer::setup_analyzer(sample_rate, channels, data, Mode::I);

    an.loudness_global().unwrap_or_else(|_| panic!("Error getting loudness"))
}

#[wasm_bindgen]
pub fn ebur128_true_peak_mono(sample_rate : u32, samples : &[f32]) -> f64 {
    set_panic_hook();
    let channels = 1;

    let data = interleave_channels(vec![samples]);

    let an = analyzer::setup_analyzer(sample_rate, channels, data, Mode::TRUE_PEAK);

    an.true_peak(0).unwrap_or_else(|_| panic!("Error getting loudness"))
}

// Returns the true peak of both channels in a list
#[wasm_bindgen]
pub fn ebur128_true_peak_stereo(sample_rate : u32, left : &[f32], right : &[f32]) -> Vec<f64> {
    set_panic_hook();
    if left.len() != right.len() {
        panic!("left and right channel must have the same length");
    }

    let channels = 2;

    let data = interleave_channels(vec![left, right]);

    let an = analyzer::setup_analyzer(sample_rate, channels, data, Mode::TRUE_PEAK);

    let left_peak = an.true_peak(0).unwrap_or_else(|_| panic!("Error getting loudness"));
    let right_peak = an.true_peak(1).unwrap_or_else(|_| panic!("Error getting loudness"));

    return vec![left_peak, right_peak];
}
