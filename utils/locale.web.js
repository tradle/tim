const defaultCountryByLanguage = {
  en: 'UK'
}

let language = navigator.language || navigator.userLanguage || (navigator.languages && navigator.languages[0])
let country

if (language) {
  if (language.indexOf('-') === -1) {
    country = defaultCountryByLanguage[language]
  } else {
    const parts = language.split('-')
    language = parts[0]
    country = parts[1]
  }
}

module.exports = {
  language,
  country
}
