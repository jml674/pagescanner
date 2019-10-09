# Pagescanner
Pagescanner is a chrome extension which demonstrates an optimal solution to a classic issue: detect in real-time the presence of certain words or expressions in ALL web pages without killing browser responsiveness. It relies on mutationObservers and intersectionObservers for an optimized page scan.


The included french dictionary contains only rugby and football terms (go to www.lequipe.fr and check the result!)

### Building PRODUCTION  versions of the extension
`
gulp dist
`
chrome: will generate zip file you can drag and drop in your chrome://extensions page.
