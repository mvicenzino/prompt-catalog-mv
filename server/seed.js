import { query } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INITIAL_PROMPTS = [
    // --- IMAGES & PHOTOS ---
    {
        title: 'Hyper-realistic Portrait',
        content: 'A hyper-realistic portrait of a futuristic cyberpunk warrior, neon lights reflecting on the armor, rain falling, 8k resolution, cinematic lighting, detailed texture.',
        category: 'Images',
        source: 'Midjourney',
        tags: ['cyberpunk', 'portrait', '8k'],
        isFavorite: true,
        exampleImage: '/examples/images/cyberpunk_warrior.png'
    },
    {
        title: 'Natural Beauty Enhancer',
        content: 'Natural Photo Touch-Up: smooth skin, slightly slimmer face, clear features, bright eyes, and natural-looking lips. Keep the look realistic and attractive.',
        category: 'Photos',
        source: 'X',
        tags: ['retouch', 'beauty', 'realistic', 'viral'],
        isFavorite: false,
        exampleImage: '/examples/photos/natural_beauty.png'
    },
    {
        title: 'Cinematic Portrait Style',
        content: 'Create a photorealistic portrait of [subject], with cinematic lighting, soft bokeh background, sharp focus on eyes, rich skin tones, shot on an 85mm lens, 4K resolution.',
        category: 'Photos',
        source: 'X',
        tags: ['cinematic', 'portrait', 'photography', 'popular'],
        isFavorite: true,
        exampleImage: '/examples/photos/cinematic_portrait.png'
    },
    {
        title: 'High-Fashion Editorial',
        content: 'Hyper-realistic fashion editorial image of [subject] for a luxury magazine cover. Subject stands confidently in a glamorous full-length gown with elegant heels on a Parisian street at night. Cinematic lighting, moody and luxurious palette.',
        category: 'Photos',
        source: 'X',
        tags: ['fashion', 'editorial', 'luxury', 'trending'],
        isFavorite: false,
        exampleImage: '/examples/photos/high_fashion.png'
    },
    {
        title: 'Vintage Polaroid Aesthetic',
        content: 'Create a retro Polaroid-style photo booth strip featuring [subject]. Face(s) should remain exactly as they appear in the original image. Use the iconic white Polaroid-style frame, soft flash lighting, and slightly faded tones for a nostalgic effect.',
        category: 'Images',
        source: 'X',
        tags: ['vintage', 'polaroid', 'retro', 'creative'],
        isFavorite: false,
        exampleImage: '/examples/images/vintage_polaroid.png'
    },
    {
        title: 'Double Exposure Art',
        content: 'Double exposure artistic portrait of a [subject], blended seamlessly with a serene nature landscape. Inside their silhouette, depict a nostalgic scene. Emotional, warm, and cinematic tone.',
        category: 'Images',
        source: 'X',
        tags: ['artistic', 'double-exposure', 'surreal'],
        isFavorite: true,
        exampleImage: '/examples/images/double_exposure.png'
    },
    {
        title: 'Neon Cybernetic Surrealism',
        content: 'Futura girl silhouette, cybernetic surrealism, art and light fuse purple phosphorus essence. High contrast, vivid colors.',
        category: 'Images',
        source: 'X',
        tags: ['cyberpunk', 'neon', 'surreal', 'viral'],
        isFavorite: false,
        exampleImage: '/examples/images/neon_surrealism.png'
    },
    // NEW USER PROMPTS - IMAGES
    {
        title: 'Photo Restoration (Simple)',
        content: 'Imagine you are a professional photo restorer. Restore this photo perfectly. Make it sharp and improve resolution. Get rid of scratches. Make it look as if it was taken today with modern equipment.',
        category: 'Photos',
        source: 'User',
        tags: ['restoration', 'fix', 'enhance'],
        isFavorite: false
    },
    {
        title: 'Photo Restoration (Advanced 8K)',
        content: 'Create an ultra-realistic 8K restored version of this old, damaged photograph. The image should retain the original person’s identity and features but be enhanced with lifelike skin texture, sharp facial details, and natural lighting. Remove scratches, stains, and blur while preserving authenticity. The colors should be soft, balanced, and natural—reviving faded tones into a rich, full-color look. Add depth, contrast, and gentle shadows to create a vibrant yet realistic restored portrait with DSLR-quality clarity and detail.',
        category: 'Photos',
        source: 'User',
        tags: ['restoration', '8k', 'advanced', 'realistic'],
        isFavorite: false
    },
    {
        title: 'Vogue Studio Headshot',
        content: 'Studio Vogue fashion portrait of the person in the reference image. Neutral gray backdrop. Soft diffused key light. High-end editorial styling. Photography inspired by Annie Leibovitz and Peter Lindbergh. Clear skin detail, elegant expression, subtle shadows. Minimal color tones, refined and tasteful.',
        category: 'Photos',
        source: 'User',
        tags: ['studio', 'vogue', 'portrait', 'editorial'],
        isFavorite: false
    },
    {
        title: 'Historical Timeline Grid',
        content: 'Make a 4×4 grid starting with the 1880s. In each section, I should appear styled according to that decade (clothing, hairstyle, facial hair, accessories). Use colors, background, & film style accordingly.',
        category: 'Images',
        source: 'User',
        tags: ['historical', 'grid', 'timeline', 'creative'],
        isFavorite: false
    },
    {
        title: 'High-Contrast Noir Portrait',
        content: 'A powerful, high-contrast black-and-white side-profile portrait of a person (use attached photo for reference), with distinctly human yet timeless features — emerging from complete darkness. The composition is minimalist and sculptural, where form, light, and shadow define the subject rather than color or texture.\n\nThe subject’s profile is clean and strong, with a contemplative expression, as if caught between thought and transcendence. They wear a dark, form-fitting turtleneck sweater that merges seamlessly into the black void, erasing all detail except for the glowing edge of their silhouette.\n\nLighting: A single, narrow rim light—bright, sharp, and directional—carves out the shape of the head, neck, and shoulder, tracing the contours with precision. The light originates from directly behind and slightly above the subject, creating a thin, luminous halo along the jawline and the curve of the skull, while the rest dissolves into pure black.\n\nBackground: Absolute darkness, a void without texture or depth, emphasizing the luminous boundary between shadow and light. There are no midtones, only the purest black and the brightest whites.\n\nTechnical details: Shot with a telephoto lens for compressed perspective. Aperture wide open (f/1.8-2.8) to focus on the glowing contour with shallow depth of field. Rendered with ultra-realistic 8K cinematic quality, incorporating true lens physics, subtle film grain, and good lighting.',
        category: 'Photos',
        source: 'User',
        tags: ['noir', 'bw', 'portrait', 'dramatic'],
        isFavorite: false
    },

    // --- APPS & UI/UX ---
    {
        title: 'Minimalist App Interface',
        content: 'Minimalist app design interface, clean lines, modern UI/UX, flat design style, user-friendly, intuitive navigation. Focus on whitespace and typography.',
        category: 'Apps',
        source: 'X',
        tags: ['ui', 'ux', 'minimalist', 'app-design'],
        isFavorite: false
    },
    {
        title: 'Dark Mode Finance App',
        content: 'Dark mode finance app design, sleek and elegant, modern UI/UX, flat design style. Black backgrounds, dark grey UI elements, and neon green highlights for data visualization.',
        category: 'Apps',
        source: 'X',
        tags: ['finance', 'dark-mode', 'ui', 'modern'],
        isFavorite: true
    },
    {
        title: 'App Icon Set',
        content: '/imagine a collection of minimalist icons for a mobile app, including icons for home, search, messages, settings, and notifications. Vector style, flat design, white background.',
        category: 'Apps',
        source: 'Midjourney',
        tags: ['icons', 'ui', 'assets'],
        isFavorite: false
    },
    {
        title: 'Futuristic Glassmorphism UI',
        content: 'Futuristic app design, neon accents, glassmorphism effects, modern UI/UX. Translucent cards, blurred backgrounds, and vibrant gradients.',
        category: 'Apps',
        source: 'X',
        tags: ['glassmorphism', 'futuristic', 'ui', 'trending'],
        isFavorite: false
    },

    // --- CODING & AUTOMATION ---
    {
        title: 'The Sarcastic Senior Dev',
        content: 'Pretend you\'re my slightly sarcastic senior dev. Rewrite my code with inline comments that roast me for every mistake, and then explain the correct approach. Here is the code: [paste code]',
        category: 'Coding',
        source: 'X',
        tags: ['humor', 'code-review', 'python', 'javascript'],
        isFavorite: true
    },
    {
        title: 'Explain Like I\'m 5 (ELI5)',
        content: 'Explain this complex code snippet to me like I\'m a 5-year-old. Use analogies and simple language to describe the logic and flow: [paste code]',
        category: 'Coding',
        source: 'Reddit',
        tags: ['learning', 'explanation', 'beginner'],
        isFavorite: false
    },
    {
        title: 'Unit Test Generator',
        content: 'Write comprehensive unit tests for the following function using [Testing Framework, e.g., Jest/Pytest]. Include edge cases and error handling scenarios: [paste function]',
        category: 'Coding',
        source: 'ChatGPT',
        tags: ['testing', 'qa', 'automation'],
        isFavorite: false
    },
    {
        title: 'Code Refactoring Expert',
        content: 'Refactor the following code to improve readability and performance. Apply DRY principles and modern syntax. Explain the changes you made: [paste code]',
        category: 'Coding',
        source: 'X',
        tags: ['refactoring', 'clean-code', 'optimization'],
        isFavorite: false
    },
    // NEW USER PROMPTS - CODING
    {
        title: 'The n8n AI Agent Architect',
        content: '<role>\nYou are an experienced automation architect with advanced knowledge of building AI-powered agents in n8n. You have deep expertise in automation flows, activation triggers, third-party APIs, GPT connections, custom JavaScript logic, and error handling.\n</role>\n\n<task>\nWalk me through, step by step, how to create an AI-powered agent in n8n. The agent’s purpose is: {$AGENT_PURPOSE}\n</task>\n\n<requirements>\n1. Begin by defining the agent\'s objectives and necessary inputs/outputs.\n2. Create the overall architecture for the agent workflow.\n3. Suggest the required n8n nodes to include (built-in, HTTP, function, OpenAI, etc.).\n4. Explain how to configure each node and why it’s needed.\n5. Provide instructions for any custom logic (JavaScript functions, expressions, etc).\n6. Help me implement retry logic, error handling, and backup procedures.\n7. Show how to store and access data between runs (e.g., with Memory, Databases, or Google Sheets).\n8. When the agent requires external APIs or services, explain the connection and authentication process.\n</requirements>\n\n<output_style>\nBe exceptionally clear and practical, as if coaching a beginner automation developer. Use visual formats if possible (e.g., structured lists, flow-style layout), and always provide ready-to-implement node configurations or code examples.\n</output_style>\n\n<expandability>\nConclude by recommending ways to increase the agent\'s capabilities, such as workflow chaining, webhook integration, or connections to vector databases, CRMs, or Slack.\n</expandability>',
        category: 'Coding',
        source: 'User',
        tags: ['n8n', 'automation', 'agent', 'architect'],
        isFavorite: false
    },
    {
        title: 'JSON Book Recommender',
        content: '{\n  "task": "recommend books",\n  "topic": "thinking clearly",\n  "audience": "entrepreneurs",\n  "output_format": "list of 5 with one-sentence summaries"\n}',
        category: 'Coding',
        source: 'User',
        tags: ['json', 'structured', 'books'],
        isFavorite: false
    },
    {
        title: 'JSON Data Analyst',
        content: '{\n  "task": "analyze_dataset",\n  "output_format": "executive_summary",\n  "objectives": [\n    "key_trends_and_patterns",\n    "anomalies_or_outliers",\n    "statistical_significance",\n    "business_implications",\n    "recommended_actions"\n  ]\n}',
        category: 'Coding',
        source: 'User',
        tags: ['json', 'data-analysis', 'structured'],
        isFavorite: false
    },
    {
        title: 'Universal XML Prompt Template',
        content: '<task>[What to do]</task>\n<topic>[Optional subject]</topic>\n<format>[Output type: Email, Code, Slides]</format>\n<tone>[Casual, Formal, etc]</tone>\n<persona>[Optional speaker]</persona>\n<audience>[Who it\'s for]</audience>\n<input>[Your content or request]</input>\n<constraints>[Length, style, language, rules]</constraints>',
        category: 'Coding',
        source: 'User',
        tags: ['xml', 'template', 'meta-prompt'],
        isFavorite: false
    },

    // --- WRITING & STRATEGY ---
    {
        title: 'Viral Thread Generator',
        content: 'Act as a viral content strategist. Generate a 7-tweet thread on the topic of "[Topic]". Follow the Hook → Story → Lesson → CTA model. Include 3 distinct hook options. Tone: inspiring and concise.',
        category: 'Writing',
        source: 'X',
        tags: ['social-media', 'marketing', 'viral'],
        isFavorite: true
    },
    {
        title: 'The "Unexpected Perspective"',
        content: 'Write a very short story (max 280 chars) from the perspective of an inanimate object observing a human event. Focus on a surprising insight or poignant detail.',
        category: 'Writing',
        source: 'X',
        tags: ['creative', 'storytelling', 'micro-fiction'],
        isFavorite: false
    },
    {
        title: 'Myth Buster Tweet',
        content: 'Generate a tweet debunking a popular misconception about [Topic]. Start with a strong "Did you know?" hook, present the myth, and reveal the truth. Concise and authoritative.',
        category: 'Writing',
        source: 'X',
        tags: ['educational', 'social-media', 'facts'],
        isFavorite: false
    },
    {
        title: 'Sensory Description',
        content: 'Describe a [Setting/Scene] using only sensory details (sight, sound, smell, touch, taste). Avoid abstract adjectives. Show, don\'t tell.',
        category: 'Writing',
        source: 'Reddit',
        tags: ['creative-writing', 'descriptive', 'exercise'],
        isFavorite: false
    },
    // NEW USER PROMPTS - WRITING/STRATEGY
    {
        title: 'The All-In-One Co-Founder',
        content: '<task>\nYou are my all-in-one technical cofounder, product strategist, UI/UX designer, copywriter, and launch expert.\nWe\'re building a SaaS startup together, step by step.\nYour role is to guide and execute each major milestone — but only continue after I review and approve the current step.\n</task>\n\n<product_idea>\nA [INSERT PRODUCT TYPE] SaaS that helps [TARGET USER] solve [PAIN POINT] using [SHORT TECH VALUE PROP]\n</product_idea>\n\n<instructions>\nStart by completing the first mission below. Once it\'s done, pause and ask:\n“Would you like to proceed to the next step, or revise this one?”\n\nHere’s the full step-by-step sequence you’ll execute **one at a time**:\n1. Validate the target audience and define the core user problem\n2. Propose a focused MVP feature list (prioritize essentials only)\n3. Write backend code in [Python/FastAPI/etc] to implement the MVP\n4. Describe the UI/UX structure (components + layout + flow)\n5. Write Webflow-ready landing page copy (headline, value, CTA)\n6. Draft Twitter launch thread + Product Hunt listing\n7. Outline a 7-day content strategy for initial traction\n\nBe concise but complete. Use markdown headers to structure each output. Treat this like a collaborative startup sprint — you lead, I approve.\n</instructions>',
        category: 'Writing',
        source: 'User',
        tags: ['startup', 'strategy', 'saas', 'business'],
        isFavorite: false
    },
    {
        title: 'Decision Making Framework',
        content: 'Help me think through this situation [describe it] step-by-step and suggest 2–3 possible ways to move forward with pros and cons.',
        category: 'Writing',
        source: 'User',
        tags: ['decision-making', 'logic', 'strategy'],
        isFavorite: false
    },
    {
        title: 'The Prompt Engineering Masterclass',
        content: '<role>\nYou are a master craftsman of thought articulation - someone who has spent decades helping brilliant minds translate their inner visions into external reality. You understand that the difference between mediocre and extraordinary lies not in having better tools, but in the precision with which we can capture and express our deepest intentions. You communicate with the wisdom of someone who has seen patterns across thousands of creative breakthroughs, speaking in a calm, insightful manner that makes complex ideas feel naturally accessible.\n</role>\n\n<transformation_framing>\n- Current state: Someone who relies on prompt tools and templates, creating structurally correct but soulless prompts\n- Desired identity: A thought architect who can excavate and articulate their deepest creative intentions\n- Breakthrough moment: Realizing that prompt engineering is actually a form of self-discovery and precise thinking\n- Personal relevance: Every interaction with AI becomes an opportunity to clarify and amplify their unique perspective\n</transformation_framing>\n\n<masterclass_philosophy>\nThe quality of your prompts has nothing to do with the tools you use and everything to do with how clearly you can see your own mind. Most people outsource prompt creation to templates and generators, but this misses the entire point. The real magic happens when you can articulate:\n- The exact cognitive pathway you want the AI to walk down\n- The specific emotional resonance you\'re trying to create\n- The underlying framework or system you\'re building toward\n- The artistic vision that lives in your imagination\n</masterclass_philosophy>\n\n<discovery_methodology>\nI will guide you through a series of thoughtful explorations and practical exercises, one at a time. Each question and exercise is designed to help you uncover something you already know but haven\'t yet articulated. Think of me as someone helping you mine gold from your own mind - the treasure is already there, we\'re just learning to recognize it and bring it to the surface.\nWe\'ll move slowly and deliberately. No rushing, no interviews, no checklists. Just one good question or exercise, then time to practice and reflect, then the next natural step in your understanding.\n</discovery_methodology>\n\n<practical_exercises>\nCreate specific exercises that progressively build their articulation skills:\n1. Vision archaeology: Describe something created that you\'re proud of, uncovering the thinking process.\n2. Cognitive pathway mapping: Write out every mental step required for a task.\n3. Emotional resonance identification: Articulate exactly what emotional journey a piece of content created.\n4. Framework extraction: Identify the underlying system naturally used in an expertise area.\n5. Intention archaeology: Dig deeper into a vague request to find the true creative desire.\n</practical_exercises>\n\n<session_structure>\nStart by explaining the core philosophy above, then ask your first discovery question. After response, introduce the first exercise naturally.\nYour questions and exercises should help them discover:\n1. What they\'re really trying to create (beyond the surface request)\n2. How they want people to feel when experiencing their creation\n3. What system of thinking they want to embed in the output\n4. What makes their vision distinctly theirs\n</session_structure>\n\n<first_interaction>\nBegin by sharing the core insight about prompt quality being about thought articulation, then ask your opening question - something that helps them reflect on a time when they had a clear vision but struggled to communicate it.\n</first_interaction>',
        category: 'Writing',
        source: 'User',
        tags: ['learning', 'meta-prompting', 'masterclass'],
        isFavorite: false
    },
    // --- NANO BANANA PRO PROMPTS ---
    {
        title: 'Wide Quote Card',
        content: 'A prompt for generating a wide quote card featuring a famous person’s portrait, with a brown background, light-gold serif quote text, and layout where text occupies two-thirds and the person one-third. The quote text and author are parameterized for reuse.',
        category: 'Images',
        source: 'Nano Banana',
        tags: ['quote', 'card', 'portrait'],
        isFavorite: false
    },
    {
        title: 'Watercolor Map of Germany',
        content: 'A German prompt to generate a watercolor-style map of Germany where all federal states are labeled in ballpoint pen, useful for educational or infographic-style maps.',
        category: 'Images',
        source: 'Nano Banana',
        tags: ['map', 'watercolor', 'germany'],
        isFavorite: false
    },
    {
        title: 'Train-Ad Book Advertisement',
        content: 'A detailed Japanese prompt for generating a 16:9 business-book-style advertisement featuring a specific book image with Japanese copy points.',
        category: 'Images',
        source: 'Nano Banana',
        tags: ['advertisement', 'book', 'japanese'],
        isFavorite: false
    },
    {
        title: 'Dream Diary with Kirby',
        content: 'A cute prompt for a dreamy diary-style illustration of a pink Kirby sleeping on a star, blowing rainbow bubbles amid pastel clouds and candy.',
        category: 'Images',
        source: 'Nano Banana',
        tags: ['kirby', 'cute', 'illustration'],
        isFavorite: false
    },
    {
        title: 'Otaku Room Mirror Selfie',
        content: 'A very detailed Nano Banana prompt describing a female mirror selfie in a blue-toned otaku computer corner, with full specifications for character, environment, lighting, camera, and negative prompts.',
        category: 'Images',
        source: 'Nano Banana',
        tags: ['selfie', 'otaku', 'room'],
        isFavorite: false
    },
    {
        title: 'Historical Moment (1994)',
        content: 'A prompt to create an image of a specific place and time using latitude, longitude and a precise timestamp, ideal for historical reconstructions.',
        category: 'Images',
        source: 'Nano Banana',
        tags: ['historical', 'coordinates', 'reconstruction'],
        isFavorite: false
    },
    {
        title: 'Claymation Day Phases',
        content: 'A prompt for generating a whimsical claymation-style infographic that explains the phases of the day to a six-year-old, ideal for educational visuals or animated explainers.',
        category: 'Images',
        source: 'Nano Banana',
        tags: ['claymation', 'infographic', 'educational'],
        isFavorite: false
    },
    {
        title: 'F1 VIP Fan Selfie',
        content: 'An extensive prompt for transforming a user’s selfie into an 8K hyper-realistic photo of them as a stylish F1 fan at a premium automotive event, preserving their real face while changing outfit and setting.',
        category: 'Photos',
        source: 'Nano Banana',
        tags: ['selfie', 'f1', 'hyper-realistic'],
        isFavorite: false
    },
    {
        title: 'Professional Studio Portraits',
        content: 'Transform this image into a premium half-body portrait captured in a professional photography studio, featuring urban casual styling with naturally coordinated poses. Focus on facial close-up with an overall atmosphere that is profound yet gentle.',
        category: 'Photos',
        source: 'Nano Banana',
        tags: ['portrait', 'studio', 'professional'],
        isFavorite: false
    },
    {
        title: 'LINE-style Emoji Grid',
        content: 'A prompt for generating colorful hand-drawn LINE-style chibi emoji portraits arranged in a grid with humorous text, ideal for chat stickers or social media reactions.',
        category: 'Images',
        source: 'Nano Banana',
        tags: ['emoji', 'portrait', 'grid'],
        isFavorite: false
    },
    {
        title: 'Time-Travel Scene',
        content: 'A prompt for generating a realistic scene at specific geographic coordinates and historical time, useful for visualizing past events at exact locations.',
        category: 'Images',
        source: 'Nano Banana',
        tags: ['time-travel', 'historical', 'scene'],
        isFavorite: false
    },
    {
        title: 'Isometric Landmark Schematic',
        content: 'A simple template prompt for creating hand-drawn isometric diagrams of landmarks in a square format, useful for stylized maps or educational graphics.',
        category: 'Images',
        source: 'Nano Banana',
        tags: ['isometric', 'landmark', 'schematic'],
        isFavorite: false
    },
    {
        title: 'Cinematic B&W Portrait',
        content: 'A structured prompt for creating a dramatic black-and-white, photorealistic portrait of a serious young woman in a suit, with clearly defined style and camera details.',
        category: 'Photos',
        source: 'Nano Banana',
        tags: ['portrait', 'black-and-white', 'cinematic'],
        isFavorite: false
    },
    {
        title: 'Fridge-Scan Recipe Infographic',
        content: 'A conceptual prompt for turning the contents of a fridge into a simple step-by-step recipe infographic, useful for cooking or food content.',
        category: 'Images',
        source: 'Nano Banana',
        tags: ['recipe', 'infographic', 'fridge'],
        isFavorite: false
    },
    {
        title: 'Knolling-Style Flat-Lay',
        content: 'A detailed prompt for turning any object into an ultra-realistic knolling-style 8K flat-lay image with labeled disassembled parts.',
        category: 'Images',
        source: 'Nano Banana',
        tags: ['knolling', 'flat-lay', 'photo'],
        isFavorite: false
    },
    {
        title: 'Swiss Alpine Winter Portrait',
        content: 'A rich prompt for an ultra-detailed DSLR-style portrait of a young man in a snowy Swiss alpine village during winter evening, with cinematic lighting and shallow depth of field.',
        category: 'Photos',
        source: 'Nano Banana',
        tags: ['portrait', 'winter', 'alpine'],
        isFavorite: false
    },
    {
        title: 'Marvel-Style Comic Storyboard',
        content: 'A prompt for generating vertical-format comic storyboards in vibrant Marvel style, featuring a red-caped heroine rescuing people in a neon-lit futuristic city with a text box about Nano Banana Pro.',
        category: 'Images',
        source: 'Nano Banana',
        tags: ['comic', 'storyboard', 'marvel'],
        isFavorite: false
    },
    {
        title: 'Sketchnote Artist',
        content: 'Create visual summaries like a seasoned Sketchnote artist. This shortcut distills any text into clean, hand-drawn diagrams, ensuring your audience grasps complex ideas instantly. Achieve effortless clarity.',
        category: 'Images',
        source: 'Nano Banana',
        tags: ['sketchnote', 'diagram', 'visual'],
        isFavorite: false
    },
    {
        title: 'Cinematic Rooftop Portrait',
        content: 'A detailed prompt to generate a hyperrealistic vertical 8K cinematic shot of the man from the attached photos, sitting on a skyscraper edge during golden hour with shallow depth of field and strong bokeh.',
        category: 'Photos',
        source: 'Nano Banana',
        tags: ['portrait', 'cinematic', 'rooftop'],
        isFavorite: false
    },
    {
        title: 'Cartoon Version',
        content: 'A prompt for converting a provided image into a coherent cartoon-style version while preserving its structure and details.',
        category: 'Images',
        source: 'Nano Banana',
        tags: ['cartoon', 'conversion', 'style'],
        isFavorite: false
    },
    {
        title: 'Technical Exploded View',
        content: 'A reusable prompt template for creating labeled exploded view diagrams of any subject in a square format, useful for product breakdowns or educational visuals.',
        category: 'Images',
        source: 'Nano Banana',
        tags: ['diagram', 'exploded-view', 'technical'],
        isFavorite: false
    },
    {
        title: 'Futuristic Age-Checker',
        content: 'A long, detailed prompt for creating a hyper-realistic portrait infographic that analyzes facial aging factors with overlays and labeled percentages, styled like a premium cosmetic-tech ad.',
        category: 'Images',
        source: 'Nano Banana',
        tags: ['infographic', 'portrait', 'futuristic'],
        isFavorite: false
    },
    {
        title: 'Manga-Style Comic Generator',
        content: 'A prompt that tells Nano Banana Pro to act like a Japanese manga artist with a Demon Slayer–like hand-drawn style and convert supplied content into Chinese-language comic panels.',
        category: 'Images',
        source: 'Nano Banana',
        tags: ['manga', 'comic', 'storyboard'],
        isFavorite: false
    },
    {
        title: 'Filming Setup Visualization',
        content: 'A prompt to generate a realistic diagram-like image showing camera and lighting placement for filming a given scene, with elements clearly labeled.',
        category: 'Images',
        source: 'Nano Banana',
        tags: ['filming', 'setup', 'visualization'],
        isFavorite: false
    },
    {
        title: 'Vintage Engineering Diagram',
        content: 'A concise Chinese prompt instructing Nano Banana Pro to create a retro-style engineering exploded diagram of the Zhuge repeating crossbow, with all labels in Chinese.',
        category: 'Images',
        source: 'Nano Banana',
        tags: ['vintage', 'engineering', 'diagram'],
        isFavorite: false
    },
    {
        title: 'Vintage Cookbook Illustration',
        content: 'A prompt for transforming a food photo into a hand-drawn vintage cookbook recipe page with labeled ingredients and handwritten text, great for cozy food content.',
        category: 'Images',
        source: 'Nano Banana',
        tags: ['recipe', 'illustration', 'vintage'],
        isFavorite: false
    },
    {
        title: 'IllustrateX',
        content: 'Use Nano Banana to turn an article into a series of easy-to-understand images.',
        category: 'Images',
        source: 'Nano Banana',
        tags: ['illustration', 'article', 'images'],
        isFavorite: false
    },
    {
        title: 'Cinematic Multi-Panel Sequence',
        content: 'A short prompt for generating a cinematic multi-panel widescreen sequence illustrating an imaginative script from the novel IT.',
        category: 'Images',
        source: 'Nano Banana',
        tags: ['cinematic', 'sequence', 'it'],
        isFavorite: false
    },
    {
        title: 'Editorial Denim Portrait',
        content: 'A JSON-style prompt for creating an 8K editorial fashion portrait of a person in a denim outfit and shearling jacket, while keeping their face identical to the reference photo.',
        category: 'Photos',
        source: 'Nano Banana',
        tags: ['portrait', 'fashion', 'editorial'],
        isFavorite: false
    }
];

const seed = async () => {
    try {
        console.log('Running schema...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await query(schema);
        console.log('Schema created.');

        console.log('Seeding prompts...');

        // Clear existing public prompts (user_id IS NULL) to avoid duplicates
        await query('DELETE FROM prompts WHERE user_id IS NULL');

        for (const prompt of INITIAL_PROMPTS) {
            await query(
                'INSERT INTO prompts (title, content, category, source, tags, is_public) VALUES ($1, $2, $3, $4, $5, $6)',
                [prompt.title, prompt.content, prompt.category, prompt.source, prompt.tags, true]
            );
        }

        console.log('Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seed();
