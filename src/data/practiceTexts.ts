export const practiceTexts = [
  {
    id: "warmup-short",
    title: "Warm-Up: Short Phrases",
    difficulty: "easy",
    category: "warm-up",
    text: "Take a breath. Speak slowly. One phrase at a time. Feel the rhythm. Pause between ideas. Let the words land. Your listener is following you. There is no rush. Slow is clear. Clear is confident.",
  },
  {
    id: "daily-conversation",
    title: "Daily Conversation",
    difficulty: "easy",
    category: "conversation",
    text: "Good morning. How are you today? I am doing well, thank you. I had a busy morning but things are calming down. I wanted to call you because I have a question about the meeting next week. Is Tuesday still good for you? I can also do Wednesday if that works better. Just let me know and I will confirm.",
  },
  {
    id: "workplace",
    title: "At Work",
    difficulty: "medium",
    category: "professional",
    text: "I wanted to follow up on the project we discussed last Thursday. The team has reviewed the initial draft and we have a few suggestions. First, we think the timeline could be adjusted to give us more time on the testing phase. Second, the budget estimate might need to be revised based on the new requirements. I can send you a summary by end of day if that would be helpful.",
  },
  {
    id: "storytelling",
    title: "Telling a Story",
    difficulty: "medium",
    category: "narrative",
    text: "Last weekend I went hiking with my family. We chose a trail near the lake that we had never done before. The weather was perfect — sunny but not too hot. About halfway through, my daughter spotted a deer standing just off the path. We all stopped and watched it for a minute before it walked away into the trees. It was one of those moments that just makes you feel grateful.",
  },
  {
    id: "phone-call",
    title: "Phone Call Practice",
    difficulty: "medium",
    category: "conversation",
    text: "Hello, this is Alex calling. I am reaching out because I received a letter about my account and I have a few questions. The letter mentioned a change to my plan starting next month, but I am not sure I understand what is changing exactly. Could you walk me through it? I also want to make sure my billing address is correct before the renewal date.",
  },
  {
    id: "complex-ideas",
    title: "Explaining Complex Ideas",
    difficulty: "hard",
    category: "professional",
    text: "The concept of neuroplasticity — the brain's ability to reorganize itself by forming new neural connections — is central to understanding why speech therapy works. When we practice a skill repeatedly and with intention, we strengthen the pathways that support that behavior. For cluttering specifically, this means that consistent rate monitoring, even outside of therapy sessions, creates lasting change over time. The key is not perfection but persistence.",
  },
  {
    id: "emotional",
    title: "Talking About Something That Matters",
    difficulty: "hard",
    category: "personal",
    text: "I have been thinking about this for a while and I want to share something with you. When I was younger, I always felt like people were not really listening to me — like I was talking but somehow not being heard. I did not understand at the time that the way I was speaking was making it hard for others to follow. Working on my speech has changed things. I feel more confident now. People actually wait for me to finish.",
  },
  {
    id: "articulation-challenge",
    title: "Articulation Challenge",
    difficulty: "hard",
    category: "warm-up",
    text: "Precise articulation requires deliberate coordination between the lips, tongue, teeth, and palate. Practice producing each syllable with intention, particularly in words containing consonant clusters like strengths, scripts, sprints, and thresholds. Slow your rate and notice how clarity improves when each phoneme is fully formed before moving to the next.",
  },
];

export type PracticeText = typeof practiceTexts[number];
