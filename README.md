# Zain Abbas — Portfolio

Personal portfolio website for **Zain Abbas**, a computer science professional focused on data, technology consulting, and thoughtful digital experiences.

**Live site:** [s-zainabbas.github.io](https://s-zainabbas.github.io/)

## Overview

The site brings together professional experience, education, certifications, technical skills and selected work in a responsive, accessible format, in English and French. Projects include live previews of **Game of Life**, **Stockify** and **Daily Dashboard** and case-study pages.

## Highlights

- Responsive, mobile-friendly portfolio layout
- Professional experience, education, certifications, and skills sections
- Project case studies with live demos and source links
- Contact and social links
- Tailwind CSS-powered styling with a compiled production stylesheet

## Built with

- HTML
- JavaScript
- Tailwind CSS
- GitHub Pages

## Run locally

Prerequisite: Node.js 18 or later.

```bash
npm install
npm run dev
```

The development command watches `src/tailwind.css` and rebuilds `tailwind.css` as styles are updated. Open `index.html` in a browser to view the site.

To build the minified stylesheet once:

```bash
npm run build
```

## Project structure

```text
.
├── Images/                 # Photos, logos, client screenshots, social share card
├── cv/                     # Curriculum vitae
├── projects/               # Case-study pages (Stockify, Daily Dashboard)
├── src/tailwind.css        # Tailwind source stylesheet
├── index.html              # Main page
├── 404.html                # Not-found page (GitHub Pages serves it automatically)
├── script.js               # Core interactions: theme, 3D hero, previews, contact form
├── features.js             # Timeline, GitHub activity, ⌘K menu, magnetic buttons, testimonials, analytics
├── i18n.js                 # English / French switch and the French text
├── subpage.js              # Theme toggle and progress bar for the standalone pages
├── styles.css              # Custom styles and colour tokens (oat, forest, tomato)
├── tailwind.css            # Generated Tailwind stylesheet
├── robots.txt, sitemap.xml # Search engine files
```

## Things to fill in

- **Testimonials:** add quotes to `TESTIMONIALS` in `features.js` and the "Kind Words" section appears.
- **Visitor stats:** create a free [GoatCounter](https://www.goatcounter.com) site and put its code in `GOATCOUNTER_CODE` in `features.js`.
- **French text:** edit the `FR` list in `i18n.js`; each key is the exact English text on the page.

## Deployment

The site is published at [s-zainabbas.github.io](https://s-zainabbas.github.io/) through GitHub Pages. Changes pushed to the default branch are used to update the live portfolio.

## Contact

Connect with Zain through the links on the [portfolio website](https://s-zainabbas.github.io/) or via [GitHub](https://github.com/s-zainabbas).
