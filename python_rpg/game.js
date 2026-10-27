'use strict';

/* ============================================================
   Python 勇者大冒險：魔王討伐戰（進化版 v3）
   小學六年級 Python 入門 — 選擇題複習遊戲
   ※ 每階段 5 隻魔王，血量遞增；打敗魔王全體升級！
   ※ 題目由模板隨機生成（數字/問句每次不同，絕不重複循環）
   ※ 全部程式碼為正確英文 Python
   ※ 主動技能需集滿 3 點能量（答對 3 題）才能釋放
   ※ 每題倒數：第 1 隻魔王 15 秒，逐隻遞減，第 5 隻 8 秒
   ============================================================ */

/* ---------- 小工具 ---------- */
function $(id){ return document.getElementById(id); }
function randint(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}
/* 產生 4 個「不重複」的選項：第 1 個是正確答案，其餘從候選錯誤值補齊 */
function numOpts(correct, cands){
  const out = [String(correct)];
  for(const c of cands){ if(out.length>=4) break; const s=String(c); if(!out.includes(s)) out.push(s); }
  let pad = 1;
  while(out.length < 4){
    const s = String(Number(correct) + pad);
    if(!out.includes(s)) out.push(s);
    pad++;
  }
  return out;
}
function escapeHtml(t){
  return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ---------- 職業資料（名稱與職業相關 + 主動技能） ---------- */
const CLASSES = {
  knight:  { key:'knight',  name:'鐵壁騎士', hp:120, atk:18, def:3,
             hpGain:22, atkGain:4, defGain:3, color:'#4a90d9',
             skillName:'盾牆守護', skillEffect:'block',
             skillDesc:'下一題答錯也不會受傷（擋下攻擊）',
             passive:'被攻擊受到的傷害減半；升級時血量與防禦成長最高' },
  warrior: { key:'warrior', name:'狂戰勇士', hp:90,  atk:24, def:1,
             hpGain:18, atkGain:7, defGain:1, color:'#e74c3c',
             skillName:'狂暴斬', skillEffect:'crit2',
             skillDesc:'下一題答對造成 2 倍傷害',
             passive:'攻擊成長最快：每次升級攻擊力大幅提升' },
  mage:    { key:'mage',    name:'炎爆法師', hp:70,  atk:28, def:1,
             hpGain:14, atkGain:8, defGain:1, color:'#e67e22',
             skillName:'炎爆術', skillEffect:'crit3',
             skillDesc:'下一題答對造成 3 倍傷害',
             passive:'爆發型：攻擊最高、升級更猛，但血量較少' },
  sage:    { key:'sage',    name:'聖輝賢者', hp:100, atk:20, def:2,
             hpGain:20, atkGain:4, defGain:2, color:'#27ae60',
             skillName:'聖光治癒', skillEffect:'healAll',
             skillDesc:'立即回復全體血量至最大值（並復活倒下者）',
             passive:'每答對數題回血；升級後回得更多更頻繁' },
};

/* ---------- 階段 / 魔王（每階段 5 隻，血量一隻比一隻多） ---------- */
const STAGES = {
  1: {
    id:1, name:'新手村', sub:'入門基礎：print、變數、運算（第 1–3 課）', color:'#7ed957',
    bosses:[
      { name:'史萊姆',     hp:80,  atk:12, skill:{ name:'黏液分裂', type:'heal',   power:15, desc:'分裂回復自身血量' } },
      { name:'蝙蝠精',     hp:110, atk:13, skill:{ name:'超聲波',   type:'aoe',    power:8,  desc:'對全體勇者造成傷害' } },
      { name:'蘑菇怪',     hp:140, atk:14, skill:{ name:'毒孢子',   type:'aoe',    power:10, desc:'散播毒物，全體受創' } },
      { name:'石龜獸',     hp:170, atk:15, skill:{ name:'龜殼防護', type:'shield', power:25, desc:'展開護盾抵擋傷害' } },
      { name:'村莊守衛長', hp:200, atk:16, skill:{ name:'守衛號令', type:'buff',   power:4,  desc:'提升自身攻擊力' } },
    ],
  },
  2: {
    id:2, name:'迷霧洞窟', sub:'流程控制：if 判斷、for / while 迴圈（第 4–7 課）', color:'#b0a08f',
    bosses:[
      { name:'洞窟蝙蝠王', hp:130, atk:15, skill:{ name:'暗影突襲', type:'aoe',    power:12, desc:'突襲全體勇者' } },
      { name:'毒蛛',       hp:165, atk:16, skill:{ name:'劇毒之咬', type:'aoe',    power:14, desc:'毒液侵襲全體' } },
      { name:'骷髏兵',     hp:200, atk:17, skill:{ name:'骨之盾',   type:'shield', power:30, desc:'召喚骨盾抵擋傷害' } },
      { name:'石巨人',     hp:240, atk:18, skill:{ name:'巨石投擲', type:'aoe',    power:16, desc:'投擲巨石重創全體' } },
      { name:'洞窟魔眼',   hp:280, atk:19, skill:{ name:'凝視強化', type:'buff',   power:5,  desc:'凝視提升攻擊力' } },
    ],
  },
  3: {
    id:3, name:'魔王城', sub:'進階挑戰：清單、turtle 繪圖、綜合專題（第 8–10 課）', color:'#e74c3c',
    bosses:[
      { name:'火龍兵',   hp:170, atk:18, skill:{ name:'烈焰吐息', type:'aoe',    power:18, desc:'噴出烈焰重創全體' } },
      { name:'冰巫妖',   hp:220, atk:19, skill:{ name:'寒冰壁壘', type:'shield', power:35, desc:'築起寒冰護盾' } },
      { name:'暗影騎士', hp:280, atk:20, skill:{ name:'暗影斬',   type:'aoe',    power:20, desc:'暗影斬擊全體' } },
      { name:'巨型傀儡', hp:340, atk:21, skill:{ name:'鋼鐵修復', type:'heal',   power:40, desc:'修復鋼體回血' } },
      { name:'Python 大帝', hp:400, atk:22, skill:{ name:'終極代碼', type:'aoe', power:24, desc:'釋放終極代碼重創全體' } },
    ],
  },
};
/* 魔王每 N 題（答完後）施放一次技能 */
const BOSS_SKILL_EVERY = 3;

/* ---------- 課程主題（對應 10 堂課，由易到難，使用者指定次序） ---------- */
const LESSON_TOPICS = {
  1:'認識 Python 與 print()',
  2:'變數與 input()',
  3:'數字運算與型別轉換',
  4:'if 判斷（單向）',
  5:'if-else / elif（多向）',
  6:'for 循環',
  7:'while 循環與猜數字',
  8:'列表（清單）',
  9:'turtle 繪圖（綜合應用）',
  10:'綜合小專題',
};

/* ---------- 題目模板（每階段多個，隨機生成，絕不重複） ---------- */
const TEMPLATES = {
  1: [
    () => ({ lesson:1, q:'在 Python 裡，要把文字印到螢幕上，要用下列哪一行程式？',
      options:[`show("Hello")`,`print("Hello")`,`echo("Hello")`,`write("Hello")`], answer:1,
      explain:'print() 是 Python 的「印出」指令，會把括號裡的內容顯示在螢幕上。' }),
    () => { const a=randint(10,99); return { lesson:2, q:`下面哪一行程式可以正確把數字 ${a} 存進變數 x？`,
      options:[`x = ${a}`,`${a} = x`,`let x = ${a}`,`x == ${a}`], answer:0,
      explain:'「=」是指派，把右邊的值放進左邊的變數，變數要寫在左邊。' }; },
    () => ({ lesson:3, q:'想讓使用者輸入資料，應該用下列哪一行程式？',
      options:[`name = input("Name:")`,`name = print("Name:")`,`name = ask("Name:")`,`name = get()`], answer:0,
      explain:'input() 會暫停程式等使用者打字，並把打的字存起來。' }),
    () => ({ lesson:3, q:'在 Python 中，乘法要用哪個符號？',
      options:[`×`,`*`,`x`,`#`], answer:1,
      explain:'程式裡不能用 ×，要用半形的 * 表示乘法。' }),
    () => { const a=randint(4,9), b=randint(2,a-1), r=a%b; return { lesson:3, q:`下面哪一行會算出 ${a} 除以 ${b} 的「餘數」？`,
      options:[`${a} / ${b}`,`${a} // ${b}`,`${a} % ${b}`,`${a} ** ${b}`], answer:2,
      explain:'% 是取餘數運算子，'+a+' % '+b+' = '+r+'（'+a+' = '+Math.floor(a/b)+'×'+b+' + '+r+'）。' }; },
    () => ({ lesson:1, q:'下列哪一個是 Python「註釋」（寫給人看、不會被執行）的正確寫法？',
      options:[`// comment`,`# comment`,`/* comment */`,`-- comment`], answer:1,
      explain:'Python 用 # 開頭來寫註釋，方便做筆記。' }),
    () => { const a=randint(3,9), b=randint(3,9), s=a+b; return { lesson:3, q:`下面這段程式會在螢幕印出什麼？\nx = ${a}\ny = ${b}\nprint(x + y)`,
      options:[`${a}${b}`,`${s}`,`x + y`,`${a} ${b}`], answer:1,
      explain:'x + y 是 '+a+' + '+b+' = '+s+'，數字相加會真的算出結果。' }; },
    () => { const a=randint(2,9); return { lesson:3, q:`下面這段程式會印出什麼？\na = "Hi"\nb = "${a}"\nprint(a + b)`,
      options:[`Hi${a}`,`Hi ${a}`,`${a}`,`Hi + ${a}`], answer:0,
      explain:'兩個文字用 + 連接，會變成 "Hi" + "'+a+'" = "Hi'+a+'"（文字相加是接在一起）。' }; },
    () => ({ lesson:3, q:'input() 抓到的內容預設是「文字」，要拿來算數學前通常要先做什麼？',
      options:[`int(input(...)) 把文字轉成數字`,`str(...) 再轉一次文字`,`什麼都不用做`,`print(...) 印出來`], answer:0,
      explain:'int() 可以把文字數字（如 "10"）轉成真正的數字 10 才能計算。' }),
    () => { const a=randint(2,4), r=a*a; return { lesson:3, q:`在 Python 中，要計算 ${a} 的 2 次方（${a} × ${a}），要用哪個符號？`,
      options:[`${a} ^ 2`,`${a} ** 2`,`${a} ^^ 2`,`${a} pow 2`], answer:1,
      explain:'** 是次方（冪）運算子，'+a+' ** 2 = '+r+'。' }; },
    () => { const a=randint(7,15), b=randint(2,5), f=Math.floor(a/b); return { lesson:3, q:`下面哪一行會算出 ${a} 除以 ${b} 的「商（取整數）」？`,
      options:[`${a} / ${b}`,`${a} // ${b}`,`${a} % ${b}`,`round(${a} / ${b})`], answer:1,
      explain:'// 是取整數除法（無條件捨去小數），'+a+' // '+b+' = '+f+'。' }; },
    () => ({ lesson:2, q:'下面哪一行程式可以印出變數 score 裡的值？',
      options:[`print(score)`,`print("score")`,`show score`,`echo(score)`], answer:0,
      explain:'print(變數名) 會印出該變數裡的值；如果加引號 "score" 則只會印出文字 score。' }),
    () => ({ lesson:2, q:'在 Python 中，儲存文字（字串）的資料型態叫做？',
      options:[`int`,`str`,`float`,`bool`], answer:1,
      explain:'str 是 string（字串）的縮寫，用來裝文字；int 裝整數、float 裝小數。' }),
    () => ({ lesson:2, q:'在 Python 中，儲存有小數點的數字（如 3.14）的資料型態叫做？',
      options:[`int`,`str`,`float`,`text`], answer:2,
      explain:'float 用來裝有小數點的數字，例如 3.14。' }),

    /* --- 更多隨機變化題（數字/字母/詞彙每次都不同） --- */
    () => { const n=randint(2,9); return { lesson:1, q:`下面這行程式會印出什麼？\nprint("I have " + str(${n}) + " books")`,
      options:[`I have ${n} books`, `I have str(${n}) books`, `I have + ${n} + books`, `會出錯`], answer:0,
      explain:'str() 把數字變成文字，再用 + 接起來，結果是 I have '+n+' books。' }; },
    () => ({ lesson:2, q:'下列哪一個是「合法」的 Python 變數名稱？',
      options:[`2name`,`my name`,`my_name`,`my-name`], answer:2,
      explain:'變數不能用數字開頭、不能有空格或減號；用底線 _ 連接是合法的。' }),
    () => ({ lesson:1, q:'在 Python 中，文字（字串）要用什麼包起來？',
      options:[`單引號或雙引號都可以`,`只能用單引號`,`只能用雙引號`,`不需要任何符號`], answer:0,
      explain:'"Hello" 和 \'Hello\' 都可以，但一定要成雙成對。' }),
    () => { const a=randint(2,9), b=randint(10,19); return { lesson:2, q:`下面這段程式最後會印出什麼？\nx = ${a}\nx = ${b}\nprint(x)`,
      options:[`${a}`,`${b}`,`${a+b}`,`${a} ${b}`], answer:1,
      explain:'後來的指派會覆蓋前面的值，所以最後 x 是 '+b+'。' }; },
    () => { const a=randint(2,9), b=randint(2,9), s=a+b; return { lesson:3, q:`使用者輸入 ${a} 和 ${b} 時，下面這段程式會印出什麼？\na = int(input())\nb = int(input())\nprint(a + b)`,
      options:[`${a}${b}`,`${s}`,`a + b`,`會出錯`], answer:1,
      explain:'int() 把輸入的文字轉成數字，'+a+' + '+b+' = '+s+'。' }; },
    () => { const a=randint(2,9), b=randint(2,9); return { lesson:3, q:`下面這段程式會印出什麼？\na = "${a}"\nb = "${b}"\nprint(a + b)`,
      options:[`${a+b}`,`${a}${b}`,`a + b`,`會出錯`], answer:1,
      explain:'兩個文字用 + 是「接在一起」，變成 '+a+b+'，不是做加法。' }; },
    () => { const a=randint(2,9), b=randint(2,9); return { lesson:1, q:`下面這行程式會印出什麼？\nprint("Hi", ${a}, ${b})`,
      options:[`Hi${a}${b}`,`Hi ${a} ${b}`,`Hi, ${a}, ${b}`,`會出錯`], answer:1,
      explain:'print() 用逗號分隔時，中間會自動加上空白。' }; },
    () => ({ lesson:2, q:'想知道某個變數是什麼資料型態，可以用？',
      options:[`type(x)`,`kind(x)`,`datatype(x)`,`check(x)`], answer:0,
      explain:'type() 會告訴你是 int、str、float 還是其他型態。' }),
    () => ({ lesson:2, q:'Python 的變數名稱大小寫有差別嗎？',
      options:[`有差，score 和 Score 是不同變數`,`沒差，是同一個變數`,`只有第一個字母有差`,`只有最後一個字母有差`], answer:0,
      explain:'Python 會區分大小寫，score 和 Score 是兩個不同的變數。' }),
    () => { const n=randint(10,99); return { lesson:1, q:`下面兩行程式印出來的「內容」是否相同？\nprint(${n})\nprint("${n}")`,
      options:[`相同，螢幕上都顯示 ${n}`,`不同，一個是數字一個是文字`,`第一行會出錯`,`第二行會出錯`], answer:0,
      explain:'不管裡面是數字還是文字，print() 顯示出來都是 '+n+'。' }; },
    () => { const a=randint(20,60), b=randint(5,19), d=a-b; return { lesson:3, q:`下面這段程式會印出什麼？\nx = ${a}\ny = ${b}\nprint(x - y)`,
      options:numOpts(d,[a+b, a*b, b-a]), answer:0,
      explain:'減法用 -，'+a+' - '+b+' = '+d+'。' }; },
    () => { const a=randint(11,29), b=randint(2,5), f=Math.floor(a/b); return { lesson:3, q:`print(${a} // ${b}) 會印出什麼？`,
      options:numOpts(f,[f+1, f+2, a%b]), answer:0,
      explain:'// 是取整數除法（捨去小數），'+a+' // '+b+' = '+f+'。' }; },
    () => { const a=randint(11,29), b=randint(2,6), r=a%b; return { lesson:3, q:`print(${a} % ${b}) 會印出什麼？`,
      options:numOpts(r,[Math.floor(a/b), a, r+1]), answer:0,
      explain:'% 是取餘數：'+a+' 除以 '+b+' 商 '+Math.floor(a/b)+' 餘 '+r+'。' }; },
    () => { const a=randint(3,5), p=randint(2,3), v=Math.pow(a,p); return { lesson:3, q:`print(${a} ** ${p}) 會印出什麼？`,
      options:numOpts(v,[a*p, a+p, v*2]), answer:0,
      explain:'** 是次方運算子：'+a+' 的 '+p+' 次方 = '+v+'。' }; },
  ],
  2: [
    () => ({ lesson:4, q:'if 後面的條件後面，一定要加哪個符號？',
      options:[`.`,`;`,`:`,`,`], answer:2,
      explain:'Python 用冒號 : 表示「下面的縮排區塊是我的判斷內容」。' }),
    () => ({ lesson:4, q:'下列哪一個比較運算子代表「大於等於」？',
      options:[`=>`,`>=`,`=<`,`><`], answer:1,
      explain:'> 是大於、= 是等於，合起來 >= 就是大於等於。' }),
    () => { const s=randint(50,95); return { lesson:4, q:`下面哪一段會在分數大於等於 60 時印出 "Pass"？`,
      options:[`if score >= 60: print("Pass")`,`if score = 60: print("Pass")`,`if score => 60 print("Pass")`,`if score >= 60 print("Pass")`], answer:0,
      explain:'條件要用 >=（不是單獨 =），而且後面要有冒號 :。' }; },
    () => ({ lesson:5, q:'當有很多不同的情況要一一判斷時，會用到下列哪一種？',
      options:[`elf`,`elif`,`else if`,`eif`], answer:1,
      explain:'elif 是 else + if，用來檢查「不然如果」的另一個條件。' }),
    () => ({ lesson:5, q:'如果 if 的條件不成立，想要執行「否則」的程式，要用哪個關鍵字？',
      options:[`else`,`elif`,`otherwise`,`then`], answer:0,
      explain:'else 表示「否則」，當 if 不成立時就執行 else 裡的內容。' }),
    () => { const n=randint(3,6); return { lesson:6, q:`下面這個 for 迴圈會把數字印出幾次？\nfor i in range(${n}):\n    print(i)`,
      options:[`${n-1} 次`,`${n} 次`,`${n+1} 次`,`無限次`], answer:1,
      explain:'range('+n+') 會數 0、1、…、'+(n-1)+' 共 '+n+' 個數字，所以重複 '+n+' 次。' }; },
    () => { const a=randint(1,3), b=randint(5,9); return { lesson:6, q:`range(${a}, ${b}) 會產生下列哪一組數字？`,
      options:[`${a}, ${a+1}, ..., ${b}`,`${a}, ${a+1}, ..., ${b-1}`,`${a-1}, ..., ${b}`,`從 ${a} 到 ${b}（包含 ${b}）`], answer:1,
      explain:'range(開始, 結束) 從 '+a+' 數到「結束的前一個」也就是 '+(b-1)+'，不含 '+b+'。' }; },
    () => ({ lesson:7, q:'下面哪一種迴圈是「先檢查條件，條件成立才重複」？',
      options:[`for`,`while`,`repeat`,`loop`], answer:1,
      explain:'while 會一直重複，直到條件變成 False 才停下來。' }),
    () => ({ lesson:5, q:'要同時滿足「年紀 > 12」而且「分數 > 90」，兩個條件之間要用？',
      options:[`or`,`and`,`not`,`+`], answer:1,
      explain:'and 表示「而且」，兩個都要成立才算成立。' }),
    () => ({ lesson:5, q:'只要「是週末」或「是假日」其中一個成立就執行，兩個條件之間要用？',
      options:[`and`,`or`,`not`,`&`], answer:1,
      explain:'or 表示「或者」，只要其中一個成立就算成立。' }),
    () => ({ lesson:7, q:'在 while 迴圈裡，如果忘記讓條件變成 False，會發生什麼事？',
      options:[`程式自動停止`,`產生無限迴圈`,`電腦關機`,`沒事`], answer:1,
      explain:'條件永遠成立就會一直重複，變成無限迴圈，要小心！' }),
    () => ({ lesson:7, q:'在迴圈或判斷裡，break 的作用是？',
      options:[`暫停一下程式`,`立刻跳出（結束）這個迴圈`,`把變數刪掉`,`印出東西`], answer:1,
      explain:'break 像緊急出口，可以馬上離開迴圈。' }),
    () => ({ lesson:4, q:'下列哪一個是「不等於」的比較運算子？',
      options:[`=<`,`!=`,`==!`,`<>`], answer:1,
      explain:'!= 表示「不等於」；== 才是「等於」。' }),
    () => ({ lesson:7, q:'在迴圈裡，continue 的作用是？',
      options:[`結束整個程式`,`跳過這一次，直接進入下一次迴圈`,`把變數清空`,`什麼都不做`], answer:1,
      explain:'continue 會跳過這一輪剩下的指令，立刻回到迴圈開頭做下一輪。' }),
    () => { const s=randint(70,100); const res = s>=90?'A':(s>=60?'B':'C'); return { lesson:5, q:`下面這段程式，當 score = ${s} 時會印出什麼？\nif score >= 90:\n    print("A")\nelif score >= 60:\n    print("B")\nelse:\n    print("C")`,
      options:[`A`,`B`,`C`,`什麼都不印`], answer:['A','B','C'].indexOf(res),
      explain:'程式會從上往下檢查，第一個成立的條件就執行並跳出；score='+s+' 時印出 "'+res+'"。' }; },

    /* --- 更多隨機變化題（數字/詞彙每次都不同） --- */
    () => ({ lesson:4, q:'要判斷「x 等於 10」，if 後面的條件要怎麼寫？',
      options:[`if x = 10:`,`if x == 10:`,`if x === 10:`,`if x equals 10:`], answer:1,
      explain:'判斷相等要用兩個等號 ==；一個 = 是「指派」，不是比較。' }),
    () => ({ lesson:5, q:'「如果不是下雨天」要怎麼寫？（rainy 是布林值）',
      options:[`if not rainy:`,`if !rainy:`,`if no rainy:`,`if rainy == false:`], answer:0,
      explain:'Python 用 not 表示「不是／反向」，寫成 if not rainy:。' }),
    () => { const n=randint(3,7); return { lesson:7, q:`下面這段程式會印出數字幾次？\ncount = 0\nwhile count < ${n}:\n    print(count)\n    count = count + 1`,
      options:[`${n-1} 次`,`${n} 次`,`${n+1} 次`,`無限次`], answer:1,
      explain:'count 從 0 數到 '+(n-1)+'，一共 '+n+' 次後停止。' }; },
    () => { const a=randint(1,3), b=randint(8,12), c=randint(2,4); const seq=[]; for(let i=a;i<b;i+=c) seq.push(i); return { lesson:6, q:`range(${a}, ${b}, ${c}) 會產生下列哪一組數字？`,
      options:[seq.join(', '), `${a}, ${a+c}, ..., ${b}`, `${a}, ${a+1}, ..., ${b-1}`, `${a}, ${a+2}, ..., ${b-1}`], answer:0,
      explain:'第三個數字是「每次加多少」，從 '+a+' 開始每次加 '+c+'，直到小於 '+b+' 為止。' }; },
    () => ({ lesson:4, q:'關於 else 的寫法，下列哪一個正確？',
      options:[`else: 後面不需要寫條件`,`else x > 5: 要寫條件`,`else (x > 5):`,`else then:`], answer:0,
      explain:'else 是「其他所有情況」，後面直接加冒號就可以了。' }),
    () => ({ lesson:4, q:'在 Python 中，if 區塊裡的程式要怎麼表示？',
      options:[`要向右縮排（通常是 4 個空格）`,`用大括號 { } 包起來`,`放在 if 的同一行`,`不用特別處理`], answer:0,
      explain:'Python 靠縮排判斷程式屬於哪個區塊，縮排錯了結果就錯了。' }),
    () => ({ lesson:7, q:'要做出「一直重複，直到使用者輸入 q 才停止」，最常用的寫法是？',
      options:[`while True: 搭配 break`,`for i in range(10):`,`if ... elif`,`只用一次 print`], answer:0,
      explain:'while True 是無限迴圈，用 break 跳出是最經典的寫法。' }),
    () => { const items=pick([['apple','banana','cherry'],['red','green','blue'],['cat','dog','bird']]); const lit="['"+items.join("', '")+"']"; return { lesson:6, q:`下面這段程式會印出什麼？\nfor x in ${lit}:\n    print(x)`,
      options:[`依序印出 ${items.join('、')}`,`一次印出整個串列`,`印出 1、2、3`,`什麼都不印`], answer:0,
      explain:'for 會把串列裡的東西一個一個拿出來，所以依序印出每個元素。' }; },
    () => ({ lesson:5, q:'比較運算的結果（例如 5 > 3）是什麼資料型態？',
      options:[`bool（布林值 True / False）`,`int（整數）`,`str（字串）`,`float（小數）`], answer:0,
      explain:'比較的結果只有 True 或 False 兩種，這就是 bool 布林值。' }),
    () => { const n=randint(2,6); return { lesson:6, q:`for i in range(${n}): 裡面的 i，第一次的值是多少？`,
      options:numOpts(0,[1, n, n+1]), answer:0,
      explain:'range('+n+') 從 0 開始數，所以第一次 i 是 0。' }; },
    () => ({ lesson:7, q:'如果 while 的條件一開始就不成立，裡面的程式會執行幾次？',
      options:[`0 次，一次都不會執行`,`1 次`,`2 次`,`無限次`], answer:0,
      explain:'while 是「先檢查條件」，一開始不成立就直接跳過，一次都不執行。' }),
    () => { const a=randint(45,95), p=randint(50,80); const r=(a>=p)?"True":"False"; return { lesson:4, q:`score = ${a}，請問 print(score >= ${p}) 會印出什麼？`,
      options:[`True`,`False`,`score >= ${p}`,`會出錯`], answer: r==="True"?0:1,
      explain:'score 是 '+a+'，判斷 '+a+' >= '+p+' 的結果是 '+r+'。' }; },
    () => { const n=randint(2,5), t=pick(['cat','dog','bird','fish']); return { lesson:6, q:`下面這段程式會印出幾行？\nfor i in range(${n}):\n    print("${t}")`,
      options:[`${n} 行`,`${n+1} 行`,`1 行`,`0 行`], answer:0,
      explain:'range('+n+') 重複 '+n+' 次，所以印出 '+n+' 行 "'+t+'"。' }; },

    /* --- 第 7 課主題：while 迴圈與猜數字（隨機變化題） --- */
    () => ({ lesson:7, q:'想做一個「猜數字」小遊戲：電腦想一個神祕數字，玩家一直猜直到猜中，最適合哪一種迴圈？',
      options:[`while 迴圈（條件成立就重複）`,`for 迴圈`,`if 判斷`,`def 函式`], answer:0,
      explain:'猜數字要在「還沒猜中」時一直重複，while 最適合這種「直到…才停止」的情況。' }),
    () => { const s=randint(30,90); return { lesson:7, q:`下面這段猜數字程式，當玩家猜 ${s} 但答案其實更大時，應該印出什麼提示？\nif guess > answer:\n    print("太大了")\nelif guess < answer:\n    print("太小了")\nelse:\n    print("猜中了")`,
      options:[`太小了`,`太大了`,`猜中了`,`程式錯誤`], answer:0,
      explain:'guess='+s+' 比 answer 大，所以走 guess > answer 的分支，印出「太小了」請玩家往小猜。' } },
    () => ({ lesson:7, q:'猜數字遊戲中，玩家一猜中就該結束迴圈，通常搭配哪個指令跳出 while？',
      options:[`break`,`continue`,`pass`,`exit`], answer:0,
      explain:'猜中時用 break 立刻跳出 while 迴圈，遊戲結束。' }),
  ],
  3: [
    () => ({ lesson:8, q:'下面哪一行程式可以建立一個裝水果的「串列（list）」？',
      options:[`fruits = ["apple","banana","orange"]`,`fruits = ("apple","banana")`,`fruits = "apple","banana"`,`fruits = {apple, banana}`], answer:0,
      explain:'串列用中括號 [ ] 包起來，裡面可以放很多東西。' }),
    () => ({ lesson:8, q:'想在串列 fruits 的最後面加入 "watermelon"，要用？',
      options:[`fruits.add("watermelon")`,`fruits.append("watermelon")`,`fruits.put("watermelon")`,`fruits.join("watermelon")`], answer:1,
      explain:'append() 意思是「接在後面」，是最常用的加法。' }),
    () => { const a=randint(3,9), b=randint(11,19), c=randint(22,30); return { lesson:8, q:`串列 nums = [${a}, ${b}, ${c}]，那 nums[0] 的值是？`,
      options:[`${a}`,`${b}`,`${c}`,`會出錯`], answer:0,
      explain:'電腦從 0 開始數，nums[0] 是第一個，也就是 '+a+'。' }; },
    () => { const a=randint(3,9), b=randint(11,19), c=randint(22,30); return { lesson:8, q:`串列 nums = [${a}, ${b}, ${c}]，那 nums[2] 的值是？`,
      options:[`${a}`,`${b}`,`${c}`,`會出錯`], answer:2,
      explain:'電腦從 0 開始數：nums[0]='+a+'、nums[1]='+b+'、nums[2]='+c+'。' }; },
    () => ({ lesson:8, q:'想知道串列裡有幾個東西，可以用？',
      options:[`size(list)`,`len(list)`,`count(list)`,`length(list)`], answer:1,
      explain:'len() 是 length（長度）的縮寫，會告訴你有幾個。' }),
    () => { const a=randint(2,5); return { lesson:8, q:`下面這段程式會印出什麼？\nnums = [1, 2, 3]\nnums.append(${a})\nprint(len(nums))`,
      options:[`3`,`4`,`1,2,3,${a}`,`會出錯`], answer:1,
      explain:'原本 3 個，append 加 1 個變 4 個，len 算出 4。' }; },
    () => ({ lesson:9, q:'想用 Python 畫圖，第一步要先載入「海龜繪圖」模組，要寫哪一行？',
      options:[`import turtle`,`include turtle`,`use turtle`,`from draw`], answer:0,
      explain:'import turtle 把海龜繪圖模組載進來，之後才能使用 turtle.forward() 等指令。' }),
    () => ({ lesson:9, q:'turtle.forward(100) 這一行會讓海龜做什麼？',
      options:[`向前走 100 步並畫出一條線`,`向右轉 100 度`,`把畫筆顏色變成 100`,`什麼都不做`], answer:0,
      explain:'forward 是「前進」，數字代表走幾步；海龜邊走會邊畫出線條。' }),
    () => ({ lesson:9, q:'要讓海龜「向右轉 90 度」準備畫直角，要用哪個指令？',
      options:[`turtle.right(90)`,`turtle.turn(90)`,`turtle.rotate(90)`,`turtle.spin(90)`], answer:0,
      explain:'right(角度) 會讓海龜原地向右轉，right(90) 就是轉一個直角。' }),
    () => ({ lesson:9, q:'turtle.left(45) 會讓海龜怎麼轉？',
      options:[`向左轉 45 度`,`向左走 45 步`,`把畫筆抬向左邊`,`向左畫 45 個圓`], answer:0,
      explain:'left(角度) 是向左轉，left(45) 就是向左轉 45 度。' }),
    () => ({ lesson:10, q:'做「猜數字」小遊戲時，想要「電腦先想一個祕密數字、玩家一直猜到對為止」，最需要用到下列哪一組？',
      options:[`while 迴圈 + if 判斷 + break`,`只有 print`,`只有 def`,`只有 list`], answer:0,
      explain:'猜數字要在「還沒猜中」時一直重複（while），並用 if 判斷太大或太小，猜中就用 break 跳出。' }),
    () => { const n=randint(3,7), s=n*(n+1)/2; return { lesson:10, q:`下面這段程式會印出什麼？\ntotal = 0\nfor i in range(1, ${n+1}):\n    total = total + i\nprint(total)`,
      options:[`${s}`,`${n}`,`${n+1}`,`0`], answer:0,
      explain:'用 for 把 1 到 '+n+' 一個一個加進 total，結果是 1+2+…+'+n+' = '+s+'。' } },
    () => ({ lesson:8, q:'串列 pets = ["cat", "dog", "fish"]，要取出第 2 個（"dog"）要用？',
      options:[`pets[1]`,`pets[2]`,`pets[0]`,`pets["dog"]`], answer:0,
      explain:'電腦從 0 開始數：pets[0]="cat"、pets[1]="dog"，所以取 "dog" 用 pets[1]。' }),
    () => ({ lesson:8, q:'想對串列裡的每個東西都做一次動作，最適合用？',
      options:[`if 判斷`,`for 迴圈`,`while True`,`def 函式`], answer:1,
      explain:'for 迴圈很適合「對清單每個項目都做一遍」這類工作。' }),
    () => { const items=pick([['80','90','75'],['60','70','85'],['100','95','88']]); const lit="["+items.join(", ")+"]"; const sum=items.reduce((a,b)=>a+Number(b),0); return { lesson:10, q:`下面這段程式會印出什麼？\nscores = ${lit}\nfor s in scores:\n    print(s)`,
      options:[`依序印出 ${items.join('、')}`,`一次印出整個串列`,`印出 ${sum}`,`什麼都不印`], answer:0,
      explain:'for 會把串列裡的成績一個一個拿出來，所以依序印出 '+items.join('、')+'。' } },

    /* --- 更多隨機變化題（數字/串列內容每次都不同） --- */
    () => { const items=pick([['red','green','blue'],['cat','dog','fish'],['one','two','three']]); const lit="['"+items.join("', '")+"']"; return { lesson:8, q:`串列 a = ${lit}，要取出「最後一個」元素要用？`,
      options:[`a[${items.length}]`,`a[${items.length-1}]`,`a[-0]`,`a.last()`], answer:1,
      explain:'長度是 '+items.length+'，但從 0 開始數，最後一個的編號是 '+(items.length-1)+'。' }; },
    () => { const n=randint(3,6); const items=Array.from({length:n},(_,i)=>i*2+1); return { lesson:8, q:`串列 nums = ${JSON.stringify(items)}，len(nums) 會得到？`,
      options:numOpts(n,[n-1, items[n-1], n+1]), answer:0,
      explain:'len() 數的是「有幾個元素」，這裡一共 '+n+' 個。' }; },
    () => { const n=randint(2,5); return { lesson:8, q:`下面這段程式會印出什麼？\nnums = [1] * ${n}\nnums.append(9)\nprint(len(nums))`,
      options:numOpts(n+1,[n, n+9, n+2]), answer:0,
      explain:'[1] * '+n+' 有 '+n+' 個，append 再加 1 個變成 '+(n+1)+'。' }; },
    () => ({ lesson:9, q:'想畫一個半徑 50 的圓，要用哪個指令？',
      options:[`turtle.circle(50)`,`turtle.round(50)`,`turtle.oval(50)`,`turtle.arc(50)`], answer:0,
      explain:'circle(半徑) 會畫出一個圓，數字是半徑的大小。' }),
    () => ({ lesson:9, q:'想先把畫筆顏色設成紅色，要寫？',
      options:[`turtle.color("red")`,`turtle.paint("red")`,`turtle.set("red")`,`turtle.brush(red)`], answer:0,
      explain:'color() 可以設定畫筆（和填色）的顏色，紅色就寫 "red"。' }),
    () => ({ lesson:10, q:'下面這段程式會根據年齡印出什麼？\nage = int(input("年齡："))\nif age >= 18:\n    print("成人")\nelse:\n    print("未成年")',
      options:[`輸入 20 印「成人」、輸入 12 印「未成年」`,`都印「成人」`,`都印「未成年」`,`程式錯誤`], answer:0,
      explain:'input 抓到的文字先用 int() 轉成數字，再用 if 判斷：18 以上印成人，否則印未成年。' }),
    () => { const items=pick([[10,20,5,30],[3,8,15,2],[25,7,40,12]]); const lit="["+items.join(", ")+"]"; const big=items.filter(x=>x>10); return { lesson:10, q:`下面這段程式會印出什麼？\nnums = ${lit}\nfor n in nums:\n    if n > 10:\n        print(n)`,
      options:[`印出大於 10 的數（${big.join('、')}）`,`印出所有數`,`印出小於 10 的數`,`什麼都不印`], answer:0,
      explain:'for 走遍每個數，再用 if 只挑出大於 10 的印出來，所以只印 '+big.join('、')+'。' }; },
    () => { const n=randint(2,4); const items=Array.from({length:n},(_,i)=>i+1); return { lesson:8, q:`串列 a = ${JSON.stringify(items)}（長度 ${n}），如果寫 a[${n}] 會怎樣？`,
      options:[`得到 ${n}`,`出現 IndexError（索引超出範圍）`,`得到 0`,`自動新增一個元素`], answer:1,
      explain:'最大索引是 '+(n-1)+'，a['+n+'] 超出範圍，會出現 IndexError 錯誤。' }; },
    () => ({ lesson:8, q:'Python 的串列（list）裡面可以放什麼？',
      options:[`數字、文字都可以，也能混在一起放`,`只能放數字`,`只能放文字`,`只能放同一種資料`], answer:0,
      explain:'串列很自由，例如 [1, "apple", True] 混著放也完全沒問題。' }),
    () => ({ lesson:9, q:'turtle.penup() 的作用是？',
      options:[`把筆抬起來，移動時不會畫線`,`把筆壓下去開始畫線`,`把海龜刪掉`,`把畫面清空`], answer:0,
      explain:'penup 像把筆拿離紙面，之後移動海龜就不會留下線條；要再畫就用 pendown。' }),
    () => { const a=randint(20,60), b=randint(30,80); return { lesson:9, q:`下面這段程式會在螢幕上畫出什麼？\nimport turtle\nturtle.begin_fill()\nturtle.forward(${a})\nturtle.right(90)\nturtle.forward(${b})\nturtle.end_fill()`,
      options:[`一個填滿顏色的 ${a} × ${b} 長方形`,`一條 ${a} 步的直線`,`一個半徑 ${a} 的圓`,`什麼都不會畫`], answer:0,
      explain:'begin_fill 開始記錄形狀、end_fill 把中間填滿，向前走 '+a+' 再右轉走 '+b+' 就畫出一個填滿的長方形。' }; },
    () => ({ lesson:10, q:'想要「用迴圈重複 4 次畫出正方形」，下面哪段程式最合適？',
      options:[`for i in range(4):\n    turtle.forward(100)\n    turtle.right(90)`,`for i in range(4):\n    turtle.forward(100)`,`while True:\n    turtle.forward(100)`,`turtle.square(100)`], answer:0,
      explain:'正方形有 4 條邊，用 for 重複 4 次「前進 100 再右轉 90 度」就畫得出来。' }),
  ],
};

const TIME_LIMITS = [15, 13, 11, 9, 8]; // 第 1~5 隻魔王的思考秒數

/* ---------- 遊戲狀態 ---------- */
let state = {
  mode:'solo', players:[], current:0,
  stage:null, bosses:[], bossIndex:0,
  bossName:'', bossAtk:0, bossMax:0, bossHp:0, bossShield:0,
  questions:[], qIndex:0,
  answered:false, timeLimit:15, timeLeft:15,
  result:false,
};
let timerId = null;
let usedSigs = new Set();

/* ---------- 玩家 ---------- */
function makePlayer(name, clsKey){
  const c = CLASSES[clsKey];
  return { name, cls:c, level:1, hp:c.hp, maxHp:c.hp, atk:c.atk, def:c.def,
           correct:0, alive:true, energy:0, pendingSkill:null,
           healEvery:3, healAmount:15, picked:-1, done:false };
}
function allDown(){ return state.players.every(p=>!p.alive); }
function nextAlive(idx){
  const n = state.players.length;
  for(let step=1; step<=n; step++){
    const i = (idx+step)%n;
    if(state.players[i].alive) return i;
  }
  return idx;
}
function levelUp(p){
  p.level++;
  p.maxHp += p.cls.hpGain; p.hp = p.maxHp;
  p.atk += p.cls.atkGain; p.def += p.cls.defGain;
  p.pendingSkill = null; p.energy = 0;
  if(p.cls.key==='sage'){ p.healEvery = Math.max(2, p.healEvery-1); p.healAmount += 8; }
  p.alive = true;
}

/* ---------- 題目生成（隨機模板，絕不重複循環） ---------- */
function genQuestion(stageId){
  for(let attempt=0; attempt<40; attempt++){
    const q = pick(TEMPLATES[stageId])();
    const sig = q.q + '|' + q.options.join('|');
    if(!usedSigs.has(sig)){
      usedSigs.add(sig);
      const opts = q.options.map((t,i)=>({ text:t, correct: i===q.answer }));
      return { lesson:q.lesson, q:q.q, shuffled:shuffle(opts), explain:q.explain };
    }
  }
  const q = pick(TEMPLATES[stageId])();
  const opts = q.options.map((t,i)=>({ text:t, correct: i===q.answer }));
  return { lesson:q.lesson, q:q.q, shuffled:shuffle(opts), explain:q.explain };
}

/* ---------- 音效 ---------- */
let audioCtx = null;
function playSound(type){
  try{
    audioCtx = audioCtx || new (window.AudioContext||window.webkitAudioContext)();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    if(type==='hit'){ o.type='square'; o.frequency.value=620; }
    else if(type==='win'){ o.type='triangle'; o.frequency.value=880; }
    else if(type==='skill'){ o.type='triangle'; o.frequency.value=1040; }
    else { o.type='sawtooth'; o.frequency.value=150; }
    g.gain.setValueAtTime(0.07, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+0.22);
    o.start(); o.stop(audioCtx.currentTime+0.22);
  }catch(e){ /* 忽略音效錯誤 */ }
}

/* ---------- 畫面切換 ---------- */
function showScreen(name){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  $('screen-'+name).classList.add('active');
}

/* ---------- 首頁 / 模式 ---------- */
let pickOrder = [];
function selectMode(m){ state.mode = m; beginClassSelection(); }

/* ---------- 職業選擇 ---------- */
function beginClassSelection(){
  pickOrder = [];
  renderClassScreen();
  showScreen('class');
}
function renderClassScreen(){
  if(state.mode==='coop'){
    if(pickOrder.length===0){
      $('class-title').textContent = '👉 玩家 1 請選擇職業';
      $('class-sub').textContent = '第一棒先選，選完會輪到玩家 2 選。';
    } else {
      const first = CLASSES[pickOrder[0]];
      $('class-title').textContent = '👉 玩家 2 請選擇職業';
      $('class-sub').textContent = `✅ 玩家 1 已選擇：${first.name}。現在輪到玩家 2！`;
    }
  } else {
    $('class-title').textContent = '請選擇你的職業';
    $('class-sub').textContent = '不同職業有不同血量與攻擊力，選一個你喜歡的！';
  }
  $('class-cards').innerHTML = Object.values(CLASSES).map(c=>`
    <button class="class-card" style="--c:${c.color}" onclick="pickClass('${c.key}')">
      <div class="class-icon">${CLASS_SVG[c.key]}</div>
      <div class="class-name">${c.name}</div>
      <div class="class-stats">
        <span>❤️ ${c.hp}</span><span>⚔️ ${c.atk}</span><span>🛡️ ${c.def}</span>
      </div>
      <div class="class-skill"><b>🔥 ${c.skillName}</b>：${c.skillDesc}</div>
    </button>`).join('');
}
function pickClass(clsKey){
  pickOrder.push(clsKey);
  if(state.mode==='coop' && pickOrder.length<2){
    renderClassScreen();
    return;
  }
  const names = state.mode==='coop' ? ['玩家 1','玩家 2'] : ['勇者'];
  state.players = pickOrder.map((k,i)=>makePlayer(names[i],k));
  renderStageScreen();
  showScreen('stage');
}

/* ---------- 階段選擇 ---------- */
function renderStageScreen(){
  $('stage-cards').innerHTML = Object.values(STAGES).map(s=>{
    const hps = s.bosses.map(b=>b.hp);
    const min = Math.min(...hps), max = Math.max(...hps);
    return `<button class="stage-card" style="--c:${s.color}" onclick="startStage(${s.id})">
      <div class="stage-boss">${BOSS_SVG[s.id][0]}</div>
      <div class="stage-name">第 ${s.id} 階段・${s.name}</div>
      <div class="stage-sub">${s.sub}</div>
      <div class="stage-bossname">👹 5 隻魔王連戰（血量 ${min}→${max}）</div>
      <div class="stage-qcount">📝 無限題庫・隨機生成不重複</div>
    </button>`;
  }).join('');
}

/* ---------- 開始戰鬥 / 載入魔王 ---------- */
function startStage(id){
  state.stage = STAGES[id];
  state.bosses = STAGES[id].bosses;
  state.bossIndex = 0;
  state.players = state.players.map(p => makePlayer(p.name, p.cls.key));
  state.questions = [];
  state.qIndex = 0;
  state.current = 0;
  usedSigs = new Set(); // 每次「開始一個階段」才重置：5 隻魔王之間不會出現重複題目
  loadBoss(0);
  showScreen('battle');
  renderBattle();
}
function loadBoss(index){
  const b = state.bosses[index];
  state.bossMax = b.hp; state.bossHp = b.hp;
  state.bossAtk = b.atk; state.bossName = b.name;
  state.bossShield = 0;
  state.timeLimit = TIME_LIMITS[Math.min(index, TIME_LIMITS.length-1)];
  // 注意：這裡「不」重置 usedSigs，去重範圍涵蓋整個階段的 5 隻魔王
}
function nextBoss(){
  state.bossIndex++;
  loadBoss(state.bossIndex);
  state.questions = [];
  state.qIndex = 0;
  state.current = 0;
  showScreen('battle');
  renderBattle();
}

/* ---------- 渲染戰鬥 ---------- */
function pipsHtml(p){
  return [0,1,2].map(k=>`<span class="epip ${k<p.energy?'on':''}"></span>`).join('');
}
function skillReady(i,p){
  return p.alive && p.energy>=3 && !state.answered && (state.mode==='coop' ? true : i===state.current);
}
function renderBattle(){
  const s = state.stage;
  $('battle-sub').textContent = `第 ${s.id} 階段・${s.name}（${s.sub}）`;
  $('boss-sprite').innerHTML = BOSS_SVG[s.id][state.bossIndex];
  $('boss-name').textContent = `${state.bossName}`;
  const sk = state.bosses[state.bossIndex].skill;
  $('boss-skill').textContent = `👹 技能：${sk.name}`;
  $('boss-skill').title = sk.desc;
  $('boss-progress').textContent = `魔王 ${state.bossIndex+1} / ${state.bosses.length}（本題 ${state.timeLimit} 秒）`;
  $('players-panel').innerHTML = state.players.map((p,i)=>`
    <div class="player-card ${(state.mode!=='coop'? i===state.current : p.alive)?'active':''} ${p.alive?'':'down'}" id="player-${i}">
      <div class="player-sprite">${CLASS_SVG[p.cls.key]}</div>
      <div class="player-name">${p.name}（${p.cls.name}）<span class="level-badge">Lv.${p.level}</span></div>
      <div class="player-skill">🔥 技能：${p.cls.skillName}</div>
      <div class="hp-bar"><div class="hp-fill" id="php-${i}" style="width:${p.hp/p.maxHp*100}%"></div>
        <span class="hp-text" id="phpt-${i}">${p.hp}/${p.maxHp}</span></div>
      <div class="player-atk">⚔️ 攻擊 ${p.atk}　🛡️ 防禦 ${p.def}</div>
      <div class="energy-wrap"><span class="en-label">⚡能量</span><span class="pips" id="pips-${i}">${pipsHtml(p)}</span></div>
      <button class="skill-btn ${skillReady(i,p)?'ready':''}" id="skill-${i}" onclick="activateSkill(${i})" ${skillReady(i,p)?'':'disabled'}>🔥 ${p.cls.skillName}</button>
      ${p.alive?'':'<div class="down-tag">😵 昏倒</div>'}
    </div>`).join('');
  renderQuestion();
  updateBars();
}
/* 確保每位玩家在「當前回合」都有自己的題目
   （雙人：兩題由不同模板產生，且同一回合兩位玩家題目保證不同） */
function ensureQuestions(){
  state.players.forEach((p,i)=>{
    if(!state.questions[i]) state.questions[i] = [];
    while(state.questions[i].length <= state.qIndex){
      let q = genQuestion(state.stage.id);
      // 雙人：若與「同一回合其他玩家」的題目相同就重新抽（保證兩人題目不一樣）
      let tries = 0;
      while(tries++ < 60 && state.questions.some((arr,j)=> j!==i && arr[state.qIndex] && arr[state.qIndex].q===q.q)){
        q = genQuestion(state.stage.id);
      }
      state.questions[i].push(q);
    }
  });
}
/* 作答區自動縮放：測量內容自然高度，若超出所在格子高度則整體縮小，
   使作答區永遠不需捲動（依畫面大小自動調整比例；單人/雙人皆適用） */
function fitAnswerArea(){
  const box  = document.getElementById('battle-question');
  const area = document.getElementById('questions-area');
  if(!box || !area) return;
  area.style.zoom = '1';                       // 先還原，取得自然高度
  const avail = box.clientHeight;              // 作答區所在格的高度（橫屏=下半部）
  const nat   = area.getBoundingClientRect().height;
  if(avail > 0 && nat > avail + 1){
    const s = Math.max(0.4, Math.min(1, avail / nat));   // 只縮不放，最多 0.4
    area.style.zoom = String(s);
  }
}

function renderQuestion(){
  ensureQuestions();
  state.answered = false;
  // 每輪開始：重置每位玩家的作答狀態（已昏倒者視為完成，不佔用回合）
  state.players.forEach(p=>{ p.done = !p.alive; p.picked = -1; });
  const letters = ['A','B','C','D'];

  if(state.mode!=='coop'){
    // 單人：單一題目框（維持原結構與 ID）
    const q = state.questions[0][state.qIndex];
    $('questions-area').innerHTML = `
      <div class="q-box">
        <div class="q-meta"><span id="progress">第 ${state.qIndex+1} 題（隨機生成）</span><span id="q-lesson">📚 第 ${q.lesson} 課・${LESSON_TOPICS[q.lesson]}</span></div>
        <div id="q-text">${escapeHtml(q.q).replace(/\n/g,'<br>')}</div>
        <div id="options">${q.shuffled.map((o,i)=>`
          <button class="option-btn" id="opt-${i}" onclick="answer(${i})">
            <span class="opt-letter">${letters[i]}</span>
            <span class="opt-text">${escapeHtml(o.text)}</span>
          </button>`).join('')}</div>
        <div class="feedback" id="feedback"></div>
      </div>`;
  } else {
    // 雙人：每位玩家各自獨立的題目與作答區域（雙方題目由不同模板產生，保證不會一樣）
    $('questions-area').innerHTML = state.players.map((p,i)=>{
      const q = state.questions[i][state.qIndex];
      return `
      <div class="q-box coop-q ${p.alive?'':'q-disabled'}" id="coop-q-${i}">
        <div class="q-meta">
          <span class="coop-who ${p.alive?'':'who-down'}">${p.alive?'🙋':'😵'} ${p.name}</span>
          <span class="coop-tag">玩家 ${i+1} 的題目（第 ${q.lesson} 課・${LESSON_TOPICS[q.lesson]}）</span>
        </div>
        <div class="q-text" id="q-text-${i}">${escapeHtml(q.q).replace(/\n/g,'<br>')}</div>
        <div class="options" id="options-${i}">${q.shuffled.map((o,j)=>`
          <button class="option-btn" id="opt-${i}-${j}" onclick="answer(${j}, ${i})" ${p.alive?'':'disabled'}>
            <span class="opt-letter">${letters[j]}</span>
            <span class="opt-text">${escapeHtml(o.text)}</span>
          </button>`).join('')}</div>
        <div class="feedback" id="feedback-${i}"></div>
      </div>`;
    }).join('');
  }
  $('boss-progress').textContent = `魔王 ${state.bossIndex+1} / ${state.bosses.length}（本題 ${state.timeLimit} 秒）`;
  $('skill-banner').classList.remove('show');
  refreshControls();
  startTime();
  requestAnimationFrame(fitAnswerArea);   // 題目渲染後，依畫面自動縮放作答區
}
function updateBars(){
  $('boss-hp-fill').style.width = (state.bossHp/state.bossMax*100)+'%';
  $('boss-hp-text').textContent = `${state.bossHp}/${state.bossMax}`;
  const sb = $('boss-shield');
  if(sb){
    if(state.bossShield>0){ sb.style.display='inline-block'; $('boss-shield-val').textContent = state.bossShield; }
    else sb.style.display='none';
  }
  state.players.forEach((p,i)=>{
    const fill = $('php-'+i), txt = $('phpt-'+i);
    if(fill) fill.style.width = (p.hp/p.maxHp*100)+'%';
    if(txt)  txt.textContent = `${p.hp}/${p.maxHp}`;
  });
}

/* ---------- 倒數計時 ---------- */
function startTime(){
  stopTime();
  state.timeLeft = state.timeLimit;
  updateTimerUI();
  timerId = setInterval(()=>{
    state.timeLeft -= 0.1;
    if(state.timeLeft <= 0){
      state.timeLeft = 0; updateTimerUI();
      stopTime();
      handleTimeout();
    } else {
      updateTimerUI();
    }
  }, 100);
}
function stopTime(){ if(timerId){ clearInterval(timerId); timerId=null; } }
function updateTimerUI(){
  const pct = state.timeLimit>0 ? Math.max(0, state.timeLeft/state.timeLimit*100) : 0;
  const fill = $('timer-fill'); if(fill) fill.style.width = pct+'%';
  const txt = $('timer-text'); if(txt) txt.textContent = '⏱️ '+Math.ceil(state.timeLeft);
  const bar = $('timer-bar'); if(bar) bar.classList.toggle('low', state.timeLeft<=5);
}

/* ---------- 主動技能（需 3 點能量） ---------- */
function activateSkill(i){
  const p = state.players[i];
  if(!p.alive || p.energy<3 || state.answered) return;
  p.energy = 0;
  if(p.cls.skillEffect==='healAll'){
    state.players.forEach(pl=>{ pl.hp = pl.maxHp; pl.alive = true; });
    showSkillBanner(`🌟 ${p.name} 施放【${p.cls.skillName}】！全體血量回滿！`);
    state.players.forEach((pl,k)=>healFlash(k));
    playSound('skill');
  } else {
    p.pendingSkill = p.cls.skillEffect; // 'block' | 'crit2' | 'crit3'
    showSkillBanner(`✨ ${p.name} 準備【${p.cls.skillName}】！下一題生效！`);
    playSound('skill');
  }
  refreshControls();
  updateBars();
}
function showSkillBanner(text){
  const b = $('skill-banner');
  b.textContent = text;
  b.classList.add('show');
  clearTimeout(b._t);
  b._t = setTimeout(()=>b.classList.remove('show'), 1800);
}
function refreshControls(){
  state.players.forEach((p,i)=>{
    const pips = $('pips-'+i);
    if(pips) pips.innerHTML = pipsHtml(p);
    const btn = $('skill-'+i);
    if(btn){
      const ready = skillReady(i,p);
      btn.disabled = !ready;
      btn.classList.toggle('ready', ready);
    }
  });
}

/* ---------- 作答 ---------- */
function answer(idx, pi){
  if(state.answered) return;
  // 單人模式：pi 省略時視為當前玩家
  if(pi===undefined) pi = state.current;
  const p = state.players[pi];
  if(!p || !p.alive || p.done) return;
  p.picked = idx; p.done = true;
  markOptions(pi, idx);                 // 鎖定這位玩家的選項並標示對錯
  if(state.mode!=='coop'){
    resolveRound();                     // 單人：立即結算
  } else if(state.players.every(pl=>pl.done)){
    setTimeout(resolveRound, 500);      // 雙人：兩人都答完才結算
  }
}
function markOptions(pi, idx){
  const q = state.questions[pi][state.qIndex];
  const box = $(state.mode==='coop' ? `options-${pi}` : 'options');
  if(!box) return;
  box.querySelectorAll('.option-btn').forEach((b,j)=>{
    b.disabled = true;
    if(j===idx) b.classList.add(q.shuffled[j].correct ? 'correct' : 'wrong');
    if(q.shuffled[j].correct) b.classList.add('correct');
  });
}
function handleTimeout(){
  if(state.answered) return;
  // 還沒作答的玩家視同答錯
  state.players.forEach((p,i)=>{ if(!p.done){ p.picked=-1; p.done=true; markOptions(i,-1); } });
  resolveRound();
}
function resolveRound(){
  if(state.answered) return;            // 防止重複結算
  state.answered = true;
  stopTime();

  // 逐位結算存活玩家（雙人：兩人都獨立計算攻擊 / 受傷，題目各自不同）
  state.players.forEach((p,i)=>{
    if(!p.alive) return;
    const q = state.questions[i][state.qIndex];
    const correct = p.picked>=0 && q.shuffled[p.picked].correct;
    const playerEl = $('player-'+i);
    const fbEl = state.mode==='coop' ? $('feedback-'+i) : $('feedback');

    if(correct){
      p.correct++;
      p.energy = Math.min(3, p.energy+1);
      let mult = 1, crit = false;
      if(p.pendingSkill==='crit2'){ mult=2; crit=true; p.pendingSkill=null; }
      else if(p.pendingSkill==='crit3'){ mult=3; crit=true; p.pendingSkill=null; }
      const dmg = Math.round(p.atk * mult);
      let real = dmg;
      if(state.bossShield > 0){
        const absorb = Math.min(state.bossShield, real);
        state.bossShield -= absorb; real -= absorb;
        if(absorb>0) floatDamage($('boss-area'), '🛡️-'+absorb, 'dmg-shield');
      }
      state.bossHp = Math.max(0, state.bossHp - real);
      if(real>0) floatDamage($('boss-area'), '-'+real, crit?'dmg-crit':'dmg-boss');
      bossHit(crit);
      playSound('hit');
      let msg = `✅ ${p.name} 答對！對 ${state.bossName} 造成 ${dmg} 點傷害` + (crit?'（暴擊！）':'') + '！';
      if(p.cls.key==='sage' && p.correct % p.healEvery === 0 && p.hp < p.maxHp){
        const before = p.hp;
        p.hp = Math.min(p.maxHp, p.hp + p.healAmount);
        floatDamage(playerEl, '+'+(p.hp-before), 'heal');
        healFlash(i);
        msg += ` 💚 賢者治癒 +${p.hp-before} 血！`;
      }
      msg += ' 📘 ' + q.explain;
      if(fbEl){ fbEl.textContent = msg; fbEl.className = 'feedback ok'; }
    } else {
      let blocked = false;
      if(p.pendingSkill==='block'){ blocked = true; p.pendingSkill = null; }
      let dmg = Math.max(1, state.bossAtk - p.def);
      if(p.cls.key==='knight') dmg = Math.ceil(dmg/2);
      if(blocked) dmg = 0;
      p.hp = Math.max(0, p.hp - dmg);
      if(p.hp===0) p.alive = false;
      if(blocked){
        floatDamage(playerEl, '🛡️BLOCK', 'heal');
        if(fbEl){ fbEl.textContent = `❌ ${p.name} 答錯，但🛡️盾牆擋下了攻擊！📘 ` + q.explain; fbEl.className = 'feedback bad'; }
      } else {
        floatDamage(playerEl, '-'+dmg, 'dmg-player');
        playerHit(i); shakeScreen(); playSound('hurt');
        const correctText = q.shuffled.find(o=>o.correct).text;
        if(fbEl){ fbEl.textContent = `❌ ${p.name} 答錯！${state.bossName} 反擊 ${dmg} 點。正確答案是：${correctText}。📘 ` + q.explain; fbEl.className = 'feedback bad'; }
      }
    }
  });

  // 魔王技能：每 BOSS_SKILL_EVERY 題施放一次（魔王仍存活、仍有勇者站立時）
  if(state.bossHp>0 && state.players.some(p=>p.alive) && (state.qIndex+1) % BOSS_SKILL_EVERY === 0){
    useBossSkill();
  }

  refreshControls();
  updateBars();

  setTimeout(()=>{
    if(state.bossHp<=0){
      state.players.forEach(p=>levelUp(p));
      if(state.bossIndex < state.bosses.length-1){
        showBossDefeated();
      } else {
        showResult('stageClear');
      }
      return;
    }
    if(allDown()){ showResult('lose'); return; }
    state.qIndex++;
    renderBattle();
  }, 2200);
}

/* ---------- 魔王技能 ---------- */
function useBossSkill(){
  const sk = state.bosses[state.bossIndex].skill;
  const area = $('boss-area');
  showSkillBanner(`👹 ${state.bossName} 施放【${sk.name}】！${sk.desc}！`);
  bossCastEffect(sk.type);
  playSound('skill');
  switch(sk.type){
    case 'heal':{
      const before = state.bossHp;
      state.bossHp = Math.min(state.bossMax, state.bossHp + sk.power);
      floatDamage(area, '+'+(state.bossHp-before), 'heal');
      break;
    }
    case 'buff':{
      state.bossAtk += sk.power;
      floatDamage(area, '⚔️+'+sk.power, 'dmg-crit');
      break;
    }
    case 'shield':{
      state.bossShield += sk.power;
      floatDamage(area, '🛡️+'+sk.power, 'dmg-shield');
      break;
    }
    case 'aoe':{
      state.players.forEach((p,i)=>{
        if(!p.alive) return;
        const dmg = Math.max(1, sk.power - Math.floor(p.def/2));   // 防禦略減技能傷害
        p.hp = Math.max(0, p.hp - dmg);
        if(p.hp===0) p.alive = false;
        floatDamage($('player-'+i), '-'+dmg, 'dmg-player');
        playerHit(i);
      });
      shakeScreen(); playSound('hurt');
      break;
    }
  }
}

/* ---------- 特效 ---------- */
function showFeedback(msg, cls){
  const f = $('feedback'); f.textContent = msg; f.className = 'feedback ' + cls;
}
function floatDamage(container, text, cls){
  if(!container) return;
  const el = document.createElement('div');
  el.className = 'float-dmg ' + cls; el.textContent = text;
  container.appendChild(el);
  setTimeout(()=>el.remove(), 1000);
}
function shakeScreen(){
  const b = $('screen-battle'); b.classList.add('shake');
  setTimeout(()=>b.classList.remove('shake'), 420);
}
function bossHit(crit){
  const b = $('boss-sprite');
  if(!b) return;
  b.classList.add('boss-hit','flash');
  if(crit) b.classList.add('crit');
  setTimeout(()=>{ b.classList.remove('boss-hit','flash','crit'); }, crit?700:420);
}
function playerHit(i){
  const el = $('player-'+i);
  if(!el) return;
  el.classList.add('player-hit');
  setTimeout(()=>el.classList.remove('player-hit'), 420);
}
function healFlash(i){
  const el = $('player-'+i);
  if(!el) return;
  el.classList.add('heal-flash');
  setTimeout(()=>el.classList.remove('heal-flash'), 600);
}
/* 魔王施放技能時的視覺特效：蓄力放大 + 彩色衝擊波光環 + 區域染色 */
function bossCastEffect(type){
  const colors = { heal:'#2ecc71', buff:'#f1c40f', shield:'#3498db', aoe:'#e74c3c' };
  const color = colors[type] || '#e74c3c';
  const sprite = $('boss-sprite');
  if(sprite){
    sprite.style.setProperty('--cast-color', color);
    sprite.classList.remove('casting'); void sprite.offsetWidth;  // 重啟動畫
    sprite.classList.add('casting');
    setTimeout(()=>sprite.classList.remove('casting'), 650);
  }
  const area = $('boss-area');
  if(area){
    area.style.setProperty('--cast-color', color);
    area.classList.add('casting');
    setTimeout(()=>area.classList.remove('casting'), 650);
    const ring = document.createElement('div');
    ring.className = 'cast-ring';
    ring.style.setProperty('--cast-color', color);
    area.appendChild(ring);
    setTimeout(()=>ring.remove(), 760);
  }
}

/* ---------- 打敗魔王（中場升級畫面） ---------- */
function showBossDefeated(){
  showScreen('levelup');
  const next = state.bosses[state.bossIndex+1];
  $('levelup-title').textContent = `🎉 你打敗了 ${state.bossName}！`;
  $('levelup-msg').textContent = '全體勇者升級了！能力全面提升，血量回滿！';
  $('levelup-stats').innerHTML = state.players.map(p=>`
    <div class="lu-row">${CLASS_SVG[p.cls.key]} ${p.name} → <b>Lv.${p.level}</b>　❤️${p.maxHp}　⚔️${p.atk}　🛡️${p.def}</div>`).join('');
  $('levelup-next').textContent = `⚔️ 下一隻魔王：第 ${state.bossIndex+2} / ${state.bosses.length} 隻 — ${next.name}（${next.hp} 血，思考 ${TIME_LIMITS[state.bossIndex+1]} 秒）`;
}
function retryStage(){ startStage(state.stage.id); }
function backToStages(){ renderStageScreen(); showScreen('stage'); }
function backHome(){ showScreen('home'); }

/* ---------- 結果 ---------- */
function showResult(type){
  stopTime();
  showScreen('result');
  const total = state.players.reduce((s,p)=>s+p.correct,0);
  const names = state.players.map(p=>`${p.name}（${p.cls.name}）答對 ${p.correct} 題`).join('　|　');
  if(type==='stageClear'){
    playSound('win');
    $('result-title').textContent = '🏆 階段通關！5 隻魔王全滅！';
    $('result-title').className = 'result-title win';
    $('result-msg').textContent = `太厲害了！你們打倒了 ${state.stage.name} 的所有魔王！`;
    confetti();
  } else {
    $('result-title').textContent = '💀 勇者倒下了…';
    $('result-title').className = 'result-title lose';
    $('result-msg').textContent = '魔王太強了，升級練功後再來挑戰吧！';
  }
  $('result-stats').textContent = `${names}　→　總共答對 ${total} 題`;
}
function confetti(){
  const box = $('confetti');
  box.innerHTML = '';
  const colors = ['#ff6b6b','#ffd93d','#6bcB77','#4d96ff','#c780fa'];
  for(let i=0;i<60;i++){
    const c = document.createElement('div');
    c.className = 'confetti-piece';
    c.style.left = Math.random()*100+'%';
    c.style.background = colors[i%colors.length];
    c.style.animationDelay = (Math.random()*0.6)+'s';
    c.style.animationDuration = (1.4+Math.random()*1.2)+'s';
    box.appendChild(c);
  }
  setTimeout(()=>{ box.innerHTML=''; }, 3200);
}

window.addEventListener('DOMContentLoaded', ()=>{ showScreen('home'); });

// 視窗/方向變化時，若在戰鬥畫面就重新自動縮放作答區
window.addEventListener('resize', ()=>{
  const battle = document.getElementById('screen-battle');
  if(battle && battle.classList.contains('active')) fitAnswerArea();
});
