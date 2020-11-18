var fs = require('fs');
var gulp = require('gulp');
var glob = require('glob');
var shelljs = require('shelljs');
var path = require('path');
var branch = 'master';
var user = process.env.GIT_USER;
var token = process.env.GIT_TOKEN;
var user_mail = process.env.GIT_MAIL;
var dbserver = process.env.DB_SERVER;
var dbname = process.env.DB_NAME;
var dbuser = process.env.DB_USER;
var dbpassword = process.env.DB_PASSWORD;
var dbport = process.env.DB_PORT;
var changedFileNames;
var changes;
var releaseVersion=null;
/**
 * Source shipping to gitlab
 */
gulp.task('ship-to-gitlab', function (done) {
	GetDetailsFromDB();
    changedFileNames = changedFileNameList();
    console.log('--changedFileNames----' + changedFileNames);
    var gitPath = 'https://' + user + ':' + token + `@gitlab.syncfusion.com/testgroup/install-docs`;
    console.log('Clone has been started...!');
    var clone = shelljs.exec('git clone ' + gitPath + ' -b ' + branch + ' ' + `../../../gitlabRepo/install-docs`, {
        silent: false
    });
    if (clone.code !== 0) {
        console.log(clone.stderr);
        done();
        return;
    } else {
        console.log('Clone has been completed...!');
        // update src from github to gitlab - replace files from cloned repo

        for (var changedFileName of changedFileNames.split(',')) {

            if (changedFileName !== null && changedFileName !== '' && changedFileName !== '.gitignore' && changedFileName !== 'Jenkinsfile' && !changedFileName.includes('.gitlab')) {

                if (fs.existsSync('../install-docs/' + changedFileName)) {
                    // It will update the modified files
                    if (fs.existsSync('../../../gitlabRepo/install-docs/' + changedFileName)) {
                        shelljs.cp('-rf', `../install-docs/` + changedFileName, `../../../gitlabRepo/install-docs/` + changedFileName);
                    }
                    else {
                        // It will update the newly added files
                        if (fs.existsSync('../../../gitlabRepo/install-docs/')) {
                            shelljs.cp('-rf', `../install-docs/` + changedFileName, `../../../gitlabRepo/install-docs/` + changedFileName);
                        }
                    }

                }
                else {
                    // It will remove the deleted files
                    if (fs.existsSync('../../../gitlabRepo/install-docs/' + changedFileName)) {
                        shelljs.rm('-rf', `../../../gitlabRepo/install-docs/` + changedFileName);
                                               
                    }
                }

            }

        }

        shelljs.cd(`../../../gitlabRepo/install-docs`);
        shelljs.exec('git add .');
        shelljs.exec('git pull');
        shelljs.exec('git commit -m \"source updation from github repo \" --no-verify');
        shelljs.exec('git push');
        shelljs.cd('../../');
    }
})

// Controls List
function changedFileNameList() {
    shelljs.exec(`git config --global user.email "${user_mail}"`);
    shelljs.exec(`git config --global user.name "${user}"`);
    changes = shelljs.exec(`git diff --name-status HEAD^ HEAD`);
    var controls = '';
    var changesList = changes.stdout.split('\n');
    if (changesList !== null && changesList !== '') {
        for (var comp of changesList) {
            controls += comp.replace(/A\s+/g, "").replace(/M\s+/g, "").replace(/D\s+/g, "").replace(/R100\s+/g, "").split(/\s+/g) + ',';
        }
        return controls;
    }
}

function GetDetailsFromDB(){
var mysql = require('mysql');

var con = mysql.createConnection({
        server: dbserver',
        database: dbname,
        user: dbuser',
        password: dbpassword,
        port: dbport

});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

 var sqlQuery = "select top 1 BuildVersionName from buildVersion order by BuildVersionId DESC";
                request.query(sqlQuery, function (err, result) {
                    if (err) console.log(err)
                    releaseVersion = result.recordset[0].BuildVersionName;
                });
console.log("releaseVersion!"+releaseVersion);
}





