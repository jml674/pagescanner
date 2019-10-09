const URLS = {
  serverUrl:"https://go.pagescanner.com/",
  install:new Map([["de-de","browser-plugin-install-de"],
                            ["en-en","browser-plugin-install-en"]]),
  uninstall:new Map([["de-de","browser-plugin-uninstall-de"],
                            ["en-en","browser-plugin-uninstall-en"]])
};
// segment key
var YOUR_WRITE_KEY="";
//@if env!='production'
YOUR_WRITE_KEY="";
//@endif
