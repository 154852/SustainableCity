var cover = document.getElementById('cover');

var checkBoxes = document.getElementsByClassName('checkBox');
for (var i = 0; i < checkBoxes.length; i++) {
    var box = checkBoxes[i];
    if (box.hasAttribute('enabled') && box.getAttribute('enabled') == 'true') {
        box.setAttribute('style', 'color: black');
        options[box.getAttribute('optionId')] = true;
    } else options[box.getAttribute('optionId')] = false;

    box.addEventListener('click', function(event) {
        if (this.getAttribute('style') == 'color: black') {
            this.setAttribute('style', 'color: white');
            options[this.getAttribute('optionId')] = false;
        } else {
            this.setAttribute('style', 'color: black');
            options[this.getAttribute('optionId')] = true;
        }
    });
}

var sliders = document.getElementsByClassName('slider'),
    labels = document.getElementsByClassName('indicator');
for (var i = 0; i < sliders.length; i++) {
    var slider = sliders[i];
    console.log(slider);
    options[slider.getAttribute('optionId')] = slider.value;

    slider.addEventListener('input', function(event) {
        options[this.getAttribute('optionId')] = this.value;
        for (var l = 0; l < labels.length; l++) {
            if (labels[l].getAttribute('optionId') == this.getAttribute('optionId')) {
                labels[l].innerHTML = this.value;
                return;
            }
        }
    });
}

document.getElementById('enter').addEventListener('click', function() {
    var href = 'enter.html?',
        items = [];
    for (var key in options) {
        items.push(key + '=' + options[key]);
    }
    document.location.href = href + items.join('&');
})