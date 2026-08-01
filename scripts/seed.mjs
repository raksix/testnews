import { MongoClient } from "mongodb";

const URI = process.env.MONGODB_URI || "mongodb://admin:admin123@127.0.0.1:27017/?authSource=admin";
const DB = process.env.MONGODB_DB || "testnews";

const articles = [
  {
    slug: "global-markets-rally-as-inflation-cools",
    title: "Global Markets Rally as Inflation Cools Faster Than Expected",
    excerpt: "Stock indices across the US, Europe and Asia surged after fresh data showed consumer prices rising at the slowest pace in three years.",
    content: "Global equity markets staged a powerful rally on Thursday after the latest inflation data came in well below analyst expectations, reigniting hopes of an imminent interest rate cut.\n\n## A Broad-Based Advance\n\nThe rally was broad-based, with technology, financial and industrial shares all posting strong gains. The S&P 500 climbed 2.1 percent, while Europe's Stoxx 600 added 1.8 percent and Asian markets followed suit overnight.\n\n## What the Data Shows\n\n- Consumer prices rose 0.1 percent month over month, the smallest increase in three years\n- Core inflation, which excludes food and energy, also cooled significantly\n- Wage growth moderated, easing concerns about a wage-price spiral\n\n## Central Bank Reaction\n\nTraders are now pricing in a 78 percent probability of a rate cut at the next central bank meeting, up from 52 percent just a week ago. \"The data gives policymakers the cover they need to ease,\" said one senior economist.\n\nAnalysts caution, however, that a single month of data does not make a trend, and geopolitical tensions remain a wildcard for markets.\n\n## Impact on Developing Markets\n\nEmerging market currencies and bonds rallied alongside developed markets, with several central banks signaling they may now have room to ease their own monetary policies.\n\nThe Turkish lira, Brazilian real and Indian rupee all gained against the dollar, reflecting renewed investor appetite for higher-yielding assets.",
    category: "Business",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=600&fit=crop",
    author: "Sarah Mitchell",
    featured: true,
  },
  {
    slug: "breakthrough-quantum-computer-solves-previously-impossible-problem",
    title: "Breakthrough: Quantum Computer Solves Previously Impossible Problem",
    excerpt: "Researchers say the new 1,000-qubit machine completed a complex simulation in minutes that would take a classical supercomputer thousands of years.",
    content: "Scientists have unveiled a quantum computer that has successfully solved a computational problem widely considered intractable for classical machines, marking a major milestone in the field.\n\n## The Achievement\n\n- The machine completed the simulation in 4 minutes\n- The same calculation would take a classical supercomputer an estimated 3,000 years\n- Error correction was achieved without sacrificing qubit count\n\n## Why It Matters\n\nQuantum computers leverage the principles of superposition and entanglement to process vast numbers of possibilities simultaneously. This particular breakthrough demonstrates that error correction — long the field's biggest hurdle — is now practical at scale.\n\n## What's Next\n\nIndustry observers say the technology remains years away from broad commercial use, but the achievement accelerates the timeline for applications in drug discovery, materials science and cryptography.\n\nThe research team has published their findings in a leading scientific journal, and several major tech companies have already announced plans to license the technology for commercial applications.",
    category: "Science",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&h=600&fit=crop",
    author: "Dr. Elena Vasquez",
    featured: true,
  },
  {
    slug: "ai-chipmaker-announces-next-generation-processor",
    title: "AI Chipmaker Announces Next-Generation Processor With 4x Performance",
    excerpt: "The new chip, built on a 2nm process, promises a fourfold performance leap while consuming 30 percent less power than its predecessor.",
    content: "A leading semiconductor company has announced its next-generation AI accelerator, claiming a fourfold performance improvement over the previous model while cutting power consumption by nearly a third.\n\n## Key Specifications\n\n- Built on an advanced 2-nanometer manufacturing process\n- 1.2 trillion transistors on a single die\n- 30 percent reduction in power draw\n- Native support for next-generation AI models\n\n## Industry Impact\n\nThe announcement sent ripples through the supply chain, with foundry partners and memory makers seeing their shares rise on expectations of sustained demand. Cloud providers have already placed orders for the second half of the year.\n\nThe company said volume shipments would begin next quarter, with hyperscale customers receiving priority allocation.\n\nAnalysts at a major investment bank raised their price targets for the stock, saying the new chip \"represents a generational leap in AI computing capability.\"",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=600&fit=crop",
    author: "James Okafor",
    featured: true,
  },
  {
    slug: "world-leaders-agree-on-historic-climate-finance-deal",
    title: "World Leaders Agree on Historic Climate Finance Deal",
    excerpt: "After three days of tense negotiations, 120 countries signed a framework to mobilize $300 billion annually for clean energy transitions in developing nations.",
    content: "Negotiators from 120 countries have reached a landmark agreement to channel $300 billion per year toward clean energy projects in developing countries, capping three days of intense diplomacy.\n\n## The Framework\n\nThe deal establishes a hybrid model combining public funds with private investment guarantees, aiming to unlock a total of $1 trillion in annual climate finance by 2035.\n\n## Reactions\n\n- Developing nations called the deal \"a meaningful step forward\"\n- Environmental groups urged faster implementation timelines\n- Major emitters committed to updated reduction targets next year\n\n## What Happens Now\n\nSignatories have 90 days to submit national implementation plans. The first disbursements are expected within eighteen months, with priority given to small island states and least-developed countries.\n\nCritics warn that previous climate finance pledges have fallen short of their targets, and the real test will be whether this deal delivers where others have failed.",
    category: "World",
    image: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=1200&h=600&fit=crop",
    author: "Aisha Rahman",
    featured: true,
  },
  {
    slug: "underdog-wins-world-cup-in-dramatic-penalty-shootout",
    title: "Underdog Wins World Cup in Dramatic Penalty Shootout",
    excerpt: "Against all odds, the tournament's lowest-ranked team lifted the trophy after a 5-4 shootout victory, capping a fairytale run that captivated the world.",
    content: "In one of the greatest upsets in sporting history, the tournament's lowest-ranked side defeated the defending champions 5-4 on penalties to claim their first-ever title.\n\n## A Fairytale Run\n\nThe team entered the tournament ranked 62nd in the world and were written off before a ball was kicked. They conceded just two goals across seven matches, with their goalkeeper saving three penalties in the final.\n\n## The Final\n\n- 0-0 after extra time\n- 5-4 on penalties\n- 90,000 fans in attendance\n\n## Aftermath\n\nThe winning captain dedicated the victory to the nation's people, calling it \"a dream that became real.\" Millions lined the streets for the victory parade the following day.\n\nThe achievement has sparked a nationwide surge in youth football enrollment, with sports officials reporting record registration numbers in the weeks following the victory.",
    category: "Sports",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=600&fit=crop",
    author: "Miguel Santos",
    featured: false,
  },
  {
    slug: "health-watchdog-approves-new-generic-drug-cutting-costs-by-80-percent",
    title: "Health Watchdog Approves New Generic Drug Cutting Costs by 80 Percent",
    excerpt: "The approval could save patients hundreds of dollars per month and relieve pressure on public health systems worldwide.",
    content: "Health regulators have approved a new generic version of a widely prescribed medication, potentially reducing treatment costs by as much as 80 percent for millions of patients.\n\n## Impact on Patients\n\nThe brand-name drug currently costs roughly $600 per month. The generic version is expected to retail at under $120, making long-term treatment accessible to far more people.\n\n## Key Points\n\n- Bioequivalence confirmed in clinical trials\n- Three manufacturers licensed to produce the drug\n- Pharmacy chains expect availability within six weeks\n\n## Broader Implications\n\nPublic health experts say the move could save national health systems billions annually and serve as a model for other medications nearing patent expiry.\n\nPatient advocacy groups celebrated the decision, saying it represents a significant step forward in the fight for affordable healthcare access in developing nations.",
    category: "Health",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&h=600&fit=crop",
    author: "Dr. Priya Nair",
    featured: false,
  },
  {
    slug: "blockbuster-film-shatters-opening-weekend-records",
    title: "Blockbuster Film Shatters Opening Weekend Records Worldwide",
    excerpt: "The sci-fi epic grossed $450 million globally in its first three days, becoming the fastest film ever to cross the half-billion mark.",
    content: "A highly anticipated sci-fi epic has demolished box office records, earning $450 million worldwide in its opening weekend and becoming the fastest film ever to pass the $500 million milestone.\n\n## Record-Breaking Numbers\n\n- Largest global opening of all time\n- IMAX screenings sold out for three consecutive weeks\n- Record presales in 40 markets\n\n## Critical Reception\n\nCritics have praised the film's visual effects and character-driven storytelling, with many calling it \"a landmark achievement in cinematic spectacle.\"\n\nThe studio has already greenlit two sequels, with principal photography expected to begin next spring.\n\nMerchandise sales have also shattered records, with themed products generating an estimated $200 million in retail revenue during the opening weekend alone.",
    category: "Entertainment",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=600&fit=crop",
    author: "Laura Chen",
    featured: false,
  },
  {
    slug: "engineers-unveil-worlds-first-flying-electric-taxi-service",
    title: "Engineers Unveil World's First Flying Electric Taxi Service",
    excerpt: "The eVTOL aircraft, capable of 150 km/h with a 200 km range, will begin commercial operations in two major cities later this year.",
    content: "A consortium of aerospace engineers has unveiled the world's first commercial flying electric taxi service, promising to transform urban mobility with zero-emission vertical takeoff and landing aircraft.\n\n## The Aircraft\n\n- Cruise speed of 150 km/h\n- Range of 200 km on a single charge\n- 45-minute fast-charge capability\n- Noise levels 70 percent lower than helicopters\n\n## Launch Plans\n\nTwo major cities will host the initial routes, with 15 aircraft operating from rooftop vertiports. Fares are expected to be comparable to premium ride-hailing services.\n\nRegulators have granted conditional certification, with full approval expected after six months of operational data.\n\nThe company has received pre-orders from 12 additional cities across four continents, with expansion planned over the next three years.",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1506947411487-a56738267384?w=1200&h=600&fit=crop",
    author: "David Kim",
    featured: false,
  },
  {
    slug: "major-earthquake-strikes-pacific-nation-relief-efforts-underway",
    title: "Major Earthquake Strikes Pacific Nation; Relief Efforts Underway",
    excerpt: "A 7.4 magnitude earthquake triggered tsunami warnings across the region. International aid organizations are mobilizing emergency response teams.",
    content: "A powerful 7.4 magnitude earthquake struck a Pacific island nation early this morning, triggering tsunami warnings and prompting a large-scale international relief operation.\n\n## The Situation\n\n- Epicenter located 90 km offshore at a depth of 30 km\n- Tsunami waves of up to one meter observed in coastal areas\n- Power and communications disrupted in affected regions\n\n## Response\n\nEmergency crews are working around the clock to reach affected communities. International partners have pledged immediate assistance, including search-and-rescue teams and medical supplies.\n\nAuthorities have urged coastal residents to remain on higher ground until the tsunami advisory is fully lifted.\n\nThe United Nations has convened an emergency meeting to coordinate international relief efforts, with several countries pledging financial and material support within hours of the disaster.",
    category: "World",
    image: "https://images.unsplash.com/photo-1590418606746-018840f9cd0f?w=1200&h=600&fit=crop",
    author: "News Desk",
    featured: false,
  },
  {
    slug: "researchers-develop-breakthrough-battery-that-charges-in-five-minutes",
    title: "Researchers Develop Breakthrough Battery That Charges in Five Minutes",
    excerpt: "The new solid-state battery retains 95 percent capacity after 10,000 charge cycles, potentially eliminating range anxiety for EV drivers.",
    content: "A team of researchers has developed a solid-state battery that charges to 80 percent capacity in just five minutes and retains 95 percent of its capacity after 10,000 cycles — roughly 20 years of daily use.\n\n## Technical Highlights\n\n- Solid electrolyte eliminates fire risk\n- 5-minute charge to 80 percent\n- 10,000 cycle lifespan\n- 40 percent higher energy density than current lithium-ion\n\n## What It Means for EVs\n\nThe breakthrough could effectively eliminate range anxiety, as charging an electric vehicle would take less time than filling a conventional gas tank.\n\nCommercial production is expected to begin within three years, pending manufacturing scale-up partnerships.\n\nSeveral major automakers have already expressed interest in licensing the technology, with one European manufacturer announcing plans to integrate the batteries into its next-generation EV lineup by 2030.",
    category: "Science",
    image: "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=1200&h=600&fit=crop",
    author: "Dr. Maria Kowalski",
    featured: false,
  },
  {
    slug: "central-bank-holds-rates-steady-signals-patience",
    title: "Central Bank Holds Rates Steady, Signals Patience on Future Moves",
    excerpt: "Policymakers kept interest rates unchanged for a third consecutive meeting, citing balanced risks between inflation and growth.",
    content: "The central bank held its benchmark interest rate steady for the third consecutive meeting, signaling a patient approach as it balances lingering inflation pressures against signs of cooling economic growth.\n\n## The Decision\n\n- Benchmark rate unchanged at 4.25 percent\n- Statement removed language about \"further tightening\"\n- Two policymakers dissented in favor of an immediate cut\n\n## Market Reaction\n\nBond yields fell modestly and equity futures ticked higher following the announcement, as markets interpreted the statement as opening the door to easing later this year.\n\nEconomists broadly expect the first rate cut to arrive within two quarters if inflation continues its downward trajectory.\n\nHousing market participants reacted positively, with mortgage rates dipping slightly and homebuilder stocks rising on expectations of lower borrowing costs ahead.",
    category: "Business",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&h=600&fit=crop",
    author: "Robert Hayes",
    featured: false,
  },
  {
    slug: "national-team-wins-historic-series-overtime-thriller",
    title: "National Team Wins Historic Series in Overtime Thriller",
    excerpt: "A last-second goal in overtime sealed a 3-2 victory and the country's first series title in 28 years, sparking nationwide celebrations.",
    content: "In a finish for the ages, the national team clinched its first series title in 28 years with a dramatic overtime goal, beating their rivals 3-2 in front of a roaring home crowd.\n\n## The Decisive Moment\n\nWith just 42 seconds remaining in the first overtime period, a swift counterattack ended with a wrist shot that found the top corner, sending the arena into pandemonium.\n\n## Series Highlights\n\n- Trailed 2-0 in the series before winning three straight\n- Goaltender posted a .945 save percentage\n- Captain scored the series-winning goal\n\nCelebrations spilled into the streets, with an estimated 500,000 fans gathering in the capital's main square.\n\nThe victory parade drew an estimated 1.2 million spectators, making it the largest public gathering in the country's history.",
    category: "Sports",
    image: "https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=1200&h=600&fit=crop",
    author: "Tom Becker",
    featured: false,
  },
  {
    slug: "ai-startup-revolutionizes-medical-imaging",
    title: "AI Startup Revolutionizes Medical Imaging With 99.7% Accuracy",
    excerpt: "The AI system can detect early-stage cancers from routine scans, potentially saving millions of lives through earlier diagnosis.",
    content: "An AI startup has developed a medical imaging system that can detect early-stage cancers from routine scans with 99.7 percent accuracy, dramatically outperforming human radiologists in clinical trials.\n\n## How It Works\n\n- Deep learning model trained on 10 million medical scans\n- Detects tumors as small as 2mm in diameter\n- Provides real-time analysis during routine checkups\n- Integrates with existing hospital imaging equipment\n\n## Clinical Results\n\nIn a study involving 50,000 patients across 30 hospitals, the system detected cancers that were missed by human radiologists in 12 percent of cases. Critically, it had a false positive rate of just 0.3 percent.\n\n## The Road Ahead\n\nThe company is seeking regulatory approval in multiple countries and expects to have the system deployed in hospitals within 18 months.\n\nMedical professionals have expressed cautious optimism, noting that while the technology shows enormous promise, it should be viewed as a tool to augment rather than replace human expertise.",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1200&h=600&fit=crop",
    author: "Dr. Lisa Chang",
    featured: false,
  },
  {
    slug: "arctic-ice-melt-exceeds-worst-case-projections",
    title: "Arctic Ice Melt Exceeds Worst-Case Climate Projections",
    excerpt: "New satellite data shows Arctic sea ice has declined by 23 percent in a single year, far surpassing scientists' most pessimistic forecasts.",
    content: "Alarming new data from satellite observations reveals that Arctic sea ice has declined by 23 percent in just one year, far exceeding even the worst-case projections made by climate scientists.\n\n## The Numbers\n\n- Arctic sea ice volume at its lowest recorded level\n- Summer ice extent 40 percent below the 1981-2010 average\n- Permafrost thaw accelerating in Siberia and northern Canada\n\n## Expert Warnings\n\nClimate scientists described the findings as \"deeply concerning\" and warned that the rapid melt could trigger feedback loops that accelerate global warming.\n\nThe loss of reflective ice surface means more solar energy is absorbed by dark ocean water, further warming the planet.\n\n## Policy Implications\n\nThe data has intensified calls for more aggressive emissions reductions, with several island nations demanding emergency negotiations at the next international climate summit.\n\nResearchers emphasize that while the situation is dire, meaningful action on emissions can still slow the trajectory of ice loss in the coming decades.",
    category: "Science",
    image: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=1200&h=600&fit=crop",
    author: "Dr. Anders Nilsen",
    featured: false,
  },
  {
    slug: "space-tourism-company-completes-first-civilian-station-mission",
    title: "Space Tourism Company Completes First Civilian Space Station Mission",
    excerpt: "Four amateur astronauts spent 10 days aboard the International Space Station, marking a new era in commercial spaceflight.",
    content: "A private space company has successfully completed its first all-civilian mission to the International Space Station, returning four amateur astronauts safely to Earth after a 10-day stay in orbit.\n\n## The Crew\n\n- Commander: Former airline pilot\n- Mission Specialist: University professor\n- Engineer: Technology entrepreneur\n- Medical Officer: Emergency physician\n\n## Mission Highlights\n\nThe crew conducted 12 scientific experiments, performed two spacewalks under professional supervision, and hosted a live educational broadcast viewed by over 50 million students worldwide.\n\n## The Future of Space Tourism\n\nTickets for future missions are priced at $55 million per seat, and the company reports a waiting list of over 100 potential customers.\n\nThe success of this mission paves the way for expanded commercial operations in low Earth orbit, with plans for a private space station module by 2030.",
    category: "Science",
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&h=600&fit=crop",
    author: "Mark Anderson",
    featured: false,
  },
  {
    slug: "global-cyberattack-disrupts-hospital-systems-across-europe",
    title: "Global Cyberattack Disrupts Hospital Systems Across Europe",
    excerpt: "A sophisticated ransomware attack has forced hospitals in 12 countries to revert to paper records, disrupting patient care.",
    content: "A massive ransomware attack has disrupted hospital information systems across Europe, forcing medical facilities in 12 countries to revert to paper-based record keeping and causing delays in patient care.\n\n## The Attack\n\n- Ransomware variant spread through compromised software update\n- Over 300 hospitals affected across 12 countries\n- Patient records, scheduling and pharmacy systems disrupted\n- No patient data reported stolen, systems encrypted\n\n## Emergency Response\n\nNational cybersecurity agencies have activated emergency protocols. The attack, which began early Wednesday morning, appears to have originated from a compromised update to widely-used medical software.\n\n## Ongoing Impact\n\nWhile emergency departments remain operational, elective surgeries and non-urgent procedures have been postponed at many facilities.\n\nThe attack has renewed calls for stricter cybersecurity regulations in the healthcare sector, with officials acknowledging that many hospitals still lack adequate digital defenses against sophisticated threats.",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=600&fit=crop",
    author: "Nina Petrov",
    featured: false,
  },
  {
    slug: "unprecedented-coral-reef-recovery-observed-in-pacific",
    title: "Unprecedented Coral Reef Recovery Observed in Pacific Ocean",
    excerpt: "Marine biologists report a remarkable 40 percent increase in coral coverage at the Great Barrier Reef, offering hope for ocean ecosystems.",
    content: "Marine biologists have documented an unprecedented recovery of coral reefs in the Pacific Ocean, with a 40 percent increase in live coral coverage over the past two years at monitoring sites across the Great Barrier Reef region.\n\n## What's Driving Recovery\n\n- Record low ocean temperatures during the past two summers\n- Reduced pollution from agricultural runoff\n- Successful coral transplantation programs\n- Natural resilience of certain coral species\n\n## Significance\n\nThe recovery, while localized, offers a rare beacon of hope for ocean ecosystems that have suffered decades of bleaching events and degradation.\n\n## Challenges Ahead\n\nScientists caution that the recovery remains fragile and could be reversed by future heat events. The region experienced severe bleaching in 2023 and 2024, and researchers say sustained climate action is essential.\n\nThe findings have been published in a leading marine science journal and are expected to influence conservation policy discussions at the upcoming UN Ocean Conference.",
    category: "Science",
    image: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=1200&h=600&fit=crop",
    author: "Dr. Ocean Williams",
    featured: false,
  },
  {
    slug: "cryptocurrency-regulation-framework-adopted-by-g7",
    title: "G7 Nations Adopt Comprehensive Cryptocurrency Regulation Framework",
    excerpt: "The landmark agreement establishes global standards for digital asset oversight, stablecoin reserves, and cross-border crypto transactions.",
    content: "Finance ministers from the Group of Seven nations have unanimously adopted a comprehensive framework for cryptocurrency regulation, establishing the first globally coordinated approach to digital asset oversight.\n\n## Key Provisions\n\n- Stablecoin issuers must maintain 1:1 reserve backing\n- Mandatory know-your-customer requirements for exchanges\n- Cross-border transaction reporting standards\n- Consumer protection requirements for retail investors\n\n## Industry Response\n\nMajor cryptocurrency exchanges welcomed the regulatory clarity, saying the framework would legitimize the industry and attract institutional investment.\n\nCritics, however, argued the regulations could stifle innovation and drive smaller companies out of the market.\n\n## Implementation Timeline\n\nMember nations have 18 months to incorporate the framework into domestic law. The agreement includes provisions for mutual recognition of regulatory standards between member countries.",
    category: "Business",
    image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=1200&h=600&fit=crop",
    author: "Kevin Park",
    featured: false,
  },
  {
    slug: "olympic-committee-announces-five-new-sports-for-2028",
    title: "Olympic Committee Announces Five New Sports for 2028 Games",
    excerpt: "Cricket, squash, flag football, lacrosse and breakdancing will make their Olympic debuts in Los Angeles, aiming to attract younger audiences.",
    content: "The International Olympic Committee has officially confirmed five new sports for the 2028 Los Angeles Games, in a move designed to boost viewership and attract younger demographics.\n\n## The New Sports\n\n- Cricket (T20 format)\n- Squash\n- Flag Football\n- Lacrosse\n- Breakdancing (Breaking)\n\n## Rationale\n\nThe IOC said the additions reflect a desire to appeal to younger, more diverse audiences, particularly in key markets like the United States, India and Southeast Asia.\n\n## Reactions\n\n- India celebrated cricket's inclusion, calling it \"a historic moment\"\n- US officials expressed excitement about flag football\n- Breakdancing returned after its successful debut in Paris 2024\n\nThe total number of sports at the 2028 Games will be 36, with 329 events across all disciplines.\n\nTicket sales for the new sports are expected to open later this year, with cricket matches anticipated to be among the highest-demand events.",
    category: "Sports",
    image: "https://images.unsplash.com/photo-1461896836934-bd45ba48a7fd?w=1200&h=600&fit=crop",
    author: "Jessica Torres",
    featured: false,
  },
  {
    slug: "loneliness-epidemic-declared-public-health-crisis",
    title: "Loneliness Declared a Global Public Health Crisis by WHO",
    excerpt: "The World Health Organization formally recognizes social isolation as a leading health risk, launching a worldwide initiative to combat it.",
    content: "The World Health Organization has formally declared loneliness and social isolation a global public health crisis, launching a comprehensive international initiative to address what officials describe as an \"invisible epidemic.\"\n\n## The Scale of the Problem\n\n- Over 1 billion people worldwide report feeling lonely\n- Social isolation increases mortality risk by 26 percent\n- Economic cost estimated at $2 trillion annually in lost productivity\n- Young adults (18-25) report the highest rates of loneliness\n\n## The Initiative\n\nThe WHO's new commission will work with governments, tech companies and community organizations to develop programs aimed at strengthening social connections.\n\n## Expert Analysis\n\nHealth researchers say the crisis has been amplified by remote work, social media use and the lasting effects of pandemic-era social distancing.\n\nThe WHO emphasized that addressing loneliness requires a multi-sector approach, combining urban design improvements, technology policy reform and community health programs.\n\nSeveral countries, including the UK and Japan, have already appointed ministers of loneliness to coordinate domestic responses.",
    category: "Health",
    image: "https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=1200&h=600&fit=crop",
    author: "Dr. Amara Okonkwo",
    featured: false,
  },
  {
    slug: "nuclear-fusion-reactor-achieves-net-energy-gain",
    title: "Nuclear Fusion Reactor Achieves Sustained Net Energy Gain",
    excerpt: "Scientists have maintained a fusion reaction producing more energy than it consumes for a record 5 minutes, bringing commercial fusion power closer to reality.",
    content: "Physicists at a major research facility have achieved a sustained net energy gain from a nuclear fusion reaction for a record five minutes, producing approximately 3 megawatts of power while consuming 2.5 megawatts.\n\n## The Breakthrough\n\n- Sustained plasma temperature of 150 million degrees Celsius\n- 3 MW energy output, 2.5 MW input\n- Record 5-minute continuous operation\n- First-ever sustained net energy gain in a fusion reactor\n\n## Why Fusion Matters\n\nNuclear fusion — the same process that powers the sun — promises virtually unlimited clean energy with minimal radioactive waste and no risk of meltdown.\n\n## The Path to Commercial Power\n\nWhile the achievement is historic, commercial fusion power plants remain at least 15-20 years away. Engineers must now develop materials capable of withstanding sustained fusion conditions and build systems to convert fusion energy into electricity at scale.\n\nPrivate investment in fusion startups has surged past $6 billion globally, reflecting growing confidence that the technology will eventually deliver on its transformative promise.",
    category: "Science",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=600&fit=crop",
    author: "Dr. Fusion Park",
    featured: false,
  },
  {
    slug: "self-driving-trucks-begin-coast-to-coast-commercial-delivery",
    title: "Self-Driving Trucks Begin Coast-to-Coast Commercial Delivery",
    excerpt: "The autonomous trucking fleet completed its first fully driverless cross-country delivery, traveling 2,800 miles without human intervention.",
    content: "An autonomous trucking company has completed its first fully driverless coast-to-coast delivery run, transporting goods 2,800 miles from Los Angeles to New York without any human intervention.\n\n## The Run\n\n- Departed Los Angeles at 2:00 AM Pacific\n- Arrived in New York 33 hours later\n- Zero driver interventions during entire journey\n- Speed maintained at 65 mph with real-time route optimization\n\n## Technology Stack\n\nThe truck uses a combination of LiDAR, radar, cameras and AI-powered decision making to navigate highways, handle construction zones and respond to traffic conditions.\n\n## Industry Implications\n\nThe trucking industry faces a driver shortage of approximately 80,000 in the United States alone. Autonomous technology could help fill the gap while reducing delivery costs and improving road safety.\n\nRegulatory approval for fully driverless trucks on public highways remains limited to specific corridors, but the successful cross-country run is expected to accelerate policy discussions at the federal level.",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&h=600&fit=crop",
    author: "Alex Rivera",
    featured: false,
  },
];

async function main() {
  const client = new MongoClient(URI, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  const db = client.db(DB);
  const col = db.collection("news");

  // Drop existing articles for clean seed
  await col.deleteMany({});
  console.log("Cleared existing articles.");

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
