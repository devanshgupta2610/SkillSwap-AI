"""OpenAI-compatible AI service with clean provider abstraction."""

from __future__ import annotations

import json
import logging
import re
from typing import Any

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class AIProviderError(Exception):
    pass


class AIService:
    """Abstraction over any OpenAI-compatible chat completions API."""

    def __init__(self) -> None:
        self.api_key = settings.ai_api_key
        self.base_url = settings.ai_base_url.rstrip("/")
        self.model = settings.ai_model
        self.enabled = settings.ai_enabled and bool(self.api_key)

    async def _chat(self, system: str, user: str) -> str:
        if not self.enabled:
            raise AIProviderError("AI provider disabled or missing API key")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "temperature": 0.4,
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
            )
            if response.status_code >= 400:
                raise AIProviderError(f"AI provider error: {response.status_code} {response.text}")
            data = response.json()
            return data["choices"][0]["message"]["content"]

    @staticmethod
    def _extract_json(text: str) -> dict[str, Any]:
        text = text.strip()
        fence = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
        if fence:
            text = fence.group(1)
        else:
            start = text.find("{")
            end = text.rfind("}")
            if start >= 0 and end > start:
                text = text[start : end + 1]
        return json.loads(text)

    async def generate_portfolio(
        self,
        project_details: str,
        existing_skills: list[str] | None = None,
    ) -> dict[str, Any]:
        """Generate portfolio card fields from raw project details."""
        fallback = {
            "title": (project_details[:60] + "…") if len(project_details) > 60 else project_details,
            "description": project_details,
            "skills_used": existing_skills or ["Creative Work", "Problem Solving"],
            "tools_used": ["Figma", "Notion"],
        }
        if not self.enabled:
            return fallback

        system = (
            "You are SkillSwap AI Portfolio Builder. Return ONLY valid JSON with keys: "
            "title, description, skills_used (array), tools_used (array). "
            "Write a premium, client-ready portfolio card for a student/young creator."
        )
        user = f"Project details:\n{project_details}\nKnown skills: {existing_skills or []}"
        try:
            raw = await self._chat(system, user)
            data = self._extract_json(raw)
            return {
                "title": data.get("title") or fallback["title"],
                "description": data.get("description") or fallback["description"],
                "skills_used": data.get("skills_used") or fallback["skills_used"],
                "tools_used": data.get("tools_used") or fallback["tools_used"],
            }
        except Exception as exc:  # noqa: BLE001
            logger.warning("generate_portfolio fallback: %s", exc)
            return fallback

    def match_creators(
        self,
        job: dict[str, Any],
        creators: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        """
        Trust-weighted talent match.

        Score blends skill overlap, tag overlap, experience, portfolio similarity,
        and creator trust/rating — never lowest-price ranking.
        """
        required = {s.lower() for s in (job.get("required_skills") or [])}
        tags = {t.lower() for t in (job.get("tags") or [])}
        job_text = f"{job.get('title', '')} {job.get('description', '')}".lower()

        results: list[dict[str, Any]] = []
        for creator in creators:
            skills = {s.lower() for s in (creator.get("skills") or [])}
            ctags = {t.lower() for t in (creator.get("tags") or [])}
            portfolio_blob = " ".join(creator.get("portfolio_texts") or []).lower()

            skill_overlap = len(required & skills) / max(len(required), 1)
            tag_overlap = len(tags & ctags) / max(len(tags), 1) if tags else 0.0
            exp = min(float(creator.get("experience_years") or 0) / 5.0, 1.0)
            portfolio_hits = sum(1 for token in required if token in portfolio_blob)
            portfolio_sim = portfolio_hits / max(len(required), 1)
            if not required and job_text:
                portfolio_sim = 0.35 if any(w in portfolio_blob for w in job_text.split()[:8]) else 0.1

            trust = float(creator.get("trust_score") or 50) / 100.0
            rating = float(creator.get("rating_avg") or 0) / 5.0

            score = (
                skill_overlap * 0.35
                + tag_overlap * 0.15
                + exp * 0.10
                + portfolio_sim * 0.20
                + trust * 0.12
                + rating * 0.08
            ) * 100

            reasons: list[str] = []
            shared_skills = sorted(required & skills)
            if shared_skills:
                reasons.append(f"Skills match: {', '.join(shared_skills[:5])}")
            shared_tags = sorted(tags & ctags)
            if shared_tags:
                reasons.append(f"Tags align: {', '.join(shared_tags[:4])}")
            if portfolio_sim >= 0.3:
                reasons.append("Portfolio shows relevant project evidence")
            if trust >= 0.7:
                reasons.append(f"Strong trust score ({creator.get('trust_score'):.0f})")
            if rating >= 0.8:
                reasons.append(f"High client rating ({creator.get('rating_avg'):.1f}/5)")
            if not reasons:
                reasons.append("Partial profile fit — consider for exploratory outreach")

            results.append(
                {
                    "creator_id": creator["user_id"],
                    "full_name": creator.get("full_name", "Creator"),
                    "headline": creator.get("headline"),
                    "compatibility_score": round(score, 1),
                    "matching_reasons": reasons,
                    "trust_score": float(creator.get("trust_score") or 50),
                    "rating_avg": float(creator.get("rating_avg") or 0),
                    "skills": creator.get("skills") or [],
                }
            )

        results.sort(key=lambda r: r["compatibility_score"], reverse=True)
        return results

    async def suggest_pricing(
        self,
        category: str,
        skills: list[str],
        experience_years: float,
        delivery_days: int,
    ) -> dict[str, Any]:
        baseline = 80 + (experience_years * 25) + (len(skills) * 8)
        category_boost = {
            "design": 1.1,
            "development": 1.25,
            "writing": 0.9,
            "video": 1.15,
            "marketing": 1.05,
        }.get(category.lower(), 1.0)
        suggested = round(baseline * category_boost * max(1, min(delivery_days, 21) / 7), 2)
        return {
            "suggested_price": suggested,
            "range_min": round(suggested * 0.75, 2),
            "range_max": round(suggested * 1.35, 2),
            "rationale": (
                f"Based on {category} demand, {experience_years}y experience, "
                f"{len(skills)} skills, and {delivery_days}-day delivery."
            ),
        }

    async def chat_assistant(self, prompt: str, context: str | None = None) -> str:
        if not self.enabled:
            return (
                "I'm SkillSwap Assistant (offline mode). Focus your brief on outcomes, "
                "required skills, budget range, and delivery timeline for better matches."
            )
        system = (
            "You are SkillSwap AI Assistant helping students/creators and clients on an "
            "AI skill marketplace. Be concise, practical, and encouraging."
        )
        user = f"Context:\n{context or 'n/a'}\n\nUser:\n{prompt}"
        try:
            return await self._chat(system, user)
        except Exception as exc:  # noqa: BLE001
            logger.warning("chat_assistant fallback: %s", exc)
            return "I couldn't reach the AI provider right now. Try refining skills and trust signals."


ai_service = AIService()
