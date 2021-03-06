module.exports = function(grunt) {
    
    var path = require('path'),
        NORMALIZE_LIB = path.join(process.cwd(), '../../../', 'normalize.css'),
        prependComment = '/*! Copyright (c) Nicolas Gallagher and Jonathan Neal */\n/* THIS FILE IS GENERATED BY A BUILD SCRIPT - DO NOT EDIT! */\n',
        parserlib =  require('parserlib'),
        parser = new parserlib.css.Parser(),
        FILE_PATH = 'css/normalize-context.css',
        PREFIX = '.yui3-normalized',
        LICENSE = '/*! normalize.css v1.1.0 | MIT License | git.io/normalize */\n\n';

    grunt.registerTask('clean', 'Clean Source Tree', function() {
        var files = grunt.file.expand('css/'+'*.css');
        files.forEach(function(file) {
            grunt.log.writeln('Deleting: '.red + file.cyan);
            grunt.file['delete'](file);
        });
    });

    grunt.registerTask('import-css', 'Import Normalize CSS Files', function() {
        var file = 'normalize.css',
            src = path.join(NORMALIZE_LIB, file),
            dest = path.join('css', file),
            str;

        if (!grunt.file.exists(src)) {
            grunt.fail.fatal('Did you clone normalize.css yet?');
        }

        grunt.log.writeln('Copying: '.green + file.cyan + ' to ' + dest.cyan);

        str = grunt.file.read(src);
        str = prependComment + str;
        grunt.file.write(dest, str);
    });

    grunt.registerTask('import-tests', 'Import Normalize Tests', function() {
        var file = 'test.html',
            src = path.join(NORMALIZE_LIB, file),
            dest = path.join('tests', 'manual', file);

        if (!grunt.file.exists(src)) {
            grunt.fail.fatal('Did you clone normalize.css yet?');
        }
        grunt.log.writeln('Copying: '.green + file.cyan + ' to ' + dest.cyan);
        grunt.file.copy(src, dest);
    });


    grunt.registerTask('context', 'Make context version', function() {
        var context = prependComment + LICENSE,
            raw,
            done = this.async();
        
        parser.addListener('startstylesheet', function(){
            grunt.log.ok('Starting to parse style sheet...');
        });


        parser.addListener('endstylesheet', function(){
            grunt.log.ok('Finished parsing style sheet...');
            grunt.file.write(FILE_PATH, context);
            grunt.log.ok('Done creating context build!');
            done();
        });

        /* 
        Fired right before CSS properties are parsed for a certain rule.
        Go through and add all the selectors to the `css` string.
        */
        parser.addListener('startrule', function (event) {
            var s, 
                text;
            for (var i = 0, len = event.selectors.length; i < len; i++){
                s = event.selectors;

                /*
                If the selector does not contain the html selector,
                we can go ahead and prepend .yui3-normalized in front of it
                */
                if (s[i].text.indexOf('html') === -1) {
                    context += PREFIX + ' ' + s[i].text;
                } else if (s[i].text.indexOf('html') !== -1) {
                    /*
                    If it contains html, replace the html with .yui3-normalized

                        Replace multiple spaces with a single space. This is for the case where
                        html input[type='button'] comes through as html    input[type='button']
                    */
                    context += s[i].text.replace('html', PREFIX).replace(/ +/g, " ");
                }

                //If theres a following property, add a comma. 
                if (s[i+1]) {
                    context += ',\n';
                } else {
                //Otherwise, add an opening bracket for properties
                    context += ' {\n';
                }
            }
        });

        /* 
        Fired right after CSS properties are parsed for a certain rule.
        Add the closing bracket to end the CSS Rule.
        */
        parser.addListener('endrule', function (event) {
            context += '}\n';
        });

        /* 
        Fired for each property that the parser encounters. Add these
        properties to the `css` string with 4 spaces.
        */
        parser.addListener('property', function(event){
            //Add 4 spaces tab
            context += '    ' + event.property + ': ' + event.value + '; \n';
        });


        /* -------------------------
        Start your engines and parse
        ---------------------------- */
        raw = grunt.file.read('css/normalize.css');
        parser.parse(raw);

    });

    grunt.registerTask('prep', 'Prep Normalize.css import', function() {
        grunt.log.write('Looking for Normalize.css'.green);
        if (!grunt.file.exists(NORMALIZE_LIB)) {
            grunt.log.writeln('');
            grunt.fail.fatal('Could not locate Normalize.css repo: ' + NORMALIZE_LIB + '\nDid you clone it above the yui3 repo?');
        }
        grunt.log.writeln('...OK'.white);
    });

    grunt.registerTask('all', [
        'prep',
        'clean',
        'import',
        'context'
    ]);
    
    grunt.registerTask('import', [
        'import-css',
        'import-tests'
    ]);
    
    grunt.registerTask('default', ['all']);

};


