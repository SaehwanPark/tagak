use serde::{Deserialize, Serialize};
use std::{
    fs,
    path::{Path, PathBuf},
    sync::{Arc, Mutex},
};
use tauri::{
    App, AppHandle, LogicalSize, Manager, Monitor, PhysicalPosition, PhysicalSize, Runtime,
    WebviewUrl, WebviewWindow, WebviewWindowBuilder, WindowEvent,
};

const WINDOW_STATE_FILE: &str = "window-state.json";
const WINDOW_STATE_VERSION: u8 = 1;
const DEFAULT_WIDTH: f64 = 1120.0;
const DEFAULT_HEIGHT: f64 = 960.0;
const MIN_WIDTH: f64 = 320.0;
const MIN_HEIGHT: f64 = 420.0;
const OUTER_WIDTH_RESERVE: f64 = 48.0;
const OUTER_HEIGHT_RESERVE: f64 = 80.0;

#[cfg(target_os = "macos")]
const WEBKIT_DATA_STORE_ID: [u8; 16] = [
    59, 115, 200, 135, 242, 170, 77, 19, 135, 10, 94, 240, 36, 52, 200, 57,
];

#[derive(Clone)]
pub struct SharedWindowState(Arc<Mutex<SavedWindowState>>);

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize)]
#[serde(deny_unknown_fields)]
struct SavedWindowState {
    version: u8,
    width: f64,
    height: f64,
    monitor_name: Option<String>,
    x_fraction: f64,
    y_fraction: f64,
    maximized: bool,
}

impl Default for SavedWindowState {
    fn default() -> Self {
        Self {
            version: WINDOW_STATE_VERSION,
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
            monitor_name: None,
            x_fraction: 0.5,
            y_fraction: 0.5,
            maximized: false,
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq)]
struct WorkArea {
    x: i32,
    y: i32,
    width: u32,
    height: u32,
    scale_factor: f64,
}

#[derive(Clone, Copy, Debug, PartialEq)]
struct WindowPlacement {
    width: f64,
    height: f64,
    physical_width: u32,
    physical_height: u32,
    x: i32,
    y: i32,
}

pub fn build_main_window<R: Runtime>(
    app: &mut App<R>,
) -> tauri::Result<(WebviewWindow<R>, SharedWindowState)> {
    let state_path = app
        .path()
        .app_config_dir()
        .ok()
        .map(|directory| directory.join(WINDOW_STATE_FILE));
    let saved_state = load_saved_state(state_path.as_deref());
    let mut monitors = app.available_monitors().unwrap_or_default();
    let primary_monitor = app
        .primary_monitor()
        .ok()
        .flatten()
        .or_else(|| monitors.first().cloned());
    if let Some(primary) = primary_monitor.as_ref() {
        monitors.push(primary.clone());
    }
    let target_monitor = select_monitor(&saved_state, &monitors, primary_monitor.as_ref());
    let initial_monitor = primary_monitor.as_ref().or(target_monitor.as_ref());
    let minimum = minimum_inner_size(&monitors);
    let initial = initial_inner_size(initial_monitor, minimum);

    let builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
        .title("타각 — Tagak")
        .inner_size(initial.width, initial.height)
        .min_inner_size(minimum.width, minimum.height)
        .visible(false);

    #[cfg(target_os = "macos")]
    let builder = builder.data_store_identifier(WEBKIT_DATA_STORE_ID);

    let window = builder.build()?;
    let mut restored_state = saved_state;
    if let Some(monitor) = target_monitor.as_ref() {
        if let Some(area) = work_area(monitor) {
            let placement = placement_for(&restored_state, area);
            window.set_position(PhysicalPosition::new(placement.x, placement.y))?;
            window.set_size(PhysicalSize::new(
                placement.physical_width,
                placement.physical_height,
            ))?;
            restored_state.width = placement.width;
            restored_state.height = placement.height;
            restored_state.monitor_name = monitor.name().cloned();
        } else {
            window.center()?;
        }
    } else {
        window.center()?;
    }

    let shared_state = SharedWindowState(Arc::new(Mutex::new(restored_state.clone())));
    attach_window_state_events(&window, shared_state.clone(), state_path);

    if restored_state.maximized {
        window.maximize()?;
    }
    window.show()?;

    Ok((window, shared_state))
}

pub fn save_on_exit<R: Runtime>(app: &AppHandle<R>) {
    let state = app.state::<SharedWindowState>();
    if let Some(window) = app.get_webview_window("main") {
        update_from_window(&window, &state);
    }

    let path = app
        .path()
        .app_config_dir()
        .ok()
        .map(|directory| directory.join(WINDOW_STATE_FILE));
    save_state(path.as_deref(), &state);
}

fn attach_window_state_events<R: Runtime>(
    window: &WebviewWindow<R>,
    shared_state: SharedWindowState,
    state_path: Option<PathBuf>,
) {
    let event_window = window.clone();
    window.on_window_event(move |event| match event {
        WindowEvent::Moved(_)
        | WindowEvent::Resized(_)
        | WindowEvent::ScaleFactorChanged { .. } => {
            update_from_window(&event_window, &shared_state);
        }
        WindowEvent::CloseRequested { .. } => {
            update_from_window(&event_window, &shared_state);
            save_state(state_path.as_deref(), &shared_state);
        }
        _ => {}
    });
}

fn update_from_window<R: Runtime>(window: &WebviewWindow<R>, shared_state: &SharedWindowState) {
    let Ok(mut state) = shared_state.0.lock() else {
        eprintln!("could not update Tagak window state because its lock is poisoned");
        return;
    };

    if window.is_maximized().unwrap_or(false) {
        state.maximized = true;
        return;
    }
    if window.is_minimized().unwrap_or(false) || window.is_fullscreen().unwrap_or(false) {
        return;
    }

    let Some(monitor) = window
        .current_monitor()
        .ok()
        .flatten()
        .or_else(|| window.primary_monitor().ok().flatten())
    else {
        return;
    };
    let Some(area) = work_area(&monitor) else {
        return;
    };
    let Ok(inner_size) = window.inner_size() else {
        return;
    };
    let Ok(outer_size) = window.outer_size() else {
        return;
    };
    let Ok(outer_position) = window.outer_position() else {
        return;
    };

    state.width = inner_size.width as f64 / area.scale_factor;
    state.height = inner_size.height as f64 / area.scale_factor;
    state.monitor_name = monitor.name().cloned();
    state.x_fraction = position_fraction(
        outer_position.x,
        area.x,
        area.width.saturating_sub(outer_size.width),
    );
    state.y_fraction = position_fraction(
        outer_position.y,
        area.y,
        area.height.saturating_sub(outer_size.height),
    );
    state.maximized = false;
}

fn state_is_valid(state: &SavedWindowState) -> bool {
    state.version == WINDOW_STATE_VERSION
        && state.width.is_finite()
        && state.height.is_finite()
        && (1.0..=16_384.0).contains(&state.width)
        && (1.0..=16_384.0).contains(&state.height)
        && valid_fraction(state.x_fraction)
        && valid_fraction(state.y_fraction)
        && state
            .monitor_name
            .as_ref()
            .map_or(true, |name| !name.is_empty() && name.len() <= 256)
}

fn valid_fraction(value: f64) -> bool {
    value.is_finite() && (0.0..=1.0).contains(&value)
}

fn load_saved_state(path: Option<&Path>) -> SavedWindowState {
    path.and_then(|path| fs::read_to_string(path).ok())
        .and_then(|contents| serde_json::from_str::<SavedWindowState>(&contents).ok())
        .filter(state_is_valid)
        .unwrap_or_default()
}

fn save_state(path: Option<&Path>, shared_state: &SharedWindowState) {
    let Some(path) = path else { return };
    let Ok(state) = shared_state.0.lock() else {
        eprintln!("could not save Tagak window state because its lock is poisoned");
        return;
    };
    let Ok(contents) = serde_json::to_vec(&*state) else {
        eprintln!("could not serialize Tagak window state");
        return;
    };

    if let Err(error) = write_state(path, &contents) {
        eprintln!("could not save Tagak window state: {error}");
    }
}

fn write_state(path: &Path, contents: &[u8]) -> std::io::Result<()> {
    if let Some(directory) = path.parent() {
        fs::create_dir_all(directory)?;
    }
    let temporary_path = path.with_extension("json.tmp");
    fs::write(&temporary_path, contents)?;

    #[cfg(windows)]
    if path.exists() {
        fs::remove_file(path)?;
    }

    if let Err(error) = fs::rename(&temporary_path, path) {
        let _ = fs::remove_file(&temporary_path);
        return Err(error);
    }
    Ok(())
}

fn select_monitor(
    state: &SavedWindowState,
    monitors: &[Monitor],
    primary: Option<&Monitor>,
) -> Option<Monitor> {
    state
        .monitor_name
        .as_ref()
        .and_then(|name| {
            monitors
                .iter()
                .find(|monitor| monitor.name() == Some(name))
                .cloned()
        })
        .or_else(|| primary.cloned())
        .or_else(|| monitors.first().cloned())
}

fn initial_inner_size(monitor: Option<&Monitor>, minimum: LogicalSize<f64>) -> LogicalSize<f64> {
    monitor
        .and_then(work_area)
        .map(|area| {
            let (max_width, max_height) = max_inner_extent(area);
            LogicalSize::new(
                fit_dimension(DEFAULT_WIDTH, max_width, minimum.width),
                fit_dimension(DEFAULT_HEIGHT, max_height, minimum.height),
            )
        })
        .unwrap_or_else(|| LogicalSize::new(DEFAULT_WIDTH, DEFAULT_HEIGHT))
}

fn minimum_inner_size(monitors: &[Monitor]) -> LogicalSize<f64> {
    let mut widths = Vec::new();
    let mut heights = Vec::new();
    for monitor in monitors {
        if let Some(area) = work_area(monitor) {
            let (width, height) = max_inner_extent(area);
            widths.push(width);
            heights.push(height);
        }
    }

    LogicalSize::new(
        widths
            .into_iter()
            .reduce(f64::min)
            .map_or(MIN_WIDTH, |width| MIN_WIDTH.min(width)),
        heights
            .into_iter()
            .reduce(f64::min)
            .map_or(MIN_HEIGHT, |height| MIN_HEIGHT.min(height)),
    )
}

fn work_area(monitor: &Monitor) -> Option<WorkArea> {
    let rectangle = monitor.work_area();
    let scale_factor = monitor.scale_factor();
    if !scale_factor.is_finite()
        || scale_factor <= 0.0
        || rectangle.size.width == 0
        || rectangle.size.height == 0
    {
        return None;
    }

    Some(WorkArea {
        x: rectangle.position.x,
        y: rectangle.position.y,
        width: rectangle.size.width,
        height: rectangle.size.height,
        scale_factor,
    })
}

fn max_inner_extent(area: WorkArea) -> (f64, f64) {
    (
        (area.width as f64 / area.scale_factor - OUTER_WIDTH_RESERVE).max(1.0),
        (area.height as f64 / area.scale_factor - OUTER_HEIGHT_RESERVE).max(1.0),
    )
}

fn fit_dimension(preferred: f64, maximum: f64, minimum: f64) -> f64 {
    let maximum = maximum.max(1.0);
    preferred.clamp(minimum.min(maximum), maximum)
}

fn placement_for(state: &SavedWindowState, area: WorkArea) -> WindowPlacement {
    let (max_width, max_height) = max_inner_extent(area);
    let width = fit_dimension(state.width, max_width, MIN_WIDTH);
    let height = fit_dimension(state.height, max_height, MIN_HEIGHT);
    let physical_width = physical_dimension(width, area.scale_factor);
    let physical_height = physical_dimension(height, area.scale_factor);
    let reserved_outer_width = physical_dimension(OUTER_WIDTH_RESERVE, area.scale_factor);
    let reserved_outer_height = physical_dimension(OUTER_HEIGHT_RESERVE, area.scale_factor);
    let outer_width = physical_width.saturating_add(reserved_outer_width);
    let outer_height = physical_height.saturating_add(reserved_outer_height);
    let x_span = area.width.saturating_sub(outer_width);
    let y_span = area.height.saturating_sub(outer_height);

    WindowPlacement {
        width,
        height,
        physical_width,
        physical_height,
        x: saturating_position(area.x, x_span, state.x_fraction),
        y: saturating_position(area.y, y_span, state.y_fraction),
    }
}

fn physical_dimension(logical: f64, scale_factor: f64) -> u32 {
    (logical * scale_factor).round().clamp(1.0, u32::MAX as f64) as u32
}

fn saturating_position(origin: i32, span: u32, fraction: f64) -> i32 {
    let offset = (span as f64 * fraction.clamp(0.0, 1.0)).round();
    (origin as f64 + offset).clamp(i32::MIN as f64, i32::MAX as f64) as i32
}

fn position_fraction(position: i32, origin: i32, span: u32) -> f64 {
    if span == 0 {
        return 0.5;
    }
    ((position as f64 - origin as f64) / span as f64).clamp(0.0, 1.0)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn saved_state() -> SavedWindowState {
        SavedWindowState {
            width: 800.0,
            height: 600.0,
            monitor_name: Some("Display A".into()),
            x_fraction: 0.5,
            y_fraction: 0.5,
            ..SavedWindowState::default()
        }
    }

    fn work_area(width: u32, height: u32, scale_factor: f64) -> WorkArea {
        WorkArea {
            x: 0,
            y: 0,
            width,
            height,
            scale_factor,
        }
    }

    #[test]
    fn corrupt_or_incompatible_saved_state_uses_defaults() {
        let path =
            std::env::temp_dir().join(format!("tagak-window-state-{}.json", std::process::id()));
        fs::write(&path, "{broken").unwrap();
        assert_eq!(load_saved_state(Some(&path)), SavedWindowState::default());

        let incompatible = SavedWindowState {
            version: WINDOW_STATE_VERSION + 1,
            ..saved_state()
        };
        fs::write(&path, serde_json::to_vec(&incompatible).unwrap()).unwrap();
        assert_eq!(load_saved_state(Some(&path)), SavedWindowState::default());
        fs::remove_file(path).unwrap();
    }

    #[test]
    fn valid_saved_state_round_trips() {
        let state = saved_state();
        let serialized = serde_json::to_string(&state).unwrap();
        let decoded = serde_json::from_str::<SavedWindowState>(&serialized).unwrap();
        assert!(state_is_valid(&decoded));
        assert_eq!(decoded, state);
    }

    #[test]
    fn saved_geometry_is_clamped_inside_a_changed_work_area() {
        let mut state = saved_state();
        state.width = 2000.0;
        state.height = 1400.0;
        state.x_fraction = 1.0;
        state.y_fraction = 1.0;

        let area = work_area(1600, 900, 1.0);
        let placement = placement_for(&state, area);

        assert_eq!(placement.width, 1552.0);
        assert_eq!(placement.height, 820.0);
        assert_eq!(placement.x, 0);
        assert_eq!(placement.y, 0);
        assert!(placement.physical_width + 48 <= area.width);
        assert!(placement.physical_height + 80 <= area.height);
    }

    #[test]
    fn logical_size_is_preserved_across_dpi_changes() {
        let state = saved_state();
        let placement = placement_for(&state, work_area(3200, 2000, 2.0));

        assert_eq!(placement.width, 800.0);
        assert_eq!(placement.height, 600.0);
        assert_eq!(placement.physical_width, 1600);
        assert_eq!(placement.physical_height, 1200);
        assert_eq!(placement.x, 752);
        assert_eq!(placement.y, 320);
    }

    #[test]
    fn small_work_areas_reduce_the_window_minimum_and_keep_position_visible() {
        let area = work_area(500, 450, 1.0);
        let minimum = LogicalSize::new(
            MIN_WIDTH.min(500.0 - OUTER_WIDTH_RESERVE),
            MIN_HEIGHT.min(450.0 - OUTER_HEIGHT_RESERVE),
        );
        let size = initial_inner_size_from_area(area, minimum);
        let placement = placement_for(&SavedWindowState::default(), area);

        assert_eq!(size.width, 452.0);
        assert_eq!(size.height, 370.0);
        assert_eq!(placement.width, 452.0);
        assert_eq!(placement.height, 370.0);
        assert_eq!(placement.x, 0);
        assert_eq!(placement.y, 0);
    }

    fn initial_inner_size_from_area(area: WorkArea, minimum: LogicalSize<f64>) -> LogicalSize<f64> {
        let (max_width, max_height) = max_inner_extent(area);
        LogicalSize::new(
            fit_dimension(DEFAULT_WIDTH, max_width, minimum.width),
            fit_dimension(DEFAULT_HEIGHT, max_height, minimum.height),
        )
    }

    #[test]
    fn out_of_range_position_data_is_rejected() {
        let mut state = saved_state();
        state.x_fraction = 1.1;
        assert!(!state_is_valid(&state));
    }
}
