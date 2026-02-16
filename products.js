
const products=[
{name:'PSN Accounts',price:5,img:'assets/psn.svg'},
{name:'Epic Accounts',price:4,img:'assets/epic.svg'},
{name:'Full Access',price:7,img:'assets/full.svg'}
];
const grid=document.getElementById('products');
products.forEach(p=>{
grid.innerHTML+=`<div class='card'><img src='${p.img}' width='100%'><h2>${p.name}</h2>
<p>$${p.price}</p><button class='btn'>Buy</button></div>`
});
