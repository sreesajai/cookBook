module.exports = Recipe => {
  require('./addRecipe')(Recipe);
  require('./editRecipe')(Recipe);
  require('./displayRecipe')(Recipe);
}