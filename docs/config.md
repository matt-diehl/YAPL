# YAPL Structure


## Config

- sections (array):
  - section (object)
    - name                  : converted to camelCase version to access is JSON, and dash-ified, lowercase version for folder/template ("micro-elements")
    - landingTemplate       : renders the landing template for the section ("/micro-modules/index.html")
    - childTemplate         : renders a single module from the section ("/micro-modules/button.html")
    - cssDir
    - partialsDir
    - dataDir


### Example Config

settings: {
    cssDir: '/css/modules/micro',
    partialsDir: '/templates-main/partials',
    dataDir: '/templates-main/data'
},
sections: [{
    name: 'Home',
    landingTemplate: 'home.hbs'
}, {
    name: 'Micro Elements',
    landingTemplate: 'micro-element-landing.hbs',
    childTemplate: 'micro-element.hbs',
    cssDir: '/css/modules/micro',
    partialsDir: '/templates-main/partials/micro',
    dataDir: '/templates-main/data/micro'
}, {
    name: 'Macro Elements',
    landingTemplate: 'macro-element-landing.hbs',
    childTemplate: 'macro-element.hbs',
    cssDir: '/css/modules/macro',
    partialsDir: '/templates-main/partials/macro',
    dataDir: '/templates-main/data/macro'
}, {
    name: 'Layouts',
    landingTemplate: 'layout-landing.hbs',
    childTemplate: 'layout.hbs',
    cssDir: '/css/modules/macro',
    partialsDir: '/templates-main/partials/macro',
    dataDir: '/templates-main/data/macro'
}, {
    name: 'Display Templates',
    childTemplate: 'macro-element.hbs',
    cssDir: '/css/modules/macro',
    partialsDir: '/templates-main/partials/macro',
    dataDir: '/templates-main/data/macro'
}]