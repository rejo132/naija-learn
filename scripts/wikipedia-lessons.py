#!/usr/bin/env python3
"""
Fetch Wikipedia content and upgrade weak Supabase lessons (< 800 chars).

Usage:
  .venv/bin/python3 scripts/wikipedia-lessons.py
  .venv/bin/python3 scripts/wikipedia-lessons.py --grade 2
  .venv/bin/python3 scripts/wikipedia-lessons.py --fix-bad
"""

import argparse
import os
import random
import re
import sys
import time
from pathlib import Path

import requests
from dotenv import load_dotenv
from supabase import create_client

ROOT = Path(__file__).resolve().parent.parent
ENV_PATH = ROOT / ".env"

SUPABASE_DELAY_SEC = 0.3
WIKIPEDIA_DELAY_SEC = 1
MIN_GOOD_CONTENT_CHARS = 800

GRADE_GUIDE = {
    1: {
        "level": "very simple",
        "sentence": "very short sentences, maximum 8 words each",
        "vocabulary": "only the simplest everyday words a 6 year old knows",
        "tone": "very warm, playful, like a kind aunty or uncle talking to a small child",
        "length": 900,
        "hook": "a very short fun story about a Nigerian child",
    },
    2: {
        "level": "simple",
        "sentence": "short sentences, maximum 10 words each",
        "vocabulary": "simple words a 7 year old knows, explain any new word immediately",
        "tone": "friendly and encouraging, like a favourite teacher",
        "length": 1000,
        "hook": "a short story or question about something familiar in Nigeria",
    },
    3: {
        "level": "easy to understand",
        "sentence": "clear sentences, maximum 12 words each",
        "vocabulary": "everyday words with brief explanation of new terms",
        "tone": "encouraging and clear, like a patient teacher",
        "length": 1100,
        "hook": "a relatable Nigerian scenario or question",
    },
    4: {
        "level": "moderate",
        "sentence": "clear sentences with some compound sentences",
        "vocabulary": "grade-appropriate words, define technical terms clearly",
        "tone": "clear, informative, and motivating",
        "length": 1200,
        "hook": "an interesting fact or Nigerian scenario",
    },
    5: {
        "level": "intermediate",
        "sentence": "varied sentence structure, some complex sentences",
        "vocabulary": "subject-specific vocabulary with clear definitions",
        "tone": "informative and engaging, treats student as capable",
        "length": 1300,
        "hook": "a thought-provoking question or real-world Nigerian connection",
    },
    6: {
        "level": "detailed and thorough",
        "sentence": "full varied sentences, complex ideas explained clearly",
        "vocabulary": "rich vocabulary appropriate for secondary school preparation",
        "tone": "academic but accessible, prepares student for secondary school",
        "length": 1400,
        "hook": "a real-world Nigerian problem or current event connection",
    },
}

NIGERIAN_NAMES = [
    "Chidi",
    "Amina",
    "Tunde",
    "Ngozi",
    "Emeka",
    "Halima",
    "Yusuf",
    "Funke",
    "Ibrahim",
    "Aisha",
    "Obinna",
    "Fatima",
    "Seun",
    "Adaeze",
    "Musa",
    "Chisom",
    "Hauwa",
    "Taiwo",
    "Ifunanya",
    "Suleiman",
]

NIGERIAN_PLACES = [
    "Lagos",
    "Kano",
    "Abuja",
    "Enugu",
    "Ibadan",
    "Port Harcourt",
    "Kaduna",
    "Owerri",
    "Benin City",
    "Jos",
    "Sokoto",
    "Zaria",
    "Onitsha",
    "Calabar",
]

NIGERIAN_SCHOOLS = [
    "Government Primary School, Lagos",
    "Federal Government School, Abuja",
    "Community Primary School, Kano",
    "St. Joseph Primary School, Enugu",
    "Unity Primary School, Ibadan",
]

WIKI_HEADERS = {"User-Agent": "LearnNaija/1.0 (educational app)"}

BAD_MATCHES = [
    # Grade 2
    {"grade": 2, "subject": "Confidence Building", "topic": "Asking for Help"},
    {"grade": 2, "subject": "Teamwork", "topic": "Supporting Teammates"},
    {"grade": 2, "subject": "Teamwork", "topic": "Group Projects"},
    {
        "grade": 2,
        "subject": "Social & Citizenship Studies",
        "topic": "Festivals and Celebrations",
    },
    {"grade": 2, "subject": "English Studies", "topic": "Simple Sentences"},
    {"grade": 2, "subject": "CRS / Islamic Studies", "topic": "Love and Service"},
    # Grade 3
    {"grade": 3, "subject": "Creativity", "topic": "Breaking Down Problems"},
    {"grade": 3, "subject": "Creativity", "topic": "Alternative Solutions"},
    {"grade": 3, "subject": "Physical & Health Education", "topic": "Athletics"},
    {"grade": 3, "subject": "Teamwork", "topic": "Defining Roles"},
    {"grade": 3, "subject": "Teamwork", "topic": "Collaborative Success"},
    {"grade": 3, "subject": "Leadership", "topic": "Inspiring Others"},
    {
        "grade": 3,
        "subject": "Basic Digital Literacy",
        "topic": "Introduction to Coding",
    },
    {
        "grade": 3,
        "subject": "Basic Digital Literacy",
        "topic": "Safe Internet Use",
    },
    {"grade": 3, "subject": "English Studies", "topic": "Phoneme Identification"},
    {"grade": 3, "subject": "Leadership", "topic": "Managing Resources"},
    # Grade 4
    {
        "grade": 4,
        "subject": "Basic Digital Literacy",
        "topic": "Constructing Emails",
    },
    {"grade": 4, "subject": "CRS / Islamic Studies", "topic": "Ethics and Justice"},
    {"grade": 4, "subject": "English Studies", "topic": "Eight Parts of Speech"},
    {"grade": 4, "subject": "Mathematics", "topic": "Data and Graphs"},
    {
        "grade": 4,
        "subject": "Social & Citizenship Studies",
        "topic": "Structure of Government",
    },
    {
        "grade": 4,
        "subject": "Social & Citizenship Studies",
        "topic": "Rights and Duties",
    },
    {
        "grade": 4,
        "subject": "Confidence Building",
        "topic": "Strengths Identification",
    },
    # Grade 5
    {"grade": 5, "subject": "Confidence Building", "topic": "Handling Criticism"},
    # Grade 6
    {"grade": 6, "subject": "Leadership", "topic": "Visionary Leadership"},
]


def rname() -> str:
    return random.choice(NIGERIAN_NAMES)


def rplace() -> str:
    return random.choice(NIGERIAN_PLACES)


def rschool() -> str:
    return random.choice(NIGERIAN_SCHOOLS)


def load_supabase():
    load_dotenv(ENV_PATH)
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


def fetch_wikipedia(topic: str, grade: int, subject: str) -> tuple[str | None, str | None]:
    searches = [
        topic,
        f"{topic} education",
        f"{topic} for children",
        f"{subject} {topic}",
    ]
    search_url = "https://en.wikipedia.org/w/api.php"

    for query in searches:
        try:
            search_params = {
                "action": "query",
                "list": "search",
                "srsearch": query,
                "format": "json",
                "srlimit": 1,
            }
            response = requests.get(
                search_url,
                params=search_params,
                timeout=10,
                headers=WIKI_HEADERS,
            )
            data = response.json()
            if not data.get("query", {}).get("search"):
                continue

            page_title = data["query"]["search"][0]["title"]
            extract_params = {
                "action": "query",
                "prop": "extracts",
                "exintro": False,
                "explaintext": True,
                "titles": page_title,
                "format": "json",
                "exsectionformat": "plain",
            }
            response2 = requests.get(
                search_url,
                params=extract_params,
                timeout=10,
                headers=WIKI_HEADERS,
            )
            data2 = response2.json()
            pages = data2.get("query", {}).get("pages", {})
            for page in pages.values():
                extract = page.get("extract", "")
                if len(extract) > 300:
                    return extract[:5000], page_title
        except Exception:
            continue

    return None, None


def topic_words_match_title(topic: str, page_title: str) -> bool:
    stop_words = {
        "and",
        "the",
        "to",
        "for",
        "of",
        "in",
        "a",
        "an",
        "or",
        "with",
        "on",
        "at",
        "by",
    }
    topic_words = [
        word.lower()
        for word in re.split(r"\W+", topic)
        if word.lower() not in stop_words and len(word) > 2
    ]
    if not topic_words:
        return topic.lower() in page_title.lower()
    title_lower = page_title.lower()
    return any(word in title_lower for word in topic_words)


def _fetch_wikipedia_extract(
    search_url: str, query: str, require_title_match: bool = False, topic: str = ""
) -> tuple[str | None, str | None]:
    try:
        search_params = {
            "action": "query",
            "list": "search",
            "srsearch": query,
            "format": "json",
            "srlimit": 1,
        }
        response = requests.get(
            search_url,
            params=search_params,
            timeout=10,
            headers=WIKI_HEADERS,
        )
        data = response.json()
        if not data.get("query", {}).get("search"):
            return None, None

        page_title = data["query"]["search"][0]["title"]
        if require_title_match and not topic_words_match_title(topic, page_title):
            return None, None

        extract_params = {
            "action": "query",
            "prop": "extracts",
            "exintro": False,
            "explaintext": True,
            "titles": page_title,
            "format": "json",
            "exsectionformat": "plain",
        }
        response2 = requests.get(
            search_url,
            params=extract_params,
            timeout=10,
            headers=WIKI_HEADERS,
        )
        data2 = response2.json()
        pages = data2.get("query", {}).get("pages", {})
        for page in pages.values():
            extract = page.get("extract", "")
            if len(extract) > 300:
                return extract[:5000], page_title
    except Exception:
        return None, None

    return None, None


def fetch_wikipedia_for_fix(
    topic: str, grade: int, subject: str
) -> tuple[str | None, str | None]:
    searches = [
        f"Nigerian primary school {topic}",
        f"{topic} Nigeria children",
        f"{topic} primary education",
        f"{topic} kids learning",
    ]
    search_url = "https://en.wikipedia.org/w/api.php"

    for query in searches:
        extract, page_title = _fetch_wikipedia_extract(
            search_url, query, require_title_match=True, topic=topic
        )
        if extract:
            return extract, page_title

    return None, None


def simplify_for_grade(text: str, grade: int) -> str:
    sentences = text.replace("\n", " ").split(".")
    simplified = []
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        if grade <= 2 and len(sentence.split()) > 15:
            parts = sentence.split(",")
            for part in parts:
                part = part.strip()
                if part and len(part) > 10:
                    simplified.append(part + ".")
        elif grade <= 4 and len(sentence.split()) > 25:
            parts = sentence.split(",")
            for part in parts:
                part = part.strip()
                if part and len(part) > 10:
                    simplified.append(part + ".")
        else:
            simplified.append(sentence + ".")
    return " ".join(simplified[:40])


def build_lesson(
    wiki_text: str | None, topic: str, grade: int, subject: str
) -> dict:
    n1, n2, n3 = rname(), rname(), rname()
    p1, p2, p3 = rplace(), rplace(), rplace()
    school = rschool()

    if wiki_text:
        simplified_wiki = simplify_for_grade(wiki_text, grade)
    else:
        simplified_wiki = (
            f"{topic} is an important subject that students "
            f"learn in Primary {grade}. It helps us understand "
            f"the world around us better."
        )

    if grade <= 2:
        intro = f"""**Introduction**
Hello, children! Today we will learn about {topic}. 

{n1} goes to {school}. One day, {n1} asked the teacher: 
"What is {topic}?" The teacher smiled and said: "Let us find out together!"

Are you ready to learn? Let us go!"""

        explanation = f"""**What is {topic}?**
{simplified_wiki}

This is very important for us to know. We use this in our daily life. 
Even in {p1} and {p2}, people use this every day!

Let us look at some examples to understand better."""

        examples = f"""**Examples — Let Us See!**
1. {n1} lives in {p1}. {n1} sees {topic} every day at home and at school. 
   {n1} is happy to learn about it!

2. {n2} is in Primary {grade} at {school}. 
   The teacher told {n2} about {topic}. 
   Now {n2} understands it very well.

3. In {p2}, many children learn about {topic} in school. 
   It helps them do well in class and in life."""

        key_points = f"""**What We Learned Today**
- {topic} is something we can see and use every day
- We find {topic} in our homes, schools and towns in Nigeria
- {n1} and {n2} from {p1} both learned about {topic}
- Learning about {topic} helps us do better in {subject}
- Always ask your teacher if you want to know more about {topic}"""

        activities = f"""**Let Us Do Something Fun!**
1. Draw a picture that shows {topic}. 
   Show your drawing to your friend. Tell them what you drew!

2. Talk to your friend about {topic}. 
   Can you tell them one thing you learned today? Try it!"""

        fun_facts = f"""**Did You Know?**
1. Children all over Nigeria learn about {topic} in Primary {grade}. 
   You are learning the same things as children in {p1}, {p2} and {p3}!

2. Your teacher learned about {topic} too when they were in school. 
   Now you are learning it. One day you can teach someone else!"""

    elif grade <= 4:
        intro = f"""**Introduction**
Welcome to today's lesson on {topic}! 

{n1} is a Primary {grade} student at {school} in {p1}. 
One morning, {n1} was walking to school and noticed something interesting 
connected to {topic}. This made {n1} very curious to learn more in class.

Have you ever thought about {topic} before? By the end of this lesson, 
you will understand it clearly and be able to explain it to others!"""

        explanation = f"""**Understanding {topic}**
Let us learn about {topic} carefully.

{simplified_wiki}

This is important because {topic} is part of our everyday life in Nigeria. 
From {p1} to {p2} to {p3}, people use and experience {topic} all the time. 
As a Primary {grade} student, understanding {topic} will help you in 
{subject} and in many other areas of your learning."""

        examples = f"""**Nigerian Examples**
Let us look at three clear examples to help us understand {topic} better:

1. **{n1} in {p1}:** {n1} is in Primary {grade} at {school}. 
   During the {subject} lesson, the teacher used {topic} to explain 
   something important. {n1} paid attention and understood it well. 
   This helped {n1} answer questions correctly during the class test.

2. **{n2} in {p2}:** {n2}'s family talks about {topic} at home. 
   {n2} was surprised to discover that {topic} connects to real life 
   in {p2}. {n2} shared what was learned in school with the family, 
   and everyone was impressed.

3. **Students across Nigeria:** In schools across Nigeria — from {p1} 
   to {p3} — teachers explain {topic} using local examples. This helps 
   students understand {subject} better and connect learning to real life."""

        key_points = f"""**Key Points to Remember**
- {topic} is an important part of {subject} for Primary {grade} students
- We can find examples of {topic} in our daily life in Nigeria
- Understanding {topic} helps us do better in {subject} tests and exams
- Students in {p1}, {p2} and across Nigeria all study {topic}
- Always revise what you have learned about {topic} at home"""

        activities = f"""**Class Activities**
1. **Discussion Activity:** Talk with a partner about {topic}. 
   Where have you seen or experienced {topic} in your daily life in Nigeria? 
   Share at least two examples with your partner and listen to theirs.

2. **Writing Activity:** Write a short paragraph of five sentences about 
   {topic}. Include the names of people and places you know in Nigeria. 
   Read your paragraph to the class when you are done."""

        fun_facts = f"""**Fun Facts**
1. {topic} is taught in all Nigerian primary schools as part of the 
   NERDC curriculum. This means that every Primary {grade} student 
   across Nigeria — in {p1}, {p2}, {p3} and everywhere else — is 
   learning the same thing as you right now!

2. Many successful Nigerians say that what they learned in primary school 
   about topics like {topic} gave them a strong foundation for their future. 
   Pay attention now and it will help you later in life!"""

    else:
        intro = f"""**Introduction**
{n1}, a Primary {grade} student at {school} in {p1}, was preparing for 
the end-of-term examination when the topic of {topic} came up in {subject} 
class. At first, {n1} found it challenging, but after the teacher's 
explanation and some practice, {n1} realised how {topic} connects to 
real life in Nigeria and beyond.

As you approach the end of your primary school education, understanding 
topics like {topic} thoroughly is essential. This lesson will give you 
a detailed understanding of {topic}, its importance, and how it applies 
to life in Nigeria. Read carefully, think deeply, and engage with the 
activities at the end."""

        explanation = f"""**Detailed Explanation of {topic}**
{simplified_wiki}

**Why {topic} Matters in Nigeria**
In Nigeria, {topic} plays a significant role in everyday life, education, 
and national development. From the bustling streets of {p1} to the 
communities of {p2} and {p3}, the principles and applications of {topic} 
can be observed in many aspects of Nigerian society.

As a Primary {grade} student, your understanding of {topic} will prepare 
you not only for your primary school leaving examination but also for 
secondary school, where you will study this and related topics in greater 
depth. The foundation you build now is crucial for your academic future."""

        examples = f"""**Detailed Nigerian Examples**

1. **Academic Application — {n1} in {p1}:**
   {n1} studied {topic} as part of the Primary {grade} {subject} 
   curriculum at {school}. By understanding the key concepts of {topic}, 
   {n1} was able to score 85% in the end-of-term examination and 
   received commendation from the teacher. {n1} also used this knowledge 
   in a school project that won second place at the inter-school 
   competition in {p1}.

2. **Real-World Connection — {n2} in {p2}:**
   {n2}'s community in {p2} faced a situation directly related to {topic}. 
   Because {n2} had studied {topic} in {subject} class, {n2} was able to 
   explain the situation to family members and suggest solutions based on 
   knowledge from school. This shows how academic learning connects to 
   real-world Nigerian life.

3. **National Relevance — Nigeria as a whole:**
   {topic} is not just a school subject — it is relevant to Nigeria's 
   development as a nation. Government policies, community decisions, 
   and individual choices in cities like {p1}, {p2}, and {p3} are all 
   influenced by the principles of {topic}. As future leaders of Nigeria, 
   understanding {topic} equips you to contribute meaningfully to your 
   country."""

        key_points = f"""**Key Points**
- {topic} is a core component of {subject} at the Primary {grade} level 
  in the Nigerian NERDC curriculum
- A thorough understanding of {topic} is essential for primary school 
  leaving examinations and secondary school readiness
- {topic} has direct real-world applications in Nigerian communities 
  including {p1}, {p2}, and {p3}
- Mastery of {topic} builds critical thinking and analytical skills 
  that are valuable beyond the classroom
- Regular revision and practice of {topic} concepts leads to academic 
  excellence and deeper understanding"""

        activities = f"""**Activities**

1. **Research and Presentation Activity:**
   Research one real-life example of {topic} in Nigeria. It could be 
   something from your city, your state, or from national news. 
   Write a one-page report about it and present your findings to the class. 
   Include: what the example is, how it relates to {topic}, and what we 
   can learn from it as Nigerians.

2. **Critical Thinking Activity:**
   Consider this question: "How does understanding {topic} help Nigeria 
   develop as a nation?" Write at least one paragraph giving your opinion 
   with two supporting reasons. Discuss your answer with a partner, then 
   share the most interesting points with the class."""

        fun_facts = f"""**Interesting Facts**
1. {topic} is part of the Nigerian Educational Research and Development 
   Council (NERDC) curriculum, which sets the standard for what all 
   Nigerian primary school students learn. This curriculum was carefully 
   designed to prepare Nigerian children for secondary school and for 
   active citizenship in Nigeria's future.

2. Nigeria, with over 200 million people and cities like {p1}, {p2} 
   and {p3}, is one of Africa's largest and most diverse nations. 
   Topics like {topic} in {subject} help Nigerian students understand 
   their country, their world, and their role in shaping Nigeria's future 
   for the better."""

    content = f"""{intro}

{explanation}

{examples}

{key_points}

{activities}

{fun_facts}"""

    summary = (
        f"This lesson covers {topic} for Primary {grade} students in "
        f"{subject}, following the Nigerian NERDC curriculum. Students "
        f"explore key concepts through Nigerian examples from cities like "
        f"{p1} and {p2}, and develop understanding through structured "
        f"activities appropriate for their grade level."
    )

    learning_objectives = [
        f"Understand the key concepts of {topic} at Primary {grade} level",
        f"Connect {topic} to real life examples in Nigeria",
        f"Apply knowledge of {topic} in {subject} activities and assessments",
        (
            f"Demonstrate grade-appropriate understanding of {topic} "
            f"through discussion and writing"
        ),
    ]

    nigerian_examples = [
        f"{n1} from {p1} learning about {topic} at {school}",
        f"{n2} connecting {topic} to real life in {p2}",
        (
            "Nigerian students across the country studying "
            f"{topic} as part of the NERDC curriculum"
        ),
    ]

    if grade <= 2:
        quiz_questions = [
            {
                "question_type": "multiple_choice",
                "question": "What are we learning about today?",
                "option_a": topic,
                "option_b": "Cooking food",
                "option_c": "Playing football",
                "option_d": "Sleeping",
                "correct_answer": "A",
                "explanation": (
                    f"Today we are learning about {topic} "
                    f"in our {subject} lesson!"
                ),
            },
            {
                "question_type": "multiple_choice",
                "question": f"Which subject is {topic} taught in?",
                "option_a": subject,
                "option_b": "Mathematics",
                "option_c": "English Studies",
                "option_d": "Drawing",
                "correct_answer": "A",
                "explanation": (
                    f"{topic} is taught in {subject} class "
                    f"for Primary {grade} students."
                ),
            },
            {
                "question_type": "multiple_choice",
                "question": f"Where do children learn about {topic}?",
                "option_a": "At the market",
                "option_b": "At school",
                "option_c": "At the farm",
                "option_d": "On the road",
                "correct_answer": "B",
                "explanation": (
                    f"Children learn about {topic} at school "
                    f"as part of their lessons."
                ),
            },
            {
                "question_type": "true_false",
                "question": f"{topic} is something we can learn about in school.",
                "option_a": "True",
                "option_b": "False",
                "option_c": None,
                "option_d": None,
                "correct_answer": "A",
                "explanation": (
                    f"True! We learn about {topic} at school. "
                    f"It is part of our {subject} lessons."
                ),
            },
            {
                "question_type": "true_false",
                "question": f"Only children outside Nigeria learn about {topic}.",
                "option_a": "True",
                "option_b": "False",
                "option_c": None,
                "option_d": None,
                "correct_answer": "B",
                "explanation": (
                    f"False! Nigerian children in Primary {grade} "
                    f"learn about {topic} too. You are learning it right now!"
                ),
            },
        ]
    elif grade <= 4:
        quiz_questions = [
            {
                "question_type": "multiple_choice",
                "question": (
                    f"What subject includes the topic of {topic} "
                    f"for Primary {grade}?"
                ),
                "option_a": subject,
                "option_b": (
                    "Mathematics" if subject != "Mathematics" else "English Studies"
                ),
                "option_c": "Physical Education",
                "option_d": "Fine Arts",
                "correct_answer": "A",
                "explanation": (
                    f"{topic} is studied as part of {subject} "
                    f"in Primary {grade} Nigerian schools."
                ),
            },
            {
                "question_type": "multiple_choice",
                "question": (
                    "Which council sets the curriculum for Nigerian primary schools?"
                ),
                "option_a": "WAEC",
                "option_b": "JAMB",
                "option_c": "NERDC",
                "option_d": "NUC",
                "correct_answer": "C",
                "explanation": (
                    "NERDC (Nigerian Educational Research and Development Council) "
                    "sets the national primary school curriculum."
                ),
            },
            {
                "question_type": "multiple_choice",
                "question": f"How can learning about {topic} help a Nigerian student?",
                "option_a": "It cannot help at all",
                "option_b": "It helps in exams and in understanding real life",
                "option_c": "It only helps students in Lagos",
                "option_d": "It only helps teachers",
                "correct_answer": "B",
                "explanation": (
                    f"Learning about {topic} helps students perform well in "
                    f"{subject} and understand their everyday life in Nigeria."
                ),
            },
            {
                "question_type": "true_false",
                "question": f"{topic} is part of the Nigerian primary school curriculum.",
                "option_a": "True",
                "option_b": "False",
                "option_c": None,
                "option_d": None,
                "correct_answer": "A",
                "explanation": (
                    f"True. {topic} is included in the NERDC curriculum "
                    f"for Primary {grade} {subject}."
                ),
            },
            {
                "question_type": "true_false",
                "question": f"Only students in Lagos study {topic} in Nigeria.",
                "option_a": "True",
                "option_b": "False",
                "option_c": None,
                "option_d": None,
                "correct_answer": "B",
                "explanation": (
                    "False. Students across all of Nigeria — in every state "
                    f"and city — study {topic} as part of the national curriculum."
                ),
            },
        ]
    else:
        quiz_questions = [
            {
                "question_type": "multiple_choice",
                "question": (
                    f"What is the primary curriculum body that includes "
                    f"{topic} in Nigerian schools?"
                ),
                "option_a": "WAEC",
                "option_b": "NERDC",
                "option_c": "JAMB",
                "option_d": "UNESCO",
                "correct_answer": "B",
                "explanation": (
                    "NERDC (Nigerian Educational Research and Development Council) "
                    f"designs the national curriculum including {topic} "
                    f"for primary schools."
                ),
            },
            {
                "question_type": "multiple_choice",
                "question": (
                    f"How does studying {topic} prepare Nigerian students "
                    f"for secondary school?"
                ),
                "option_a": "It does not help at all",
                "option_b": "It builds foundational knowledge and critical thinking",
                "option_c": "It only teaches memorisation",
                "option_d": "It replaces secondary school entirely",
                "correct_answer": "B",
                "explanation": (
                    f"Studying {topic} in Primary {grade} builds the foundational "
                    f"knowledge and thinking skills needed for secondary school success."
                ),
            },
            {
                "question_type": "multiple_choice",
                "question": (
                    f"Which best describes the real-world relevance of "
                    f"{topic} in Nigeria?"
                ),
                "option_a": "It has no real-world application",
                "option_b": "It only applies to students, not adults",
                "option_c": (
                    "It connects to community, policy and national development"
                ),
                "option_d": "It only applies in Lagos and Abuja",
                "correct_answer": "C",
                "explanation": (
                    f"{topic} connects to real life across Nigeria — influencing "
                    f"community decisions, government policies and personal choices."
                ),
            },
            {
                "question_type": "true_false",
                "question": (
                    f"Understanding {topic} is only important for passing exams, "
                    f"not for real life."
                ),
                "option_a": "True",
                "option_b": "False",
                "option_c": None,
                "option_d": None,
                "correct_answer": "B",
                "explanation": (
                    f"False. {topic} has important real-world applications in "
                    f"Nigerian communities and contributes to national development "
                    f"beyond just passing examinations."
                ),
            },
            {
                "question_type": "true_false",
                "question": (
                    f"Primary {grade} is an important time to build a strong "
                    f"foundation in {topic}."
                ),
                "option_a": "True",
                "option_b": "False",
                "option_c": None,
                "option_d": None,
                "correct_answer": "A",
                "explanation": (
                    f"True. Primary {grade} is a critical stage where students "
                    f"build the knowledge and skills in {topic} that will support "
                    f"their secondary school studies and future."
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


def upgrade_lesson(
    supabase,
    grade: int,
    subject: str,
    topic: str,
    lesson_data: dict,
    force: bool = False,
) -> str:
    """
    Upgrade a lesson in Supabase.
    Returns: 'upgraded', 'skip', 'not_found', or 'error'
    """
    try:
        result = (
            supabase.table("lessons")
            .select("id, content")
            .eq("grade", grade)
            .eq("subject", subject)
            .eq("topic", topic)
            .eq("language", "en")
            .execute()
        )

        if not result.data:
            print(f"⚠️  NOT FOUND: Grade {grade} | {subject} | {topic}")
            return "not_found"

        existing = result.data[0]
        existing_len = len(existing.get("content", ""))
        if not force and existing_len >= MIN_GOOD_CONTENT_CHARS:
            print(
                f"⏭️  SKIP (already good): Grade {grade} | {subject} | {topic}"
            )
            return "skip"

        lesson_id = existing["id"]

        supabase.table("lessons").update(
            {
                "content": lesson_data["content"],
                "summary": lesson_data["summary"],
                "learning_objectives": lesson_data["learning_objectives"],
                "nigerian_examples": lesson_data["nigerian_examples"],
            }
        ).eq("id", lesson_id).execute()

        supabase.table("quiz_questions").delete().eq("lesson_id", lesson_id).execute()

        for question in lesson_data["quiz_questions"]:
            supabase.table("quiz_questions").insert(
                {
                    "lesson_id": lesson_id,
                    "grade": grade,
                    "subject": subject,
                    "topic": topic,
                    "language": "en",
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

        return "upgraded"
    except Exception as exc:
        print(f"❌ ERROR: Grade {grade} | {subject} | {topic}: {exc}")
        return "error"


def fetch_weak_lessons(supabase, grade_filter: int | None = None) -> list[dict]:
    query = (
        supabase.table("lessons")
        .select("id, grade, subject, topic, content")
        .eq("language", "en")
    )
    if grade_filter is not None:
        query = query.eq("grade", grade_filter)

    result = query.execute()
    lessons = result.data or []
    return [
        lesson
        for lesson in lessons
        if len(lesson.get("content", "")) < MIN_GOOD_CONTENT_CHARS
    ]


def run_fix_bad(supabase) -> None:
    fixed_wiki = 0
    fixed_generated = 0
    not_found = 0
    errors = 0

    print(f"Fixing {len(BAD_MATCHES)} known bad Wikipedia match(es)...\n")

    for index, entry in enumerate(BAD_MATCHES, start=1):
        grade = entry["grade"]
        subject = entry["subject"]
        topic = entry["topic"]
        label = f"Grade {grade} | {subject} | {topic}"

        print(f"[{index}/{len(BAD_MATCHES)}] {label}")

        wiki_text, page_title = fetch_wikipedia_for_fix(topic, grade, subject)
        time.sleep(WIKIPEDIA_DELAY_SEC)

        source_label = "Wikipedia" if wiki_text else "generated"
        if wiki_text:
            print(f"  → Using Wikipedia: {page_title}")
        else:
            print("  → No relevant Wikipedia match; using generated content")

        lesson_data = build_lesson(wiki_text, topic, grade, subject)
        result = upgrade_lesson(
            supabase, grade, subject, topic, lesson_data, force=True
        )
        time.sleep(SUPABASE_DELAY_SEC)

        if result == "upgraded":
            if wiki_text:
                fixed_wiki += 1
            else:
                fixed_generated += 1
            print(f"🔧 FIXED ({source_label}): {label}")
        elif result == "not_found":
            not_found += 1
        elif result == "error":
            errors += 1

        print()

    print("─────────────────────────────────────────")
    print(f"Total bad matches targeted: {len(BAD_MATCHES)}")
    print(f"Fixed with Wikipedia content: {fixed_wiki}")
    print(f"Fixed with generated content: {fixed_generated}")
    print(f"Not found: {not_found}")
    print(f"Errors: {errors}")


def run_weak_upgrade(supabase, grade_filter: int | None = None) -> None:
    weak_lessons = fetch_weak_lessons(supabase, grade_filter)

    upgraded_wiki = 0
    upgraded_generated = 0
    skipped = 0
    not_found = 0
    errors = 0

    print(f"Found {len(weak_lessons)} weak lesson(s) (< {MIN_GOOD_CONTENT_CHARS} chars).\n")

    for index, lesson in enumerate(weak_lessons, start=1):
        grade = lesson["grade"]
        subject = lesson["subject"]
        topic = lesson["topic"]
        old_len = len(lesson.get("content", ""))
        label = f"Grade {grade} | {subject} | {topic}"

        print(f"[{index}/{len(weak_lessons)}] {label}")

        wiki_text, page_title = fetch_wikipedia(topic, grade, subject)
        time.sleep(WIKIPEDIA_DELAY_SEC)

        lesson_data = build_lesson(wiki_text, topic, grade, subject)
        new_len = len(lesson_data["content"])

        result = upgrade_lesson(supabase, grade, subject, topic, lesson_data)
        time.sleep(SUPABASE_DELAY_SEC)

        if result == "upgraded":
            if wiki_text:
                upgraded_wiki += 1
                print(
                    f"✅ UPGRADED (Wikipedia: {page_title}): "
                    f"{label} ({old_len} → {new_len} chars)"
                )
            else:
                upgraded_generated += 1
                print(
                    f"✅ UPGRADED (generated): "
                    f"{label} ({old_len} → {new_len} chars)"
                )
        elif result == "skip":
            skipped += 1
        elif result == "not_found":
            not_found += 1
        elif result == "error":
            errors += 1

        print()

    print("─────────────────────────────────────────")
    print(f"Total weak lessons found: {len(weak_lessons)}")
    print(f"Upgraded with Wikipedia content: {upgraded_wiki}")
    print(f"Upgraded with generated content: {upgraded_generated}")
    print(f"Already good (skipped): {skipped}")
    print(f"Not found: {not_found}")
    print(f"Errors: {errors}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Upgrade weak Supabase lessons using Wikipedia content."
    )
    parser.add_argument(
        "--grade",
        type=int,
        choices=range(1, 7),
        help="Process only this grade (1-6).",
    )
    parser.add_argument(
        "--fix-bad",
        action="store_true",
        help="Fix known bad Wikipedia matches from BAD_MATCHES list.",
    )
    args = parser.parse_args()

    supabase = load_supabase()

    if args.fix_bad:
        run_fix_bad(supabase)
    else:
        run_weak_upgrade(supabase, args.grade)


if __name__ == "__main__":
    main()
