var ora = require('ora')
require('colors')

function messageFromStats(stats) {
  var durations = stats.endTime - stats.startTime
  var formatedDurations = durations >= 1000 ? durations / 1000 + ' s' : durations + ' ms'
  return 'Completed in ' + formatedDurations.magenta
}

module.exports = function webpackDotsReporter(opts) {
  opts = opts || {} // eslint-disable-line no-param-reassign
  opts.buildingText = opts.buildingText || 'Building...'

  var spinner = ora()
  spinner.start()
  spinner.pause = function () {
    spinner.stop()
    var frames = spinner.spinner.frames
    var index = spinner.frameIndex
    var oldFrame = frames[index]
    frames[index] = '⠿'
    spinner.render()
    frames[index] = oldFrame
  }

  var lastCompilationIsSuccessful = false

  return function (options) {
    var state = options.state
    var stats = options.stats

    if (state) {
      var message = messageFromStats(stats)

      if (stats.hasErrors() || stats.hasWarnings()) {
        spinner.clear()
        var compilation = stats.compilation
        var warnings = compilation.errors.concat(compilation.warnings)

        warnings.forEach(function (warning) {
          if (warning.message) {
            var location = warning.location
            const file = warning.file || (warning.module && warning.module.userRequest)
            const path = file && [
              file,
              location && location.line,
              location && location.character,
            ].filter(Boolean).join(':')

            console.log(warning.message + (path ? ('\n  at ' + path) : ''))
          }
        })
        lastCompilationIsSuccessful = false
      } else if (lastCompilationIsSuccessful === false) {
        console.log('ok'.green)
        lastCompilationIsSuccessful = true
      }

      spinner.text = message
      spinner.pause()
    } else {
      spinner.start()
      spinner.text = opts.buildingText
    }
  }
}
