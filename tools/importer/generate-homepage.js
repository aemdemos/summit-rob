/**
 * Homepage content generator for Robert Half migration.
 * Generates EDS-compatible .plain.html content for each section.
 * Run: node tools/importer/generate-homepage.js
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const outputPath = 'content/us/en.plain.html';

// Local image paths (downloaded from Scene7, stored in content/us/en/media/)
const heroImg = './media/hero-bg.png';

// Card images
const cardImg1 = './media/salary-guide.png';
const cardImg2 = './media/demand-skilled-talent.png';
const cardImg3 = './media/ai-recruiting.png';
const cardImg4 = './media/labor-market.png';

// Illustration
const illustrationImg = './media/why-rh-illustration.png';

// Tab section squircle images
const tabImgLarge = './media/tab-squircle-lg.png';
const tabImgSmall1 = './media/tab-squircle-sm1.png';
const tabImgSmall2 = './media/tab-squircle-sm2.png';

function generateHero() {
  return `<div class="hero">
  <div>
    <div>
      <picture><img src="${heroImg}" alt="Professional woman" loading="eager" width="1600" height="900"></picture>
    </div>
    <div>
      <h1><b>Anything's possible</b> when you have the <b>talent</b></h1>
      <p>Find skilled candidates, in-demand jobs and the solutions you need to help you do your best work yet.</p>
      <p class="button-container"><strong><a href="/us/en/find-jobs">Find a job</a></strong></p>
      <p class="button-container"><em><a href="/us/en/hire-talent">Find talent</a></em></p>
    </div>
  </div>
</div>`;
}

function generateInsightsCards() {
  return `<div class="cards">
  <div>
    <div>
      <picture><img src="${cardImg1}" alt="2026 Salary Guide" loading="lazy"></picture>
    </div>
    <div>
      <h3><a href="/us/en/insights/salary-guide">2026 Salary Guide</a></h3>
      <p>Explore the latest data for roles across 7 professional fields and what you should pay or earn in local and national markets.</p>
    </div>
  </div>
  <div>
    <div>
      <picture><img src="${cardImg2}" alt="Demand for Skilled Talent" loading="lazy"></picture>
    </div>
    <div>
      <h3><a href="/us/en/insights/salary-hiring-trends/demand-for-skilled-talent">Demand for Skilled Talent</a></h3>
      <p>Check out our Demand for Skilled Talent report to learn about employers' hiring plans and needs.</p>
    </div>
  </div>
  <div>
    <div>
      <picture><img src="${cardImg3}" alt="AI in recruiting" loading="lazy"></picture>
    </div>
    <div>
      <h3><a href="/us/en/insights/ai-hiring-impact">AI in recruiting</a></h3>
      <p>AI is transforming hiring by adding complexity. Navigate the changing landscape with our AI in Recruiting insights.</p>
    </div>
  </div>
  <div>
    <div>
      <picture><img src="${cardImg4}" alt="Labor market overview" loading="lazy"></picture>
    </div>
    <div>
      <h3><a href="/us/en/insights/labor-market-overview">Labor market overview</a></h3>
      <p>Stay on top of U.S. Bureau of Labor Statistics and job posting data to learn about today's hiring market.</p>
    </div>
  </div>
</div>`;
}

function generateStats() {
  return `<div class="stats">
  <div>
    <div>
      <h3>#1</h3>
      <p>on Forbes' List of America's Best Professional Recruiting Firms for 7 consecutive years</p>
    </div>
  </div>
  <div>
    <div>
      <h3>2 million +</h3>
      <p>contract and permanent placements and counting</p>
    </div>
  </div>
  <div>
    <div>
      <h3>300+</h3>
      <p>locations to access local expertise near you, or around the world</p>
    </div>
  </div>
</div>`;
}

function generateValueProps() {
  return `<div class="columns">
  <div>
    <div>
      <picture><img src="${illustrationImg}" alt="Why Robert Half illustration" loading="lazy"></picture>
    </div>
    <div>
      <h4>Help you hire, your way</h4>
      <p>Start online or with a recruiter. Our team leverages experience and award-winning AI to deliver top available talent, your way.</p>
      <h4>Skilled talent for the job</h4>
      <p>Our experienced, specialized recruiting professionals, assisted by proprietary AI, deliver top available talent. We look beyond the resume to find candidates with the skills to help your business thrive.</p>
      <h4>Experience that delivers</h4>
      <p>Our specialized recruiters combine deep industry knowledge and local market insights to develop a flexible workforce strategy to match your business.</p>
    </div>
  </div>
</div>`;
}

function generateTabs() {
  const tabsData = [
    {
      label: 'Finance & Accounting',
      desc: 'From accountants to CFOs, we\'ll bring you top candidates with in-demand skills and experience and help manage the hiring process for you.',
      jobs: [
        ['Accounts receivable specialist', '/us/en/job-details/accounts-receivable-specialist'],
        ['Senior accountant', '/us/en/job-details/senior-accountant'],
        ['Corporate controller', '/us/en/job-details/controller'],
        ['Financial analyst', '/us/en/job-details/financial-analyst'],
        ['Business analyst', '/us/en/job-details/business-analyst'],
        ['Senior Auditor', '/us/en/job-details/internal-auditor'],
      ],
      link: ['/us/en/accounting-finance', 'Learn more about our Accounting and Finance hiring solutions'],
    },
    {
      label: 'Technology',
      desc: 'From cybersecurity professionals to developers, we\'ll bring you top candidates with in-demand skills and experience and help manage the hiring process for you.',
      jobs: [
        ['AI Engineer', '/us/en/job-details/aiml-engineer'],
        ['Data Engineer', '/us/en/job-details/data-engineer'],
        ['ERP Business Analyst', '/us/en/job-details/erp-business-analyst'],
        ['IT Project Manager', '/us/en/job-details/it-project-manager'],
        ['Security Architect', '/us/en/job-details/security-architect'],
        ['Software Engineer', '/us/en/job-details/software-engineer'],
      ],
      link: ['/us/en/tech-it', 'Learn more about our Technology hiring solutions'],
    },
    {
      label: 'Marketing & Creative',
      desc: 'From copywriters to creative directors, we\'ll bring you top candidates with in-demand skills and experience and help manage the hiring process for you.',
      jobs: [
        ['Visual Designer (UX)', '/us/en/job-details/visual-designer'],
        ['Marketing Automation Specialist', '/us/en/job-details/marketing-automation-specialist'],
        ['Email Marketing Manager (automation)', '/us/en/job-details/email-marketing-manager'],
        ['Digital Marketing Specialist (Automation and Analytics)', '/us/en/job-details/digital-marketing-specialist'],
        ['Product Manager (UX or DPM)', '/us/en/job-details/product-manager'],
        ['Web Developer (FED)', '/us/en/job-details/web-developer'],
      ],
      link: ['/us/en/marketing-creative', 'Learn more about our Marketing and Creative hiring solutions'],
    },
    {
      label: 'Legal',
      desc: 'From lawyers to paralegals, we\'ll bring you top candidates with in-demand skills and experience and help manage the hiring process for you.',
      jobs: [
        ['Attorney', '/us/en/job-details/lawyerattorney-10-years-experience'],
        ['Contract manager', '/us/en/job-details/contract-manager'],
        ['Legal operations manager', '/us/en/job-details/legal-operations-manager'],
        ['General counsel', '/us/en/job-details/general-counsel'],
        ['Compliance director', '/us/en/job-details/compliance-director'],
        ['Compliance analyst', '/us/en/job-details/compliance-analyst'],
      ],
      link: ['/us/en/legal', 'Learn more about our Legal hiring solutions'],
    },
    {
      label: 'Administrative & Customer Support',
      desc: 'From office managers to customer service professionals, we\'ll bring you top candidates with in-demand skills and experience and help manage the hiring process for you.',
      jobs: [
        ['HR generalist', '/us/en/job-details/hr-generalist'],
        ['HR assistant', '/us/en/job-details/hr-assistant'],
        ['Customer experience specialist', '/us/en/job-details/customer-experience-specialist'],
        ['Executive assistant', '/us/en/job-details/executive-assistant'],
        ['Administrative assistant', '/us/en/job-details/administrative-assistant'],
        ['Project assistant/coordinator', '/us/en/job-details/project-assistantcoordinator'],
      ],
      link: ['/us/en/administrative', 'More about our Admin and Customer Support hiring solutions'],
    },
  ];

  const rows = tabsData.map((tab) => {
    const jobLinks = tab.jobs.map(([title, url]) => `<li><a href="${url}">${title}</a></li>`).join('\n          ');
    return `  <div>
    <div>${tab.label}</div>
    <div>
      <p>${tab.desc}</p>
      <h5>Trending job titles</h5>
      <ul>
          ${jobLinks}
      </ul>
      <p><a href="${tab.link[0]}">${tab.link[1]} →</a></p>
      <p>
        <picture><img src="${tabImgLarge}" alt="" loading="lazy"></picture>
        <picture><img src="${tabImgSmall1}" alt="" loading="lazy"></picture>
        <picture><img src="${tabImgSmall2}" alt="" loading="lazy"></picture>
      </p>
    </div>
  </div>`;
  }).join('\n');

  return `<div class="tabs">
${rows}
</div>`;
}

function generateTestimonials() {
  const testimonials = [
    ['"Anyone searching knows how hard it is to find a position that aligns with your goals. They connected me with the perfect job."', 'Sales assistant'],
    ['"Robert Half was able to get the person we needed to do the project in less than a week."', 'Billing analyst'],
    ['"I am in a position that fits me. Robert Half is making working from home so much easier. The support is amazing."', 'Customer service representative'],
    ['"Exceptionally professional, efficient, and effective. Even with the challenging market, they have done everything in their power to help us."', 'Human resources director'],
    ['"I\'ve worked with recruiters across several placements and am always impressed with their enthusiasm, empathy and communication."', 'Graphic designer'],
    ['"Robert Half understood our expectations and brought me unicorn candidates — the kind who get rave reviews by colleagues in their first week."', 'Chief client officer'],
    ['"They led me to a company where I landed a permanent role! I felt so supported by Robert Half."', 'Administrative coordinator'],
    ['"Our workload changes. It\'s great to know Robert Half has talented people at the ready. Flexible staffing without all the fluff."', 'Online marketing manager'],
    ['"Because of Robert Half, I landed a job that fits my career aspirations from both a personal and professional perspective."', 'Design manager'],
    ['"Their communication is top notch. They always keep me in the know and make it easy to ask questions."', 'Help desk analyst'],
    ['"The skill of the candidates has been exceptional. So exceptional that we\'ve hired two of them to work for us on a full-time basis."', 'Personnel administrator'],
    ['"The people at Robert Half have been the most efficient, dignified and productive in comparison to other firms."', 'Desktop support analyst'],
    ['"I\'ve worked with Robert Half over two separate organizations and have been 100% satisfied with their work."', 'IT director'],
    ['"Excellent attention to detail in assessing our needs and offering a wide variety of candidates."', 'Office manager'],
  ];

  const rows = testimonials.map(([quote, role]) => `  <div>
    <div>
      <p>${quote}</p>
      <p><strong>- ${role}</strong></p>
    </div>
  </div>`).join('\n');

  return `<div class="carousel">
${rows}
</div>`;
}

// Assemble all sections — each wrapped in a <div> to create an EDS section
const sectionDivs = [];

// Section 1: Hero (full-width, no padding)
sectionDivs.push(`<div>
${generateHero()}
<div class="section-metadata">
  <div><div>style</div><div>full-width</div></div>
</div>
</div>`);

// Section 2: Hiring trends cards
sectionDivs.push(`<div>
<h2>Hiring trends and insights</h2>
${generateInsightsCards()}
</div>`);

// Section 3: Stats - Why Robert Half
sectionDivs.push(`<div>
<h2>Why Robert Half</h2>
${generateStats()}
</div>`);

// Section 4: Value propositions columns
sectionDivs.push(`<div>
${generateValueProps()}
</div>`);

// Section 5: Tabbed content (light background)
sectionDivs.push(`<div>
<h2>Add specialized talent across your organization</h2>
${generateTabs()}
<div class="section-metadata">
  <div><div>style</div><div>light</div></div>
</div>
</div>`);

// Section 6: Testimonials
sectionDivs.push(`<div>
<h2>Explore testimonials</h2>
${generateTestimonials()}
</div>`);

// Build final HTML
const html = sectionDivs.join('\n');

// Write to file
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, html);

console.log(`✅ Homepage content generated: ${outputPath}`);
