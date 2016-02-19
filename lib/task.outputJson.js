'use strict';

const fs = require('fs'),
    path = require('path');


/**
 * Task to output Yapl data to a JSON file.
 * @module yapl/task.outputJson
 */
module.exports = {

    /**
     * Initialize a new outputJson object.
     * @param  {Object} [data]  Initialization data (the yapl object).
     * @return {Object}         The initialized outputJson object.
     */
    init(data) {
        this.data = this.clean(data);
        this.outputDir = data.config.settings.buildDir;
        this.outputFile = path.join(this.outputDir, 'yapl.json');
        return this;
    },


    /**
     * Take all Yapl data and create a much simplified data object
     * @param  {Object} [data]  The Yapl object to clean.
     * @return {Object}         The simplified data object.
     */
    clean(data) {
        return {
            sections: this.cleanSections(data.sections.items),
            modules: this.cleanModules(data.modules.items),
            blocks: this.cleanBlocks(data.blocks.items),
            templates: this.cleanTemplates(data.templates.items),
            images: this.cleanImages(data.images.items)
        };
    },


    /**
     * Clean all the Yapl sections data
     * @param  {Array} [libSections]  The Yapl sections to clean.
     * @return {Array}                The simplified Yapl sections data.
     */
    cleanSections(libSections) {
        return libSections.map(libSection => {
            return {
                id: libSection.id,
                name: libSection.name,
                link: libSection.link
            };
        });
    },


    /**
     * Clean all the Yapl modules data
     * @param  {Array} [libModules]  The Yapl modules to clean.
     * @return {Array}                The simplified Yapl modules data.
     */
    cleanModules(libModules) {
        return libModules.map(libModule => {
            return {
                id: libModule.id,
                name: libModule.name,
                link: libModule.link,
                parent: libModule.parent.id
            };
        });
    },


    /**
     * Clean all the Yapl blocks data
     * @param  {Array} [libBlocks]  The Yapl blocks to clean.
     * @return {Array}              The simplified Yapl blocks data.
     */
    cleanBlocks(libBlocks) {
        return libBlocks.map(libBlock => {
            return {
                id: libBlock.id,
                name: libBlock.name,
                notes: libBlock.notes,
                link: libBlock.link,
                parent: libBlock.parent.id
            };
        });
    },


    /**
     * Clean all the Yapl templates data
     * @param  {Array} [libTemplates]  The Yapl templates to clean.
     * @return {Array}                 The simplified Yapl templates data.
     */
    cleanTemplates(libTemplates) {
        return libTemplates.map(libTemplate => {
            return {
                id: libTemplate.id,
                name: libTemplate.name,
                notes: libTemplate.notes,
                link: libTemplate.link
            };
        });
    },


    /**
     * Clean all the Yapl images data
     * @param  {Array} [libimages]  The Yapl images to clean.
     * @return {Array}              The simplified Yapl images data.
     */
    cleanImages(libImages) {
        return libImages.map(libImage => {
            return {
                id: libImage.id,
                name: libImage.name,
                link: libImage.link
            };
        });
    },


    /**
     * Output the cleaned Yapl data to a file in the root of the pattern library directory
     */
    output() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir);
        }

        fs.writeFileSync(this.outputFile, JSON.stringify(this.data));
    }

};
