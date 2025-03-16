mod utils;

use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use scraper::{Html, Selector, ElementRef};
use scraper::error::SelectorErrorKind;
use serde_json::{Value, Map};

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello from Rust, {}!", name)
}


#[wasm_bindgen]
pub fn scrape_magic(content: &str, instructions: &str) -> String {
    let scheme: Result<Scheme, _> = serde_json::from_str(instructions);

    let Ok(scheme) = scheme else { return serde_json::json!({ "error": "couldnt decipher instructions" }).to_string() };

    let res = match scheme.process_string(content) {
        Ok(json) => { json },
        Err(why) => { serde_json::json!({ "error": why.to_string() })}
    };

    res.to_string()
}

#[derive(Debug, Clone, thiserror::Error, PartialEq)]
pub enum Error {
    #[error("The '{feature}' feature is not implemented yet.")]
    NotImplemented { feature: String },
    #[error("'{path}' is not a valid path.")]
    InvalidPath { path: String },
    #[error("No element found using the '{path}' path.")]
    NoElementFound { path: String },
    #[error("Field '{field}' expected {expected} values, but found {found}.")]
    MismatchedFieldCount { field: String, expected: usize, found: usize },
}

trait CrateErrConvert {
    fn to_err(self, path: &str) -> Result<Selector, Error>;
}

impl CrateErrConvert for Result<Selector, SelectorErrorKind<'_>> {
    fn to_err(self, path: &str) -> Result<Selector, Error> {
        self.map_err(|_| Error::InvalidPath { path: path.to_string() })
    }
}



#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "UPPERCASE")]
pub enum Scheme {
    Object(ObjectScheme),
    List(ListScheme),
    String(StringScheme),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ObjectScheme {
    fields: Vec<KVPair>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ListScheme {
    pub element_scheme: Box<Scheme>,
    pub path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StringScheme {
    pub path: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct KVPair {
    pub key: String,
    pub value: Scheme,
}

impl Scheme {
    pub fn process_string(&self, html: &str) -> Result<Value, Error> {
        let html = Html::parse_document(html);
        self.process(&html.root_element())
    }

    pub fn process(&self, element: &ElementRef) -> Result<Value, Error> {
        match self {
            Self::Object(ObjectScheme { fields }) => {
                let mut map = Map::with_capacity(fields.len());

                for KVPair { key, value } in fields {
                    let value_json = value.process(element)?;
                    map.insert(key.clone(), value_json);
                }

                Ok(Value::Object(map))
            },
            Self::String(StringScheme { path }) => {
                let selector = Selector::parse(path).to_err(path)?;

                let res = element.select(&selector)
                    .next()
                    .ok_or(Error::NoElementFound { path: path.clone() })?
                    .inner_html();

                Ok(Value::String(res))
            },
            Self::List(ListScheme { element_scheme, path }) => {
                let list_selector = Selector::parse(path).to_err(path)?;

                let list_element = element.select(&list_selector)
                    .next()
                    .ok_or(Error::NoElementFound { path: path.clone() })?;

                let res = element_scheme.process_many(&list_element)?;

                println!("-- List -- res vec");
                dbg!(&res);

                Ok(Value::Array(res))
            }
        }
    }

    pub fn process_many(&self, element: &ElementRef) -> Result<Vec<Value>, Error> {
        match self {
            Self::Object(ObjectScheme { fields }) => {
                println!("examinging {:?}", fields);
                let mut field_values: Vec<Vec<Value>> = vec![];

                for KVPair { key, value } in fields {
                    let values = value.process_many(element)?;

                    if let Some(prev_len) = field_values.first().map(|v| v.len()) {
                        if prev_len != values.len() {
                            return Err(Error::MismatchedFieldCount {
                                field: key.clone(),
                                expected: prev_len,
                                found: values.len(),
                            });
                        }
                    }

                    field_values.push(values);
                }

                let num_elements = field_values[0].len();
                println!("we have {}", num_elements);
                let mut objects = vec![];

                for i in 0..num_elements {
                    let mut map = Map::new();
                    for (j, KVPair { key, .. }) in fields.iter().enumerate() {
                        println!("inserting {}", key);
                        println!("{:?}", field_values);
                        println!("gonna use ({j}, {i})");
                        map.insert(key.clone(), field_values[j][i].clone());
                    }
                    objects.push(Value::Object(map));
                }

                Ok(objects)
            }
            Self::String(StringScheme { path }) => {
                let selector = Selector::parse(path).to_err(path)?;

                let what = element.select(&selector)
                    .map(|el| Value::String(el.inner_html()))
                    .collect();

                Ok(what)
            }
            // TODO: figure out why this works and how to break it
            Self::List(ListScheme { element_scheme, path }) => {
                // Err(Error::NotImplemented { feature: "List of Lists".into() })
                let list_selector = Selector::parse(path).to_err(path)?;

                let list_elements = element.select(&list_selector)
                    .collect::<Vec<_>>();

                let mut res = vec![];
                for list_element in list_elements {
                    let processed_element = element_scheme.process_many(&list_element)?;
                    println!("-- List of Lists -- processed_element:\n{:?}", processed_element);
                    res.push(Value::Array(processed_element));
                }

                println!("-- List of Lists -- res vec:\n{:?}", res);

                Ok(res)
            }
        }
    }
}
