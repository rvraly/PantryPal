export function normalizeName(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function ingredientSuggestions(vocabulary, query, selected) {
  const term = normalizeName(query);
  return vocabulary.filter(item => !selected.includes(item.name) &&
    [item.name, ...item.aliases].some(name => normalizeName(name).includes(term)))
    .sort((a, b) => a.name.localeCompare(b.name)).slice(0, 8);
}

export function rankRecipes(recipes, selected, category = 'All recipes') {
  const available = new Set(selected);
  return recipes.filter(recipe => category === 'All recipes' || recipe.category === category)
    .map(recipe => {
      const unique = new Map();
      recipe.ingredients.filter(item => item.required_for_matching).forEach(item => {
        const key = [...item.match_options].sort().join('|');
        if (!unique.has(key)) unique.set(key, item.match_options);
      });
      const requirements = [...unique.values()];
      const missing = requirements.filter(options => !options.some(name => available.has(name)));
      const matched = requirements.length - missing.length;
      return { recipe, missing, matched, total: requirements.length,
        ratio: requirements.length ? matched / requirements.length : 0 };
    })
    .filter(result => selected.length === 0 || result.matched > 0)
    .sort((a, b) => selected.length === 0
      ? a.total - b.total || a.recipe.name.localeCompare(b.recipe.name)
      : b.ratio - a.ratio || a.missing.length - b.missing.length || a.recipe.name.localeCompare(b.recipe.name));
}
