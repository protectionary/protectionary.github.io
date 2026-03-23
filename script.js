setTimeout(() => {
    document.getElementById('opening-overlay').style.display = 'none';
    document.body.classList.add('motion-blur-active');
    setTimeout(() => {
        document.body.classList.remove('motion-blur-active');
        document.getElementById('main-bio').style.opacity = '1';
    }, 300);
}, 2000);

document.oncontextmenu = (e) => e.preventDefault();
document.onkeydown = (e) => {
    if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && e.keyCode == 73)) return false;
}
