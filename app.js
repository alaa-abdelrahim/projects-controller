const path = require('path');
const electron = require('electron'),
    { app, BrowserWindow, Menu, shell, Tray, ipcMain } = electron;

let tray;
let minWin;
let appMenu = [];

app.on('ready', () => {
    shell.beep();

    // create mean window
    minWin = new BrowserWindow({
        minWidth: 800,
        minHeight: 700,
        resizable: false,
        show: false,
        webPreferences: {
            nodeIntegration: true,
        }
    });

    // show minwin when it's ready
    minWin.once('ready-to-show', () => {
        minWin.show()
    })

    // tray
    tray = new Tray(path.join(__dirname, 'favicon.png'));
    tray.setContextMenu(Menu.buildFromTemplate([{ label: 'Exit', role: 'quit' },
    { label: 'Show', click() { minWin.show() } }
    ]));
    tray.setToolTip('Projects Controller');

    //  create Menu bar
    let contents = minWin.webContents;
    appMenu.push({
        label: 'back', click() {
            contents.goBack();
        }
    })
    if (process.platform === "darwin") appMinu.unshift({});
    Menu.setApplicationMenu(Menu.buildFromTemplate(appMenu));

    // load index.html file
    minWin.loadFile('./index.html');

    // resize the window to the screen size
    ipcMain.on('window-load', (e, data) => {
        minWin.setBounds({
            x: 0,
            y: 35,
            width: data.width,
            height: (data.height - 70)
        })
    })
});

