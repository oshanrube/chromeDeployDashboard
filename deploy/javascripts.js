$('body > table:nth-child(3) > tbody > tr > td:nth-child(5)').each(function (id, td) {
    var ancor = $('<a class="subscribe-btn">Subscribe</a>');
    ancor.click(function () {
        var btn = $(this);
        td      = btn.parent();
        if (!btn.hasClass('tracking')) {
            var url         = 'https://deploy.timedoctor.com' + $(td).find('p > a').attr('href');
            var branch_name = $(td).parent().find('td:nth-child(2) > p > a').text().trim();
            var commit      = $(td).parent().next().next().text().trim();
            var date        = $(td).parent().find('td:nth-child(1)').text().trim();
            chrome.runtime.sendMessage({action: "start_tracking", 'url': url, 'branch_name': branch_name, date: date, commit: commit}, function (response) {
                if (response.status === 'started') {
                    btn.text('tracking').attr('class', 'tracking');
                }
                console.log(response.status);
            });
        }
    });
    $(td).append(ancor);
});