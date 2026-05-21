/**
 * Adds 3 new Language Proficiency topics with 15 questions each:
 *   - Sentence Correction (display_order 4)
 *   - Paragraph Organization (display_order 5)
 *   - Filipino Grammar and Language (display_order 6)
 *
 * Run: npx ts-node --project tsconfig.seed.json scripts/seed-language-new-topics.ts
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

const NEW_TOPICS: { name: string; slug: string; description: string; display_order: number; questions: Q[] }[] = [
  {
    name: "Sentence Correction",
    slug: "sentence-correction",
    description: "Error identification, sentence improvement, parallelism, and conciseness.",
    display_order: 4,
    questions: [
      // ── Error Identification ──────────────────────────────────────────
      {
        question_text:
          "Identify the error in the following sentence: \"Each of the students are required to submit a final report.\"",
        choice_a: "No error; the sentence is correct.",
        choice_b: "\"Each\" should be replaced with \"All\".",
        choice_c: "\"are\" should be \"is\" — \"each\" takes a singular verb.",
        choice_d: "\"submit\" should be \"submits\".",
        correct_choice: "c",
        explanation:
          "\"Each\" is an indefinite pronoun that always takes a singular verb regardless of the noun in the prepositional phrase that follows. The correct form is \"Each of the students is required to submit a final report.\"",
        difficulty: 2,
      },
      {
        question_text:
          "Which word is used incorrectly in the sentence: \"Neither the manager nor the employees was informed of the change\"?",
        choice_a: "Neither",
        choice_b: "was",
        choice_c: "informed",
        choice_d: "change",
        correct_choice: "b",
        explanation:
          "With \"neither…nor,\" the verb agrees with the subject closest to it. Since \"employees\" (plural) is the nearer subject, the verb must be plural: \"were informed.\"",
        difficulty: 2,
      },
      {
        question_text:
          "Find the grammatical error: \"Between you and I, the project was poorly managed.\"",
        choice_a: "\"Between\" should be \"Among\".",
        choice_b: "\"I\" should be \"me\".",
        choice_c: "\"was\" should be \"were\".",
        choice_d: "There is no error.",
        correct_choice: "b",
        explanation:
          "Prepositions require object pronouns. \"Between\" is a preposition, so it must be followed by \"me,\" not \"I.\" The correct phrase is \"Between you and me.\"",
        difficulty: 2,
      },
      {
        question_text:
          "Identify ALL errors in the sentence: \"The committee have reached their decision unanimously.\"",
        choice_a: "\"committee\" should be plural.",
        choice_b: "\"have\" should be \"has\".",
        choice_c: "\"their\" should be \"its\".",
        choice_d: "Both B and C — collective nouns take a singular verb and singular pronoun in American English.",
        correct_choice: "d",
        explanation:
          "In Philippine English (which follows American conventions), collective nouns like \"committee\" take singular verbs and pronouns. The correct sentence is \"The committee has reached its decision unanimously.\"",
        difficulty: 3,
      },
      // ── Sentence Improvement ──────────────────────────────────────────
      {
        question_text:
          "Choose the BEST revision of: \"Due to the fact that she was late, she missed the announcement.\"",
        choice_a: "Due to the fact that she was late, she missed the announcement. (no change)",
        choice_b: "Because she was late, she missed the announcement.",
        choice_c: "Being late, the announcement was missed by her.",
        choice_d: "She was late, so therefore she missed the announcement.",
        correct_choice: "b",
        explanation:
          "\"Due to the fact that\" is a wordy phrase that can almost always be replaced by the single word \"because.\" Option C creates a dangling modifier; Option D is redundant (\"so\" and \"therefore\" mean the same thing).",
        difficulty: 1,
      },
      {
        question_text:
          "Which is the most improved version of: \"The reason why the project failed is because the team did not communicate\"?",
        choice_a: "The reason why the project failed was due to lack of team communication.",
        choice_b: "The project failed because the team did not communicate.",
        choice_c: "The project's failure is owing to the fact that communication was absent.",
        choice_d: "No revision needed.",
        correct_choice: "b",
        explanation:
            "\"The reason why…is because\" is a redundant construction. Stating the cause directly with \"because\" is cleaner and grammatically correct.",
        difficulty: 2,
      },
      {
        question_text:
          "Which revision of \"In spite of the fact that he studied hard, he failed the exam\" is most concise and correct?",
        choice_a: "In spite of the fact that he studied hard, he failed the exam. (no change)",
        choice_b: "Despite studying hard, he failed the exam.",
        choice_c: "He studied hard, but however, he failed the exam.",
        choice_d: "Regardless, he studied hard but failed.",
        correct_choice: "b",
        explanation:
          "\"In spite of the fact that\" can be condensed to the single preposition \"despite\" followed by a gerund phrase. Option C is redundant (\"but\" and \"however\" serve the same contrasting function).",
        difficulty: 2,
      },
      {
        question_text:
          "Choose the most improved version of: \"She is a person who is always willing to help others.\"",
        choice_a: "She is a person who always helps others.",
        choice_b: "Being a person, she is always willing to help others.",
        choice_c: "She is always willing to help others.",
        choice_d: "No revision needed.",
        correct_choice: "c",
        explanation:
          "\"She is a person who is always…\" contains an unnecessary relative clause. Removing \"a person who is\" makes the sentence more direct without losing any meaning.",
        difficulty: 1,
      },
      // ── Parallelism ───────────────────────────────────────────────────
      {
        question_text:
          "Identify the error in parallel structure: \"The teacher told students to read the chapter, to answer the questions, and reviewing their notes.\"",
        choice_a: "\"to read\" should be \"reading\".",
        choice_b: "\"to answer\" should be \"answering\".",
        choice_c: "\"reviewing\" should be \"to review\".",
        choice_d: "There is no error.",
        correct_choice: "c",
        explanation:
          "All items in a list must share the same grammatical form. Since the first two items use infinitives (\"to read,\" \"to answer\"), the third must also be an infinitive: \"to review.\"",
        difficulty: 2,
      },
      {
        question_text:
          "Which sentence demonstrates CORRECT parallel structure?",
        choice_a: "She enjoys reading, to write, and painting.",
        choice_b: "He is smart, hardworking, and has talent.",
        choice_c: "They planned to study, to practice, and to review.",
        choice_d: "The report was clear, well-organized, and it presented good data.",
        correct_choice: "c",
        explanation:
          "Option C uses three parallel infinitives (\"to study, to practice, to review\"). A mixes a gerund and an infinitive; B mixes adjectives with a verb phrase; D shifts from adjectives to an independent clause.",
        difficulty: 2,
      },
      {
        question_text:
          "Which corrected version of \"Maria loves hiking, swimming, and to play volleyball\" maintains parallel structure?",
        choice_a: "Maria loves hiking, to swim, and playing volleyball.",
        choice_b: "Maria loves to hike, swimming, and to play volleyball.",
        choice_c: "Maria loves hiking, swimming, and playing volleyball.",
        choice_d: "Maria loves to hike, to swim, and playing volleyball.",
        correct_choice: "c",
        explanation:
          "All three activities should use the same form. Option C consistently uses gerunds (-ing forms): \"hiking, swimming, and playing volleyball.\"",
        difficulty: 1,
      },
      {
        question_text:
          "The CEO asked that the report be submitted promptly, that all data be verified, and for the presentation to be ready by Monday.\n\nWhich revision makes this sentence parallel?",
        choice_a: "The CEO asked that the report be submitted promptly, that all data be verified, and that the presentation be ready by Monday.",
        choice_b: "The CEO asked for prompt report submission, data verification, and for the presentation to be ready.",
        choice_c: "The CEO asked that the report be submitted, the data verified, and the presentation be ready by Monday.",
        choice_d: "No revision is needed.",
        correct_choice: "a",
        explanation:
          "The first two items use \"that + subject + verb.\" The third should match: \"that the presentation be ready by Monday.\" This creates a consistent parallel structure across all three clauses.",
        difficulty: 3,
      },
      // ── Conciseness ───────────────────────────────────────────────────
      {
        question_text:
          "Which sentence is MOST concise without changing the meaning?",
        choice_a: "In my personal opinion, I think that the new policy is unfair.",
        choice_b: "I personally think that the new policy is, in my opinion, unfair.",
        choice_c: "I think the new policy is unfair.",
        choice_d: "From my own personal perspective, the new policy seems unfair to me.",
        correct_choice: "c",
        explanation:
          "\"In my personal opinion\" and \"I think\" both signal the speaker's view — using both is redundant. Option C conveys the same idea in the fewest words without losing any meaning.",
        difficulty: 1,
      },
      {
        question_text:
          "Which underlined word makes the sentence redundant?\n\n\"The students collaborated [together] to finish the group project.\"",
        choice_a: "collaborated",
        choice_b: "together",
        choice_c: "finish",
        choice_d: "group project",
        correct_choice: "b",
        explanation:
          "\"Collaborate\" already means to work together with others, so \"together\" adds no new information. Removing it produces the more concise: \"The students collaborated to finish the group project.\"",
        difficulty: 1,
      },
      {
        question_text:
          "Which word should be removed from \"The unexpected surprise party was a complete success\" to eliminate redundancy?",
        choice_a: "unexpected",
        choice_b: "surprise",
        choice_c: "complete",
        choice_d: "success",
        correct_choice: "a",
        explanation:
          "A \"surprise party\" is by definition unexpected. Adding \"unexpected\" before \"surprise\" is therefore redundant. The concise version is \"The surprise party was a complete success.\"",
        difficulty: 1,
      },
    ],
  },

  {
    name: "Paragraph Organization",
    slug: "paragraph-organization",
    description: "Logical flow, sentence arrangement, coherence, and transitional devices.",
    display_order: 5,
    questions: [
      // ── Logical Flow ──────────────────────────────────────────────────
      {
        question_text:
          "Read the paragraph and identify the sentence that DISRUPTS the logical flow:\n\n\"(1) Exercise has numerous health benefits. (2) Regular physical activity strengthens the heart and improves circulation. (3) Many athletes prefer morning workouts. (4) It also helps maintain a healthy weight and boosts mental health. (5) Therefore, health professionals recommend at least 30 minutes of exercise daily.\"",
        choice_a: "Sentence 1",
        choice_b: "Sentence 2",
        choice_c: "Sentence 3",
        choice_d: "Sentence 5",
        correct_choice: "c",
        explanation:
          "Sentences 1, 2, 4, and 5 all discuss the general health benefits of exercise and form a coherent argument. Sentence 3 shifts to a specific group (athletes) and their preference for timing, which is off-topic and disrupts the flow.",
        difficulty: 2,
      },
      {
        question_text:
          "Which sentence best serves as a topic sentence for a paragraph about the effects of social media on teenagers?",
        choice_a: "Many teenagers use social media every day.",
        choice_b: "Instagram was founded in 2010.",
        choice_c: "Social media has both positive and negative effects on teenagers' mental health and social development.",
        choice_d: "Some parents restrict their children's social media use.",
        correct_choice: "c",
        explanation:
          "A strong topic sentence states the paragraph's main idea clearly and is broad enough to introduce supporting details. Option C identifies the subject (social media and teenagers) and signals that both benefits and drawbacks will be discussed.",
        difficulty: 1,
      },
      {
        question_text:
          "A paragraph begins: \"Climate change poses serious risks to global food security.\" Which sentence would BEST continue this paragraph?",
        choice_a: "The Earth orbits the sun every 365 days.",
        choice_b: "Rising temperatures and changing rainfall patterns are disrupting agricultural production worldwide.",
        choice_c: "Solar panels are an effective source of renewable energy.",
        choice_d: "Many countries have diverse cuisines and food traditions.",
        correct_choice: "b",
        explanation:
          "The opening sentence introduces the idea that climate change threatens food security. The next sentence should develop this idea. Option B directly explains the mechanism — how climate change disrupts agriculture — and maintains logical flow.",
        difficulty: 1,
      },
      // ── Sentence Arrangement ──────────────────────────────────────────
      {
        question_text:
          "Arrange the following sentences in the CORRECT logical order:\n\nP: Scientists then analyzed the data to identify patterns.\nQ: A research team collected water samples from 15 rivers nationwide.\nR: The study concluded that 60% of the rivers showed elevated pollutant levels.\nS: Each sample was tested in a laboratory for chemical contaminants.",
        choice_a: "Q – S – P – R",
        choice_b: "P – Q – S – R",
        choice_c: "S – Q – P – R",
        choice_d: "Q – P – S – R",
        correct_choice: "a",
        explanation:
          "The correct sequence follows the research process: collect samples (Q) → test them (S) → analyze data (P) → draw conclusions (R). This chronological order produces a coherent paragraph.",
        difficulty: 2,
      },
      {
        question_text:
          "Arrange the sentences in the correct order to form a coherent paragraph:\n\nP: After weighing the advantages and disadvantages, she chose to pursue medicine.\nQ: She listed the pros and cons of each career option on paper.\nR: Ana had always been torn between pursuing medicine and engineering.\nS: Her passion for helping people ultimately tipped the scales.",
        choice_a: "R – Q – S – P",
        choice_b: "R – Q – P – S",
        choice_c: "Q – R – S – P",
        choice_d: "P – R – Q – S",
        correct_choice: "a",
        explanation:
          "The paragraph should introduce the conflict (R), show Ana's action to resolve it (Q), reveal the deciding factor (S), and then state the final decision (P). This gives the paragraph a natural narrative arc.",
        difficulty: 2,
      },
      {
        question_text:
          "Which arrangement best explains how a rainbow forms?",
        choice_a: "Sunlight enters a droplet → Light is reflected inside → Light is refracted as it enters → Light exits as a color spectrum",
        choice_b: "Light exits as a color spectrum → Sunlight enters a droplet → Light is refracted → Light is reflected inside",
        choice_c: "Light is refracted as it enters → Sunlight enters a droplet → Light is reflected inside → Light exits as a color spectrum",
        choice_d: "Sunlight enters a droplet → Light is refracted as it enters → Light is reflected inside → Light exits as a color spectrum",
        correct_choice: "d",
        explanation:
          "The physical process in order is: light enters the droplet, is refracted (bent) upon entry, is internally reflected, then exits separated into a spectrum of colors. Option D correctly places refraction before reflection.",
        difficulty: 2,
      },
      {
        question_text:
          "A student writes a paragraph about the water cycle. Which order best presents the stages logically?",
        choice_a: "Condensation → Evaporation → Precipitation → Collection",
        choice_b: "Evaporation → Condensation → Precipitation → Collection",
        choice_c: "Precipitation → Collection → Condensation → Evaporation",
        choice_d: "Collection → Precipitation → Condensation → Evaporation",
        correct_choice: "b",
        explanation:
          "The water cycle begins with evaporation (liquid water becomes vapor), then condensation (vapor forms clouds), then precipitation (rain or snow falls), then collection (water gathers in oceans and lakes), before the cycle repeats.",
        difficulty: 1,
      },
      // ── Coherence ─────────────────────────────────────────────────────
      {
        question_text:
          "Which sentence best fills the blank to maintain coherence?\n\n\"The Philippines is an archipelago composed of over 7,000 islands. _______ It is home to diverse cultures, languages, and ecosystems.\"",
        choice_a: "The Philippine peso is the national currency.",
        choice_b: "This geographical feature has greatly influenced the country's cultural and ecological diversity.",
        choice_c: "The Philippines gained independence on June 12, 1898.",
        choice_d: "Filipinos are known for their hospitality and warmth.",
        correct_choice: "b",
        explanation:
          "The paragraph moves from the geographical fact (7,000 islands) to cultural/ecological diversity. Option B acts as a bridge that logically connects the two, maintaining a clear and coherent flow.",
        difficulty: 2,
      },
      {
        question_text:
          "Which sentence best CONCLUDES the following paragraph?\n\n\"Regular sleep is essential for both physical and mental health. During sleep, the body repairs tissues and consolidates memories. Lack of sleep leads to impaired concentration, weakened immunity, and increased stress. _______\"",
        choice_a: "Dreaming occurs during the REM stage of sleep.",
        choice_b: "Therefore, health experts recommend 7–9 hours of quality sleep per night for adults.",
        choice_c: "Some people suffer from insomnia, a sleep disorder.",
        choice_d: "Caffeine can interfere with the body's natural sleep cycle.",
        correct_choice: "b",
        explanation:
          "The paragraph builds evidence for sleep's importance. A concluding sentence should synthesize this evidence into a recommendation or takeaway. Option B logically closes the paragraph with actionable advice.",
        difficulty: 1,
      },
      {
        question_text:
          "Which sentence does NOT belong in the following paragraph?\n\n\"(1) The Amazon rainforest is often called the 'lungs of the Earth.' (2) It produces approximately 20% of the world's oxygen. (3) The forest is home to an estimated 10% of all species on Earth. (4) Brazil's economy relies heavily on agriculture and cattle ranching. (5) Deforestation in the Amazon threatens both global oxygen production and biodiversity.\"",
        choice_a: "Sentence 1",
        choice_b: "Sentence 2",
        choice_c: "Sentence 3",
        choice_d: "Sentence 4",
        correct_choice: "d",
        explanation:
          "Sentences 1, 2, 3, and 5 all discuss the Amazon's ecological role and the threat of deforestation. Sentence 4 shifts to Brazil's economy, which is a different topic that breaks the paragraph's coherence.",
        difficulty: 2,
      },
      {
        question_text:
          "Which transition word BEST makes the following pair of sentences coherent?\n\n\"The experiment produced unexpected results. _______, the research team decided to repeat the procedure to verify their findings.\"",
        choice_a: "Therefore",
        choice_b: "In contrast",
        choice_c: "For example",
        choice_d: "However",
        correct_choice: "a",
        explanation:
          "\"Therefore\" signals a logical result — the unexpected results caused the team to verify them. \"In contrast\" and \"However\" suggest opposition; \"For example\" introduces an illustration, none of which fit the cause-and-effect relationship here.",
        difficulty: 2,
      },
      // ── Transitional Devices ──────────────────────────────────────────
      {
        question_text:
          "Which transitional word or phrase best shows CONTRAST?\n\n\"She studied for weeks before the exam. _______, she did not pass.\"",
        choice_a: "As a result",
        choice_b: "Furthermore",
        choice_c: "Nevertheless",
        choice_d: "For instance",
        correct_choice: "c",
        explanation:
          "\"Nevertheless\" (meaning \"despite that\") shows contrast between the expectation (studying should lead to passing) and the outcome (she failed). \"As a result\" implies cause and effect; \"Furthermore\" adds information; \"For instance\" introduces an example.",
        difficulty: 1,
      },
      {
        question_text:
          "Identify the function of \"In addition to\" in the following sentence:\n\n\"The new policy reduces costs. In addition to saving money, it also improves employee morale.\"",
        choice_a: "It shows contrast between two ideas.",
        choice_b: "It indicates a cause-and-effect relationship.",
        choice_c: "It introduces supplementary information.",
        choice_d: "It signals a conclusion.",
        correct_choice: "c",
        explanation:
          "\"In addition to\" is an additive transitional phrase. It tells the reader that a new benefit (improving morale) is being added on top of the one already mentioned (saving money), without implying contrast or causality.",
        difficulty: 1,
      },
      {
        question_text:
          "Which set of transitions is CORRECTLY matched with its function?",
        choice_a: "\"However, although, in contrast\" — to show addition",
        choice_b: "\"Therefore, consequently, as a result\" — to show cause and effect",
        choice_c: "\"For example, such as, in conclusion\" — to show time sequence",
        choice_d: "\"Meanwhile, subsequently, finally\" — to show contrast",
        correct_choice: "b",
        explanation:
          "\"Therefore,\" \"consequently,\" and \"as a result\" all signal that what follows is a consequence of what was stated before — a cause-and-effect relationship. The others are contrast words (A), a mix of example and conclusion words (C), and sequence/time words (D).",
        difficulty: 2,
      },
      {
        question_text:
          "Choose the transition that BEST completes the paragraph:\n\n\"The city has invested heavily in public transportation. _______, commute times have significantly decreased and fewer cars are clogging the roads.\"",
        choice_a: "In contrast",
        choice_b: "For example",
        choice_c: "As a result",
        choice_d: "In addition",
        correct_choice: "c",
        explanation:
          "The second sentence describes the outcomes of the investment described in the first sentence. \"As a result\" correctly signals this cause-and-effect relationship. \"In contrast\" implies opposition; \"For example\" introduces an illustration; \"In addition\" adds information.",
        difficulty: 1,
      },
    ],
  },

  {
    name: "Filipino Grammar and Language",
    slug: "filipino-grammar",
    description: "Bahagi ng pananalita, wastong gamit, tayutay, sawikain at idyoma, kasingkahulugan, kasalungat, at paksa ng talata.",
    display_order: 6,
    questions: [
      // ── Bahagi ng Pananalita ──────────────────────────────────────────
      {
        question_text:
          "Anong bahagi ng pananalita ang salitang \"maganda\" sa pangungusap na \"Maganda ang dalaga\"?",
        choice_a: "Pangngalan",
        choice_b: "Pang-uri",
        choice_c: "Pandiwa",
        choice_d: "Panghalip",
        correct_choice: "b",
        explanation:
          "Ang \"maganda\" ay naglalarawan sa katangian ng \"dalaga,\" kaya ito ay pang-uri (adjective). Ang pang-uri ay naglalarawan ng pangngalan o panghalip.",
        difficulty: 1,
      },
      {
        question_text:
          "Sa pangungusap na \"Tumakbo siya nang mabilis,\" anong bahagi ng pananalita ang \"nang mabilis\"?",
        choice_a: "Pang-uri",
        choice_b: "Pang-abay",
        choice_c: "Pangatnig",
        choice_d: "Panghalip",
        correct_choice: "b",
        explanation:
          "Ang \"nang mabilis\" ay pang-abay na pamaraan — naglalarawan kung paano ginaganap ang kilos na \"tumakbo.\" Ang pang-abay ay naglalarawan ng pandiwa, pang-uri, o ibang pang-abay.",
        difficulty: 1,
      },
      // ── Wastong Gamit ─────────────────────────────────────────────────
      {
        question_text:
          "Piliin ang tamang parirala upang maging tama ang pangungusap:\n\"Tumakbo siya ___ mabilis para makarating sa oras.\"",
        choice_a: "ng",
        choice_b: "nang",
        choice_c: "Pareho ang tama.",
        choice_d: "Wala sa mga ito.",
        correct_choice: "b",
        explanation:
          "Ginagamit ang \"nang\" bilang pang-abay na nagpapaliwanag kung paano, kailan, o gaano kahusay ang isang kilos. Dito, inilarawan nito ang paraan ng pagtakbo. Ang \"ng\" naman ay pantukoy ng layon o nagpapakita ng pag-aari (hal., \"libro ng bata\").",
        difficulty: 2,
      },
      {
        question_text:
          "Alin sa mga sumusunod ang may WASTONG gamit ng \"mayroon\"?",
        choice_a: "Mayroon libro sa mesa.",
        choice_b: "Mayroon siyang libro.",
        choice_c: "Mayroon pera sa bulsa niya.",
        choice_d: "Mayroon pagkain doon.",
        correct_choice: "b",
        explanation:
          "Ginagamit ang \"Mayroon\" kasama ng panghalip na enklitiko (tulad ng \"-ng\" sa \"siyang\") o sa katapusan ng pangungusap. Ang tamang anyo ay \"Mayroon siyang libro.\" Para sa mga pangungusap nang walang enklitiko, mas angkop ang \"Mayroong\" o \"May\" (hal., \"May libro sa mesa\").",
        difficulty: 2,
      },
      {
        question_text:
          "Alin ang tamang anyo ng pandiwa para sa pangungusap?\n\"Siya ay ___ ng isang bagong kanta para sa susunod na programa.\"",
        choice_a: "umawit",
        choice_b: "aawit",
        choice_c: "awit",
        choice_d: "inaawit",
        correct_choice: "b",
        explanation:
          "Ang pangungusap ay nagpapahiwatig ng gagawin sa hinaharap (\"susunod na programa\"), kaya ginagamit ang aspektong pawatas / hinaharap: \"aawit.\" Ang \"umawit\" ay nakaraan, \"awit\" ay ugat, at \"inaawit\" ay kasalukuyang nagaganap.",
        difficulty: 2,
      },
      // ── Tayutay ───────────────────────────────────────────────────────
      {
        question_text:
          "Anong tayutay ang ginagamit sa pangungusap na \"Ang kanyang ngiti ay parang sikat ng araw\"?",
        choice_a: "Metapora (Pagwawangis)",
        choice_b: "Simile (Pagtutulad)",
        choice_c: "Personipikasyon (Pagpapakatao)",
        choice_d: "Hiperbola (Pagmamalabis)",
        correct_choice: "b",
        explanation:
          "Ang simile o pagtutulad ay naghahambing sa dalawang bagay gamit ang mga salitang \"parang,\" \"tulad ng,\" o \"kawangis ng.\" Dito, inihambing ang ngiti sa sikat ng araw sa pamamagitan ng \"parang.\" Ang metapora ay direktang paghahambing nang hindi gumagamit ng mga salitang iyon.",
        difficulty: 1,
      },
      {
        question_text:
          "\"Ang bundok ay nag-unat ng kanyang mga braso pagkatapos ng matagal na tulog.\"\n\nAnong tayutay ang ginagamit?",
        choice_a: "Simile",
        choice_b: "Metapora",
        choice_c: "Personipikasyon",
        choice_d: "Alusyon",
        correct_choice: "c",
        explanation:
          "Ang personipikasyon o pagpapakatao ay nagbibigay ng katangiang pantao sa bagay o konsepto. Dito, ang bundok — isang di-buhay na bagay — ay binibigyan ng kakayahang \"mag-unat ng mga braso\" at \"matulog,\" na mga gawi ng tao.",
        difficulty: 1,
      },
      {
        question_text:
          "\"Ang kanyang luha ay ilog na dumadaloy nang walang tigil.\"\n\nAnong tayutay ang ipinakita?",
        choice_a: "Simile",
        choice_b: "Metapora",
        choice_c: "Hiperbola",
        choice_d: "Personipikasyon",
        correct_choice: "b",
        explanation:
          "Ang metapora o pagwawangis ay direktang naghahambing sa dalawang bagay nang hindi gumagamit ng \"parang\" o \"tulad ng.\" Dito, ang \"luha\" ay direktang tinatawag na \"ilog,\" na nagpapahiwatig ng matindi at tuluy-tuloy na pag-iyak.",
        difficulty: 2,
      },
      // ── Sawikain / Idyoma ─────────────────────────────────────────────
      {
        question_text:
          "Ano ang kahulugan ng sawikain na \"Ang hindi marunong lumingon sa pinanggalingan ay hindi makararating sa paroroonan\"?",
        choice_a: "Mahalagang malaman ang tamang daan patungo sa iyong destinasyon.",
        choice_b: "Hindi makakarating sa layunin ang taong hindi marunong mag-navigate.",
        choice_c: "Ang taong hindi nagpapahalaga sa kanyang pinagmulan ay walang matibay na pundasyon para sa kinabukasan.",
        choice_d: "Kailangan lumingon sa likod bago tumawid sa daan.",
        correct_choice: "c",
        explanation:
          "Ang sawikain na ito ay nagtuturo na ang taong hindi nagpapahalaga sa kanyang pinagmulan — pamilya, kultura, at kasaysayan — ay walang matibay na pundasyon para sa kanyang hinaharap. Hindi ito literal na tungkol sa paglalakbay.",
        difficulty: 2,
      },
      {
        question_text:
          "Ano ang ibig sabihin ng idyomang \"bukas ang palad\"?",
        choice_a: "Malaking palad ang kamay.",
        choice_b: "Mahilig manakaw.",
        choice_c: "Mapagbigay at maluwag ang loob.",
        choice_d: "Madaling mahikayat ng pera.",
        correct_choice: "c",
        explanation:
          "Ang \"bukas ang palad\" ay idyomang nangangahulugang mapagbigay — ang taong \"bukas ang palad\" ay handang magbigay ng tulong o abuloy sa kapwa nang buong puso.",
        difficulty: 1,
      },
      // ── Kasingkahulugan ───────────────────────────────────────────────
      {
        question_text:
          "Ano ang kasingkahulugan ng salitang \"magwagi\"?",
        choice_a: "Matalo",
        choice_b: "Lumaban",
        choice_c: "Manalo",
        choice_d: "Tumakbo",
        correct_choice: "c",
        explanation:
          "Ang \"magwagi\" ay nangangahulugang maging kampeon o manalo. Ang \"manalo\" ay kasingkahulugan nito sapagkat magkapareho ang ipinapahiwatig ng tagumpay o pagkapanalo.",
        difficulty: 1,
      },
      {
        question_text:
          "Piliin ang kasingkahulugan ng salitang \"tahimik\".",
        choice_a: "Maingay",
        choice_b: "Maliwanag",
        choice_c: "Payapa",
        choice_d: "Malungkot",
        correct_choice: "c",
        explanation:
          "Ang \"tahimik\" at \"payapa\" ay magkasing-kahulugan — parehong nagpapahiwatig ng kawalan ng ingay o kaguluhan. Ang \"maingay\" ay kasalungat, habang ang \"maliwanag\" at \"malungkot\" ay magkaibang mga konsepto.",
        difficulty: 1,
      },
      // ── Kasalungat ────────────────────────────────────────────────────
      {
        question_text:
          "Ano ang kasalungat ng salitang \"matapang\"?",
        choice_a: "Malakas",
        choice_b: "Mapanganib",
        choice_c: "Duwag",
        choice_d: "Maingat",
        correct_choice: "c",
        explanation:
          "Ang kasalungat ng \"matapang\" (matapang sa harap ng panganib) ay \"duwag\" (natatakot at tumatakas sa panganib). Ang \"malakas\" ay tungkol sa pisikal na lakas, \"mapanganib\" ay naglalarawan sa kalagayan, at \"maingat\" ay ibang katangian.",
        difficulty: 1,
      },
      // ── Paksa ng Talata ───────────────────────────────────────────────
      {
        question_text:
          "Basahin ang talata at piliin ang pinaka-angkop na paksa:\n\n\"Ang pagbabasa ay isa sa pinaka-epektibong paraan upang mapalawig ang kaalaman. Sa pamamagitan ng pagbabasa, natututo tayo ng mga bagong salita, ideya, at perspektibo. Bukod dito, pinangangalagaan din nito ang ating kakayahan sa pag-iisip at nagbibigay ng kasiyahan sa maraming tao.\"",
        choice_a: "Ang mga benepisyo ng pagbabasa",
        choice_b: "Ang kahalagahan ng mga bagong salita",
        choice_c: "Ang kasiyahan na dulot ng mga libro",
        choice_d: "Ang pag-unlad ng kakayahan sa pag-iisip",
        correct_choice: "a",
        explanation:
          "Ang buong talata ay nagpapaliwanag ng iba't ibang benepisyo ng pagbabasa: pagpapalawak ng kaalaman, pagkatuto ng mga bagong ideya, at kasiyahan. Ang pinakamalawak at pinaka-tumpak na paksa na sumasaklaw sa lahat ay \"ang mga benepisyo ng pagbabasa.\"",
        difficulty: 1,
      },
      {
        question_text:
          "Alin sa mga sumusunod ang pinakamainam na paksa para sa isang talata na naglalaman ng mga detalyeng ito:\n\n• Ang mga halaman ay gumagamit ng sikat ng araw para sa photosynthesis.\n• Ang tubig at carbon dioxide ay ginagawang glucose at oxygen.\n• Ang prosesong ito ang nagbibigay ng pagkain sa halaman at oxygen sa ating kapaligiran.",
        choice_a: "Ang kahalagahan ng sikat ng araw",
        choice_b: "Ang proseso at kahalagahan ng photosynthesis",
        choice_c: "Paano gumagawa ng glucose ang mga halaman",
        choice_d: "Ang papel ng carbon dioxide sa kalikasan",
        correct_choice: "b",
        explanation:
          "Ang tatlong detalye ay nagtutulungan upang ilarawan ang photosynthesis — kung paano ito gumaganap at kung bakit ito mahalaga. Ang pinaka-angkop na paksa na sumasaklaw sa lahat ng detalye ay \"Ang proseso at kahalagahan ng photosynthesis.\"",
        difficulty: 2,
      },
    ],
  },
];

async function main() {
  console.log("Seeding new Language Proficiency topics...\n");

  const { data: subtest, error: subtestErr } = await supabase
    .from("subtests")
    .select("id")
    .eq("slug", "language-proficiency")
    .single();

  if (subtestErr || !subtest) {
    console.error("Could not find language-proficiency subtest:", subtestErr?.message);
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

  console.log("\n✅  Done! Added 3 topics and 45 questions.");
}

main();
