/*jshint globalstrict: true*/
'use strict';


/**
 * Livereload and connect variables
 */
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({
  port: LIVERELOAD_PORT
});
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};


/**
 * Grunt setup
 */
module.exports = function(grunt) {

  /**
   * Dynamically load npm tasks
   */
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  /**
   * Initialize grunt
   */
  grunt.initConfig({

    /**
     * Read package.json
     */
    pkg: grunt.file.readJSON('package.json'),


    /**
     * Set banner
     */
    banner: '/*!\n' +
            ' * <%= pkg.title %>\n' +
            ' * @version <%= pkg.version %>\n' +
            ' * @author <%= pkg.author.name %> (<%= pkg.author.url %>)\n' +
            ' * Copyright <%= grunt.template.today("yyyy") %>. <%= pkg.license %> liscened\n' +
            ' */\n',

    /**
     * Set project paths and files
     */
    project: {

      // Paths
      src: 'src',
      dist: 'dist',
      test: 'test', // Not configured yet

      // JS files to be Grunted
      js: [
        '<%= project.src %>/assets/js/js-detect.js',
        '<%= project.src %>/assets/js/svg-fallback.js',
        '<%= project.src %>/assets/js/plugins.js',
        '<%= project.src %>/assets/js/main.js'
      ],

      // CSS/Sass/SCSS files to be Grunted
      css: [
        '<%= project.src %>/assets/global.scss',
      ],

      // Img folder, src/assets/img by default
      img:  '<%= project.src %>/assets/img'
    },


    /**
     * JSHint
     * github.com/gruntjs/grunt-contrib-jshint
     */
    jshint: {
      gruntfile: 'Gruntfile.js',
      files: ['<%= project.js %>'],
      options: {
        jshintrc: '.jshintrc'
      }
    },


    /**
     * Concatenate
     * github.com/gruntjs/grunt-contrib-concat
     */
    concat: {
      options: {
        stripBanners: true,
        banner: '<%= banner %>'
      },
      js: {
        src: '<%= jshint.files %>',
        nonull: true,
        dest: '<%= project.dist %>/assets/js/global.js'
      },
    },


    /**
     * Uglify (minify)
     * github.com/gruntjs/grunt-contrib-uglify
     */
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: ['<%= concat.js.dest %>'],
        dest: '<%= project.dist %>/assets/js/global.min.js'
      },
    },


    /**
     * Sass compiling
     * github.com/gruntjs/grunt-contrib-sass
     */
    sass: {
      dev: {
        options: {
          banner: '<%= banner %>',
          style: 'expanded',
          // sourcemap: true, // Requires Sass 3.3.0 alpha: `sudo gem install sass --pre`
          trace: true,
          debugInfo: false
        },
        files: {
          '<%= project.dist %>/assets/css/global.css': '<%= project.src %>/assets/css/global.scss'
        }
      },
      dist: {
        options: {
          banner: '<%= banner %>',
          style: 'expanded' // Use cssmin to minify for speed when compiling both expanded and minified versions
        },
        files: {
          '<%= project.dist %>/assets/css/global.css': '<%= project.src %>/assets/css/global.scss'
        }
      }
    },


    /**
     * Autoprefixer
     * https://github.com/nDmitry/grunt-autoprefixer
     */
    autoprefixer: {
      dist: {
        options: {
          browsers: [
            'last 2 version',
            'safari 6',
            'ie 8',
            'ie 9',
            'opera 12.1',
            'ios 6',
            'android 4'
          ]
        },
        src: '<%= project.dist %>/assets/css/global.css',
        dest: '<%= project.dist %>/assets/css/global.css'
      }
    },

    /**
     * Minify CSS
     * github.com/gruntjs/grunt-contrib-cssmin
     */
    cssmin: {
      combine: {
        options: {
          banner: '<%= banner %>',
          keepSpecialComments: 0,
          report: 'min'
        },
        files: {
          '<%= project.dist %>/assets/css/global.min.css': '<%= project.dist %>/assets/css/global.css'
        }
      }
    },


    /**
     * Compress .jpg/.png
     * github.com/gruntjs/grunt-contrib-imagemin
     */
    imagemin: {
      dist: {
        options: {
            optimizationLevel: 3, // PNG
            progressive: true     // JPG
        },
        files: [{
          expand: true,                           // Enable dynamic expansion.
          cwd: '<%= project.src %>/assets/img',   // Src matches are relative to this path.
          src: '{,*/}*.{png,jpg,jpeg,gif}',           // Actual pattern(s) to match.
          dest: '<%= project.dist %>/assets/img', // Destination path prefix.
        }],
      }
    },


    /**
     * Minify .svg
     * github.com/sindresorhus/grunt-svgmin
     */
    svgmin: {
      options: {
        plugins: [{
            // Prevent removing the viewBox attr. Previously caused issues in IE9+.
            removeViewBox: false
        }]
      },
      dist: {
        files: [{
          expand: true, // Enable dynamic expansion.
          cwd: '<%= project.dev %>/assets/img', // Src matches are relative to this path.
          src: ['**/*.svg'], // Actual pattern(s) to match.
          dest: '<%= project.dist %>/assets/img', // Destination path prefix.
        }],
      }
    },


    /**
     * Convert .svg to .png
     * github.com/dbushell/grunt-svg2png
     */
    svg2png: {
      dist: {
        files: [{
          src: ['%= project.dist %>/assets/img/**/*.svg'],
        }],
      }
    },


    /**
     * Clean files
     * github.com/gruntjs/grunt-contrib-clean
     */
    clean: {
      img: [
        '<%= project.dist %>/assets/img/**/*'
      ],
      js: [
        '<%= project.dist %>/assets/js/**/*'
      ],
      css: [
        '<%= project.dist %>/assets/css/**/*'
      ],
    },


    /**
     * Copy files
     * github.com/gruntjs/grunt-contrib-copy
     */
    copy: {
      // Copy Vendor JS to dist
      vendorJS: {
         expand: true,
         cwd: '<%= project.src %>/assets/js/vendor/',
         src: '**/*',
         dest: '<%= project.dist %>/assets/js/vendor/',
         flatten: false,
         filter: 'isFile',
       },
    },


    /**
     * Connect
     * github.com/gruntjs/grunt-contrib-connect
     */
    connect: {
      options: {
        port: 9001,
        hostname: '*',
        open: true,
      },
      livereload: {
        options:{
          middleware: function (connect) {
            return [
              lrSnippet, mountFolder(connect, 'dist')
            ];
          }
        }
      }
    },


    /**
     * Watch
     * github.com/gruntjs/grunt-contrib-watch
     */
    watch: {

      // JShint Gruntfile
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: ['jshint:gruntfile'],
      },

      // Compile Sass dev on change
      sass: {
        files: '<%= project.src %>/assets/css/**/*.{scss,sass}',
        tasks: ['sass:dev', 'autoprefixer', 'cssmin'],
        options: {
          nospawn: true,
          // We dont want to livereload with this scss target
          // As .scss files will be fed to the livereload server and cause a full page reload
        }
      },

      // JShint, concat + uglify JS on change
      js: {
        files: '<%= jshint.files %>',
        tasks: ['jshint', 'concat', 'uglify'],
        options: {
          nospawn: true,
          interrupt: true,
          // Dont livereload here either
        },
      },

      compressImages: {
        files: '<%= project.src %>/assets/img/**/*.{png,jpg,jpeg,gif}',
        tasks: ['imagemin']
      },

      minifySvg: {
        files: '<%= project.src %>/assets/img/**/*.{svg}',
        tasks: ['svgmin']
      },

      // Live reload files
      livereload: {
        options: { livereload: LIVERELOAD_PORT },
        files: [
          'Gruntfile.js',                             // Reload on Gruntfile change
          '<%= project.dist %>/assets/css/**/*.css',  // all .css files in css/
          '<%= project.dist %>/assets/js/**/*.js',    // all .js files in js/
          '**/*.{html,php}',                          // all .html + .php files
          '<%= project.dist %>/assets/img/**/*.{png,jpg,jpeg,gif,svg}'  // img files in img/
        ]
      }
    }
  });


  /**
   * Default Task
   * run `grunt`
   */
  grunt.registerTask('default', [
    'clean',            // Clean
    'jshint',           // JShint
    'concat',           // Concatenate main JS files
    'uglify',           // Minifiy concatenated JS file
    'copy:vendorJS',    // Copy vendor JS to dist
    'sass:dev',         // Compile Sass
    'autoprefixer',     // Auto prefix compiled Sass
    'cssmin',           // Minify prefixed
    'imagemin',         // Compress images
  ]);


  /**
   * Distribution task, use for deploying
   * run `grunt dist`
   */
  grunt.registerTask('dist', [
    'clean',            // Clean
    'jshint',           // JShint
    'concat',           // Concatenate main JS files
    'uglify',           // Minifiy concatenated JS file
    'copy:vendorJS',    // Copy vendor JS to dist
    'sass:dist',        // Compile Sass with distribution settings
    'autoprefixer',     // Auto prefix compiled Sass
    'cssmin',           // Minify prefixed
    'imagemin'          // Compress images
  ]);


  /**
   * Watch and create server with livereload
   * run `grunt w`
   */
  grunt.registerTask('w', [
    'default',         // Run default task
    'connect',         // Create local server on port 9001
    'watch'            // Start the watch task
  ]);


  /**
   * Image Tasks
   * run `grunt images`
   */
  grunt.registerTask('images', [
    'svg2png',          // Convert svg files to png
    'svgmin',           // Compress svg files
    'imagemin',         // Compress jpg/jpeg + png files
  ]);

};
