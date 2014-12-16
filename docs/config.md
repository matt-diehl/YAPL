# YAPL Structure


## Config Skeleton

``` yaml
styles:
  settings:
    css: /path/to/css/**/*.scss
    partials: /path/to/partials/**/*.hbs
    data: /path/to/data/**/*.json
    displayTemplates: /path/to/displaytemplates/**/*.html
    buildDir: /path/to/build/dir
    index: /path/to/index/template.hbs
  sections:
    -
      name: Friendly Name for Section
      landingTemplate: /path/to/section/landing/template.hbs
      childTemplate: /path/to/single/module/template.hbs
      css: /path/to/css/**/*.scss
```

### Example Config

```js
settings: {
    css: '/css/**/*.scss',
    partials: '/templates-main/partials/**/*.hbs',
    data: '/templates-main/data/**/*.{json,yaml}',
    displayTemplates: '/ProductionTemplates/**/*.html',
    buildDir: '/path/to/build/dir',
    index: '/path/to/index/template.hbs'
},
sections: [{
    name: 'Micro Elements',
    landingTemplate: 'micro-element-landing.hbs',
    childTemplate: 'micro-element.hbs',
    css: '/css/modules/micro/**/*.scss',
}, {
    name: 'Macro Elements',
    landingTemplate: 'macro-element-landing.hbs',
    childTemplate: 'macro-element.hbs',
    css: '/css/modules/macro/**/*.scss',
}, {
    name: 'Layouts',
    landingTemplate: 'layouts-landing.hbs',
    childTemplate: 'layout.hbs',
    css: '/css/modules/macro/**/*.scss',
}, {
    name: 'Display Templates',
    landingTemplate: 'display-templates-landing.hbs'
}, {
    name: 'Image Sizes',
    landingTemplate: 'image-sizes-landing.hbs'
}]
```

## YAPL Object Skeleton

``` yaml
styles:
  settings:
    css: /path/to/css/**/*.scss
    partials: /path/to/partials/**/*.hbs
    data: /path/to/data/**/*.json
    displayTemplates: /path/to/displaytemplates/**/*.html
    buildDir: /path/to/build/dir
    index: /path/to/index/template.hbs
    link: /path/to/build/dir/index.html
  sections:
    -
      name: Friendly Name for Section
      nameCamelCase: friendlyNameForSection
      nameCssCase: friendly-name-for-section
      landingTemplate: /path/to/section/landing/template.hbs
      childTemplate: /path/to/single/module/template.hbs
      css: /path/to/css/**/*.scss
      link: /path/to/section/index.html
      cssFiles: []
      children:
        -
          child:
            name: Child Name
            nameCamelCase: childName
            nameCssCase: child-name
            link: /path/to/section/child-name.html
            blocks:
              -
                name: Block Name
                nameCamelCase: blockName
                nameCssCase: block-name
                notes: block description
                partial: partial
                context: partial.context
                selector: .block-name
                link: /path/to/section/child-name.html#block-name
                html: <html>
                references: {}
  displayTemplates:
    -
      name: Friendly Name For Template
      group: group name (ex. batch-1)
      notes: Notes about template
      link: link to template
      hide: true/false
  imageSizes:
    -
      dimensions: [width, height]
      ratio: width / height
      html: <html>
      references:
        sections:
          -
            children:
              -
                child:
                  name: Child Name
                  ...
        displayTemplates:
          -
            name: Friendly Name For Template
            ...

```

## Build Process

1.  Use settings/sections as base of YAPL styles object.

2.  For each object in 'sections' array, find all matching css/scss files for each section

3.  For each css/scss file: function getSectionChildren()

    - Find all YAPL blocks (func getYAPLBlocks)
    - If at least one block exists for a particular file, add that file as a child of the section.

4.  For each YAPL section:

    - Prepare templating setup
    - For each section child:


## API

setup
  - createYAPLObj
buildModules
collectImageSizes (https://github.com/netroy/image-size)
  - collectImageSizesFromTemplates
  - collectImageSizesFromSections
crossLinkModules
buildLibrary

#### createYAPLObj(settings: obj)

Takes the settings object as a required argument. Returns the base object for the rest of the process to work off of.

#### getSectionChildren(section: obj)

Takes a single section object as a required argument. Returns an array of



