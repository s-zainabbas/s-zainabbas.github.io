/*
 * English / French switch.
 *
 * The page is written in English. In French mode this walks the page's text and
 * swaps each English string for its French version from FR below, keeping the
 * original so switching back is instant. Text that scripts add later (form
 * messages, live previews) is caught by a MutationObserver and translated too.
 * Elements marked data-i18n-skip render their own language (GitHub panel, command menu).
 *
 * To change a translation, edit FR: the key is the exact English text on the page.
 */
(function () {
    'use strict';

    const FR = {
        // Navigation & chrome
        'Skip to content': 'Aller au contenu',
        'Home': 'Accueil',
        'About': 'À propos',
        'Experience': 'Parcours',
        'Certifications': 'Certifications',
        'Skills': 'Compétences',
        'Projects': 'Projets',
        'Contact': 'Contact',
        'Open the command menu': 'Ouvrir le menu de commandes',
        'Command menu': 'Menu de commandes',
        'Switch to dark mode': 'Passer en mode sombre',
        'Switch to light mode': 'Passer en mode clair',
        'Toggle dark mode': 'Changer de thème',
        'Toggle navigation menu': 'Ouvrir ou fermer le menu',
        'Read in English': 'Read in English',
        'Lire en français': 'Lire en français',
        'Back to top': 'Retour en haut',
        'Back to top ↑': 'Retour en haut ↑',

        // Intro
        'Data': 'Données',
        'Code': 'Code',

        // Hero
        'Available for freelance projects': 'Disponible pour des missions freelance',
        'Hello, welcome to my corner of the internet': 'Bonjour, bienvenue dans mon coin d’internet',
        "I'm": 'Je suis',
        'Data Analyst &': 'Analyste de données &',
        'Web Developer': 'développeur web',
        'I turn messy data into clear decisions, and I hand-code the websites and tools that put them to work, for organisations like IATA and CERN and for businesses around Geneva.':
            'Je transforme des données désordonnées en décisions claires, et je code à la main les sites et les outils qui les mettent en pratique, pour des organisations comme l’IATA et le CERN et pour des entreprises de la région genevoise.',
        'Hire Me': 'Travaillons ensemble',
        'View Work': 'Voir mes projets',
        'Years in industry': 'Ans d’expérience',
        'Projects live': 'Projets en ligne',
        'Organisations': 'Organisations',

        // About
        'About Me': 'À propos de moi',
        'I work where data meets code. At IATA I analysed the special cargo portfolio and streamlined Salesforce workflows. For businesses in Geneva I build websites from scratch, audit their tools, and automate the busywork behind their CRM and email campaigns.':
            'Je travaille là où les données rencontrent le code. À l’IATA, j’ai analysé le portefeuille du fret spécial et simplifié les processus Salesforce. Pour des entreprises genevoises, je crée des sites de A à Z, j’audite leurs outils et j’automatise les tâches répétitives de leur CRM et de leurs campagnes e-mail.',
        'I like problems where the answer is in the data and the fix is in the code. Everything on this site, from the live project previews to the case-study pages, is hand-written HTML, CSS and JavaScript, with no templates.':
            'J’aime les problèmes dont la réponse se trouve dans les données et la solution dans le code. Tout ce site, des aperçus de projets en direct aux études de cas, est écrit à la main en HTML, CSS et JavaScript, sans modèle.',
        'Coming soon': 'Bientôt',
        "I've been offered the role of Head of AI Development & Technologies at Corvit Networks, starting once the company completes its registration in Geneva.":
            'On m’a proposé le poste de Head of AI Development & Technologies chez Corvit Networks, qui débutera dès que l’entreprise aura finalisé son enregistrement à Genève.',
        'Name:': 'Nom :',
        'Degree:': 'Diplôme :',
        'BSc Computer Science': 'Bachelor en informatique',
        'Email:': 'E-mail :',
        'Location:': 'Lieu :',
        'Saint-Genis, France (Geneva area)': 'Saint-Genis, France (région de Genève)',
        'Download CV': 'Télécharger mon CV',

        // Now
        'Now': 'En ce moment',
        'Updated November 2026': 'Mis à jour en novembre 2026',
        'Working on': 'En cours',
        'Technical support for FUNdamental Networking and BBold: data migration, websites, and CRM and email automation.':
            'Support technique pour FUNdamental Networking et BBold : migration de données, sites web, automatisation du CRM et des e-mails.',
        'Up next': 'Prochaine étape',
        "Head of AI Development & Technologies at Corvit Networks, once the company's registration in Geneva is complete.":
            'Head of AI Development & Technologies chez Corvit Networks, dès que l’enregistrement de l’entreprise à Genève sera finalisé.',
        'Building': 'Je construis',
        'This portfolio, Stockify and Daily Dashboard, all open source on GitHub.': 'Ce portfolio, Stockify et Daily Dashboard, tous open source sur GitHub.',

        // Logos
        "Organizations I've Contributed or Collaborated With": 'Organisations avec lesquelles j’ai travaillé ou collaboré',

        // Timeline
        'Experience & Education': 'Expérience & formation',
        'From CERN and IATA to independent consulting, newest first.': 'Du CERN et de l’IATA au conseil indépendant, du plus récent au plus ancien.',
        'Filter the timeline': 'Filtrer la chronologie',
        'All': 'Tout',
        'Work': 'Expérience',
        'Education': 'Formation',
        'Next role': 'Prochain poste',
        'Head of AI Development & Technologies': 'Head of AI Development & Technologies',
        'Corvit Networks · Geneva, Switzerland': 'Corvit Networks · Genève, Suisse',
        "I've been offered the role of leading AI development and technology at Corvit Networks. It starts once the company completes its registration in Geneva.":
            'On m’a proposé de diriger le développement IA et la technologie chez Corvit Networks. Le poste débutera dès que l’entreprise aura finalisé son enregistrement à Genève.',
        'AI strategy': 'Stratégie IA',
        'Technology leadership': 'Direction technique',
        'Aug 2024 – Present': 'Août 2024 – aujourd’hui',
        'Current': 'Actuel',
        'Freelance Technical Consultant': 'Consultant technique indépendant',
        'Independent · Geneva area': 'Indépendant · Région de Genève',
        'Independent technical consulting for Geneva businesses: audits, websites, data migration and automation.':
            'Conseil technique indépendant pour des entreprises genevoises : audits, sites web, migration de données et automatisation.',
        'FUNdamental Networking:': 'FUNdamental Networking :',
        'ran technical and operational audits, then led the follow-up work: data migration, a website built from scratch and improvements across the client’s whole tool ecosystem (ongoing).':
            'audits techniques et opérationnels, puis pilotage de la suite : migration de données, site web créé de A à Z et amélioration de l’ensemble des outils du client (en cours).',
        'BBold:': 'BBold :',
        'website troubleshooting and bug fixing, plus automation for client relationship management and email campaigns (ongoing).':
            'dépannage du site web et correction de bugs, ainsi qu’automatisation de la gestion de la relation client et des campagnes e-mail (en cours).',
        'IATA:': 'IATA :',
        'worked on a project with the Airport Charges team, keeping my technical and financial data knowledge current.':
            'projet mené avec l’équipe Airport Charges, qui m’a permis de garder à jour mes connaissances en données techniques et financières.',
        'Built and maintain this portfolio and its open-source projects, with a focus on maintainable code, careful data handling and clear documentation.':
            'Création et maintenance de ce portfolio et de ses projets open source, avec un code maintenable, une gestion rigoureuse des données et une documentation claire.',
        'Technical audits': 'Audits techniques',
        'Data migration': 'Migration de données',
        'Web development': 'Développement web',
        'CRM automation': 'Automatisation CRM',
        'Email automation': 'Automatisation e-mail',
        'Documentation': 'Documentation',
        'Jan 2024 – Jul 2024': 'Janv. 2024 – juil. 2024',
        'Business Data Analyst': 'Analyste de données métier',
        'International Air Transport Association (IATA)': 'Association du transport aérien international (IATA)',
        'Data analysis and strategic work on the special cargo portfolio, alongside contract management and CRM workflow optimisation.':
            'Analyse de données et travail stratégique sur le portefeuille du fret spécial, en parallèle de la gestion de contrats et de l’optimisation des processus CRM.',
        'Led data analysis on the special cargo portfolio, turning it into insights that shaped strategic and revenue decisions.':
            'Pilotage de l’analyse de données du portefeuille fret spécial, transformée en enseignements qui ont orienté les décisions stratégiques et commerciales.',
        'Managed contract creation and oversight for governments, airlines and IT providers, keeping every agreement compliant.':
            'Gestion de la création et du suivi des contrats avec des gouvernements, des compagnies aériennes et des prestataires IT, en veillant à la conformité de chaque accord.',
        'Optimised CRM workflows in Salesforce to speed up deal closure and simplify the sales process.':
            'Optimisation des processus CRM dans Salesforce pour accélérer la conclusion des contrats et simplifier le cycle de vente.',
        'Dec 2021 – Aug 2023': 'Déc. 2021 – août 2023',
        'Technical Consultant': 'Consultant technique',
        'BBold SARL · Career & Corporate Consultancy': 'BBold SARL · Conseil en carrière et en entreprise',
        'Technical lead for the company’s digital side: website, tools, documentation and data-driven outreach.':
            'Responsable technique du volet numérique de l’entreprise : site web, outils, documentation et prospection fondée sur les données.',
        'Developed and maintained the company website, improving the user experience behind product sales.':
            'Développement et maintenance du site de l’entreprise, en améliorant l’expérience utilisateur au service des ventes.',
        'Wrote training documentation for the team’s core tools, including HubSpot, Zoho and Canva.':
            'Rédaction de la documentation de formation pour les outils clés de l’équipe, dont HubSpot, Zoho et Canva.',
        'Used data-driven outreach strategies to attract new clients and grow the business.':
            'Stratégies de prospection fondées sur les données pour attirer de nouveaux clients et développer l’activité.',
        'Student Ambassador': 'Ambassadeur étudiant',
        'Webster University Geneva': 'Webster University Genève',
        'Digital initiatives, student platforms and analytics for the university.': 'Projets numériques, plateformes étudiantes et analyse de données pour l’université.',
        'Developed and maintained student platforms, including the website and portals for new admissions.':
            'Développement et maintenance des plateformes étudiantes, dont le site web et les portails pour les nouvelles admissions.',
        'Built interactive Power BI dashboards that gave staff insight into student data.':
            'Création de tableaux de bord Power BI interactifs donnant au personnel une vue claire des données étudiantes.',
        'Managed the university’s web and mobile presence, reaching prospective students with multimedia content.':
            'Gestion de la présence web et mobile de l’université, avec du contenu multimédia pour les futurs étudiants.',
        'Data visualisation': 'Visualisation de données',
        'Reporting': 'Reporting',
        'Summers 2018 & 2019': 'Étés 2018 & 2019',
        'Distributed Data Manager': 'Gestionnaire de données distribuées',
        'Data management and security tooling during two summer placements.': 'Gestion de données et outils de sécurité lors de deux stages d’été.',
        'Developed an AI word filter and response bots to strengthen cybersecurity.': 'Développement d’un filtre de mots par IA et de bots de réponse pour renforcer la cybersécurité.',
        'Used Docker containers to distribute data efficiently and securely.': 'Utilisation de conteneurs Docker pour distribuer les données de façon efficace et sécurisée.',
        'Analysed and visualised complex datasets in Power BI.': 'Analyse et visualisation de jeux de données complexes dans Power BI.',
        'Specialised in software engineering and data analysis, with media communication electives.':
            'Spécialisation en génie logiciel et analyse de données, avec des options en communication médias.',
        'Core focus on software development and data structures.': 'Accent sur le développement logiciel et les structures de données.',
        'Advanced coursework in database management.': 'Cours avancés en gestion de bases de données.',
        'Studies in media communications and digital marketing.': 'Études en communication médias et marketing digital.',
        'BSc Information Technology': 'Licence en informatique',
        'Université Savoie Mont Blanc, France': 'Université Savoie Mont Blanc, France',
        'Foundations of IT, networking and system administration.': 'Fondamentaux de l’informatique, des réseaux et de l’administration système.',
        'IT infrastructure and networking protocols.': 'Infrastructure informatique et protocoles réseau.',
        'Hands-on system administration and security.': 'Administration système et sécurité, en pratique.',
        'Practical training in network configuration and maintenance.': 'Formation pratique à la configuration et à la maintenance des réseaux.',

        // Certifications
        'Data Fundamentals': 'Fondamentaux des données',
        'View certificate': 'Voir le certificat',
        'Verified credential covering core data concepts, terminology, and foundational data literacy skills.':
            'Certification vérifiée couvrant les concepts clés, le vocabulaire et les bases de la culture des données.',
        'Data Analytics': 'Analyse de données',
        'Job simulation completion certificate focused on forensic data analytics and client reporting.':
            'Certificat de simulation professionnelle axé sur l’analyse forensique des données et le reporting client.',
        'Digital Transformation': 'Transformation numérique',
        'Job simulation completion certificate on digital strategy and technology-driven transformation.':
            'Certificat de simulation professionnelle sur la stratégie numérique et la transformation par la technologie.',

        // Skills
        'Skills & Tools': 'Compétences & outils',
        'The languages, platforms and tools I build and analyse with': 'Les langages, plateformes et outils avec lesquels je développe et j’analyse',
        'Languages & Frameworks': 'Langages & frameworks',
        'Data & Analytics': 'Données & analyse',
        'Tools & Delivery': 'Outils & mise en production',
        'Business & CRM': 'Gestion & CRM',

        // Projects
        'Featured Projects': 'Projets à la une',
        'What I built, how it works, and the tools behind it. The previews below are live, so try them.':
            'Ce que j’ai construit, comment ça marche et avec quels outils. Les aperçus ci-dessous sont interactifs : essayez-les.',
        'Interactive Game of Life simulation. Click or drag to draw cells.': 'Simulation interactive du Jeu de la vie. Cliquez ou glissez pour dessiner des cellules.',
        'Pause simulation': 'Mettre en pause',
        'Play simulation': 'Lancer la simulation',
        'Advance one generation': 'Avancer d’une génération',
        'Randomise the grid': 'Grille aléatoire',
        'Generation': 'Génération',
        '· click to draw': '· cliquez pour dessiner',
        'Personal project · Simulation': 'Projet personnel · Simulation',
        'Game of Life': 'Jeu de la vie',
        "A browser version of Conway's Game of Life, where four simple rules applied to every cell create patterns that move, grow and die.":
            'Une version navigateur du Jeu de la vie de Conway, où quatre règles simples appliquées à chaque cellule créent des motifs qui bougent, grandissent et meurent.',
        'What I built': 'Ce que j’ai construit',
        'A canvas simulation with a random starting grid, play/pause control and a zoom slider that rebuilds the grid at a new cell size.':
            'Une simulation sur canvas avec une grille de départ aléatoire, un bouton lecture/pause et un curseur de zoom qui reconstruit la grille à une nouvelle taille.',
        'How it works': 'Comment ça marche',
        'Each generation counts the eight neighbours of every cell, builds the next grid from the rules, then redraws it with the Canvas API.':
            'À chaque génération, le code compte les huit voisines de chaque cellule, construit la grille suivante selon les règles, puis la redessine avec l’API Canvas.',
        'Live demo': 'Démo en ligne',
        'Price': 'Cours',
        '20-day avg': 'Moy. 20 j',
        '50-day avg': 'Moy. 50 j',
        'Example price chart with 20-day and 50-day moving averages and a marked bullish crossover':
            'Exemple de graphique de cours avec moyennes mobiles à 20 et 50 jours et un croisement haussier signalé',
        'Generate a new example chart': 'Générer un nouvel exemple',
        'Example data · averages calculated live': 'Données d’exemple · moyennes calculées en direct',
        'Bullish crossover': 'Croisement haussier',
        'Personal project · Full-stack': 'Projet personnel · Full-stack',
        'A fast stock tracker I use every day: interactive charts with 20, 50 and 200-day EMAs, a live quote header, a technical rating, news and a watchlist.':
            'Un suivi boursier rapide que j’utilise chaque jour : graphiques interactifs avec MME 20, 50 et 200 jours, cotation en direct, note technique, actualités et liste de suivi.',
        'A static web app in plain JavaScript modules with no dependencies. It runs entirely on GitHub Pages, so there is no server, no API key and no hosting cost. A GitHub Actions workflow deploys every push.':
            'Une application web statique en modules JavaScript, sans dépendance. Elle tourne entièrement sur GitHub Pages : pas de serveur, pas de clé d’API, aucun coût d’hébergement. Un workflow GitHub Actions déploie chaque push.',
        'I wired five TradingView widgets (chart, quote, ticker tape, rating and news) to one search box, so picking a ticker updates the whole page. The watchlist lives in the browser, and':
            'J’ai relié cinq widgets TradingView (graphique, cotation, bandeau, note et actualités) à une seule barre de recherche : choisir un titre met à jour toute la page. La liste de suivi reste dans le navigateur, et les liens',
        'links open a stock directly.': 'ouvrent directement un titre.',
        'TradingView widgets': 'Widgets TradingView',
        'Read the case study': 'Lire l’étude de cas',
        'Good morning.': 'Bonjour.',
        'Good afternoon.': 'Bon après-midi.',
        'Good evening.': 'Bonsoir.',
        'Today’s #1 priority': 'La priorité n° 1 du jour',
        'Ship the onboarding redesign': 'Livrer la refonte de l’onboarding',
        'Morning inbox zero': 'Boîte de réception à zéro',
        'Write release notes': 'Rédiger les notes de version',
        'Review auth pull request': 'Relire la pull request auth',
        'Book offsite flights': 'Réserver les vols du séminaire',
        'Tasks done': 'Tâches faites',
        'Next up': 'À suivre',
        '1:1 with Jordan': 'Point avec Jordan',
        'Reset the example tasks': 'Réinitialiser les tâches d’exemple',
        'All done. Nice work': 'Tout est fait. Bravo',
        'Personal project · Productivity app': 'Projet personnel · Application de productivité',
        "The command centre I open every morning: one priority, tasks, today's schedule, a focus timer, habits, notes and an end-of-day journal on a single screen.":
            'Le tableau de bord que j’ouvre chaque matin : une priorité, mes tâches, l’agenda du jour, un minuteur de concentration, mes habitudes, des notes et un journal de fin de journée sur un seul écran.',
        'I rebuilt my first version, a single HTML file, as a React and TypeScript app. It works offline, installs like a native app and keeps all data in the browser, with backup export and import. I also fixed ten bugs from v1, including dates going wrong in some timezones.':
            'J’ai reconstruit ma première version, un simple fichier HTML, en application React et TypeScript. Elle fonctionne hors ligne, s’installe comme une application native et garde toutes les données dans le navigateur, avec export et import de sauvegarde. J’ai aussi corrigé dix bugs de la v1, dont des dates fausses dans certains fuseaux horaires.',
        'A quick-add bar reads plain English: “Dentist fri 3-4pm” becomes an event. At midnight the day is saved to a journal and unfinished items carry over. The focus timer uses timestamps, so it stays accurate in background tabs. The date logic and parser are unit-tested.':
            'Une barre d’ajout rapide comprend l’anglais courant : « Dentist fri 3-4pm » devient un événement. À minuit, la journée est enregistrée dans un journal et les tâches inachevées sont reportées. Le minuteur s’appuie sur des horodatages et reste précis en arrière-plan. La logique des dates et l’analyseur sont couverts par des tests unitaires.',
        'Visit the BBold website': 'Visiter le site de BBold',
        'Client website · Built from scratch': 'Site client · Créé de A à Z',
        'Visit BBold': 'Visiter BBold',
        'Client project · Website development': 'Projet client · Développement web',
        'A polished digital home for BBold, a Geneva-based career coaching and diversity & inclusion consultancy.':
            'Une vitrine numérique soignée pour BBold, cabinet genevois de coaching de carrière et de conseil en diversité et inclusion.',
        'I developed and programmed the complete website from scratch, creating a clear, professional experience for BBold’s individual and corporate audiences.':
            'J’ai développé et programmé l’intégralité du site, pour offrir une expérience claire et professionnelle aux particuliers comme aux entreprises clientes de BBold.',
        'What it supports': 'Ce qu’il permet',
        'The site presents career coaching, leadership development, inclusive recruitment and executive search services, while making it easy for visitors to explore and get in touch.':
            'Le site présente le coaching de carrière, le développement du leadership, le recrutement inclusif et la recherche de cadres, tout en facilitant la navigation et la prise de contact.',
        'Web Development': 'Développement web',
        'Responsive Design': 'Design responsive',
        'Client Website': 'Site client',
        'Visit website': 'Visiter le site',
        'Visit the FUNdamental Networking website': 'Visiter le site de FUNdamental Networking',
        'Visit FUNdamental Networking': 'Visiter FUNdamental Networking',
        'A dedicated website for FUNdamental Networking, designed to give the organisation a clear and professional online presence.':
            'Un site dédié pour FUNdamental Networking, conçu pour donner à l’organisation une présence en ligne claire et professionnelle.',
        'I created and programmed the website from scratch, turning the client’s identity and content into an easy-to-navigate digital experience.':
            'J’ai créé et programmé le site de A à Z, en transformant l’identité et les contenus du client en une expérience numérique facile à parcourir.',
        'Focus': 'Priorités',
        'The build prioritises a confident visual identity, straightforward navigation and a responsive experience that works across desktop and mobile.':
            'Le site mise sur une identité visuelle affirmée, une navigation simple et une expérience responsive sur ordinateur comme sur mobile.',
        'More on GitHub': 'Plus sur GitHub',
        'Experiments, data tools and work in progress.': 'Expériences, outils de données et projets en cours.',
        'Visit GitHub': 'Voir GitHub',
        'Latest on GitHub': 'Dernières activités sur GitHub',

        // Testimonials
        'Kind Words': 'Ils en parlent',
        "From clients and colleagues I've worked with": 'Des clients et collègues avec qui j’ai travaillé',

        // Contact
        'Get In Touch': 'Me contacter',
        'Contact Information': 'Coordonnées',
        'Feel free to reach out to me for job opportunities, collaborations, or just to say hello :)':
            'N’hésitez pas à me contacter pour une opportunité, une collaboration, ou simplement pour dire bonjour :)',
        'Location': 'Lieu',
        'Copy email address': 'Copier l’adresse e-mail',
        'Email': 'E-mail',
        'LinkedIn profile': 'Profil LinkedIn',
        'GitHub profile': 'Profil GitHub',
        'Name': 'Nom',
        'Subject': 'Objet',
        'Message': 'Message',
        'Send Message': 'Envoyer',
        'Sending…': 'Envoi…',
        'Copied!': 'Copié !',
        'No templates were harmed in the making, handcrafted from scratch by Me :)': 'Aucun modèle n’a été maltraité : fait main, de A à Z, par moi :)',
        'Designed & Built by': 'Conçu et développé par',

        // Command palette
        'Search sections, projects and actions…': 'Rechercher une section, un projet, une action…',
        'Search commands': 'Rechercher une commande',
        'to move': 'pour naviguer',
        'to open': 'pour ouvrir',
        'theme ·': 'thème ·',
        'language': 'langue',
        'Go to': 'Aller à',
        'Case studies': 'Études de cas',
        'Actions': 'Actions',
        'Elsewhere': 'Ailleurs',
        'Switch light / dark theme': 'Basculer thème clair / sombre',
        'Lire en français / Read in English': 'Read in English / Lire en français',
        'Copy my email address': 'Copier mon adresse e-mail',
        'Download my CV': 'Télécharger mon CV',
        'No matches. Try “projects” or “email”.': 'Aucun résultat. Essayez « projets » ou « e-mail ».',
        'Email copied to your clipboard': 'Adresse e-mail copiée',
        'Copy my email:': 'Mon adresse e-mail :'
    };

    // Text that contains live values: [English pattern, French replacement]
    const PATTERNS = [
        [/^(\d+) of (\d+) done · tap a task to tick it$/, '$1 sur $2 faites · touchez une tâche pour la cocher'],
        [/^Thanks, (.+)! Your message has been sent\. I'll get back to you soon\.$/, 'Merci, $1 ! Votre message a bien été envoyé. Je vous réponds rapidement.'],
        [/^Sorry, your message could not be sent right now(.*)\. Please try again, or email me directly at (\S+)\.$/,
            'Désolé, votre message n’a pas pu être envoyé pour le moment$1. Réessayez, ou écrivez-moi directement à $2.']
    ];

    const META = {
        title: { en: document.title, fr: 'Zain Abbas — Analyste de données & développeur web' },
        description: {
            en: (document.querySelector('meta[name="description"]') || {}).content,
            fr: 'Zain Abbas, analyste de données et développeur web près de Genève. Analyse de données pour l’IATA et le CERN, sites codés à la main pour des entreprises genevoises et outils open source à essayer en direct.'
        }
    };

    const ATTRS = ['aria-label', 'placeholder', 'title', 'alt'];
    const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'KBD', 'NOSCRIPT', 'TEXTAREA']);
    const frValues = new Set(Object.values(FR));
    const originalText = new WeakMap();   // text node -> English text
    const originalAttrs = new WeakMap();  // element -> { attr: English value }

    let lang = 'en';
    let observer = null;

    const norm = (s) => s.replace(/\s+/g, ' ').trim();

    function translate(en) {
        const key = norm(en);
        if (!key) return null;
        if (Object.prototype.hasOwnProperty.call(FR, key)) return FR[key];
        for (const [re, out] of PATTERNS) if (re.test(key)) return key.replace(re, out);
        return null;
    }

    function skipped(node) {
        const el = node.nodeType === 1 ? node : node.parentElement;
        return !el || !!el.closest('[data-i18n-skip]') || SKIP_TAGS.has(el.tagName);
    }

    function translateTextNode(node) {
        if (skipped(node)) return;
        const current = node.nodeValue;
        if (frValues.has(norm(current))) return; // already French
        const fr = translate(current);
        if (fr == null) return;
        originalText.set(node, current);
        // Keep surrounding spaces so inline text still flows ("I'm " + "Zain")
        const lead = current.match(/^\s*/)[0];
        const trail = current.match(/\s*$/)[0];
        node.nodeValue = lead + fr + trail;
    }

    function translateAttrs(el) {
        if (skipped(el)) return;
        ATTRS.forEach(attr => {
            const value = el.getAttribute(attr);
            if (!value || frValues.has(value)) return;
            const fr = translate(value);
            if (fr == null) return;
            const store = originalAttrs.get(el) || {};
            store[attr] = value;
            originalAttrs.set(el, store);
            el.setAttribute(attr, fr);
        });
    }

    function walk(root) {
        if (root.nodeType === 3) { translateTextNode(root); return; }
        if (root.nodeType !== 1) return;
        translateAttrs(root);
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
        let n;
        while ((n = walker.nextNode())) {
            if (n.nodeType === 3) translateTextNode(n);
            else translateAttrs(n);
        }
    }

    function restore() {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
        let n;
        while ((n = walker.nextNode())) {
            if (n.nodeType === 3 && originalText.has(n)) {
                n.nodeValue = originalText.get(n);
                originalText.delete(n);
            } else if (n.nodeType === 1 && originalAttrs.has(n)) {
                const store = originalAttrs.get(n);
                Object.keys(store).forEach(a => n.setAttribute(a, store[a]));
                originalAttrs.delete(n);
            }
        }
    }

    function watch() {
        if (observer) return;
        observer = new MutationObserver((mutations) => {
            mutations.forEach(m => {
                if (m.type === 'characterData') translateTextNode(m.target);
                else if (m.type === 'attributes') translateAttrs(m.target);
                else m.addedNodes.forEach(walk);
            });
        });
        observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    }

    function unwatch() {
        if (observer) { observer.disconnect(); observer = null; }
    }

    function setMeta(l) {
        document.title = META.title[l];
        const d = document.querySelector('meta[name="description"]');
        if (d && META.description[l]) d.content = META.description[l];
    }

    function apply(next, save) {
        if (next === lang) return;
        lang = next;
        document.documentElement.lang = lang;
        if (lang === 'fr') {
            walk(document.body);
            watch();
        } else {
            unwatch();
            restore();
        }
        setMeta(lang);
        document.querySelectorAll('[data-lang-toggle]').forEach(btn => {
            btn.textContent = lang === 'fr' ? 'EN' : 'FR';
            btn.setAttribute('aria-label', lang === 'fr' ? 'Read in English' : 'Lire en français');
            btn.setAttribute('lang', lang === 'fr' ? 'en' : 'fr');
        });
        if (save) { try { localStorage.setItem('lang', lang); } catch (e) { /* private mode */ } }
        document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
    }

    window.i18n = {
        get lang() { return lang; },
        t: (en) => (lang === 'fr' ? (translate(en) ?? en) : en),
        set: (l) => apply(l, true),
        toggle: () => apply(lang === 'fr' ? 'en' : 'fr', true)
    };

    function init() {
        let initial = 'en';
        const param = new URLSearchParams(location.search).get('lang');
        if (param === 'fr' || param === 'en') initial = param;
        else { try { if (localStorage.getItem('lang') === 'fr') initial = 'fr'; } catch (e) { /* ignore */ } }
        document.querySelectorAll('[data-lang-toggle]').forEach(btn => btn.addEventListener('click', () => window.i18n.toggle()));
        apply(initial, false);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
