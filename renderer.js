// const download = async () => {
//     const zipBuffer = await ipcRenderer.invoke('download');
//     const blob = new Blob([zipBuffer], { type: 'application/zip' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = 'resized-images.zip';
//     link.click();
//     URL.revokeObjectURL(url);
// } <<-- here a possibility to save for different path



var images = [];
var dataUrls = [];
const list = document.getElementById('list')
document.getElementById('image').addEventListener('change', (e)=>{
 for(let all of e.target.files) {
     images.push(all);
     list.innerHTML += `<p>${all.name}</p>`
 }
})
document.getElementById('greyscale').addEventListener('change', (e)=>{
    ipcRenderer.send('greyscale', e.target.checked)
})

for(let all of ['ext', 'height','width'])
document.getElementById(all).addEventListener('change', (e)=>{
        ipcRenderer.send('reformart', {ext:document.getElementById('ext').value, height:parseInt(document.getElementById('height').value),
                                       width: parseInt(document.getElementById('width').value)})})

document.getElementById('submit').addEventListener('mousedown',()=> {
    if(images.length>0)document.getElementById('submit').disabled=true;
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
            ipcRenderer.send('images', dataUrls)}
    },1000)
})


const goBack = () =>{
    ipcRenderer.send('restart', true)
}

ipcRenderer.receive('translated', (args)=>{
    document.body.innerHTML='<h1>Your images has been converted</h1><p>path: /app_directory/generated_images</p>';

    const goBackButton = document.createElement("button");
    goBackButton.innerHTML="Reload"
    goBackButton.addEventListener('mousedown', ()=>goBack())
    document.body.appendChild(goBackButton)

})