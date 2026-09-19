# Stage 1 Report: Team Formation and Idea Development
## Wesal - Sports Connection Platform

---

## Table of Contents
## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Team Formation](#team-formation)
3. [Problem Definition & Market Research](#problem-definition--market-research)
4. [Ideas Explored and Evaluation](#ideas-explored-and-evaluation)
5. [Selected Concept Evaluation](#5-selected-concept-evaluation)
6. [Feasibility Analysis](#6-feasibility-analysis)
7. [Risk & Mitigation Strategy](#7-risk--mitigation-strategy)
8. [Sources & Citations](#8-sources--citations)

---

## 1. Executive Summary

### Wesal - Sports Connection Platform

**Problem:** 59.1% of Saudis engage in physical activity, yet 36.7% of men and 17.9% of women cite lack of group support as a barrier to participation.Today, finding teammates and organizing matches happens across WhatsApp groups, Instagram accounts, and phone calls, which is slow, fragmented, and leads to frequent cancellations.

**Solution:** Wesal is a platform where sports enthusiasts in Saudi Arabia create a profile, discover compatible players and matches nearby, and create or join games in a few taps.

---

## 2. Team Formation

### 2.1 Team Roles

| Name | Role | Primary responsibilities |
|------|------|--------|
| Jouri AlSulaiman | Product Engineer | Backend, database, system architecture |
| Ahad AlQahtani | Project Manager | Coordination, planning, timeline management |
| Hadeel AlQhtani | Frontend Engineer | Web app development, UI/UX implementation|
| Reema AlMujalli | Product Designer | UX research, design systems, prototyping |


### 2.2 Communication Protocol

| Channel | Purpose | Frequency |
|---------|---------|-----------|
| Discord | Day to day communication and urgent updates | Real-time |
| Zoom | Detailed discussions and working sessions | Daily |
| Weekly Meeting | Status, planning and reviews | Mondays |
| Notion | Documentation, and decision log | Continuous |
| GitHub | Code/specs | Continuous |

---

## 3. Problem Definition & Market Research

### 3.1 Problem Statement

**Core Problem:**  
Sports enthusiasts in Saudi Arabia struggle to find compatible teammates and organize matches efficiently. The process relies on fragmented tools and personal networks, costing organizers significant time, and producing frequent last-minute cancellations.

**Specific Pain Points:**

1. **Player discovery (primary):** No centralized platform to find compatible players. Skill level matching is manual, unreliable and limited to existing social circles.

2. **Coordination overhead (primary):** Scheduling and location are agreed upon manually across WhatsApp, Instagram, and calls. Friction leads to no-shows.

3. **Venue access (secondary):** Availability and pricing are opaque, and booking usually requires phone calls. 

### 3.2 Market Validation

**Research Data:**

**Source:** Saudi Vision 2030 Report (2025)
- 59.1% of Saudi adults engage in regular physical activity
- Addressable market: 1.2M+ people in Riyadh alone

**Source:** Riyadh Sports Participation Study
- 36.7% of men cite "lack of group support" as barrier
- 17.9% of women cite "lack of group support" as barrier
- 78% of respondents use WhatsApp for coordination

### 3.3 Target Users

**Primary:**
- University students (18-25) - Time flexible, tech-native
- Working professionals (25-35) - Budget available, want efficiency
- Fitness enthusiasts (any age) - High engagement
- Venue managers and tournament organizers.

**Primary Persona 1 - Fatima, 25, Project manager, Riyadh**
Exercises 3–4× a week, spends 30+ minutes coordinating each match, struggles to find players at her level and time. Would pay for convenience.

**Primary Persona 2 - Ahmed, 22, University student, Riyadh**
Plays 2–3× a week but only with friends; when they're unavailable he has no way to find a game. Price-sensitive.

**Geographic focus:** Riyadh first, then Jeddah and Dammam, then nationwide.

### 3.4 Competitive Landscape

**Direct Competitors:** NONE in Saudi Arabia  
(No unified sports connection platform exists locally)

**Indirect Competitors:**
- WhatsApp groups (fragmented, no features)
- Instagram sports accounts (no coordination tools)
- International apps (not localized for KSA)
- Meetup.com (available but not sports-focused)

**Competitive Advantage:**
First-mover in Saudi sports connection market
Designed for Saudi culture & preferences
All-in-one solution (discovery + coordination + venues)

---

## 4. Ideas Explored and Evaluation

### 4.1 Brainstorming

We used problem-first ideation: each member brought real problems from personal experience, we brainstormed concepts against them, scored the concepts independently with a shared rubric, compared scores, narrowed to two finalists (Wesal and SplitWise Upgraded), and selected Wesal unanimously after a deeper discussion.

### 4.2 Ideas Generated

| Idea | Problem addressed | Strengths | Weaknesses | Outcome |
|------|-------------------|-----------|------------|---------|
| Wesal | Finding players and organizing matches | Clear local gap, felt personally by the team, testable with real users immediately | Two-sided cold start | Selected |
| SplitWise Upgraded | Group expense settlement | Technically simple, well understood | Crowded market dominated by Splitwise, payment integration adds complexity | Rejected |
| Food Surplus Logistics | Food waste and food insecurity | High social impact | No viable revenue (charities can't pay) | Rejected |
| DocLink | Healthcare access | Real problem | Ministry of Health approval | Rejected |

### 4.3 Evaluation Rubric

| Criterion | Weight | Definition |
|-----------|--------|------------|
| Feasibility | 25% | Can we build it in 4 weeks with our skills? |
| Innovation | 20% | Does it solve the problem in a new or clearly better way? |
| Scope | 20% | Is it MVP-sized, neither over- nor under-scoped? |
| Team interest | 20% | Are we motivated to build and use it? |
| Market viability | 15% | Is there real demand and room in the market? |

### 4.4 Scores

| Concept | Feasibility | Innovation | Scope | Team interest | Market | Total /25 | Rank |
|---------|-------------|------------|-------|---------------|--------|-----------|------|
| **Wesal** | 4.5 | 4.5 | 4.5 | 5.0 | 4.5 | **23.0** | 1 |
| SplitWise Upgraded | 4.0 | 2.0 | 4.0 | 3.0 | 3.0 | 16.0 | 2 |
| Food Surplus Logistics | 2.0 | 4.0 | 2.0 | 2.0 | 2.0 | 12.0 | 3 |
| DocLink | 2.0 | 3.0 | 2.0 | 2.0 | 3.0 | 12.0 | 3 |

---

## 5. Selected Concept Evaluation

### 5.1 Overview

**Wesal** — *"Connect. Organize. Play. Discover Your Community"*

Wesal is a platform that connects sports enthusiasts for player discovery, match organization, venue booking, and sports event discovery. Users create profiles with sport preferences and skill levels, discover compatible players and matches, and easily organize or join games.

### 5.2 Feature Scope

| # | Feature | User Value | Complexity |
|----|---------|-----------|-----------|----------|
| 1 | User Registration & Profiles | Enables matching algorithm | Low |
| 2 | Match/Player Discovery | Core value - find teammates | Medium |
| 3 | Join Existing Matches | Zero-friction participation | Low |
| 4 | Create Matches | Empowers organizers | Medium |
| 5 | Venue Search & Booking | Solves location problem | Medium |
| 6 | In-App Messaging | Reduces coordination friction | Medium |
| 7 | Events Discovery | Connects to larger community | Low |

### 5.3 Why Wesal

- **Feasibility.** Profiles, discovery, and match creation are standard CRUD plus location filtering, achievable by this team in 4 weeks with a known stack.
- **Innovation.** No unified player-discovery and match-organization platform exists in KSA; existing apps stop at venue booking.
- **Alignment with goals.** All four members play sports and have lived the problem, and the project exercises every layer the program expects (frontend, backend, database, third-party APIs).
- **Testability.** We can validate with our own sports circles and university groups within the MVP window.

---

## 6. Feasibility Analysis

| Dimension | Assessment | Confidence | Key risk |
|-----------|-----------|------------|----------|
| Technical | Feasible | 85% | Location matching (start simple, iterate) |
| Financial | Feasible | 80% | Monetization timing |
| Market | Highly feasible | 90% | User acquisition |
| Operational | Highly feasible | 95% | Scope creep |
| Legal | Highly feasible | 90% | Data-privacy compliance |
| **Overall** | **GO** | **88%** | **User acquisition** |

**Technical.** Stack: React / React Native (frontend), Node.js + Express (backend), Supabase/PostgreSQL (database), Google Maps API (location), Socket.io (messaging), AWS or DigitalOcean (hosting). All are available on free or low-cost tiers and match existing team skills; location-based matching is the one area requiring new learning.

**Financial.** MVP cost is limited to hosting and API usage (~$200–400 over 4 weeks); development is internal. The MVP is free to users. Future revenue paths are venue commissions, premium features, and event promotion; these are deliberately not part of the MVP and will be modelled in Stage 2.

**Market.** See §3.2–3.4. Demand and the gap are validated; the open question is acquisition, addressed in §7.

**Operational.** Roles cover every required skill with no gaps. Planned load: engineers ~40 h/week, design ~25 h/week, project management ~10 h/week over 4 weeks.

**Legal.** No licensing is required to operate a coordination platform. Requirements are a privacy policy compliant with SDAIA data-protection guidance, terms of service including a liability waiver for sports injuries and conduct rules, and secure handling of user data. Payment regulation does not apply until payments are introduced.

---

## 7. Risk & Mitigation Strategy

### Risk Register

| Risk | Severity | Probability | Impact | Mitigation |
|------|----------|-----------|--------|-----------|
| User acquisition | High | High | No critical mass → no value | Pre-launch: Partner with sports clubs, university groups |
| Team Turnover | Medium | Low | Delays if member leaves | Knowledge sharing, documentation, role overlap |
| Scope Creep | High | Medium | Missing deadline | Weekly scope reviews, strict feature list |
| Location Accuracy | Medium | Medium | Poor recommendations | Start simple, iterate based on feedback |
| Venue Partnerships | Medium | Medium | Lack of venue data | Manual outreach, free listing initially |
| Revenue Model | Low | Medium | Not viable long-term | Design system for multiple monetization paths |
| Competition | Medium | Low | New entrants to market | Move fast, build network effects, improve UX |

---

## 8. Sources & Citations

**Saudi Vision 2030 Report (2025)**
- Physical activity participation: 59.1% of adults

**Riyadh Sports Participation Study**
- Barrier analysis: 36.7% men, 17.9% women lack group support

**Competitive research**
— Malaeb, Playtomic, Meetup, and local WhatsApp/Instagram communities.

---

