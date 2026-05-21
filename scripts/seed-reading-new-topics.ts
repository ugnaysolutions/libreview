/**
 * Adds 4 new Reading Comprehension topics with 15 questions each (60 total):
 *   - Literary Analysis (display_order 4)
 *   - Context Clues (display_order 5)
 *   - Fact vs Opinion (display_order 6)
 *   - Reading Materials (display_order 7)
 *
 * Run: npx ts-node --project tsconfig.seed.json scripts/seed-reading-new-topics.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

type Q = {
  question_text: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct_choice: "a" | "b" | "c" | "d";
  explanation: string;
  difficulty: 1 | 2 | 3;
};

const NEW_TOPICS: {
  name: string;
  slug: string;
  description: string;
  display_order: number;
  questions: Q[];
}[] = [
  // ════════════════════════════════════════════════════════════════════════════
  // 1. Literary Analysis
  // ════════════════════════════════════════════════════════════════════════════
  {
    name: "Literary Analysis",
    slug: "literary-analysis",
    description: "Tone, mood, figures of speech, symbolism, and point of view in literary texts.",
    display_order: 4,
    questions: [
      // Tone
      {
        question_text:
          "Read the passage:\n\n\"Despite losing the championship, the team walked off the field with their heads held high. They had played with heart and refused to surrender, even in the final minutes.\"\n\nWhat is the TONE of this passage?",
        choice_a: "Bitter and resentful",
        choice_b: "Admiring and respectful",
        choice_c: "Sorrowful and hopeless",
        choice_d: "Neutral and detached",
        correct_choice: "b",
        explanation:
          "Tone reflects the author's attitude toward the subject. Phrases like \"heads held high,\" \"played with heart,\" and \"refused to surrender\" convey admiration for the team's dignity and courage in defeat.",
        difficulty: 1,
      },
      {
        question_text:
          "Read the passage:\n\n\"The city council's so-called 'plan' is nothing more than a recycled collection of failed ideas dressed up in new jargon. Anyone with half a brain can see it will never work.\"\n\nThe tone of this passage is best described as:",
        choice_a: "Optimistic and encouraging",
        choice_b: "Sarcastic and contemptuous",
        choice_c: "Formal and objective",
        choice_d: "Reflective and nostalgic",
        correct_choice: "b",
        explanation:
          "\"So-called,\" \"nothing more than,\" and \"anyone with half a brain\" are mocking, dismissive phrases. They reveal the author's scornful disregard for the plan, making the tone sarcastic and contemptuous.",
        difficulty: 2,
      },
      {
        question_text:
          "Read the passage:\n\n\"I remember the old mango tree in our backyard — how its branches seemed to reach out like welcoming arms every summer. Those afternoons feel so distant now.\"\n\nThe tone of this passage is:",
        choice_a: "Anxious and fearful",
        choice_b: "Angry and bitter",
        choice_c: "Nostalgic and wistful",
        choice_d: "Joyful and celebratory",
        correct_choice: "c",
        explanation:
          "The speaker recalls a warm memory but notes it \"feels so distant now.\" The combination of fondness for the past and awareness of its loss creates a nostalgic, wistful tone.",
        difficulty: 1,
      },
      // Mood
      {
        question_text:
          "Read the passage:\n\n\"The hallway was empty except for the flickering fluorescent light overhead. Every creak of the floor made her heart race. She was sure she had heard footsteps behind her.\"\n\nWhat mood does this passage create in the reader?",
        choice_a: "Peaceful and serene",
        choice_b: "Suspenseful and tense",
        choice_c: "Joyful and lighthearted",
        choice_d: "Melancholic and sad",
        correct_choice: "b",
        explanation:
          "The empty hallway, flickering light, creaking floors, and the character's racing heart are classic atmospheric cues that build suspense and create tension in the reader.",
        difficulty: 1,
      },
      {
        question_text:
          "Read the passage:\n\n\"The children laughed and chased each other through the sunlit park. The air smelled of fresh-cut grass, and the sound of an ice cream cart jingled in the distance.\"\n\nThe mood created by this passage is:",
        choice_a: "Gloomy and foreboding",
        choice_b: "Anxious and unsettled",
        choice_c: "Cheerful and carefree",
        choice_d: "Solemn and reverent",
        correct_choice: "c",
        explanation:
          "Laughter, sunlight, the smell of fresh grass, and the jingle of an ice cream cart are all images associated with innocent, carefree joy. Together they evoke a cheerful, lighthearted mood.",
        difficulty: 1,
      },
      // Figures of Speech
      {
        question_text:
          "\"The classroom was a zoo when the teacher stepped out.\"\n\nWhat figure of speech is used in this sentence?",
        choice_a: "Simile",
        choice_b: "Metaphor",
        choice_c: "Personification",
        choice_d: "Hyperbole",
        correct_choice: "b",
        explanation:
          "A metaphor directly equates two unlike things without using \"like\" or \"as.\" The classroom is directly called a \"zoo,\" implying chaotic, unruly behavior without a comparing word.",
        difficulty: 1,
      },
      {
        question_text:
          "\"The wind whispered secrets through the tall grass.\"\n\nThis sentence contains which figure of speech?",
        choice_a: "Simile",
        choice_b: "Alliteration",
        choice_c: "Personification",
        choice_d: "Irony",
        correct_choice: "c",
        explanation:
          "Personification assigns human qualities to non-human things. \"Whispered secrets\" is a human action given to the wind, bringing the natural element to life.",
        difficulty: 1,
      },
      {
        question_text:
          "\"She ran like the wind to finish the race.\"\n\nWhat figure of speech is used?",
        choice_a: "Metaphor",
        choice_b: "Simile",
        choice_c: "Hyperbole",
        choice_d: "Onomatopoeia",
        correct_choice: "b",
        explanation:
          "A simile compares two unlike things using \"like\" or \"as.\" Here, her speed is compared to \"the wind\" using the word \"like,\" making it a simile rather than a metaphor.",
        difficulty: 1,
      },
      // Symbolism
      {
        question_text:
          "In a short story, a character plants a seed at the beginning and tends to it carefully. By the end, a healthy tree stands in its place. What does the tree most likely symbolize?",
        choice_a: "The passage of time",
        choice_b: "The character's personal growth through sustained effort",
        choice_c: "The character's love for nature",
        choice_d: "Environmental conservation",
        correct_choice: "b",
        explanation:
          "In literature, objects tend to symbolize the abstract qualities of the characters who interact with them. A seed that grows into a strong tree through careful tending mirrors the character's own development and growth over the course of the story.",
        difficulty: 2,
      },
      {
        question_text:
          "A poem repeatedly describes a caged bird that longs to be free and sings of \"things unknown.\" What does the caged bird most likely symbolize?",
        choice_a: "Endangered wildlife",
        choice_b: "The beauty of music and song",
        choice_c: "Oppression and the longing for freedom",
        choice_d: "The changing of seasons",
        correct_choice: "c",
        explanation:
          "The caged bird is a classic literary symbol for oppression and restricted freedom. The bird's yearning to escape and its song of \"things unknown\" represent the desire for liberation from constraints.",
        difficulty: 2,
      },
      {
        question_text:
          "A story describes a character who collects broken clocks and refuses to have any working clocks in her home. What do the broken clocks most likely symbolize?",
        choice_a: "Her fondness for antiques",
        choice_b: "Her desire to stop or escape the passage of time",
        choice_c: "Her disorganized and messy nature",
        choice_d: "Her career as a clockmaker",
        correct_choice: "b",
        explanation:
          "Clocks are a conventional symbol for the passage of time. A character who surrounds herself only with broken, non-functioning clocks most likely represents a psychological desire to halt or escape time — perhaps linked to grief or an inability to move forward.",
        difficulty: 2,
      },
      // Point of View
      {
        question_text:
          "\"I had never expected to find the letter in my grandmother's attic. As I unfolded the yellowed paper, my hands trembled.\"\n\nWhat point of view is used?",
        choice_a: "Second person",
        choice_b: "Third-person limited",
        choice_c: "Third-person omniscient",
        choice_d: "First person",
        correct_choice: "d",
        explanation:
          "First-person point of view uses \"I,\" \"me,\" or \"my\" and places the narrator inside the story as a participant. The narrator here directly experiences and recounts the events.",
        difficulty: 1,
      },
      {
        question_text:
          "\"You wake up on a Monday morning and reach for your phone. You already know it's going to be a long week.\"\n\nWhat point of view is used?",
        choice_a: "First person",
        choice_b: "Second person",
        choice_c: "Third-person limited",
        choice_d: "Third-person omniscient",
        correct_choice: "b",
        explanation:
          "Second-person point of view directly addresses the reader using \"you\" and \"your,\" making the reader feel as though they are the subject of the narrative.",
        difficulty: 1,
      },
      {
        question_text:
          "\"Elena stared at the envelope, her heart pounding. She did not know what was inside, but she feared it was the news she had been dreading.\"\n\nWhat point of view is used, and what does it indicate?",
        choice_a: "Third-person omniscient — we know the thoughts of all characters.",
        choice_b: "Third-person limited — we access only Elena's thoughts and feelings.",
        choice_c: "First person — Elena is narrating her own story.",
        choice_d: "Second person — the reader is addressed directly.",
        correct_choice: "b",
        explanation:
          "Third-person limited narration uses \"she/he\" but stays inside one character's perspective. We access Elena's internal state but not those of anyone else — distinguishing it from omniscient narration, which enters all characters' minds.",
        difficulty: 2,
      },
      {
        question_text:
          "A story is told by a character who says: \"I never told anyone what I saw that night.\"\n\nWhich limitation does first-person narration introduce?",
        choice_a: "The narrator can describe the inner thoughts of all characters.",
        choice_b: "The narrative may be unreliable because it is filtered through one character's perspective.",
        choice_c: "The story loses emotional depth because the narrator is detached.",
        choice_d: "The reader cannot learn what ultimately happens to the narrator.",
        correct_choice: "b",
        explanation:
          "First-person narrators can only report what they directly experienced, observed, or interpreted — and their accounts may be biased, incomplete, or self-serving. This makes first-person narration inherently limited and potentially unreliable.",
        difficulty: 3,
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 2. Context Clues
  // ════════════════════════════════════════════════════════════════════════════
  {
    name: "Context Clues",
    slug: "context-clues",
    description: "Using vocabulary in context, definition clues, contrast clues, and meaning deduction to determine word meanings.",
    display_order: 5,
    questions: [
      // Vocabulary in Context
      {
        question_text:
          "\"The scientist's findings were so abstruse that even her colleagues struggled to understand them.\"\n\nBased on context, \"abstruse\" most likely means:",
        choice_a: "Well-known and widely accepted",
        choice_b: "Overly simple and obvious",
        choice_c: "Difficult to understand; obscure",
        choice_d: "Detailed and thoroughly researched",
        correct_choice: "c",
        explanation:
          "The clue is that even her colleagues — presumably experts in the same field — struggled to understand the findings. This implies they were extremely difficult to comprehend.",
        difficulty: 2,
      },
      {
        question_text:
          "\"Although Maria appeared composed during her presentation, her trembling hands betrayed her anxiety.\"\n\nIn this context, \"betrayed\" most likely means:",
        choice_a: "Deceived someone deliberately",
        choice_b: "Revealed something unintentionally",
        choice_c: "Carefully concealed",
        choice_d: "Supported or confirmed",
        correct_choice: "b",
        explanation:
          "Maria was trying to appear calm (\"composed\"), but her hands gave away her true feelings without her intending to. \"Betrayed\" here means to unintentionally reveal something that was being hidden.",
        difficulty: 2,
      },
      {
        question_text:
          "\"The exhausted runner was so enervated after the marathon that he could barely lift his arms.\"\n\n\"Enervated\" most likely means:",
        choice_a: "Energized and refreshed",
        choice_b: "Deeply focused and alert",
        choice_c: "Physically drained and weakened",
        choice_d: "Emotionally overwhelmed",
        correct_choice: "c",
        explanation:
          "The sentence provides two strong clues: \"exhausted\" at the start, and \"could barely lift his arms\" — both describe a state of physical depletion. \"Enervated\" means drained of energy and physically weakened.",
        difficulty: 2,
      },
      {
        question_text:
          "\"The politician's speech was full of rhetoric — impressive-sounding language designed more to persuade than to inform.\"\n\nBased on context, \"rhetoric\" most likely means:",
        choice_a: "Language that is scientifically accurate",
        choice_b: "Language crafted for emotional or persuasive effect rather than factual content",
        choice_c: "Simple and straightforward communication",
        choice_d: "Writing intended for a small academic audience",
        correct_choice: "b",
        explanation:
          "The dash introduces an appositive clue — a direct definition embedded in the sentence: \"impressive-sounding language designed more to persuade than to inform.\" This is what \"rhetoric\" means in this context.",
        difficulty: 1,
      },
      {
        question_text:
          "\"Unlike her gregarious sister who loved parties and always had a crowd around her, Lea was reserved and preferred quiet evenings at home.\"\n\n\"Gregarious\" most likely means:",
        choice_a: "Shy and introverted",
        choice_b: "Sociable and fond of company",
        choice_c: "Loud and aggressive",
        choice_d: "Kind and generous",
        correct_choice: "b",
        explanation:
          "The contrast clue \"unlike her gregarious sister…Lea was reserved\" tells us that \"gregarious\" is the opposite of \"reserved.\" Additional details — loving parties and always having a crowd — confirm that it means sociable and fond of company.",
        difficulty: 2,
      },
      {
        question_text:
          "\"The documentary was lauded by critics for its balanced coverage, receiving praise from across the political spectrum.\"\n\n\"Lauded\" most nearly means:",
        choice_a: "Criticized",
        choice_b: "Ignored",
        choice_c: "Praised",
        choice_d: "Revised",
        correct_choice: "c",
        explanation:
          "\"Receiving praise\" in the same sentence is a restatement clue that directly defines \"lauded.\" The word means to praise or commend highly.",
        difficulty: 1,
      },
      {
        question_text:
          "\"The chef's pièce de résistance — the dish he was most proud of — was a delicate soufflé that took six hours to prepare.\"\n\n\"Pièce de résistance\" most likely means:",
        choice_a: "The most technically difficult recipe",
        choice_b: "The traditional main course",
        choice_c: "The outstanding or crowning achievement",
        choice_d: "A classic French dessert",
        correct_choice: "c",
        explanation:
          "The dash introduces a definition: \"the dish he was most proud of.\" Combined with the detail that it required six hours and was clearly the chef's finest work, the phrase means the outstanding or crowning achievement.",
        difficulty: 2,
      },
      // Meaning Deduction
      {
        question_text:
          "\"The professor's lecture was so soporific that several students fell asleep within the first ten minutes.\"\n\n\"Soporific\" most nearly means:",
        choice_a: "Difficult and complex",
        choice_b: "Interesting and engaging",
        choice_c: "Sleep-inducing; extremely boring",
        choice_d: "Motivating and inspiring",
        correct_choice: "c",
        explanation:
          "The effect described — students falling asleep — is the deduction clue. A lecture that causes people to fall asleep must be sleep-inducing or boring. \"Soporific\" means tending to cause sleep.",
        difficulty: 2,
      },
      {
        question_text:
          "\"After the scandal, the company's once-pristine reputation was completely tarnished.\"\n\n\"Tarnished\" most nearly means:",
        choice_a: "Enhanced and strengthened",
        choice_b: "Damaged and diminished",
        choice_c: "Briefly interrupted",
        choice_d: "Publicly celebrated",
        correct_choice: "b",
        explanation:
          "The contrast between \"once-pristine\" (formerly perfect) and the change brought by a scandal tells us the reputation worsened significantly. \"Tarnished\" means damaged or diminished in value or quality.",
        difficulty: 1,
      },
      {
        question_text:
          "\"The journalist refused to divulge her sources, even under legal pressure.\"\n\n\"Divulge\" most nearly means:",
        choice_a: "Protect",
        choice_b: "Reveal or disclose",
        choice_c: "Investigate and verify",
        choice_d: "Remember",
        correct_choice: "b",
        explanation:
          "The journalist \"refused to divulge\" — meaning she would not give up or share the information despite pressure. \"Divulge\" means to reveal or disclose information, especially something private or sensitive.",
        difficulty: 1,
      },
      {
        question_text:
          "\"The child's ephemeral happiness lasted only until she discovered her toy was broken.\"\n\n\"Ephemeral\" most nearly means:",
        choice_a: "Intense and overwhelming",
        choice_b: "Short-lived; lasting only briefly",
        choice_c: "Genuine and heartfelt",
        choice_d: "Difficult to express",
        correct_choice: "b",
        explanation:
          "The happiness lasted \"only until\" a specific moment — implying it was very brief. \"Ephemeral\" describes something that exists or lasts for only a short time.",
        difficulty: 2,
      },
      {
        question_text:
          "\"Despite being a novice, she tackled the complex problem with the confidence of an expert.\"\n\n\"Novice\" most nearly means:",
        choice_a: "Expert and experienced professional",
        choice_b: "Beginner with little experience",
        choice_c: "Young and energetic person",
        choice_d: "Highly educated scholar",
        correct_choice: "b",
        explanation:
          "The word \"despite\" signals a contrast — she acted like an expert even though she was a novice. Since this is the opposite of being an expert, a novice must be a beginner with little or no experience.",
        difficulty: 1,
      },
      {
        question_text:
          "\"The proposal was met with unanimous approval — every board member voted in favor of it.\"\n\n\"Unanimous\" most nearly means:",
        choice_a: "Reluctant and hesitant",
        choice_b: "Partial and incomplete",
        choice_c: "In complete agreement; without any dissent",
        choice_d: "Enthusiastic and passionate",
        correct_choice: "c",
        explanation:
          "The clause after the dash (\"every board member voted in favor\") restates and defines \"unanimous.\" If every single member voted the same way, the decision was made in complete agreement, without any dissent.",
        difficulty: 1,
      },
      {
        question_text:
          "\"The committee finally reached a consensus after hours of debate, with all parties agreeing on the final plan.\"\n\n\"Consensus\" most nearly means:",
        choice_a: "A compromise in which no one is fully satisfied",
        choice_b: "A decision made by majority vote",
        choice_c: "General agreement among a group",
        choice_d: "A formal written agreement or document",
        correct_choice: "c",
        explanation:
          "The phrase \"all parties agreeing on the final plan\" is a restatement clue that defines \"consensus\" — a general agreement reached by a group, often after discussion or negotiation.",
        difficulty: 1,
      },
      {
        question_text:
          "\"Her tenacity was evident — she failed three times but kept trying until she finally succeeded.\"\n\n\"Tenacity\" most nearly means:",
        choice_a: "Intelligence and creative problem-solving",
        choice_b: "Physical strength and endurance",
        choice_c: "Stubborn resistance that causes conflict",
        choice_d: "Persistent determination despite setbacks",
        correct_choice: "d",
        explanation:
          "The example given — failing three times but continuing to try until succeeding — perfectly illustrates persistent determination in the face of failure. \"Tenacity\" means the quality of holding firm to a goal despite obstacles.",
        difficulty: 1,
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 3. Fact vs Opinion
  // ════════════════════════════════════════════════════════════════════════════
  {
    name: "Fact vs Opinion",
    slug: "fact-vs-opinion",
    description: "Distinguishing facts from opinions, identifying bias, and evaluating objective vs. subjective statements.",
    display_order: 6,
    questions: [
      {
        question_text:
          "Which of the following is a FACT?",
        choice_a: "The Great Wall of China is the most impressive structure ever built.",
        choice_b: "The Great Wall of China stretches over 13,000 miles and was constructed over several centuries.",
        choice_c: "Everyone should visit the Great Wall of China at least once in their lifetime.",
        choice_d: "The Great Wall of China is far more interesting than the Eiffel Tower.",
        correct_choice: "b",
        explanation:
          "A fact is a statement that can be objectively verified. Option B states specific, measurable information (length, construction period) that can be confirmed through historical and geographical records. The other options express personal judgments or recommendations.",
        difficulty: 1,
      },
      {
        question_text:
          "Which of the following is an OPINION?",
        choice_a: "Mount Everest is the tallest mountain on Earth, standing 8,849 meters above sea level.",
        choice_b: "Water freezes at 0°C at standard atmospheric pressure.",
        choice_c: "Climbing mountains is a worthwhile endeavor for anyone seeking personal growth.",
        choice_d: "The Philippines consists of more than 7,000 islands.",
        correct_choice: "c",
        explanation:
          "An opinion is a personal belief or judgment that cannot be objectively proven true or false. Option C uses \"worthwhile endeavor\" — a value judgment that varies from person to person. All other options are verifiable scientific or geographical facts.",
        difficulty: 1,
      },
      {
        question_text:
          "Read the sentence: \"The government's new health policy, which unfairly targets the poor, will destroy the public health system.\"\n\nHow should this sentence be classified?",
        choice_a: "Only facts — it describes a government policy.",
        choice_b: "Only opinions — nothing in it can be verified.",
        choice_c: "Both fact and opinion — the policy exists (fact), but \"unfairly\" and \"will destroy\" are judgments (opinions).",
        choice_d: "Neither — it is a prediction, not a statement.",
        correct_choice: "c",
        explanation:
          "The existence of a government health policy is factual. However, \"unfairly targets the poor\" is a value judgment, and \"will destroy the public health system\" is a prediction — both are opinions. The sentence blends a factual claim with strongly opinionated characterizations.",
        difficulty: 2,
      },
      {
        question_text:
          "Which sentence is OBJECTIVE (free from personal bias)?",
        choice_a: "The new bus system is a disastrous failure that wastes taxpayers' money.",
        choice_b: "The new bus system has reduced average commute times by 15%, according to city transportation data.",
        choice_c: "Most people would agree that the new bus system is an improvement.",
        choice_d: "The new bus system is the best thing that has happened to this city in decades.",
        correct_choice: "b",
        explanation:
          "An objective statement reports verifiable information without expressing personal judgment. Option B cites a specific, measurable outcome (15%) attributed to a named source, making it objective. The other options contain evaluative language (\"disastrous,\" \"most people would agree,\" \"best thing\").",
        difficulty: 2,
      },
      {
        question_text:
          "Which word in the sentence reveals that it is BIASED?\n\n\"The reckless senator once again voted against the budget proposal.\"",
        choice_a: "senator",
        choice_b: "voted",
        choice_c: "reckless",
        choice_d: "budget proposal",
        correct_choice: "c",
        explanation:
          "\"Reckless\" is a loaded or biased word — it carries a negative judgment about the senator's character without providing evidence. Bias is often revealed through emotionally charged language that assumes something about a person or event without proof.",
        difficulty: 1,
      },
      {
        question_text:
          "A headline reads: \"Government Wastes Millions on Useless Infrastructure Project.\"\n\nWhich words make this headline biased rather than objective?",
        choice_a: "Government",
        choice_b: "Millions",
        choice_c: "Wastes and Useless",
        choice_d: "Infrastructure Project",
        correct_choice: "c",
        explanation:
          "\"Wastes\" and \"Useless\" are emotionally charged, evaluative terms that reflect the writer's judgment rather than neutral reporting. An objective headline would report the facts without such loaded language.",
        difficulty: 1,
      },
      {
        question_text:
          "Which pairing correctly identifies one FACT and one OPINION about the same topic?",
        choice_a: "Fact: \"The sun rises in the east.\" / Opinion: \"The sun sets in the west.\"",
        choice_b: "Fact: \"Shakespeare wrote 37 plays.\" / Opinion: \"Shakespeare is the greatest writer who ever lived.\"",
        choice_c: "Fact: \"Exercise is good for you.\" / Opinion: \"Running is the best form of exercise.\"",
        choice_d: "Fact: \"The test was difficult.\" / Opinion: \"The test had 50 questions.\"",
        correct_choice: "b",
        explanation:
          "\"Shakespeare wrote 37 plays\" can be historically verified — it is a fact. \"Shakespeare is the greatest writer who ever lived\" is a value judgment that varies from person to person — it is an opinion. In A, both are verifiable facts; in C, \"good for you\" is itself an opinion; in D, the labels are reversed.",
        difficulty: 2,
      },
      {
        question_text:
          "A film reviewer writes: \"This film, while technically well-made, fails to connect emotionally with audiences and delivers a forgettable story.\"\n\nWhich part of this review is FACTUAL?",
        choice_a: "\"fails to connect emotionally with audiences\"",
        choice_b: "\"technically well-made\"",
        choice_c: "\"delivers a forgettable story\"",
        choice_d: "None — the entire review expresses personal opinions.",
        correct_choice: "d",
        explanation:
          "All parts of the review represent the critic's personal judgments and interpretations. Even \"technically well-made\" is an evaluative assessment. There is no verifiable, objective fact presented — the entire excerpt is opinion.",
        difficulty: 2,
      },
      {
        question_text:
          "Which strategy is MOST useful for detecting bias in a written text?",
        choice_a: "Count the number of sentences in the text.",
        choice_b: "Look for loaded language, one-sided arguments, and unsupported generalizations.",
        choice_c: "Check whether the author uses formal vocabulary.",
        choice_d: "Determine whether the text is long or short.",
        correct_choice: "b",
        explanation:
          "Bias is typically revealed through loaded or emotionally charged language, presenting only one side of an argument, making broad generalizations without evidence, or omitting counterarguments. These are the primary textual markers of biased writing.",
        difficulty: 2,
      },
      {
        question_text:
          "\"All teenagers are irresponsible and addicted to their phones.\"\n\nThis statement is an example of:",
        choice_a: "A well-supported fact",
        choice_b: "An objective observation",
        choice_c: "A hasty generalization — a form of bias",
        choice_d: "A valid inference based on data",
        correct_choice: "c",
        explanation:
          "A hasty generalization applies a characteristic of some members of a group to ALL members without sufficient evidence. \"All teenagers\" is an absolute claim with no data to support it. Sweeping, unsupported generalizations about groups are a common form of bias.",
        difficulty: 2,
      },
      {
        question_text:
          "Statement 1: \"The average global temperature has increased by approximately 1.1°C since the pre-industrial era.\"\nStatement 2: \"Climate change is the most urgent problem facing humanity today.\"\n\nHow should these statements be classified?",
        choice_a: "Both are facts.",
        choice_b: "Statement 1 is a fact; Statement 2 is an opinion.",
        choice_c: "Statement 1 is an opinion; Statement 2 is a fact.",
        choice_d: "Both are opinions.",
        correct_choice: "b",
        explanation:
          "Statement 1 contains a specific, measurable claim (1.1°C) verifiable through scientific records — it is a fact. Statement 2 uses \"most urgent\" to rank climate change against all other global problems, which is a judgment that reasonable people may disagree on — it is an opinion.",
        difficulty: 2,
      },
      {
        question_text:
          "Which sentence uses SUBJECTIVE language?",
        choice_a: "The committee meeting lasted three hours.",
        choice_b: "The Philippines has 81 provinces.",
        choice_c: "The concert was an unforgettable experience that moved everyone to tears.",
        choice_d: "The clinical study involved 500 participants over two years.",
        correct_choice: "c",
        explanation:
          "Subjective language reflects personal feelings or interpretations. \"Unforgettable experience\" and \"moved everyone to tears\" are based on personal emotional response and cannot be objectively verified. The other sentences report measurable, verifiable facts.",
        difficulty: 1,
      },
      {
        question_text:
          "A student writes: \"In my opinion, the novel's ending is too abrupt and leaves many questions unanswered.\"\n\nIs this statement a fact, an opinion, or both?",
        choice_a: "It is a fact because novels can be analyzed objectively.",
        choice_b: "It is entirely an opinion — it represents the student's personal interpretation.",
        choice_c: "It is both — the novel exists (fact) but the judgment of its ending is opinion.",
        choice_d: "It cannot be classified because it is about literature.",
        correct_choice: "b",
        explanation:
          "The phrase \"in my opinion\" explicitly frames the entire statement as a personal judgment. The assessment that the ending is \"too abrupt\" is the student's interpretation, not a verifiable fact.",
        difficulty: 1,
      },
      {
        question_text:
          "An advertisement states: \"9 out of 10 dentists recommend BrightSmile toothpaste. Isn't it time you made the smart choice?\"\n\nThe second sentence is an example of:",
        choice_a: "An objective, factual claim",
        choice_b: "A rhetorical question designed to manipulate the reader's opinion",
        choice_c: "A neutral call to action",
        choice_d: "A scientific recommendation",
        correct_choice: "b",
        explanation:
          "A rhetorical question does not expect a direct answer — it is designed to imply a conclusion. \"Isn't it time you made the smart choice?\" subtly labels BrightSmile as \"the smart choice,\" using emotional pressure and loaded language to persuade rather than inform.",
        difficulty: 2,
      },
      {
        question_text:
          "Which of the following sentences is COMPLETELY objective?",
        choice_a: "The typhoon, which devastated coastal communities, was the worst disaster in recent memory.",
        choice_b: "Scientists should do more to communicate their research to the public.",
        choice_c: "The typhoon made landfall on November 3 with sustained winds of 195 km/h.",
        choice_d: "Many believe the government's response to the typhoon was inadequate.",
        correct_choice: "c",
        explanation:
          "Option C reports only verifiable, specific facts: a date and a measurable wind speed. Option A contains \"worst disaster in recent memory\" (subjective); B contains \"should\" (a recommendation/opinion); D contains \"many believe\" and \"inadequate\" (both subjective qualifiers).",
        difficulty: 2,
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 4. Reading Materials
  // ════════════════════════════════════════════════════════════════════════════
  {
    name: "Reading Materials",
    slug: "reading-materials",
    description: "Comprehension questions based on diverse passage types: essays, poetry, news articles, speeches, short stories, comic strips, and graphs/charts.",
    display_order: 7,
    questions: [
      // Essay (Q1–Q2)
      {
        question_text:
          "[ESSAY PASSAGE]\n\"Social media has fundamentally altered the way we form and maintain relationships. While it allows us to stay connected across vast distances, it simultaneously creates a paradox: we can have hundreds of 'friends' online yet feel profoundly alone. The convenience of digital connection may be eroding our capacity for deeper, more meaningful human bonds.\"\n\nWhat is the author's main argument?",
        choice_a: "Social media is entirely harmful and should be banned.",
        choice_b: "Social media is useful primarily for maintaining long-distance relationships.",
        choice_c: "While social media enables superficial connection, it may undermine genuine human bonds.",
        choice_d: "People should limit their social media use to one hour per day.",
        correct_choice: "c",
        explanation:
          "The essay presents a nuanced argument through the word \"paradox\" — social media connects us digitally (benefit) but may replace deeper relationships with superficial ones (drawback). The author argues both sides exist simultaneously.",
        difficulty: 2,
      },
      {
        question_text:
          "[ESSAY PASSAGE — same passage above]\nThe phrase \"profoundly alone\" is used by the author to:",
        choice_a: "Describe the experience of people who do not use social media.",
        choice_b: "Emphasize the emotional emptiness that can accompany excessive digital connection.",
        choice_c: "Argue that loneliness is caused solely by technology.",
        choice_d: "Suggest that all social media friendships are fake.",
        correct_choice: "b",
        explanation:
          "The phrase appears in the context of having hundreds of online \"friends\" — highlighting the irony that digital connection can coexist with deep emotional loneliness. It underscores the author's central concern: that digital connection may substitute for, rather than supplement, real bonds.",
        difficulty: 2,
      },
      // Poetry (Q3–Q4)
      {
        question_text:
          "[POETRY PASSAGE]\n\"I wandered lonely as a cloud\nThat floats on high o'er vales and hills,\nWhen all at once I saw a crowd,\nA host of golden daffodils\"\n— William Wordsworth\n\nThe speaker compares himself to a cloud primarily to suggest that he was:",
        choice_a: "Light and carefree",
        choice_b: "Aimlessly drifting and solitary",
        choice_c: "High above the troubles of ordinary life",
        choice_d: "Moving quickly through the countryside",
        correct_choice: "b",
        explanation:
          "The simile \"lonely as a cloud\" emphasizes solitude and aimlessness — clouds drift without direction or company. The word \"lonely\" confirms that isolation and purposeless wandering, not lightness or speed, are the qualities being compared.",
        difficulty: 2,
      },
      {
        question_text:
          "[POETRY PASSAGE — same poem]\nThe words \"crowd\" and \"host\" are used to describe the daffodils. What effect does this word choice create?",
        choice_a: "It suggests the poet feels threatened by the unexpected sight.",
        choice_b: "It portrays the flowers as a joyful, abundant, and lively gathering.",
        choice_c: "It compares the flowers directly to specific people the poet knows.",
        choice_d: "It emphasizes how far the flowers were from the path.",
        correct_choice: "b",
        explanation:
          "\"Crowd\" and \"host\" are words typically used for large, lively groups of people. Applied to daffodils, they give the flowers a vivid, celebratory energy — conveying an unexpectedly joyful and abundant sight that breaks the speaker's loneliness.",
        difficulty: 2,
      },
      // News Article (Q5–Q6)
      {
        question_text:
          "[NEWS ARTICLE PASSAGE]\n\"Pasay City, June 15 — Health authorities confirmed that 45 new dengue cases were reported in the city over the past week, bringing the year's total to 312. Officials urged residents to eliminate standing water in and around their homes, which serves as a breeding ground for mosquitoes.\"\n\nAccording to the report, what is the primary recommendation for residents?",
        choice_a: "Consult a doctor immediately if experiencing fever.",
        choice_b: "Report suspected dengue cases to health authorities.",
        choice_c: "Eliminate standing water near their homes to remove mosquito breeding sites.",
        choice_d: "Avoid outdoor activities during peak mosquito hours.",
        correct_choice: "c",
        explanation:
          "The article directly states that officials \"urged residents to eliminate standing water in and around their homes, which serves as a breeding ground for mosquitoes.\" This is the explicit recommendation in the report.",
        difficulty: 1,
      },
      {
        question_text:
          "[NEWS ARTICLE PASSAGE — same passage]\nWhich statement is DIRECTLY SUPPORTED by the article?",
        choice_a: "Dengue has already caused several deaths in Pasay City this year.",
        choice_b: "This year's dengue cases exceed those of the previous year.",
        choice_c: "A total of 312 dengue cases have been recorded in Pasay City so far this year.",
        choice_d: "The outbreak is being caused by contaminated water sources.",
        correct_choice: "c",
        explanation:
          "Option C directly restates the factual claim in the article: \"bringing the year's total to 312.\" Options A, B, and D involve information not mentioned in the passage — they cannot be concluded from the text given.",
        difficulty: 1,
      },
      // Speech (Q7–Q8)
      {
        question_text:
          "[SPEECH PASSAGE]\n\"We are not here to be comfortable. We are here to be courageous. Every generation faces its defining challenge — and ours is climate change. We can choose to look away, to delay, to make excuses. Or we can choose to act. I believe we will choose action.\"\n\nWhat is the PRIMARY purpose of this speech?",
        choice_a: "To inform the audience about the scientific facts of climate change",
        choice_b: "To persuade the audience to take action on climate change",
        choice_c: "To entertain the audience with personal stories about the environment",
        choice_d: "To describe the history of international climate change policies",
        correct_choice: "b",
        explanation:
          "The speech uses motivating language (\"courageous\"), presents a stark choice (\"look away\" vs. \"act\"), and closes with an expression of belief in collective action. These are persuasive techniques designed to move the audience to act — not primarily to inform or entertain.",
        difficulty: 1,
      },
      {
        question_text:
          "[SPEECH PASSAGE — same passage]\nThe speaker's listing of \"we can choose to look away, to delay, to make excuses\" is a rhetorical technique used to:",
        choice_a: "Make a hasty generalization about the audience",
        choice_b: "Acknowledge counter-arguments before rejecting them in favor of action",
        choice_c: "Directly issue a call to action",
        choice_d: "Appeal to a recognized authority on climate change",
        correct_choice: "b",
        explanation:
          "By naming the alternatives (inaction, delay, excuses), the speaker implicitly sets them up to be rejected. This technique — acknowledging what people might do before dismissing those choices — strengthens the call to action that follows.",
        difficulty: 3,
      },
      // Short Story (Q9–Q10)
      {
        question_text:
          "[SHORT STORY PASSAGE]\n\"Mang Jose had fished the same stretch of river for forty years. But today, he watched the gray, oily water and knew something had changed. The fish were gone. The plastic bottles caught on the reeds seemed to mock him. Silently, he folded his net and walked home — leaving behind not just the river, but a lifetime of mornings.\"\n\nWhat is the overall MOOD of this passage?",
        choice_a: "Hopeful and optimistic",
        choice_b: "Celebratory and joyful",
        choice_c: "Somber and melancholic",
        choice_d: "Angry and defiant",
        correct_choice: "c",
        explanation:
          "The gray, oily water, the absence of fish, the plastic waste, and the final image of leaving behind \"a lifetime of mornings\" all create a mood of quiet grief and loss — deeply melancholic without being outwardly angry.",
        difficulty: 1,
      },
      {
        question_text:
          "[SHORT STORY PASSAGE — same passage]\nWhat does \"a lifetime of mornings\" most likely symbolize?",
        choice_a: "The early hours Mang Jose spent traveling to the river",
        choice_b: "The many years of tradition, livelihood, and identity tied to his life as a fisherman",
        choice_c: "The daily pollution that accumulated in the river over time",
        choice_d: "The long journey home Mang Jose takes each day",
        correct_choice: "b",
        explanation:
          "\"A lifetime of mornings\" is a figurative phrase — it represents far more than literal mornings. It symbolizes Mang Jose's entire identity, livelihood, and relationship with the river built over forty years. Leaving it behind signals a profound, irreversible loss of who he was.",
        difficulty: 2,
      },
      // Comic Strip (Q11–Q12)
      {
        question_text:
          "[COMIC STRIP DESCRIPTION]\nA four-panel comic strip shows: (1) A student sitting at a desk surrounded by books, holding her head in stress. (2) She goes for a walk outside and sees trees and birds. (3) She returns to her desk looking calm and focused. (4) She completes her assignment and smiles.\n\nWhat message does the comic strip most likely convey?",
        choice_a: "Students should study outdoors to perform better academically.",
        choice_b: "Taking a short break, especially in nature, can help restore focus and reduce stress.",
        choice_c: "It is impossible to complete assignments when feeling stressed.",
        choice_d: "Walking is the most effective way to finish homework.",
        correct_choice: "b",
        explanation:
          "The sequence shows: stress → nature break → calm → success. The causal chain suggests that the break in nature restored her ability to focus, conveying that stepping away from stress can be restorative — not that studying outdoors or walking is always the solution.",
        difficulty: 1,
      },
      {
        question_text:
          "[COMIC STRIP DESCRIPTION — same strip]\nIn the four-panel comic, what narrative function does Panel 2 (the outdoor walk) serve?",
        choice_a: "It introduces the main conflict of the story.",
        choice_b: "It shows the consequence of studying too hard.",
        choice_c: "It is the turning point — the action that causes the resolution in Panels 3 and 4.",
        choice_d: "It provides background information about the student's daily routine.",
        correct_choice: "c",
        explanation:
          "Before Panel 2, the student is stressed and unproductive; after it, she is calm and successful. Panel 2 is the pivot — the event that directly causes the change from problem (stress) to resolution (success), making it the turning point of the visual narrative.",
        difficulty: 2,
      },
      // Graph/Chart (Q13–Q15)
      {
        question_text:
          "[BAR CHART DESCRIPTION]\nA bar chart shows the average Science test scores for four student groups: Group A = 82%, Group B = 74%, Group C = 91%, Group D = 68%.\n\nWhich statement is DIRECTLY SUPPORTED by the chart?",
        choice_a: "Group C studied more than the other groups.",
        choice_b: "Group D's teacher is less effective than the others.",
        choice_c: "Group C had the highest average score at 91%.",
        choice_d: "Most students scored above 80% on the test.",
        correct_choice: "c",
        explanation:
          "Option C directly reports a data point visible in the chart — Group C's average of 91% is the highest. Options A and B involve interpretations or causes not shown in the data. Option D cannot be confirmed since we have only group averages, not individual scores.",
        difficulty: 1,
      },
      {
        question_text:
          "[LINE GRAPH DESCRIPTION]\nA line graph shows a country's annual rice production (in million metric tons) from 2018–2023: 2018=19, 2019=20, 2020=18, 2021=22, 2022=21, 2023=24.\n\nWhat overall trend does the data show?",
        choice_a: "Rice production has declined steadily every year.",
        choice_b: "Rice production has remained constant throughout the period.",
        choice_c: "Rice production has increased overall, despite some year-to-year fluctuations.",
        choice_d: "Rice production peaked in 2021 and has been declining since.",
        correct_choice: "c",
        explanation:
          "While production dipped in 2020 (18) and 2022 (21), the overall trajectory from 19 in 2018 to 24 in 2023 shows an upward trend. Option D is incorrect — production rose from 22 to 24 between 2021 and 2023.",
        difficulty: 2,
      },
      {
        question_text:
          "[PIE CHART DESCRIPTION]\nA pie chart shows how a student allocates her 24-hour day: Sleep 33%, School 29%, Homework 13%, Recreation 12%, Meals 8%, Other 5%.\n\nWhich conclusion is DIRECTLY SUPPORTED by the chart?",
        choice_a: "The student should spend more time sleeping.",
        choice_b: "Sleep takes up the largest single portion of the student's day.",
        choice_c: "The student spends more time on recreation than on homework.",
        choice_d: "The student does not have enough time for rest.",
        correct_choice: "b",
        explanation:
          "At 33%, Sleep is the largest single category — this is a direct, objective observation from the data. Option C is incorrect (Recreation 12% < Homework 13%). Options A and D involve subjective judgments about what is \"enough\" or what the student \"should\" do, which go beyond what the chart shows.",
        difficulty: 1,
      },
    ],
  },
];

async function main() {
  console.log("Seeding new Reading Comprehension topics...\n");

  const { data: subtest, error: subtestErr } = await supabase
    .from("subtests")
    .select("id")
    .eq("slug", "reading-comprehension")
    .single();

  if (subtestErr || !subtest) {
    console.error("Could not find reading-comprehension subtest:", subtestErr?.message);
    process.exit(1);
  }

  for (const topic of NEW_TOPICS) {
    process.stdout.write(`Seeding topic: ${topic.name}...`);

    const { data: topicRow, error: topicErr } = await supabase
      .from("topics")
      .upsert(
        {
          subtest_id: subtest.id,
          name: topic.name,
          slug: topic.slug,
          description: topic.description,
          display_order: topic.display_order,
        },
        { onConflict: "subtest_id,slug" }
      )
      .select("id")
      .single();

    if (topicErr || !topicRow) {
      console.error(`\nCould not upsert topic "${topic.name}":`, topicErr?.message);
      process.exit(1);
    }

    const rows = topic.questions.map((q) => ({
      topic_id: topicRow.id,
      ...q,
      status: "approved",
      image_url: null,
    }));

    const { error: qErr } = await supabase.from("questions").insert(rows);

    if (qErr) {
      console.error(`\nCould not insert questions for "${topic.name}":`, qErr.message);
      process.exit(1);
    }

    console.log(`  ✓ ${topic.questions.length} questions`);
  }

  console.log("\n✅  Done! Added 4 topics and 60 questions.");
}

main();
