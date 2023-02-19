const { app, BrowserWindow, ipcMain, Menu} = require('electron')
const path = require('path')
const sharp = require('sharp');
const archiver = require('archiver');
const fs = require('fs')

var width  = 300;
var height = 300;
var format = 'jpeg';
var greyscale = false;

function createWindow () {
    // Create a new browser window
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 700,
        webPreferences: {
            nodeIntegration: true, // Allow Node.js modules in the renderer process
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true ,
            devTools:false},

    })
    mainWindow.loadFile(path.join(__dirname, 'index.html'))
    mainWindow.webContents.openDevTools()
}
const archive = archiver('zip', {
    zlib: { level: 9 }
});
const microtime = Date.now()
const output = fs.createWriteStream(path.join(__dirname, 'generated_images', `${microtime}_resized-images.zip`));
archive.pipe(output);

function preventDevTools(event) {
    if (event.webContents.getType() === 'webview') {
        event.preventDefault();
    }
}
app.on('will-attach-webview', preventDevTools);
ipcMain.on('images', (event, arg) => {
    const translated = [];
    arg.forEach(async (imageUrl, index)=> {
            const imageBuffer = Buffer.from(imageUrl.replace(/^data:image\/\w+;base64,/, ''), 'base64');
            let resizedImageBuffer = await sharp(imageBuffer).resize({ width: width, height: height });
            if(greyscale) resizedImageBuffer = resizedImageBuffer.greyscale()
            switch(format){
                case "png":
                    resizedImageBuffer = resizedImageBuffer.png()
                    break;
                default:
                    resizedImageBuffer = resizedImageBuffer.jpeg()
                    break;
            }
            resizedImageBuffer = await resizedImageBuffer.toBuffer();

            await archive.append(resizedImageBuffer, { name: `image-${index}.${format}` })

            translated.push(`data:image/jpeg;base64,${resizedImageBuffer.toString('base64')}`);
            if(translated.length === arg.length) await proceedIPC(event, translated);})
});
ipcMain.on('restart', (e, arg)=>{
    app.relaunch()
    app.exit(0);
})
const proceedIPC = async (event, translated) => {
    await archive.finalize()
    event.sender.send('translated', translated)
}

ipcMain.handle('download', (e, arg)=>{
    const filePath = path.join(__dirname, 'resized-images.zip');
    e.returnValue = fs.readFileSync(filePath);

})
ipcMain.on('reformart', (e, arg)=>{
    console.log(arg)
    if(arg.ext) format = arg.ext
    if(arg.height && arg.height > 0) height = arg.height
    if(arg.width  && arg.width > 0) width = arg.width

})
ipcMain.on('greyscale', (e, args)=>{
    greyscale = args
})
app.whenReady().then(() => {
    const emptyMenu = Menu.buildFromTemplate([]);
    Menu.setApplicationMenu(emptyMenu);
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()}})})


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()}})
