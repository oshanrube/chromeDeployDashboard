var loading = [];
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action === "start_tracking") {
            console.log('start tracking ' + request.url);
            loadFeed(request.url);

            chrome.storage.local.get('urls', function (items) {
                if (items['urls'] !== undefined)
                    items = items['urls'];
                items[request.url]                = {};
                items[request.url]['status']      = 'started';
                items[request.url]['branch_name'] = request.branch_name;
                chrome.storage.local.set({'urls': items}, function () {
                    // Notify that we saved.
                    console.log('url saved');
                });
            });
            sendResponse({status: "started"});
        } else if (request.action === "check_status") {
            loadFeed(request.url);
        }
    });

var notifyCompleted = function (status) {
    if (Notification.permission !== "granted")
        Notification.requestPermission();
    else {
        var icon = chrome.extension.getURL('assets/states/cancelled.png');
        switch (status) {
            case "failed":
                icon = chrome.extension.getURL('assets/states/failed.jpg');
                break;
            case "success":
                icon = chrome.extension.getURL('assets/states/success.png');
                break;
            case "cancelled":
                icon = chrome.extension.getURL('assets/states/cancelled.png');
                break;
        }
        var notification = new Notification('Deployment completed', {
            icon: icon,
            body: "deployment " + status + "!"
        });

        notification.onclick = function () {
            chrome.tabs.create({url: chrome.extension.getURL('index.html')});
        };
    }
};
var isComplete      = function (response) {
    return response.search("Finished") > 0 || response.search("Received kill signal") > 0;
};
var getStatus       = function (response) {
    if (response.search("Failed build") > 0) {
        return "failed";
    }
    else if (response.search("This server is now online") > 0) {
        return "success";
    }
    else if (response.search("Received kill signal") > 0) {
        return "cancelled";
    }
};
var loadFeed        = function (url) {
    var loadUrl = function () {
        var xhr = new XMLHttpRequest();

        xhr.onload = function (e) {
            //document.getElementById('feed').innerHTML = e.target.response;
            //window.scrollTo(0, document.body.scrollHeight);
            var response = e.target.response.slice(-2000);
            chrome.storage.local.get('urls', function (items) {
                if (items['urls'] !== undefined)
                    items = items['urls'];
                if (items[url] !== undefined) {
                    items[url]['response'] = response;
                    chrome.storage.local.set({'urls': items}, function () {
                        // Notify that we saved.
                        console.log('response saved');
                    });
                }
                //
                if (isComplete(response)) {
                    console.log('link complete');
                    items[url] = undefined;
                    chrome.storage.local.set({'urls': items}, function () {
                        console.log('link removed');
                    });
                    notifyCompleted(getStatus(response));
                } else {
                    setTimeout(loadUrl, 2000);
                }
            });
        };

        xhr.open('GET', url + '/');
        xhr.send(null);
    };

    if (loading[url] === undefined) {
        loading[url] = true;
        loadUrl();
    }
    return false;
};
// request permission on page load
document.addEventListener('DOMContentLoaded', function () {
    if (!Notification) {
        alert('Desktop notifications not available in your browser. Try Chromium.');
        return;
    }

    if (Notification.permission !== "granted")
        Notification.requestPermission();
});
chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.create({url: chrome.extension.getURL('index.html')});
});