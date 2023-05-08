//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]

extern crate wasm_bindgen_test;
use wasm_bindgen_test::*;

extern crate ebur128_wasm;
use ebur128_wasm::utils::*;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn interleave() {
    let left: Vec<f32> = vec![1.0,2.0,3.0,4.0,5.0,6.0,7.0,8.0];
    let right: Vec<f32> = vec![1.0,2.0,3.0,4.0,5.0,6.0,7.0,8.0];

    let interleaved = interleave_channels(vec![&left[..], &right[..]]);

    assert_eq!(left.len() + right.len(), interleaved.len());
}
