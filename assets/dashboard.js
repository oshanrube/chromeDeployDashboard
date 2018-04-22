var loadFeeds = function () {
    chrome.storage.local.get('urls', function (items) {
        $('div.card').removeClass('active');
        for (url in items['urls']) {
            if (items['urls'][url]['response'] != undefined) {
                var response = items['urls'][url]['response'].replace(/\n/g, "<br />");
            } else {
                var response = "";
            }
            var matches     = url.match(/\/([0-9]+\-[0-9]+\-[0-9]+)\/(.*)\/([0-9:.-]*)\./);
            var branch_name = matches[2] + '-' + matches[1] + matches[3];
            var id          = url.match(/\/([0-9:.-]*)$/)[1]
                .replace(new RegExp(':', 'g'), '')
                .replace(new RegExp('-', 'g'), '')
                .replace(new RegExp(/\./, 'g'), '');
            //check if the card already exists
            if ($('#id-' + id).length > 0) {
                //replace response
                $('#id-' + id + ' div.card-body').html(response).parents('div.card').addClass('active');
            } else {
                var card = '<div class="card" id="id-' + id + '">' +
                    '   <div class="card-header" id="headingOne">' +
                    '       <h5 class="mb-0" data-url="' + url + '">' +
                    '           <button class="btn btn-link" data-toggle="collapse" data-target="#collapse' + id + '" aria-expanded="true" aria-controls="collapseOne">' + branch_name + '</button>' +
                    '           <button class="pull-right refreshBtn">refresh</button>' +
                    '           <button class="pull-right closeBtn">close</button>' +
                    '       </h5>' +
                    '   </div>' +
                    '   <div id="collapse' + id + '" class="collapse show" aria-labelledby="headingOne" data-parent="#accordion">\n' +
                    '       <div class="card-body">' + response + '</div>\n' +
                    '   </div>\n' +
                    '</div>';
                card     = $(card).addClass('active');
                card.find('button.refreshBtn').click(function () {
                    chrome.runtime.sendMessage({action: "check_status", 'url': $(this).parent().data('url')});
                });
                card.find('button.closeBtn').click(function () {

                    chrome.runtime.sendMessage({action: "close_url", 'url': $(this).parent().data('url')});
                });
                $('div#accordion').append(card);
            }
            console.log('check status on', url);
            chrome.runtime.sendMessage({action: "check_status", 'url': url});
        }
        $.each($('div.card'), function (key, value) {
            if(!$(value).hasClass('active'))
            {
                $(value).remove();
            }
        });
    });
};
$(document).ready(loadFeeds);
chrome.storage.onChanged.addListener(function (changes, areaName) {
    console.log('loading feeds');
    loadFeeds();
});