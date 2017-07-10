const util = require('util'),
  exec = require('child_process').exec,
  applescript = require('applescript');

// Apple scripts
// ----------------------------------------------------------------------------
/*

 */
const scripts = {
  state: {
    file: 'get_state.applescript'
  },
  track: {
    file: 'get_track.applescript'
  },
  volumeUp: 'tell application "iTunes" to set sound volume to (sound volume + 10)',
  volumeDown: 'tell application "iTunes" to set sound volume to (sound volume - 10)',
  setVolume: 'tell application "iTunes" to set sound volume to %s',
  play: 'tell application "iTunes" to play',
  // playTrack: 'tell application "Spotify" to play track "%s"',
  // playTrackInContext: 'tell application "Spotify" to play track "%s" in context "%s"',
  playPause: 'tell application "iTunes" to playpause',
  pause: 'tell application "iTunes" to pause',
  next: 'tell application "iTunes" to next track',
  previous: 'tell application "iTunes" to previous track',
  jumpTo: 'tell application "iTunes" to set player position to %s',
  isRunning: 'get running of application "iTunes"',
  // isRepeating: 'tell application "iTunes" to return "song repeat"',
  // isShuffling: 'tell application "iTunes" to return shuffle',
  // setRepeating: 'tell application "Spotify" to set repeating to %s',
  // setShuffling: 'tell application "Spotify" to set shuffling to %s',
  // toggleRepeating: {
  //   file: 'toggle_repeating.applescript'
  // },
  // toggleShuffling: {
  //   file: 'toggle_shuffling.applescript'
  // }
};

// Apple script execution
// ----------------------------------------------------------------------------

const scriptsPath = __dirname + '/scripts/';

const execScript = function (scriptName, params, callback = () => {}) {
  if (arguments.length === 2 && typeof params === 'function') {
    // second argument is the callback
    callback = params;
    params = undefined;
  }

  if (typeof params !== 'undefined' && !Array.isArray(params)) {
    params = [params];
  }

  let script = scripts[scriptName];

  if (typeof script === 'string') {
    if (typeof params !== 'undefined') script = util.format.apply(util, [script].concat(params));
    return applescript.execString(script, callback);
  } else if (script.file) {
    return applescript.execFile(scriptsPath + script.file, callback);
  }
};

const createJSONResponseHandler = function (callback, flag) {
  if (!callback) return null;
  return function (error, result) {
    if (!error) {
      try {
        result = JSON.parse(result);
      } catch (e) {
        console.log(flag, result);
        return callback(e);
      }
      return callback(null, result);
    } else {
      return callback(error);
    }
  };
};

const createBooleanResponseHandler = (callback) => (error, response) => {
  if (!error) {
    return callback(null, response === 'true');
  } else {
    return callback(error);
  }
};

// API
// ----------------------------------------------------------------------------

// Open track

exports.open =  (uri, callback) =>
  exec('open "' + uri + '"', callback);

exports.playTrack = (track, callback) =>
  execScript('playTrack', track, callback);

exports.playTrackInContext = (track, context, callback) =>
  execScript('playTrackInContext', [track, context], callback);

// Playback control

exports.play = (callback) =>
  execScript('play', callback);

exports.pause = (callback) =>
  execScript('pause', callback);

exports.playPause = (callback) =>
  execScript('playPause', callback);

exports.next = (callback) =>
  execScript('next', callback);

exports.previous = (callback) =>
  execScript('previous', callback);

exports.jumpTo = (position, callback)  =>
  execScript('jumpTo', position, callback);

exports.setRepeating = (repeating, callback)  =>
  execScript('setRepeating', repeating, callback);

exports.setShuffling = (shuffling, callback) =>
  execScript('setShuffling', shuffling, callback);

exports.toggleRepeating = (callback) =>
  execScript('toggleRepeating', callback);

exports.toggleShuffling = (callback) =>
  execScript('toggleShuffling', callback);

// Volume control

var mutedVolume = null;

exports.volumeUp = (callback) => {
  mutedVolume = null;
  return execScript('volumeUp', callback);
};

exports.volumeDown = (callback) => {
  mutedVolume = null;
  return execScript('volumeDown', callback);
};

exports.setVolume = function (volume, callback) {
  mutedVolume = null;
  return execScript('setVolume', volume, callback);
};

exports.muteVolume = (callback) => {
  return execScript('state', createJSONResponseHandler(function (err, state) {
    exports.setVolume(0, callback);
    mutedVolume = state.volume;
  }));
};

exports.unmuteVolume = (callback) => {
  if (mutedVolume !== null) {
    return exports.setVolume(mutedVolume, callback);
  }
};

// State retrieval

exports.getTrack = (callback) =>
  execScript('track', createJSONResponseHandler(callback, 'track'));

exports.getState = (callback) =>
  execScript('state', createJSONResponseHandler(callback, 'state'));

exports.isRunning = (callback) =>
  execScript('isRunning', createBooleanResponseHandler(callback));

exports.isRepeating = (callback) =>
  execScript('isRepeating', createBooleanResponseHandler(callback));

exports.isShuffling = (callback) =>
  execScript('isShuffling', createBooleanResponseHandler(callback));

