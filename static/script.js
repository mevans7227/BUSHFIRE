let canvas = document.getElementById('myCanvas');
let ctx = canvas.getContext('2d');
let img = new Image();
let footprint = null;
let drawing = false;

document.getElementById('imageLoader').addEventListener('change', handleImage, false);
document.getElementById('drawFootprint').addEventListener('click', () => {
  footprint = null;
  drawing = true;
});
document.getElementById('generateZones').addEventListener('click', generateZones);

function handleImage(e){
  const reader = new FileReader();
  reader.onload = function(event){
    img.onload = function(){
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    }
    img.src = event.target.result;
  }
  reader.readAsDataURL(e.target.files[0]);
}

canvas.addEventListener('mousedown', function(evt){
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  startX = evt.clientX - rect.left;
  startY = evt.clientY - rect.top;
});

canvas.addEventListener('mouseup', function(evt){
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  endX = evt.clientX - rect.left;
  endY = evt.clientY - rect.top;
  const x = Math.min(startX, endX);
  const y = Math.min(startY, endY);
  const w = Math.abs(endX - startX);
  const h = Math.abs(endY - startY);
  footprint = { x, y, w, h };
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  drawing = false;
});

function generateZones(){
  if (!footprint){
    alert("Draw the dwelling footprint first");
    return;
  }
  let vegetation = document.getElementById('vegetation').value;
  let dist = parseFloat(prompt("Enter distance (in metres) to vegetation"));
  const scale = parseFloat(prompt("Enter scale (pixels per metre)"));

  fetch('/compute_bal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vegetation: vegetation, distance: dist })
  })
  .then(resp => resp.json())
  .then(json => {
    alert("BAL = " + json.bal);
    let px = dist * scale;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    ctx.strokeStyle = "red";
    ctx.strokeRect(footprint.x, footprint.y, footprint.w, footprint.h);
    ctx.strokeStyle = "orange";
    ctx.lineWidth = 2;
    ctx.strokeRect(footprint.x - px, footprint.y - px, footprint.w + 2*px, footprint.h + 2*px);
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(json.bal, footprint.x - px, footprint.y - px - 5);
  });
}
