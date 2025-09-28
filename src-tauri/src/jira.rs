use reqwest::Client;
use serde_json::Value;

#[derive(Clone)]
pub struct JiraClient {
	base: String,
	email: String,
	token: String,
	http: Client,
}

impl JiraClient {
	pub fn new(base: impl Into<String>, email: impl Into<String>, token: impl Into<String>) -> Self {
		Self {
			base: base.into(),
			email: email.into(),
			token: token.into(),
			http: Client::new(),
		}
	}

	fn url(&self, path: &str) -> String {
		format!("{}/{}", self.base.trim_end_matches('/'), path.trim_start_matches('/'))
	}

	pub async fn get_issue(&self, issue_key: &str) -> Result<Value, String> {
		let res = self.http
			.get(self.url(&format!("rest/api/3/issue/{}", issue_key)))
			.basic_auth(&self.email, Some(&self.token))
			.send().await.map_err(to_s)?;
		if !res.status().is_success() {
				return Err(format!("{} {}", res.status(), res.text().await.unwrap_or_default()));
		}
		res.json::<Value>().await.map_err(to_s)
	}

	pub async fn search(&self, jql: &str, fields: &[String], max_results: u32) -> Result<Value, String> {
		let mut start_at = 0u32;
		let mut issues = Vec::new();
		let page = 100u32; // Jira Cloud page cap

		loop {
				let body = serde_json::json!({
						"jql": jql,
						"startAt": start_at,
						"maxResults": page,
						"fields": fields,
				});

				let res = self.http
						.post(self.url("rest/api/3/search"))
						.basic_auth(&self.email, Some(&self.token))
						.json(&body)
						.send().await.map_err(to_s)?;

				if res.status() == reqwest::StatusCode::TOO_MANY_REQUESTS {
						let secs = res.headers()
								.get("Retry-After")
								.and_then(|h| h.to_str().ok())
								.and_then(|s| s.parse::<u64>().ok())
								.unwrap_or(2);
						tokio::time::sleep(std::time::Duration::from_secs(secs)).await;
						continue;
				}

				if !res.status().is_success() {
						return Err(format!("{} {}", res.status(), res.text().await.unwrap_or_default()));
				}

				let v: Value = res.json().await.map_err(to_s)?;
				let total = v["total"].as_u64().unwrap_or(0) as u32;
				if let Some(arr) = v["issues"].as_array() {
						issues.extend_from_slice(arr);
				}

				start_at += page;
				if start_at >= total || (issues.len() as u32) >= max_results {
						break;
				}
		}

		Ok(serde_json::json!({ "issues": issues }))
	}
}

fn to_s<E: std::fmt::Display>(e: E) -> String { e.to_string() }
