$('body > table:nth-child(3) > tbody > tr > td:nth-child(5)').each(function (id, td) {
    var ancor = $('<a class="subscribe-btn">Subscribe</a>');
    ancor.click(function () {
        var btn = $(this);
        if (!btn.hasClass('tracking')) {
            var url         = 'https://deploy.timedoctor.com' + $(td).find('p > a').attr('href');
            var branch_name = $(td).parent().find('td:nth-child(2) > p > a').text();
            chrome.runtime.sendMessage({action: "start_tracking", 'url': url, 'branch_name': branch_name}, function (response) {
                if (response.status === 'started') {
                    btn.text('tracking').attr('class', 'tracking');
                }
                console.log(response.status);
            });
        }
    });
    var url = 'https://deploy.timedoctor.com' + $(td).find('p > a').attr('href');
    chrome.storage.local.get('urls', function (items) {
        if (items['urls'] !== undefined)
            items = items['urls'];
        if (items[url] !== undefined && items[url]['status'] == 'started') {
            ancor.text('tracking').attr('class', 'tracking');
            chrome.runtime.sendMessage({action: "check_status", 'url': url});
        }
    });
    $(td).append(ancor);
});