module.exports = function(grunt) {

	// Project config
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		sass: {
			dist: {
				options: {
					style: 'compressed'
				},
				files: {
					"./public/css/style.css": "./scss/*.scss"
				}
			}, 
			dev: {
				options: {
					style: 'expanded',
					debugInfo: true,
					lineNumbers: true
				},
				files: {
					"./public/css/style.css": "./scss/main.scss"
				}
			}
		},

		autoprefixer: {
			options: {

			},
			dist: {
				src: './public/css/style.css'
			}
		},

		concat: {
			options: {

			},
			dist: {
				src: [
					'./js-pre/app.js'
				],
				dest: './public/js/duzuro.js'
			},
			dev: {
				src: [
					'./js-pre/app.js'
				],
				dest: './public/js/duzuro.js'
			},
			angular: {
				src: [
					'./js-pre/ng/angular/*.js', 
					'./js-pre/ng/angular-ui-router/*.js',
					'./js-pre/ng/angular-animate/*.js'
				],
				dest: './public/js/angular.min.js'
			},
			jquery: {
				src: ['./js-pre/jquery/jquery/*.js'],
				dest: './public/js/jquery.min.js'
			}
		},


		uglify: {
			options: {

			},
			dist: {
				options: {
					sourceMap: false,
					drop_console: true
				},
				files: {
					// 'dest'
				}
			},
			dev: {
				options: {
					sourceMap: true
				}
			}
		},

		watch: {
			css: {
				files: ['./scss/*.scss'],
				tasks: ['sass:dev'],
				options: {
					spawn: true
					// spawn: false
				}
			},
			scripts: {
				files: ['./js-pre/*.js'],
				tasks: ['concat:dev'],
				options: {
					spawn: true
					// spawn: false
				}
			},
			livereload: {
				options: { livereload: true },
				files: [
					'./public/css/*.css', 
					'./public/js/*.js', 
					'./public/index.html', 
					'./public/partials/*.html'
					// './public/*.*'
				]
			}
		},

		bower: {
			install: {
				options: {
					targetDir: './js-pre',
					cleanBowerDir: true,
					layout: 'byType'
				}
			}
		}
	});

	// Load plugins
	grunt.loadNpmTasks('grunt-bower-task');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-autoprefixer');

	// Tasks
	grunt.registerTask('default', [
		'setup',
		'concat:dev', 
		// 'uglify:dev', 
		'sass:dev',
		'autoprefixer',
		'watch'
	]);

	grunt.registerTask('production', [
		'concat:dist',
		'uglify:dist',
		'sass:dist',
		'autoprefixer'
	]);

	grunt.registerTask('setup', [
		'bower:install', 
		'concat:angular', 
		'concat:jquery'
	]);
};