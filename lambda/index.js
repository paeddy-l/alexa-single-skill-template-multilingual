/*
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.

###################################################################################
###################################################################################
######################### Konfiguartion /-\ Configuartion #########################
###################################################################################
###################################################################################
*/


// Stationsname
// Station name
const stationName = "STATIONSNAME"               // Name from the Station

// Ausgesprochener Name in verschiedenen Sprachen
// Pronounced name in different languages 
const spokenStationName = {
    de_DE: "Dein ausgesprochener Sendername",   // German
    en_EN: "your pronounced station name",      // English
    fr_FR: "",                                  // French
    es_ES: "",                                  // Spanish
    it_IT: "",                                  // Italian
}

// laut.fm-API verwenden?
// Use laut.fm API?
const useAPI = false;                           // true = yes / false = no

// Station slogan
const stationSlogan = {
    de_DE: "Slogan der Station",                // German
    en_EN: "Station slogan",                    // English
    fr_FR: "",                                  // French
    es_ES: "",                                  // Spanish
    it_IT: "",                                  // Italian
}

// Anzeigename
// Display name
const stationDisplayName = {
    de_DE: "Name der angezeigt wird",           // German
    en_EN: "Name that will be displayed",       // English
    fr_FR: "",                                  // French
    es_ES: "",                                  // Spanish
    it_IT: "",                                  // Italian	
}

// Standardsprache
// Default language
const default_language = "en_EN";              // Example: "en_EN", "de_DE .."

/*
####################################################################################
####################################################################################
############################ Ab hier nichts mehr ändern ############################
######################### Do not change anything from here #########################
####################################################################################
####################################################################################
*/
const existingLanguages = [
    'de_DE',     // German
    'en_EN',     // English
    'fr_FR',     // French
    'es_ES',     // Spanish
    'it_IT'      // Italian
];

const Alexa = require('ask-sdk-core');
const axios = require('axios');
const languages = require('./languages.json');

// Clean station name
const stationNameClean = function() {
    return stationName.substring(stationName.lastIndexOf("/") + 1).replace(/[^A-Za-z0-9-_]/g,'').toLowerCase()
}

// Create the stream URL
const url = `https://stream.laut.fm/${stationNameClean()}?ref=alexa-own-${stationNameClean()}`;

// Creation of the token
const token = function() {
    return url + '&' + ( new Date() ).getTime();
}

// Read of APL documents for use in handlers
const StationAPL = function() {
    return require('./station-data-apl.json');
}

// Create CET or CEST time format instead of UTC
const dateCET_CEST = function() {
    let options = {
        timeZone: 'Europe/Berlin',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      },
    formatter = new Intl.DateTimeFormat([], options);
    return new Date(formatter.format(new Date()));
}

// Get information about the station
const StationInfoUrl = function() {
   return `https://api.laut.fm/station/${stationNameClean()}`
}

// Get information about the current song
const StationCurrentSongUrl = function() {
    return `https://api.laut.fm/station/${stationNameClean()}/last_songs`
}

// Make an API request
const APIRequest = async (url) => {
    try {
        const { data } = await axios.get(url);
        return data;
    } catch (error) {
        console.error(`~~~~ Error API-Request: ${error}`);
    }
};

// language change
const newLocale = function(lang) {
    if (lang === "en_GB" || lang === "en_CA" || lang === "en_AU" || lang === "en_IN" || lang === "en_US") { lang = "en_EN"; }
    if (lang === "es_US" || lang === "es_MX") { lang = "es_ES"; }
    if (lang === "fr_FR" || lang === "fr_CA") { lang = "fr_FR"; }
    return lang;
}

// Create url from stations logo
const stationImg = function(special) {
    let imgURL = `https://api.laut.fm/station/${stationNameClean()}/images/station_${special}`
    if (special === undefined) {
        imgURL = `https://api.laut.fm/station/${stationNameClean()}/images/station`
    }
    return imgURL;
}

// Change to speak correctly
function ssmlChange (data) {
    return data
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\\/g, '\\\\')
}

let display_name = "";
let format = "";

 // Check if APL is supported
 function supportsAPL(handlerInput) {
    const supportedInterfaces = handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
    const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
    return aplInterface !== null && aplInterface !== undefined;
}


// Öffne, starte, spiele {invocation name}
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest'
          || (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
          && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlayStationIntent'
          || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StartOverIntent'
          || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NextIntent'
          || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ResumeIntent');
    },
    async handle(handlerInput) {
        let locale = handlerInput.requestEnvelope.request.locale.replace(/-/g, '_')

        let language = JSON.parse(JSON.stringify(languages[default_language]));
        if(existingLanguages.indexOf(newLocale(locale)) !== -1){
            language = JSON.parse(JSON.stringify(languages[newLocale(locale)]));
        }
        if (useAPI === true) {
            const [Info] = await Promise.all([
                (APIRequest(StationInfoUrl())),
            ]);
            display_name = Info.display_name;
            format = Info.format;
        } else {
            display_name = stationDisplayName[newLocale(locale)];
            format = stationSlogan[newLocale(locale)];          
        }        
        let messageTitle = language.welcome;
        let message = `${language.welcomeMessage} ${display_name}`;
        let speakText = `${language.welcomeMessage} ${spokenStationName[newLocale(locale)]}`;
        if (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest') {
            if (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StartOverIntent') {    
            } else {
                message = `${language.continue}`;
                messageTitle = "Information";
                speakText = `${language.continue}`;
            }
        }        
        let StreamInfo = ``;
        try {
            StreamInfo = {
                "type": `AudioPlayer.Play`,
                "playBehavior": "REPLACE_ALL",
                "audioItem": {
                    "stream": {
                        "token": token(),
                    },
                    "metadata" : {
                        "title": `${display_name}`,
                        "subtitle": `${format}`,
                        "art": {
                            "sources": [
                              {
                                "contentDescription": `Sender Logo`,
                                "url": `${stationImg()}`,
                                "widthPixels": 512,
                                "heightPixels": 512
                              }
                            ]
                        },
                        "backgroundImage": {
                            "sources": [
                              {
                                "url": ``
                              }
                            ]
                        }                        
                    }
                }
            };
            if (supportsAPL(handlerInput)) {
                return handlerInput.responseBuilder
                .speak(ssmlChange(speakText))
                .addDirective({
                    type: `Alexa.Presentation.APL.RenderDocument`,
                    document: StationAPL(),
                    datasources: {
                        "StationData": {
                            "action": `${messageTitle}`,
                            "data": `${message}`,
                            "image": `${stationImg()}`,
                            "displayName": `${display_name}`,
                            "format": `${format}`,
                            "LogoPaddingTop": 60,
                            "actionPaddingTop": 0,
                            "dataPaddingTop": 60,
                            "RoundPaddingTop": 70
                            
                        }
                    }
                })
                .addAudioPlayerPlayDirective('REPLACE_ALL', url, StreamInfo.audioItem.stream.token, 0, null, StreamInfo.audioItem.metadata)
                .getResponse();
            } else {
                const Card = `${message}`;
                return handlerInput.responseBuilder
                  .speak(ssmlChange(speakText))
                  .withStandardCard(`${messageTitle}`, Card, `${stationImg('80x80')}`, `${stationImg()}`)
                  .addAudioPlayerPlayDirective('REPLACE_ALL', url, StreamInfo.audioItem.stream.token, 0, null, StreamInfo.audioItem.metadata)
                  .getResponse();
            }
        } catch (error) {
            console.log(`~~~~ Error API: ${error}`);
            StreamInfo = {
                "type": `AudioPlayer.Play`,
                "playBehavior": "REPLACE_ALL",
                "audioItem": {
                    "stream": {
                        "token": token(),
                    },
                    "metadata" : {
                        "title": `${stationNameClean()}`,
                    }
                }
            };
            const Card = `${language.welcomeMessage} ${stationNameClean()}`
            return handlerInput.responseBuilder
              .speak(ssmlChange(speakText))
              .withSimpleCard(`${language.welcome}`, Card)
              .addAudioPlayerPlayDirective('REPLACE_ALL', url, StreamInfo.audioItem.stream.token, 0, null, StreamInfo.audioItem.metadata)
              .getResponse();
        }
    },
};

// Current Song
const CurrentSongHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && handlerInput.requestEnvelope.request.intent.name === 'CurrentSongIntent'
    },
    async handle(handlerInput) {
        let locale = handlerInput.requestEnvelope.request.locale.replace(/-/g, '_')
        let language = JSON.parse(JSON.stringify(languages[default_language]));
        if(existingLanguages.indexOf(newLocale(locale)) !== -1){
            language = JSON.parse(JSON.stringify(languages[newLocale(locale)]));
        } 
        try {
            let CurrentSong = "";
            let Info = "";
            if (useAPI === true) {
                [Info, CurrentSong] = await Promise.all([
                    (APIRequest(StationInfoUrl())),
                    (APIRequest(StationCurrentSongUrl()))
                ]);
                display_name = Info.display_name;
                format = Info.format;
            } else {
                [CurrentSong] = await Promise.all([
                    (APIRequest(StationCurrentSongUrl()))
                ]);                
                display_name = stationDisplayName[newLocale(locale)];
                format = stationSlogan[newLocale(locale)];   
            }            
            const speakText = `${language.currentSongName1} ${CurrentSong[0].artist.name} ${language.currentSongName2} ${CurrentSong[0].title}`;
            if (supportsAPL(handlerInput)) {
                return handlerInput.responseBuilder
                .speak(ssmlChange(speakText))
                .addDirective({
                    type: `Alexa.Presentation.APL.RenderDocument`,
                    document: StationAPL(),
                    datasources: {
                        "StationData": {
                            "action": `${language.currentSong}`,
                            "data": `${CurrentSong[0].artist.name}<br> ➥ ${CurrentSong[0].title}`,
                            "image": `${stationImg()}`,
                            "displayName": `${display_name}`,
                            "format": `${format}`,
                            "LogoPaddingTop": 60,
                            "actionPaddingTop": 0,
                            "dataPaddingTop": 55,
                            "RoundPaddingTop": 60
                        }
                    }
                })
                .getResponse();
            } else {
                const Card = `${CurrentSong[0].artist.name}\n${CurrentSong[0].title}`
                return handlerInput.responseBuilder
                  .speak(ssmlChange(speakText))
                  .withStandardCard(`${language.currentSong}`, Card, `${stationImg('80x80')}`, `${stationImg()}`)
                  .getResponse();
            }  
        } catch (error) {
            console.log(`~~~~ Error API: ${error}`);
            return handlerInput.responseBuilder
              .speak(language.apiErrorSpeak)
              .withSimpleCard(`${language.currentSong}`, language.apiErrorShow)
              .getResponse();
        }
    },
};

// Last songs
const LastSongsHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && handlerInput.requestEnvelope.request.intent.name === 'LastSongsIntent'
    },
    async handle(handlerInput) {
        let locale = handlerInput.requestEnvelope.request.locale.replace(/-/g, '_')
        let language = JSON.parse(JSON.stringify(languages[default_language]));
        if(existingLanguages.indexOf(newLocale(locale)) !== -1){
            language = JSON.parse(JSON.stringify(languages[newLocale(locale)]));
        }     
        try {
            let LastSongs = "";
            let Info = "";
            if (useAPI === true) {
                [Info, LastSongs] = await Promise.all([
                    (APIRequest(StationInfoUrl())),
                    (APIRequest(StationCurrentSongUrl()))
                ]);
                display_name = Info.display_name;
                format = Info.format;
            } else {
                [LastSongs] = await Promise.all([
                    (APIRequest(StationCurrentSongUrl()))
                ]);                
                display_name = stationDisplayName[newLocale(locale)];
                format = stationSlogan[newLocale(locale)]; 
            }            
            const speakText = `${language.lastPlayed} ${LastSongs[1].artist.name} ${language.with} ${LastSongs[1].title} ${language.and} ${LastSongs[2].artist.name} ${language.with} ${LastSongs[2].title}`;
            if (supportsAPL(handlerInput)) {
                return handlerInput.responseBuilder
                .speak(ssmlChange(speakText))
                .addDirective({
                    type: `Alexa.Presentation.APL.RenderDocument`,
                    document: StationAPL(),
                    datasources: {
                        "StationData": {
                            "action": `${language.lastPlayed}`,
                            "data": `${LastSongs[1].artist.name} <br> ➥ ${LastSongs[1].title} <br><br> ${LastSongs[2].artist.name} <br> ➥ ${LastSongs[2].title}`,
                            "image": `${stationImg()}`,
                            "displayName": `${display_name}`,
                            "format": `${format}`,
                            "LogoPaddingTop": 60,
                            "actionPaddingTop": 0,
                            "dataPaddingTop": 35,
                            "RoundPaddingTop": 50
                        }
                    }
                })
                .getResponse();
            } else {
                const Card = `${LastSongs[1].artist.name} \n ➥ ${LastSongs[1].title} \n \n ${LastSongs[2].artist.name} \n ➥ ${LastSongs[2].title}`
                return handlerInput.responseBuilder
                  .speak(ssmlChange(speakText))
                  .withStandardCard(`${language.lastPlayed}`, Card, `${stationImg('80x80')}`, `${stationImg()}`)
                  .getResponse();
            }  
        } catch (error) {
            console.log(`~~~~ Error API: ${error}`);
            return handlerInput.responseBuilder
              .speak(language.apiErrorSpeak)
              .withSimpleCard(`${language.lastPlayed}`, languages.apiErrorShow)
              .getResponse();
        }
    },
};

// Current Playlist
const CurrentPlaylistHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && handlerInput.requestEnvelope.request.intent.name === 'CurrentPlaylistIntent'
    },
    async handle(handlerInput) {
        let locale = handlerInput.requestEnvelope.request.locale.replace(/-/g, '_')
        let language = JSON.parse(JSON.stringify(languages[default_language]));
        if(existingLanguages.indexOf(newLocale(locale)) !== -1){
            language = JSON.parse(JSON.stringify(languages[newLocale(locale)]));
        }       
        try {
            const [Info] = await Promise.all([
                (APIRequest(StationInfoUrl())),
            ]);
            if (useAPI === true) {
                display_name = Info.display_name;
                format = Info.format;
            } else {
                display_name = stationDisplayName[newLocale(locale)];
                format = stationSlogan[newLocale(locale)];
            }             
            const speakText = `${language.currentPlaylistText} ${Info.current_playlist.name}`;
            if (supportsAPL(handlerInput)) {
                return handlerInput.responseBuilder
                .speak(ssmlChange(speakText))
                .addDirective({
                    type: `Alexa.Presentation.APL.RenderDocument`,
                    document: StationAPL(),
                    datasources: {
                        "StationData": {
                            "action": `${language.currentPlaylist}`,
                            "data": `${Info.current_playlist.name}`,
                            "image": `${stationImg()}`,
                            "displayName": `${display_name}`,
                            "format": `${format}`,
                            "LogoPaddingTop": 60,
                            "actionPaddingTop": 0,
                            "dataPaddingTop": 60,
                            "RoundPaddingTop": 90
                        }
                    }
                })
                .getResponse();
            } else {
                const Card = `${Info.current_playlist.name}`
                return handlerInput.responseBuilder
                  .speak(ssmlChange(speakText))
                  .withStandardCard(`${language.currentPlaylist}`, Card, `${stationImg('80x80')}`, `${stationImg()}`)
                  .getResponse();
            }
        } catch (error) {
            console.log(`~~~~ Error API: ${error}`);
            return handlerInput.responseBuilder
              .speak(language.apiErrorSpeak)
              .withSimpleCard(`${language.currentPlaylist}`, language.apiErrorShow)
              .getResponse();
        }
    },
};

// Next Playlist
const NextPlaylistHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
          || (handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && handlerInput.requestEnvelope.request.intent.name === 'NextPlaylistIntent');
    },
    async handle(handlerInput) {
        let locale = handlerInput.requestEnvelope.request.locale.replace(/-/g, '_')
        let language = JSON.parse(JSON.stringify(languages[default_language]));
        if(existingLanguages.indexOf(newLocale(locale)) !== -1){
            language = JSON.parse(JSON.stringify(languages[newLocale(locale)]));
        }   
        let speakText = ``;
        let Card = ``;
        let apl_text =``;
        try {
            const [Info] = await Promise.all([
                (APIRequest(StationInfoUrl())),
            ]);
            if (useAPI === true) {
                display_name = Info.display_name;
                format = Info.format;
            } else {
                display_name = stationDisplayName[newLocale(locale)];
                format = stationSlogan[newLocale(locale)];
            }
            if (locale !== "de_DE") {
                speakText = `${language.nextPlaylistText} ${Info.next_playlist.name}`;
                Card = `${Info.next_playlist.name}`;
                apl_text =`${Info.next_playlist.name}`;
            } else {
                const weekday = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
                const weekday_name = {sun: 'Sonntag', mon: 'Montag', tue: 'Dienstag', wed: 'Mittwoch', thu: 'Donnerstag', fri: 'Freitag', sat: 'Samstag'};        
                if (Info.next_playlist.day === weekday[dateCET_CEST().getDay()]) {
                    speakText = `Ab ${Info.next_playlist.hour} Uhr hörst du ${Info.next_playlist.name}`;
                    Card = `Ab ${Info.next_playlist.hour}:00 Uhr\n${Info.next_playlist.name}`;
                    apl_text = `Ab ${Info.next_playlist.hour}:00 Uhr<br>${Info.next_playlist.name}`;
                } else if (Info.next_playlist.day === weekday[dateCET_CEST().getDay() +1] && Info.next_playlist.hour === 0) {
                    speakText = `Ab ${Info.next_playlist.hour} Uhr hörst du ${Info.next_playlist.name}`;
                    Card = `Ab ${Info.next_playlist.hour}:00 Uhr\n${Info.next_playlist.name}`;
                    apl_text = `Ab ${Info.next_playlist.hour}:00 Uhr<br>${Info.next_playlist.name}`;
                } else if (Info.next_playlist.day === weekday[dateCET_CEST().getDay() +1]) {
                    speakText = `Morgen ab ${Info.next_playlist.hour} Uhr hörst du ${Info.next_playlist.name}`;
                    Card = `Morgen ab ${Info.next_playlist.hour}:00 Uhr\n${Info.next_playlist.name}`;
                    apl_text = `Morgen ab ${Info.next_playlist.hour}:00 Uhr<br>${Info.next_playlist.name}`;                
                } else {
                    speakText = `Am ${weekday_name[Info.next_playlist.day]} hörst du ab ${Info.next_playlist.hour} Uhr ${Info.next_playlist.name}`;
                    Card = `${weekday_name[Info.next_playlist.day]} ab ${Info.next_playlist.hour}:00 Uhr\n ${Info.next_playlist.name}`;
                    apl_text = `Am ${weekday_name[Info.next_playlist.day]} hörst du ab ${Info.next_playlist.hour} Uhr<br> ${Info.next_playlist.name}`;
                }
            }
            if (supportsAPL(handlerInput)) {
                return handlerInput.responseBuilder
                .speak(ssmlChange(speakText))
                .addDirective({
                    type: `Alexa.Presentation.APL.RenderDocument`,
                    document: StationAPL(),
                    datasources: {
                        "StationData": {
                            "action": `${language.nextPlaylist}`,
                            "data": `${apl_text}`,
                            "image": `${stationImg()}`,
                            "displayName": `${display_name}`,
                            "format": `${format}`,
                            "LogoPaddingTop": 60,
                            "actionPaddingTop": 0,
                            "dataPaddingTop": 55,
                            "RoundPaddingTop": 70
                        }
                    }
                })
                .getResponse();                
            } else {
                return handlerInput.responseBuilder
                  .speak(ssmlChange(speakText))
                  .withStandardCard('Nächste Sendung', Card, `${stationImg('80x80')}`, `${stationImg()}`)
                  .getResponse();
            }
        } catch (error) {
            console.log(`~~~~ Error API: ${error}`);
            return handlerInput.responseBuilder
              .speak(language.apiErrorSpeak)
              .withSimpleCard('Nächste Sendung', language.apiErrorShow)
              .getResponse();
        }
    },
};

// Pause
const PauseIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
          && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.PauseIntent'
    },
    async handle(handlerInput) {
        let locale = handlerInput.requestEnvelope.request.locale.replace(/-/g, '_')
        let language = JSON.parse(JSON.stringify(languages[default_language]));
        if(existingLanguages.indexOf(newLocale(locale)) !== -1){
            language = JSON.parse(JSON.stringify(languages[newLocale(locale)]));
        }      
        const speakText = `${language.pause}`;
        try {
            if (useAPI === true) {
                const [Info] = await Promise.all([
                    (APIRequest(StationInfoUrl())),
                ]);
                display_name = Info.display_name;
                format = Info.format;
            } else {
                display_name = stationDisplayName[newLocale(locale)];
                format = stationSlogan[newLocale(locale)];          
            }
            if (supportsAPL(handlerInput)) {
                return handlerInput.responseBuilder
                .speak(ssmlChange(speakText))
                .addDirective({
                    type: `Alexa.Presentation.APL.RenderDocument`,
                    document: StationAPL(),
                    datasources: {
                        "StationData": {
                            "action": `Information`,
                            "data": `${language.continueInfo}`,
                            "image": `${stationImg()}`,
                            "displayName": `${display_name}`,
                            "format": `${format}`,
                            "LogoPaddingTop": 60,
                            "actionPaddingTop": 0,
                            "dataPaddingTop": 60,
                            "RoundPaddingTop": 70
                        }
                    }
                })
                .addAudioPlayerStopDirective()
                .getResponse();
            } else {
                const Card = `${language.continueInfo}`
                return handlerInput.responseBuilder
                  .addAudioPlayerStopDirective()
                  .speak(ssmlChange(speakText))
                  .withStandardCard('Information', Card, `${stationImg('80x80')}`, `${stationImg()}`)
                  .getResponse();
            }
        } catch (error) {
            console.log(`~~~~ Error API: ${error}`);
            return handlerInput.responseBuilder
              .addAudioPlayerStopDirective()
              .speak(ssmlChange(speakText))
              .withSimpleCard('Information', `${language.continueInfo}`)
              .getResponse();
        }
    }
}

// Help
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
          && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    async handle(handlerInput) {
        let locale = handlerInput.requestEnvelope.request.locale.replace(/-/g, '_')
        let language = JSON.parse(JSON.stringify(languages[default_language]));
        if(existingLanguages.indexOf(newLocale(locale)) !== -1){
            language = JSON.parse(JSON.stringify(languages[newLocale(locale)]));
        }    
        let speakText = language.help;
       
        return handlerInput.responseBuilder
          .speak(ssmlChange(speakText))
          .addAudioPlayerPlayDirective()
          .getResponse();
    }
};

// Cancel or stop
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
          && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
          || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        let locale = handlerInput.requestEnvelope.request.locale.replace(/-/g, '_')
        let language = JSON.parse(JSON.stringify(languages[default_language]));
        if(existingLanguages.indexOf(newLocale(locale)) !== -1){
            language = JSON.parse(JSON.stringify(languages[newLocale(locale)]));
        }     
        const speakText = language.stop;

        return handlerInput.responseBuilder
          .addAudioPlayerStopDirective()
          .speak(ssmlChange(speakText))
          .withShouldEndSession(true)
          .getResponse();
    }
};

//Previous and Repeat
const PreviousRepeatIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.PreviousIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.RepeatIntent')
    },
    async handle(handlerInput) {
        let locale = handlerInput.requestEnvelope.request.locale.replace(/-/g, '_')
        let language = JSON.parse(JSON.stringify(languages[default_language]));
        if(existingLanguages.indexOf(newLocale(locale)) !== -1){
            language = JSON.parse(JSON.stringify(languages[newLocale(locale)]));
        }   
        const speakText = `${language.unable}`;
        try {
            const [Info] = await Promise.all([
                (APIRequest(StationInfoUrl())),
            ]);
            if (supportsAPL(handlerInput)) {
                return handlerInput.responseBuilder
                .speak(ssmlChange(speakText))
                .addDirective({
                    type: `Alexa.Presentation.APL.RenderDocument`,
                    document: StationAPL(),
                    datasources: {
                        "StationData": {
                            "action": `Information`,
                            "data": `Das kann ich leider nicht.`,
                            "image": `${stationImg()}`,
                            "displayName": `${Info.display_name}`,
                            "LogoPaddingTop": 60,
                            "actionPaddingTop": 0,
                            "dataPaddingTop": 60,
                            "RoundPaddingTop": 70
                        }
                    }
                })
                .getResponse();
            } else {
                const Card = `Das kann ich leider nicht.`
                return handlerInput.responseBuilder
                  .speak(ssmlChange(speakText))
                  .withStandardCard('Information', Card, `${stationImg('80x80')}`, `${stationImg()}`)
                  .getResponse();
            }
        } catch (error) {
            console.log(`~~~~ Error API: ${error}`);
            return handlerInput.responseBuilder
              .speak(ssmlChange(speakText))
              .withSimpleCard('Information', `Das kann ich leider nicht.`)
              .getResponse();
        }          
    }
}
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    async handle(handlerInput) {
        let locale = handlerInput.requestEnvelope.request.locale.replace(/-/g, '_')
        let language = JSON.parse(JSON.stringify(languages[default_language]));
        if(existingLanguages.indexOf(newLocale(locale)) !== -1){
            language = JSON.parse(JSON.stringify(languages[newLocale(locale)]));
        }      
        const speakText = `${language.fallback}`;
        try {
            const [Info] = await Promise.all([
                (APIRequest(StationInfoUrl())),
            ]);
            if (useAPI === true) {
                display_name = Info.display_name;
                format = Info.format;
            } else {
                display_name = stationDisplayName[newLocale(locale)];
                format = stationSlogan[newLocale(locale)];
            } 
            if (supportsAPL(handlerInput)) {
                return handlerInput.responseBuilder
                .speak(ssmlChange(speakText))
                .addDirective({
                    type: `Alexa.Presentation.APL.RenderDocument`,
                    document: StationAPL(),
                    datasources: {
                        "StationData": {
                            "action": `Information`,
                            "data": `${speakText}`,
                            "image": `${stationImg()}`,
                            "displayName": `${display_name}`,
                            "format": `${format}`,
                            "LogoPaddingTop": 60,
                            "actionPaddingTop": 0,
                            "dataPaddingTop": 60,
                            "RoundPaddingTop": 70
                        }
                    }
                })
                .getResponse();
            } else {
                const Card = `${speakText}`
                return handlerInput.responseBuilder
                  .speak(ssmlChange(speakText))
                  .withStandardCard('Information', Card, `${stationImg('80x80')}`, `${stationImg()}`)
                  .getResponse();
            }
        } catch (error) {
            console.log(`~~~~ Error API: ${error}`);
            return handlerInput.responseBuilder
              .speak(ssmlChange(speakText))
              .withSimpleCard('Information', `${speakText}`)
              .getResponse();
        }
   }
};

/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        //console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
 
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakText = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
          .speak(ssmlChange(speakText))
          //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
          .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        let locale = handlerInput.requestEnvelope.request.locale.replace(/-/g, '_')
        let language = JSON.parse(JSON.stringify(languages[default_language]));
        if(existingLanguages.indexOf(newLocale(locale)) !== -1){
            language = JSON.parse(JSON.stringify(languages[newLocale(locale)]));
        }     
        const speakText = `${language.fallback}`;
        //console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
          .speak(ssmlChange(speakText))
          .reprompt(speakText)
          .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        CurrentSongHandler,
        LastSongsHandler,
        CurrentPlaylistHandler,
        NextPlaylistHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        PauseIntentHandler,
        PreviousRepeatIntentHandler,
        IntentReflectorHandler,
    )
    .addErrorHandlers(
        ErrorHandler
    )
    .lambda();
