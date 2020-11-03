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
var changedFileNames;
var changes;
/**
 * Source shipping to gitlab
 */
gulp.task('ship-to-gitlab', function (done) {
    console.log('---check----' + user_mail);
    console.log('---user---' + user);

    shelljs.exec(`git config --global user.email "${user_mail}"`);
    shelljs.exec(`git config --global user.name "${user}"`);

    changes = shelljs.exec(`git diff --name-status HEAD^ HEAD`);
    console.log('--changes----' + changes);

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

        for (var changedFileName of changedFileNames) {
            console.log('changes...!' + changedFileName);
            if (changedFileName !== null && changedFileName!== '') {
                console.log('File Exists...!' + path.resolve('../install-docs/' + changedFileName));
                if (fs.existsSync('../install-docs/' + changedFileName)) {
                    // It will update the modified files
                    if (fs.existsSync('../../../gitlabRepo/install-docs/' + changedFileNames[i])) {
                        shelljs.cp('-rf', `../install-docs/` + changedFileName, `../../../gitlabRepo/install-docs/` + changedFileNames[i]);
                        console.log('Copied...!');
                    }
                    else {
                        // It will update the newly added files
                        if (fs.existsSync('../../../gitlabRepo/install-docs/')) {
                            shelljs.cp('-rf', `../install-docs/` + changedFileName, `../../../gitlabRepo/install-docs/` + changedFileNames[i]);
                            console.log('Copied1...!');

                        }
                    }

                }
                else {
                    // It will remove the deleted files
                    if (fs.existsSync('../../../gitlabRepo/install-docs/' + changedFileName)) {
                        shelljs.rm('-rf', `../../../gitlabRepo/install-docs/` + changedFileName);
                        console.log('Deleted...!');
                    }
                }

            }

        }

        shelljs.cd(`../../../gitlabRepo/install-docs`);
        console.log('Git Add started...!');
        shelljs.exec('git add .');
        console.log('Git Add Ended...!');
        shelljs.exec('git pull');
        shelljs.exec('git commit -m \"source updation from github repo \" --no-verify');
        shelljs.exec('git push');
        shelljs.cd('../../');
    }
})

// Controls List
function changedFileNameList() {
    var controls = '';
    var changesList = changes.stdout.split('\n');
    //var changesList = 'A	Common/Essential-Studio/Release-notes/v18.3.0.42.md';
    for (var comp of changesList)
    {
        controls += comp.replace(/A\s+/g, "").replace(/M\s+/g, "").replace(/R100\s+/g, "").split(/\s+/g);
        console.log('Controls...!' +controls);
    }
    return controls;
}





