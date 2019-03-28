var loadFeeds = function () {
    chrome.storage.local.get('urls', function (items) {
        $('div.card').removeClass('active');
        $('div#recently_deployed').html('');

        delete items['urls']['undefined'];
        for (url in items['urls']) {
            var deployment = items['urls'][url];

            if (items['urls'][url]['response'] != undefined) {
                var response = items['urls'][url]['response'].replace(/\n/g, "<br />");
            } else {
                var response = "";
            }
            var branch_name = deployment.branch_name;
            var id          = url.match(/\/([0-9:.-]*)$/)[1]
                .replace(new RegExp(':', 'g'), '')
                .replace(new RegExp('-', 'g'), '')
                .replace(new RegExp(/\./, 'g'), '');

            if (items['urls'][url]['status'] === "closed") {
                $('#id-' + id).remove();
                var deployment_status = 'secondary';
                if (deployment.dedployment_status === "success") {
                    deployment_status = "success";
                } else if (deployment.dedployment_status === "failed") {
                    deployment_status = "danger";
                }

                var card = '<span class="badge badge-' + deployment_status + '">' + branch_name + "-" + deployment.date + '<a href="' + url + '" class="pull-right closeBtn">x</a>' + '</span>';
                card     = $(card).addClass('active');
                card.find('a.closeBtn').click(function (e) {
                    chrome.runtime.sendMessage({action: "delete_url", 'url': $(this).attr('href')});
                    e.preventDefault();
                });
                $('div#recently_deployed').append(card);
            } else if ($('#id-' + id).length > 0) {
                //check if the card already exists

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
            if (deployment.status != "closed") {
                console.log('check status on', url);
                chrome.runtime.sendMessage({action: "check_status", 'url': url});
            }
        }
        $.each($('div.card'), function (key, value) {
            console.log(key + ": " + $(value).hasClass('active'));
        });
    });
};
$(document).ready(loadFeeds);
chrome.storage.onChanged.addListener(function (changes, areaName) {
    console.log('loading feeds');
    loadFeeds();
});
//var url = 'https://deploy.timedoctor.com' + $(td).find('p > a').attr('href');
//chrome.storage.local.get('urls', function (items) {
//    if (items['urls'] !== undefined)
//        items = items['urls'];
//    if (items[url] !== undefined && items[url]['status'] == 'started') {
//        ancor.text('tracking').attr('class', 'tracking');
//        chrome.runtime.sendMessage({action: "check_status", 'url': url});
//    }
//});
