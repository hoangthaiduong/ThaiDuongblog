(function(){
const KEY='thaiDuongProfileCMS_v1';
const defaults={profile:{name:'Hoàng Thái Dương',bio:'Exploring code, web development, games, and new ideas.',skills:['HTML','CSS','Python','Web Development'],website:'',youtube:'',social_links:{},custom_links:[],about:'Mình thích xây dựng website, game và những dự án nhỏ để học hỏi, thử nghiệm và sáng tạo.',interests:'Coding • Web • Games • Learning • Creative projects',goals:'Học hỏi thêm, hoàn thiện các dự án cá nhân và xây dựng sản phẩm hữu ích.'},posts:[{id:1,title:'Chào mừng đến với trang cá nhân',slug:'chao-mung-den-voi-trang-ca-nhan',content:'Đây là không gian để chia sẻ những dự án, thử nghiệm và hành trình học tập.',category:'Personal',tags:['welcome','blog'],status:'published',created_at:'2026-09-12',cover_url:''}],projects:[{id:1,name:'ThaiDuong Studio',description:'Browser-based creative development and multimedia experiments.',project_url:'',github_url:'',thumbnail_url:'',technologies:['HTML','CSS','JavaScript'],status:'Active',featured:true,hidden:false,sort_order:1}],media:[]};
function clone(v){return JSON.parse(JSON.stringify(v));}
function load(){try{const s=JSON.parse(localStorage.getItem(KEY));return s&&s.profile?merge(clone(defaults),s):clone(defaults)}catch{return clone(defaults)}}
function merge(a,b){if(!b||typeof b!=='object')return a;Object.keys(b).forEach(k=>{if(b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k])&&a[k])a[k]=merge(a[k],b[k]);else a[k]=b[k]});return a}
function save(state){localStorage.setItem(KEY,JSON.stringify(state));return state}
window.TDStore={KEY,defaults,load,save,clone};
})();
