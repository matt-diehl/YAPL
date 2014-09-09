var yapl = require('../');

yapl.init({
    cssDir: './example/css',
    partialsDir: './example/templates-main/partials',
    templatesDir: './example/ProductionTemplates',
    dataDir: './example/templates-main/data',
    outputFile: './example/styleguide.json'
});