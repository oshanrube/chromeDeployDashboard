var loadFeeds = function () {
    $('table tbody tr').remove();
    chrome.storage.local.get('urls', function (items) {
        for (url in items['urls']) {
            if (items['urls'][url]['response'] != undefined) {
                var response = items['urls'][url]['response'].replace(/\n/g, "<br />");
            } else {
                var response = "";
            }
            console.log(items['urls'][url]);
            var branch_name = items['urls'][url]['branch_name'];
            $('table tbody').append($('<tr id="'+branch_name+'"><th>' + items['urls'][url]['branch_name'] + '</th></tr>'));
            $('table tbody').append($('<tr id="'+branch_name+'_response"><td>' + response + '</td></tr>'));
            chrome.runtime.sendMessage({action: "check_status", 'url': url});
        }
    });
};
loadFeeds();

chrome.storage.onChanged.addListener(function () {
    loadFeeds();
});