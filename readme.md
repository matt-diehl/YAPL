# Node - YAPL

<img src="https://david-dm.org/matt-diehl/YAPL.svg">

YAPL (Yet Another Pattern Library) does a whole lot of things to rapidly build a pattern library for a website or app. This happens by searching your HTML/CSS for YAPL "blocks" which document a particular front end module or template. To use YAPL with Grunt, checkout [Grunt-YAPL](https://github.com/matt-diehl/Grunt-YAPL).

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

Multiline notes could be handled with [scalars](http://www.yaml.org/spec/1.2/spec.html#id2760844). Refer to the [YAML spec](http://www.yaml.org/spec/1.2/spec.html) for a complete rundown of how to format YAML.

By default, YAPL parses "notes" as markdown on the template level, using the excellent [Handlebars Helpers Library](https://github.com/assemble/handlebars-helpers). All of these helpers are available when editing/creating new pattern library templates.

Any data can be passed, as long as it's formatted correctly as YAML, but the YAPL task can only generate the HTML example if a "partial" is passed and, optionally, a context, if the partial requires it. **YAPL only supports using handlebars files for partials.** If there is a need for other templating engines, please file an issue.

In addition to finding modules/templates, YAPL also cross links to show where modules/templates are being used in a project. The same applies for all images referenced in any module/template - a complete list of images and their ratios is generated, including a list of where each size is used.

## Install

```
npm install yapl
```

## Usage

YAPL relies on a detailed configuration so it knows where to search your project for files, what sections to include in the built library, and where to build. Below is an example configuration for a pattern library that contains 5 sections.

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
```

The first section in the config is "settings." At a minimum, you must provide a globbing pattern for the display templates of your project, the build directory (the folder where the project will build to), and the site's root folder (for outputting proper paths).

You will also likely want to provide globbing patterns for your project's partials/data files in the settings section. The "settings" section will act as the defaults for all pattern library "sections," although these can be overwritten in each section.

Each "section" defined should contain at least a "name" and "landingTemplate." The name appears in navigation, breadcrumbs, etc. The landing for that section would be built as "index.html" with a directory named after the section. So, the "Display Templates" section landing would build to "./example/styleguide/display-templates/index.html."

YAPL provides default templates for the library's home/index, a section landing, display templates landing, image sizes landing, and a single module page. To alter the format of your library's templates, create new templates for the ones you would like to override, and provide the path in your YAPL configuration.


### Options

While YAPL provides some great defaults out of the box, it's also highly customizable.








## Development TO-DO List:

- Add layouts search/collect