module.exports = function(grunt) {
  require("load-grunt-tasks")(grunt);

  grunt.initConfig({
    watch: {
      all: {
        files: ["src/*.js", "img/*", "*.html"],
        tasks: ['babel'],
        options: {
          livereload: true
        }
      }
    },
    "babel": {
      options: {
        sourceMap: true
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: 'src/',
            src: ['*.js'],
            dest: 'dist/'
          }
        ]
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask("default", ["babel"]);
}