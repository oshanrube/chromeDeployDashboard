var loadFeeds = function () {
    $('table tbody tr').remove();
    chrome.storage.local.get('urls', function (items) {
        for (url in items['urls']) {
            var response = items['urls'][url]['response'].replace(/\n/g, "<br />");
            $('table tbody').append($('<tr><th>' + items['urls'][url]['branch_name'] + '</th></tr>'));
            $('table tbody').append($('<tr><td>' + response + '</td></tr>'));
        }
    });
};
loadFeeds();

chrome.storage.onChanged.addListener(function () {
    loadFeeds();
});