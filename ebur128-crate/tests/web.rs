//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]

extern crate wasm_bindgen_test;
use wasm_bindgen_test::*;

extern crate ebur128_crate;
use ebur128_crate::utils::*;
use ebur128_crate::{ebur128_short_term_mono, ebur128_short_term_stereo};

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn interleave() {
    let left: Vec<f32> = vec![1.0,2.0,3.0,4.0,5.0,6.0,7.0,8.0];
    let right: Vec<f32> = vec![1.0,2.0,3.0,4.0,5.0,6.0,7.0,8.0];

    let interleaved = interleave_channels(vec![&left[..], &right[..]]);

    assert_eq!(left.len() + right.len(), interleaved.len());
}

fn sine(rate: u32, frames: usize, amplitude: f32) -> Vec<f32> {
    (0..frames)
        .map(|i| amplitude * (2.0 * std::f32::consts::PI * 1000.0 * i as f32 / rate as f32).sin())
        .collect()
}

#[wasm_bindgen_test]
fn short_term_stereo_sine() {
    // EBU Tech 3341: a stereo 1 kHz sine at -23 dBFS reads -23 LUFS
    let rate = 48000;
    let tone = sine(rate, rate as usize * 6, 10f32.powf(-23.0 / 20.0));

    let result = ebur128_short_term_stereo(rate, &tone, &tone, 100);

    assert_eq!(result.len(), 2 * 60);
    let lufs = result[result.len() - 2];
    let peak = result[result.len() - 1];
    assert!((lufs + 23.0).abs() < 0.1, "lufs {}", lufs);
    assert!((peak + 23.0).abs() < 0.2, "peak {}", peak);
}

#[wasm_bindgen_test]
fn short_term_mono_partial_step() {
    let rate = 48000;
    let tone = sine(rate, rate as usize * 4 + 100, 0.5);

    let result = ebur128_short_term_mono(rate, &tone, 1000);

    // a mono sine at -6.02 dBFS reads 3 LU lower: -9.03 LUFS
    assert_eq!(result.len(), 2 * 5);
    assert!((result[8] + 9.03).abs() < 0.1, "lufs {}", result[8]);
    assert!((result[9] + 6.02).abs() < 0.2, "peak {}", result[9]);
}

#[wasm_bindgen_test]
fn short_term_silence() {
    let silence = vec![0.0f32; 48000];

    let result = ebur128_short_term_mono(48000, &silence, 250);

    assert_eq!(result.len(), 2 * 4);
    assert!(result.iter().all(|v| *v == f64::NEG_INFINITY));
}

#[wasm_bindgen_test]
fn short_term_fractional_step() {
    // 100 ms are 1102.5 frames at 11025 Hz: one second makes exactly ten steps, one more frame an eleventh
    let tone = sine(11025, 11026, 0.5);

    assert_eq!(ebur128_short_term_mono(11025, &tone[..11025], 100).len(), 2 * 10);
    assert_eq!(ebur128_short_term_mono(11025, &tone, 100).len(), 2 * 11);
}
