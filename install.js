
const SPAWN = require("child_process").spawn;
const EXEC = require("child_process").exec;
const GNU_TOOLS = require("./index");
const PATH = require("path");
const FS = require("fs");


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

            if (find === false || grep === false) {
                
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
            }
            else {

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


if (require.main === module) {
    main();
}
