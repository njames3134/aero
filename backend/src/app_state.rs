use crate::services::strava_service::StravaService;
use crate::services::activities::ActivityService;

#[derive(Clone)]
pub struct AppState {
    pub activity: ActivityService,
    pub strava: StravaService,
}
