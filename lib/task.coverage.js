'use strict';

var fs = require('fs'),
    utils = require('./utils.js'),
    Table = require('cli-table'),
    _ = require('lodash');

var cssClassRegEx = /(\.-?[_a-zA-Z]+[_a-zA-Z0-9-]*)\s*[\{\,]/g;


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
    init: function(data) {
        this.data = data;
        this.report = {};

        return this;
    },


    /**
     * Generate the coverage report based on the data collected from Yapl.
     * @return {Object}       The coverage object, which includes a complete report.
     */
    generateReport: function() {
        var libSections = this.data.sections.items,
            libModules = this.data.modules.items,
            libBlocks = this.data.blocks.items;

        var allCssFiles = [],
            coveredCssFiles = [],
            uncoveredCssFiles = [];

        allCssFiles = [].concat.apply([], libSections.map(function(libSection) {
            return libSection.cssFiles;
        }));

        // TODO: may want to clean this up
        coveredCssFiles = libModules.filter(function(libModule) {
            return libBlocks.filter(function(libBlock) {
                return libBlock.parent.id === libModule.id;
            }).length;
        }).map(function(libModule) {
            return {
                file: libModule.cssFile,
                moduleId: libModule.id
            };
        });

        // TODO: may want to clean this up
        uncoveredCssFiles = allCssFiles.filter(function(cssFile) {
            return coveredCssFiles.map(function(coveredCssFile) {
                return coveredCssFile.file;
            }).indexOf(cssFile) === -1;
        });

        coveredCssFiles.forEach(function(cssFile) {
            var cssFileContent = fs.readFileSync(cssFile.file, 'utf8'),
                allClasses = cssFileContent.match(cssClassRegEx),
                moduleHtml = '',
                coveredClasses = [],
                uncoveredClasses = [];

            allClasses = allClasses.map(function(className) {
                return className.replace(cssClassRegEx, function(match, p1) {
                    return p1;
                });
            });

            allClasses = _.uniq(allClasses).sort();

            libBlocks.filter(function(libBlock) {
                return libBlock.parent.id === cssFile.moduleId;
            }).forEach(function(libBlock) {
                moduleHtml += libBlock.html;
            });

            coveredClasses = utils.findMatchingSelectors(moduleHtml, allClasses);

            uncoveredClasses = allClasses.filter(function(className) {
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
    generateTextReport: function() {
        var coveredFilesTable = new Table({
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

        coveredFilesTableRows = this.report.coveredCssFiles.map(function(cssFile) {
            return [cssFile.file, cssFile.uncoveredClasses.join('\n')];
        });

        uncoveredFilesTableRows = this.report.uncoveredCssFiles.map(function(cssFile) {
            return [cssFile];
        });

        coveredFilesTableRows.forEach(function(row) {
            coveredFilesTable.push(row);
        });

        uncoveredFilesTableRows.forEach(function(row) {
            uncoveredFilesTable.push(row);
        });

        this.textReport = `
            CSS FILES COVERED BY YAPL:\n${coveredFilesTable.toString()}
            CSS FILES LACKING COVERAGE:\n${uncoveredFilesTable.toString()}
        `;

        return this;
    }

};