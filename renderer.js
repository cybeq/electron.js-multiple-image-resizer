
var images = [];
var dataUrls = [];
const list = document.getElementById('list')
document.getElementById('image').addEventListener('change', (e)=>{
 for(let all of e.target.files) {
     images.push(all);
     list.innerHTML += `<p>${all.name}</p>`
 }
})

for(let all of ['ext', 'height','width'])
document.getElementById(all).addEventListener('change', (e)=>{
        ipcRenderer.send('reformart', {ext:document.getElementById('ext').value, height:parseInt(document.getElementById('height').value),
                                       width: parseInt(document.getElementById('width').value)
        })
})

document.getElementById('submit').addEventListener('mousedown',()=> {
    images.forEach(image=>{
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            const dataUrl = reader.result;
            dataUrls.push(dataUrl);
        });
        reader.readAsDataURL(image);
    })
    setTimeout(()=>{
        if(dataUrls.length>0) {
            ipcRenderer.send('images', dataUrls)

        }
    },1000)

})


const goBack = () =>{
    ipcRenderer.send('restart', true)
}
const download = async () => {
    const zipBuffer = await ipcRenderer.invoke('download');
    const blob = new Blob([zipBuffer], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resized-images.zip';
    link.click();
    URL.revokeObjectURL(url);
}








ipcRenderer.receive('translated', (args)=>{
    // document.body.innerHTML='';
    // const downloadButton = document.createElement("button");
    // downloadButton.innerHTML="Download";
    // downloadButton.addEventListener('click', ()=>download(args))
    // document.body.appendChild(downloadButton)
    // const goBackButton = document.createElement("button");
    // goBackButton.innerHTML="Go back"
    // goBackButton.addEventListener('mousedown', ()=>goBack())
    // document.body.appendChild(goBackButton)
    document.getElementById('translated').innerHTML="Images have been converted."
    const downloadButton = document.createElement("button");
    downloadButton.innerHTML="Download";
    downloadButton.addEventListener('click', ()=>download(args))
    const goBackButton = document.createElement("button");
    goBackButton.innerHTML="Go back"
    goBackButton.addEventListener('mousedown', ()=>goBack())
    document.getElementById('translated').appendChild(downloadButton)
    document.getElementById('translated').appendChild(goBackButton)
    document.getElementById('image').style.display="none"
    document.getElementById('submit').style.display="none"
    document.getElementById('parameters').style.display="none"
    list.innerHTML="";
    document.getElementById('image').files[0] = null;
    console.log(args)
})