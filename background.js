var loading  = [];
var timeouts = [];
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action === "start_tracking") {
            console.log('start tracking ', request);

            var deployment            = {};
            deployment['url']         = request.url;
            deployment['status']      = 'started';
            deployment['branch_name'] = request.branch_name;
            deployment['date']        = request.date;
            deployment['commit']      = request.commit;
            saveState(request.url, deployment, function (deployment) {
                loadFeed(deployment.url);
            });
            sendResponse({status: "started"});
        } else if (request.action === 'delete_url') {
            console.log('request.action', request);
            deleteDeployment(request.url);
        } else if (request.action === "check_status") {
            console.log('checking up on ', request.url);
            loadFeed(request.url);
        }
//        } else if (request.action === "close_url") {
//            console.log('closing the url ', request.url);
//            chrome.storage.local.get('urls', function (items) {
//                if (items['urls'] !== undefined)
//                    items = items['urls'];
//                items[request.url]['status'] = 'closed';
//                chrome.storage.local.set({'urls': items}, function () {
//                    console.log('link removed');
//                });
//            });
//        }
    });

var notifyCompleted = function (status, item) {
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
            case "timeout":
                icon = chrome.extension.getURL('assets/states/cancelled.png');
                break;
            default:
                console.log('invalid status:' + status);
        }
        var notification = new Notification('Deployment completed', {
            icon: icon,
            body: "deployment [" + item['branch_name'] + "] " + status + "!"
        });

        notification.onclick = function () {
            chrome.tabs.create({url: chrome.extension.getURL('index.html')});
        };
    }
};
var isComplete      = function (response) {
    return response.search("Failed build") > 0 ||
        response.search("Deployment FAILED") > 0 ||
        response.search("Deployment successful!") > 0 ||
        response.search("Received kill signal") > 0 ||
        response.search("another deployment just started") > 0 ||
        response.search("was not found on this server.") > 0;
};
var getStatus       = function (response) {
    if (response.search("Failed build") > 0 || response.search("Deployment FAILED") > 0) {
        return "failed";
    } else if (response.search("This server is now online") > 0 || response.search("Deployment successful") > 0) {
        return "success";
    } else if (response.search("Received kill signal") > 0 || response.search("another deployment just started") > 0 || response.search("was not found on this server.") > 0) {
        return "cancelled";
    } else {
        console.log('no status found', response);
    }
};
var loadFeed        = function (url) {
    var loadUrl = function (url) {
        console.log('load url', url);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url + '/', false);
        xhr.onreadystatechange = function (e) {
            console.log('done loading', url);
            if (xhr.readyState === 4) {
                var deployment = {};
                if (xhr.status === 200) {
                    var response = e.target.response.slice(-2000);
                    if (isComplete(response)) {
                        console.log('link complete');
                        deployment.dedployment_status = getStatus(response);
                        getDeployment(url, function (deployment) {
                            notifyCompleted(getStatus(response), deployment);
                        });
                        deployment.status = 'closed';
                    } else {
                        setTimeout(function () {loadUrl(url)}, 2000);
                    }

                    deployment.response = response;
                    saveState(url, deployment);
                } else {
                    console.log("timeout:" + url);
                    loading[url] = false;
                    if (timeouts[url] === undefined) {
                        timeouts[url] = 0;
                    } else {
                        timeouts[url]++;
                    }
                    if (timeouts[url] > 10) {
                        getDeployment(url, function (deployment) {
                            notifyCompleted("timeout", deployment);
                        });
                        deployment.dedployment_status = 'timeout';
                        deployment.status             = 'closed';
                        saveState(url, deployment);
                    } else {
                        setTimeout(function () {loadUrl(url)}, 2000);
                    }
                }
            } else {
                console.log('readyState', xhr.readyState);
            }
        };
        xhr.send(null);
    };

    if (loading[url] === undefined || loading[url] === false) {
        loading[url] = true;
        loadUrl(url);
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

var saveState = function (url, deployment, exec) {
    chrome.storage.local.get('urls', function (items) {
        if (items['urls'] !== undefined)
            items = items['urls'];

        if (items[url] !== undefined) {
            for (var key in deployment) {
                items[url][key] = deployment[key];
            }

        } else {
            items[url] = deployment;
        }
        chrome.storage.local.set({'urls': items}, function () {
            console.log('data updated');
            if (exec) {
                exec(deployment);
            }
        });
    });
};

var getDeployment = function (url, exec) {
    chrome.storage.local.get('urls', function (items) {
        if (items['urls'] !== undefined)
            items = items['urls'];

        if (items[url] !== undefined) {
            exec(items[url]);
        }
    });
};

var deleteDeployment = function (url, exec) {
    chrome.storage.local.get('urls', function (items) {
        if (items['urls'] !== undefined)
            items = items['urls'];

        if (items[url] !== undefined) {
            delete items[url];
        }
        chrome.storage.local.set({'urls': items}, function () {
            console.log('data updated');
            if (exec) {
                exec(deployment);
            }
        });
    });
};