const fs = require('fs');
const vm = require('vm');

// --- minimal DOM stubs to exercise fitAnswerArea math ---
let boxH = 200, areaNat = 400;
const area = { style:{}, getBoundingClientRect(){ return { height: areaNat }; } };
const box  = { clientHeight: boxH };
const document = {
  getElementById(id){
    if(id==='battle-question') return box;
    if(id==='questions-area')  return area;
    return null;
  }
};
const window = { addEventListener(){} };
const sandbox = { document, window, console, Math, String, requestAnimationFrame(){}, setTimeout(){} };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(__dirname+'/game.js','utf8'), sandbox);

function run(avail, nat){
  box.clientHeight = avail; areaNat = nat; area.style.zoom='1';
  sandbox.fitAnswerArea();
  return area.style.zoom;
}

let ok = true;
function check(label, got, exp){
  const pass = String(got)===String(exp);
  if(!pass) ok=false;
  console.log((pass?'✅':'❌'), label, '=> zoom=', got, '(expected', exp+')');
}
// overflow -> scale down (avail/nat, clamped)
check('overflow 200/400', run(200,400), '0.5');
check('overflow 265/277', run(265,277), (265/277).toFixed(4));
check('floor 0.4 when tiny', run(100,500), '0.4');
// fits -> keep 1
check('fits 300/200', run(300,200), '1');
check('fits equal 250/250', run(250,250), '1');

console.log(ok ? '\nALL FIT-MATH TESTS PASSED' : '\nSOME TESTS FAILED');
process.exit(ok?0:1);
