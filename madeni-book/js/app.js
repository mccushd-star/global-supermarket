// Madeni Book: user interface. All data goes through store.js; all sums come from lib.js.
import * as L from './lib.js';
import { COLLS, localStore, cloudStore } from './store.js';
import { CONFIG } from './config.js';
const { DAY, GRACE, NB, PERLABEL, r2, esc, fmt, sgn, compact, iso, toTitle, uid, toWa, intlPhone, parseMessages, matchCustomer, startOf, addUnit, trend, blabel, sumF } = L;

var METHODS=[['cash','Cash'],['mpesa','M-Pesa'],['airtel','Airtel Money'],['credit','Credit']];
var MLAB={cash:'Cash',mpesa:'M-Pesa',airtel:'Airtel Money',credit:'Credit',opening:'Opening stock'};
var store=null,unsub=null,dl=true,renderQueued=false;
var S={meta:[],customers:[],entries:[],branches:[],products:[],stock:[],sales:[],expenses:[],payments:[],settings:{shop:'',pay:'',payAirtel:''},
  auth:'loading',session:null,authMode:'in',staff:[],payCfg:null,
  tab:'overview',branch:'all',period:'week',sel:null,lang:'en',open:null,confirm:null,edit:null,chase:false,
  ready:false,warn:false,form:{}};
var got={};

const $=id=>document.getElementById(id);
function dstr(ts){var d=new Date(ts);return d.toLocaleDateString('en-GB',{day:'numeric',month:'short'})+', '+d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});}
const isToday=ts=>new Date(ts).toDateString()===new Date().toDateString();
const cust=id=>S.customers.filter(c=>c.id===id)[0];
const bid=L.bid;
const role=()=>S.session?S.session.role:null;
const isOwner=()=>role()==='owner';
const inSel=x=>S.branch==='all'||bid(x)===S.branch;
function say(msg,warn){var s=$('status');s.textContent=msg;s.className='status'+(warn?' warn':'');}
function fv(id,def){return Object.prototype.hasOwnProperty.call(S.form,id)?S.form[id]:def;}
function clearForm(prefixes){Object.keys(S.form).forEach(k=>{if(prefixes.some(p=>k.indexOf(p)===0))delete S.form[k];});}
function branchList(){
  if(S.branches.length)return S.branches.slice().sort((a,b)=>a.name.localeCompare(b.name));
  return [{id:'main',name:S.settings.shop||'Main shop'}];
}
function branchName(id){var b=branchList().filter(x=>x.id===id)[0];return b?b.name:'Branch';}
function formBranch(){
  if(S.branch!=='all')return S.branch;
  var l=branchList(),v=fv('fb',l[0].id);return l.some(b=>b.id===v)?v:l[0].id;
}
function allowedTabs(){
  var r=role();
  if(r==='owner')return [['overview','Overview'],['enter','Enter'],['stock','Stock'],['credit','Credit'],['settings','Settings']];
  if(r==='manager')return [['overview','Overview'],['enter','Enter'],['stock','Stock'],['credit','Credit']];
  return [['enter','Enter'],['credit','Credit']];
}

/* ---------- form helpers ---------- */
function inp(id,type,ph,def,extra){return '<input id="'+id+'" type="'+type+'"'+(ph?' placeholder="'+esc(ph)+'"':'')+(extra?' '+extra:'')+' value="'+esc(fv(id,def))+'">';}
function sel(id,opts,def,extra){var v=String(fv(id,def));return '<select id="'+id+'"'+(extra?' '+extra:'')+'>'+opts.map(o=>'<option value="'+esc(o[0])+'"'+(String(o[0])===v?' selected':'')+'>'+esc(o[1])+'</option>').join('')+'</select>';}
function field(label,inner,cls){return '<label class="f '+(cls||'')+'">'+label+inner+'</label>';}
function segf(key,opts,def){var v=fv(key,def);return '<span class="seg" role="group">'+opts.map(o=>'<button type="button" data-act="setf" data-k="'+key+'" data-v="'+o[0]+'" aria-pressed="'+(v===o[0])+'">'+esc(o[1])+'</button>').join('')+'</span>';}
function branchField(){
  var l=branchList();if(S.branch!=='all'||l.length<2)return '';
  return field('Branch',sel('fb',l.map(b=>[b.id,b.name]),formBranch()),'grow');
}

/* ---------- storage ---------- */
function put(coll,obj){
  var list=S[coll],i=list.findIndex(x=>x.id===obj.id),prev=i>=0?list[i]:null;
  if(i>=0)list[i]=obj;else list.push(obj);
  if(coll==='meta')S.settings=Object.assign({},S.settings,obj);
  return store.put(coll,obj).catch(e=>{
    if(prev)list[list.findIndex(x=>x.id===obj.id)]=prev;else S[coll]=S[coll].filter(x=>x.id!==obj.id);
    say(e.message||'Could not save that.',true);queueRender();
  });
}
function del(coll,id){
  var prev=S[coll].find(x=>x.id===id);
  S[coll]=S[coll].filter(x=>x.id!==id);
  return store.del(coll,id).catch(e=>{if(prev)S[coll].push(prev);say(e.message||'Could not remove that.',true);queueRender();});
}
function putSettings(){return put('meta',{id:'settings',shop:S.settings.shop||'',pay:S.settings.pay||'',payAirtel:S.settings.payAirtel||''});}
function queueRender(){if(renderQueued)return;renderQueued=true;requestAnimationFrame(()=>{renderQueued=false;render();});}
function onData(coll,arr){
  if(coll==='__error'){S.warn=true;say(arr,true);queueRender();return;}
  if(coll==='meta'){var s=arr.find(x=>x.id==='settings')||{};S.settings={shop:s.shop||'',pay:s.pay||'',payAirtel:s.payAirtel||''};}
  else S[coll]=arr;
  got[coll]=1;
  if(Object.keys(got).length>=COLLS.length){S.ready=true;S.warn=false;}
  queueRender();
}
function startSession(sess){
  S.session=sess;
  COLLS.forEach(c=>{if(c!=='meta')S[c]=[];});got={};S.ready=false;
  S.branch=sess.role==='owner'?'all':sess.branchId;
  S.tab=allowedTabs()[0][0];S.sel=null;S.open=null;S.form={paste:sampleText()};
  S.auth='in';
  if(unsub)unsub();
  unsub=store.subscribe(onData);
  setTimeout(()=>{if(!S.ready){S.warn=true;queueRender();}},10000);
}
async function enterWith(promise){
  try{
    var sess=await promise;
    if(!sess){S.auth='out';render();return;}
    if(!sess.shopId){S.session=sess;S.auth='noshop';render();return;}
    startSession(sess);
  }catch(e){
    if(e.message==='CONFIRM_EMAIL'){S.authMsg='Check your email and open the confirmation link, then sign in here.';S.authMode='in';S.auth='out';render();return;}
    S.authMsg=e.message;S.auth='out';render();
  }
}

/* ---------- books ---------- */
const calcMap=()=>L.calcMap(S);
const windowData=(per,brSel)=>L.windowData(S,per,brSel);
const summarize=L.summarize;
const stat=c=>L.custStat(S,c);

/* ---------- chart ---------- */
function chart(W){
  var N=W.N,B=W.B,vw=720,vh=336,L=46,R=10,cw=(vw-L-R)/N,bw=Math.max(5,cw*0.6);
  var s1t=18,s1h=84,s2t=138,s2h=150,xl=316;
  var smax=Math.max.apply(null,B.map(b=>b.sales).concat([1]));
  var ps=B.map(b=>b.profit),hi0=Math.max.apply(null,ps.concat([0])),lo0=Math.min.apply(null,ps.concat([0]));
  var hi=hi0,lo=lo0;if(hi===lo)hi=lo+1;var pad=(hi-lo)*0.08;if(hi0>0)hi+=pad;if(lo0<0)lo-=pad;
  var y1=v=>s1t+s1h-(v/smax)*s1h,y2=v=>s2t+(hi-v)/(hi-lo)*s2h,cx=i=>L+cw*i+cw/2;
  var tr=trend(ps),clamp=v=>Math.max(s2t,Math.min(s2t+s2h,v));
  var selI=S.sel==null||S.sel>=N?N-1:S.sel;
  var o='<svg class="chart" viewBox="0 0 '+vw+' '+vh+'" role="img" aria-label="Sales, profit and loss over the last '+PERLABEL[W.per]+'">';
  o+='<text class="axl" x="'+L+'" y="'+(s1t-6)+'">Sales</text><text class="axl" x="'+L+'" y="'+(s2t-8)+'">Profit and loss</text>';
  o+='<line class="cgrid" x1="'+L+'" x2="'+(vw-R)+'" y1="'+y1(0)+'" y2="'+y1(0)+'"/><line class="cgrid" x1="'+L+'" x2="'+(vw-R)+'" y1="'+y1(smax)+'" y2="'+y1(smax)+'"/>';
  o+='<text class="ax" x="'+(L-6)+'" y="'+(y1(smax)+3)+'" text-anchor="end">'+compact(smax)+'</text><text class="ax" x="'+(L-6)+'" y="'+(y1(0)+3)+'" text-anchor="end">0</text>';
  o+='<rect class="selcol" x="'+(L+cw*selI)+'" y="8" width="'+cw+'" height="'+(xl-8)+'" rx="3"/>';
  var pts=B.map((b,i)=>cx(i)+','+y1(b.sales).toFixed(1));
  o+='<polygon class="salesarea" points="'+cx(0)+','+y1(0)+' '+pts.join(' ')+' '+cx(N-1)+','+y1(0)+'"/><polyline class="salesline" points="'+pts.join(' ')+'"/>';
  o+='<circle cx="'+cx(selI)+'" cy="'+y1(B[selI].sales)+'" r="3.5" fill="var(--accent)"/>';
  [hi0,0,lo0].forEach((v,k,a)=>{if(k===2&&lo0>=0)return;if(k===0&&hi0<=0)return;
    o+='<text class="ax" x="'+(L-6)+'" y="'+(y2(v)+3)+'" text-anchor="end">'+compact(v)+'</text>';});
  o+='<line class="zero" x1="'+L+'" x2="'+(vw-R)+'" y1="'+y2(0)+'" y2="'+y2(0)+'"/>';
  B.forEach((b,i)=>{var y0=y2(0),yv=y2(b.profit),h=Math.max(Math.abs(y0-yv),b.profit===0?0:1.5);
    o+='<rect class="bar '+(b.profit<0?'neg':'pos')+(i===selI?' sel':'')+'" x="'+(cx(i)-bw/2).toFixed(1)+'" y="'+Math.min(y0,yv).toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="2"/>';});
  o+='<line class="trend" x1="'+cx(0)+'" y1="'+clamp(y2(tr.a)).toFixed(1)+'" x2="'+cx(N-1)+'" y2="'+clamp(y2(tr.a+tr.b*(N-1))).toFixed(1)+'"/>';
  var step=Math.ceil(N/8);
  B.forEach((b,i)=>{if((N-1-i)%step===0)o+='<text class="ax" x="'+cx(i)+'" y="'+(xl+14)+'" text-anchor="middle">'+esc(blabel(b.start,W.per))+'</text>';});
  B.forEach((b,i)=>{o+='<rect class="hit" x="'+(L+cw*i)+'" y="0" width="'+cw+'" height="'+xl+'" data-act="sel" data-i="'+i+'" role="button" tabindex="0" aria-label="'+esc(blabel(b.start,W.per,true)+', '+(b.profit<0?'loss ':'profit ')+fmt(Math.abs(b.profit)))+'"/>';});
  return o+'</svg>';
}

/* ---------- views ---------- */
function verdictHtml(W,m){
  var per=PERLABEL[W.per];
  if(!m.has)return '<section class="verdict steady"><div class="vmark">→</div><div class="vtext"><h2>Nothing entered yet</h2><p>Enter a sale, a delivery of goods or an expense on the Enter tab and this page works out profit or loss for you.</p></div></section>';
  var head=m.state==='rising'?'Rising':m.state==='falling'?'Falling':'Holding steady',mark=m.state==='rising'?'↑':m.state==='falling'?'↓':'→';
  var t=m.cur>=0?'Profit of '+fmt(m.cur)+' over the last '+per+'.':'Loss of '+fmt(-m.cur)+' over the last '+per+'.';
  var cmp;
  if(!m.hasPrev)cmp=' There are no earlier records to compare with yet, so this follows the trend inside the period.';
  else if(m.state==='steady')cmp=' About the same as the '+per+' before ('+sgn(m.delta)+').';
  else cmp=' That is '+fmt(Math.abs(m.delta))+(m.pct!=null?' ('+Math.abs(m.pct).toFixed(0)+'%)':'')+(m.delta>0?' more':' less')+' than the '+per+' before.';
  if(m.cur<0)head='Losing money';
  return '<section class="verdict '+(m.cur<0?'falling':m.state)+'"><div class="vmark">'+(m.cur<0?'↓':mark)+'</div><div class="vtext"><h2>'+head+'</h2><p>'+t+cmp+'</p></div></section>';
}
function payStack(pays,total){
  if(total<=0)return '<p class="empty">No sales in this period.</p>';
  var seg=['cash','mpesa','airtel','credit'];
  return '<div class="stack" role="img" aria-label="How buyers paid">'+seg.map(k=>pays[k]>0?'<span class="c-'+k+'" style="width:'+(pays[k]/total*100).toFixed(2)+'%"></span>':'').join('')+'</div>'+
    '<div class="legend">'+seg.map(k=>'<span><i class="c-'+k+'"></i>'+MLAB[k]+' '+fmt(pays[k])+' · '+(pays[k]/total*100).toFixed(0)+'%</span>').join('')+'</div>';
}
function viewOverview(){
  var per=S.period,W=windowData(per,S.branch),m=summarize(W),B=W.B,N=W.N;
  var si=S.sel==null||S.sel>=N?N-1:S.sel,b=B[si];
  var pays={cash:sumF(B.map(x=>x.pays),'cash'),mpesa:0,airtel:0,credit:0};
  ['cash','mpesa','airtel','credit'].forEach(k=>{pays[k]=B.reduce((t,x)=>t+x.pays[k],0);});
  var gp={cash:0,mpesa:0,airtel:0};['cash','mpesa','airtel'].forEach(k=>{gp[k]=B.reduce((t,x)=>t+x.gp[k],0);});
  var owedBy=S.customers.filter(inSel).reduce((t,c)=>t+Math.max(stat(c).bal,0),0);
  var owedTo=S.stock.filter(x=>inSel(x)&&!x.opening).reduce((t,x)=>t+Math.max(x.total-(x.paid||0),0),0);
  var h='<div class="row mid"><span class="seg" role="group" aria-label="Time period">'+
    [['hour','Hours'],['day','Days'],['week','Weeks'],['month','Months'],['year','Years']].map(p=>'<button data-act="period" data-p="'+p[0]+'" aria-pressed="'+(per===p[0])+'">'+p[1]+'</button>').join('')+'</span>'+
    '<span class="hint">Last '+PERLABEL[per]+(S.branch==='all'&&branchList().length>1?', all branches combined':'')+'</span></div>';
  h+=verdictHtml(W,m);
  h+='<div class="chartbox">'+chart(W)+'<div class="legend"><span><i style="background:var(--accent)"></i>Profit</span><span><i style="background:var(--owed)"></i>Loss</span><span><i style="background:var(--accent-soft);border:1px solid var(--accent)"></i>Sales</span><span>Dashed line: profit trend</span></div>'+
    '<div class="seldetail"><b>'+esc(blabel(b.start,per,true))+'</b>'+
    '<div class="mini"><span>Sales</span><span>'+fmt(b.sales)+'</span></div><div class="mini"><span>Cost of goods sold</span><span>'+fmt(b.cogs)+'</span></div>'+
    '<div class="mini"><span>Expenses</span><span>'+fmt(b.exp)+'</span></div><div class="mini"><span>'+(b.profit<0?'Loss':'Profit')+'</span><span class="'+(b.profit<0?'neg':'pos')+'">'+fmt(Math.abs(b.profit))+'</span></div>'+
    '<div class="mini"><span>Goods bought</span><span>'+fmt(b.gin)+'</span></div><div class="mini"><span>Sales made</span><span>'+b.count+'</span></div></div></div>';
  h+='<section class="kpis"><div class="kpi"><span class="k">Net '+(m.cur<0?'loss':'profit')+'</span><span class="v '+(m.cur<0?'neg':'pos')+'">'+fmt(Math.abs(m.cur))+'</span><span class="s">made '+fmt(m.made)+' · lost '+fmt(Math.abs(m.lost))+'</span></div>'+
    '<div class="kpi"><span class="k">Sales</span><span class="v">'+fmt(m.sales)+'</span><span class="s">'+(m.sales>0?(m.cur/m.sales*100).toFixed(0)+'% left as profit':'no sales')+'</span></div>'+
    '<div class="kpi"><span class="k">Goods bought</span><span class="v">'+fmt(m.gin)+'</span><span class="s">paid '+fmt(m.ginPaid)+'</span></div>'+
    '<div class="kpi"><span class="k">Customers owe you</span><span class="v '+(owedBy>0?'neg':'')+'">'+fmt(owedBy)+'</span><span class="s">now</span></div>'+
    '<div class="kpi"><span class="k">You owe suppliers</span><span class="v '+(owedTo>0?'neg':'')+'">'+fmt(owedTo)+'</span><span class="s">now</span></div></section>';
  h+='<div class="two"><section class="panel"><h3>Goods out: how buyers paid</h3>'+payStack(pays,m.sales)+
    '<div class="kv"><div>Sold <span>'+fmt(m.sales)+'</span></div><div>Cost of those goods <span>'+fmt(m.cogs)+'</span></div></div></section>'+
    '<section class="panel"><h3>Goods in: what you bought and how you paid</h3>'+(m.gin>0?'<div class="kv"><div>Bought <span>'+fmt(m.gin)+'</span></div><div>Paid <span>'+fmt(m.ginPaid)+'</span></div></div>'+
    '<div class="kv"><div>Cash <span>'+fmt(gp.cash)+'</span></div><div>M-Pesa <span>'+fmt(gp.mpesa)+'</span></div><div>Airtel Money <span>'+fmt(gp.airtel)+'</span></div><div>Left to pay <span>'+fmt(Math.max(m.gin-m.ginPaid,0))+'</span></div></div>':'<p class="empty">No goods bought in this period.</p>')+
    '<div class="kv"><div>Expenses <span>'+fmt(m.exp)+'</span></div></div></section></div>';
  var bl=branchList();
  if(S.branch==='all'&&bl.length>1){
    var rows=bl.map(x=>{var w=windowData(per,x.id),s=summarize(w);return {b:x,s:s};});
    h+='<section class="panel"><h3>Branches, last '+PERLABEL[per]+'</h3><div class="tblwrap"><table class="tbl"><thead><tr><th>Branch</th><th>Sales</th><th>Profit or loss</th><th>Trend</th></tr></thead><tbody>'+
      rows.map(r=>'<tr><td><button class="linkish" data-act="pickbranch" data-id="'+r.b.id+'">'+esc(r.b.name)+'</button></td><td>'+fmt(r.s.sales)+'</td><td class="'+(r.s.cur<0?'neg':'pos')+'">'+(r.s.cur<0?'− ':'')+fmt(Math.abs(r.s.cur))+'</td><td class="'+(r.s.state==='falling'?'neg':r.s.state==='rising'?'pos':'')+'">'+(r.s.state==='rising'?'↑ Rising':r.s.state==='falling'?'↓ Falling':'→ Steady')+'</td></tr>').join('')+
      '<tr class="total"><td>All branches</td><td>'+fmt(m.sales)+'</td><td class="'+(m.cur<0?'neg':'pos')+'">'+(m.cur<0?'− ':'')+fmt(Math.abs(m.cur))+'</td><td>'+(m.state==='rising'?'↑ Rising':m.state==='falling'?'↓ Falling':'→ Steady')+'</td></tr></tbody></table></div></section>';
  }
  return h;
}

/* --- Enter --- */
function nrows(){return Math.max(1,parseInt(fv('nrows',1),10)||1);}
function saleLines(){
  var br=formBranch(),cm=calcMap(),lines=[];
  for(var i=0;i<nrows();i++){
    var pid=fv('sp-'+i,''),p=S.products.filter(x=>x.id===pid)[0];if(!p)continue;
    var qty=parseFloat(fv('sq-'+i,'1'))||0;if(qty<=0)continue;
    var pr=fv('sr-'+i,'');var price=pr===''?p.sell:parseFloat(pr)||0;
    lines.push({productId:pid,name:p.name,qty:qty,price:price,cost:r2(cm[pid]?cm[pid].avg:0),left:cm[pid]?cm[pid].stock:0});
  }
  return lines;
}
function paySplit(total,method,received){return L.paySplit(total,method===undefined?fv('method','cash'):method,received===undefined?fv('rcv',''):received);}
function saleSummary(){
  var lines=saleLines(),total=r2(lines.reduce((t,l)=>t+l.qty*l.price,0)),ps=paySplit(total);
  var profit=lines.reduce((t,l)=>t+l.qty*(l.price-l.cost),0),warn=lines.filter(l=>l.qty>l.left).map(l=>l.name+' (only '+l.left+' in stock)');
  return '<div class="sumbox"><div class="mini"><span>Sale total</span><span>'+fmt(total)+'</span></div><div class="mini"><span>Received now</span><span>'+fmt(ps.recv)+(ps.recv>0?' by '+MLAB[ps.method]:'')+'</span></div>'+
    '<div class="mini"><span>On credit</span><span class="'+(ps.credit>0?'neg':'')+'">'+fmt(ps.credit)+'</span></div><div class="mini"><span>Profit on this sale</span><span class="'+(profit<0?'neg':'pos')+'">'+fmt(profit)+'</span></div></div>'+
    (warn.length?'<p class="hint neg">Check stock: '+esc(warn.join(', '))+'.</p>':'');
}
function recentList(){
  var items=[];
  S.sales.filter(inSel).forEach(x=>items.push({k:'sales',x:x,ts:x.ts,t:'Sale',d:(x.lines||[]).map(l=>l.qty+' × '+l.name).join(', '),a:x.total,cls:'in'}));
  S.stock.filter(x=>inSel(x)&&!x.opening).forEach(x=>{var p=S.products.filter(q=>q.id===x.productId)[0];items.push({k:'stock',x:x,ts:x.ts,t:'Goods in',d:x.qty+' × '+(p?p.name:'item')+(x.supplier?' from '+x.supplier:''),a:x.total,cls:'out'});});
  S.expenses.filter(inSel).forEach(x=>items.push({k:'expenses',x:x,ts:x.ts,t:'Expense',d:x.category+(x.note?': '+x.note:''),a:x.amount,cls:'out'}));
  items.sort((a,b)=>b.ts-a.ts);items=items.slice(0,8);
  if(!items.length)return '<p class="empty">Nothing entered yet.</p>';
  return '<ul class="list hist">'+items.map(it=>{
    var key='x:'+it.k+':'+it.x.id;
    var ctl=S.confirm===key?'<span class="confirm">Remove this?<button class="btn danger small" data-act="rec-del-yes" data-k="'+it.k+'" data-id="'+it.x.id+'">Yes</button><button class="btn ghost small" data-act="cancel">No</button></span>':
      '<button class="btn ghost small" data-act="rec-del" data-key="'+key+'" aria-label="Remove this entry">Remove</button>';
    return '<li><div class="who"><b>'+it.t+' · '+esc(branchName(bid(it.x)))+'</b><small>'+dstr(it.ts)+' · '+esc(it.d)+'</small></div><span class="amt '+it.cls+'">'+(it.cls==='in'?'+ ':'− ')+fmt(it.a)+'</span>'+ctl+'</li>';}).join('')+'</ul>';
}
function viewEnter(){
  var kind=role()==='seller'?'sale':fv('kind','sale'),br=formBranch(),prods=S.products.filter(p=>bid(p)===br).sort((a,b)=>a.name.localeCompare(b.name));
  var cm=calcMap();
  var h=role()==='seller'?'':'<div class="row mid">'+segf('kind',[['sale','Sale (goods out)'],['goods','Goods in'],['expense','Expense']],'sale')+'</div>';
  if(!prods.length&&kind!=='expense'){
    return h+'<section class="panel"><h3>Add your products first</h3><p class="hint">Sales and goods in are recorded against products so stock and cost stay right. Open the Stock tab and add what you sell, with its buying and selling price.</p><div class="row">'+branchField()+'<button class="btn" data-act="tab" data-t="stock">Go to Stock</button></div></section>';
  }
  if(kind==='sale'){
    var n=nrows(),opts=[['','Choose item']].concat(prods.map(p=>[p.id,p.name+' · '+(cm[p.id]?cm[p.id].stock:0)+' '+(p.unit||'')]));
    var rows='';
    for(var i=0;i<n;i++){
      var pid=fv('sp-'+i,''),p=prods.filter(x=>x.id===pid)[0],q=parseFloat(fv('sq-'+i,'1'))||0,pr=fv('sr-'+i,''),price=pr===''?(p?p.sell:0):parseFloat(pr)||0;
      rows+='<div class="cartrow">'+field('Item',sel('sp-'+i,opts,''))+field('Qty',inp('sq-'+i,'number','1','1','min="0" step="any" inputmode="decimal"'))+
        field('Price each',inp('sr-'+i,'number',p?String(p.sell):'0','','min="0" step="any" inputmode="decimal"'))+'<span class="lt" id="lt-'+i+'">'+fmt(q*price)+'</span></div>';
    }
    var credCust=[['','Choose customer']].concat(S.customers.filter(c=>bid(c)===br||S.branch==='all').map(c=>[c.id,c.name]),[['__new','+ New customer']]);
    h+='<div class="cols"><div class="col"><section class="panel"><h3>New sale</h3><div class="row">'+branchField()+'</div>'+rows+
      '<div class="row"><button class="btn ghost small" data-act="addrow">Add another item</button></div>'+
      '<span class="sub">How did the buyer pay?</span><div class="row mid">'+segf('method',METHODS,'cash')+'</div>'+
      '<div class="row">'+field('Amount received now (leave empty for the full amount)',inp('rcv','number','','','min="0" step="any" inputmode="decimal"'),'grow')+field('M-Pesa or Airtel code (optional)',inp('sref','text','e.g. TKD4P7Q2LM','','autocomplete="off"'),'grow')+'</div>'+
      '<div class="row">'+field('Customer (needed if any part is on credit)',sel('scust',credCust,''),'grow')+'</div>'+
      (fv('scust','')==='__new'?'<div class="row">'+field('New customer name',inp('scname','text','e.g. Wanjiru Mwangi','','autocomplete="off"'),'grow')+field('Phone',inp('scphone','tel','0712 345 678','',''),'grow')+'</div>':'')+
      '<div id="salesum">'+saleSummary()+'</div><div class="row"><button class="btn" data-act="savesale">Save sale</button></div></section></div>'+
      '<div class="col">'+payPrompt()+'<section class="panel"><h3>Recently entered</h3>'+recentList()+'</section></div></div>';
  } else if(kind==='goods'){
    var opts2=[['','Choose item']].concat(prods.map(p=>[p.id,p.name]));
    var q2=parseFloat(fv('gq','0'))||0,c2=parseFloat(fv('gc','0'))||0,tot=r2(q2*c2),gm=fv('gmethod','cash'),graw=fv('gpaid',''),paid=gm==='credit'?0:Math.min(tot,graw===''?tot:Math.max(parseFloat(graw)||0,0));
    h+='<div class="cols"><section class="panel"><h3>Goods coming in</h3><div class="row">'+branchField()+field('Item',sel('gp',opts2,''),'grow')+'</div>'+
      '<div class="row">'+field('Quantity',inp('gq','number','e.g. 24','','min="0" step="any" inputmode="decimal"'),'grow')+field('Buying price each (KSh)',inp('gc','number','e.g. 125','','min="0" step="any" inputmode="decimal"'),'grow')+'</div>'+
      '<div class="row">'+field('Supplier',inp('gsup','text','e.g. Unga Distributors','','autocomplete="off"'),'grow')+'</div>'+
      '<span class="sub">How did you pay?</span><div class="row mid">'+segf('gmethod',[['cash','Cash'],['mpesa','M-Pesa'],['airtel','Airtel Money'],['credit','Pay later']],'cash')+'</div>'+
      '<div class="row">'+field('Amount paid now (leave empty for the full amount)',inp('gpaid','number','','','min="0" step="any" inputmode="decimal"'),'grow')+'</div>'+
      '<div class="sumbox"><div class="mini"><span>Total</span><span>'+fmt(tot)+'</span></div><div class="mini"><span>Paid now</span><span>'+fmt(paid)+'</span></div><div class="mini"><span>Still owed to supplier</span><span class="'+(tot-paid>0?'neg':'')+'">'+fmt(tot-paid)+'</span></div></div>'+
      '<div class="row"><button class="btn" data-act="savegoods">Save goods in</button></div></section>'+
      '<section class="panel"><h3>Recently entered</h3>'+recentList()+'</section></div>';
  } else {
    h+='<div class="cols"><section class="panel"><h3>New expense</h3><div class="row">'+branchField()+field('Type',sel('ecat',['Rent','Wages','Transport','Electricity and water','Airtime and internet','Licences','Repairs','Other'].map(x=>[x,x]),'Rent'),'grow')+'</div>'+
      '<div class="row">'+field('Amount (KSh)',inp('eamt','number','e.g. 3500','','min="0" step="any" inputmode="decimal"'),'grow')+field('Note (optional)',inp('enote','text','','','autocomplete="off"'),'grow')+'</div>'+
      '<span class="sub">Paid with</span><div class="row mid">'+segf('emethod',[['cash','Cash'],['mpesa','M-Pesa'],['airtel','Airtel Money']],'cash')+'</div>'+
      '<div class="row"><button class="btn" data-act="saveexp">Save expense</button></div></section><section class="panel"><h3>Recently entered</h3>'+recentList()+'</section></div>';
  }
  return h;
}
function recentPayments(){
  var br=S.branch==='all'?null:S.branch,cut=Date.now()-6*3600000;
  return S.payments.filter(p=>p.ts>cut&&!p.used&&(br==null||bid(p)===br)).sort((a,b)=>b.ts-a.ts).slice(0,5);
}
function payPrompt(){
  var net=fv('pnet','mpesa'),ps=paySplit(r2(saleLines().reduce((t,l)=>t+l.qty*l.price,0)),fv('method','cash'),fv('rcv',''));
  var amt=fv('pamt','')!==''?parseFloat(fv('pamt',''))||0:(ps.recv||ps.credit);
  var to=net==='airtel'?S.settings.payAirtel:S.settings.pay,msg=fv('pmsg','');
  var pend=recentPayments();
  var pills={pending:'<span class="pill">Waiting for buyer</span>',paid:'<span class="pill clear">Paid</span>',failed:'<span class="pill overdue">Not paid</span>'};
  var demo=store.mode==='local';
  return '<section class="panel"><h3>Ask the buyer to pay</h3>'+
    '<p class="hint">'+(demo?'Demo mode: no real prompt is sent. A pretend payment is confirmed after a few seconds.':'A payment prompt pops up on the buyer\'s phone. They enter their PIN, and the result appears here.')+'</p>'+
    '<div class="row mid">'+segf('pnet',[['mpesa','Safaricom M-Pesa'],['airtel','Airtel Money']],'mpesa')+'</div>'+
    '<div class="row">'+field('Buyer phone',inp('pphone','tel','0712 345 678','',''),'grow')+field('Amount (KSh)',inp('pamt','number',String(amt||''),'','min="0" step="any" inputmode="decimal"'),'grow')+'</div>'+
    '<div class="row"><button class="btn small" data-act="sendprompt">Send prompt to buyer\'s phone</button></div>'+
    (pend.length?'<ul class="list hist">'+pend.map(p=>'<li><div class="who"><b>'+esc(MLAB[p.network]||p.network)+' · '+fmt(p.amount)+'</b><small>'+esc(p.phone)+' · '+dstr(p.ts)+(p.receipt?' · '+esc(p.receipt):'')+(p.status==='failed'&&p.message?' · '+esc(p.message):'')+'</small></div>'+(pills[p.status]||'')+
      (p.status==='paid'?'<button class="btn small" data-act="usepay" data-id="'+p.id+'">Use for this sale</button>':'')+'</li>').join('')+'</ul>':'')+
    '<details><summary class="hint" style="cursor:pointer">Or send the request as a message</summary>'+
    '<div class="row" style="margin-top:8px"><button class="btn ghost small" data-act="prepmsg">Prepare message</button></div>'+
    (msg?'<textarea id="pmsg" class="reminder" aria-label="Payment request message">'+esc(msg)+'</textarea><div class="row"><button class="btn small" data-act="copypm">Copy message</button>'+
      (toWa(fv('pphone',''))?'<a class="btn ghost small" target="_blank" rel="noopener" href="https://wa.me/'+toWa(fv('pphone',''))+'?text='+encodeURIComponent(msg)+'">Open in WhatsApp</a>':'')+'</div>':'')+
    (to?'':'<p class="hint">Add your '+(net==='airtel'?'Airtel Money':'M-Pesa')+' number or till in Settings so the message tells the buyer where to pay.</p>')+'</details></section>';
}

/* --- Stock --- */
function viewStock(){
  var cm=calcMap(),br=formBranch(),prods=S.products.filter(inSel).sort((a,b)=>a.name.localeCompare(b.name));
  var value=prods.reduce((t,p)=>t+Math.max(cm[p.id].stock,0)*cm[p.id].avg,0);
  var owing=S.stock.filter(x=>inSel(x)&&!x.opening&&x.total-(x.paid||0)>0.005).sort((a,b)=>a.ts-b.ts);
  var h='<section class="kpis"><div class="kpi"><span class="k">Products</span><span class="v">'+prods.length+'</span><span class="s">'+(S.branch==='all'?'all branches':esc(branchName(S.branch)))+'</span></div>'+
    '<div class="kpi"><span class="k">Stock worth</span><span class="v">'+fmt(value)+'</span><span class="s">at what you paid</span></div>'+
    '<div class="kpi"><span class="k">Running low</span><span class="v '+(prods.some(p=>cm[p.id].stock<=5)?'neg':'')+'">'+prods.filter(p=>cm[p.id].stock<=5).length+'</span><span class="s">5 or fewer left</span></div></section>';
  h+='<div class="cols"><div class="col"><section class="panel"><h3>Your products</h3>'+(prods.length?'<ul class="list">'+prods.map(p=>{
    var c=cm[p.id],mg=p.sell>0&&c.avg>0?((p.sell-c.avg)/p.sell*100).toFixed(0)+'% margin':'';
    var tag=c.stock<=0?'<span class="tag low">Out</span>':c.stock<=5?'<span class="tag low">Low</span>':'';
    var confirm=S.confirm==='p:'+p.id?'<span class="confirm">Remove '+esc(p.name)+'?<button class="btn danger small" data-act="delprod-yes" data-id="'+p.id+'">Yes</button><button class="btn ghost small" data-act="cancel">No</button></span>':'<button class="btn ghost small warnline" data-act="delprod" data-id="'+p.id+'">Remove</button>';
    return '<li><div class="who"><b>'+esc(p.name)+' '+tag+'</b><small>'+c.stock+' '+esc(p.unit||'')+' in stock · cost '+fmt(r2(c.avg))+' · '+esc(branchName(bid(p)))+(mg?' · '+mg:'')+'</small></div>'+
      '<div class="row mid" style="flex:0 1 auto">'+field('Selling price',inp('pp-'+p.id,'number','',String(p.sell),'min="0" step="any"'))+
      '<button class="btn ghost small" data-act="setprice" data-id="'+p.id+'">Save price</button>'+confirm+'</div></li>';}).join('')+'</ul>':'<p class="empty">No products yet. Add your first one on the right.</p>')+'</section></div>'+
    '<div class="col"><section class="panel"><h3>Add a product</h3><div class="row">'+branchField()+field('Name',inp('pn','text','e.g. Unga 2kg','','autocomplete="off"'),'grow')+field('Unit',sel('pu',['pieces','kg','litres','packs','crates'].map(x=>[x,x]),'pieces'),'grow')+'</div>'+
    '<div class="row">'+field('Selling price (KSh)',inp('pse','number','e.g. 150','','min="0" step="any"'),'grow')+field('Stock you have now',inp('pq','number','0','','min="0" step="any"'),'grow')+field('What each cost you',inp('pc','number','0','','min="0" step="any"'),'grow')+'</div>'+
    '<div class="row"><button class="btn" data-act="addprod">Add product</button></div><p class="hint">The cost you enter for current stock is treated as already paid for, so it does not count as a purchase.</p></section>'+
    '<section class="panel"><h3>You owe suppliers</h3>'+(owing.length?'<ul class="list">'+owing.map(x=>{var p=S.products.filter(q=>q.id===x.productId)[0];
      return '<li><div class="who"><b>'+esc(x.supplier||'Supplier')+'</b><small>'+x.qty+' × '+esc(p?p.name:'item')+' · '+dstr(x.ts)+'</small></div><span class="amt out">'+fmt(x.total-(x.paid||0))+'</span><button class="btn ghost small" data-act="paysup" data-id="'+x.id+'">Mark paid</button></li>';}).join('')+'</ul>':'<p class="empty">You owe no supplier anything.</p>')+'</section></div></div>';
  return h;
}

/* --- Credit (the Madeni ledger) --- */
function reminder(c,bal){
  var first=c.name.split(/\s+/)[0],shop=S.settings.shop||'our shop',pay=S.settings.pay;
  if(S.lang==='sw')return 'Habari '+first+', ukumbusho kutoka '+shop+': deni lako ni '+fmt(bal)+'.'+(pay?' Tafadhali lipa kupitia M-Pesa: '+pay+'.':'')+' Asante!';
  return 'Hello '+first+', a friendly reminder from '+shop+': your balance is '+fmt(bal)+'.'+(pay?' Please pay via M-Pesa to '+pay+'.':'')+' Thank you!';
}
function lateRows(){return S.customers.filter(inSel).map(c=>({c:c,s:stat(c)})).filter(r=>r.s.overdue).sort((a,b)=>b.s.bal-a.s.bal);}
function chaseText(){
  var rows=lateRows();if(!rows.length)return '';
  var sum=rows.reduce((t,r)=>t+r.s.bal,0);
  return 'Late balances ('+rows.length+') as at '+iso(Date.now())+'\n'+rows.map(r=>'• '+r.c.name+(r.c.phone?' '+r.c.phone:'')+': '+fmt(r.s.bal)+', '+r.s.age+' days').join('\n')+'\nTotal: '+fmt(sum);
}
function viewCredit(){
  var rows=S.customers.filter(inSel).map(c=>({c:c,s:stat(c)}));
  var owed=rows.reduce((s,r)=>s+Math.max(r.s.bal,0),0),od=lateRows(),odSum=od.reduce((s,r)=>s+r.s.bal,0);
  var today=S.entries.filter(e=>e.type==='payment'&&isToday(e.ts)),todaySum=today.reduce((s,e)=>s+e.amount,0);
  var h='<section class="kpis"><div class="kpi"><span class="k">Owed to you</span><span class="v neg">'+fmt(owed)+'</span><span class="s">'+rows.filter(r=>r.s.bal>0).length+' customers with a balance</span></div>'+
    '<div class="kpi"><span class="k">Collected today</span><span class="v pos">'+fmt(todaySum)+'</span><span class="s">'+today.length+' payment'+(today.length===1?'':'s')+'</span></div>'+
    '<div class="kpi"><span class="k">Past '+GRACE+' days</span><span class="v'+(od.length?' neg':'')+'">'+od.length+'</span><span class="s">'+(od.length?fmt(odSum)+' to chase':'Nobody is late')+'</span></div></section>';
  var un=S.entries.filter(e=>e.type==='payment'&&!e.custId);
  var rec=S.entries.filter(e=>e.type==='payment'&&e.custId).sort((a,b)=>b.ts-a.ts).slice(0,6);
  var left='<section class="panel"><h2>Paste M-Pesa messages</h2><p class="hint">Copy the confirmation SMS from your phone, paste as many as you like, and each payment is matched to a customer by phone number or name.</p>'+
    '<textarea id="paste" aria-label="M-Pesa messages" spellcheck="false" placeholder="Paste M-Pesa confirmation messages here">'+esc(fv('paste',''))+'</textarea>'+
    '<div class="row"><button class="btn" data-act="read">Read messages</button><button class="btn ghost" data-act="sample">Paste two example messages</button></div></section>';
  if(un.length)left+='<section class="panel"><h2>Needs a customer</h2><p class="hint">These payments did not match anyone you have added. Choose who paid, or add them as a new customer.</p><ul class="list">'+un.map(e=>{
    var sv=fv('as-'+e.id,'');
    return '<li><div class="who"><b>'+esc(e.from||'Unknown sender')+'</b><small>'+esc(e.phone||'no number')+' · '+esc(e.code)+' · '+dstr(e.ts)+'</small></div><span class="amt in">'+fmt(e.amount)+'</span>'+
      '<div class="assign"><select id="as-'+e.id+'" aria-label="Assign to customer"><option value="">Choose customer</option>'+S.customers.map(c=>'<option value="'+c.id+'"'+(sv===c.id?' selected':'')+'>'+esc(c.name)+'</option>').join('')+'</select>'+
      '<button class="btn small" data-act="assign" data-id="'+e.id+'">Assign</button><button class="btn ghost small" data-act="newfrom" data-id="'+e.id+'">Add as new customer</button></div></li>';}).join('')+'</ul></section>';
  left+='<section class="panel"><h2>Recent payments</h2>'+(rec.length?'<ul class="list">'+rec.map(e=>{var c=cust(e.custId);
    return '<li><div class="who"><b>'+esc(c?c.name:'Removed customer')+'</b><small>'+esc(e.code||'cash')+' · '+dstr(e.ts)+'</small></div><span class="amt in">+ '+fmt(e.amount)+'</span></li>';}).join('')+'</ul>':'<p class="empty">Payments you read from M-Pesa messages or record by hand will show here.</p>')+'</section>';

  var q=fv('q','').trim().toLowerCase(),flt=fv('filter','all'),srt=fv('sort','balance');
  var shown=rows.filter(r=>{
    if(q&&r.c.name.toLowerCase().indexOf(q)<0&&String(r.c.phone||'').replace(/\s/g,'').indexOf(q.replace(/\s/g,''))<0)return false;
    if(flt==='owing')return r.s.bal>0;if(flt==='late')return r.s.overdue;if(flt==='cleared')return r.s.bal<=0;return true;});
  shown.sort((a,b)=>srt==='name'?a.c.name.localeCompare(b.c.name):srt==='late'?(b.s.age-a.s.age||b.s.bal-a.s.bal):b.s.bal-a.s.bal);
  var ct=S.chase?chaseText():'';
  var right='<section class="panel"><div class="remhead"><h2>Customers on credit</h2><span class="row"><button class="btn ghost small" data-act="chase">Chase list</button></span></div>'+
    (S.chase?(ct?'<textarea id="chasebox" readonly aria-label="Chase list">'+esc(ct)+'</textarea><div class="row"><button class="btn small" data-act="chase-copy">Copy list</button><button class="btn ghost small" data-act="chase">Close</button></div>':'<p class="empty">Nobody is past '+GRACE+' days. <button class="btn ghost small" data-act="chase">Close</button></p>'):'')+
    '<div class="row">'+field('Name',inp('newName','text','e.g. Wanjiru Mwangi','','autocomplete="off"'),'grow')+field('Phone',inp('newPhone','tel','0712 345 678','',''),'grow')+'<button class="btn" data-act="addcust">Add customer</button></div>'+
    '<div class="row toolbar"><input class="grow" id="q" type="search" placeholder="Search by name or number" aria-label="Search customers" autocomplete="off" value="'+esc(fv('q',''))+'">'+
    '<span class="seg" role="group" aria-label="Filter">'+[['all','All'],['owing','Owing'],['late','Late'],['cleared','Cleared']].map(f=>'<button data-act="setf" data-k="filter" data-v="'+f[0]+'" aria-pressed="'+(flt===f[0])+'">'+f[1]+'</button>').join('')+'</span>'+
    sel('sort',[['balance','Biggest balance'],['late','Longest outstanding'],['name','Name A to Z']],'balance','aria-label="Sort customers"')+'</div>'+
    (!S.customers.length?'<p class="empty"><b>Start here</b></p><ol class="steps"><li><b>Add a customer</b> who buys on credit, using the form above.</li><li><b>Sell on credit</b> from the Enter tab, or record what they owe below.</li><li><b>Paste their M-Pesa messages</b> when they pay, and the balance drops by itself.</li></ol>':
      !shown.length?'<p class="empty">No customers match that search or filter.</p>':shown.map(r=>custHtml(r.c,r.s)).join(''))+'</section>';
  return h+'<div class="cols"><div class="col">'+left+'</div><div class="col">'+right+'</div></div>';
}
function custHtml(c,s){
  var open=S.open===c.id;
  var pill=s.bal<0?'<span class="pill clear">Paid ahead</span>':s.bal===0?'<span class="pill clear">Cleared</span>':s.overdue?'<span class="pill overdue">Late '+s.age+' days</span>':'<span class="pill">Open · '+s.age+'d</span>';
  var h='<article class="cust"><button class="cust-head" data-act="toggle" data-id="'+c.id+'" aria-expanded="'+open+'"><span class="name"><b>'+esc(c.name)+'</b><small>'+esc(c.phone||'no number')+'</small></span>'+pill+'<span class="bal '+(s.bal>0?'owed':'clear')+'">'+(s.bal<0?'+ '+fmt(-s.bal):fmt(s.bal))+'</span></button>';
  if(!open)return h+'</article>';
  h+='<div class="detail">';
  if(S.edit===c.id)h+='<div><span class="sub">Edit details</span><div class="row" style="margin-top:6px">'+field('Name',inp('en-'+c.id,'text','',c.name),'grow')+field('Phone',inp('ep-'+c.id,'tel','',c.phone||''),'grow')+'</div>'+
    '<div class="row" style="margin-top:8px"><button class="btn small" data-act="editsave" data-id="'+c.id+'">Save details</button><button class="btn ghost small" data-act="edit" data-id="'+c.id+'">Cancel</button></div></div>';
  if(s.bal>0)h+='<div><div class="remhead"><span class="sub">Reminder message</span><span class="seg" role="group" aria-label="Language"><button data-act="lang" data-lang="en" aria-pressed="'+(S.lang==='en')+'">English</button><button data-act="lang" data-lang="sw" aria-pressed="'+(S.lang==='sw')+'">Kiswahili</button></span></div>'+
    '<textarea class="reminder" id="rem-'+c.id+'" readonly aria-label="Reminder message">'+esc(reminder(c,s.bal))+'</textarea><div class="row" style="margin-top:8px"><button class="btn small" data-act="copy" data-id="'+c.id+'">Copy message</button>'+
    (toWa(c.phone)?'<a class="btn ghost small" target="_blank" rel="noopener" href="https://wa.me/'+toWa(c.phone)+'?text='+encodeURIComponent(reminder(c,s.bal))+'">Open in WhatsApp</a>':'')+'</div></div>';
  else if(s.bal<0)h+='<p class="empty">This customer has paid '+fmt(-s.bal)+' more than they owed. It will be taken off their next credit.</p>';
  else h+='<p class="empty">Nothing owed. A reminder is not needed.</p>';
  h+='<div><span class="sub">Record something</span><div class="row" style="margin-top:6px">'+field('Amount (KSh)',inp('amt-'+c.id,'number','500','','min="0" step="any" inputmode="decimal"'),'grow')+field('What for',inp('note-'+c.id,'text','e.g. Maize flour','','autocomplete="off"'),'grow')+'</div>'+
    '<div class="row" style="margin-top:8px"><button class="btn small" data-act="credit" data-id="'+c.id+'">Add to balance</button><button class="btn ghost small" data-act="cash" data-id="'+c.id+'">Record cash payment</button></div></div>';
  var hist=S.entries.filter(e=>e.custId===c.id).sort((a,b)=>b.ts-a.ts).slice(0,10);
  h+='<div><span class="sub">History</span>'+(hist.length?'<ul class="list hist">'+hist.map(e=>{
    var ctl=S.confirm==='e:'+e.id?'<span class="confirm">Remove this?<button class="btn danger small" data-act="delent-yes" data-id="'+e.id+'">Yes</button><button class="btn ghost small" data-act="cancel">No</button></span>':'<button class="btn ghost small" data-act="delent" data-id="'+e.id+'" aria-label="Remove this entry">Remove</button>';
    return '<li><div class="who"><b>'+(e.type==='credit'?'Credit'+(e.note?': '+esc(e.note):''):'Payment'+(e.code?' '+esc(e.code):' (cash)'))+'</b><small>'+dstr(e.ts)+'</small></div><span class="amt '+(e.type==='credit'?'out':'in')+'">'+(e.type==='credit'?'+ ':'− ')+fmt(e.amount)+'</span>'+ctl+'</li>';}).join('')+'</ul>':'<p class="empty">No entries yet.</p>')+'</div>';
  var foot=S.confirm==='c:'+c.id?'<span class="confirm">Delete '+esc(c.name)+' and all their entries?<button class="btn danger small" data-act="delcust-yes" data-id="'+c.id+'">Yes, delete</button><button class="btn ghost small" data-act="cancel">No</button></span>':'<button class="btn ghost small warnline" data-act="delcust" data-id="'+c.id+'">Delete customer</button>';
  return h+'<div class="foot"><button class="btn ghost small" data-act="edit" data-id="'+c.id+'">Edit details</button>'+foot+'</div></div></article>';
}

/* --- Settings --- */
function viewSettings(){
  var bl=branchList(),cloud=store.mode==='cloud';
  var h='<div class="cols"><div class="col"><section class="panel"><h2>Your business</h2><div class="row">'+field('Business name',inp('shopName','text','e.g. Njeri\'s Mini Mart',S.settings.shop||'','autocomplete="off"'),'grow')+'</div>'+
    '<div class="row">'+field('Customers pay by M-Pesa to',inp('payTo','text','e.g. Till 5123456',S.settings.pay||'','autocomplete="off"'),'grow')+field('Customers pay by Airtel Money to',inp('payAir','text','e.g. 0733 123 456',S.settings.payAirtel||'','autocomplete="off"'),'grow')+'</div>'+
    '<p class="hint">These appear in reminders and payment requests. Changes save when you leave the box.</p></section>'+
    '<section class="panel"><h2>Branches</h2><ul class="list">'+bl.map(b=>'<li><div class="row" style="width:100%;align-items:flex-end">'+field('Branch name',inp('bn-'+b.id,'text','',b.name,'autocomplete="off"'),'grow')+'<button class="btn ghost small" data-act="brsave" data-id="'+b.id+'">Save name</button></div></li>').join('')+'</ul>'+
    '<div class="row">'+field('Add a branch',inp('newbranch','text','e.g. Kasarani branch','','autocomplete="off"'),'grow')+'<button class="btn" data-act="addbranch">Add branch</button></div>'+
    '<p class="hint">Each branch keeps its own stock, sales and expenses. Choose a branch at the top of the page, or look at all of them combined.</p></section>'+
    '<section class="panel"><h2>Staff logins</h2><p class="hint">A manager runs one branch. A seller can only record sales and credit for one branch and does not see profit figures. Neither can see other branches.</p>'+
    (S.staff.length?'<ul class="list">'+S.staff.map(m=>'<li><div class="who"><b>'+esc(m.email)+'</b><small>'+esc(m.role==='owner'?'Owner · all branches':(m.role==='manager'?'Manager':'Seller')+' · '+branchName(m.branchId))+'</small></div>'+
      (m.role==='owner'?'':(S.confirm==='m:'+m.userId?'<span class="confirm">Remove this login?<button class="btn danger small" data-act="rmstaff-yes" data-id="'+m.userId+'">Yes</button><button class="btn ghost small" data-act="cancel">No</button></span>':'<button class="btn ghost small warnline" data-act="rmstaff" data-id="'+m.userId+'">Remove</button>'))+'</li>').join('')+'</ul>':'<p class="empty">No staff yet.</p>')+
    '<div class="row">'+field('Staff email',inp('sem','email','name@example.com','','autocomplete="off"'),'grow')+field('Password (8+ characters)',inp('spw','text','','','autocomplete="off"'),'grow')+'</div>'+
    '<div class="row">'+field('Role',sel('srole',[['seller','Seller'],['manager','Manager']],'seller'),'grow')+field('Branch',sel('sbr',bl.map(b=>[b.id,b.name]),bl[0].id),'grow')+'<button class="btn" data-act="addstaff">Add login</button></div>'+
    '<p class="hint">Give the staff member their email and password in person. They can sign in on their own phone.</p></section></div>'+
    '<div class="col">'+payConfigPanel(cloud)+
    '<section class="panel"><h2>Take your records out</h2><p class="hint">Saves a spreadsheet file you can open in Excel or Google Sheets.</p><div class="row">'+
    ['report:Profit report','sales:Sales','goods:Goods in','expenses:Expenses','customers:Customers','credit:Credit ledger'].map(x=>{var p=x.split(':');return '<button class="btn ghost small" data-act="export" data-w="'+p[0]+'">'+p[1]+'</button>';}).join('')+'</div></section>'+
    (store.mode==='local'?'<section class="panel"><h2>Demo mode</h2><p class="hint">This copy is not connected to a server. Logins here are for trying the app and are not secure, and the data stays in this browser. Connect a Supabase project (see the README) for real logins shared across phones.</p><div class="row"><button class="btn ghost small warnline" data-act="resetdemo">Reset demo data</button></div></section>':'')+'</div></div>';
  return h;
}
function payConfigPanel(cloud){
  if(!cloud)return '<section class="panel"><h2>Payment connections</h2><p class="hint">Real payment prompts need the cloud setup, a Safaricom Daraja app and an Airtel Money merchant account. See the README.</p></section>';
  var c=S.payCfg||{};
  var st=(ok)=>ok?'<span class="pill clear">Connected</span>':'<span class="pill">Not set</span>';
  return '<section class="panel"><h2>Payment connections</h2><p class="hint">Keys are sent to your own server and stored there. They are never shown again after you save them.</p>'+
    '<div class="remhead"><h3>Safaricom M-Pesa</h3>'+st(c.mpesa)+'</div>'+
    '<div class="row">'+field('Account type',sel('mtype',[['till','Buy Goods (Till)'],['paybill','Paybill']],c.mpesa_type||'till'),'grow')+field('Shortcode / store number',inp('mcode','text','e.g. 174379',c.mpesa_shortcode||'','autocomplete="off"'),'grow')+field('Till number (Buy Goods)',inp('mpb','text','e.g. 5123456',c.mpesa_party_b||'','autocomplete="off"'),'grow')+'</div>'+
    '<div class="row">'+field('Consumer key',inp('mkey','password','','','autocomplete="off"'),'grow')+field('Consumer secret',inp('msec','password','','','autocomplete="off"'),'grow')+field('Passkey',inp('mpass','password','','','autocomplete="off"'),'grow')+'</div>'+
    '<div class="remhead"><h3>Airtel Money</h3>'+st(c.airtel)+'</div>'+
    '<div class="row">'+field('Client ID',inp('aid','password','','','autocomplete="off"'),'grow')+field('Client secret',inp('asec','password','','','autocomplete="off"'),'grow')+'</div>'+
    '<div class="row"><button class="btn" data-act="savepay">Save payment keys</button></div>'+
    '<p class="hint">Leave a box empty to keep what is already saved.</p></section>';
}

/* ---------- render ---------- */
function authHtml(){
  var local=store.mode==='local',m=S.authMode,msg=S.authMsg?'<p class="status warn" role="alert">'+esc(S.authMsg)+'</p>':'';
  if(S.auth==='loading')return '<p class="empty">Loading…</p>';
  if(S.auth==='noshop')return '<section class="panel authcard"><h2>Set up your shop</h2><p class="hint">You are signed in as '+esc(S.session.email)+'. Name your shop to start. You will be its owner.</p>'+msg+
    '<div class="row">'+field('Shop name',inp('ashop','text','e.g. Njeri\'s Mini Mart','','autocomplete="off"'),'grow')+'</div><div class="row"><button class="btn" data-act="createshop">Create shop</button><button class="btn ghost" data-act="logout">Sign out</button></div></section>';
  var demo='';
  if(local){
    var acc=store.demoAccounts();
    demo='<section class="panel authcard"><h3>Try the demo</h3><p class="hint">Demo mode keeps data in this browser only and its logins are not secure. Tap an account to fill the form, then press Sign in.</p><ul class="list">'+
      acc.map(a=>'<li><div class="who"><b>'+esc(a.email)+'</b><small>'+(a.role==='owner'?'Owner · sees every branch and the combined profit':a.role==='manager'?'Manager · one branch, everything in it':'Seller · one branch, sales and credit only')+'</small></div><button class="btn ghost small" data-act="demofill" data-email="'+esc(a.email)+'" data-pw="'+esc(a.password)+'">Use</button></li>').join('')+'</ul></section>';
  }
  return '<div class="authwrap"><section class="panel authcard"><h2>'+(m==='in'?'Sign in':'Create your shop')+'</h2>'+msg+
    (m==='up'?'<div class="row">'+field('Shop name',inp('ashop','text','e.g. Njeri\'s Mini Mart','','autocomplete="off"'),'grow')+'</div>':'')+
    '<div class="row">'+field('Email',inp('aemail','email','you@example.com','','autocomplete="username"'),'grow')+'</div>'+
    '<div class="row">'+field('Password'+(m==='up'?' (8+ characters)':''),inp('apass','password','','','autocomplete="'+(m==='in'?'current-password':'new-password')+'"'),'grow')+'</div>'+
    '<div class="row"><button class="btn" data-act="'+(m==='in'?'login':'signup')+'">'+(m==='in'?'Sign in':'Create shop')+'</button>'+
    '<button class="btn ghost" data-act="authmode" data-m="'+(m==='in'?'up':'in')+'">'+(m==='in'?'New shop? Create an account':'Have an account? Sign in')+'</button></div></section>'+demo+'</div>';
}
function render(){
  var ae=document.activeElement,aid=null,ss=null,se=null;
  if(ae&&ae.id&&ae.closest&&ae.closest('#view')){aid=ae.id;try{ss=ae.selectionStart;se=ae.selectionEnd;}catch(e){}}
  var signedIn=S.auth==='in';
  $('who').innerHTML=signedIn?'<span class="hint">'+esc(S.session.email)+' · '+({owner:'Owner',manager:'Manager',seller:'Seller'}[role()])+'</span><button class="btn ghost small" data-act="logout">Sign out</button>':'';
  var label=!store?'Loading…':S.auth!=='in'?(store.mode==='cloud'?'Secure cloud sign-in.':'Demo mode: saved in this browser only.'):S.warn?'Cannot reach saved data yet. What you see may be out of date.':!S.ready?'Loading your book…':
    store.mode==='cloud'?'Saved to your account. Syncs across your devices.':'Demo mode: saved in this browser only.';
  $('sync').innerHTML='<span class="dot '+(S.warn?'warn':store&&store.mode==='cloud'?'cloud':'')+'"></span><span>'+label+'</span>';
  if(!signedIn){$('branchbar').innerHTML='';$('nav').innerHTML='';$('exbar').hidden=true;$('view').innerHTML=authHtml();return;}
  var bl=branchList();
  if(isOwner()){
    if(S.branch!=='all'&&!bl.some(b=>b.id===S.branch))S.branch='all';
    $('branchbar').innerHTML=bl.length>1?'<label class="f" style="flex-direction:row;align-items:center;gap:8px">Showing'+sel('brsel',[['all','All branches combined']].concat(bl.map(b=>[b.id,b.name])),S.branch)+'</label>':'<span class="hint">'+esc(bl[0].name)+'</span>';
  } else $('branchbar').innerHTML='<span class="hint">Branch: '+esc(branchName(S.session.branchId))+'</span>';
  $('exbar').hidden=store.mode!=='local';
  var tabs=allowedTabs();if(!tabs.some(t=>t[0]===S.tab))S.tab=tabs[0][0];
  $('nav').innerHTML=tabs.map(t=>'<button data-act="tab" data-t="'+t[0]+'"'+(S.tab===t[0]?' aria-current="page"':'')+'>'+t[1]+'</button>').join('');
  var v;
  if(!S.ready)v='<p class="empty">Loading your business…</p>';
  else v={overview:viewOverview,enter:viewEnter,stock:viewStock,credit:viewCredit,settings:viewSettings}[S.tab]();
  $('view').innerHTML=v;
  if(aid){var el=$(aid);if(el){el.focus();try{if(ss!=null)el.setSelectionRange(ss,se);}catch(e){}}}
}

/* ---------- actions ---------- */
function sampleText(){
  var d=new Date(),ds=d.getDate()+'/'+(d.getMonth()+1)+'/'+String(d.getFullYear()).slice(2);
  return 'TKD4P7Q2LM Confirmed. Ksh2,000.00 received from WANJIRU MWANGI 0712345678 on '+ds+' at 9:12 AM. New M-PESA balance is Ksh14,820.00.\n\n'+
         'TKD4P7R9XA Confirmed.You have received Ksh350.00 from PETER KIPCHOGE 0701555222 on '+ds+' at 9:40 AM. New M-PESA balance is Ksh15,170.00.';
}
function readMessages(){
  var res=parseMessages(fv('paste',''));
  if(!res.items.length){say(res.bad?'Could not read those messages. Paste the full SMS, starting from the confirmation code.':'Paste at least one M-Pesa confirmation message first.',true);return;}
  var added=0,matched=0,dup=0;
  res.items.forEach(it=>{
    if(S.entries.some(e=>e.code&&e.code===it.code)){dup++;return;}
    var c=matchCustomer(S.customers,it);
    put('entries',{id:uid(),branchId:c?(c.branchId||formBranch()):formBranch(),custId:c?c.id:null,type:'payment',amount:it.amount,ts:it.ts,note:'M-Pesa',code:it.code,from:it.name,phone:it.phone});
    added++;if(c)matched++;
  });
  S.form.paste='';render();
  var msg='Added '+added+' payment'+(added===1?'':'s')+(added?': '+matched+' matched, '+(added-matched)+' need a customer':'')+'.';
  if(dup)msg+=' '+dup+' already recorded, skipped.';
  if(res.bad)msg+=' '+res.bad+' message'+(res.bad===1?'':'s')+' could not be read.';
  say(msg,added-matched>0||res.bad>0);
}
function copyFrom(id,okMsg){
  var ta=$(id);if(!ta)return;
  function fallback(){ta.focus();ta.select();say('Selected. Press Ctrl+C or long-press to copy.',true);}
  try{navigator.clipboard.writeText(ta.value).then(()=>say(okMsg),fallback);}catch(e){fallback();}
}
function csv(rows){return rows.map(r=>r.map(v=>{v=String(v==null?'':v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}).join(',')).join('\r\n');}
function saveFile(name,text){
  var b=new Blob(["\ufeff"+text],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");
  a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);say("Saved "+name+".");
}
function doExport(w){
  var rows,nm=iso(Date.now());
  if(w==='report'){var W=windowData(S.period,S.branch);rows=[['Period','Sales','Cost of goods','Expenses','Profit or loss','Goods bought','Paid for goods']];
    W.B.forEach(b=>rows.push([blabel(b.start,S.period,true),r2(b.sales),r2(b.cogs),r2(b.exp),r2(b.profit),r2(b.gin),r2(b.ginPaid)]));}
  else if(w==='sales'){rows=[['Date','Branch','Items','Total','Cash','M-Pesa','Airtel Money','Credit','Code']];
    S.sales.filter(inSel).sort((a,b)=>a.ts-b.ts).forEach(x=>rows.push([iso(x.ts),branchName(bid(x)),(x.lines||[]).map(l=>l.qty+' x '+l.name).join('; '),x.total,x.pays.cash,x.pays.mpesa,x.pays.airtel,x.pays.credit,x.ref||'']));}
  else if(w==='goods'){rows=[['Date','Branch','Item','Quantity','Unit cost','Total','Paid','Method','Supplier']];
    S.stock.filter(x=>inSel(x)&&!x.opening).sort((a,b)=>a.ts-b.ts).forEach(x=>{var p=S.products.filter(q=>q.id===x.productId)[0];rows.push([iso(x.ts),branchName(bid(x)),p?p.name:'',x.qty,x.unitCost,x.total,x.paid||0,MLAB[x.method]||x.method,x.supplier||'']);});}
  else if(w==='expenses'){rows=[['Date','Branch','Type','Amount','Paid with','Note']];
    S.expenses.filter(inSel).sort((a,b)=>a.ts-b.ts).forEach(x=>rows.push([iso(x.ts),branchName(bid(x)),x.category,x.amount,MLAB[x.method]||x.method,x.note||'']));}
  else if(w==='customers'){rows=[['Name','Phone','Owed (KSh)','Days outstanding','Status']];
    S.customers.filter(inSel).sort((a,b)=>a.name.localeCompare(b.name)).forEach(c=>{var s=stat(c);rows.push([c.name,c.phone||'',s.bal,s.age,s.bal<0?'Paid ahead':s.bal===0?'Cleared':s.overdue?'Late':'Open']);});}
  else{rows=[['Date','Customer','Type','Amount (KSh)','Note','M-Pesa code','M-Pesa sender']];
    S.entries.slice().sort((a,b)=>a.ts-b.ts).forEach(e=>{var c=cust(e.custId);rows.push([iso(e.ts),c?c.name:'(unassigned)',e.type==='credit'?'Credit':'Payment',e.amount,e.note||'',e.code||'',e.from||'']);});}
  saveFile('madeni-'+w+'-'+nm+'.csv',csv(rows));
}
function saveSale(){
  var lines=saleLines(),br=formBranch();
  if(!lines.length){say('Choose at least one item and a quantity.',true);return;}
  var total=r2(lines.reduce((t,l)=>t+l.qty*l.price,0)),ps=paySplit(total),custId=null;
  if(ps.credit>0){
    var sc=fv('scust','');
    if(sc==='__new'){
      var nm=fv('scname','').trim();if(!nm){say('Enter the customer\'s name for the part on credit.',true);return;}
      var nc={id:uid(),name:toTitle(nm),phone:fv('scphone','').trim(),branchId:br};put('customers',nc);custId=nc.id;
    } else if(sc){custId=sc;} else {say('Part of this sale is on credit. Choose or add the customer.',true);return;}
  }
  var sid=uid(),ts=Date.now();
  put('sales',{id:sid,branchId:br,ts:ts,lines:lines.map(l=>({productId:l.productId,name:l.name,qty:l.qty,price:l.price,cost:l.cost})),total:total,pays:ps.pays,custId:custId,ref:fv('sref','').trim(),note:''});
  if(ps.credit>0)put('entries',{id:uid(),branchId:br,custId:custId,type:'credit',amount:ps.credit,ts:ts,note:'Sale '+lines.map(l=>l.name).join(', '),code:'',from:'',saleId:sid});
  if(fv('usePay','')){var up=S.payments.find(x=>x.id===fv('usePay',''));if(up)put('payments',Object.assign({},up,{used:true,saleId:sid}));}
  clearForm(['sp-','sq-','sr-','nrows','rcv','sref','scust','scname','scphone','pmsg','pamt','usePay']);
  render();say('Sale saved: '+fmt(total)+(ps.credit>0?', '+fmt(ps.credit)+' on credit':'')+'.');
}
function saveGoods(){
  var pid=fv('gp',''),q=parseFloat(fv('gq',''))||0,c=parseFloat(fv('gc',''))||0,br=formBranch();
  if(!pid||q<=0||c<=0){say('Choose the item and enter the quantity and buying price.',true);return;}
  var tot=r2(q*c),m=fv('gmethod','cash'),raw=fv('gpaid',''),paid=m==='credit'?0:r2(Math.min(tot,raw===''?tot:Math.max(parseFloat(raw)||0,0)));
  put('stock',{id:uid(),branchId:br,productId:pid,qty:q,unitCost:c,total:tot,paid:paid,method:m,supplier:fv('gsup','').trim(),ts:Date.now()});
  clearForm(['gp','gq','gc','gsup','gpaid']);render();say('Goods in saved: '+fmt(tot)+(tot-paid>0?', '+fmt(tot-paid)+' still owed':'')+'.');
}
function saveExp(){
  var a=parseFloat(fv('eamt',''))||0;if(a<=0){say('Enter the expense amount.',true);return;}
  put('expenses',{id:uid(),branchId:formBranch(),ts:Date.now(),category:fv('ecat','Rent'),amount:a,method:fv('emethod','cash'),note:fv('enote','').trim()});
  clearForm(['eamt','enote']);render();say('Expense saved: '+fmt(a)+'.');
}
function removeRecord(k,id){
  if(k==='sales')S.entries.filter(e=>e.saleId===id).forEach(e=>del('entries',e.id));
  del(k,id);
}
document.addEventListener('click',ev=>{
  var t=ev.target.closest('[data-act]');if(!t)return;
  var act=t.getAttribute('data-act'),id=t.getAttribute('data-id');
  switch(act){
  case 'authmode':S.authMode=t.getAttribute('data-m');S.authMsg='';render();return;
  case 'demofill':S.form.aemail=t.getAttribute('data-email');S.form.apass=t.getAttribute('data-pw');S.authMode='in';S.authMsg='';render();return;
  case 'login':S.authMsg='';enterWith(store.signIn(fv('aemail',''),fv('apass','')));return;
  case 'signup':{
    var sn=fv('ashop','').trim();if(!sn){S.authMsg='Enter your shop name.';render();return;}
    S.authMsg='';enterWith(store.signUp(fv('aemail',''),fv('apass',''),sn));return;}
  case 'createshop':{var sn2=fv('ashop','').trim();if(!sn2){S.authMsg='Enter your shop name.';render();return;}S.authMsg='';enterWith(store.createShop(sn2));return;}
  case 'logout':
    if(unsub){unsub();unsub=null;}
    store.signOut().then(()=>{S.session=null;S.auth='out';S.form={};S.authMsg='';got={};S.ready=false;render();});return;
  case 'resetdemo':store.resetDemo();if(unsub){unsub();unsub=null;}S.session=null;S.auth='out';S.form={};got={};S.ready=false;store.init().then(()=>render());return;
  case 'sendprompt':{
    var net=fv('pnet','mpesa'),ph=intlPhone(fv('pphone','')),total=r2(saleLines().reduce((x,l)=>x+l.qty*l.price,0)),ps0=paySplit(total,fv('method','cash'),fv('rcv',''));
    var amt=fv('pamt','')!==''?parseFloat(fv('pamt',''))||0:(ps0.recv||ps0.credit);
    if(!ph){say('Enter the buyer\'s Kenyan phone number, like 0712 345 678.',true);return;}
    if(!(amt>0)){say('Enter the amount to ask for.',true);return;}
    say('Sending the prompt…');
    store.requestPayment({network:net,phone:ph,amount:amt,reference:S.settings.shop||'Sale',branchId:formBranch()})
      .then(()=>say('Prompt sent to '+fv('pphone','')+'. Ask the buyer to enter their PIN.'),e=>say(e.message,true));return;}
  case 'usepay':{
    var pp=S.payments.find(x=>x.id===id);if(!pp)return;
    S.form.method=pp.network;S.form.sref=pp.receipt||'';S.form.usePay=pp.id;
    var tt=r2(saleLines().reduce((x,l)=>x+l.qty*l.price,0));S.form.rcv=pp.amount>=tt?'':String(pp.amount);
    render();say('Payment of '+fmt(pp.amount)+' will be recorded when you save the sale.');return;}
  case 'addstaff':{
    var em=fv('sem','').trim(),pw=fv('spw',''),rl=fv('srole','seller'),sb=fv('sbr',branchList()[0].id);
    if(!em||!pw){say('Enter the staff email and a password.',true);return;}
    store.addStaff({email:em,password:pw,role:rl,branchId:sb}).then(()=>{clearForm(['sem','spw']);loadStaff();say('Login created for '+em+'.');},e=>say(e.message,true));return;}
  case 'rmstaff':S.confirm='m:'+id;render();return;
  case 'rmstaff-yes':S.confirm=null;store.removeStaff(id).then(()=>{loadStaff();say('Login removed.');},e=>say(e.message,true));return;
  case 'savepay':{
    var cfg={mpesa_type:fv('mtype','till'),mpesa_shortcode:fv('mcode',''),mpesa_party_b:fv('mpb',''),mpesa_key:fv('mkey',''),mpesa_secret:fv('msec',''),mpesa_passkey:fv('mpass',''),airtel_client_id:fv('aid',''),airtel_client_secret:fv('asec','')};
    store.savePaymentConfig(cfg).then(()=>{clearForm(['mkey','msec','mpass','aid','asec']);loadPayCfg();say('Payment keys saved.');},e=>say(e.message,true));return;}
  case 'tab':S.tab=t.getAttribute('data-t');S.confirm=null;if(S.tab==='settings'){loadStaff();loadPayCfg();}render();return;
  case 'period':S.period=t.getAttribute('data-p');S.sel=null;render();return;
  case 'sel':S.sel=+t.getAttribute('data-i');render();return;
  case 'pickbranch':S.branch=id;render();return;
  case 'setf':S.form[t.getAttribute('data-k')]=t.getAttribute('data-v');render();return;
  case 'addrow':S.form.nrows=nrows()+1;render();return;
  case 'savesale':saveSale();return;
  case 'savegoods':saveGoods();return;
  case 'saveexp':saveExp();return;
  case 'rec-del':S.confirm=t.getAttribute('data-key');render();return;
  case 'rec-del-yes':removeRecord(t.getAttribute('data-k'),id);S.confirm=null;render();say('Entry removed.');return;
  case 'prepmsg':{
    var net=fv('pnet','mpesa'),to=net==='airtel'?S.settings.payAirtel:S.settings.pay,total=r2(saleLines().reduce((x,l)=>x+l.qty*l.price,0)),ps=paySplit(total);
    var amt=fv('pamt','')!==''?parseFloat(fv('pamt',''))||0:(ps.recv||ps.credit);
    if(!(amt>0)){say('Enter the amount first, or add items to the sale.',true);return;}
    S.form.pmsg='Hello, please pay '+fmt(amt)+' to '+(S.settings.shop||'our shop')+(net==='airtel'?' via Airtel Money':' via M-Pesa')+(to?': '+to:'')+'. Thank you!';render();return;}
  case 'copypm':copyFrom('pmsg','Payment request copied.');return;
  case 'addprod':{
    var n=fv('pn','').trim(),sp=parseFloat(fv('pse',''))||0,q=parseFloat(fv('pq','0'))||0,c=parseFloat(fv('pc','0'))||0,br=formBranch();
    if(!n||!(sp>0)){say('Enter the product name and its selling price.',true);return;}
    var p={id:uid(),branchId:br,name:n,unit:fv('pu','pieces'),sell:sp};put('products',p);
    if(q>0)put('stock',{id:uid(),branchId:br,productId:p.id,qty:q,unitCost:c,total:r2(q*c),paid:0,method:'opening',opening:true,supplier:'',ts:Date.now()});
    clearForm(['pn','pse','pq','pc']);render();say('Added '+n+'.');return;}
  case 'setprice':{var pr=S.products.filter(p=>p.id===id)[0],v=parseFloat(fv('pp-'+id,pr?String(pr.sell):''));
    if(!pr||!(v>0)){say('Enter a selling price above zero.',true);return;}
    var u=Object.assign({},pr,{sell:v});put('products',u);clearForm(['pp-'+id]);render();say('Price for '+pr.name+' is now '+fmt(v)+'.');return;}
  case 'delprod':S.confirm='p:'+id;render();return;
  case 'delprod-yes':del('products',id);S.confirm=null;render();say('Product removed. Past sales keep its name.');return;
  case 'paysup':{var sx=S.stock.filter(x=>x.id===id)[0];if(!sx)return;put('stock',Object.assign({},sx,{paid:sx.total,method:sx.method==='credit'?'cash':sx.method}));render();say('Marked as paid.');return;}
  case 'brsave':{var bl=branchList(),b=bl.filter(x=>x.id===id)[0],nm=fv('bn-'+id,'').trim();if(!b||!nm)return;
    if(!S.branches.length){put('branches',{id:'main',name:nm});S.settings.shop=S.settings.shop||nm;}else put('branches',Object.assign({},b,{name:nm}));
    clearForm(['bn-']);render();say('Branch name saved.');return;}
  case 'addbranch':{var nb=fv('newbranch','').trim();if(!nb){say('Enter the branch name.',true);return;}
    if(!S.branches.length)put('branches',{id:'main',name:S.settings.shop||'Main shop'});
    put('branches',{id:uid(),name:nb});clearForm(['newbranch']);render();say('Added '+nb+'. Switch to it at the top of the page.');return;}
  case 'export':doExport(t.getAttribute('data-w'));return;
  case 'toggle':S.open=S.open===id?null:id;S.edit=null;S.confirm=null;render();return;
  case 'read':readMessages();return;
  case 'sample':S.form.paste=sampleText();render();say('Example messages pasted. Press Read messages.');return;
  case 'lang':S.lang=t.getAttribute('data-lang');render();return;
  case 'copy':copyFrom('rem-'+id,'Reminder copied.');return;
  case 'chase':S.chase=!S.chase;render();return;
  case 'chase-copy':copyFrom('chasebox','Chase list copied.');return;
  case 'cancel':S.confirm=null;render();return;
  case 'edit':S.edit=S.edit===id?null:id;clearForm(['en-'+id,'ep-'+id]);render();return;
  case 'editsave':{
    var c1=cust(id),nn=fv('en-'+id,c1?c1.name:'').trim();if(!c1)return;if(!nn){say('A customer needs a name.',true);return;}
    put('customers',Object.assign({},c1,{name:nn,phone:fv('ep-'+id,c1.phone||'').trim()}));
    S.edit=null;clearForm(['en-'+id,'ep-'+id]);render();say('Saved details for '+nn+'.');return;}
  case 'delcust':S.confirm='c:'+id;render();return;
  case 'delcust-yes':{var cc=cust(id);S.entries.filter(e=>e.custId===id).forEach(e=>del('entries',e.id));del('customers',id);S.open=null;S.confirm=null;render();say('Deleted '+(cc?cc.name:'customer')+'.');return;}
  case 'delent':S.confirm='e:'+id;render();return;
  case 'delent-yes':del('entries',id);S.confirm=null;render();say('Entry removed.');return;
  case 'credit':case 'cash':{
    var a=parseFloat(fv('amt-'+id,''));if(!(a>0)){say('Enter an amount greater than zero.',true);return;}
    var note=fv('note-'+id,'').trim();
    put('entries',{id:uid(),branchId:(cust(id)||{}).branchId||formBranch(),custId:id,type:act==='credit'?'credit':'payment',amount:a,ts:Date.now(),note:note||(act==='cash'?'Cash':''),code:'',from:''});
    clearForm(['amt-'+id,'note-'+id]);render();say(act==='credit'?'Added '+fmt(a)+' to the balance.':'Recorded '+fmt(a)+' cash payment.');return;}
  case 'assign':{
    var v=fv('as-'+id,'');if(!v){say('Choose which customer paid.',true);return;}
    var en=S.entries.filter(e=>e.id===id)[0];if(!en)return;
    put('entries',Object.assign({},en,{custId:v}));clearForm(['as-'+id]);render();say('Payment assigned to '+cust(v).name+'.');return;}
  case 'newfrom':{
    var e2=S.entries.filter(e=>e.id===id)[0];if(!e2)return;
    var nc={id:uid(),name:e2.from||'New customer',phone:e2.phone||'',branchId:formBranch()};
    S.open=nc.id;put('customers',nc);put('entries',Object.assign({},e2,{custId:nc.id}));render();say('Added '+nc.name+' and recorded the payment.');return;}
  case 'addcust':{
    var n2=fv('newName','').trim();if(!n2){say('Enter the customer\'s name.',true);return;}
    var c3={id:uid(),name:toTitle(n2),phone:fv('newPhone','').trim(),branchId:formBranch()};
    S.open=c3.id;clearForm(['newName','newPhone','q']);S.form.filter='all';put('customers',c3);render();say('Added '+c3.name+'. Record what they owe below.');return;}
  }
});
document.addEventListener('keydown',ev=>{
  if((ev.key==='Enter'||ev.key===' ')&&ev.target&&ev.target.getAttribute&&ev.target.getAttribute('role')==='button'&&ev.target.getAttribute('data-act')){ev.preventDefault();ev.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
});
function liveUpdate(id){
  if(S.tab==='enter'&&fv('kind','sale')==='sale'){
    var box=$('salesum');if(box)box.innerHTML=saleSummary();
    var m=/^s[qr]-(\d+)$/.exec(id);
    if(m){var i=m[1],pid=fv('sp-'+i,''),p=S.products.filter(x=>x.id===pid)[0],q=parseFloat(fv('sq-'+i,'1'))||0,pr=fv('sr-'+i,''),price=pr===''?(p?p.sell:0):parseFloat(pr)||0,lt=$('lt-'+i);if(lt)lt.textContent=fmt(q*price);}
  }
}
document.addEventListener('input',ev=>{
  var t=ev.target;if(!t.id||t.tagName==='SELECT')return;
  S.form[t.id]=t.value;
  if(t.id==='q'){render();return;}
  if(t.id==='gq'||t.id==='gc'||t.id==='gpaid'){return;}
  liveUpdate(t.id);
});
document.addEventListener('change',ev=>{
  var t=ev.target;if(!t.id)return;
  S.form[t.id]=t.value;
  if(t.id==='brsel'){S.branch=t.value;S.sel=null;render();return;}
  if(t.id==='shopName'){S.settings.shop=t.value.trim();putSettings();render();return;}
  if(t.id==='payTo'){S.settings.pay=t.value.trim();putSettings();render();return;}
  if(t.id==='payAir'){S.settings.payAirtel=t.value.trim();putSettings();render();return;}
  if(t.tagName==='SELECT'){
    var m=/^sp-(\d+)$/.exec(t.id);
    if(m){var p=S.products.filter(x=>x.id===t.value)[0];if(p)S.form['sr-'+m[1]]=String(p.sell);else delete S.form['sr-'+m[1]];}
    render();return;
  }
  if(/^(gq|gc|gpaid|rcv|pamt)$/.test(t.id))render();
});

/* ---------- start ---------- */
function loadStaff(){if(!isOwner())return;store.listStaff().then(l=>{S.staff=l;queueRender();},()=>{});}
function loadPayCfg(){if(!isOwner()||store.mode!=='cloud')return;store.paymentConfigStatus().then(c=>{S.payCfg=c;queueRender();},()=>{});}
async function main(){
  var note='';
  try{
    store=(CONFIG.url&&CONFIG.anonKey)?await cloudStore({url:CONFIG.url,anonKey:CONFIG.anonKey}):localStore();
  }catch(e){store=localStore();note='Could not reach the cloud service, so demo mode is on.';}
  S.authMsg=note;render();
  await enterWith(store.init());
}
main();
