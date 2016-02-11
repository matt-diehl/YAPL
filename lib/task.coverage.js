'use strict';

const fs = require('fs'),
    utils = require('./utils.js'),
    Table = require('cli-table'),
    _ = require('lodash');

const cssClassRegEx = /(\.-?[_a-zA-Z]+[_a-zA-Z0-9-]*)\s*[\{\,]/g;


/**
 * Task to generate a report on how well components are documented in Yapl.
 * @module yapl/task.coverage
 */
module.exports = {

    /**
     * Initialize a new coverage object.
     * @param  {Object} data  Data collected from the Yapl task.
     * @return {Object}       The initialized coverage object.
     */
    init(data) {
        this.data = data;
        this.report = {};

        return this;
    },


    /**
     * Generate the coverage report based on the data collected from Yapl.
     * @return {Object}       The coverage object, which includes a complete report.
     */
    generateReport() {
        let libSections = this.data.sections.items,
            libModules = this.data.modules.items,
            libBlocks = this.data.blocks.items;

        let allCssFiles = [],
            coveredCssFiles = [],
            uncoveredCssFiles = [];

        allCssFiles = [].concat.apply([], libSections.map(libSection => {
            return libSection.cssFiles;
        }));

        // TODO: may want to clean this up
        coveredCssFiles = libModules.filter(libModule => {
            return libBlocks.filter(libBlock => {
                return libBlock.parent.id === libModule.id;
            }).length;
        }).map(libModule => {
            return {
                file: libModule.cssFile,
                moduleId: libModule.id
            };
        });

        // TODO: may want to clean this up
        uncoveredCssFiles = allCssFiles.filter(cssFile => {
            return coveredCssFiles.map(coveredCssFile => {
                return coveredCssFile.file;
            }).indexOf(cssFile) === -1;
        });

        coveredCssFiles.forEach(cssFile => {
            let cssFileContent = fs.readFileSync(cssFile.file, 'utf8'),
                allClasses = cssFileContent.match(cssClassRegEx),
                moduleHtml = '',
                coveredClasses = [],
                uncoveredClasses = [];

            allClasses = allClasses.map(className => {
                return className.replace(cssClassRegEx, function(match, p1) {
                    return p1;
                });
            });

            allClasses = _.uniq(allClasses).sort();

            libBlocks.filter(libBlock => {
                return libBlock.parent.id === cssFile.moduleId;
            }).forEach(libBlock => {
                moduleHtml += libBlock.html;
            });

            coveredClasses = utils.findMatchingSelectors(moduleHtml, allClasses);

            uncoveredClasses = allClasses.filter(className => {
                return coveredClasses.indexOf(className) === -1;
            });

            cssFile.allClasses = allClasses;
            cssFile.coveredClasses = coveredClasses;
            cssFile.uncoveredClasses = uncoveredClasses;
        });

        this.report.coveredCssFiles = coveredCssFiles;
        this.report.uncoveredCssFiles = uncoveredCssFiles;

        return this;
    },


    /**
     * Generate a coverage report in a text-based table format that can be outputted to the console.
     * @return {Object}  The coverage object, which includes a complete report and text report.
     */
    generateTextReport() {
        let coveredFilesTable = new Table({
                head: ['File Name', 'Uncovered Classes']
            }),
            uncoveredFilesTable = new Table({
                head: ['File Name']
            }),
            coveredFilesTableRows,
            uncoveredFilesTableRows;

        if (!this.report.coveredCssFiles || !this.report.uncoveredCssFiles) {
            this.generateReport();
        }

        coveredFilesTableRows = this.report.coveredCssFiles.map(cssFile => {
            return [cssFile.file, cssFile.uncoveredClasses.join('\n')];
        });

        uncoveredFilesTableRows = this.report.uncoveredCssFiles.map(cssFile => {
            return [cssFile];
        });

        coveredFilesTableRows.forEach(row => {
            coveredFilesTable.push(row);
        });

        uncoveredFilesTableRows.forEach(row => {
            uncoveredFilesTable.push(row);
        });

        this.textReport = `
            CSS FILES COVERED BY YAPL:\n${coveredFilesTable.toString()}
            CSS FILES LACKING COVERAGE:\n${uncoveredFilesTable.toString()}
        `;

        return this;
    }

};