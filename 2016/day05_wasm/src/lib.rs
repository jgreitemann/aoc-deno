use wasm_bindgen::prelude::*;

#[wasm_bindgen(js_name = crackPassword)]
pub fn crack_password(input: &str) -> String {
    String::from_utf8(
        (0..)
            .map(|i| format!("{input}{i}"))
            .map(md5::compute)
            .map(|digest| format!("{digest:x}"))
            .filter(|hash| hash.starts_with("00000"))
            .take(8)
            .map(|hash| hash.as_bytes()[5])
            .collect(),
    )
    .unwrap()
}
