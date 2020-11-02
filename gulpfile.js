var fs = require('fs');
var gulp = require('gulp');
var glob = require('glob');
var shelljs = require('shelljs');
var path = require('path');
var branch = 'master';
var user = process.env.GIT_USER;
var token = process.env.GIT_TOKEN;
var user_mail = process.env.GIT_MAIL;
var is_temp = process.env.IS_TEMP;
/**
 * Source shipping to gitlab
 */
gulp.task('ship-to-gitlab', function (done) {
    console.log('---check----' + user_mail);
    console.log('---user---' + user);

    shelljs.exec(`git config --global user.email "${user_mail}"`);
    shelljs.exec(`git config --global user.name "${user}"`);

    var changes = shelljs.exec(`git diff --name-only HEAD^ HEAD`);
    console.log('--changes----' + changes);

    var changedFileNames = changes.stdout.split('\n');
    console.log('--changedFileNames----' + changedFileNames);
    var gitPath = 'https://' + user + ':' + token + `@gitlab.syncfusion.com/testgroup/install-docs`;
    console.log('Clone has been started...!');
    var clone = shelljs.exec('git clone ' + gitPath + ' -b ' + branch + ' ' + `./gitlabRepo/install-docs`, {
        silent: false
    });
    if (clone.code !== 0) {
        console.log(clone.stderr);
        done();
        return;
    } else { 
        console.log('Clone has been completed...!');
        // update src from github to gitlab - replace files from cloed repo
        var rootDir = path.resolve('./gitlabRepo/install-docs');
        var rootDir2 = path.resolve('./install-docs');
        console.log('Directory...!' + rootDir);
        console.log('Directory...!' + rootDir2);
        for (var i = 0; i < changedFileNames.length; i++) {
            console.log('changes...!' + changedFileNames[i]);
            if (fs.existsSync('./install-docs/' + changedFileNames[i])) {
                // It will update the modified files
                if (fs.existsSync('./gitlabRepo/install-docs/' + changedFileNames[i])) {
                    shelljs.cp('-rf', `./install-docs/` + changedFileNames[i], `./gitlabRepo/install-docs/` + changedFileNames[i]);
                }
                else {
                    // It will update the newly added files
                    if (fs.existsSync('./gitlabRepo/install-docs/')) {
                        shelljs.cp('-rf', `./install-docs/` + changedFileNames[i], `./gitlabRepo/install-docs/` + changedFileNames[i]);

                    }
                }
 
            }
            else {
                // It will remove the deleted files
                if (fs.existsSync('./gitlabRepo/install-docs/' + changedFileNames[i])) {
                    shelljs.rm('-rf', `./gitlabRepo/install-docs/` + changedFileNames[i]);
                }

            }
        }
		
        shelljs.cd(rootDir);
	    console.log('Git Add started...!' );
        shelljs.exec('git add .');
	    console.log('Git Add Ended...!' );
        shelljs.exec('git pull');
        shelljs.exec('git commit -m \"source updation from github repo \" --no-verify');
        shelljs.exec('git push');
        shelljs.cd('../../');
    }
})





