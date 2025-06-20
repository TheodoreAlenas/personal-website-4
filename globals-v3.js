// Copyright (c) 2024 Dimakopoulos Theodoros <dimakopt732@gmail.com>
// See LICENSE.
// Search for the string "//---" in this file to jump to sections

function toBeCalledAtTheBottom() {
    colorScheme.init()
    window.onload = formatPage
}

//--- Color Scheme

const colorScheme = {

    localStoragePrefix: 'portfolioColorScheme',

    init: function() {

        // If the browser settings changed, consider the current settings.
        // Otherwise, consider the theme that was used the previous time on the site.

        const prefersDark  = window.matchMedia('(prefers-color-scheme: dark)').matches
        const prefersContr = window.matchMedia('(prefers-contrast: more)').matches
        const preferredNow = prefersDark ? (prefersContr ? 'contr' : 'dark') : 'light'

        const p = this.localStoragePrefix
        const lastPreferred = localStorage.getItem(p + 'LastPreferred')
        const last = localStorage.getItem(p + 'LastUsed')
        localStorage.setItem(p + 'LastPreferred', preferredNow)

        if (lastPreferred === preferredNow && last)
            this.set(last)
        else
            this.set(preferredNow)
    },

    set: function(value) {

        // There's <html (1) style=... (2) data-sch=...> and (3) local storage.
        // Style for browser defaults, data-sch for CSS selectors.

        let lightDark = value
        if (value === 'contr') lightDark = 'dark'
        const html = document.querySelector('html')
        html.style.colorScheme = lightDark
        html.setAttribute('data-sch', value)
        localStorage.setItem(this.localStoragePrefix + 'LastUsed', value)
    },

    get: function() {
        return document.querySelector("html").getAttribute("data-sch")
    }
}

function formatPage() {

    //--- Library for rendering components

    function c(tag, about, children) {
        const elem = document.createElement(tag)
        for (p in about) {
            if (typeof(p) !== 'string' || typeof(about[p]) !== 'string') {
                throw Error(about)
            }
            if (p === 'c') elem.className = about.c
            else elem.setAttribute(p, about[p])
        }
        for (i in children) elem.appendChild(children[i])
        return elem
    }
    function t(text) {
        return document.createTextNode(text)
    }

    // couldError("title", createTitle) -> either that title or error element

    function couldError(intent, func) {
        try {
            const res = func()
            if (!res) throw Error("forgot to return the element, probably")
            return res
        }
        catch (err) {
            console.log(intent, err)
            return c('code', {}, [t("[ERROR] " + intent)])
        }
    }

    //--- Components

    function functionCalledAtTheBottom() {
        formatLinks()
        formatThemePicker()
        formatPdfLink()
        formatAvatar()
        formatKeymouthImages()
        formatFourScreenshots()
        formatLinksAtBottom()
    }

    // <u at=github></u>  ->  <a href=https://github.com></a>

    function formatLinks() {
        for (let unused = 0; unused < 12345; unused++) {
            // You can't get a list of HTML elements and replace them,
            // it seems that Firefox finds them lazily and somehow it
            // skips every other one.
            const u = document.getElementsByTagName('u')[0]
            if (!u) return
            const which = u.getAttribute('at')
            const href = linkHrefs[which]
            if (href === undefined) {
                console.error(`tried to get link called "${which}"`)
                u.replaceWith(c('span', {}, [
                    t(u.textContent + ' (broken link)')]))
            }
            else {
                u.replaceWith(c('a', {href: href}, [t(u.textContent)]))
            }            
        }
        console.error("maximum loops exceeded, can't format links")
    }

    // Theme picker

    function formatThemePicker() {
        const ul = document.getElementById('theme-picker')
        if (!ul) {console.error('no theme-picker element'); return}
        ul.replaceWith(couldError("theme picker", () =>
            c('fieldset', {c: 'inp-pill-choice'}, [
                couldError("'theme' legend", () => c('legend', {}, [
                    c('span', {}, [
                        t(ul.children[0].textContent)
                    ])
                ])),
                couldError("theme input list", () =>
                    c('ol', {}, [
                        fhThemeLi('light', ul.children[1].textContent),
                        fhThemeLi('dark' , ul.children[2].textContent),
                        fhThemeLi('contr', ul.children[3].textContent)
                    ])
                ),
            ])
        ))
    }
    function fhThemeLi(v, text) {
        const inp = c('input', {
            type: 'radio',
            name: 'theme',
            value: v,
            id: 'theme-' + v
        })
        if (v === colorScheme.get()) inp.checked = true
        inp.onchange = function(_) {colorScheme.set(v)}
        return c('li', {}, [
            c('label', {for: 'theme-' + v}, [
                inp,
                t(' ' + text)
            ])
        ])
    }

    // Card with avatar

    function formatPdfLink() {
        const a = document.getElementById('pdf-link')
        if (!a) {console.error('no pdf-link element'); return}
        a.replaceWith(couldError("anchor to CV PDF", function () {
            const a = c('a', {c: 'pdf-anchor', href: linkHrefs.cvPdf})
            a.innerHTML = pdfLogoSvg + '<span>CV</span>'
            return a
        }))
    }
    function formatAvatar(li) {
        const i = document.getElementById('avatar')
        if (!i) {console.error('no "avatar" element'); return}
        i.replaceWith(c('picture', {}, [
            c('source', {
                srcset: 'r/hood-669x890.webp',
                type: 'image/webp',
            }),
            c('img', {
                src: 'r/hood-334x445.png',
                alt: i.textContent
            })
        ]))
    }

    // Experiences section

    function paintCode(a) {
        const lines = a.split('\n')
        let code = ''  // even lines
        let paint = ''  // odd lines
        for (let i = 1; i + 1 < lines.length; i += 2) {
            code += lines[i] + '\n'
            paint += lines[i+1] + '-'
        }
        paint += 'n'  // the loop below waits for a non dash to paint
        const s = []  // result, list of DOM elements
        let start = 0
        let color = paint[0]
        for (let j = 0; j < paint.length; j++) {
            if (paint[j] !== '-') {
                const snippet = code.substr(start, j - start)
                if      (color === 'n') s.push(t(snippet))
                else if (color === 'b') s.push(c('b', {}, [t(snippet)]))
                else if (color === 'f') s.push(c('i', {}, [t(snippet)]))
                else {
                    s.push(t(snippet))
                    console.error(a)
                }
                start = j
                color = paint[j]
            }
        }
        return s
    }

    function formatKeymouthImages(keyMouth) {
        const div = document.getElementById('keymouth-images')
        if (!div) {console.error('no keymouth-images element'); return}
        div.replaceWith(c('div', {c: 'card12 w100 overlapping-images'}, [
            c('picture', {c: 'big-down-left'}, [
                c('source', {
                    srcset: 'r/keymouth-bot-1012x624.webp',
                    type: 'image/webp',
                }),
                c('img', {
                    c: 'img w100 shadow',
                    src: 'r/keymouth-bot-506x312.png',
                    alt: div.children[0].textContent
                })
            ]),
            c('picture', {c: 'small-up-right'}, [
                c('source', {
                    srcset: 'r/keymouth-zoom-430x359.webp',
                    type: 'image/webp',
                }),
                c('img', {
                    c: 'img w100 shadow',
                    src: 'r/keymouth-zoom-215x179.png',
                    alt: div.children[1].textContent
                })
            ])
        ]))
    }

    function formatFourScreenshots(altText) {
        const div = document.getElementById('four-screenshots')
        if (!div) {console.error('no four-screenshots element'); return}
        div.replaceWith(c('div', {}, [
            c('picture', {}, [
                c('source', {
                    srcset: 'r/pf-cross-1460x643.webp',
                    type: 'image/webp',
                }),
                c('img', {
                    c: 'img w100 shadow',
                    src: 'r/pf-cross-730x321.png',
                    alt: div.textContent,
                })
            ]),
            c('pre', {c: 'code1'}, [c('code', {}, paintCode(`
function get_biography_html(string $language) {
b--------f-----------------nb------n-----------
    return get_typical_layout(
b----------f-----------------n`))]),
            c('pre', {c: 'code1'}, [c('code', {}, paintCode(`
<?php $STR_XML = simplexml_load_file("biography/bio-high-school.xml") ?>
n----------------f------------------nb------------------------------n---
<h2><?php $b("title") ?></h2>
b---n-----f-nb------n---b----`))])
        ]))
    }

    // Links (at the bottom)

    function formatLinksAtBottom() {
        const foot = document.getElementById("links-at-the-bottom")
        if (!foot) {console.error('no links-at-the-bottom element'); return}
        foot.appendChild(c('ul', {c: 'ls1'}, [
            c('li', {}, [
                c('a', {href: linkHrefs.email}, [t('Gmail')])
            ]),
            c('li', {}, [
                c('a', {href: linkHrefs.linkedin}, [t('LinkedIn')])
            ]),
            c('li', {}, [
                c('a', {href: linkHrefs.github}, [t('GitHub')])
            ]),
        ]))
    }

    // Executing

    functionCalledAtTheBottom()
}

//--- Links

const linkHrefs = {
    greek: 'index-el.html',
    english: 'index.html',
    cvPdf: 'r/cv-2025-06-21.pdf',
    keymouth: 'https://theodoros-d-alenas.site/key-mouth/',
    reactjs: 'https://react.dev/',
    nextjs: 'https://nextjs.org/',
    fastapi: 'https://fastapi.tiangolo.com/',
    keymouthgh: 'https://github.com/TheodoreAlenas/key-mouth',
    pf1: 'old-versions/13-before-abandoning/en/index.html',
    pf1gh: 'https://github.com/TheodoreAlenas/personal-website-1/',
    cleancode: 'https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882',
    pf2: 'old-versions/21-blue-mountains-many-themes/en/index.html',
    pf2gh: 'https://github.com/TheodoreAlenas/personal-website-2/',
    pf3: 'old-versions/30-face-square-poking/index.html',
    pf3gh: 'https://github.com/TheodoreAlenas/portfolio/',
    pf4gh: 'https://github.com/TheodoreAlenas/personal-website-4/',
    uni: 'https://www.di.uoa.gr/',
    sigmod: 'https://sigmod-contest-2025.github.io/index.html',
    scmd: 'https://github.com/TheodoreAlenas/dotfiles/blob/main/scmd.sh',
    helvia: 'https://helvia.ai/',
    nobuild: 'https://world.hey.com/dhh/you-can-t-get-faster-than-no-build-7a44131c',
    email: 'mailto:dimakopt732@gmail.com',
    linkedin: 'https://www.linkedin.com/in/theodoros-dimakopoulos-726ba1289/',
    github: 'https://github.com/TheodoreAlenas/',
}

//--- PDF logo SVG made with Inkscape

const pdfLogoSvg = `
<svg
   aria-hidden="true"
   version="1.1"
   width="66"
   height="96"
   viewBox="0 0 66 96"
   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
   xmlns:xlink="http://www.w3.org/1999/xlink"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:svg="http://www.w3.org/2000/svg">
  <g
     id="g1">
    <text
       xml:space="preserve"
       style="font-size:19.6108px;text-align:start;writing-mode:lr-tb;direction:ltr;text-anchor:start;stroke-width:0.204277"
       x="15.215679"
       y="82.154205"
       id="text2"
       inkscape:label="letters"><tspan
         id="tspan2"
         x="15.215679"
         y="82.154205"
         style="font-size:19.6108px;fill:currentColor;stroke-width:0.204277">PDF</tspan></text>
    <path
       d="M 6.5535647,1.2652459 H 48.845121 l 16.11409,16.1140991 v 72.035754 c 0.05873,2.82519 -0.624853,5.136392 -4.936129,4.936138 H 6.2987953 C 3.1443219,94.441585 1.3936631,92.735555 1.4741197,89.271791 V 5.5963089 c 0.3268187,-2.5063904 1.702378,-4.1970922 5.079445,-4.331063 z"
       id="path2"
       style="fill:none;stroke:currentColor;stroke-width:1.63423;stroke-dasharray:none"
       inkscape:label="outline" />
    <path
       style="fill:currentColor;stroke-width:1.63423;stroke-dasharray:none"
       id="path4"
       d="m 12.841539,54.538519 c -0.241824,0.04183 -0.487023,0.06175 -0.731783,0.07686 -0.05381,0.0033 -0.112739,0.03177 -0.161435,0.0086 -0.05618,-0.02691 -0.0799,-0.09549 -0.119845,-0.143228 0.803745,0.446474 1.578321,0.950006 2.411197,1.339424 0.09631,0.045 -0.124039,-0.178491 -0.149036,-0.281769 -0.08226,-0.339998 -0.03758,-0.881202 0.05618,-1.194078 0.271211,-0.905351 0.578338,-1.263763 1.088509,-2.0867 0.304774,-0.388723 0.579068,-0.803419 0.91434,-1.166168 3.220834,-3.484731 7.965557,-5.204581 12.256712,-6.925638 3.894828,-1.428818 7.879275,-2.651046 11.957864,-3.434514 1.983934,-0.381096 2.46583,-0.397878 4.410253,-0.613532 2.147975,-0.188651 4.309834,-0.100308 6.436778,0.247124 0.926052,0.151273 1.208426,0.234929 2.080538,0.445329 0.6395,0.17652 1.270646,0.372493 1.875362,0.646423 0.966346,0.437751 2.7613,1.540584 -1.701086,-1.005453 0.111275,0.06302 0.200708,0.154558 0.301802,0.230861 0.01463,0.01041 0.05965,0.03314 0.04324,0.02812 -0.555774,-0.169899 0.05363,-0.111351 -0.982198,-0.04129 -2.40286,-0.130329 -4.736332,-0.756959 -6.985693,-1.586001 -0.68359,-0.251943 -1.362309,-0.519016 -2.027693,-0.815696 -0.712083,-0.317499 -1.4014,-0.683779 -2.1021,-1.025668 -0.741141,-0.42717 -1.508293,-0.812087 -2.223421,-1.281508 -0.189363,-0.124295 -0.296038,-0.346406 -0.472649,-0.488236 -3.092578,-2.483527 -1.734847,-1.106271 -4.689413,-3.75783 -2.059726,-1.848506 -2.668509,-2.549796 -4.567966,-4.520496 -2.696819,-3.000642 -5.166496,-6.210801 -7.269855,-9.655192 -0.294978,-0.494606 -0.56783,-1.004787 -0.747416,-1.553727 -0.05873,-0.179694 -0.107082,-0.341771 -0.09284,-0.531869 0.0054,-0.07272 0.03156,-0.142383 0.04725,-0.213587 0.250999,-0.531888 0.575839,-0.570165 1.117421,-0.62409 0.09687,0.0029 0.194177,-0.0016 0.290508,0.0086 0.342279,0.03634 0.720219,0.128619 1.027401,0.285714 0.146291,0.07486 0.56763,0.331224 0.420515,0.257805 -0.662211,-0.330473 -1.311398,-0.686413 -1.967097,-1.029622 0.195127,0.204473 0.411358,0.390721 0.585398,0.613421 0.571333,0.731026 0.909215,1.430014 1.254028,2.305413 0.490215,1.244581 0.800645,2.423283 1.077054,3.735952 0.170007,0.807793 0.295744,1.62431 0.443607,2.436465 0.607652,4.142262 0.935865,8.334947 0.86239,12.523421 -0.01282,0.69295 -0.04779,1.385288 -0.07169,2.077934 -0.146653,3.15992 -0.636216,6.286248 -1.336424,9.366888 -0.286825,1.203031 -0.70059,2.371228 -1.296621,3.456862 -0.378908,0.690157 -0.509824,0.844208 -0.958231,1.494192 -1.015159,1.378556 -2.251386,2.559525 -3.575005,3.635328 -0.749256,0.550792 -1.566208,1.021448 -2.436514,1.354142 -0.439085,0.167856 -0.556668,0.18408 -0.999911,0.29541 -0.982984,0.194793 -1.883698,-0.02186 -2.826294,-0.293822 -0.947358,-0.353339 -2.882185,-1.283401 1.235386,0.815346 0.136439,0.0695 -0.248153,-0.180296 -0.361121,-0.283537 -0.274256,-0.250634 -0.32661,-0.361682 -0.535252,-0.662565 -0.356616,-0.589646 -0.474983,-1.265411 -0.519765,-1.942402 0,0 -2.697658,-1.344773 -2.697658,-1.344773 v 0 c 0.07789,0.716805 0.178765,1.449597 0.512689,2.098048 0.175116,0.294658 0.273052,0.494828 0.510297,0.74882 0.108711,0.11633 0.220646,0.234503 0.356015,0.318245 1.37276,0.849276 2.398281,1.609455 3.832296,2.042794 0.961878,0.237365 1.934445,0.434554 2.914071,0.16335 1.244142,-0.385638 2.393466,-1.009913 3.434,-1.793584 0.197899,-0.162566 0.401782,-0.318113 0.593697,-0.487709 1.100949,-0.972962 2.070195,-2.092781 2.984318,-3.238541 0.416063,-0.598484 0.637695,-0.884017 0.989676,-1.521944 0.612541,-1.110169 0.999638,-2.328964 1.239746,-3.570081 0.601378,-3.145925 1.003031,-6.329992 1.115616,-9.533274 0.02153,-0.698194 0.06475,-1.396053 0.06457,-2.094581 -9.1e-5,-0.717967 -0.03447,-1.435607 -0.06513,-2.152919 -0.149398,-3.491109 -0.497,-6.971452 -0.868974,-10.444602 C 27.93179,23.455756 27.84489,22.652778 27.711199,21.85695 27.484773,20.509063 27.233061,19.443976 26.813914,18.15682 26.52647,17.274165 26.286762,16.608611 25.780988,15.849627 25.629586,15.622312 25.432562,15.42884 25.258341,15.218446 24.263172,14.58809 23.276176,13.944656 22.272855,13.327377 21.703783,12.977266 21.02915,12.827021 20.366958,12.888098 c -0.670584,0.118877 -1.023423,0.281808 -1.317982,0.92061 -0.05692,0.217348 -0.118939,0.371034 -0.08628,0.603903 0.01641,0.114245 0.06457,0.221673 0.104155,0.330075 0.219224,0.602047 0.526095,1.163072 0.896593,1.685929 2.38139,3.492464 5.039647,6.790007 7.843175,9.951621 1.532226,1.585177 2.885232,3.034386 4.516617,4.522165 1.065286,0.971516 3.447444,2.94903 4.64436,3.766022 2.831345,1.932626 3.973466,2.542893 6.589492,4.044492 0.718578,0.348635 1.425169,0.723098 2.155711,1.045902 0.66927,0.295737 1.353371,0.557814 2.040827,0.808434 2.386463,0.870027 4.850869,1.512483 7.383187,1.762197 0.674123,-0.01841 0.891649,0.08955 1.434362,-0.294366 0.144103,-0.101938 -0.246621,-0.451481 -0.299922,-0.487557 -1.013555,-0.592072 -1.98054,-1.27802 -3.05347,-1.754174 -0.690959,-0.306643 -1.421375,-0.503287 -2.155109,-0.677951 -2.756668,-0.547886 -5.485133,-0.761981 -8.290304,-0.414138 -1.917571,0.274873 -2.325026,0.298361 -4.281833,0.732529 -4.002288,0.888012 -7.879239,2.248134 -11.732751,3.627711 -2.406928,0.967043 -4.285391,1.692989 -6.652627,2.759867 -0.986484,0.444595 -1.987818,0.865059 -2.930469,1.396312 -0.642,0.361814 -1.223183,0.824031 -1.807066,1.273649 -1.506286,1.159911 -1.33305,1.085552 -2.444195,2.41307 -0.455355,0.651751 -0.998287,1.342026 -1.308808,2.089083 -0.09286,0.223223 -0.124038,0.467879 -0.166177,0.705917 -0.0072,0.03746 -0.147754,0.811314 0.02261,0.938243 0.863521,0.643002 1.817482,1.154678 2.726224,1.732016 0.381989,0.03779 0.759709,-0.0393 1.141151,-0.07065 z"
       inkscape:label="triangle" />
  </g>
</svg>
`

//--- Executing code

toBeCalledAtTheBottom()
