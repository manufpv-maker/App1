/**
 * Psalm Search Utility
 * Unterstützt flexible Suche nach:
 * - Nummer (1, 23, 150)
 * - Abkürzung + Nummer (к5, юс131, п1005)
 * - Vollständiger Name + Nummer (Кувшинчик 5)
 * - Psalm-Titel (erste 3 Wörter)
 */

const COLLECTIONS = {
  'п': { name: 'Песни Юности', abbr: 'п', max: 1005 },
  'к': { name: 'Кувшинчик', abbr: 'к', max: 89 },
  'н': { name: 'Новые псалмы', abbr: 'н', max: 217 },
  'г': { name: 'Горлица', abbr: 'г', max: 571 },
  'с': { name: 'Псалмы Сиона', abbr: 'с', max: 525 },
  'м': { name: 'Мы поём Господу', abbr: 'м', max: 200 },
  'юс': { name: 'Мелодия юных сердец', abbr: 'юс', max: 850 },
  'гх': { name: 'Голосок хваления', abbr: 'гх', max: 393 }
};

// Нормализовать строку для поиска
function normalize(str) {
  return str.toLowerCase().trim();
}

// Найти коллекцию по названию или аббревиатуре
function findCollection(query) {
  const normalized = normalize(query);
  
  for (const [abbr, info] of Object.entries(COLLECTIONS)) {
    if (normalized === abbr || 
        normalized === normalize(info.name) ||
        normalize(info.name).startsWith(normalized)) {
      return abbr;
    }
  }
  
  return null;
}

// Парсить поисковый запрос
// Возвращает { collection, number, searchType }
function parseQuery(query) {
  const normalized = normalize(query);
  
  // Тип 1: Только число (1, 23, 150)
  if (/^\d+$/.test(normalized)) {
    return {
      collection: 'п',
      number: parseInt(normalized),
      searchType: 'number'
    };
  }
  
  // Тип 2: Абkürzung + число (к5, юс131, п1005)
  const abbrevMatch = normalized.match(/^([а-яю]+)(\d+)$/);
  if (abbrevMatch) {
    const [, abbr, num] = abbrevMatch;
    if (COLLECTIONS[abbr]) {
      return {
        collection: abbr,
        number: parseInt(num),
        searchType: 'abbreviation'
      };
    }
  }
  
  // Тип 3: Полное имя + число (Кувшинчик 5, Песни Юности 1)
  const nameMatch = normalized.match(/^([а-яё\s]+?)\s+(\d+)$/);
  if (nameMatch) {
    const [, name, num] = nameMatch;
    const col = findCollection(name);
    if (col) {
      return {
        collection: col,
        number: parseInt(num),
        searchType: 'fullname'
      };
    }
  }
  
  return null;
}

// Валидировать номер для коллекции
function isValidNumber(collection, number) {
  if (!COLLECTIONS[collection]) return false;
  return number >= 1 && number <= COLLECTIONS[collection].max;
}

// Поиск по названию (первые 3 слова)
function searchByTitle(psalms, query) {
  const normalized = normalize(query);
  
  return psalms.filter(psalm => {
    const titleWords = psalm.title.split(/\s+/).slice(0, 3);
    const titleNorm = normalize(titleWords.join(' '));
    
    return titleNorm.includes(normalized) || normalized.includes(titleNorm);
  });
}

// Главная функция поиска
function searchPsalm(psalms, query) {
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  const parsed = parseQuery(query);
  
  if (parsed) {
    // Числовой поиск
    if (!isValidNumber(parsed.collection, parsed.number)) {
      return {
        error: `❌ Номер ${parsed.number} не существует в коллекции "${COLLECTIONS[parsed.collection].name}"`,
        max: COLLECTIONS[parsed.collection].max
      };
    }
    
    const result = psalms.find(p => 
      p.collection === parsed.collection && p.number === parsed.number
    );
    
    return result ? [result] : { error: '❌ Псалм не найден' };
  }
  
  // Поиск по названию
  const results = searchByTitle(psalms, query);
  
  if (results.length === 0) {
    return { error: '❌ Ничего не найдено' };
  }
  
  return results;
}

// Получить все Псалмы коллекции
function getPsalmsByCollection(psalms, collection) {
  return psalms.filter(p => p.collection === collection);
}

// Получить список всех коллекций
function getCollections() {
  return Object.entries(COLLECTIONS).map(([abbr, info]) => ({
    abbr,
    name: info.name,
    max: info.max
  }));
}

// Экспорт для Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    COLLECTIONS,
    parseQuery,
    isValidNumber,
    searchPsalm,
    searchByTitle,
    getPsalmsByCollection,
    getCollections,
    findCollection,
    normalize
  };
}

// Экспорт для браузера
if (typeof window !== 'undefined') {
  window.PsalmSearch = {
    COLLECTIONS,
    parseQuery,
    isValidNumber,
    searchPsalm,
    searchByTitle,
    getPsalmsByCollection,
    getCollections,
    findCollection,
    normalize
  };
}
