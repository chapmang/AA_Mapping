var View = {};

var mask = document.getElementById("mask");
var htmlBody = document.getElementsByTagName("body");



// If mask is clicked
mask.addEventListener('click', function (e) {
    e.preventDefault();
    mask.style.display = 'none'
    //$('.window').detach();
});

// If the browser window is re-sized with Modal open
$(window).resize(function () {
    var box = document.getElementsByClassName('modalBox');
    //Get the screen height and width
    var maskHeight = $(document).height();
    var maskWidth = $(window).width();
    //Set height and width to mask to fill up the whole screen
    $('#mask').css({'width':maskWidth,'height':maskHeight});
    //Get the window height and width
    var winH = $(window).height();
    var winW = $(window).width();
    //Set the popup window to center
    box.css('top',  winH/3 - box.height()/2);
    box.css('left', winW/2 - box.width()/2);
});


View.modal = function (e){
    //Get the id of dialog box 
    //should have been inserted before the mask element
    var id = mask.previousSibling.id;
    //Get the screen height and width
    var body = document.body,
        html = document.documentElement;

    var maskHeight = Math.max( body.scrollHeight, body.offsetHeight, 
                       html.clientHeight, html.scrollHeight, html.offsetHeight );
    
    var maskWidth = Math.max( body.scrollWidth, body.offsetWidth, 
                       html.clientWidth, html.scrollWidth, html.offsetWidth );
    
    //Set height and width to mask to fill up the whole screen
    mask.style.width = maskWidth+"px";
    mask.style.height = maskHeight+"px";
    mask.style.display = 'block';

    //Set the popup window to center 
    var modalBox = document.getElementById(id);
    modalBox.style.top = maskHeight/3-modalBox.offsetHeight/2 + "px";
    modalBox.style.left = html.clientWidth/3-modalBox.offsetWidth/2 + "px";

    modalBox.style.display = 'block';
};

/**
 * Boilerplate for building a Modal box that is then
 * inserted before the mask element in the page 
 */
View.renderDialog = function (dialog) {

    var dialogBox = document.createElement("div");
    dialogBox.id = dialog.dialogID;
    dialogBox.className = dialog.dialogClass+" modalBox";

    if (dialog.dialogClose) {
        var dialogClose = document.createElement("div");
        dialogClose.className += ' close';
        dialogClose.innerHTML = "&times;";
        dialogBox.appendChild(dialogClose);
    }

    if (dialog.dialogHeader) {
        var dialogHeader = document.createElement("h2");
        dialogHeader.innerHTML = dialog.dialogHeader;
        dialogBox.appendChild(dialogHeader);
    }

    if (dialog.form) {
        var dialogForm = document.createElement("div");
        dialogForm.className += ' fill';
        dialogForm.innerHTML = dialog.dialogForm;
        dialogBox.appendChild(dialogForm);
    }

    if (dialog.dialogContent) {
        var dialogContent = document.createElement("div");
        if (typeof dialog.dialogContentID != 'undefined') {
            dialogContent.id = dialog.dialogContentID;
        } else {
            dialogContent.id = 'dialogContentID';
        }
        if (typeof dialog.dialogContentClass != 'undefined') {
            dialogContent.className = dialog.dialogContentClass;
        } else {
            dialogContent.className = 'dialogContentClass';
        }
        dialogContent.innerHTML = dialog.dialogContent;
        dialogBox.appendChild(dialogContent);
    }
    
    var closeButton = document.createElement("div");
    closeButton.className += 'rightAlign';
    closeButton.innerHTML = "<button id='cancelModal' class='btn btn-mini cancel'>Close</button>";
    dialogBox.appendChild(closeButton);
    document.body.insertBefore(dialogBox, mask);
    
    var cancelModal = document.getElementById("cancelModal");
    cancelModal.addEventListener('click', function (e){
        e.preventDefault();
        mask.style.display = 'none';
        dialogBox.remove();
        //$('.window').detach();
    });
};


