# Product Decisions — SkillSwap AI

## 1. AI Portfolio instead of experience-first hiring

Traditional marketplaces rank freelancers by years of experience and volume of completed gigs. That systematically excludes students and first-time creators who have strong project evidence but thin résumés.

SkillSwap AI inverts the funnel: creators upload real work (images, PDFs, notes) and an AI layer turns raw artifacts into a **client-ready portfolio card** — title, professional description, skills, and tools. Matching then uses portfolio similarity, not tenure.

**Outcome:** Students compete on demonstrated capability. Clients see proof early. The marketplace becomes a skill showcase, not an experience gate.

---

## 2. Trust-weighted matching instead of lowest-price ranking

Price-sorted marketplaces push a race to the bottom: inexperienced creators underbid, quality collapses, and clients learn to distrust listings.

Our matching service blends:

- skill overlap
- tag alignment
- experience (as a soft signal, not the primary one)
- portfolio text similarity
- trust score + rating average

We explicitly **do not** rank by lowest price. Compatibility scores come with human-readable reasons so clients understand *why* a creator was recommended.

**Outcome:** Fair discovery for young talent, better fit for clients, healthier platform economics.

---

## 3. Milestone-based workflow for creator safety

Flat “pay after delivery” models expose student creators to scope creep and unpaid work. SkillSwap bookings follow a strict state machine:

`Pending → Accepted → In Progress → Submitted → Completed`

Milestones attach amounts and completion flags to bookings. Reviews are **verified** — only clients on completed bookings can review, which keeps reputation honest and protects both sides.

**Outcome:** Clear expectations, safer delivery for creators, and reviews that reflect real completed work.
