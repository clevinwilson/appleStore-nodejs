

//  hamburger menu for small devices
function openNav() {
    closesmBag();
    document.getElementById("mySidenav").style.height = "100%";
    document.getElementById("closebtn").onclick = closeNav;
    document.getElementById('closebtn').innerHTML = "&times;"
    document.getElementById("mySidenav").style.opacity = "1.5";
    document.getElementById("mySidenav").style.backgroundColor = "black";

}

/* Set the width of the side navigation to 0 */
function closeNav() {
    document.getElementById("mySidenav").style.height = "0";
    document.getElementById("closebtn").onclick = openNav;
    document.getElementById('closebtn').innerHTML = "="
    document.getElementById("mySidenav").style.opacity = "0.8";
}

// Shop and Learn
function moreItems() {
    var items = document.getElementById('list-1')
    items.style.display = 'block'
    var icon = document.getElementById('icon-1')
    icon.style.transition = '0.41s'
    icon.style.transform = 'rotate(46deg)'
    var icon = document.getElementById('column-1')
    icon.onclick = listHide;

}

function listHide() {
    var item = document.getElementById('list-1')
    item.style.display = 'none'
    var icon = document.getElementById('icon-1')
    icon.style.transition = '0.3s'
    icon.style.transform = 'rotate(0deg)'
    var icon = document.getElementById('column-1')
    icon.onclick = moreItems;
}

//Bag

function openBag() {
    document.getElementById('bag').onclick = closeBag;
    document.getElementById("navbar").style.opacity = "1.5";
    document.getElementById("dropdown-content").style.display = "block";
}
function closeBag() {
    document.getElementById('bag').onclick = openBag;
    document.getElementById("navbar").style.opacity = "0.8";
    document.getElementById("dropdown-content").style.display = "none";

}
//bag sm devices

function opensmBag() {
    closeNav();
    document.getElementById('sm-bag').onclick = closesmBag;
    document.getElementById("dropdown-content-sm").style.display = "block";
}
function closesmBag() {
    document.getElementById('sm-bag').onclick = opensmBag;
    document.getElementById("dropdown-content-sm").style.display = "none";

}



