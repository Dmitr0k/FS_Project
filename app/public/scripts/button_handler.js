var exitButton = document.getElementById('exitFromProfile'); 
exitButton.onclick = ()=> { 
localStorage.setItem('isUser', 'false'); 
localStorage.removeItem('login');
document.cookie = 'ShopSocksToken=""';
location.reload(true);
location.pathname = '/';
}