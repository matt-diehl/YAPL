var yapl = require('../');

// Test Data (TEMPORARY)

yapl({
    settings: {
        css: './example/css/**/*.scss',
        partials: './example/templates-main/partials/**/*.hbs',
        data: './example/templates-main/data/**/*.{json,yaml}',
        displayTemplates: './example/ProductionTemplates/**/*.html',
        buildDir: './example/styleguide',
        outputJsonFile: './example/styleguide.json',
        libraryIndex: './lib/templates/index.hbs',
        libraryLayout: './lib/layouts/default.hbs',
        libraryPartials: './lib/partials/**/*.hbs',
        siteRoot: './example' // TODO: Any better way to handle this?
    },
    sections: [{
        name: 'Micro Elements',
        landingTemplate: './lib/templates/micro-element-landing.hbs',
        childTemplate: './lib/templates/micro-element.hbs',
        css: './example/css/modules/micro/**/*.scss',
    }, {
        name: 'Macro Elements',
        landingTemplate: './lib/templates/macro-element-landing.hbs',
        childTemplate: './lib/templates/macro-element.hbs',
        css: './example/css/modules/macro/**/*.scss'
    }, {
        name: 'Layouts',
        landingTemplate: './lib/templates/layout-landing.hbs',
        childTemplate: './lib/templates/layout.hbs'
    }, {
        name: 'Display Templates',
        landingTemplate: './lib/templates/display-templates-landing.hbs'
    }, {
        name: 'Image Sizes',
        landingTemplate: './lib/templates/image-sizes-landing.hbs'
    }, {
        name: 'Appendix',
        landingTemplate: './lib/templates/appendix.hbs'
    }]
});