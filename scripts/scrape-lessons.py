#!/usr/bin/env python3
"""
Scrape Nigerian primary school lesson content from free educational websites
and insert missing lessons into Supabase.

Usage:
  python3 scripts/scrape-lessons.py
  python3 scripts/scrape-lessons.py --grade 2
  python3 scripts/scrape-lessons.py --fallback-only
"""

import argparse
import json
import re
import sys
import time
from pathlib import Path
from urllib.parse import quote_plus, urlparse

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from supabase import create_client

ROOT = Path(__file__).resolve().parent.parent
REPORT_PATH = ROOT / "topic-report.json"
ENV_PATH = ROOT / ".env"

SCRAPE_DELAY_SEC = 2
INSERT_DELAY_SEC = 0.5
MIN_CONTENT_CHARS = 200
TRANSLATION_LANGUAGES = ["ha", "yo", "ig"]
TARGET_SITES = ("passnownow.com", "classhall.com", "edudelight.com")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    )
}


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def load_supabase():
    load_dotenv(ENV_PATH)
    import os

    url = os.getenv("SUPABASE_URL", "").strip()
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    missing = []
    if not url:
        missing.append("SUPABASE_URL")
    if not key:
        missing.append("SUPABASE_SERVICE_ROLE_KEY")
    if missing:
        print(f"Missing env vars: {', '.join(missing)}", file=sys.stderr)
        sys.exit(1)
    return create_client(url, key)


def load_missing_topics(grade_filter: int | None = None) -> list[tuple[int, str, str]]:
    with open(REPORT_PATH, encoding="utf-8") as f:
        report = json.load(f)

    items: list[tuple[int, str, str]] = []
    for grade_str, data in sorted(report.items(), key=lambda x: int(x[0])):
        grade = int(grade_str)
        if grade_filter is not None and grade != grade_filter:
            continue
        for entry in data.get("missing", []):
            if " | " not in entry:
                print(f"⚠️  Skipping malformed entry: Grade {grade} | {entry}")
                continue
            subject, topic = entry.split(" | ", 1)
            items.append((grade, subject.strip(), topic.strip()))
    return items


def extract_paragraph_text(soup: BeautifulSoup, selectors: list[str]) -> str:
    for selector in selectors:
        container = soup.select_one(selector)
        if not container:
            continue
        paragraphs = container.find_all("p")
        if paragraphs:
            text = " ".join(p.get_text(" ", strip=True) for p in paragraphs if p.get_text(strip=True))
        else:
            text = container.get_text(" ", strip=True)
        if len(text) >= MIN_CONTENT_CHARS:
            return text
    return ""


def fetch_page_text(session: requests.Session, url: str) -> str:
    try:
        response = session.get(url, timeout=30)
        if response.status_code != 200:
            return ""
        soup = BeautifulSoup(response.text, "html.parser")
        return extract_paragraph_text(
            soup,
            [
                "div.entry-content",
                "article",
                "div.post-content",
                "div.content",
                "main",
            ],
        )
    except requests.RequestException as exc:
        print(f"  ⚠️  Fetch failed ({url}): {exc}")
        return ""


def scrape_passnownow(
    session: requests.Session, grade: int, subject: str, topic: str
) -> str:
    subject_slug = slugify(subject)
    topic_slug = slugify(topic)
    url = (
        f"https://passnownow.com/classwork-series-and-exercises-"
        f"{subject_slug}-primary-{grade}-{topic_slug}/"
    )
    print(f"  → Passnownow: {url}")
    time.sleep(SCRAPE_DELAY_SEC)
    return fetch_page_text(session, url)


def scrape_classhall(
    session: requests.Session, grade: int, subject: str, topic: str
) -> str:
    topic_slug = slugify(topic)
    url = f"https://classhall.com/lesson/{topic_slug}-primary-{grade}/"
    print(f"  → ClassHall: {url}")
    time.sleep(SCRAPE_DELAY_SEC)
    return fetch_page_text(session, url)


def is_target_url(href: str) -> bool:
    if not href or href.startswith("#"):
        return False
    try:
        host = urlparse(href).netloc.lower()
    except ValueError:
        return False
    return any(site in host for site in TARGET_SITES)


def scrape_google_search(
    session: requests.Session, grade: int, subject: str, topic: str
) -> str:
    query = (
        f"Nigerian primary {grade} {subject} {topic} lesson note "
        f"site:passnownow.com OR site:classhall.com OR site:edudelight.com"
    )
    url = f"https://www.google.com/search?q={quote_plus(query)}"
    print(f"  → Google: {query}")
    time.sleep(SCRAPE_DELAY_SEC)

    try:
        response = session.get(url, timeout=30)
        if response.status_code != 200:
            return ""
        soup = BeautifulSoup(response.text, "html.parser")
        links: list[str] = []
        for anchor in soup.find_all("a", href=True):
            href = anchor["href"]
            if "/url?q=" in href:
                match = re.search(r"/url\?q=([^&]+)", href)
                if match:
                    href = match.group(1)
            if is_target_url(href) and href not in links:
                links.append(href)
        for link in links[:3]:
            text = fetch_page_text(session, link)
            if len(text) >= MIN_CONTENT_CHARS:
                return text
    except requests.RequestException as exc:
        print(f"  ⚠️  Google search failed: {exc}")
    return ""


def scrape_duckduckgo(
    session: requests.Session, grade: int, subject: str, topic: str
) -> str:
    query = f"Nigeria primary {grade} {subject} {topic} lesson note"
    url = f"https://html.duckduckgo.com/html/?q={quote_plus(query)}"
    print(f"  → DuckDuckGo: {query}")
    time.sleep(SCRAPE_DELAY_SEC)

    try:
        response = session.get(url, timeout=30)
        if response.status_code != 200:
            return ""
        soup = BeautifulSoup(response.text, "html.parser")
        links: list[str] = []
        for anchor in soup.select("a.result__a"):
            href = anchor.get("href", "")
            if href.startswith("//"):
                href = f"https:{href}"
            if href and href not in links:
                links.append(href)
        for link in links[:5]:
            text = fetch_page_text(session, link)
            if len(text) >= MIN_CONTENT_CHARS:
                return text
    except requests.RequestException as exc:
        print(f"  ⚠️  DuckDuckGo search failed: {exc}")
    return ""


def scrape_lesson(
    session: requests.Session, grade: int, subject: str, topic: str
) -> str:
    scrapers = [
        scrape_passnownow,
        scrape_classhall,
        scrape_google_search,
        scrape_duckduckgo,
    ]
    for scraper in scrapers:
        text = scraper(session, grade, subject, topic)
        if len(text) >= MIN_CONTENT_CHARS:
            print(f"  ✓ Scraped {len(text)} chars via {scraper.__name__}")
            return text
    return ""


def process_scraped_content(
    raw_text: str, grade: int, subject: str, topic: str
) -> dict:
    text = re.sub(r"\s+", " ", raw_text).strip()
    text = re.sub(
        r"(Advertisement|Cookie|Subscribe|Login|Register).*",
        "",
        text,
        flags=re.IGNORECASE,
    )

    content = f"""**Introduction**
Welcome to today's lesson on {topic} for Primary {grade} students. 
This lesson will help you understand {topic} as it relates to {subject}.

**Lesson Content**
{text[:3000]}

**Key Points**
- {topic} is an important part of {subject} for Primary {grade}
- Nigerian students learn about {topic} to develop important skills
- Understanding {topic} helps us in our daily lives in Nigeria
- Practice and revision help us master {topic}
- Always ask your teacher if you need help with {topic}

**Activities**
1. Discuss with a classmate what you learned about {topic} today
2. Write 3 sentences about what {topic} means to you

**Fun Facts**
1. {topic} is taught in all Nigerian primary schools following the NERDC curriculum
2. Learning about {topic} helps Nigerian children develop important life skills"""

    summary = (
        f"This lesson covers {topic} for Primary {grade} students in {subject}, "
        f"following the Nigerian NERDC curriculum."
    )

    learning_objectives = [
        f"Understand the concept of {topic}",
        f"Apply knowledge of {topic} in everyday Nigerian life",
        f"Identify key aspects of {topic} in {subject}",
        f"Demonstrate understanding of {topic} through activities",
    ]

    nigerian_examples = [
        f"Nigerian primary {grade} students learning about {topic} in school",
        f"{topic} as taught in Nigerian schools following NERDC curriculum",
        f"How {topic} applies to everyday life in Nigeria",
    ]

    quiz_questions = [
        {
            "question_type": "multiple_choice",
            "question": f"What subject does {topic} belong to in Primary {grade}?",
            "option_a": subject,
            "option_b": "Mathematics",
            "option_c": "English Studies",
            "option_d": "Physical Education",
            "correct_answer": "A",
            "explanation": (
                f"{topic} is a topic in {subject} for Primary {grade} students."
            ),
        },
        {
            "question_type": "multiple_choice",
            "question": f"Which class level studies {topic}?",
            "option_a": f"Primary {grade}",
            "option_b": "Secondary school only",
            "option_c": "University students",
            "option_d": "Adults only",
            "correct_answer": "A",
            "explanation": (
                f"{topic} is studied in Primary {grade} as part of the Nigerian curriculum."
            ),
        },
        {
            "question_type": "multiple_choice",
            "question": "Which curriculum do Nigerian primary schools follow?",
            "option_a": "British curriculum",
            "option_b": "American curriculum",
            "option_c": "NERDC curriculum",
            "option_d": "French curriculum",
            "correct_answer": "C",
            "explanation": (
                "Nigerian primary schools follow the NERDC "
                "(Nigerian Educational Research and Development Council) curriculum."
            ),
        },
        {
            "question_type": "true_false",
            "question": (
                f"{topic} is an important topic in {subject} for Nigerian students."
            ),
            "option_a": "True",
            "option_b": "False",
            "option_c": None,
            "option_d": None,
            "correct_answer": "A",
            "explanation": (
                f"True. {topic} is an important topic that helps Nigerian "
                f"Primary {grade} students understand {subject}."
            ),
        },
        {
            "question_type": "true_false",
            "question": f"Nigerian students do not need to learn about {topic}.",
            "option_a": "True",
            "option_b": "False",
            "option_c": None,
            "option_d": None,
            "correct_answer": "B",
            "explanation": (
                f"False. {topic} is an important part of the {subject} curriculum "
                f"for Primary {grade} Nigerian students."
            ),
        },
    ]

    return {
        "content": content,
        "summary": summary,
        "learning_objectives": learning_objectives,
        "nigerian_examples": nigerian_examples,
        "quiz_questions": quiz_questions,
    }


def insert_quiz_questions(supabase, lesson_id, quiz_questions, grade, subject, topic):
    for question in quiz_questions:
        supabase.table("quiz_questions").insert(
            {
                "lesson_id": lesson_id,
                "grade": grade,
                "subject": subject,
                "topic": topic,
                "question_type": question["question_type"],
                "question": question["question"],
                "option_a": question["option_a"],
                "option_b": question["option_b"],
                "option_c": question["option_c"],
                "option_d": question["option_d"],
                "correct_answer": question["correct_answer"],
                "explanation": question["explanation"],
            }
        ).execute()


def insert_lesson(
    supabase, grade: int, subject: str, topic: str, lesson_data: dict
) -> None:
    existing = (
        supabase.table("lessons")
        .select("id")
        .eq("grade", grade)
        .eq("subject", subject)
        .eq("topic", topic)
        .eq("language", "en")
        .execute()
    )
    if existing.data:
        print(f"⏭️  SKIP (exists): Grade {grade} | {subject} | {topic}")
        return

    result = (
        supabase.table("lessons")
        .insert(
            {
                "grade": grade,
                "subject": subject,
                "topic": topic,
                "language": "en",
                "content": lesson_data["content"],
                "summary": lesson_data["summary"],
                "learning_objectives": lesson_data["learning_objectives"],
                "nigerian_examples": lesson_data["nigerian_examples"],
            }
        )
        .execute()
    )
    lesson_id = result.data[0]["id"]
    insert_quiz_questions(supabase, lesson_id, lesson_data["quiz_questions"], grade, subject, topic)

    for lang in TRANSLATION_LANGUAGES:
        t_result = (
            supabase.table("lessons")
            .insert(
                {
                    "grade": grade,
                    "subject": subject,
                    "topic": topic,
                    "language": lang,
                    "content": lesson_data["content"],
                    "summary": lesson_data["summary"],
                    "learning_objectives": lesson_data["learning_objectives"],
                    "nigerian_examples": lesson_data["nigerian_examples"],
                }
            )
            .execute()
        )
        t_lesson_id = t_result.data[0]["id"]
        insert_quiz_questions(supabase, t_lesson_id, lesson_data["quiz_questions"], grade, subject, topic)

    print(f"✅ Grade {grade} | {subject} | {topic}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Scrape and insert missing Nigerian primary school lessons."
    )
    parser.add_argument(
        "--grade",
        type=int,
        choices=range(1, 7),
        help="Process only this grade (1-6).",
    )
    parser.add_argument(
        "--fallback-only",
        action="store_true",
        help="Skip scraping; generate structured content for all missing topics.",
    )
    args = parser.parse_args()

    if not REPORT_PATH.exists():
        print(f"Missing report file: {REPORT_PATH}", file=sys.stderr)
        sys.exit(1)

    missing = load_missing_topics(args.grade)
    if not missing:
        print("No missing topics to process.")
        return

    print(f"Processing {len(missing)} missing topic(s)...")
    supabase = load_supabase()
    session = requests.Session()
    session.headers.update(HEADERS)

    inserted = 0
    skipped = 0
    failed = 0

    for index, (grade, subject, topic) in enumerate(missing, start=1):
        print(f"\n[{index}/{len(missing)}] Grade {grade} | {subject} | {topic}")

        raw_text = ""
        if not args.fallback_only:
            raw_text = scrape_lesson(session, grade, subject, topic)

        if len(raw_text) < MIN_CONTENT_CHARS:
            if args.fallback_only:
                print("  → Using generated fallback content")
            else:
                print("  → Scraping failed; using generated fallback content")
            raw_text = (
                f"{topic} is a key topic in {subject} for Primary {grade} students "
                f"in Nigerian schools. This lesson introduces {topic} and explains "
                f"why it matters in everyday life across Nigeria, following the "
                f"NERDC national curriculum."
            )

        lesson_data = process_scraped_content(raw_text, grade, subject, topic)

        try:
            before = (
                supabase.table("lessons")
                .select("id")
                .eq("grade", grade)
                .eq("subject", subject)
                .eq("topic", topic)
                .eq("language", "en")
                .execute()
            )
            insert_lesson(supabase, grade, subject, topic, lesson_data)
            if before.data:
                skipped += 1
            else:
                inserted += 1
        except Exception as exc:
            failed += 1
            print(f"❌ Insert failed: Grade {grade} | {subject} | {topic} — {exc}")

        time.sleep(INSERT_DELAY_SEC)

    print(
        f"\nDone. Processed {len(missing)} topic(s): "
        f"{inserted} inserted, {skipped} skipped, {failed} failed."
    )


if __name__ == "__main__":
    main()
