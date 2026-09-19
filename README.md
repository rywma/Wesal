# STAGE 1 REPORT
## Team Formation and Idea Development

### Wesal - Sports Connection Platform
**HBNB Portfolio Project**

---

## EXECUTIVE SUMMARY

Wesal is a sports connection platform designed to solve a critical barrier to physical activity participation in Saudi Arabia. With 59.1% of adults engaging in regular physical activity (Vision 2030, 2025), yet 36.7% of men and 17.9% of women citing lack of friend/group support as a barrier to participation, Wesal creates a unified digital hub where sports enthusiasts can discover compatible teammates, organize matches, and access sporting venues—all in one intuitive platform.

The platform directly addresses the time and effort barriers that prevent team formation and logistics coordination, consolidating what currently requires multiple WhatsApp groups, Instagram searches, and manual phone calls into a seamless, organized experience.

**Project Name:** Wesal  
**Report Date:** September 16, 2026

---

## TEAM INFORMATION

### Team Members & Roles

| Member Name | Role | Key Responsibilities |
|---|---|---|
| Jouri AlSulaiman | Product Engineer | Backend architecture, API development, database design |
| Ahad AlQahtani | Project Manager | Schedule coordination, progress tracking, deadline management |
| Hadeel AlQhtani | Frontend Engineer | Mobile app development, UI implementation, responsive design |
| Reema AlMujalli | Product Designer | UX/UI design, user research, design systems |

### Team Communication & Collaboration

**Communication Plan:**
- Primary Tools: WhatsApp & Slack
- Meeting Frequency: 3 times per week (Monday, Wednesday, Friday)
- Meeting Duration: 60-90 minutes
- Decision-Making: Consensus-based approach

**Collaboration Tools:**
- Google Docs/Drive for documentation
- Figma for design & prototyping
- GitHub for code version control (Stage 4)
- Notion for task tracking

**Team Norms:**
- All ideas are valued and considered without judgment
- Respond to messages within 24 hours
- Open and honest feedback is encouraged
- Decisions are documented with reasoning
- Weekly progress updates are mandatory

---

## SECTION 1: IDEAS EXPLORED

### Idea #1: Food Surplus Logistics Platform

**Problem:** 
Restaurants, hotels, supermarkets, and events generate usable surplus food daily. Charities and community organizations need food. The challenge: matching available food with recipients, scheduling pickups, managing transportation, and tracking impact—often solved through WhatsApp or not at all.

**Strengths:**
- High social impact
- Addresses real food waste problem
- Clear user groups (food sources and recipients)

**Weaknesses:**
- Business model unclear—charities cannot pay
- Requires complex logistics and delivery coordination
- Food safety compliance and regulatory concerns
- Revenue model not viable for sustainability

**Feasibility:** 2/5 | **Innovation:** 4/5 | **Team Interest:** 2/5

**Reason for Rejection:**
Business model does not generate profit or sustainability. While the social impact is valuable, the team cannot build a viable business without clear monetization.

---

### Idea #2: SplitWise Upgraded (Enhanced Expense Splitting)

**Problem:** 
A smarter version of SplitWise—ideal for groups, travel, and shared living. Everyone logs their expenses, and the app calculates who is owed money and who needs to pay; it also suggests the minimum number of transactions required to settle all debts. For example, instead of eight transfers among five people, it might recommend just three.

**Strengths:**
- Clear technical challenge (optimization algorithm)
- Known user need (many use Splitwise)
- Implementable in 4 weeks
- Potential monetization through premium features

**Weaknesses:**
- Highly competitive market (Splitwise already dominates)
- Limited differentiation from existing solutions
- User acquisition difficult without brand recognition
- Requires payment gateway integration

**Feasibility:** 4/5 | **Innovation:** 2/5 | **Team Interest:** 3/5

**Reason for Rejection:** 
Idea was combined into our final decision (Wesal). While technically sound, it lacked sufficient innovation and team enthusiasm. The concept of "smart group coordination" became an inspiration for Wesal's team matching and match organization features.

---

### Idea #3: DocLink (Healthcare Platform)

**Problem:** 
A smart platform for doctors and patients in one place, from discovering suitable doctors to easily booking appointments.

**App Concept:** 
Docora is an application that allows doctors to create profiles detailing their specialties, experience, qualifications, achievements, and workplace. Users can search for suitable doctors, compare options, and easily book appointments.

**Strengths:**
- Solves real patient pain point
- Clear market demand in healthcare
- High social value
- Multiple monetization paths

**Weaknesses:**
- Requires Ministry of Health approval (regulatory barrier)
- Complex compliance and data privacy requirements
- Doctors need institutional support to participate
- Timeline for regulatory approval exceeds 4-week MVP window

**Feasibility:** 2/5 | **Innovation:** 3/5 | **Team Interest:** 2/5

**Reason for Rejection:**
Business model was difficult to implement on public hospitals which were our targeted users. Regulatory and compliance requirements in Saudi healthcare sector create barriers that cannot be overcome in 4 weeks.

---

## SECTION 2: SELECTED MVP CONCEPT - WESAL

### 2.1 The Problem

Many people struggle to find others who share their sporting interests, particularly if they lack acquaintances who practice the same sport. They also face challenges in assembling a full team, coordinating schedules and locations, and securing suitable venues. These logistical hurdles require significant time and effort, often resulting in incomplete teams or cancelled matches.

**Research Validation:**

Studies confirm this problem exists:
- Research conducted among university students in Riyadh identified a lack of support from friends and sports groups as a factor hindering participation
- **36.7% of men** cited lack of support from friends/colleagues as barrier to physical activity
- **17.9% of women** cited lack of support from friends/colleagues as barrier to physical activity
- **59.1% of adults** in Saudi Arabia engage in regular physical activity (Vision 2030, 2025)

**Current Workarounds:**
- WhatsApp groups (unorganized, no discoverability)
- Instagram DMs (not designed for sports matching)
- Word-of-mouth (limited to existing circles)
- No centralized platform for sports coordination

---

### 2.2 The Solution

The user experience begins by creating an account on the platform and selecting a preferred sport, skill level, and convenient location and time. The platform then displays players, teams, or matches that align with the user's interests.

Users can directly join an existing match or create a new one—specifying the sport, number of players, time, and location—allowing others to join. Once the roster is full, the match is organized among the participants.

Additionally, the platform enables users to find and book available sports venues and discover events, tournaments, and marathons.

In this way, Wesal addresses the challenge of finding others who share the same sporting interests, reduces the time and effort required to assemble a team and coordinate logistics, and consolidates all these steps into a single, centralized hub.

---

### 2.3 Target Users

**Primary User Persona #1: Active Sports Enthusiast**
- **Name:** Fatima, 25, Project Manager, Riyadh
- **Sports Interests:** Badminton, volleyball, fitness
- **Behavior:** Exercises 3-4 times weekly
- **Pain Points:** 
  - Spends 30+ minutes finding/organizing a match
  - Players cancel last minute
  - Difficult to find compatible skill levels
  - Doesn't know about tournaments
- **Needs:** Quick match discovery, reliable teammates, venue information

**Primary User Persona #2: Casual Sports Player**
- **Name:** Ahmed, 22, University Student, Riyadh
- **Sports Interests:** Football, basketball, cricket
- **Behavior:** Plays 2-3 times weekly
- **Pain Points:**
  - Friends not available at same times
  - Doesn't know good courts
  - No way to discover new events
  - Coordination is tedious
- **Needs:** Easy player matching, venue discovery, simple organization

**Secondary Users:**
- Sports Venue Managers (promote availability, fill bookings)
- Tournament Organizers (promote events, register participants)

**Market Size:**
- Initial Target (MVP): Riyadh sports enthusiasts aged 18-45
- Estimated User Potential: 5,000-10,000 active users in MVP phase
- Total Addressable Market: 1.2M+ people in Riyadh who exercise regularly

---

### 2.4 Core MVP Features

**7 Core Features for MVP Launch:**

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 1 | User Registration & Sport Preferences | Create account, select sports, skill level, location, available times | MUST HAVE |
| 2 | Match & Player Discovery | Browse matches, players, teams matching preferences | MUST HAVE |
| 3 | Join Existing Matches | One-click join any listed match; instant team confirmation | MUST HAVE |
| 4 | Create New Matches | Create match with sport type, players needed, date, time, location | MUST HAVE |
| 5 | Venue Search & Booking | Browse available courts/fields with pricing, hours; simple booking | SHOULD HAVE |
| 6 | In-App Messaging | Message match participants, coordinate details, confirm attendance | SHOULD HAVE |
| 7 | Events & Tournaments Discovery | Browse tournaments, marathons, organized sporting events | NICE TO HAVE |

---

### 2.5 Why Wesal Was Selected

**Feasibility (25% weight):** ✅ EXCELLENT
- Team has all required technical skills
- No regulatory barriers
- Tech stack is straightforward and familiar
- Features are implementable in 4 weeks
- Can start with core features; extend later

**Innovation (20% weight):** ✅ STRONG
- First comprehensive sports connection platform in Saudi Arabia
- Solves real, research-validated problem
- Better integrated than scattered WhatsApp/Instagram solutions
- Unique combination of features

**Scope (20% weight):** ✅ PERFECT
- 7 features is ideal MVP size
- Clear MVP vs. future features boundary
- Features build logically on each other
- Can launch with Riyadh; scale later

**Team Interest (20% weight):** ✅ UNANIMOUS ENTHUSIASM
- ALL team members excited about this project
- Addresses real problem team experiences personally
- Each member sees their expertise being utilized
- High motivation and commitment level

**Market Viability (15% weight):** ✅ STRONG DEMAND
- 59.1% of Saudis do physical activity
- 36.7% men and 17.9% women want group support
- Young population in Riyadh = ideal early adopters
- Growing women's sports participation
- No direct competitor in Saudi Arabia

**Overall Assessment:**
Wesal represents the optimal intersection of technical feasibility, market opportunity, team capability, and personal passion. The team is genuinely excited to build this product.

---

### 2.6 Challenges & Mitigation

| Challenge | Impact | Mitigation Strategy |
|-----------|--------|-------------------|
| Cold Start Problem | High | Pre-launch marketing, partnerships with sports clubs, free trial incentives |
| Location Matching Algorithm | Medium | Start simple grid-based filtering; refine post-MVP |
| Venue Partnerships | Medium | Manual outreach to 20+ venues; free listing initially |
| User Retention | Medium | Monitor usage, incentivize regular players, plan gamification |
| Real-time Updates | Medium | Efficient notification system, database optimization |
| Payment Processing | Low | Defer to Phase 2; use manual payment methods for MVP |

---

### 2.7 Opportunities & Growth Potential

**Short-term (Phase 2-3):**
- Gamification (leaderboards, badges, ratings)
- Social features (friend connections, game history)
- Venue reviews and ratings
- Host our own tournaments

**Long-term:**
- Geographic expansion (Riyadh → nationwide)
- Monetization (venue commissions, premium memberships, advertising)
- Corporate partnerships (team-building, employee wellness)
- Become center of Saudi sports culture

---

### 2.8 Success Metrics

**MVP Success Indicators (4-Week Timeline):**

| Metric | Target |
|--------|--------|
| User Registrations | 500+ |
| Active Users (Monthly) | 300+ |
| Matches Created | 75+ |
| Matches Completed | 60+ (80% completion rate) |
| Average Participants Per Match | 6-8 players |
| Venue Partnerships | 10+ |
| User Retention (7-day) | 40%+ |
| Average Session Duration | 10+ minutes |
| User Satisfaction Rating | 4.0+/5.0 stars |

**Definition of Success:**
Wesal MVP will be considered successful if it achieves 300+ active users, 50+ successful matches organized, and positive user feedback (4.0+ rating). These metrics validate market demand, technical capability, and product-market fit.

---

### 2.9 Preliminary Technology Stack

**Frontend:**
- React Native (iOS and Android)
- React Native Paper or NativeBase (UI components)
- Redux or Context API (state management)
- Google Maps API (location features)

**Backend:**
- Node.js with Express.js
- RESTful API architecture
- Socket.io (real-time updates)

**Database:**
- MongoDB (flexible schema)
- Redis (caching and sessions)

**Infrastructure:**
- AWS EC2 or DigitalOcean (backend)
- MongoDB Atlas (cloud database)
- Firebase Auth (authentication)
- AWS S3 (photo storage)

**Rationale:**
Chosen for rapid development, team expertise, scalability, and cost-effectiveness. React Native enables single codebase for both iOS and Android. Node.js is the team's strength. MongoDB allows schema flexibility during MVP evolution.

---

## SECTION 3: DECISION-MAKING PROCESS

### 3.1 How We Decided

**Phase 1: Brainstorming (Sept 1-10)**
- Individual research: Each member explored potential problems
- Group brainstorming sessions using mind mapping
- Documented all ideas with detailed descriptions
- Result: 6 distinct ideas generated

**Phase 2: Evaluation (Sept 11-13)**
- Created evaluation rubric with weighted criteria
- Each member independently scored all ideas
- Discussed scoring and narrowed to top 2

**Phase 3: Deep Dive Analysis (Sept 14)**
- Detailed analysis of Wesal and SplitWise Upgraded
- Assessed feasibility, technical challenges, market demand
- Discussed team enthusiasm for each

**Phase 4: Final Selection (Sept 15)**
- Full team meeting comparing finalists
- **UNANIMOUS DECISION: Wesal selected**
- Team excited and ready to proceed

### 3.2 Team Alignment & Sign-Off

**Team Consensus:** ✅ **UNANIMOUS - ALL MEMBERS ALIGNED**

| Member | Status | Comment |
|--------|--------|---------|
| Jouri AlSulaiman | ✅ Fully Aligned | "Technical challenges are exciting; location matching will be great learning" |
| Ahad AlQahtani | ✅ Fully Aligned | "Clear market demand, achievable scope, strong execution potential" |
| Hadeel AlQhtani | ✅ Fully Aligned | "Mobile UX design is excellent opportunity; React Native is our strength" |
| Reema AlMujalli | ✅ Fully Aligned | "Sports community has clear needs; design will be fun and impactful" |

**Evidence of Alignment:**
- All members participated actively in evaluation
- No competing preferences expressed
- Team energy is high and positive
- Natural role assignments without negotiation
- Strong commitment—team ready to start immediately

---

## SECTION 4: NEXT STEPS

### 4.1 Transition to Stage 2: Project Charter

**Stage 2 Deliverables:**
- Detailed Project Charter with goals, scope, success criteria
- Detailed timeline with 2-week milestones
- Resource allocation and task assignments
- Risk register and mitigation plans
- Detailed feature specifications and user stories
- Quality standards and testing strategy

### 4.2 Preparation Tasks for Stage 2

**Product Engineer (Jouri):**
- Research location-based matching algorithms
- Design system architecture diagram
- Plan database schema and relationships
- Create API endpoint specifications

**Frontend Engineer (Hadeel):**
- Create wireframes for all screens
- Build interactive prototype in Figma
- Research React Native best practices
- Plan responsive design approach

**Product Designer (Reema):**
- Conduct 5-10 user interviews with target users
- Create detailed user flows and journey maps
- Develop design system with component library
- Create visual design mockups

**Project Manager (Ahad):**
- Create detailed 4-week project timeline
- List all technical dependencies
- Plan resource allocation across features
- Prepare risk management framework

### 4.3 Team Readiness Assessment

✅ **Team Cohesion:** Strong  
✅ **Role Clarity:** Clear  
✅ **Vision Alignment:** Complete  
✅ **Skill Match:** Excellent  
✅ **Timeline Confidence:** High  
✅ **Enthusiasm Level:** High  

**Overall Assessment:**
The team is fully prepared to transition to Stage 2. All members are aligned, motivated, and ready to execute. The MVP concept is well-defined, market demand is validated, and technical approach is sound.

---

## CONCLUSION

Wesal addresses a real, validated problem in the Saudi sports community while leveraging the team's technical strengths and creative capabilities. The 4-week MVP timeline is achievable with the 7 core features defined. The team is unified, motivated, and ready to execute.

With strong market validation (59.1% of Saudis do physical activity), clear differentiation (first platform of its kind in KSA), and manageable scope, Wesal represents an excellent capstone project that will deliver genuine value to users while providing significant learning opportunities for all team members.

---

## DOCUMENT INFORMATION

| Field | Value |
|---|---|
| Report Title | Stage 1: Team Formation and Idea Development |
| Project Name | Wesal |
| Report Date | September 16, 2026 |
| Document Status | ✅ **COMPLETE & READY FOR SUBMISSION** |
| Next Phase | Stage 2: Project Charter (Begins Sept 17) |

**Team Members:**
- Jouri AlSulaiman (Product Engineer)
- Ahad AlQahtani (Project Manager)
- Hadeel AlQhtani (Frontend Engineer)
- Reema AlMujalli (Product Designer)

**Approved by:** Ahad AlQahtani (Project Manager)

---

**END OF STAGE 1 REPORT**
