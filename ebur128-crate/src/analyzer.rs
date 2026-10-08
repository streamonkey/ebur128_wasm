
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

/// Analyses the planar `channels` in steps of `step_ms` (the last step may be partial) and returns
/// `[lufs_0, peak_db_0, lufs_1, peak_db_1, …]`: the short-term loudness at the end of each step
/// and the true peak over all channels within that step in dBTP.
pub fn short_term_steps(sample_rate: u32, channels: &[&[f32]], step_ms: u32) -> Vec<f64> {
    // computed per step, so a fractional number of frames per step does not add up to drift
    let step_end = |step: u64| step * step_ms as u64 * sample_rate as u64 / 1000;
    if step_end(1) == 0 {
        panic!("step_ms must cover at least one frame");
    }

    let mut analyzer = match EbuR128::new(channels.len() as u32, sample_rate, Mode::S | Mode::TRUE_PEAK) {
        Ok(analyzer) => analyzer,
        Err(err) => panic!("Error creating analyzer: {}", err),
    };

    let frames = channels[0].len();
    let mut result = Vec::new();
    let mut start = 0;
    let mut step = 1;

    while start < frames {
        let end = u64::min(step_end(step), frames as u64) as usize;
        let slices: Vec<&[f32]> = channels.iter().map(|ch| &ch[start..end]).collect();
        analyzer.add_frames_planar_f32(&slices).unwrap_or_else(|_| panic!("Error adding frames"));

        let lufs = analyzer
            .loudness_shortterm()
            .unwrap_or_else(|_| panic!("Error getting short-term loudness"));

        let mut peak = 0.0f64;
        for ch in 0..channels.len() as u32 {
            let channel_peak = analyzer
                .prev_true_peak(ch)
                .unwrap_or_else(|_| panic!("Error getting true peak"));
            peak = f64::max(peak, channel_peak);
        }

        result.push(lufs);
        result.push(20.0 * peak.log10());
        start = end;
        step += 1;
    }

    return result;
}
