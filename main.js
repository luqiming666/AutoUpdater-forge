// The "autoUpdater" module enables apps to automatically update themselves.
//
// For more info, see:
// https://electronjs.org/docs/api/auto-updater

const { app, autoUpdater, BrowserWindow, dialog } = require('electron')
const path = require('path')
const log = require('electron-log')

log.info(`App v${app.getVersion()} starting...`)

// The electron-squirrel-startup module will handle the most common events for you
// such as managing desktop shortcuts. 
if (require('electron-squirrel-startup')) return;

// Sometimes it's helpful to use electron-log instead of default console. It's pretty easy!
//  Windows: %USERPROFILE%\AppData\Roaming\{app name}\logs\{process type}.log
//console.log = log.log
Object.assign(console, log.functions); // If you would like to override other functions like error, warn...
log.info('=== Redirect console.log to main.log ===')

const isDev = require('electron-is-dev')
if (isDev) {
	console.log('Running in development')
} else {
	console.log('Running in production')
}

function createWindow() {
 const windowOptions = {
    width: 800,
    height: 600,
    //icon: path.join(__dirname, 'app.ico'),
    //frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  }
  const mainWindow = new BrowserWindow(windowOptions)
  mainWindow.setMenu(null) // We don't need the menu bar
   
  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
  //mainWindow.webContents.openDevTools()
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  createWindow()
  checkForUpdates()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  console.log('On event: window-all-closed')
  if (process.platform !== 'darwin') app.quit()
})

function checkForUpdates() {
  //const server = 'http://your.deployment.domain'
  //const feed = `${server}/update/${process.platform}/${app.getVersion()}`
  const feed = 'http://127.0.0.1:9000/test-bucket1'
  console.log(`The feed URL is ${feed}`)

  // The following code won't work unless the app has been packaged.
  // You should only use the autoUpdater with packaged and code-signed
  // versions of your application.
  try {
    autoUpdater.setFeedURL(feed)
  } catch (error) {
    console.error(error)
  }

  console.log('Set up event listeners...')
  autoUpdater.on('error', message => {
    console.error('There was a problem updating the application')
    console.error(message)
  })

  autoUpdater.on('checking-for-update', () => {
    console.log('The autoUpdater is checking for an update')
  })

  autoUpdater.on('update-available', () => {
    console.log('The autoUpdater has found an update and is now downloading it!')
  })

  autoUpdater.on('update-not-available', () => {
    console.log('The autoUpdater has not found any updates :(')
  })

  autoUpdater.on('update-downloaded', (event, notes, name, date) => {
    console.log('The autoUpdater has downloaded an update!')
    console.log(`The new release is named ${name} and was released on ${date}`)
    console.log(`The release notes are: ${notes}`)

    // The update will automatically be installed the next time the
    // app launches. If you want to, you can force the installation
    // now:
    const dialogOpts = {
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'App Update',
    //  message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail: `A new version (${name}) has been downloaded. Restart the application to apply the updates.`
    }
  
    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) autoUpdater.quitAndInstall()
    })

  })

  // No debugging! Check main.log for details.
  // Ready? Go!
  console.log('checkForUpdates() -- begin')
  try {
    autoUpdater.checkForUpdates()
  } catch (error) {
    console.log(error)
  }
  console.log('checkForUpdates() -- end')
}
