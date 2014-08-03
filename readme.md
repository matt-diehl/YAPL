# Node - Pattern Library

Pattern Library is a simple task which returns (and optionally saves to file) a JSON object containing everything needed to output a style guide/pattern library. This happens by searching given directories for CSS/SCSS files containing style guide "blocks" which document a particular front end module.

Style guide "blocks" are just YAML data inside of a multiline comment, like so:

```css

/* SG
name: Submit Button
notes: The submit button is great. Use it all the time.
partial: btn
context: btn.submit
*/
```

Any data can be passed, as long as it's formatted correctly as YAML, but the Pattern Library task can only generate the HTML example if a "partial" is passed and, optionally, a context, if the partial requires it. This also assumes you are using handlebars files for partials.

The final object is formed based on the folder structure of the given CSS directory.