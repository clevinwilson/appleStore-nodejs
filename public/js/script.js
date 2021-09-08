function screenSize() {
    if (screen.width < 735) {
       
        document.getElementById("myImg").src = "images/hero_ipad_pro_non_avail__fcrsmhs4b7ma_small_2x.jpg";
        var image = document.getElementById("myImg")
        image.style.objectFit = "cover";
        image.style.width = '324px';
        image.style.height = '365px';

        var image = document.getElementById("banner-two")
        image.src = "images/iphone_12_updated__jepm2xpxncuy_small_2x.jpg";

        var image = document.getElementById("banner-three").src = "images/hero_imac__dqh65mwjj04m_small_2x.jpg";

    } else {
        document.getElementById("dropdown-content-sm").style.display = "none";
        var image = document.getElementById("myImg")
        image.src = "images/index-banner.jpg";
        image.style.objectFit = "cover";
        image.style.width = '847px';
        image.style.height = '394px';


        var image = document.getElementById("banner-two")
        image.src = "images/iphone_12_updated__jepm2xpxncuy_large_2x.jpg";

        var image = document.getElementById("banner-three").src = "images/hero_imac__dqh65mwjj04m_large.jpg";

    }
}
if (screen.width < 735) {
    document.getElementById("myImg").src = "images/hero_ipad_pro_non_avail__fcrsmhs4b7ma_small_2x.jpg";
    var image = document.getElementById("myImg")
    image.style.objectFit = "cover";
    image.style.width = '324px';
    image.style.height = '365px';

    var image = document.getElementById("banner-two")
    image.src = "images/iphone_12_updated__jepm2xpxncuy_small_2x.jpg";

    var image = document.getElementById("banner-three").src = "images/hero_imac__dqh65mwjj04m_small_2x.jpg";

} else {
    var image = document.getElementById("myImg")
    document.getElementById("myImg").src = "images/index-banner.jpg";
    image.style.objectFit = "cover";
    image.style.width = '847px';
    image.style.height = '394px';


    var image = document.getElementById("banner-two")
    image.src = "images/iphone_12_updated__jepm2xpxncuy_large_2x.jpg";

    var image = document.getElementById("banner-three").src = "images/hero_imac__dqh65mwjj04m_large.jpg";

}

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



