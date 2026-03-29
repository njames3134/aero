use serde::{Serialize, Deserialize};

#[derive(Serialize)]
pub struct Activity {
    pub id: i32,
    pub user_id: i32,
    pub name: String,
    pub r#type: String,
    pub distance: f64,
    pub moving_time: i32,
}

#[derive(Deserialize)]
pub struct CreateActivity {
    pub user_id: i32,
    pub name: Option<String>,
    pub r#type: Option<String>,
    pub distance: Option<f64>,
    pub moving_time: Option<i32>,
}
