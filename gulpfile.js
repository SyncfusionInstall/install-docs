var fs = require('fs');
var gulp = require('gulp');
var glob = require('glob');
var shelljs = require('shelljs');

var components;
var compPaths = glob.sync(`./src/**/`, { silent: true, ignore: [`./src/base/`, `./src/`, './src/common/', './src/getting-started/'] });

var branch = 'master';
var user = process.env.GIT_USER;
var token = process.env.GIT_TOKEN;
var user_mail = process.env.GIT_MAIL;
var is_temp = process.env.IS_TEMP;
/**
 * Source shipping to gitlap
 */
gulp.task('ship-to-gitlap', function (done) {
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
        var clone = shelljs.exec('git clone ' + gitPath + ' -b ' + branch + ' ' + `../../gitlapRepo/install-docs`, {
            silent: false
        });
        if (clone.code !== 0) {
            console.log(clone.stderr);
            done();
            return;
        } else {
            console.log('Clone has been completed...!');
            // update src from github to gitlap - replace files from cloed repo
			var rootDir = '../../gitlapRepo/install-docs';
			console.log('Directory...!' + rootDir);
			for (var i = 0; i < changedFileNames.length; i++) 
			{
				 console.log('changes...!' +changedFileNames[i]);
                shelljs.cp('-rf', `../install-docs/`+changedFileNames[i], `../../gitlapRepo/install-docs/`+changedFileNames[i])
            } 
            shelljs.cd(`../../gitlapRepo/install-docs`);
            shelljs.exec('git add .');
            shelljs.exec('git pull');
            shelljs.exec('git commit -m \"source updation from github repo \" --no-verify');
            shelljs.exec('git push');
            shelljs.cd('../../')
        }
})

/**
 * Lint md files in src location
 */
gulp.task('lint', function (done) {
    var markdownlint = require('markdownlint');
    components = controlsList();
    var options = {
        files: glob.sync('./src/' + components + '/*.md', { ignore: ['./src/**/api*.md', './src/summary.md', './src/release-notes/*.md'] }),
        config: require('./.markdownlint.json')
    };
    markdownlint(options, function (result, err) {
        if (err && err.toString().length) {
            console.error(err.toString());
            done();
            process.exit(1);
        } else {
            console.log('\n*** Markdown Lint Succeeded ***\n');
            done();
        }
    }); 
});

// Controls List
function controlsList() {
    var controls = '**';
    if (true) {
        var ret = '';
        for (var comp of compPaths) {
            ret += comp.replace(/.\/src\//g, '') + '**/,';
        }
        return '{' + ret + '}';
    }
    else if (fs.existsSync('./controlsList.txt')) {
        controls = fs.readFileSync('./controlsList.txt', 'utf8');
        controls = '{' + controls + ',}';
    }
    return controls;
}
