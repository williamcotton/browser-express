const CDP = require('chrome-remote-interface')
const browserify = require('browserify')

const bundle = browserify('/code/test/js/index-tests-spec.js').bundle()

CDP({ host: 'chrome', port: 9222 }, (client) => {
  // Extract used DevTools domains.
  const {Page, Runtime} = client

  // Enable events on domains we are interested in.
  Promise.all([
    Page.enable()
  ]).then(() => {
    return Page.navigate({url: 'about:blank'})
  })

  // Evaluate outerHTML after page has loaded.
  Page.loadEventFired(() => {
    bundle.on('data', (data, err) => {
      const expression = data.toString()
      console.log(expression)
      Runtime.evaluate({ expression }).then((result) => {
        console.log(result)
        client.close()
      })
    })
  })
}).on('error', (err) => {
  console.error('Cannot connect to browser:', err)
})


// const CDP = require('chrome-remote-interface')
// const browserify = require('browserify')

// const bundle = browserify('/code/test/js/index-tests-spec.js').bundle()

// CDP({ host: 'chrome', port: 9222 }, ({ Page, Runtime, close }) => {
//   // Extract used DevTools domains.

//   // Enable events on domains we are interested in.
//   Promise.all([
//     Page.enable()
//   ]).then(() => {
//     return Page.navigate({ url: 'about:blank' })
//   })

//   // Evaluate outerHTML after page has loaded.
//   Page.loadEventFired(() => {
//     bundle.on('data', (data, err) => {
//       Runtime.evaluate({ expression: data.toString() }).then((result) => {
//         console.log(result.result.value)
//         close()
//       })
//     })
//   })
// }).on('error', (err) => {
//   console.error('Cannot connect to browser:', err)
// })
