const decode=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const form=document.querySelector('#unlock'),field=document.querySelector('#password'),msg=document.querySelector('#message'),button=document.querySelector('#submit');
let resume=null;const urls={};
function showPage(name){const source=new TextDecoder().decode(decode(resume[name]));const doc=new DOMParser().parseFromString(source,'text/html');document.title=doc.title;document.documentElement.lang=doc.documentElement.lang;document.body.replaceWith(doc.body);enhancePage();document.querySelectorAll('a[href="index.html"],a[href="en.html"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();showPage(a.getAttribute('href'));window.scrollTo(0,0)}));document.querySelectorAll('a[href="resume-zh.pdf"],a[href="resume-en.pdf"]').forEach(a=>{const n=a.getAttribute('href');if(!urls[n])urls[n]=URL.createObjectURL(new Blob([decode(resume[n])],{type:'application/pdf'}));a.href=urls[n]});}
form.addEventListener('submit',async e=>{e.preventDefault();button.disabled=true;msg.textContent='正在验证…';try{const r=await fetch('resume.enc.json',{cache:'no-cache'});if(!r.ok)throw new Error('network');const x=await r.json();const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(field.value),'PBKDF2',false,['deriveKey']);const key=await crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt:decode(x.salt),iterations:x.iterations},material,{name:'AES-GCM',length:256},false,['decrypt']);const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(x.iv)},key,decode(x.ciphertext));resume=JSON.parse(new TextDecoder().decode(plain));field.value='';showPage(location.pathname.endsWith('/en.html')?'en.html':'index.html')}catch(err){msg.textContent=err.message==='network'?'内容加载失败，请稍后重试。':'密码不正确，请重试。';field.select();button.disabled=false}});
function enhancePage(){
 const zh=document.documentElement.lang.startsWith('zh');
 document.body.classList.add('page-enter');
 const sections=document.querySelectorAll('.section-layout, .contact');
 if('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches){
  const observer=new IntersectionObserver((items)=>items.forEach(item=>{if(item.isIntersecting){item.target.classList.add('is-visible');observer.unobserve(item.target)}}),{threshold:0.08});
  sections.forEach((section)=>{section.classList.add('reveal');observer.observe(section)});
 }
 const area=document.querySelector('.contact');if(!area)return;
 const trigger=document.createElement('a');trigger.className='contact-trigger';trigger.href='mailto:'+resume.contact_email;trigger.textContent=zh?'发邮件联系 ↗':'Email me ↗';area.append(trigger);
}
