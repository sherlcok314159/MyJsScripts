// ==UserScript==
// @name         Enhanced BibTeX Fetcher with Filtering and Highlighting
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Fetch and copy BibTeX citations from academic papers, with advanced filtering and highlighting
// @author       Apricity
// @match        https://scholar.google.com/*
// @match        https://scholar.googleusercontent.com/scholar.bib*
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';

    function copyToClipboard(text) {
        GM_setClipboard(text, "text");
    }

    function endsWithAny(strings, url) {
        for (var i = 0; i < strings.length; i++) {
            if (url.endsWith(strings[i])) {
                return true;
            }
        }
        return false;
    }

    function containsAny(strings, url) {
        for (var i = 0; i < strings.length; i++) {
            if (url.includes(strings[i])) {
                return true;
            }
        }
        return false;
    }

    function processEntries() {
        // Select all entries
        var entries = document.querySelectorAll('.gs_ri');

        // Iterate over each entry
        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];

            // Select the description element
            var description = entry.querySelector('.gs_a');

            // If the description exists and the URL ends with .edu, .de, .jp, or contains amazonaws, hide the entry
            if (description && (endsWithAny(['.edu', '.de', '.jp'], description.innerText) || containsAny(['amazonaws', 'thetalkingmachines'], description.innerText))) {
                entry.parentNode.style.display = 'none';
            }

            // If the description exists and the URL contains aclanthology.org or openreview.net, highlight the entry
            if (description && containsAny(['aclanthology.org', 'openreview.net'], description.innerText)) {
                entry.parentNode.style.backgroundColor = '#e4efff';
            }
        }
    }

    if (window.location.href.includes("scholar.bib")) {
        // Wait for the BibTeX text to load, then copy it
        setTimeout(function() {
            var bibtexText = document.body.innerText;
            if (bibtexText) {
                copyToClipboard(bibtexText);
                alert('BibTeX citation copied to clipboard!');
            }
        }, 2000); // Adjust timing as needed
        return;
    }

    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (!mutation.addedNodes) return

            for (var i = 0; i < mutation.addedNodes.length; i++) {
                var node = mutation.addedNodes[i]
                var bibtexButton = node.querySelector('#gs_citi a.gs_citi');
                if (bibtexButton) {
                    window.location.href = bibtexButton.href;
                    observer.disconnect();
                    return;
                }
            }
        })
    })

    observer.observe(document.body, {
        childList: true,
        subtree: true
    })

    processEntries();

    var processObserver = new MutationObserver(processEntries);
    processObserver.observe(document.body, { childList: true, subtree: true });
})();
