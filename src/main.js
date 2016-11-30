const electron = require('electron')
const path = require('path')
const url = require('url')
const fs = require('fs')

const {app, BrowserWindow, globalShortcut, session} = electron

let pluginName
let mainWindow
let win
let tray = null
let iconName

pluginName = 'PepperFlashPlayer.plugin'
iconName = 'icon.png'

app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, pluginName))

function createWindow(){
    var preference = {width: 420,
                      height: 515,
                      resizable: false, 
                      icon: path.join(__dirname, iconName),
                      webPreferences:{plugins: true}
                      }

    mainWindow = new BrowserWindow(preference)
    mainWindow.loadURL(`http://www.genie.co.kr/player/fPlayer`)
    mainWindow.show()
}


app.on('ready', () =>{
    createWindow()
    //shrotcut 전역 등록
    globalShortcut.register('MediaPlayPause',() =>{
        mainWindow.webContents.executeJavaScript(
            'if(document.getElementsByClassName("play")[0]){document.getElementsByClassName("play")[0].click()}\
            else{document.getElementsByClassName("pause")[0].click()}'
            )
    })
    
    globalShortcut.register('MediaNextTrack', () =>{
        mainWindow.webContents.executeJavaScript(
            'document.getElementsByClassName("next")[0].click()'
        )
    })

    globalShortcut.register('MediaPreviousTrack', () =>{
        mainWindow.webContents.executeJavaScript(
            'document.getElementsByClassName("prev")[0].click()'
        )
    })
    
    //쿠키값 수정. 크롬에서 구동할 때, 추가 플레이어 팝업이 안나오게 수정. electron에서 켜지는 지니가 사파리기반인지 크롬기반인지 확인 후 수정할 예정
    /*
    session.defaultSession.cookies.set({url:'http://www.genie.co.kr/', 
                                            name:'musicPlayer',
                                            value: "1"},
                                            (error) => {console.log(error)}) 
    */
    
    //결제하지 않은 계정으로 로그인할 때 웹플레이어에서 프로모션페이지로 리다이렉트되는 문제 처리
    mainWindow.webContents.on('did-get-response-details', (event,status,newURL,originalURL,httpResponseCode,requestMethod,referrer,headers,resourceType)=>{
        if(newURL.indexOf("/buy/promotionConfirm?pxnm") != -1 || newURL == "http://www.genie.co.kr/"){
            mainWindow.loadURL(`http://www.genie.co.kr/player/fPlayer`)
        }
        
        
    })
    
    // 로그인 후 메인홈페이지로 이동하는 문제 처리
    mainWindow.webContents.on('new-window',(event, url,disposition,additionalFeatures, options) =>{
        if(disposition == "genie_main" || url == 'http://www.genie.co.kr/player/fPlayer'){
            options.show = false
            setTimeout(function(){mainWindow.reload()},500)
        }
    })
    
    mainWindow.webContents.on("did-get-redirect-request", (newURL, event) =>{
     //console.log(url.Url)
        if(url == "http://www.genie.co.kr"){
            console.log("메인 이동 확인")
            mainWindow.loadURL("http://www.genie.co.kr/player/fPlayer")
        }
    })
     
})

 


app.on('window-all-closed', function () {
    if (process.platform !== 'darwin'){app.quit()}
})


app.on('activate', function() {
    if (mainWindow === null) {
        createWindow}
})