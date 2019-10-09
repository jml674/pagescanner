'use strict';
$($=> {
    $('[translate]').each((i, elem)=> {
        let $elem = $(elem);
        $elem.text(chrome.i18n.getMessage($elem.text()));
    });
});
