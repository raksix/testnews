import { MongoClient } from "mongodb";

const URI = process.env.MONGODB_URI || "mongodb://admin:admin123@127.0.0.1:27017/?authSource=admin";
const DB = process.env.MONGODB_DB || "testnews";

const articles = [
  {
    slug: "global-markets-rally-as-inflation-cools",
    title: "Global Markets Rally as Inflation Cools Faster Than Expected",
    excerpt:
      "Stock indices across the US, Europe and Asia surged after fresh data showed consumer prices rising at the slowest pace in three years.",
    content:
      "Global equity markets staged a powerful rally on Thursday after the latest inflation data came in well below analyst expectations, reigniting hopes of an imminent interest rate cut.\n\n## A Broad-Based Advance\n\nThe rally was broad-based, with technology, financial and industrial shares all posting strong gains. The S&P 500 climbed 2.1 percent, while Europe's Stoxx 600 added 1.8 percent and Asian markets followed suit overnight.\n\n## What the Data Shows\n\n- Consumer prices rose 0.1 percent month over month, the smallest increase in three years\n- Core inflation, which excludes food and energy, also cooled significantly\n- Wage growth moderated, easing concerns about a wage-price spiral\n\n## Central Bank Reaction\n\nTraders are now pricing in a 78 percent probability of a rate cut at the next central bank meeting, up from 52 percent just a week ago. \"The data gives policymakers the cover they need to ease,\" said one senior economist.\n\nAnalysts caution, however, that a single month of data does not make a trend, and geopolitical tensions remain a wildcard for markets.",
    category: "Business",
    image: "",
    author: "Sarah Mitchell",
    featured: true,
  },
  {
    slug: "breakthrough-quantum-computer-solves-previously-impossible-problem",
    title: "Breakthrough: Quantum Computer Solves Previously Impossible Problem",
    excerpt:
      "Researchers say the new 1,000-qubit machine completed a complex simulation in minutes that would take a classical supercomputer thousands of years.",
    content:
      "Scientists have unveiled a quantum computer that has successfully solved a computational problem widely considered intractable for classical machines, marking a major milestone in the field.\n\n## The Achievement\n\n- The machine completed the simulation in 4 minutes\n- The same calculation would take a classical supercomputer an estimated 3,000 years\n- Error correction was achieved without sacrificing qubit count\n\n## Why It Matters\n\nQuantum computers leverage the principles of superposition and entanglement to process vast numbers of possibilities simultaneously. This particular breakthrough demonstrates that error correction — long the field's biggest hurdle — is now practical at scale.\n\n## What's Next\n\nIndustry observers say the technology remains years away from broad commercial use, but the achievement accelerates the timeline for applications in drug discovery, materials science and cryptography.",
    category: "Science",
    image: "",
    author: "Dr. Elena Vasquez",
    featured: true,
  },
  {
    slug: "ai-chipmaker-announces-next-generation-processor",
    title: "AI Chipmaker Announces Next-Generation Processor With 4x Performance",
    excerpt:
      "The new chip, built on a 2nm process, promises a fourfold performance leap while consuming 30 percent less power than its predecessor.",
    content:
      "A leading semiconductor company has announced its next-generation AI accelerator, claiming a fourfold performance improvement over the previous model while cutting power consumption by nearly a third.\n\n## Key Specifications\n\n- Built on an advanced 2-nanometer manufacturing process\n- 1.2 trillion transistors on a single die\n- 30 percent reduction in power draw\n- Native support for next-generation AI models\n\n## Industry Impact\n\nThe announcement sent ripples through the supply chain, with foundry partners and memory makers seeing their shares rise on expectations of sustained demand. Cloud providers have already placed orders for the second half of the year.\n\nThe company said volume shipments would begin next quarter, with hyperscale customers receiving priority allocation.",
    category: "Technology",
    image: "",
    author: "James Okafor",
    featured: true,
  },
  {
    slug: "world-leaders-agree-on-historic-climate-finance-deal",
    title: "World Leaders Agree on Historic Climate Finance Deal",
    excerpt:
      "After three days of tense negotiations, 120 countries signed a framework to mobilize $300 billion annually for clean energy transitions in developing nations.",
    content:
      "Negotiators from 120 countries have reached a landmark agreement to channel $300 billion per year toward clean energy projects in developing countries, capping three days of intense diplomacy.\n\n## The Framework\n\nThe deal establishes a hybrid model combining public funds with private investment guarantees, aiming to unlock a total of $1 trillion in annual climate finance by 2035.\n\n## Reactions\n\n- Developing nations called the deal \"a meaningful step forward\"\n- Environmental groups urged faster implementation timelines\n- Major emitters committed to updated reduction targets next year\n\n## What Happens Now\n\nSignatories have 90 days to submit national implementation plans. The first disbursements are expected within eighteen months, with priority given to small island states and least-developed countries.",
    category: "World",
    image: "",
    author: "Aisha Rahman",
    featured: true,
  },
  {
    slug: "underdog-wins-world-cup-in-dramatic-penalty-shootout",
    title: "Underdog Wins World Cup in Dramatic Penalty Shootout",
    excerpt:
      "Against all odds, the tournament's lowest-ranked team lifted the trophy after a 5-4 shootout victory, capping a fairytale run that captivated the world.",
    content:
      "In one of the greatest upsets in sporting history, the tournament's lowest-ranked side defeated the defending champions 5-4 on penalties to claim their first-ever title.\n\n## A Fairytale Run\n\nThe team entered the tournament ranked 62nd in the world and were written off before a ball was kicked. They conceded just two goals across seven matches, with their goalkeeper saving three penalties in the final.\n\n## The Final\n\n- 0-0 after extra time\n- 5-4 on penalties\n- 90,000 fans in attendance\n\n## Aftermath\n\nThe winning captain dedicated the victory to the nation's people, calling it \"a dream that became real.\" Millions lined the streets for the victory parade the following day.",
    category: "Sports",
    image: "",
    author: "Miguel Santos",
    featured: false,
  },
  {
    slug: "health-watchdog-approves-new-generic-drug-cutting-costs-by-80-percent",
    title: "Health Watchdog Approves New Generic Drug Cutting Costs by 80 Percent",
    excerpt:
      "The approval could save patients hundreds of dollars per month and relieve pressure on public health systems worldwide.",
    content:
      "Health regulators have approved a new generic version of a widely prescribed medication, potentially reducing treatment costs by as much as 80 percent for millions of patients.\n\n## Impact on Patients\n\nThe brand-name drug currently costs roughly $600 per month. The generic version is expected to retail at under $120, making long-term treatment accessible to far more people.\n\n## Key Points\n\n- Bioequivalence confirmed in clinical trials\n- Three manufacturers licensed to produce the drug\n- Pharmacy chains expect availability within six weeks\n\n## Broader Implications\n\nPublic health experts say the move could save national health systems billions annually and serve as a model for other medications nearing patent expiry.",
    category: "Health",
    image: "",
    author: "Dr. Priya Nair",
    featured: false,
  },
  {
    slug: "blockbuster-film-shatters-opening-weekend-records",
    title: "Blockbuster Film Shatters Opening Weekend Records Worldwide",
    excerpt:
      "The sci-fi epic grossed $450 million globally in its first three days, becoming the fastest film ever to cross the half-billion mark.",
    content:
      "A highly anticipated sci-fi epic has demolished box office records, earning $450 million worldwide in its opening weekend and becoming the fastest film ever to pass the $500 million milestone.\n\n## Record-Breaking Numbers\n\n- Largest global opening of all time\n- IMAX screenings sold out for three consecutive weeks\n- Record presales in 40 markets\n\n## Critical Reception\n\nCritics have praised the film's visual effects and character-driven storytelling, with many calling it \"a landmark achievement in cinematic spectacle.\"\n\nThe studio has already greenlit two sequels, with principal photography expected to begin next spring.",
    category: "Entertainment",
    image: "",
    author: "Laura Chen",
    featured: false,
  },
  {
    slug: "engineers-unveil-worlds-first-flying-electric-taxi-service",
    title: "Engineers Unveil World's First Flying Electric Taxi Service",
    excerpt:
      "The eVTOL aircraft, capable of 150 km/h with a 200 km range, will begin commercial operations in two major cities later this year.",
    content:
      "A consortium of aerospace engineers has unveiled the world's first commercial flying electric taxi service, promising to transform urban mobility with zero-emission vertical takeoff and landing aircraft.\n\n## The Aircraft\n\n- Cruise speed of 150 km/h\n- Range of 200 km on a single charge\n- 45-minute fast-charge capability\n- Noise levels 70 percent lower than helicopters\n\n## Launch Plans\n\nTwo major cities will host the initial routes, with 15 aircraft operating from rooftop vertiports. Fares are expected to be comparable to premium ride-hailing services.\n\nRegulators have granted conditional certification, with full approval expected after six months of operational data.",
    category: "Technology",
    image: "",
    author: "David Kim",
    featured: false,
  },
  {
    slug: "major-earthquake-strikes-pacific-nation-relief-efforts-underway",
    title: "Major Earthquake Strikes Pacific Nation; Relief Efforts Underway",
    excerpt:
      "A 7.4 magnitude earthquake triggered tsunami warnings across the region. International aid organizations are mobilizing emergency response teams.",
    content:
      "A powerful 7.4 magnitude earthquake struck a Pacific island nation early this morning, triggering tsunami warnings and prompting a large-scale international relief operation.\n\n## The Situation\n\n- Epicenter located 90 km offshore at a depth of 30 km\n- Tsunami waves of up to one meter observed in coastal areas\n- Power and communications disrupted in affected regions\n\n## Response\n\nEmergency crews are working around the clock to reach affected communities. International partners have pledged immediate assistance, including search-and-rescue teams and medical supplies.\n\nAuthorities have urged coastal residents to remain on higher ground until the tsunami advisory is fully lifted.",
    category: "World",
    image: "",
    author: "News Desk",
    featured: false,
  },
  {
    slug: "researchers-develop-breakthrough-battery-that-charges-in-five-minutes",
    title: "Researchers Develop Breakthrough Battery That Charges in Five Minutes",
    excerpt:
      "The new solid-state battery retains 95 percent capacity after 10,000 charge cycles, potentially eliminating range anxiety for EV drivers.",
    content:
      "A team of researchers has developed a solid-state battery that charges to 80 percent capacity in just five minutes and retains 95 percent of its capacity after 10,000 cycles — roughly 20 years of daily use.\n\n## Technical Highlights\n\n- Solid electrolyte eliminates fire risk\n- 5-minute charge to 80 percent\n- 10,000 cycle lifespan\n- 40 percent higher energy density than current lithium-ion\n\n## What It Means for EVs\n\nThe breakthrough could effectively eliminate range anxiety, as charging an electric vehicle would take less time than filling a conventional gas tank.\n\nCommercial production is expected to begin within three years, pending manufacturing scale-up partnerships.",
    category: "Science",
    image: "",
    author: "Dr. Maria Kowalski",
    featured: false,
  },
  {
    slug: "central-bank-holds-rates-steady-signals-patience",
    title: "Central Bank Holds Rates Steady, Signals Patience on Future Moves",
    excerpt:
      "Policymakers kept interest rates unchanged for a third consecutive meeting, citing balanced risks between inflation and growth.",
    content:
      "The central bank held its benchmark interest rate steady for the third consecutive meeting, signaling a patient approach as it balances lingering inflation pressures against signs of cooling economic growth.\n\n## The Decision\n\n- Benchmark rate unchanged at 4.25 percent\n- Statement removed language about \"further tightening\"\n- Two policymakers dissented in favor of an immediate cut\n\n## Market Reaction\n\nBond yields fell modestly and equity futures ticked higher following the announcement, as markets interpreted the statement as opening the door to easing later this year.\n\nEconomists broadly expect the first rate cut to arrive within two quarters if inflation continues its downward trajectory.",
    category: "Business",
    image: "",
    author: "Robert Hayes",
    featured: false,
  },
  {
    slug: "national-team-wins-historic-series-overtime-thriller",
    title: "National Team Wins Historic Series in Overtime Thriller",
    excerpt:
      "A last-second goal in overtime sealed a 3-2 victory and the country's first series title in 28 years, sparking nationwide celebrations.",
    content:
      "In a finish for the ages, the national team clinched its first series title in 28 years with a dramatic overtime goal, beating their rivals 3-2 in front of a roaring home crowd.\n\n## The Decisive Moment\n\nWith just 42 seconds remaining in the first overtime period, a swift counterattack ended with a wrist shot that found the top corner, sending the arena into pandemonium.\n\n## Series Highlights\n\n- Trailed 2-0 in the series before winning three straight\n- Goaltender posted a .945 save percentage\n- Captain scored the series-winning goal\n\nCelebrations spilled into the streets, with an estimated 500,000 fans gathering in the capital's main square.",
    category: "Sports",
    image: "",
    author: "Tom Becker",
    featured: false,
  },
];

async function main() {
  const client = new MongoClient(URI, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  const db = client.db(DB);
  const col = db.collection("news");

  const existing = await col.countDocuments();
  if (existing > 0) {
    console.log(`Database already has ${existing} articles. Skipping seed.`);
    await client.close();
    return;
  }

  const now = new Date();
  const docs = articles.map((a, i) => ({
    ...a,
    featured: Boolean(a.featured),
    publishedAt: new Date(now.getTime() - i * 3600_000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  await col.insertMany(docs);
  console.log(`Seeded ${docs.length} articles into ${DB}.`);
  await client.close();
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
