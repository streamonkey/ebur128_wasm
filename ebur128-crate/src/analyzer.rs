
use ebur128::{EbuR128, Mode};

pub fn setup_analyzer(sample_rate : u32, channels: u32, data: Vec<f32>, mode: Mode) -> EbuR128 {
    let mut analyzer = match EbuR128::new(channels, sample_rate, mode) {
        Ok(analyzer) => analyzer,
        Err(err) => panic!("Error creating analyzer: {}", err),
    };


    // interleave channels:

    for start in (0..data.len()).step_by(channels as usize) {
        let end = start + channels as usize;

        analyzer.add_frames_f32(&data[start..end]).unwrap_or_else(|_| panic!("Error adding frames"));
    }

    return analyzer;
}