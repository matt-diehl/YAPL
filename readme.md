# Node - YAPL

YAPL (Yet Another Pattern Library) does a whole lot of things to rapidly build a pattern library for a website or app. This happens by searching your HTML/CSS for YAPL "blocks" which document a particular front end module or template.

Style guide "blocks" are just YAML data inside of a multiline comment, like this (CSS):

```css
/* YAPL
name: Submit Button
notes: The submit button is great. Use it all the time.
partial: btn
context: btn.submit
*/
```

Or this (HTML):

```html
<!-- YAPL
name: Master Sub
notes: The master sub template is a typical sub page containing all usual global elements with a rich text body area.
-->
```

Any data can be passed, as long as it's formatted correctly as YAML, but the YAPL task can only generate the HTML example if a "partial" is passed and, optionally, a context, if the partial requires it. This also assumes you are using handlebars files for partials.

In addition to finding modules/templates, YAPL also cross links to show where they are being used, and collects all of the image sizes used throughout the site, and where the are used.

## Install

```
npm install yapl
```

## Usage

```js
var yapl = require('yapl');

yapl({
    settings: {
        css: './example/css/**/*.scss',
        partials: './example/templates-main/partials/**/*.hbs',
        data: './example/templates-main/data/**/*.{json,yaml}',
        displayTemplates: './example/ProductionTemplates/**/*.html',
        buildDir: './example/styleguide',
        siteRoot: './example'
    },
    sections: [{
        name: 'Micro Elements',
        landingTemplate: './hbs/templates/section-landing.hbs',
        childTemplate: './hbs/templates/micro-element.hbs',
        css: './example/css/modules/micro/**/*.scss',
    }, {
        name: 'Macro Elements',
        landingTemplate: './hbs/templates/section-landing.hbs',
        childTemplate: './hbs/templates/macro-element.hbs',
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
```



While YAPL provides some great defaults out of the box, it's also highly customizable.








## Development TO-DO List:

- Add layouts search/collect