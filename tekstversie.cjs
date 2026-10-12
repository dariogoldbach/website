// Bouwt een tekstversie van alle pagina's uit pages.js, voor zoekmachines en schermlezers.
const fs=require('fs');global.window={};eval(fs.readFileSync(''+__dirname+'/site/pages.js','utf8'));
const P=window.PAGES, esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const a=l=>`<a href="${esc(l.href)}">${esc(l.text)}</a>`;
let h=['<!--tekst-->','<div class="tekstversie">'];
for(const p of P){
  if(p.type==='bio'){h.push(`<h1>${esc(p.title)}</h1>`,`<p>${esc(p.text)}</p>`);}
  else if(p.type==='platform'||p.type==='podcast'){h.push(`<h2>${esc(p.title)}</h2>`,`<p>${esc(p.text)}</p>`);(p.links||[p.link]).filter(Boolean).forEach(l=>h.push(`<p>${a(l)}</p>`));}
  else if(p.type==='boek'){h.push(`<h2>${esc(p.title)}</h2>`,`<p>${esc(p.text)}</p>`);[p.link,p.listen].filter(Boolean).forEach(l=>h.push(`<p>${a(l)}</p>`));}
  else if(p.type==='agenda'){h.push('<h2>Agenda</h2>','<ul>'+p.items.map(i=>`<li>${i.tag?esc(i.tag)+' – ':''}${esc(i.when)}: ${esc(i.what)}${i.where?', '+esc(i.where):''}</li>`).join('')+'</ul>');}
  else if(p.type==='club'){h.push(`<h2>${esc(p.title)}</h2>`,...p.text.map(t=>`<p>${esc(t)}</p>`),`<p>${a(p.link)}</p>`);}
  else if(p.type==='social'){h.push('<h2>Volg Dario</h2>','<p>'+p.links.map(a).join(' · ')+'</p>');}
  else if(p.type==='contact'){h.push('<h2>Contact</h2>',`<p>${esc(p.text)} <a href="mailto:${esc(p.email)}">${esc(p.email)}</a></p>`);}
  else if(p.type==='video'){h.push(`<h2>${esc(p.title)}</h2>`,`<p>${esc(p.caption)}</p>`);}
}
h.push('</div>','<!--/tekst-->');
const ld={"@context":"https://schema.org","@type":"Person",name:"Dario Goldbach",url:"https://dariogoldbach.nl/",image:"https://dariogoldbach.nl/img/dario.jpg",jobTitle:"Schrijver",email:"mailto:contact@studiodario.nl",
 sameAs:P.find(p=>p.type==='social').links.map(l=>l.href)};
let html=fs.readFileSync(''+__dirname+'/site/index.html','utf8');
html=html.replace(/<!--tekst-->[\s\S]*?<!--\/tekst-->\n?/,'');
html=html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/,'');
html=html.replace('<!--/app-->\n','<!--/app-->\n'+h.join('\n')+'\n');
html=html.replace('</head>','<script type="application/ld+json">'+JSON.stringify(ld)+'</script>\n</head>');
fs.writeFileSync(''+__dirname+'/site/index.html',html);
