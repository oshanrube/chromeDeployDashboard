console.log('adding demo user');
$('#nameField').val('testing');
var milliseconds = new Date().getTime();
$('input#email').val('oshan+' + milliseconds + '@staff.com');
$('input#password').val('testing');

$('#continue').click();