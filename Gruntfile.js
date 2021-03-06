module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    browserSync: {
      bsFiles: {
        src : [
          "projectX/**/*.js",
          "projectX/**/*.xml",
          "projectX/**/*.css",
          "tests/**/*.js"
        ]
      },
      options: {
        watchTask: true,
        open: false,
        server: {
            baseDir: "./"
        }
      }
    },
    //compile style.less to style.css file
    less: {
      development: {
        options: {
          paths: ["projectX/css"]
        },
        files: {
          "projectX/css/style.css": "projectX/css/style.less"
        }
      }
    },
    //watch all less files in the project and trigger
    //automatic compile when they change
    watch: {
      styles: {
        files: ["projectX/**/*.less"], // which files to watch
        tasks: ["less"],
        options: {
          nospawn: true
        }
      }
    },
    //run a static server that does not refresh with changes of files
    connect: {
      server: {
        options: {
          port: 9001,
          useAvailablePort: true,
          base: "./",
          keepalive: false
        }
      },
        // runt static build server which serves a browsable directory
        buildGwServer: {
            options: {
                port: 8000,
                useAvailablePort: true,
                base: "release",
                directory: "release",
                keepalive: true
            }
        }
    },
    copy: { // copy all files needed for the deployment into the build/release folder
	  main: {
		  files: [
	      // indexElectron.hml
	      {src: ["indexElectron.html"], dest: "build/release-tmp/indexElectron.html", filter: "isFile"},
	      // electron.js
	      {src: ["electron.js"], dest: "build/release-tmp/electron.js", filter: "isFile"},
	      // package.json
	      {src: ["package.json"], dest: "build/release-tmp/package.json", filter: "isFile"},
          //files
          {expand: true, cwd: "projectX/", src: ["**"], dest: "build/release-tmp/projectX"},
          {expand: true, cwd: "3rdparty/", src: ["**"], dest: "build/release-tmp/3rdparty"},
          {expand: true, cwd: "resources/", src: ["**"], dest: "build/release-tmp/resources"}
	    ]
	  },
      "sap.ui.core": {
			files: [
				{
					cwd: "bower_components/openui5-sap.ui.core/resources",
					src: [ "**/*" ],
					dots: true,
					expand: true,
					dest: "resources/"
				}
			]
		},
		"sap.ui.layout": {
			files: [
				{
					cwd: "bower_components/openui5-sap.ui.layout/resources",
					src: [ "**/*" ],
					dots: true,
					expand: true,
					dest: "resources/"
				}
			]
		},
		"sap.ui.table": {
			files: [
				{
					cwd: "bower_components/openui5-sap.ui.table/resources",
					src: [ "**/*" ],
					dots: true,
					expand: true,
					dest: "resources/"
				}
			]
		},
		"sap.ui.unified": {
			files: [
				{
					cwd: "bower_components/openui5-sap.ui.unified/resources",
					src: [ "**/*" ],
					dots: true,
					expand: true,
					dest: "resources/"
				}
			]
		},
		"sap.m": {
			files: [
				{
					cwd: "bower_components/openui5-sap.m/resources",
					src: [ "**/*" ],
					dots: true,
					expand: true,
					dest: "resources/"
				}
			]
		},
		"bluecrystal": {
			files: [
				{
					cwd: "bower_components/openui5-bluecrystal/resources",
					src: [ "**/*" ],
					dots: true,
					expand: true,
					dest: "resources/"
				}
			]
		},
        buildGw: {
            files: [
                // index.hml
                {
                    src: ["index.html"],
                    dest: "build/release-for-gateway/index.html",
                    filter: "isFile"
                },
                //css, i18n, util, view folders
                {
                    cwd: "projectX",
                    src: ["**/*"],
                    dots: true,
                    expand: true,
                    dest: "build/release-for-gateway/projectX/"
                },
                //Component: route matching
                {
                    src: ["projectX/Component.js", "projectX/MyRouter.js"],
                    dest: "build/release-for-gateway/projectX/",
                    filter: "isFile"
                },
                //3rd party components
                {
                    cwd: "3rdparty",
                    src: ["**/*"],
                    dots: false,
                    expand: true,
                    dest: "build/release-for-gateway/3rdparty/"
                }
            ] // copy:buildGw:files
        } // copy:buildGw
	},
    "build-electron-app": {
        options: {
            platforms: ["darwin", "win32"],
            app_dir: "build/release-tmp",
            build_dir: "build/<%= pkg.name %>-executable"
        }
    },
    // clean tasks
    clean: {
        build: ["build"],
        buildGw: ["build/release-for-gateway"]
    },
    // compression tasks
    compress: {
        buildGw: {
            options: {
                archive: "release/<%= pkg.name %>-gateway.zip",
                level: 9
            },
            files: [{
                expand: true,
                cwd: "build/release-for-gateway/",
                src: ["**"]
            }],
        },
        buildElectronWin32: {
            options: {
                archive: "release/<%= pkg.name %>-win32.zip"
            },
            files: [{
                expand: true,
                cwd: "build/<%= pkg.name %>-executable/",
                src: ["win32/**/*"]
            }],
        },
    },
    shell: {
        // shell command needed, as long as compress don't support symlinks properly
        buildElectronDarwin: {
            command: [
                // create 'release' folder and discard any errors
                "mkdir release &2>/dev/null",
                // zip OSX build into release folder
                "zip -yrq1 release/<%= pkg.name %>-mac.zip build/<%= pkg.name %>-executable/darwin/."
            ].join(" && ")
        }
    },
    // build html files:
    //  - will replace version number
    htmlbuild: {
        dist: {
            src: ["templates/index.html", "templates/indexElectron.html", "templates/indexOnline.html"],
            dest: "./",
            options: {
                data: {
                    // data to pass to templates
                    version: "<%= pkg.version %>"
                },
            }
        }
    },
    
    qunit: {
        all: ['projectX/test-resources/*.qunit.html']
      }
  });

  // load all needed plugins via package.json 'devDependencies'
  Object.keys(grunt.config.get("pkg").devDependencies).forEach(function(dependency) {
      if (/^grunt(?!(-cli)?$)/.test(dependency)) {  // ignore grunt and grunt-cli
        grunt.loadNpmTasks(dependency);
      }
  });

  // Default task for development, run http servers and less compiler
  grunt.registerTask("default", [
      "browserSync",
      "connect:server",
      "watch"
  ]);

  // build tasks for Gateway package
  // after zipping the build, a simple HTTP server is started, from where it can
  // be uploaded to a Gateway server via
  // /UI5/UI5_REPOSITORY_LOAD_[HTTP|HTTPN] transaction
  grunt.registerTask("buildGw", [
      "htmlbuild",
      "clean:buildGw",
      "copy:buildGw",
      "compress:buildGw",
      "connect:buildGwServer"
  ]);
  
  if (process.platform === "win32") {
    //on win32 only build the win32 electon version
    grunt.registerTask("build", [
        "htmlbuild",
        "clean:build",
        "copy:main",
        "build-electron-app",
        "compress:buildElectronWin32"
    ]);
  } else {
    //on all other systems build both win32 and darwin
    grunt.registerTask("build", [
        "htmlbuild",
        "clean:build",
        "copy:main",
        "build-electron-app",
        "shell:buildElectronDarwin",
        "compress:buildElectronWin32"
    ]);
  }

  // build the projectX shell app for win and os x, create zip and copy to release folder on root
  

  // after bower install copy the resources from the bower folder into the resources folder
  grunt.registerTask("copyresources", [
      "copy:sap.ui.core",
      "copy:sap.ui.layout",
      "copy:sap.ui.table",
      "copy:sap.ui.unified",
      "copy:sap.m",
      "copy:bluecrystal"
  ]);
  
  grunt.registerTask("qunittest", [
      "qunit"
  ]);
};
