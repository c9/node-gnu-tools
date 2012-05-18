
const SPAWN = require("child_process").spawn;
const EXEC = require("child_process").exec;
const GNU_TOOLS = require("./gnu-tools");
const PATH = require("path");
const FS = require("fs");
const OS = require("os");

/* Basic workflow is this:
Are we on Solaris?
  1. Yes: compile no matter what
  2. No: let's look for find and grep commands; also grep needs PCRE
   a. We found them! Nothing else is needed here.
   b. We did not find them! Look for the sources in the gnu-tools package
     * No sources found! Do `exec npm install` and set cwd()/../ to current gnu-tools dir 
*/

function main() {

    var binBasePath = __dirname + "/bin";
    if (!PATH.existsSync(binBasePath)) {
        console.log("Creating directory ", binBasePath);
        FS.mkdir(binBasePath, 0755);
    } else {
        console.log("Directory exists at ", binBasePath);
    }

    // Check if commands exist on PATH.

    commandExists("find", function(err, find) {
        if (err) fail(err);

        commandExists("grep", function(err, grep) {
            if (err) fail(err);

            checkPCRE(grep, function(err, grepPCRE) {
                if (err) fail(err);

                if (OS.platform() == "SunOS" || find === false || grepPCRE === false) {
                    
                    // Grab sources from npm (if necessary)
                    fetchSources(function (err) {
                        if (err) fail(err);
                        
                        // Compile from source.
                        runMake([
                             "install"
                         ], function(err) {
                             if (err) fail(err);
                      
                             runMake([
                                  "clean"
                              ], function(err) {
                                 if (err) fail(err);
        
                                  process.exit(0);
                              });
                         });
                    });
                }
                else {
                    console.log("Grand, you've already got 'find' and 'grep' on your system.");
                    
                    // Link to commands on PATH.
                    if (!PATH.existsSync(GNU_TOOLS.FIND_CMD)) {
                        console.log("Linking ", find, " to ", GNU_TOOLS.FIND_CMD);
                        FS.symlinkSync(find, GNU_TOOLS.FIND_CMD);
                    }
                    if (!PATH.existsSync(GNU_TOOLS.GREP_CMD)) {
                        console.log("Linking ", grep, " to ", GNU_TOOLS.GREP_CMD);
                        FS.symlinkSync(grep, GNU_TOOLS.GREP_CMD);
                    }
                }
            });
        });
    });
}

function fail(err) {
    console.error(err, err.stack);
    process.exit(1);
}

function commandExists(name, callback) {
    
    // NOTE: Assuming `which` command exists!
    EXEC("which " + name, function (error, stdout, stderr) {
        if (error || stderr) {
            // TODO: Look for `which` command not found error.
            callback(null, false);
            return;
        }

        var path = stdout.replace(/[\r\n\s]*/g, "");

        PATH.exists(path, function(exists) {
            if (!exists) {
                callback(null, false);
                return;
            }
            callback(null, path);
        });
    });
}

function checkPCRE(grep, callback) {
    // we already don't have grep; just stop
    if (grep === false) {
        callback(null, false);
        return;
    }
        
    EXEC("grep -P", function (error, stdout, stderr) {
        var firstLine = stderr.split("\n")[0];
        
        // if -P is invalid, then grep isn't supporting PCRE
        if (firstLine.match(/invalid option/)) {
            callback(null, false);
            return;
        }
        else {
            callback(null, true);
            return;
        }
    });
}

function runMake(args, callback) {

    var make = SPAWN("make", args, {
        cwd: __dirname
    });

    make.stdout.on("data", function(data) {
        process.stdout.write(data);
    });
    make.stderr.on("data", function(data) {
        process.stdout.write(data);
    });
    make.on("exit", function(code) {
        if (code !== 0) {
            callback(new Error("'make " + args.join(" ") + "' failed with code: " + code));
            return;
        }
        callback(null);
    });
}

function fetchSources(callback) {
    // check if sources already exist; don't get them below if it's not needed
    if (PATH.existsSync("./findutils-src") && PATH.existsSync("./grep-src") && PATH.existsSync("./pcre-src")) {
        callback(null);
        return;
    }

    EXEC("cd ../.. && rm -rf node_modules/gnu-tools", function(error, stdout, stderr) {
        if (error || stderr) {
            callback(new Error("Removing 'node_modules/gnu-tools' directory failed with: " + error));
            return;
        }
        EXEC("npm install gnu-tools && cd node_modules/gnu-tools", function (error, stdout, stderr) {
            if (error || stderr) {
                callback(new Error("'npm install gnu-tools' failed with: " + error));
                return;
            }
            callback(null);
            return;
        });
    });
}

if (require.main === module) {
    main();
}
