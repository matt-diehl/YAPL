var yapl = require('../');

// Test Data

yapl({
    settings: {
        css: './example/css/**/*.scss',
        partials: './example/templates-main/partials/**/*.hbs',
        data: './example/templates-main/data/**/*.{json,yaml}',
        displayTemplates: './example/ProductionTemplates/**/*.html',
        buildDir: './example/styleguide',
        outputJsonFile: './example/styleguide.json',
        libraryIndex: './hbs/templates/index.hbs',
        libraryLayout: './hbs/layouts/default.hbs',
        libraryPartials: './hbs/partials/**/*.hbs',
        siteRoot: './example' // TODO: Any better way to handle this?
    },
    sections: [{
        name: 'Micro Elements',
        landingTemplate: './hbs/templates/section-landing.hbs',
        childTemplate: './hbs/templates/module.hbs',
        css: './example/css/modules/micro/**/*.scss',
    }, {
        name: 'Macro Elements',
        landingTemplate: './hbs/templates/section-landing.hbs',
        childTemplate: './hbs/templates/module.hbs',
        css: './example/css/modules/macro/**/*.scss'
    }, {
        name: 'Display Templates',
        landingTemplate: './hbs/templates/display-templates-landing.hbs'
    }, {
        name: 'Image Sizes',
        landingTemplate: './hbs/templates/image-sizes-landing.hbs'
    }, {
        name: 'Appendix',
        landingTemplate: './hbs/templates/appendix.hbs'
    }]
});