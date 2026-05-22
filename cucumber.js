module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: [
      'support/hooks.js',
      'step-definitions/**/*.js'
    ],
    format: [
      'progress-bar',
      'html:reports/report.html'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    timeout: 30000
  }
};
