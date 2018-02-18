var loadFeeds = function () {
    chrome.storage.local.get('urls', function (items) {
        for (url in items['urls']) {
            if (items['urls'][url]['response'] != undefined) {
                var response = items['urls'][url]['response'].replace(/\n/g, "<br />");
            } else {
                var response = "";
            }
            console.log(items['urls'][url]);
            var matches     = url.match(/\/([0-9]+\-[0-9]+\-[0-9]+)\/(.*)\/([0-9:.-]*)\./);
            var branch_name = matches[2] + '-' + matches[1] + matches[3];
            var id          = url.match(/\/([0-9:.-]*)$/)[1]
                .replace(new RegExp(':', 'g'), '')
                .replace(new RegExp('-', 'g'), '')
                .replace(new RegExp(/\./, 'g'), '');
            //check if the card already exists
            if ($('#id-' + id).length > 0) {
                //replace response
                $('#id-' + id + ' div.card-body').html(response);
            } else {
                var card = '<div class="card" id="id-' + id + '">' +
                    '   <div class="card-header" id="headingOne">' +
                    '       <h5 class="mb-0">' +
                    '           <button class="btn btn-link" data-toggle="collapse" data-target="#collapse' + id + '" aria-expanded="true" aria-controls="collapseOne">' + branch_name + '</button>' +
                    '           <button class="refreshBtn">refresh</button>' +
                    '       </h5>' +
                    '   </div>' +
                    '   <div id="collapse' + id + '" class="collapse show" aria-labelledby="headingOne" data-parent="#accordion">\n' +
                    '       <div class="card-body">' + response + '</div>\n' +
                    '   </div>\n' +
                    '</div>';
                card     = $(card);
                card.find('button.refreshBtn').click(function () {
                    chrome.runtime.sendMessage({action: "check_status", 'url': url});
                });
                $('div#accordion').append(card);
            }

            chrome.runtime.sendMessage({action: "check_status", 'url': url});
        }
    });
};
$(document).ready(function () {
    loadFeeds();
    chrome.storage.local.get('urls', function (items) {
        if (items['urls'] !== undefined)
            items = items['urls'];
        if (items[url] !== undefined && items[url]['status'] == 'started') {
            chrome.runtime.sendMessage({action: "check_status", 'url': url});
        }
    });
});

chrome.storage.onChanged.addListener(function (changes, areaName) {
    console.log(changes, areaName);
    loadFeeds();
});