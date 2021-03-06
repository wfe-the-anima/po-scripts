/*
Script Name: Nova's Client Script
File Name: NovaScript.js
File ID: 8f342b9004d2651c412f144cfd5e8005c557ef0e
Author: Nightfall Alicorn

*/

/*global client, print, sys*/
/*jshint strict: false, shadow: true, evil: true, laxcomma: true*/
/*jslint sloppy: true, vars: true, evil: true, plusplus: true*/

// TIMERS RESET
sys.unsetAllTimers();

// GLOBAL VARIABLES
// ******** ******** ********
var ROOT = this;
var SCRIPT_VERSION = "v1.40";
var SETTINGS_FILE_DIRECTORY = "NovaClientScriptSavedSettings.json";
var OFFICIAL_CHANNELS_ARRAY = ["Blackjack", "Developer's Den", "Evolution Game", "Hangman", "Indigo Plateau", "Mafia", "Mafia Review", "Tohjo Falls", "Tohjo v2", "Tournaments", "TrivReview", "Trivia", "Victory Road", "Watch"];
var SCRIPT_URL_STANDARD = "https://raw.githubusercontent.com/NightfallAlicorn/po-scripts/master/client/NovaScript.js";
var SCRIPT_URL_AUTO = "https://raw.githubusercontent.com/NightfallAlicorn/po-scripts/master/client/NovaScriptAutoUpdater.js";
var SCRIPT_ID_STANDARD = sys.sha1("NovaScript.js");
var SCRIPT_ID_AUTO = sys.sha1("NovaScriptAutoUpdater.js");
var INIT = false;
var PUBLIC_COMMAND_ERROR_OCCURRED = false;

var MULTI_COMMAND_WORKING = false;
var TIMER_MULTI_COMMAND_LOOP;

// CREATE AND SET DEFAULT SETTINGS
var SETTINGS = {};
SETTINGS.alertTourRound = false;
SETTINGS.botName = "ClientBot";
SETTINGS.botChannelArray = [];
SETTINGS.botColor = "#200070";
SETTINGS.commandSymbolPrivate = "-";
SETTINGS.commandSymbolPublic = "?";
SETTINGS.defineBannedArray = [];
SETTINGS.flashColor = "#ff00ff";
SETTINGS.friendArray = [];
SETTINGS.ignoreArray = [];
SETTINGS.ignoreChallenge = false;
SETTINGS.removeCaps = false;
SETTINGS.stalkWordArray = [];
SETTINGS.welcomeMessage = "<img src=\"pokemon:num=359-1&gen=6&shiny=false&back=false\">";
SETTINGS.youTubeStatsEnabled = true;

var PO_CLIENT_EVENT;

// COMMAND HANDLER OWNER
function commandHandlerPrivate(command, commandData, channelId, channelName) {
    // LOOKUP
    // ******** ******** ********
    if (command === "lookup") {
        if (commandData === "") {
            sendBotMsg("Please enter a user name.");
            return;
        }
        if (client.playerExist(client.id(commandData)) === false) {
            sendBotMsg("User " + commandData + " doesn't exist or isn't currently logged in one of your channels.");
            return;
        }
        var userId = client.id(commandData);
        var serverAuthNameArray = ["User", "Moderator", "Administrator", "Owner", "Hidden"];
        var flagArray = [];
        flagArray[0] = "Idle Off | Ladder Off | Not In Battle";
        flagArray[1] = "Idle On | Ladder Off | Not In Battle";
        flagArray[2] = "Idle Off | Ladder On | Not In Battle";
        flagArray[3] = "Idle On | Ladder On | Not In Battle";
        flagArray[4] = "Idle Off | Ladder Off | <a href='po:watchplayer/" + userId + "'>In Battle</a>";
        flagArray[5] = "Idle On | Ladder Off | <a href='po:watchplayer/" + userId + "'>In Battle</a>";
        flagArray[6] = "Idle Off | Ladder On | <a href='po:watchplayer/" + userId + "'>In Battle</a>";
        flagArray[7] = "Idle On | Ladder On | <a href='po:watchplayer/" + userId + "'>In Battle</a>";
        var preSetColorArray = ["#5811b1", "#399bcd", "#0474bb", "#f8760d", "#a00c9e", "#0d762b", "#5f4c00", "#9a4f6d", "#d0990f", "#1b1390", "#028678", "#0324b1"];
        sendBotMsg("User: " + client.name(userId) + " (Id: " + userId + ")");
        sendBotMsg("Avatar No: " + client.player(userId).avatar + " | " + "Color: " + client.color(userId) + (preSetColorArray.indexOf(String(client.color(userId))) !== -1 ? " [pre]" : "") + " | " + "Auth: " + serverAuthNameArray[client.auth(userId)] + " [" + client.auth(userId) + "]");
        sendBotHtmlMsg("Flags: " + flagArray[client.player(userId).flags] + " | Flag Bit: " + client.player(userId).flags);
        sendBotMsg("Tiers: " + client.tiers(userId).join(", "));
        sendBotMsg("Channels: " + "#" + UTILITIES.playerInChannels(userId).sort().join(", #"));
        sendBotMsg("Trainer Information: " + client.player(userId).info);
        return;
    }
    // GLOBAL MESSAGE
    // ******** ******** ********
    if (command === "gm") {
        var x;
        var globalMessage = "[Global Message] " + commandData;
        var myChannelArray = client.myChannels();
        if (commandData === "") {
            sendBotMsg("Please enter a message to global send.");
            return;
        }
        for (x = 0; x < myChannelArray.length; x++) {
            if (OFFICIAL_CHANNELS_ARRAY.indexOf(myChannelArray[x]) === -1) { // IF CHANNEL ISNT BLOCKED
                sendChanMsg(client.channelId(myChannelArray[x]), globalMessage);
            } else { // IF CHANNEL IS BLOCKED
                sendBotMsg("\"" + myChannelArray[x] + "\" was ignored in Global Message send.");
            }
        }
        return;
    }
    // CHANNEL PLAYERS
    // ******** ******** ********
    if (command === "channelplayer" || command === "channelplayers") {
        var channelPlayerNameArray = UTILITIES.channelPlayerNames(channelId);
        sendBotMsg("There are " + channelPlayerNameArray.length + " users that are currently in " + channelName + ". The users are: " + channelPlayerNameArray.join(", "));
        return;
    }
    // MEMBER ALL
    // ******** ******** ********
    if (command === "memberall") {
        var x, channelPlayerNameArray = UTILITIES.channelPlayerNames(channelId);
        sendBotMsg("Performing /member on all players in " + channelName + "...");
        for (x = 0; x < channelPlayerNameArray.length; x++) {
            if (x > 40) {
                sendBotMsg("Operation aborted due to exceeding 40 members.");
                return;
            }
            sendChanMsg(channelId, "/member " + channelPlayerNameArray[x]);
        }
        sendBotMsg("Done.");
        return;
    }
    // DEMEMBER ALL
    // ******** ******** ********
    if (command === "dememberall") {
        var x, channelPlayerNameArray = UTILITIES.channelPlayerNames(channelId);
        sendBotMsg("Performing /demember on all players in " + channelName + "...");
        for (x = 0; x < channelPlayerNameArray.length; x++) {
            if (x > 40) {
                sendBotMsg("Operation aborted due to exceeding 40 members.");
                return;
            }
            sendChanMsg(channelId, "/demember " + channelPlayerNameArray[x]);
        }
        sendBotMsg("Done.");
        return;
    }
    // KICK ALL
    // ******** ******** ********
    if (command === "kickall") {
        var x, channelPlayerNameArray = UTILITIES.channelPlayerNames(channelId);
        if (commandData === "confirm") {
            sendBotMsg("Performing /ck on all players in " + channelName + "...");
            for (x = 0; x < channelPlayerNameArray.length; x++) {
                if (x > 40) {
                    sendBotMsg("Kick limit of 40 reached. Operation stopped.");
                    return;
                }
                if (channelPlayerNameArray[x] === client.ownName()) {
                    continue;
                }
                sendChanMsg(channelId, "/ck " + channelPlayerNameArray[x]);
            }
            sendBotMsg("Completed.");
            return;
        }
        sendBotMsg("Warning: This will kick everyone from the channel. Please enter 'confirm', without the quotes, as data input after the command to perform the action.");
        return;
    }
    // MULTI COMMAND
    // ******** ******** ********
    if (command === "mc") {
        if (MULTI_COMMAND_WORKING === true) {
            sendBotMsg("Already busy performing a Multi Command.");
            return;
        }
        var multiCommand = "", multiDataString = "";
        if (commandData.indexOf(":") !== -1) {
            var dataArray = commandData.split(":", 2);
            multiCommand = dataArray[0];
            multiDataString = dataArray[1];
        }
        var multiDataArray = multiDataString.split(", ");

        // PREPAIR LOOP
        var multiLoopCount = 0;
        var multiLoopLength = multiDataArray.length;
        var multiTime = multiDataArray.length * 2;

        // TURN ON BUSY SO TWO OR MORE MULTICOMMANDS DONT WORK AT SAME TIME
        MULTI_COMMAND_WORKING = true;
        // NOFIFLY COMMAND START
        sendBotMsg("Performing \"" + multiCommand + "\" on " + multiLoopLength + " users. This will take " + multiTime + " seconds...");
        // PERFORM LOOP
        TIMER_MULTI_COMMAND_LOOP = sys.setTimer(function () {
            if (MULTI_COMMAND_WORKING === true) {
                sendChanMsg(channelId, multiCommand + " " + multiDataArray[multiLoopCount]);
                multiLoopCount++;
            }
            if (multiLoopCount >= multiLoopLength) {
                MULTI_COMMAND_WORKING = false;
                sendBotMsg("Done.");
                // WARNING, ADDING MORE CODE AFTER sys.unsetTimer AND DESTROYING THE TIMER WILL CRASH THE CLIENT
                sys.unsetTimer(TIMER_MULTI_COMMAND_LOOP);
            }
        }, 2000, true); // 2000 MILLISECONDS RECOMMENDED
        return;
    }
    // MULTI COMMAND STOP
    // ******** ******** ********
    if (command === "mcstop") {
        if (MULTI_COMMAND_WORKING === true) {
            sys.unsetTimer(TIMER_MULTI_COMMAND_LOOP);
            MULTI_COMMAND_WORKING = false;
            sendBotMsg("Multi Command stopped.");
            return;
        }
        sendBotMsg("No Multi Command currently running.");
        return;
    }
    // PM
    // ******** ******** ********
    if (command === "pm") {
        if (commandData === "") {
            sendBotMsg("Please enter the name of the user you want to PM.");
            return;
        }
        if (client.playerExist(client.id(commandData)) === false) {
            sendBotMsg("The user isn't currently logged on.");
            return;
        }
        if (client.ownName().toLowerCase() === commandData.toLowerCase()) {
            sendBotMsg("You cannot PM yourself.");
            return;
        }
        client.startPM(client.id(commandData));
        return;
    }
    // RECONNECT
    // ******** ******** ********
    if (command === "reconnect") {
        client.reconnect();
        return;
    }
    // IDLE
    // ******** ******** ********
    if (command === "idle") {
        if (commandData === "on") {
            client.goAway(true);
            sendBotMsg("Idling on.");
            return;
        }
        if (commandData === "off") {
            client.goAway(false);
            sendBotMsg("Idling off.");
            return;
        }
        sendBotMsg("Please enter 'on' or 'off' as command data input.");
        return;
    }
    // VIEW FRIENDS LIST
    // ******** ******** ********
    if (command === "friends" || command === "friend") {
        var x, outputArray = [];
        for (x = 0; x < SETTINGS.friendArray.length; x++) {
            if (client.playerExist(client.id(SETTINGS.friendArray[x])) === true) {
                outputArray.push("<a href='po:pm/" + client.id(SETTINGS.friendArray[x]) + "'>" + SETTINGS.friendArray[x] + "</a> (<font color='#00aa00'>Online</font>)");
            } else {
                outputArray.push(SETTINGS.friendArray[x] + " (<font color='#ff0000'>Offline</font>)");
            }
        }
        sendBotHtmlMsg("Friends list: " + outputArray.join(", "));
        return;
    }
    // ADD BOT AUTH
    // ******** ******** ********
    if (command === "addfriend") {
        if (commandData === "") {
            sendBotMsg("Please input a user to add to friends.");
            return;
        }
        if (SETTINGS.friendArray.indexOf(commandData.toLowerCase()) !== -1) {
            sendBotMsg("This user has already been added.");
            return;
        }
        SETTINGS.friendArray.push(commandData.toLowerCase());
        SETTINGS.friendArray = SETTINGS.friendArray.sort();
        sendBotMsg(commandData.toLowerCase() + " has been added to the friends list.");
        saveSettings();
        return;
    }
    // REMOVE BOT AUTH
    // ******** ******** ********
    if (command === "removefriend") {
        if (commandData === "") {
            sendBotMsg("Please input a user to de-friend.");
            return;
        }
        if (SETTINGS.friendArray.indexOf(commandData.toLowerCase()) === -1) {
            sendBotMsg(commandData.toLowerCase() + " isn't currently on the friends list.");
            return;
        }
        var indexToRemove = SETTINGS.friendArray.indexOf(commandData.toLowerCase());
        SETTINGS.friendArray.splice(indexToRemove, 1);
        saveSettings();
        sendBotMsg(commandData.toLowerCase() + " has been removed from the friends list.");
        return;
    }
    // VIEW STALKWORD
    // ******** ******** ********
    if (command === "stalkwords" || command === "stalkword") {
        sendBotMsg("Stalkwords: " + SETTINGS.stalkWordArray.join(", "));
        return;
    }
    // ADD STALKWORD
    // ******** ******** ********
    if (command === "addstalkword") {
        if (commandData === "") {
            sendBotMsg("Please input a stalkword after the command to add.");
            return;
        }
        if (SETTINGS.stalkWordArray.indexOf(commandData.toLowerCase()) !== -1) {
            sendBotMsg("This word has already been added.");
            return;
        }
        SETTINGS.stalkWordArray.push(commandData.toLowerCase());
        SETTINGS.stalkWordArray = SETTINGS.stalkWordArray.sort();
        sendBotMsg(commandData.toLowerCase() + " has been added to the stalkwords list.");
        saveSettings();
        return;
    }
    // REMOVE STALKWORD
    // ******** ******** ********
    if (command === "removestalkword") {
        if (commandData === "") {
            sendBotMsg("Please input a stalkword after command to remove.");
            return;
        }
        if (SETTINGS.stalkWordArray.indexOf(commandData.toLowerCase()) === -1) {
            sendBotMsg(commandData.toLowerCase() + " isn't currently in stalkwords list.");
            return;
        }
        var indexToRemove = SETTINGS.stalkWordArray.indexOf(commandData.toLowerCase());
        SETTINGS.stalkWordArray.splice(indexToRemove, 1);
        sendBotMsg(commandData.toLowerCase() + " has been removed from stalkwords list.");
        saveSettings();
        return;
    }
    // VIEW IGNORE
    // ******** ******** ********
    if (command === "ignorelist") {
        sendBotMsg("Ignore list: " + SETTINGS.ignoreArray.join(", "));
        return;
    }
    // IGNORE
    // ******** ******** ********
    if (command === "addignore") {
        if (commandData === "") {
            sendBotMsg("Please input a user to ignore.");
            return;
        }
        client.ignore(client.id(commandData), true);
        if (SETTINGS.ignoreArray.indexOf(commandData.toLowerCase()) !== -1) {
            sendBotMsg("This user has already been added.");
            return;
        }
        SETTINGS.ignoreArray.push(commandData.toLowerCase());
        SETTINGS.ignoreArray = SETTINGS.ignoreArray.sort();
        sendBotMsg((commandData.toLowerCase()) + " has been added to the ignore list.");
        saveSettings();
        return;
    }
    // DE-IGNORE
    // ******** ******** ********
    if (command === "removeignore") {
        if (commandData === "") {
            sendBotMsg("Please input a user to de-ignore.");
            return;
        }
        client.ignore(client.id(commandData), false);
        if (SETTINGS.ignoreArray.indexOf(commandData.toLowerCase()) === -1) {
            sendBotMsg((commandData.toLowerCase()) + " isn't currently an ignored.");
            return;
        }
        var indexToRemove = SETTINGS.ignoreArray.indexOf(commandData.toLowerCase());
        SETTINGS.ignoreArray.splice(indexToRemove, 1);
        sendBotMsg((commandData.toLowerCase()) + " has been bot de-ignore.");
        saveSettings();
        return;
    }
    // COLOR TO HEX
    // ******** ******** ********
    if (command === "hex") {
        if (commandData === "") {
            sendBotMsg("Please enter a color name. Note this doesn't have every color to convert to hex.");
            return;
        }
        sendBotMsg(sys.hexColor(commandData));
        return;
    }
    // SYMBALS
    // ******** ******** ********
    if ((command === "symbol") || (command === "symbols")) {
        var x;
        var symbolArray = [
            "♩", "♪", "♫", "♬",// MUSIC NOTES
            "Ω" // GREEK
        ];
        var newMessage = "";
        for (x = 0; x < symbolArray.length; x++) {
            newMessage = newMessage + " <a href='po:appendmsg/ " + symbolArray[x] + "'><font size='4'>[" + symbolArray[x] + "]</font></a>";
        }
        sendBotHtmlMsg(newMessage);
        return;
    }
    // LINK SHORTEN API
    // ******** ******** ********
    if (command === "linkshorten") {
        try {
            // THIS API USES Strudels's USER NAME AND KEY FOR https://bitly.com/
            var apiUser = "strudelspo";
            var apiKey = "R_d6acf3bcdd39459cbb522f90465c1d9c";
            var format = "txt";
            var getBitlyWebcall = sys.synchronousWebCall("http://api.bit.ly/shorten?login=" + apiUser + "&apiKey= " + apiKey + "&format=" + format + "&longUrl=" + commandData);
            if (getBitlyWebcall === "INVALID_URI") {
                sendBotMsg("Invalid URL.");
                return;
            }
            sendBotMsg("Link shortened: " + getBitlyWebcall);
            return;
        } catch (error) {
            sendBotMsg(error);
            return;
        }
    }
    // WEB CALL
    // ******** ******** ********
    if (command === "webcall") {
        if (commandData === "") {
            sendBotMsg("Please enter a web address to webcall.");
            return;
        }
        try {
            sendBotMsg(sys.synchronousWebCall(commandData));
            return;
        } catch (error) {
            sendBotMsg(error);
            return;
        }
    }
    // GET OBJECT KEYS + VALUES
    // ******** ******** ********
    if (command === "obj") {
        if (commandData === "") {
            sendBotMsg("Enter either [ROOT/client/client.network()/sys] as command data to print Pokemon Online's built-in Client Script object keys. If there are any added custom objects, you may enter them instead.");
            return;
        }
        try {
            var x, objKeys = Object.keys(eval(commandData));
            sendBotMsg("Printing " + commandData + ".keys");
            for (x = 0; x < objKeys.length; x++) {
                print("//" + objKeys[x] + ": " + eval(commandData)[objKeys[x]]);
            }
            sendBotMsg("Done.");
        } catch (error) {
            sendBotMsg(error);
        }
        return;
    }
    // EVAL
    // ******** ******** ********
    if (command === "eval") {
        if (commandData === "") {
            sendBotMsg("Enter a script line. Proceed with caution using this.");
            return;
        }
        try {
            sendBotMsg("Performing eval: " + commandData);
            eval(commandData);
        } catch (error) {
            sendBotMsg(error);
        }
        return;
    }
    // EVALP
    // ******** ******** ********
    if (command === "evalp") {
        if (commandData === "") {
            sendBotMsg("Enter a script value to print. Proceed with caution using this.");
            return;
        }
        try {
            sendBotMsg("Eval Printing: " + commandData);
            var value = eval(commandData);
            sendBotMsg("Type: '" + (typeof value) + "'");
            sendBotMsg("Value: '" + value + "'");
        } catch (error) {
            sendBotMsg(error);
        }
        return;
    }
    // RANDOM HANGMAN GAME
    // ******** ******** ********
    if (command === "rnghangman") {
        var answerRng;
        switch (UTILITIES.rng(0, 3)) {
            case 0:
                answerRng = UTILITIES.randomPoElement(sys.pokemon);
                sendChanMsg(channelId, "/start " + answerRng + ":Pokémon");
                break;
            case 1:
                answerRng = UTILITIES.randomPoElement(sys.move);
                if (answerRng === "(No Move)") {answerRng = sys.move(1); }
                sendChanMsg(channelId, "/start " + answerRng + ":Pokémon Move");
                break;
            case 2:
                answerRng = UTILITIES.randomPoElement(sys.item);
                if (answerRng === "(No Item)") {answerRng = sys.item(1); }
                sendChanMsg(channelId, "/start " + answerRng + ":Pokémon Item");
                break;
            case 3:
                answerRng = UTILITIES.randomPoElement(sys.ability);
                if (answerRng === "(No Ability)") {answerRng = sys.ability(1); }
                sendChanMsg(channelId, "/start " + answerRng + ":Pokémon Ability");
                break;
        }
        var timerAnswerMsg = sys.setTimer(function () {
            sendBotMsg("The answer is \"" + answerRng + "\".", channelId);
        }, 3000, false);
        return;
    }
    // IGNORE CHALLENGES
    // ******** ******** ********
    if (command === "ignorechallenge" || command === "ignorechallenges") {
        if (commandData === "on") {
            SETTINGS.ignoreChallenge = true;
            sendBotMsg("Ignore challenges is on.");
            saveSettings();
            return;
        }
        if (commandData === "off") {
            SETTINGS.ignoreChallenge = false;
            sendBotMsg("Ignore challenges is off.");
            saveSettings();
            return;
        }
        sendBotMsg("Ignore challenges is currently " + (SETTINGS.ignoreChallenge === true ? "on" : "off") + ".");
        return;
    }
    // REMOVE CAPS
    // ******** ******** ********
    if (command === "removecaps") {
        if (commandData === "on") {
            SETTINGS.removeCaps = true;
            sendBotMsg("Remove caps is on.");
            saveSettings();
            return;
        }
        if (commandData === "off") {
            SETTINGS.removeCaps = false;
            sendBotMsg("Remove caps is off.");
            saveSettings();
            return;
        }
        sendBotMsg("Remove caps is currently " + (SETTINGS.removeCaps === true ? "on" : "off") + ".");
        return;
    }
    // TOURNAMENT ROUND ALERT
    // ******** ******** ********
    if (command === "tourround") {
        if (commandData === "on") {
            SETTINGS.alertTourRound = true;
            sendBotMsg("Tournaments round notification enabled.");
            saveSettings();
            return;
        }
        if (commandData === "off") {
            SETTINGS.alertTourRound = false;
            sendBotMsg("Tournaments round notification disabled.");
            saveSettings();
            return;
        }
        sendBotMsg("Tournaments round notification is current " + (SETTINGS.alertTourRound === true ? "on" : "off") + ".");
        return;
    }
    // YOUTUBE STATS
    // ******** ******** ********
    if (command === "ytdata") {
        if (commandData === "on") {
            SETTINGS.youTubeStatsEnabled = true;
            saveSettings();
            sendBotMsg("YouTube data will now be printed.");
            return;
        }
        if (commandData === "off") {
            SETTINGS.youTubeStatsEnabled = false;
            saveSettings();
            sendBotMsg("YouTube data won't be printed now.");
            return;
        }
        sendBotMsg("YouTube data is currently " + (SETTINGS.youTubeStatsEnabled === true ? "on" : "off") + ".");
        return;
    }
    // CHANGE NAME
    // ******** ******** ********
    if (command === "changename") {
        if (commandData === "") {
            sendBotMsg("Please enter a name.");
            return;
        }
        if (commandData.length > 20) {
            sendBotMsg("Name is " + commandData.length + "/20 too long.");
            return;
        }
        if (commandData.length === 0) {
            sendBotMsg("Name not long enough.");
            return;
        }
        if (commandData.charAt(0) === "+") {
            sendBotMsg("'+' can't be used as the first letter.");
            return;
        }
        try {
            client.changeName(commandData);
            sendBotMsg("You changed your name to " + commandData);
        } catch (error) {
            sendBotMsg("Error with changing name.");
        }
        return;
    }
    // CHANGE BOT NAME
    // ******** ******** ********
    if (command === "changebotname") {
        if (commandData === "") {
            sendBotMsg("Current bot name is " + SETTINGS.botName  + ". Enter a new bot name after the command to change it.");
            return;
        }
        if (commandData.length > 20) {
            sendBotMsg("Name is " + commandData.length + "/20 too long.");
            return;
        }
        SETTINGS.botName = commandData;
        sendBotMsg("Bot name changed to " + commandData);
        saveSettings();
        return;
    }
    // BOT COLOR
    // ******** ******** ********
    if (command === "changebotcolor" || command === "changebotcolour") {
        if (commandData === "") {
            sendBotMsg("Current bot colo(u)r is " + SETTINGS.botColor + ". Enter a new bot colo(u)r after the command to change it. The colo(u)r can be name or rgb hex.");
            return;
        }
        if (sys.validColor(commandData) === false) {
            sendBotMsg("Invalid hex colo(u)r. Use hex command to help pick a colo(u)r.");
            return;
        }
        SETTINGS.botColor = commandData;
        sendBotMsg("Bot colo(u)r changed to " + commandData);
        saveSettings();
        return;
    }
    // FLASH/STALKWORD COLOR
    // ******** ******** ********
    if (command === "changeflashcolor" || command === "changeflashcolour") {
        if (commandData === "") {
            sendBotMsg("Current flash colo(u)r is " + SETTINGS.flashColor + ". Enter a new flash/stalkword colo(u)r. The colo(u)r can be name or rgb hex.");
            return;
        }
        if (sys.validColor(commandData) === false) {
            sendBotMsg("Invalid hex colo(u)r. Use hex command to help pick a colo(u)r.");
            return;
        }
        SETTINGS.flashColor = commandData;
        sendBotMsg("Flash/Stalkword colo(u)r changed to " + commandData);
        saveSettings();
        return;
    }
    // UPDATE SCRIPT
    // ******** ******** ********
    if (command === "updatescript") {
        if (sys.isSafeScripts() === true) {
            sendBotMsg("This command requires Safe Scripts to be enabled.");
            return;
        }
        try {
            if (commandData === "standard") {
                sendBotMsg("Downloading standard script...");
                var scriptData = String(sys.synchronousWebCall(SCRIPT_URL_STANDARD));
                sys.writeToFile(sys.scriptsFolder + "scripts.js", scriptData);
                sys.changeScript(scriptData, false);
                sendBotMsg("Script updated.");
                return;
            }
            if (commandData === "auto") {
                sendBotMsg("Downloading auto updater script...");
                var scriptData = String(sys.synchronousWebCall(SCRIPT_URL_AUTO));
                sys.writeToFile(sys.scriptsFolder + "scripts.js", scriptData);
                sys.changeScript(scriptData, false);
                sendBotMsg("Script updated.");
                return;
            }
        } catch (error) {
            sendBotMsg("Script update error on line " + error.lineNumber + ", " + error.message);
        }
        sendBotMsg("Please enter \"standard\" or \"auto\" as command data input. Standard will require manual updating. Auto will automatically update the script when you log on.");
        return;
    }
    // UPDATE SCRIPT
    // ******** ******** ********
    if (command === "uninstallscript") {
        if (sys.isSafeScripts() === true) {
            sendBotMsg("This command requires Safe Scripts to be enabled.");
            return;
        }
        if (commandData !== "confirm") {
            sendBotMsg("Warning: This will uninstall the script. You would need to re-download the script or another after this. Enter 'confirm' without the double quotes to run this command.");
            return;
        }
        sendBotMsg("Uninstalling script...");
        try {
            sys.writeToFile(sys.scriptsFolder + "scripts.js", "");
            sys.changeScript("", false);
            sendBotMsg("Script uninstalled.");
        } catch (error) {
            sendBotMsg("Script uninstall error on line " + error.lineNumber + ", " + error.message);
        }
        return;
    }
    // CHANGE OWNER COMMAND SYMBOL
    // ******** ******** ********
    if (command === "changecommandsymbol") {
        if (commandData.length < 1 || commandData.length > 3) {
            sendBotMsg("Please insert a symbol between 1 to 3 characters.");
            return;
        }
        if (commandData.indexOf(" ") !== -1) {
            sendBotMsg("The command symbol cannot contain spaces.");
            return;
        }
        SETTINGS.commandSymbolPrivate = commandData;
        sendBotMsg("Command symbol changed to: " + commandData);
        saveSettings();
        return;
    }
    // CHANGE WELCOME MESSAGE
    // ******** ******** ********
    if (command === "changewelcomemessage") {
        if (commandData === "") {
            sendBotMsg("Please enter a welcome message. HTML can be used here but don't forget to close the tags. Has to have less than 1000 characters. Enter \"none\" for no welcome message. Enter \"reset\" as command data to reset to default setting.");
            print("**** Example HTML Tags ****");
            sendBotHtmlMsg("&lt;b&gt;<b>bold</b>&lt;/b&gt;");
            sendBotHtmlMsg("&lt;i&gt;<i>italics</i>&lt;/i&gt;");
            sendBotHtmlMsg("&lt;u&gt;<u>underline</u>&lt;/u&gt;");
            sendBotHtmlMsg("&lt;font color=\"#AA00AA\"&gt;<font color=\"#AA00AA\">purple text</font>&lt;/font&gt;");
            print("**** Example Pokémon ****");
            sendBotHtmlMsg("<img src=\"pokemon:num=359-1&gen=6&shiny=false&back=false\">");
            sendBotMsg("<img src=\"pokemon:num=359-1&gen=6&shiny=false&back=false\">");
            sendBotMsg("Explanation:");
            sendBotHtmlMsg("num=<b>359</b> is the Pokémon's Pokédex number to use. The <b>-1</b> being the alternative form.");
            sendBotHtmlMsg("gen=<b>4</b> is the Pokémon's generation sprite to use.");
            sendBotHtmlMsg("shiny=<b>false</b> is the Pokémon shiny? true/false");
            sendBotHtmlMsg("back=<b>false</b> use the Pokémon's back sprite? true/false");
            return;
        }
        if (commandData === "reset") {
            SETTINGS.welcomeMessage = "<img src=\"pokemon:num=359-1&gen=6&shiny=false&back=false\">";
            sendBotMsg("Welcome message reset to default.");
            sendBotHtmlMsg(SETTINGS.welcomeMessage);
            saveSettings();
            return;
        }
        if (commandData.length > 1000) {
            sendBotMsg("Message is " + commandData.length + " out of 1000 limit. Please make it shorter.");
            return;
        }
        SETTINGS.welcomeMessage = commandData;
        sendBotHtmlMsg(SETTINGS.welcomeMessage);
        saveSettings();
        return;
    }
    // CREDITS
    if (command === "credits") {
        var x;
        printHtml("");
        var creditsArray = [
        "**** Credits ****"
        ,"Script written by: Nightfall Alicorn"
        ,"Link Shortener API provided by: Strudels"
        ,"YouTube Stats API provided by: Crystal Moogle"
        ,"Contributed suggestions: Elize Lutus, SongSing"
        ,"Auto Updater Script Idea by: Heark"
        ];
        for (x = 0; x < creditsArray.length; x++) {
            if (["#", "*"].indexOf(creditsArray[x].charAt(0)) !== -1) {
                print(creditsArray[x]);
                continue;
            }
            print("~" + creditsArray[x]);
        }
        return;
    }
    // OWNER HELP CONSOLE
    // ******** ******** ********
    if ((command === "help") || (command === "commands")) {
        var x;
        printHtml("");
        printHtml("<font color='#003000'><timestamp/><b>~ Nova's Client Script " + SCRIPT_VERSION + " [" + scriptTypeInstalled() + "] Commands ~</b></font>");
        // OWNER COMMANDS
        var helpArrayOwner = [
        "**** Helpers ****"
        ,"lookup [user]: Reveals detailed information about the user."
        ,"gm [message]:  Sends a global message to all channels you are currently in, excluding official ones."
        ,"memberall: Adds all players in channel as members."
        ,"dememberall: Removes all players in channel from members."
        ,"kickall: Kicks all users except self from channel."
        ,"channelplayer(s): Prints a list of names of players in channel."
        ,"mc [command]:[name1, name2, name3...]: Performs a multi command on a list of users, separated by comma and space, at once."
        ,"mcstop: Stops a current Multi Command running."
        ,"pm [user]: PM a user."
        ,"reconnect: Reconnect to the server."
        ,"hex [colo(u)r name]: Prints the hex of a color name. Doesn't have all colors."
        ,"symbol(s): Displays an input panel of symbols."
        ,"**** Official Channel Helpers ****"
        ,"rnghangman: Makes a random hangman game on the official Pokemon Online server."
        ,"**** API Tools ****"
        ,"linkshorten [link]: Prints a shorten version of a web link."
        ,"**** Settings ****"
        ,"changename [new name]: Changes your name."
        ,"changebotname [new name]: Changes the bot name."
        ,"changebotcolo(u)r [hex]: Changes bot color."
        ,"changeflashcolo(u)r [hex]: Changes flash/stalkword color."
        ,"changewelcomemessage [new message/none/reset]: Changes the welcome message. Enter no command data for help."
        ,"changecommandsymbol [symbol]: Changes the script owner's command symbol. Can be 1-3 characters."
        ,"ignorelist: Displays your ignore list."
        ,"[add/remove]ignore: Add/Remove someone to the ignore list."
        ,"friend(s): Displays your list of friends and their online status."
        ,"[add/remove]friend: Add/Remove friend."
        ,"stalkword(s): Displays your current stalkwords."
        ,"[add/remove]stalkword [word]: Add/Remove stalkwords."
        ,"**** Automation Settings ****"
        ,"idle [on/off]: Turns idle on or off."
        ,"ignorechallenge(s) [on/off]: Auto refuse challenges even when not idle."
        ,"removecaps [off/on]: Remove caps from your messages. This doesn't include bot commands."
        ,"tourround [off/on]: Allows notifications when rounds begin in tournaments."
        ,"ytdata [off/on]: Show YouTube of links in channel."
        ,"**** Advanced Scripting Tools ****"
        ,"eval [script]: Performs script actions. Use with caution."
        ,"evalp [script value]: Prints script value and its typeof with eval. Use with caution."
        ,"obj [ROOT/SETTINGS/client/client.network()/sys]: Prints list of Pokemon Online's object keys. Own objects can be viewed."
        ,"webcall [link]: Obtains and prints data from the web."
        ,"**** Script Options ****"
        ,"uninstallscript: Removes this script."
        ,"updatescript [standard/auto]: Downloads and updates the script from its hosting source."
        ,"credits: Display the credits."
        ];
        // OTHER COMMANDS
        var helpArrayOther = [
        "#COMMANDS:"
        ,"N/A"
        ];
        for (x = 0; x < helpArrayOwner.length; x++) {
            if (["#", "*"].indexOf(helpArrayOwner[x].charAt(0)) !== -1) {
                print(helpArrayOwner[x]);
                continue;
            }
            print(SETTINGS.commandSymbolPrivate + helpArrayOwner[x]);
        }
        // for (x = 0; x < helpArrayOther.length; x++) {
        //     if (["#", "*"].indexOf(helpArrayOther[x].charAt(0)) !== -1) {
        //         print(helpArrayOther[x]);
        //         continue;
        //     }
        //     print(SETTINGS.commandSymbolPublic + helpArrayOther[x]);
        // }
        return;
    }
    return false;
} // END OF commandHandlerPrivate

// COMMAND HANDLER OTHER
function commandHandlerPublic(command, commandData, myName, userSentName, userSentMessage, userSentId, userSentAuth, userSentColor, channelId, channelName) {
    // ADD BOTS YOU WANT OTHERS TO USE HERE
    
} // END OF commandHandlerPublic

// PRINT
function print(message, channelId) {
    if (channelId === undefined) {
        channelId = client.currentChannel();
    }
    client.printChannelMessage(message, channelId, false);
    return;
}
// PRINT HTML
function printHtml(message, channelId) {
    if (channelId === undefined) {
        channelId = client.currentChannel();
    }
    client.printChannelMessage(message, channelId, true);
}
// SEND CHANNEL MESSAGE
function sendChanMsg(channelId, message) {
    client.network().sendChanMessage(channelId, message);
    return;
}
// SEND CHANNEL BOT MESSAGE
function sendChanBotMsg(channelId, message) {
    client.network().sendChanMessage(channelId, "++" + SETTINGS.botName + ": " + message);
    return;
}
// SEND BOT MESSAGE
function sendBotMsg(message, channelId) {
    if (channelId === undefined) {
        channelId = client.currentChannel();
    }
    client.printChannelMessage("++" + SETTINGS.botName + ": " + message, channelId, false);
    return;
}
// SEND BOT HTML MESSAGE
function sendBotHtmlMsg(message, channelId) {
    if (channelId === undefined) {
        channelId = client.currentChannel();
    }
    client.printChannelMessage("<font color='" + SETTINGS.botColor + "'><timestamp/><b>" + "++" + SETTINGS.botName + ":</font></b> " + message, channelId, true);
    return;
}
// SAVE SETTINGS
function saveSettings() {
    if (sys.isSafeScripts() === false) {
        sys.writeToFile(SETTINGS_FILE_DIRECTORY, JSON.stringify(SETTINGS));
        sendBotMsg("Settings saved.");
    } else {
        sendBotMsg("Error. Enable to update changes due to Safe Scripts being disabled.");
    }
}
// LOAD SETTINGS
function loadSettings() {
    // IF SETTINGS FILE DOES NOT EXIST, CREATE IT, ELSE THIS DOES NOTHING
    sys.appendToFile(SETTINGS_FILE_DIRECTORY, "");
    // CHECK IF SETTINGS FILE EXISTS
    if (sys.getFileContent(SETTINGS_FILE_DIRECTORY) === "") {
        sendBotMsg("No settings file found. Save file is now created ready.");
    } else {
        try {
            // LOAD SETTINGS + ADD MISSING PERIMETERS TO OLD FILE + RUN SETTINGS
            var objDataLoaded = JSON.parse(sys.getFileContent(SETTINGS_FILE_DIRECTORY));
            toolFillObject(SETTINGS, objDataLoaded);
            SETTINGS = objDataLoaded;
            sendBotMsg("Settings loaded.");
        } catch (error) {
            sendBotMsg("Unknown error occurred. The settings file might be corrupted.");
            sendBotMsg("Debug information: " + error);
        }
    }
}
// SCRIPT INSTALLED
function scriptTypeInstalled() {
    var poScriptFile = sys.getFileContent(sys.scriptsFolder + "scripts.js");
    if (poScriptFile.indexOf(SCRIPT_ID_STANDARD) !== -1) {
        return "Standard";
    } else if (poScriptFile.indexOf(SCRIPT_ID_AUTO) !== -1) {
        return "Auto Updater";
    }
    return "Unknown";
}
// IS LOWER CASE CHECK
function isLowerCased(text) {
    return text.toLowerCase() === text;
}
// FILL OBJECT
function toolFillObject(from, to) {
    for (var key in from) {
        if (from.hasOwnProperty(key)) {
            if (Object.prototype.toString.call(from[key]) === "[object Object]") {
                if (!to.hasOwnProperty(key)) {
                    to[key] = {};
                    sendBotMsg("Creating missing settings object: " + key);
                }
                toolFillObject(from[key], to[key]);
            }
            else if (!to.hasOwnProperty(key)) {
                to[key] = from[key];
                sendBotMsg("Creating missing settings perimeter: " + key);
            }
        }
    }
}

var UTILITIES = {
    arrayShuffle: function (array) {
        var x, tempValue, randomIndex;
        for (x = 0; x < array.length; x++) {
            randomIndex = Math.floor(Math.random() * array.length);
            tempValue = array[x];
            array[x] = array[randomIndex];
            array[randomIndex] = tempValue;
        }
        return array;
    },
    arraySlice: function (array, max) {
        var x, newArray = [], limit;
        if (max > array.length) {
            limit = array.length;
        } else {
            limit = max;
        }
        for (x = 0; x < limit; x++) {
            newArray.push(array[x]);
        }
        return newArray;
    },
    arrayToLowerCase: function (array) {
        var x;
        for (x = 0; x < array.length; x++) {
            array[x] = array[x].toLowerCase();
        }
        return array;
    },
    channelPlayerNames: function (channelId) {
        var x, playerIdArray = client.channel(channelId).players(), playerNameArray = [];
        for (x = 0; x < playerIdArray.length; x++) {
            playerNameArray[x] = client.name(playerIdArray[x]);
        }
        return playerNameArray;
    },
    deepCopyObject: function (obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    getTier: function (tierName) {
        var x, tiersArray = client.getTierList();
        for (x = 0; x < tiersArray.length; x++) {
            if (tiersArray[x].toLowerCase() === tierName.toLowerCase()) {
                return tiersArray[x];
            }
        }
        return;
    },
    htmlEscape: function (text) {
        return String(text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
    },
    htmlStrip: function (text) {
        return text.replace(/(<([^>]+)>)/ig, "");
    },
    isBattling: function (playerId) {
        if (client.playerExist(playerId) === false) {
            return;
        }
        return [4, 5, 6, 7].indexOf(client.player(playerId).flags) !== -1;
    },
    isIdling: function (playerId) {
        if (client.playerExist(playerId) === false) {
            return;
        }
        return [1, 3, 5, 7].indexOf(client.player(playerId).flags) !== -1;
    },
    isLowerCased: function (text) {
        return text.toLowerCase() === text;
    },
    playerInChannels: function (playerId) {
        var x, y, foundArray = [], playerIdArray = [], myChannelsArray = client.myChannels();
        for (x = 0; x < myChannelsArray.length; x++) {
            playerIdArray = client.channel(client.channelId(myChannelsArray[x])).players();
            for (y = 0; y < playerIdArray.length; y++) {
                if (String(client.name(playerId).toLowerCase()) === String(client.name(playerIdArray[y]).toLowerCase())) {
                    foundArray.push(myChannelsArray[x]);
                }
            }
        }
        return foundArray;
    },
    poCommandTimeConvert: function (input) {
        var x, junctionArrayNum;
        if (input === undefined) {
            return "1 day";
        }
        try {
            // GET SECONDS
            var parts = input.split(" ");
            var seconds = 0;
            for (x = 0; x < parts.length; x++) {
                var countType = (parts[x][parts[x].length - 1]).toLowerCase();
                var secondsMultiply = 60;
                if (countType === "s") { secondsMultiply = 1; }
                else if (countType === "m") { secondsMultiply = 60; }
                else if (countType === "h") { secondsMultiply = 60*60; }
                else if (countType === "d") { secondsMultiply = 24*60*60; }
                else if (countType === "w") { secondsMultiply = 7*24*60*60; }
                seconds = seconds + secondsMultiply * parseInt(parts[x], 10);
            }
            // GET TIME STRING
            var splitArray = [];
            var actualNumber;
            var dateTypeArray = [[7*24*60*60, "week"], [24*60*60, "day"], [60*60, "hour"], [60, "minute"], [1, "second"]];
            for (junctionArrayNum = 0; junctionArrayNum < 5; ++junctionArrayNum) {
                actualNumber = parseInt(seconds / dateTypeArray[junctionArrayNum][0], 10);
                if (actualNumber > 0) {
                    splitArray.push((actualNumber + " " + dateTypeArray[junctionArrayNum][1] + (actualNumber > 1 ? "s" : "")));
                    seconds = seconds - actualNumber * dateTypeArray[junctionArrayNum][0];
                    if (splitArray.length >= 2) {
                        break;
                    }
                }
            }
            return splitArray.join(", ");
        } catch (error) {
            return "1 day";
        }
    },
    randomPoElement: function (obj) {
        // Tested objects: sys.pokemon, sys.move, sys.item, sys.nature, sys.ability, sys.gender
        var x = 0, elementArray = [];
        while ((["Missingno", undefined, ""].indexOf(obj(x)) === -1) || (x < 1)) {
            elementArray[x] = obj(x);
            x++;
        }
        return elementArray[Math.floor(Math.random() * elementArray.length)];
    },
    removeNonChar: function (text) {
        var x, y,
            allowedChar = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ",
            output = "";
        text = String(text);
        for (x = 0; x < text.length; x++) {
            for (y = 0; y < allowedChar.length; y++) {
                if (text.charAt(x) === allowedChar.charAt(y)) {
                    output = output + allowedChar.charAt(y);
                }
            }
        }
        return output;
    },
    rng: function (minNumber, maxNumber) {
        return Math.floor(Math.random() * (1 + parseInt(maxNumber, 10) - parseInt(minNumber, 10))) + parseInt(minNumber, 10);
    },
    specialCharEscape: function (text) {
        var x,
            specialChar = "àáāäâăåąçčèéëêěėēęìíïîķñòóöôõōśşùúüûūůý",
            normalChar = "aaaaaaaacceeeeeeeeiiiiknoooooossuuuuuuv";
        for (x = 0; x < specialChar.length; x++) {
            text = text.replace(new RegExp(specialChar.charAt(x), "g"), normalChar.charAt(x));
        }
        return String(text);
    },
    timeStringToValue: function (text) {
        var date = new Date(), hour = date.getHours(), minute = date.getMinutes(), second = date.getSeconds();
        if (hour < 10) {
            hour = String("0" + hour);
        } else {
            hour = String(hour);
        }
        if (minute < 10) {
            minute  = String("0" + minute);
        } else {
            minute = String(minute);
        }
        if (second < 10) {
            second  = String("0" + second);
        } else {
            second = String(second);
        }
        return text.replace(/hh/i, hour).replace(/mm/i, minute).replace(/ss/i, second);
    }
};

// LOAD SETTINGS, IF SCRIPT IS UPDATED BY SCRIPT WINDOW
if (client.ownId() !== -1) {
    if (INIT === false) {
        INIT = true;
        loadSettings();
    }
}

// LOAD SETTINGS, IF USER LOGS ON
client.network().playerLogin.connect(function () {
    if (INIT === false) {
        INIT = true;
        loadSettings();
    }
});

// INITIZE NOTIFATION
if (SETTINGS.welcomeMessage !== "none") {
    sendBotHtmlMsg(SETTINGS.welcomeMessage);
}
sendBotHtmlMsg("Nova's Client Script " + SCRIPT_VERSION + " [" + scriptTypeInstalled() + "]");
sendBotMsg("Use " + SETTINGS.commandSymbolPrivate + "help for commands.");

PO_CLIENT_EVENT = ({
    onPlayerReceived: function (userIdReceived) {
        var userNameReceived = client.name(userIdReceived);
        // ALERT USER LOGGED ON + PM LINK
        var x;
        for (x = 0; x < SETTINGS.friendArray.length; x++) {
            if (SETTINGS.friendArray[x] === userNameReceived.toLowerCase()) {
                sendBotHtmlMsg("<a href='po:pm/" + userIdReceived + "'>" + userNameReceived + "</a> has logged on.");
            }
        }
    },
    beforeChallengeReceived: function (challengeId, opponentId, tier, clauses) {
        // AUTO REFUSE CHALLEANGE
        // ******** ******** ********
        if (SETTINGS.ignoreChallenge === true) {
            sys.stopEvent();
            return;
        }
    }, // END OF beforeChallengeReceived
    beforeChannelMessage: function (fullMessage, channelId, html) {
        // TEMP VARIABLES
        // ******** ******** ********
        var myName = client.ownName();
        var userSentName = fullMessage.substring(0, fullMessage.indexOf(':'));
        var userSentMessage = fullMessage.substr(fullMessage.indexOf(':') + 2);
        var userSentId = client.id(fullMessage.substring(0, fullMessage.indexOf(':')));
        var userSentAuth = client.auth(client.id(fullMessage.substring(0, fullMessage.indexOf(':'))));
        var userSentColor = client.color(client.id(fullMessage.substring(0, fullMessage.indexOf(':'))));
        var channelName = client.channelName(channelId);
        // COMMAND + COMMAND DATA SETUP
        // ******** ******** ********
        var command = "", commandData = "";
        if (SETTINGS.commandSymbolPublic.indexOf(userSentMessage.charAt(0)) !== -1) {
            var split = userSentMessage.indexOf(" ");
            if (split !== -1) {
                command = userSentMessage.substring(1, split).toLowerCase();
                commandData = userSentMessage.substr(split + 1);
            } else {
                command = userSentMessage.substr(1).toLowerCase();
            }
        }
        // AUTO IGNORE USER
        // ******** ******** ********
        if (myName !== userSentName && client.isIgnored(userSentId) === false && SETTINGS.ignoreArray.indexOf(userSentName.toLowerCase()) !== -1) {
            client.ignore(userSentId, true);
            return;
        }
        if (html === true) {
            // BLOCK /ME IGNORE ESCAPE
            var msgPrefix = "<timestamp/> *** <b>";
            if (fullMessage.indexOf(msgPrefix) !== -1) {
                var meName = fullMessage.substring(fullMessage.indexOf("<b>") + 3, fullMessage.indexOf("</b>"));
                if (SETTINGS.ignoreArray.indexOf(meName.toLowerCase()) !== -1) {
                    sys.stopEvent();
                    return;
                }
            }
            // BLOCK /RAINBOW IGNORE ESCAPE
            var msgPrefix = "<timestamp/><b><span style";
            if (fullMessage.indexOf(msgPrefix) !== -1) {
                var htmlEscapedMsg = UTILITIES.htmlStrip(fullMessage);
                if (htmlEscapedMsg.indexOf(": " !== -1)) {
                    rainbowName = htmlEscapedMsg.substring(0, htmlEscapedMsg.indexOf(": "));
                    if (rainbowName.charAt(0) === "+") {
                        rainbowName = rainbowName.substr(1);
                    }
                    if (SETTINGS.ignoreArray.indexOf(rainbowName.toLowerCase()) !== -1) {
                        sys.stopEvent();
                        return;
                    }
                }
            }
        }
        // SERVER NOTIFICATIONS
        // ******** ******** ********
        if (html === true) {
            // -- TOUR ALERT NOTIFICATION --
            var msgPrefix = "<font color=red>You are currently alerted when";
            var msgSuffix = "tournament is started!</font><ping/>";
            if (fullMessage.substring(0, msgPrefix.length) === msgPrefix && fullMessage.indexOf(msgSuffix) !== -1) {
                // "AN" AND "A" CHECK SO TIER CAN BE OBTAINED
                if (fullMessage.substring(msgPrefix.length + 1, msgPrefix.length + 3) === "an") {
                    msgPrefix = msgPrefix + " an";
                } else {
                    msgPrefix = msgPrefix + " a";
                }
                var tierName = fullMessage.substring(msgPrefix.length + 1, fullMessage.indexOf(msgSuffix) - 1);
                client.trayMessage("Tour Alert", tierName + " tournament has just started signups.");
            }
            // -- MAFIA ALERT NOTIFICATION --
            var msgPrefix = "A";
            var msgSuffix = "mafia game is starting, Ozma<ping/>";
            if (fullMessage.substring(0, msgPrefix.length) === msgPrefix && fullMessage.indexOf(msgSuffix) !== -1) {
                var themeName = fullMessage.substring(msgPrefix.length + 1, fullMessage.indexOf(msgSuffix) - 1);
                client.trayMessage("Mafia Alert", themeName + " theme has just started signups.");
            }
            // -- TOUR ROUND NOFIFICATION --
            if (SETTINGS.alertTourRound === true) {
                if (fullMessage.indexOf("Round") !== -1) {
                    client.trayMessage("Tour Alert", "Next round in tournament.");
                } else if (fullMessage.indexOf("Final Match") !== -1) {
                    client.trayMessage("Tour Alert", "Final round in tournament.");
                }
            }
            // -- TOUR WAITING FOR BATTLE NON-ACTIVE NOFIFICATION --
            var msgPrefix = "<ping/><font color=red>";
            var msgSuffix = "to avoid disqualification - if they are not on, post a message in tournaments about it and contact a megauser if necessary.</font>";
            if (fullMessage.indexOf(msgPrefix) !== -1 && fullMessage.indexOf(msgSuffix) !== -1) {
                client.trayMessage("Tour Alert", "Your next battle is up in Tournaments.");
            }
            // -- TOUR WAITING FOR BATTLE ACTIVE NOFIFICATION --
            var msgPrefix = "<ping/>";
            var msgSuffix = "ASAP - if they are not on, post a message in tournaments about it and contact a megauser if necessary.";
            if (fullMessage.indexOf(msgPrefix) !== -1 && fullMessage.indexOf(msgSuffix) !== -1) {
                client.trayMessage("Tour Alert", "Your next battle is up in Tournaments.");
            }
        }
        // FORMAT MESSAGES
        // ******** ******** ********
        // IGNORE GUI IGNORED USERS
        if (client.isIgnored(userSentId) === true) {
            return;
        }
        // IGNORE /me MESSAGES
        if (fullMessage.indexOf("<timestamp/> *** <b>") !== -1) {
            return;
        }
        // IGNORE /rainbow MESSAGES
        if (fullMessage.indexOf("<timestamp/><b><span style") !== -1) {
            return;
        }
        // IGNORE HTML MESSAGES, PREVENTS MESSAGE LOOP
        if (html === true) {
            return;
        }
        // CONVERT TO HTML + ADD FLASHES + ADD LINKS + PRINT HTML + PING FLASH NOTIFICATIONS
        if (fullMessage.indexOf(": ") > -1) {
            sys.stopEvent();
            // ESCAPE HTML
            var newMessage = UTILITIES.htmlEscape(userSentMessage);
            // ADD NAME FLASH
            var myNameFlash = newMessage.match(new RegExp('\\b' + myName + '\\b', 'i'));
            if (myNameFlash !== null) {
                newMessage = newMessage.replace(myNameFlash, "<i><span style='BACKGROUND-COLOR: " + SETTINGS.flashColor + "'>" + myNameFlash + "</span></i><ping/>");
            }
            // ADD STALKWORD FLASH
            var stalkWordFlash;
            for (x = 0; x < SETTINGS.stalkWordArray.length; x++) {
                stalkWordFlash = newMessage.match(new RegExp('\\b' + SETTINGS.stalkWordArray[x] + '\\b', 'i'));
                if (stalkWordFlash !== null) {
                    newMessage = newMessage.replace(stalkWordFlash, "<i><span style='BACKGROUND-COLOR: " + SETTINGS.flashColor + "'>" + stalkWordFlash + "</span></i><ping/>");
                }
            }
            // ADD WEB LINKS
            newMessage = newMessage.replace(/(\b(https?|ftp|file):\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[\-A-Z0-9+&@#\/%=~_|])/ig, "<a href='$1'>$1</a>");
            // ADD CHANNEL LINKS
            newMessage = client.channel(channelId).addChannelLinks(newMessage);
            // PRINT HTML
            if (userSentId === -1) { // BOT MESSAGE
                printHtml("<font color='" + SETTINGS.botColor + "'><timestamp/><b>" + userSentName + ":</b></font> " + newMessage, channelId);
            }
            if (userSentId !== -1) { // USER MESSAGE
                var userSentNameFormatted = userSentName;
                // SERVER AUTH CHECK
                var serverAuthSymbol = "";
                if (userSentAuth > 0) {
                    serverAuthSymbol = "+";
                    userSentNameFormatted = "<i>" + userSentNameFormatted + "</i>";
                }
                printHtml("<font color='" + userSentColor + "'><timestamp/>" + serverAuthSymbol + "<b>" + userSentNameFormatted + ":</b></font> " + newMessage, channelId);
            }
            // BLOCK PINGS FROM BOTS AND SELF
            if (userSentId === -1 || userSentName === myName) {
                newMessage = newMessage.replace(/<ping\/>/g, "");
            }
            // TASKBAR NOFIFICATION IF PING TAG ARE DETECTED
            if (newMessage.indexOf("<ping/>") !== -1) {
                client.trayMessage("Flashed in " + channelName + ": ", UTILITIES.timeStringToValue("hh:mm:ss") + " || " + userSentName + ": \n" + userSentMessage);
            }
        }
        // YOUTUBE DATA
        // ******** ******** ********
        (function youTubeStats() {
            if (SETTINGS.youTubeStatsEnabled === false) {
                return;
            }
            if (((userSentMessage.indexOf("youtube.com") !== -1) && (userSentMessage.indexOf("watch?v=") !== -1)) || (userSentMessage.indexOf("youtu.be/") !== -1)) {
                var youTubeVideoId;
                // print("Debug: YT Detected");
                // -- PC LINK --
                if (userSentMessage.indexOf("youtube.com") !== -1) {
                    youTubeVideoId = userSentMessage.substr(userSentMessage.indexOf("watch?v=") + 8, 11).trim();
                    // print("Debug: YouTube PC Id " + youTubeVideoId);
                }
                // -- MOBILE LINK --
                if (userSentMessage.indexOf("youtu.be/") !== -1) {
                    youTubeVideoId = userSentMessage.substr(userSentMessage.indexOf("youtu.be/") + 9, 11).trim();
                    // print("Debug: YouTube Android Id " + youTubeVideoId);
                }
                // ERROR CATCH IN CASE LINK FAILS
                try {
                    // GET DATA
                    var youTubeData = JSON.parse(sys.synchronousWebCall("http://crystal.moe/youtube?id=" + youTubeVideoId));
                    // OBTAIN DATA
                    var title = youTubeData.items[0].snippet.localized.title;                            
                    var author = youTubeData.items[0].snippet.channelTitle;
                    var comments = youTubeData.items[0].statistics.commentCount;
                    var duration = youTubeData.items[0].contentDetails.duration
                            .toLowerCase().substr(2).replace("h", "h ").replace("m", "m ").replace("s", "s");
                    var views = youTubeData.items[0].statistics.viewCount;
                    var likes = youTubeData.items[0].statistics.likeCount;
                    var disLikes = youTubeData.items[0].statistics.dislikeCount;
                    // PRINT MESSAGE
                    sendBotMsg("Title: " + title + ", Author: " + author + ", Comments: " + comments + ", Duration: " + duration + ", Views: " + views + ", Likes: " + likes + ", Dislikes: " + disLikes, channelId);
                } catch (error) {
                    sendBotMsg("YouTube video data load failed.", channelId);
                }
            }
        }());
        // CALL PUBLIC COMMAND HANDLER
        // ******** ******** ********
        try {
            commandHandlerPublic(command, commandData, myName, userSentName, userSentMessage, userSentId, userSentAuth, userSentColor, channelId, channelName);
        } catch (error) {
            if (PUBLIC_COMMAND_ERROR_OCCURRED === false) {
                PUBLIC_COMMAND_ERROR_OCCURRED = true;
                // ALERT CHANNEL USER THAT ERROR HAD BEEN REPORTED
                if (client.ownName() !== userSentName) {
                    sendChanBotMsg(channelId, "Script error occurred. The bot owner been alerted about it.");
                }
                sendBotMsg("commandHandlerPublic error on line " + error.lineNumber + ", " + error.message + ", to prevent client crashes only one error will be given");
            }
        }
    }, // END OF beforeChannelMessage
    beforeSendMessage: function (sentMessage, channelId) {
        // COMMAND + COMMAND DATA SETUP
        // ******** ******** ********
        var command = "", commandData = "";
        if (SETTINGS.commandSymbolPrivate === sentMessage.substring(0, SETTINGS.commandSymbolPrivate.length)) {
            var split = sentMessage.indexOf(" ");
            if (split !== -1) {
                command = sentMessage.substring(SETTINGS.commandSymbolPrivate.length, split).toLowerCase();
                commandData = sentMessage.substr(split + 1);
            } else {
                command = sentMessage.substr(SETTINGS.commandSymbolPrivate.length).toLowerCase();
            }
        }
        // PREVENT PRIATE COMMANDS BEING SEEN, EVEN TYPO ONES
        // ******** ******** ********
        if (command.length > 0) {
            sys.stopEvent();
        }
        // CALL PRIVATE COMMAND HANDLER
        // ******** ******** ********
        try {
            var isPrivateCommand = commandHandlerPrivate(command, commandData, channelId, client.channelName(channelId));
            if (isPrivateCommand === false && command.length > 0) {
                sendBotMsg("The bot command " + command + " doesn't exist.");
            }
        } catch (error) {
            sendBotMsg("commandHandlerPrivate error on line " + error.lineNumber + ", " + error.message);
        }
        // ANTI CAPS
        // ******** ******** ********
        if (SETTINGS.removeCaps === true && UTILITIES.isLowerCased(sentMessage) === false && command.length === 0) {
            sys.stopEvent();
            sendChanMsg(channelId, sentMessage.toLowerCase());
        }
    } // END OF beforeSendMessage
});
