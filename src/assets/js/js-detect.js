/**
 * Detect if user has JS enabled
 * Replaces `no-js` with `js`
 */
var html = document.documentElement;
if(html.className === 'no-js') {
    html.className = html.className.replace('no-js', 'js');
}
