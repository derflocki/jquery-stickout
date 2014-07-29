module.exports = function( grunt ) {
    "use strict";

    grunt.initConfig({
        watch: {
        	scripts: {
                files: 'jquery.stickout.js',
                tasks: "uglify"
            }
        },
        uglify: {
			options: {
				mangle: true,
				beautify: false
			},
            dist: {
                files: {
                    'jquery.stickout.min.js': [ 'jquery.stickout.js' ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask( 'default', ['uglify']);
};
