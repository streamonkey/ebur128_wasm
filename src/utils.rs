pub fn interleave_channels(channels: Vec<&[f32]>) -> Vec<f32> {
    let mut data = Vec::with_capacity(channels[0].len() * channels.len());
    for i in 0..channels[0].len() {
        for channel in &channels {
            data.push(channel[i]);
        }
    }
    return data;
}

pub fn set_panic_hook() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}