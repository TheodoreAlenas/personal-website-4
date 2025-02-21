# Portfolio in 2 languages without build

I've been trying to hand write a website for employers since 2023 and this is the 4th or 5th iteration. I thought it would be relatively easy and that's partly why I didn't pick a solution off the shelf. The main challenges were to support Greek and English, Light and Dark themes and have as little friction as possible to preview and serve the site.

[It's served](https://theodoros-d-alenas.site/)
on my rented server.

## Features

- multiple languages
- no build step
- `index.html` can be previewed as `file://` without a web server

Also, links and code snippets are handled with JavaScript, there's a dark, a light and a high contrast theme, the design adapts to mobile and desktop and it's made with accessibility in mind. It's only been tried in Firefox but it's made with browsers from 2015 and on in mind.

## Usage

The index HTML files are used as data structures that contain localized strings. Text that's always English is not in the index HTML files.

You may access an index HTML file with a browser as `file:///home/.../index.html` or `file:///C:/Users/.../index.html` and it will read the JavaScript that replaces its elements. You can bookmark it.

To make changes, you think of where you'd place the new text in the HTML files, then you write the JavaScript that would read it and create elements and before you write the text in the HTML, you refresh the browser to see if the errors work right. If the errors are helpful enough, then you complete the HTML files for the different languages.

## Quirks

There's custom JavaScript for creating elements because there's only a little bit of it. It started as 20 lines of code and now it grew to the point where I'd start considering a library. If your site needs more specialized functions for creating elements I would recommend a third party library.

The JavaScript functions are defined as globals so they can be used in the browser console. They were never used in the browser console though so feel free to use ES6 modules. There's only one JavaScript file because otherwise it would need to fetch another file, which CORS would make me serve with a web server. This wouldn't be a problem with ES6 modules either.

The CSS is in one file because it's easier to search in it that way. It's partly short classes like in TailwindCSS and partly old-school CSS, there's not a sophisticated reason behind that so feel free to go your way.

Why do I not parse code snippets to highlight them? Because that's a lot of code. Why not use MarkDown? Because the browser can serialize HTML on its own but I'd need a MarkDown parser in JavaScript. Why not have the images and class names in another HTML file that's fetched as a template? Because you'd need to serve the site with a web server then, instead of previewing it with `file:///...`. Why not put both languages in one HTML file and let JavaScript strip off the snippets of the wrong language? Because of the head of the HTML file, it mentions the language so the browser can recommend to translate it automatically and it probably has to do with SEO as well, so I don't want to change the head with JavaScript after loading the page.

## Inspirations

- [an image on Dribble](https://dribbble.com/shots/24399369-Case-Study-Minimal-Portfolio-Landing-Page) from a project of [Al Razi Siam](http://alrazisiam.com/)
- [a template on Canvas](https://www.canva.com/templates/EAFsPkM5oZg-black-grey-minimalist-clean-creative-portfolio-presentation/) by [Contemplism](https://www.canva.com/p/contemplism/)
- [a template on Canvas](https://www.canva.com/templates/EAGJsbKco04-beige-modern-ugc-portfolio-presentation/) by [Salbine B. | Amaré Creative](https://www.canva.com/p/salbine/)
- [Kevin Powell's site](https://www.kevinpowell.co/) in how he lays out the text, I'm a big fan of his
- [Gruber Darker](https://github.com/rexim/gruber-darker-theme), the high contrast dark theme made by [Mista Azosin from the Tsoding Daily YouTube channel](https://www.youtube.com/@TsodingDaily)

The design was sketched using [Inkscape](https://inkscape.org/). Inkscape was also used for the PDF logo. (as of writing this README)
