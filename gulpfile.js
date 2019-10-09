var gulp = require('gulp');
var preprocess = require('gulp-preprocess');
var template = require('gulp-template');
var runSequence = require('run-sequence');
var flatten = require('gulp-flatten');
var exec = require('child_process').exec;
var standard = require('gulp-standard')
var watch = require('gulp-watch');
var zip = require('gulp-vinyl-zip');
var addsrc = require('gulp-add-src');
var babelminify = require('gulp-babel-minify');
var gulpIgnore = require('gulp-ignore');
var del = require('del');
var babel = require('gulp-babel');
var include = require("gulp-include");
var ext_replace = require('gulp-ext-replace');
var beep = require('beepbeep');
var minimist = require('minimist');
var handlebars = require('gulp-handlebars');
var rename = require('gulp-rename');
var declare = require('gulp-declare');
var concat = require('gulp-concat');
var package = require('./package.json');
var wrap = require('gulp-wrap');
var path = require('path');
var jscrambler = require('gulp-jscrambler');
var gulpif = require('gulp-if');
var stripcomments = require('gulp-strip-comments');
var request = require('request');
const fs = require('fs');
var crx = require('gulp-crx-pack');
var less = require('gulp-less');
var config = require('./config.js').config;


var knownOptions = {
  string: ['debug', 'browser', 'flavor'],
  boolean:['obfuscate','publishStore','showLogs'],
  default: {
    debug: false,
    browser: 'chrome',
    flavor: 'public',
    publishStore: false,
    obfuscate: false,
    showLogs: false
  }
};

var options = minimist(process.argv.slice(2), knownOptions);
console.log("Options flavor :" + options.flavor)
console.log("Options browser :" + options.browser)
var doWatch = true;
gulp.task('help', function(cb) {
  console.log("HELP:");
  console.log('   gulp watch --flavor="all|flavor" --browser="all|chrome|firefox|safari"');
  console.log('   gulp builddev-[flavor]-[browser]');
  console.log('   gulp dist --flavor="all|flavor" --browser="all|chrome|firefox|safari" [--publishStore] [--obfuscate] [--showLogs]');
  doWatch = false;
  return 0;
});

gulp.task('beep', function(cb) {
  return new Promise((resolve) => {
    //console.log("\007");
    beep()
    resolve();
  });
});

function buildWatchTasks() {
  var _tasks = [];
  //console.log("buildWatchTasks: ",config)
  if (options.flavor == 'all') {
    if (options.browser == 'all') {
      for (browser in config.browsers) {
        for (flavor in config.flavors) {
          _tasks.push('builddev-' + config.flavors[flavor].name + '-' + config.browsers[browser].name);
        }
      }
    } else {
      for (flavor in config.flavors) {
        _tasks.push('builddev-' + config.flavors[flavor].name + '-' + options.browser);
      }
    }
    _tasks.push('beep');
  } else {
    if (options.browser == 'all') {
      for (browser in config.browsers) {
        _tasks.push('builddev-' + options.flavor + '-' + config.browsers[browser].name);
      }
    } else {
      _tasks.push('builddev-' + options.flavor + '-' + options.browser);
    }
    _tasks.push('beep');
  }
  return _tasks;
}

function buildDistTasks() {
  var _tasks = {
    build: [],
    dist: [],
    store:[]
  };
  if (options.flavor == 'all') {
    if (options.browser == 'all') {
      for (browser in config.browsers) {
        for (flavor in config.flavors) {
          _tasks.build.push('buildprod' + config.flavors[flavor].name + '-' + config.browsers[browser].name);
          _tasks.dist.push('dist-' + config.flavors[flavor].name + '-' + config.browsers[browser].name);
          if (options.publishStore) _tasks.store.push('store-' + config.flavors[flavor].name + '-' + config.browsers[browser].name);
        }
      }
    } else {
      for (flavor in config.flavors) {
        _tasks.build.push('buildpro-' + config.flavors[flavor].name + '-' + options.browser);
        _tasks.dist.push('dist-' + config.flavors[flavor].name + '-' + options.browser);
        if (options.publishStore) _tasks.store.push('store-' + config.flavors[flavor].name + '-' + options.browser);
      }
    }
  } else {
    if (options.browser == 'all') {
      for (browser in config.browsers) {
        _tasks.build.push('buildpro-' + options.flavor + '-' + config.browsers[browser].name);
        _tasks.dist.push('dist-' + options.flavor + '-' + config.browsers[browser].name);
        if (options.publishStore) _tasks.store.push('store-' + options.flavor + '-' + config.browsers[browser].name);
      }
    } else {
      _tasks.build.push('buildpro-' + options.flavor + '-' + options.browser);
      _tasks.dist.push('dist-' + options.flavor + '-' + options.browser);
      if (options.publishStore) _tasks.store.push('store-' + options.flavor + '-' + options.browser);
    }
  }
  return _tasks;
}
gulp.task('watch', function(cb) {
  var _tasks = buildWatchTasks();
  for (browser in config.browsers) {
    var buildDir = config.buildDir + config.browsers[browser].dir;
    console.log("BUILDING TO "+buildDir)
    for (flavor in config.flavors) {
      makeBuildTaskClosure(config.browsers[browser], buildDir, config.flavors[flavor], 'development');
    }
  }
  console.log(_tasks);
  gulp.watch(['chrome/**/*', 'common/**/*', '!common/js/extension-templates.compiled.js'], _tasks);
});
gulp.task('dist', function(callback) {
  var _tasks = buildDistTasks();
  for (browser in config.browsers) {
    var now = new Date();
    var distDir = config.distDir;
    for (flavor in config.flavors) {
      makeBuildTaskClosure(config.browsers[browser], distDir+config.browsers[browser].dir, config.flavors[flavor], 'production');
      makeDistTaskClosure(config.browsers[browser], distDir, config.flavors[flavor], now.getFullYear() + "-" + (parseInt(now.getMonth()) + 1) + "-" + now.getDate());
      makeStoreTaskClosure(config.browsers[browser], distDir, config.flavors[flavor], now.getFullYear() + "-" + (parseInt(now.getMonth()) + 1) + "-" + now.getDate());
    }
  }
  (options.publishStore?
    runSequence(_tasks.build, _tasks.dist,_tasks.store, "beep",
      callback)
  :
    runSequence(_tasks.build, _tasks.dist, "beep",
      callback)
  )
});
function makeStoreTaskClosure(browser, destDir, flavor, date) {
  var fn = function() {
    switch(browser.name){
      case "chrome":
        var _filename = path.resolve(destDir+date+"/"+browser.name+"-"+flavor.name+"-"+package.version+".zip");
        console.log("StoreTask: uploading " + _filename);
        return WebstoreMgr.upload(_filename, browser, flavor)
      break;
      case "firefox":
        var _dirname = path.resolve(destDir+browser.name+"/"+flavor.name);
        var _destinationDir = path.resolve(destDir+date);
        console.log("StoreTask: signing " + _dirname + " to "+_destinationDir);
        return WebstoreMgr.signFirefoxFile(_dirname, _destinationDir);
      break;
      case "safari":
        var _dirname = path.resolve(destDir+browser.name);
        var _destinationDir = path.resolve(destDir+date+"/");
        return WebstoreMgr.signSafariExtension(browser, flavor,_dirname, _destinationDir);
      break;
    }
  }
  fn.displayName = "store-" + flavor.name + "-" + browser.name;
  gulp.task("store-" + flavor.name + "-" + browser.name, fn);
  console.log("Building: store-" + flavor.name + "-" + browser.name);
}

function makeDistTaskClosure(browser, destDir, flavor, date) {
  var fn = function() {
    var archive_name = browser.name + "-" + flavor.name + "-" + package.version;
    console.log("Archive generated: " + archive_name);
    var _srcDir = destDir + browser.name + "/" + flavor.name + '/**/*';
    if (browser.name == 'safari'){
      _srcDir = destDir + browser.name + "/" + flavor.name+".safariextension" + '/**/*';
      archive_name += ".safariextension";
    }
    console.log("Src dir: " + _srcDir)
    var _fullDir = destDir + '/' + date + "/";
    console.log("Dest zip : " + _fullDir + archive_name)

    gulp.src([_srcDir])
      .pipe(zip.dest(_fullDir + archive_name+'.zip'));

    if (!options.publishStore && browser.name=='chrome'){
      gulp.src(destDir + browser.name + "/" + flavor.name)
        .pipe(crx({
          filename:archive_name+'.crx',
          //privateKey: fs.readFileSync('./chrome/public/chrome-privatekey.pem', 'utf8'),
          }
        ))
        .pipe(gulp.dest(_fullDir));
    }
    // generate browser specific files
    switch (browser.name) {
      case "firefox":
        gulp.src(["chrome/" + flavor.name + "/update.json.tpl"]) /* update file */
          .pipe(preprocess({
            context: {
              env: "production",
              browser: browser.name,
              flavor: flavor.name,
              browserversion: browser.buildVariant
            }
          }))
          .pipe(template({
            version: package.version,
            name: flavor.Mname,
            description: flavor.Mdescription,
            homepage_url: flavor.Mhomepage_url,
            gecko_id: flavor.Mgecko_id,
            gecko_update_url: flavor.Mgecko_update_url
          }))
          .pipe(rename(function(path) {
            path.basename = flavor.name + "-" + path.basename;
          }))
          .pipe(ext_replace('.json', '.json.tpl'))
          .pipe(gulp.dest(_fullDir))
        break;
      case "safari":
        console.log("Fulldir=" + _fullDir)

        gulp.src(["safari/Splikity.safariextension/" + flavor.name + "/safari.plist.tpl"]) /* update file */
          .pipe(preprocess({
            context: {
              env: "production",
              browser: browser.name,
              flavor: flavor.name,
              browserversion: browser.buildVariant
            }
          }))
          .pipe(template({
            version: package.version,
            name: flavor.Mname,
            description: flavor.Mdescription,
            homepage_url: flavor.Mhomepage_url,
            gecko_id: flavor.Mgecko_id,
            gecko_update_url: flavor.Mgecko_update_url
          }))
          .pipe(rename(function(path) {
            path.basename = flavor.name + "-" + path.basename;
          }))
          .pipe(ext_replace('.plist', '.plist.tpl'))
          .pipe(gulp.dest(_fullDir))
        break;
    }
  }
  fn.displayName = "dist-" + flavor.name + "-" + browser.name;
  gulp.task("dist-" + flavor.name + "-" + browser.name, fn);
  console.log("Building: dist-" + flavor.name + "-" + browser.name);
}

function makeBuildTaskClosure(browser, destDir, flavor, env) {
  var fn = function() {
    var _path = (browser.name=="safari"?flavor.name+".safariextension":flavor.name)
    var _gpath = (browser.name=="safari"?"generic"+".safariextension":"generic")

    console.log("Env:"+env+" O="+options.obfuscate+" SL="+(options.showLogs|| env=="development"));
    var p = new Promise((resolve, reject) => {
      gulp.src(['common/js/background/background.js','common/js/background/snippetmgr.js','common/js/contentscript/*.js','common/js/popup/popup.js'])
        .pipe(flatten())
        .pipe(preprocess({
          context: {
            env: env,
            browser: browser.name,
            flavor: flavor.name,
            browserversion: browser.buildVariant,
            showLogs: options.showLogs || env=="development"
          },
          extension: "js"
        }))
        .pipe(gulpif(browser.name=="safari",babel({plugins:["transform-es2015-arrow-functions"]})))
        .pipe(gulpif(env == "production"&&options.obfuscate, jscrambler(config.jscrambler)))
        .pipe(flatten())
        .pipe(gulp.dest(destDir +"/" + _path + '/js/'))
        .pipe(gulp.dest(destDir +"/" +_gpath + '/js/'))
        .on('end', () => {
          resolve()
        });
    })
    if (browser.name != "safari") {
      console.log("makeBuildTaskClosure:" + destDir)
      gulp.src(["chrome/manifest.json.tpl"]) /* manifest */
        .pipe(preprocess({
          context: {
            env: env,
            browser: browser.name,
            flavor: flavor.name,
            browserversion: browser.buildVariant,
          }
        }))
        .pipe(template({
          version: package.version,
          name: flavor.Mname,
          description: flavor.Mdescription,
          homepage_url: flavor.Mhomepage_url,
          gecko_id: flavor.Mgecko_id,
          gecko_update_url: flavor.Mgecko_update_url,
          addon_key_section: flavor.chromePublicKey? browser.chromePublicKey:""

        }))
        .pipe(ext_replace('.json', '.json.tpl'))
        .pipe(gulp.dest(destDir +"/" + _path))
        .pipe(gulp.dest(destDir +"/" + _gpath))

      gulp.src(["chrome/_locales/**/*"]) // locales
        .pipe(stripcomments())
        .pipe(gulp.dest(destDir +"/" + _path + "/_locales"))
        .pipe(gulp.dest(destDir +"/" + _gpath + '/_locales'))

      gulp.src(["common/background.html"])
        .pipe(gulp.dest(destDir +"/" + _path))
        .pipe(gulp.dest(destDir +"/" + _gpath))
    } else { // Safari specific files
      gulp.src(["safari/Splikity.safariextension/Settings.plist","common/background.html"])
        .pipe(gulp.dest(destDir +"/" + _path))
        .pipe(gulp.dest(destDir +"/" + _gpath))
      gulp.src(["safari/Splikity.safariextension/" + flavor.name + "/Info.plist.tpl"]) /* manifest */
        .pipe(preprocess({
          context: {
            env: env,
            browser: browser.name,
            flavor: flavor.name,
            browserversion: browser.buildVariant
          }
        }))
        .pipe(template({
          version: package.version,
          name: flavor.Mname,
          description: flavor.Mdescription,
          homepage_url: flavor.Mhomepage_url,
          gecko_id: flavor.Mgecko_id,
          gecko_update_url: flavor.Mgecko_update_url
        }))
        .pipe(ext_replace('.plist', '.plist.tpl'))
        .pipe(gulp.dest(destDir +"/" + _path))
        .pipe(gulp.dest(destDir +"/" + _gpath))
    }
    gulp.src(["./common/dialogs/*"])
        .pipe(flatten())
        .pipe(gulp.dest(destDir + "/" +_path + "/dialogs/"))
        .pipe(gulp.dest(destDir + "/" + _gpath + '/dialogs/'))
    // vendor
    gulp.src(["./common/vendor/*"])
      .pipe(flatten())
      .pipe(gulp.dest(destDir + "/" + _path + "/vendor/"))
      .pipe(gulp.dest(destDir + "/" + _gpath + '/vendor/'))

    // fonts
    gulp.src(["common/font/**/*"])
      .pipe(gulp.dest(destDir + "/" + _path + "/font/"))
      .pipe(gulp.dest(destDir + "/" + _gpath + '/font/'))
    // html
    gulp.src(["common/html/**/*"])
      .pipe(gulp.dest(destDir + "/" + _path + "/html/"))
      .pipe(gulp.dest(destDir + "/" + _gpath + '/html'))
    // icons
    gulp.src(["./common/images/" + flavor.name + "/*", "./common/images/*"])
      .pipe(flatten())
      .pipe(gulp.dest(destDir + "/" + _path + "/images/"))
      .pipe(gulp.dest(destDir + "/" + _gpath + '/images/'))
      // icons
    gulp.src(["./common/sounds/" + flavor.name + "/*", "./common/sounds/*"])
        .pipe(flatten())
        .pipe(gulp.dest(destDir + "/" + _path + "/sounds/"))
        .pipe(gulp.dest(destDir + "/" + _gpath + '/sounds/'))
    gulp.src(["./common/css/" + flavor.name + "/*", "./common/css/*"])
        .pipe(preprocess())
        .pipe(less())
        .pipe(flatten())
        .pipe(gulp.dest(destDir + "/" + _path + "/css/"))
        .pipe(gulp.dest(destDir + "/" + _gpath + '/css/'))
    gulp.src(["./common/vendor/css/*"])
        .pipe(flatten())
        .pipe(gulp.dest(destDir + "/" + _path + "/css/"))
        .pipe(gulp.dest(destDir + "/" + _gpath + '/css/'))
    console.log(_path+" "+package.version+" BUILT!")
    return p;
  }
  fn.displayName = "build" + env.substr(0, 3) + "-" + flavor.name + "-" + browser.name;
  gulp.task("build" + env.substr(0, 3) + "-" + flavor.name + "-" + browser.name, fn);
  console.log("Building: build" + env.substr(0, 3) + "-" + flavor.name + "-" + browser.name);
}
gulp.task('signFirefox', function(cb) {
  var flavor = config.flavors.public;
  var browser = config.browsers.firefox;
  console.log("Normalized: " + path.resolve('./dist'))
});
gulp.task('uploadToChromeWebStore', function(cb) {
  var flavor = config.flavors.public;
  var browser = config.browsers.chrome;
  console.log("Normalized: " + path.resolve('./dist'))
});

gulp.task('default', ['watch']);

var WebstoreMgr={
  _getAccessToken:function(clientId,clientSecret,refreshToken){
    var _url = "https://accounts.google.com/o/oauth2/token";
    var _data = {
      "client_id":clientId,
      "client_secret":clientSecret,
      "refresh_token":refreshToken,
      "grant_type":"refresh_token"};
    return new Promise((resolve,reject)=>{
      request(_url, { method: 'POST', formData: _data },function(err, httpsResponse, body) {
            if (err) {
              //console.log("Error: _data",_data)
              return reject(err);
            }
            //console.log("Access token:"+body,_data)
            body = JSON.parse(body);
            return resolve(body["access_token"]);
      });
    });
  },
  signSafariExtension:function(browser, flavor, distDir, artifactsDir) {
    var _certDev = path.resolve("./safari/certs/cert.pem");
    var _certInter = path.resolve("./safari/certs/apple-intermediate.pem");
    var _certRoot = path.resolve("./safari/certs/apple-root.pem");
    var _pk = path.resolve("./safari/certs/privatekey.pem");
    var _destDir = path.resolve(artifactsDir+"/"+flavor.name);
    var _execDir = distDir;

    var cmd = 'xarjs create '+_destDir+'-'+package.version+'.safariextz'+' --cert '+_certDev+' --cert '+
      _certInter+' --cert '+_certRoot+' --private-key '+_pk+' '+
      flavor.name+'.safariextension';
    console.log("signSafariExtension: executing " + cmd)
    console.log("signSafariExtension: with cwd to " + _execDir)

    return new Promise((resolve,reject)=>{
      return exec(cmd, {cwd:_execDir}, (err, stdout, stderr) => {
        if (err) {
          console.log('Child process exited with error ', err.code);
          console.log(stderr, err);
          return err.code;
        } else {
          console.log(stdout);
        }
        resolve(err)
      });
    })
  },
  signFirefoxFile:function(distDir, artifactsDir) {
    var apiKey = config.browsers.firefox.apiKey;
    var apiSecret = config.browsers.firefox.apiSecret;
    var cmd = 'web-ext sign --source-dir ' + path.resolve(distDir) + ' --api-key ' + apiKey + ' --api-secret ' + apiSecret + ' --artifacts-dir ' + path.resolve(artifactsDir);
    console.log("signFirefoxFile: executing " + cmd)
    return new Promise((resolve,reject)=>{
      return exec(cmd, (err, stdout, stderr) => {
        if (err) {
          console.log('Child process exited with error ', err.code);
          console.log(stderr, err);
          return err.code;
        } else {
          console.log(stdout);
        }
        resolve(err)
      });
    })
  },
  upload:function(filename, browser,flavor){
    var _url = "https://www.googleapis.com/upload/chromewebstore/v1.1/items/"+flavor.addonId;
    return new Promise((resolve,reject) => {
      return this._getAccessToken(browser.clientId,browser.clientSecret,browser.refreshToken)
      .then(accessToken=>{
        var _fetchOptions = {
          headers: {
            'Authorization': "Bearer "+accessToken,
            'x-goog-api-version': 2,
            'content-type': 'application/octet-stream',
            'transfer-encoding': 'chunked'
          },
          method: 'PUT'
        }
        Server.requestFileUploadStream(_url, _fetchOptions, filename)
        .then(res => {
          resolve(res);
          if (res.status >= 400) {
            console.log(res);
              throw new Error("Bad response from server");
          }
          console.log("res=",res)
        }).catch(e=>{
          console.log("EXCEPTION:",e);
        })
      });
    });
  },
};
var Server={
  _get:function(url){
    return new Promise(function(resolve, reject) {
      najax.get(url,function(result){
        resolve(result);
      },"html").fail(function(jqXHR, textStatus, errorThrown){
          console.log("Can't get "+url);
          reject({httpCode:jqXHR.status});
        }
      );
    });
  },
  requestFileUploadStream(putURL, options, filename) {
    return new Promise((resolve,reject)=>{
      fs.createReadStream(filename).pipe(request(putURL,options,function(err, httpsResponse, body){
        if ( err ) {
            reject(err);
            console.log('err', err);
        } else {
            try {
                body = JSON.parse(body);
            } catch(e) {}
            resolve(body);
        }
      }));
    });
  }
}
