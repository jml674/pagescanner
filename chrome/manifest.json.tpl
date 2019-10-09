{
  "name": "<%= name %>",
  "version": "<%= version %>",
  "manifest_version": 2,
  "description": "<%= description %>",
  "homepage_url": "<%= homepage_url %>",
  "default_locale" : "en",
<!-- @if browser='chrome' && env!='production'-->
  <%= addon_key_section %>
<!-- @endif -->
<!-- @if browserversion='ff46' -->
  "applications": {
     "gecko": {
       "id": "<%= gecko_id %>"
     }
  },
<!-- @endif -->
  "icons": {
      "16": "images/icon16.png",
      "48": "images/icon48.png",
      "128": "images/icon128.png"
  },
  "background": {
<!-- @if browserversion!='ff46' -->
    "persistent": true,
<!-- @endif -->
    "page": "background.html"
  },
  "content_scripts": [
    {
      "matches": ["https://*/*", "http://*/*"],
      "js": ["vendor/jquery.js","vendor/bootstrap.bundle.min.js","vendor/jqueryextend.js","js/scankeywords.js"],
      "css":["css/jquery-ui.css","css/bootstrap.min.css","css/page.css","css/popover.css"],
      "run_at": "document_start",
      "all_frames": false
    }
  ],
  "browser_action": {
    "default_icon": "images/icon48.png",
    "default_title": "Pagescanner",
    "default_popup": "dialogs/popup.html"
  },
  "permissions": [
        "tabs",
        "storage",
        "notifications",
        "https://tvsurftv.com/*",
        "https://storage.googleapis.com/*"
  ],
  "web_accessible_resources": [
    "images/*",
    "html/*"
  ],
  "content_security_policy": "script-src 'unsafe-eval' 'self' https://cdn.segment.com https://js.intercomcdn.com/ https://widget.intercom.io/widget/ https://www.google-analytics.com/; object-src 'self'"

}
