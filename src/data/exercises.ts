export type ExerciseType = 'reading' | 'improvisation' | 'repetition' | 'warmup' | 'proprioception' | 'rebus' | 'retelling';

export interface RebusSegment {
  segment: string;
  emoji: string;
  pause_after: boolean;
}

export interface Exercise {
  id: string;
  text: string;
  tip: string;
  title: string;
  isClinical?: boolean;
  type?: ExerciseType; // For special exercise modes
  duration?: number; // For timed exercises (in seconds)
  repetitions?: number; // For repetition exercises
  content_type?: 'text' | 'rebus';
  rebusContent?: RebusSegment[];
  keyPoints?: string[];
}

export interface ExerciseCategory {
  id: string;
  level: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  exercises: Exercise[];
  isClinical?: boolean;
  type?: ExerciseType; // Category-wide type
}

const IMPROVISATION_THEMES = [
  "Describe your home or apartment",
  "Talk about your last vacation",
  "Explain your morning routine",
  "Describe your favorite meal",
  "Talk about your job or studies",
  "Describe a movie you recently watched",
  "Explain how to make your favorite recipe",
  "Talk about a hobby you enjoy",
  "Describe your ideal weekend",
  "Talk about a person who has influenced you",
  "Explain what cluttering means to you",
  "Describe how your speech has changed recently",
];

export const exerciseCategories: ExerciseCategory[] = [
  {
    id: "slow-reading",
    level: 1,
    title: "Rate Reduction",
    description: "Reading exercises focused on slowing below 4.5 SPS. The cornerstone of cluttering therapy — train your brain to slow before your mouth does.",
    icon: "🌱",
    color: "from-green-500/20 to-green-600/10",
    exercises: [
      {
        id: "slow-1",
        title: "Mindful Breathing",
        text: "I take the time to breathe. Each inhale fills my lungs with fresh air. Each exhale releases the tension. My body relaxes gradually. My shoulders drop naturally. My jaw loosens. I am not in a hurry. Time flows at my own pace. I savor this moment of calm. Restless thoughts settle little by little. I am present, here and now. My voice finds its natural tempo. Words come to me without effort. I pronounce them with clarity. Every syllable has its place. Pauses give meaning to my sentences. The silence between words is not emptiness. It is a breath, a necessary rest. I allow myself to take my time. No one is rushing me. This freedom is precious. I nurture it with patience. Every day, I improve a little more. My calm becomes my strength. My speech becomes clearer. Others listen to me with attention. I communicate with confidence. Breathing remains my anchor. I always return to it when the pace quickens.",
        tip: "Breathe deeply between each sentence. Mentally count two seconds before speaking again."
      },
      {
        id: "slow-2",
        title: "A Walk in Nature",
        text: "The trail winds through the forest. Ancient trees stretch their branches toward the sky. Their leaves filter the sunlight. Golden rays dance on the moss-covered ground. The air is cool and fragrant. I breathe deeply, taking in the scent of damp earth. A stream flows somewhere nearby; I can hear its soothing murmur. Birds sing high above. Each one has its own unique melody. I stop to listen. Time seems to stand still in this sheltered place. A squirrel darts across the path in front of me. It pauses, looks at me, then vanishes into the foliage. I smile at this fleeting encounter. My steps fall softly on the fallen leaves. They crunch beneath my feet with a reassuring sound. The path climbs gently toward a clearing. Up there, the sky opens wide. White clouds drift slowly. I sit down on a flat rock. The warmth of the sun heats my face. I close my eyes for a moment. All of my senses are alive. Nature offers me this moment of peace. I am grateful for it.",
        tip: "Visualize each scene in your mind before describing it. Let the images guide your reading pace."
      },
      {
        id: "slow-3",
        title: "A Gentle Wake-Up",
        text: "The day dawns quietly. The first rays of sunlight slip through the curtains. The room gradually brightens with a golden glow. I linger for a few moments in the warmth of the sheets. My body wakes slowly, limb by limb. I stretch my arms above my head. I feel my muscles coming alive. A deep yawn escapes me. It is a sign that the night was restful. I turn my head toward the window. The sky is a pale blue, promising a beautiful day. The birds have begun their morning concert. Their cheerful songs make me want to get up. I gently push back the covers. My feet touch the cool floor. That sensation wakes me completely. I walk to the kitchen at a calm pace. The smell of coffee is beginning to fill the house. With a warm cup in my hands, I settle near the window. I gaze at the garden as it awakens too. Dew glistens on the petals of the flowers. A cat crosses the lawn with elegance. The day can begin. I am ready to welcome it with serenity.",
        tip: "Articulate every syllable clearly. Morning is a time of transition, and your reading should reflect that gentleness."
      },
      {
        id: "slow-4",
        title: "The Rhythm of Walking",
        text: "One step, then another. The path stretches out before me. I do not know where it ends, but that does not matter. What matters is the journey, not the destination. My feet find their natural rhythm. Not too fast, not too slow. Just the tempo that suits my body. I feel the ground beneath my soles. Every surface has its own texture. The hard concrete of the city, the crunching gravel, the soft grass of the park. I adjust my stride to each terrain. My breath accompanies my steps. Inhale for two steps, exhale for two steps. This steady rhythm calms my mind. Intrusive thoughts drift away. I am fully present in my body as it moves. The scenery shifts around me. I notice details I had never seen before. A flower at the edge of the sidewalk, a colorful piece of graffiti on a wall, the smile of a stranger. Walking opens my senses to the world. It reconnects me to what truly matters. Every walk is a meditation in motion. I always return feeling calm, my mind clear.",
        tip: "Synchronize your breathing with your reading pace. Imagine your words are steady, even footsteps."
      },
      {
        id: "slow-5",
        title: "The Art of Listening",
        text: "Truly listening is an art that must be cultivated. It requires silencing our inner voice. Suspending our judgments and interpretations. Welcoming the words of others with openness. I practice every day to become a better listener. I look at the person speaking to me. I notice their expressions, their gestures, their silences. All of this is part of the message. Words represent only a fraction of communication. The tone of voice sometimes says far more. A hesitation can reveal a hidden emotion. A smile can contradict negative words. I pay attention to these subtle signals. When someone speaks to me, I resist the urge to interrupt. I give them time to form their thoughts. Sometimes the best ideas come after a pause. I ask questions to understand better. Open-ended questions that invite deeper reflection. I sometimes rephrase what I have heard. This shows that I have truly listened. This quality of listening transforms my relationships. Others feel respected and valued. In return, they listen to me with greater attention as well.",
        tip: "Read this text as though you were speaking to someone. Natural pauses give weight to your words."
      },
      {
        id: "slow-6",
        title: "Everyday Patience",
        text: "Patience is not passive waiting. It is an active strength that requires practice. In a world that prizes speed, patience becomes an act of resistance. I nurture this precious quality every day. In the checkout line at the grocery store, I breathe calmly. This time is not wasted; it belongs to me. I can observe the people around me. Each one has a story, their own concerns. In traffic, I choose not to get frustrated. Anger will not make the cars move faster. I might as well enjoy this moment listening to music. Or quietly reflecting on my plans. With my loved ones, patience takes another form. I accept that everyone has their own pace. My children learn at their own speed. My partner has their own way of doing things. I cannot force them to change. But I can support them with kindness. The patience I develop toward others, I also apply to myself. I do not judge myself too harshly when I make mistakes. I accept that progress takes time. Every small step counts on this long path.",
        tip: "Patience applies to reading too. Take all the time you need for each sentence without rushing."
      },
      {
        id: "slow-7",
        title: "The Secret Garden",
        text: "At the far end of the garden, behind the rose bushes, there is a small corner that no one knows about. It is my refuge, my space of tranquility. An old stone bench has been waiting there for decades. Moss has covered its legs, giving it a timeless charm. I often sit here to read or simply daydream. Ivy climbs along the wall, creating a screen of greenery. The sounds of the street disappear here. Only birdsong and the hum of bees reach this place. In spring, purple irises bloom at the foot of the wall. Their delicate fragrance fills the air. In summer, jasmine takes over with its white star-shaped flowers. Autumn brings golden leaves that carpet the ground. In winter, the garden rests beneath a thin layer of frost. Each season has its own beauty in this little corner of paradise. I come here when I need to recharge. Time stops between these walls covered in green. My thoughts become clear and my worries grow lighter. This secret garden is my ally in the search for inner calm.",
        tip: "Let the descriptions create images in your mind. Visualization naturally helps you slow down."
      },
      {
        id: "slow-8",
        title: "The Old Clock",
        text: "In my grandparents' living room stood an old grandfather clock. Its pendulum swung steadily, marking the passage of time with dignity. Every hour, it chimed with a deep, resonant voice. The sound echoed through the entire house, reminding everyone that time was moving forward. As a child, I was fascinated by its intricate mechanism. The golden gears turned with pinpoint precision. The hands crept imperceptibly across the enamel face. My grandfather wound the clock every Sunday morning. It was an unchanging ritual, a gesture passed down from father to son. He handled the brass key with respect and care. He never forced the century-old mechanism. This clock had taught him the value of time, he would say. Not to count it anxiously, but to appreciate it fully. Each tick-tock was an invitation to live in the present moment. Today, that clock is in my home. It continues to set the rhythm of my days with its steady beat. When I hear it, I think of my grandfather. I remember his wise words about patience and the gift of time.",
        tip: "Let the rhythm of the clock guide your reading. Imagine the pendulum swinging slowly."
      },
      {
        id: "slow-9",
        title: "Sunday Cooking",
        text: "On Sundays, the kitchen becomes the heart of the home. From early morning, preparations begin without haste. I take out the ingredients one by one and arrange them on the counter. Every motion is measured; every step matters. Water begins to simmer in the large pot. The vegetables wait patiently to be peeled. I pick up the knife and begin my work with care. The carrots are sliced into even rounds. The finely diced onions release their sharp aroma. Fresh herbs from the garden add their touch of brightness. Thyme, rosemary, and bay leaf already fill the room with fragrance. The broth simmers gently on the stove. I watch without interfering, letting time do its work. Patience is the secret ingredient of good cooking. Flavors develop slowly; textures come together. At noon, the family gathers around the table. Conversation is lively and plates are filled. This meal is the result of several hours of unhurried preparation. But the result is more than worth the effort.",
        tip: "As in cooking, rushing never helps. Savor each word like a fine ingredient."
      },
      {
        id: "slow-10",
        title: "The Train Journey",
        text: "The train slowly pulls out of the station. The last platforms slide past the window. Gradually, the urban landscape gives way to countryside. Buildings turn into houses, then into fields stretching as far as the eye can see. I settle comfortably in my seat. The steady rhythm of wheels on rails soothes me. That distinctive sound is a lullaby for adults. I watch the world go by without rushing. Cows graze peacefully in the meadows. A tractor carves furrows in a plowed field. A village appears in the distance with its pointed steeple. Then it vanishes as quickly as it appeared. Travel time is suspended time. No phone ringing, no meeting to hurry to. I can finally read the book that has been waiting for months. Or simply gaze at the scenery while letting my thoughts wander. The conductor comes by to check tickets. His smile is welcoming, his pace measured. He too seems to have adopted the rhythm of the train. The destination is approaching, but I am in no rush to arrive. The journey itself is already a gift.",
        tip: "Match the rhythm of the train: steady, peaceful, without sudden jolts. Commas are your station stops."
      }
    ]
  },
  {
    id: "daily-life",
    level: 2,
    title: "Functional Communication",
    description: "Phone calls, workplace scenarios, and daily communication. Practice maintaining your target rate when it matters most.",
    icon: "📧",
    color: "from-blue-500/20 to-blue-600/10",
    exercises: [
      {
        id: "daily-1",
        title: "The Professional Email",
        text: "Dear Mr. Thompson, thank you sincerely for your message of January fifteenth. I took the time to carefully review your business proposal, and I must say it has captured my full attention. The terms you are offering generally align with our expectations. However, I would like to clarify a few points before we commit. First, regarding delivery timelines, you mention a three-week lead time, but would it be possible to reduce this to two weeks for urgent orders? Second, I would like to learn more about the warranty conditions. You indicate a two-year warranty, but does it also cover wear-and-tear parts? Third, we would like to discuss payment terms. An installment plan over three months would suit us better than a lump-sum payment. I am available next Tuesday, January twenty-third, to discuss this over a phone call. Please confirm your availability. Do not hesitate to contact me if you have any questions or comments regarding these points. I remain at your full disposal for any additional information. Looking forward to hearing from you. Best regards, Marie Martin, Procurement Manager.",
        tip: "Professional emails deserve a calm, clear rate. Mark the transitions between different points clearly."
      },
      {
        id: "daily-2",
        title: "Ordering at a Restaurant",
        text: "Good evening, we have a reservation for four under the name Whitfield for eight o'clock. Perfect, thank you. Could you seat us near the window if possible? We would like to start by looking at the wine list. Could you recommend a red wine that would pair well with a beef dish? Excellent, we will have a bottle of that Cabernet you recommend. For starters, I will have the house pate with fig chutney. My wife will have the warm goat cheese salad with walnuts. For the children, we will order two bowls of the soup of the day. For the main courses, I will choose the grilled ribeye, medium, with hand-cut fries and a peppercorn sauce. My wife would like the pan-seared sea bass with celery root puree. For the children, two burgers with green beans, please. Oh, I almost forgot, my son has a nut allergy. Could you let the kitchen know? Thank you so much. We will decide on dessert later. Could we also have a pitcher of still water and a bottle of sparkling water? And if possible, a bit more bread; it is delicious. Thank you so much for your patience and professionalism.",
        tip: "When ordering, speak slowly enough to be understood the first time. Detailed orders require clarity and pauses."
      },
      {
        id: "daily-3",
        title: "The Team Meeting",
        text: "Thank you all for being here for this weekly meeting. I know your schedules are busy, so I will try to be as concise as possible. Today, we are going to cover five key points that directly concern our team and our quarterly goals. First, let us review January. The results are encouraging: we reached one hundred and fifteen percent of our sales target. That is excellent teamwork, and I want to congratulate you. Second, let us talk about our goals for February. We need to maintain this momentum while preparing for the new product launch scheduled for March fifteenth. Third, I would like to discuss rescheduling our meetings. Based on your feedback, we are moving the Monday morning meetings to Tuesday afternoons. That should work for everyone. Fourth, regarding training, we have secured the budget for three sessions on the new software. Registration opens tomorrow. Fifth and finally, open questions. Are there any topics you would like to bring up? Concerns? Suggestions? Please feel free to speak up. Your input matters greatly to the success of our shared projects. Before we wrap up, I want to remind you that one-on-one reviews will take place next week.",
        tip: "Number your points out loud and pause between them. In a meeting, a calm rate makes it easier for others to take notes."
      },
      {
        id: "daily-4",
        title: "Giving Detailed Directions",
        text: "Of course, I will explain how to get to the train station from here. It is fairly simple, but listen carefully because there are a few turns. Leave this building through the main entrance. Once outside, turn right and continue straight for about two hundred meters. You will pass a bakery on your left, then a pharmacy on your right. At the first traffic light, the one just past the coffee shop, turn left. You will then be on Main Avenue. Follow this avenue for about four hundred meters. You will pass the city park on your right; that is a good landmark. Continue straight until you reach the large intersection with the roundabout. Take the second exit off the roundabout, toward downtown. The street is called Republic Street. Walk another one hundred and fifty meters or so. The station will be on your right, just past the post office. You cannot miss it; there is a large blue sign with the station logo. In total, it is about a ten- to fifteen-minute walk at a normal pace. If you are in a hurry, you can also take bus number seven, which comes every ten minutes in front of this building and stops right at the station. Good luck and safe travels!",
        tip: "Give instructions in distinct steps. Each direction deserves a pause to allow the listener to absorb it."
      },
      {
        id: "daily-5",
        title: "Calling Customer Service",
        text: "Hello, good morning, I am calling about a problem with an order I placed on your website. My order number is nine six two three four five seven eight. I placed this order on January tenth and I was supposed to receive it within five business days. Today is January twenty-second and I still have not received anything. I checked the tracking with the number you sent me by email, but the status shows the package has been stuck at the warehouse since January fourteenth. I tried contacting the carrier, but they redirected me to you, saying the issue was on the sender's end. This is quite frustrating because I needed the item for an event this weekend. Could you check what is happening with my order? Is it possible to have it shipped express? Or if that is not possible, I would like a refund so I can purchase the item elsewhere. I understand that delays can happen, but two weeks without any updates is really too long. Can you give me a solution today? Thank you in advance for your help and understanding. My phone number is zero six one two three four five six seven eight if you need to reach me again.",
        tip: "On the phone, articulate more clearly since the other person cannot see your lips. State numbers distinctly."
      },
      {
        id: "daily-6",
        title: "The Business Presentation",
        text: "Good morning, everyone, and welcome to this presentation. My name is Thomas Martin and I am the Innovation Project Manager in our department. Today, I will present the results of our market research and our recommendations for the new product launch. This presentation will last approximately thirty minutes, followed by a question-and-answer session. If you have questions during the presentation, feel free to interrupt. Let us begin with the context. As you know, the market has changed significantly over the past two years. Our competitors have launched innovative products and our market share has declined slightly. In response, we conducted an in-depth study with five hundred potential customers. The results are very informative. Seventy percent of respondents say they are willing to try a new product if it meets three key criteria: quality, price, and durability. Our new product meets these expectations perfectly. Let us now turn to the projected figures. We estimate we can capture eight percent market share in the first year and twelve percent in the second year. To reach these goals, we recommend a marketing investment of two hundred thousand dollars spread over eighteen months. I will now show you the product mockups and the focus group feedback.",
        tip: "During a presentation, speak twenty percent more slowly than usual. Use pauses to give the audience time to absorb the information."
      },
      {
        id: "daily-7",
        title: "The Doctor's Appointment",
        text: "Doctor, I am here because I have been experiencing a persistent pain in my lower back for about three weeks now. The pain started gradually, with no particular triggering event that I can identify. It is mostly present in the morning when I wake up and when I sit at my desk for too long. The pain usually decreases when I move around and walk. I have tried doing some stretches I found online, but they are not enough to provide lasting relief. I also took acetaminophen for a few days, which helped a little, but the pain returns as soon as the medication wears off. On a scale of one to ten, I would say the pain is around a five or six. It is not unbearable, but it is really bothersome on a daily basis, especially in my job where I have to sit for long hours. I have noticed that the pain sometimes radiates down to my right leg, especially in the evening. I do not have a fever, no weight loss, and I have not had any recent injuries. However, I should mention that I have been doing very little exercise for several months and my office chair is not very ergonomic. What do you think, doctor? Should I have some additional tests done?",
        tip: "Describe your symptoms calmly and methodically. A steady rate helps the doctor fully understand your situation."
      },
      {
        id: "daily-8",
        title: "The Business Negotiation",
        text: "I completely understand your position, and I hear you sincerely. You have budget constraints, and we have production costs to cover. This is a classic situation in any business negotiation. However, I am confident we can find common ground that satisfies both parties. Allow me to make an alternative proposal. Instead of the standard rate of fifty dollars per unit, I can offer you forty-five dollars, which is a ten percent discount. In return, I would ask for a commitment to a minimum order of five hundred units instead of the originally planned three hundred. Additionally, we could consider a long-term partnership with volume-based pricing. For orders exceeding one thousand units, the price could drop to forty-two dollars. What do you think? This proposal would allow you to reduce your costs while guaranteeing us sufficient volume to maintain our quality of service. I am also open to discussing payment terms. If net sixty days works better for you than net thirty, we can accommodate that. What matters most to us is building a lasting relationship of trust. Take the time to think it over and get back to me with your thoughts. I remain flexible and open to discussion.",
        tip: "In a negotiation, strategic pauses show confidence. Speak slowly to give weight to each proposal."
      }
    ]
  },
  {
    id: "articulation",
    level: 3,
    title: "Over-Articulation",
    description: "Deliberately exaggerate consonants and vowels for clarity. A core technique in cluttering therapy — slow down and make every phoneme count.",
    icon: "🎯",
    color: "from-red-500/20 to-red-600/10",
    exercises: [
      {
        id: "artic-1",
        title: "She Sells Seashells",
        text: "She sells seashells by the seashore. The shells she sells are seashells, I'm sure. So if she sells seashells on the seashore, then I'm sure she sells seashore shells.",
        tip: "Articulate every syllable by exaggerating your mouth movements."
      },
      {
        id: "artic-2",
        title: "Peter Piper",
        text: "Peter Piper picked a peck of pickled peppers. A peck of pickled peppers Peter Piper picked. If Peter Piper picked a peck of pickled peppers, where's the peck of pickled peppers Peter Piper picked?",
        tip: "Focus on the 'p' sound without letting it blur into 'b'."
      },
      {
        id: "artic-3",
        title: "Sixth Sick Sheik",
        text: "The sixth sick sheik's sixth sheep's sick. Six sleek swans swam swiftly southwards. Six sharp smart sharks. The sixth sick sheik's sheep certainly seems to be sick.",
        tip: "Slow down considerably on the 's' and 'sh' sounds."
      },
      {
        id: "artic-4",
        title: "Toy Boat",
        text: "Toy boat, toy boat, toy boat. Try saying toy boat ten times fast. A tricky toy boat trip takes tremendous tongue talent. Two tiny toy boats teetered toward the tall tower.",
        tip: "Clearly differentiate between the 't' and 'b' sounds."
      },
      {
        id: "artic-5",
        title: "Woodchuck",
        text: "How much wood would a woodchuck chuck if a woodchuck could chuck wood? He would chuck, he would, as much as he could, and chuck as much wood as a woodchuck would if a woodchuck could chuck wood.",
        tip: "Practice slowly at first, then gradually pick up speed."
      },
      {
        id: "artic-6",
        title: "Fresh French Fried",
        text: "Fresh French fried fish. Freshly fried fresh flesh. Fred fed Ted bread, and Ted fed Fred bread. Friendly Frank flips fine flapjacks fast.",
        tip: "The 'fr' and 'fl' blends require precise articulation."
      },
      {
        id: "artic-7",
        title: "The KS Sound",
        text: "Six thick thistle sticks. Six thick thistles stick. The ex-executor exercises his excessive excise taxes expertly. Expect extra excuses from the exhausted executive.",
        tip: "The 'x' sound is the trickiest -- break it down into 'ks'."
      },
      {
        id: "artic-8",
        title: "The Fisherman",
        text: "Poor patient Peter the fisherman perseveres, preparing to pick up plenty of plump perch. Plump perch please patient Peter perfectly. Past the pier, Peter patiently pulls plentiful perch past the pylons.",
        tip: "Exaggerate the 'p' by projecting a slight puff of air."
      },
      {
        id: "artic-9",
        title: "Red Lorry Yellow Lorry",
        text: "Red lorry, yellow lorry, red lorry, yellow lorry. I say red lorry, then yellow lorry. A red lorry on a yellow road, a yellow lorry on a red road. Red leather, yellow leather, red leather, yellow leather.",
        tip: "Alternate quickly between the 'r' and 'l' sounds."
      },
      {
        id: "artic-10",
        title: "The Rat",
        text: "A rat ran rapidly round the rugged rock. The rugged rock resisted the rat's rapid run. Raging, the rat retreated, regretting its reckless race round the remarkably rugged rock.",
        tip: "Keep your 'r' sounds crisp and clear."
      },
      {
        id: "artic-11",
        title: "Three Turtles",
        text: "Three gray geese in a green field grazing. Gray were the geese and green was the grazing. Three free-throw throwers threw three free throws. Three turtles trotted on a terribly tight trail.",
        tip: "The consonant clusters 'gr' and 'thr' require careful attention."
      },
      {
        id: "artic-12",
        title: "Sally's Sibilants",
        text: "I want and I insist on exquisite excuses. Six Swiss ships shifted swiftly. Sixty-six sick chicks sat on six slim slick slender sticks. Sally swiftly sorted sixty-six thin thistle sticks.",
        tip: "Articulate the sibilant 's' sounds with precision."
      },
      {
        id: "artic-13",
        title: "The Wheel",
        text: "Round and round the rugged rocks the ragged rascal ran. Whether the weather is warm, whether the weather is hot, we have to put up with the weather whether we like it or not.",
        tip: "Work on the fluidity of 'r' and 'w' transitions."
      },
      {
        id: "artic-14",
        title: "The Pecking Hens",
        text: "A proper copper coffee pot. Pick up a proper copper coffee pot properly. Picky people pick Peter Pan peanut butter. Pretty Patty picked plump purple plums promptly.",
        tip: "Chain the explosive 'p' sounds with precision."
      },
      {
        id: "artic-15",
        title: "The Seashells",
        text: "Can you can a can as a canner can can a can? Unique New York. You know you need unique New York. A quick-witted cricket critic. Cooks cook cupcakes quickly.",
        tip: "Clearly distinguish the 'k' and 'g' sounds in transitions."
      },
      {
        id: "artic-16",
        title: "Black and Blue",
        text: "The big black bug bled blue-black blood. A big black bear sat on a big black rug. Blake's black bike brake block broke. The blue bluebird blinks back boldly.",
        tip: "The 'bl' and 'br' blends require careful articulation."
      },
      {
        id: "artic-17",
        title: "The Nest",
        text: "Nine nice night nurses nursing nicely. No need to light a night-light on a light night like tonight. Ned Nott was not shot and Sam Shott was shot. Is Nott shot and Shott not?",
        tip: "The 'n' sound must remain clean and distinct."
      },
      {
        id: "artic-18",
        title: "The Frogs",
        text: "Green glass globes glow greenly. Great green grasshoppers grasp and grip the grass. Grizzly grizzly bears growl and grumble greatly. Greek grapes grow in great Greek grape groves.",
        tip: "Maintain a steady pace on the repeated 'gr' blends."
      },
      {
        id: "artic-19",
        title: "The Crab",
        text: "Crisp crusts crackle and crunch. A crunchy crab crisply cracked a crispy cracker. Quick-thinking cooks crack quite a few crisp crackers quickly. Crazy crabs crawl across craggy creek crossings.",
        tip: "The 'cr' blends require a well-positioned tongue."
      },
      {
        id: "artic-20",
        title: "Betty Botter",
        text: "Betty Botter bought some butter, but she said the butter's bitter. If I put it in my batter, it will make my batter bitter. But a bit of better butter will make my batter better.",
        tip: "Focus on smooth transitions between vowels and consonants."
      }
    ]
  },
  {
    id: "clinical-texts",
    level: 2,
    title: "Reading Aloud",
    description: "Evidence-based reading passages for controlled oral reading. Consistent with the Van Zaalen (2009) articulation rate method.",
    icon: "🩺",
    color: "from-purple-500/20 to-purple-600/10",
    isClinical: true,
    exercises: [
      {
        id: "clinical-1",
        title: "Standard Reading Passage (Narrative)",
        text: "The two women lived in a small house with green shutters, along a road in the countryside at the heart of a farming region. Since they had a narrow garden in front of the house, they grew a few vegetables. But one night, someone stole a dozen onions from them. The old mother rushed to the local constable. He noted the complaint and went on his way. She wept. All the livelihood of these unfortunate women came from that little garden they tended with care. The mother dug, while the daughter watered the plants. They lived modestly, but peacefully, in that isolated house. One day, a man visited and offered to buy their land. They refused with dignity. A few weeks later, a fire ravaged part of their garden. The neighbors ran to help them. The culprit was never found. The two women patiently rebuilt what had been destroyed. The following spring, their garden was more beautiful than ever. The vegetables grew in abundance. The onions had been replanted in double quantity. The old mother often said that adversity builds character and that nothing can stop those with the will to persevere.",
        tip: "This text is used by professionals to measure your natural speech rate. Read as you normally would, without forcing.",
        isClinical: true
      },
      {
        id: "clinical-2",
        title: "Literary Excerpt (Complex Prose)",
        text: "Although his father had imagined a brilliant future for him in the army, Henry Joncour had ended up earning his living through an unusual profession, one connected, by a singular irony, to features so amiable they betrayed a vague feminine grace. For a living, Henry Joncour bought and sold silkworms. It was eighteen sixty-one. Flaubert was writing his great novel, electric lighting was still just a hypothesis, and Abraham Lincoln, on the other side of the ocean, was fighting a war he would not see the end of. Henry Joncour was thirty-two years old, and the buying and selling of silkworms allowed him to lead a comfortable life. He lived in a small village in the south of France, in a large house at the top of a hill. From there, he could see the rooftops of the village below and the valley stretching into the distance. Each year, at the start of spring, he set out on a long journey. He crossed Europe by train, then Asia by ship and on horseback. He stayed away for several weeks, sometimes entire months. When he returned, his trunks were full of those precious tiny eggs that would be transformed into silk.",
        tip: "Complex text with elaborate sentence structures. Ideal for testing your fluency on long sentences and subordinate clauses.",
        isClinical: true
      },
      {
        id: "clinical-3",
        title: "The Fox and the Crow (Aesop)",
        text: "A crow, perched upon a tree, held a piece of cheese in its beak. A fox, drawn by the smell, spoke to the crow in roughly these words: Good day, Sir Crow! How handsome you look! How fine your feathers are! If your voice is as beautiful as your appearance, you must be the finest bird in all the forest. At these words, the crow was overcome with pride. Eager to show off his beautiful voice, he opened his beak wide and let the cheese fall. The fox snatched it up at once and said: My dear fellow, learn that every flatterer lives at the expense of the one who listens. This lesson is surely worth a piece of cheese. The crow, ashamed and humbled, swore, a little too late, that he would never be fooled again. This fable teaches us to beware of flatterers. Excessive compliments often hide ill intentions. The crow, blinded by vanity, loses his most prized possession. The moral is clear: we must keep our critical thinking when faced with praise.",
        tip: "Classic fable used to evaluate intonation and rhythm. Pay attention to dialogue and shifts in tone between the narrator and characters.",
        isClinical: true
      },
      {
        id: "clinical-4",
        title: "Scientific Text",
        text: "Photosynthesis is a fundamental bioenergetic process that allows plants, algae, and certain bacteria to synthesize organic matter using sunlight as an energy source. This chemical reaction, essential to life on Earth, takes place mainly in the chloroplasts of plant cells. The process is divided into two distinct phases. The first phase, called the light-dependent phase, occurs in the thylakoid membranes. Light energy is captured by chlorophyll molecules, which primarily absorb the red and blue wavelengths of the visible spectrum. This energy is used to split water molecules into oxygen, protons, and electrons. Oxygen is released into the atmosphere as a byproduct. The second phase, called the Calvin cycle or light-independent phase, takes place in the stroma of the chloroplast. It uses the energy stored during the light-dependent phase to fix atmospheric carbon dioxide and convert it into glucose. This sugar forms the basis of the plant's nutrition and, indirectly, of nearly all living organisms. Without photosynthesis, life as we know it would not exist on our planet.",
        tip: "Technical text to evaluate your ability to maintain a steady rate with complex scientific vocabulary. Articulate specialized terms carefully.",
        isClinical: true
      },
      {
        id: "clinical-5",
        title: "Detailed Cooking Recipe",
        text: "To make a delicious moist chocolate cake for eight people, begin by preheating your oven to three hundred and fifty degrees Fahrenheit. Meanwhile, melt seven ounces of dark baking chocolate with half a cup of butter in a double boiler or in the microwave. Stir regularly until the mixture is smooth and even. In a large bowl, mix three-quarters of a cup of powdered sugar with four whole eggs. Beat vigorously for three to four minutes until the mixture lightens in color and doubles in volume. Gently fold in the lukewarm chocolate and butter mixture, stirring from bottom to top to avoid deflating the batter. Next, add one-third of a cup of sifted flour and a pinch of salt. Mix until you have a smooth batter with no lumps. Grease and flour a nine-inch round cake pan. Pour the batter in and bake for twenty-five to thirty minutes. The cake is done when a knife inserted in the center comes out slightly moist. Let it cool for ten minutes before removing from the pan. Serve warm with a scoop of vanilla ice cream or a dollop of whipped cream. This cake keeps for three days in an airtight container at room temperature.",
        tip: "Recipe instructions test your ability to pause logically between steps. Each new action deserves a breath."
      }
    ]
  },
  {
    id: "warmup",
    level: 1,
    title: "Breathing & Preparation",
    description: "Diaphragmatic breathing and pre-speech warm-up. Proper breath support reduces rate and builds control before any practice session.",
    icon: "🏋️",
    color: "from-orange-500/20 to-amber-600/10",
    type: "warmup",
    exercises: [
      {
        id: "warmup-1",
        title: "Overwhelming Chronology",
        text: "An overwhelming and unpredictable chronology",
        tip: "Articulate the /kr/ cluster in 'chronology' and /pr/ in 'unpredictable' clearly.",
        type: "warmup"
      },
      {
        id: "warmup-2",
        title: "Exceptional Regulation",
        text: "The exceptional regulation of the laboratory",
        tip: "Watch the /ks/ in 'exceptional' and the /gl/ in 'regulation'. Project every consonant clearly.",
        type: "warmup"
      },
      {
        id: "warmup-3",
        title: "Strategic Infrastructure",
        text: "Strategic infrastructure and development",
        tip: "The /str/ and /fr/ clusters require a well-positioned tongue. Slow down on 'infrastructure'.",
        type: "warmup"
      },
      {
        id: "warmup-4",
        title: "Spectacular Multiplier",
        text: "A spectacular and inconceivable multiplier",
        tip: "Chain long words without rushing. The /nk/ in 'inconceivable' is a good challenge.",
        type: "warmup"
      },
      {
        id: "warmup-5",
        title: "Perpetually Indecipherable",
        text: "Perpetually undiscoverable and indecipherable",
        tip: "The /rp/ and /fr/ clusters are demanding. Exaggerate the articulation of every syllable.",
        type: "warmup"
      },
      {
        id: "warmup-6",
        title: "The Prestidigitator",
        text: "The prestidigitator manipulated extraordinarily fast",
        tip: "Break down 'prestidigitator' into syllables: pres-ti-dig-i-ta-tor. Do not skip any!",
        type: "warmup"
      },
      {
        id: "warmup-7",
        title: "Progressive Transformation",
        text: "The progressive transformation of the architecture",
        tip: "The clusters /tr/, /sf/, and /kt/ follow each other. Maintain a steady rate.",
        type: "warmup"
      },
      {
        id: "warmup-8",
        title: "Electrocardiogram",
        text: "A particularly complex electrocardiogram",
        tip: "Very long word! Break it down: e-lec-tro-car-di-o-gram. Every syllable counts.",
        type: "warmup"
      },
      {
        id: "warmup-9",
        title: "Incomprehensible",
        text: "Presumably incomprehensible and contradictory",
        tip: "The /pr/ cluster at the start requires good lip positioning before you begin.",
        type: "warmup"
      },
      {
        id: "warmup-10",
        title: "Structural Anthropology",
        text: "Contemporary structural anthropology",
        tip: "The clusters /tr/, /str/, and /kt/ are the core challenge. Articulate without speeding up.",
        type: "warmup"
      }
    ]
  },
  {
    id: "improvisation",
    level: 2,
    title: "Conversational Practice",
    description: "Role-play and free-speech scenarios for real-life transfer. Speak on a topic while monitoring your SPS — the hardest and most rewarding skill.",
    icon: "🎤",
    color: "from-pink-500/20 to-rose-600/10",
    type: "improvisation",
    exercises: [
      {
        id: "impro-1",
        title: "The Last Movie",
        text: "Describe the last movie you watched.",
        tip: "Structure your story: setting, plot, personal opinion. Pause between sections.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-2",
        title: "Your Last Vacation",
        text: "Describe your last vacation.",
        tip: "Use connectors: first, then, next, finally.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-3",
        title: "Explain Your Job",
        text: "Explain your job to a five-year-old.",
        tip: "Simplify your vocabulary. Short sentences are your best friends.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-4",
        title: "Your Favorite Dish",
        text: "What is your favorite dish and how do you make it?",
        tip: "List the steps calmly, as if you were reading a recipe.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-5",
        title: "A Childhood Memory",
        text: "Tell a memorable story from your childhood.",
        tip: "Emotions can speed up your rate. Stay aware.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-6",
        title: "Your Ideal Day",
        text: "Describe your ideal day from morning to night.",
        tip: "Chronology equals structure. Use it to stay organized.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-7",
        title: "A Place You Love",
        text: "Describe a place that is dear to you and explain why.",
        tip: "Describe the visuals first, then the sensations, then the emotions.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-8",
        title: "Convince a Friend",
        text: "Convince a friend to read your favorite book.",
        tip: "Persuasion requires pauses so the listener can 'think it over'.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-9",
        title: "The Room Around You",
        text: "Describe the room you are in right now.",
        tip: "Start with the big picture (shape, size) then move to details.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-10",
        title: "Superpower",
        text: "If you had a superpower, which one would you choose and why?",
        tip: "Justify your choice with concrete examples of how you would use it.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-11",
        title: "Your Best Friend",
        text: "Describe your best friend: their personality, your shared moments.",
        tip: "Personal stories trigger emotions. Slow down.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-12",
        title: "Morning vs Evening",
        text: "Are you a morning person or a night owl? Explain why.",
        tip: "Compare the two to structure your thoughts.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-13",
        title: "Your Favorite Animal",
        text: "What is your favorite animal and why does it fascinate you?",
        tip: "Describe the animal before explaining your attachment.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-14",
        title: "A Meaningful Object",
        text: "Describe an object that has sentimental value for you.",
        tip: "Tell the story behind the object, not just its physical description.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-15",
        title: "Your Favorite Season",
        text: "What is your favorite season and what do you like to do during it?",
        tip: "Use all five senses: what you see, hear, smell...",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-16",
        title: "A Hidden Talent",
        text: "Do you have a talent or passion that few people know about?",
        tip: "Explain how you discovered and developed it.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-17",
        title: "Advice to Your Past Self",
        text: "What advice would you give yourself ten years ago?",
        tip: "Structure it: the past context, the advice, why it matters.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-18",
        title: "A Useful Invention",
        text: "What everyday invention do you consider indispensable?",
        tip: "Describe the object, then explain its impact on your life.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-19",
        title: "Your Ideal Weekend",
        text: "How would you spend a perfect weekend?",
        tip: "Unfold it chronologically: Saturday morning, afternoon, evening, Sunday...",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-20",
        title: "A Recurring Dream",
        text: "Do you have a dream or aspiration that is close to your heart?",
        tip: "Talk about your deep motivations. Take your time.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-21",
        title: "At the Bakery",
        text: "You walk into a crowded bakery. Order several pastries and a cake for a birthday, specifying your choices and quantities.",
        tip: "List items calmly. The pressure of the line tempts you to speed up -- resist.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-22",
        title: "Urgent Phone Call",
        text: "You call your doctor to get an urgent appointment. Explain your symptoms clearly and answer the receptionist's questions.",
        tip: "Urgency pushes you to speak fast. Force yourself to articulate every piece of information.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-23",
        title: "Store Complaint",
        text: "You are returning a defective item to a store. Explain the problem, what you expect, and stay polite despite your frustration.",
        tip: "Anger speeds up your rate. Breathe between each argument.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-24",
        title: "Introducing Yourself",
        text: "You are at a party and someone asks what you do for a living. Introduce yourself in a clear and engaging way.",
        tip: "The other person's gaze can be intimidating. Focus on your breathing.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-25",
        title: "Giving Directions",
        text: "A tourist asks you how to get from the train station to city hall. Explain the route step by step with visual landmarks.",
        tip: "Directions require precision. Pause between each step.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-26",
        title: "Job Interview",
        text: "In an interview, you are asked: 'Tell me about yourself and your background.' Answer in a structured and convincing way.",
        tip: "High-stakes situation. Structure it: education, experience, motivation. Breathe.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-27",
        title: "Parent-Teacher Conference",
        text: "You are in a parent-teacher conference. Ask about your child's results and discuss areas for improvement.",
        tip: "Parental emotions speed up speech. Stay factual and composed.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-28",
        title: "Drive-Through Order",
        text: "You are at a fast-food drive-through. Order for the whole family, detailing each meal, the drinks, and the extras.",
        tip: "The drive-through mic creates time pressure. Articulate clearly -- they cannot see you.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-29",
        title: "Calling Emergency Services",
        text: "You witness a minor traffic accident. Call for help and describe the situation: location, number of people, what you see.",
        tip: "In an emergency, clarity saves lives. Speak slowly and distinctly.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-30",
        title: "Negotiating a Price",
        text: "You are at a flea market and want to negotiate the price of an antique piece of furniture. Argue politely to get a discount.",
        tip: "Negotiation requires confidence. Silences are your best allies.",
        type: "improvisation",
        duration: 120
      }
    ]
  },
  {
    id: "motor-challenges",
    level: 3,
    title: "Motor Challenges (Diadochokinesis)",
    description: "Rapid alternating movement (DDK) exercises used in SLP evaluations. Builds articulatory coordination and precision — referenced in ASHA cluttering assessments.",
    icon: "⚡",
    color: "from-cyan-500/20 to-teal-600/10",
    type: "repetition",
    isClinical: true,
    exercises: [
      {
        id: "motor-1",
        title: "PA - PA - PA",
        text: "PA - PA - PA - PA - PA - PA - PA - PA - PA - PA",
        tip: "Keep a steady rhythm. Each 'PA' should last the same duration.",
        type: "repetition",
        repetitions: 10
      },
      {
        id: "motor-2",
        title: "TA - TA - TA",
        text: "TA - TA - TA - TA - TA - TA - TA - TA - TA - TA",
        tip: "Your tongue should touch the palate in the same spot every time.",
        type: "repetition",
        repetitions: 10
      },
      {
        id: "motor-3",
        title: "KA - KA - KA",
        text: "KA - KA - KA - KA - KA - KA - KA - KA - KA - KA",
        tip: "The 'K' comes from the back of the throat. Project the sound forward.",
        type: "repetition",
        repetitions: 10
      },
      {
        id: "motor-4",
        title: "TA - KA Alternating",
        text: "TA - KA - TA - KA - TA - KA - TA - KA - TA - KA",
        tip: "Alternate between the front (TA) and back (KA) of the mouth.",
        type: "repetition",
        repetitions: 10
      },
      {
        id: "motor-5",
        title: "PA - TA - KA",
        text: "PA - TA - KA - PA - TA - KA - PA - TA - KA",
        tip: "The classic sequence! Three different positions: lips, front tongue, back tongue.",
        type: "repetition",
        repetitions: 9
      },
      {
        id: "motor-6",
        title: "PA - TA - KA Fast",
        text: "PATAKA - PATAKA - PATAKA - PATAKA - PATAKA",
        tip: "Chain syllables without pausing, but stay steady.",
        type: "repetition",
        repetitions: 5
      },
      {
        id: "motor-7",
        title: "BA - DA - GA",
        text: "BA - DA - GA - BA - DA - GA - BA - DA - GA",
        tip: "Voiced version of PA-TA-KA. Your vocal cords should vibrate.",
        type: "repetition",
        repetitions: 9
      },
      {
        id: "motor-8",
        title: "Buttercup Challenge",
        text: "BUT - TER - CUP - BUT - TER - CUP - BUT - TER - CUP",
        tip: "Popular English-language test. The 'R' can be rolled or not.",
        type: "repetition",
        repetitions: 9
      },
      {
        id: "motor-9",
        title: "LA - LA - LA",
        text: "LA - LA - LA - LA - LA - LA - LA - LA - LA - LA",
        tip: "The tongue touches the upper alveolar ridge. Lateral sound.",
        type: "repetition",
        repetitions: 10
      },
      {
        id: "motor-10",
        title: "MA - NA - LA",
        text: "MA - NA - LA - MA - NA - LA - MA - NA - LA",
        tip: "Three nasal and lateral consonants. Let air pass through your nose for M and N.",
        type: "repetition",
        repetitions: 9
      },
      {
        id: "motor-11",
        title: "FA - SA - CHA",
        text: "FA - SA - CHA - FA - SA - CHA - FA - SA - CHA",
        tip: "Three different fricatives. Maintain continuous airflow.",
        type: "repetition",
        repetitions: 9
      },
      {
        id: "motor-12",
        title: "RA - RA - RA",
        text: "RA - RA - RA - RA - RA - RA - RA - RA - RA - RA",
        tip: "Feel the vibration in the back of your throat. Keep each repetition even.",
        type: "repetition",
        repetitions: 10
      },
      {
        id: "motor-13",
        title: "TRA - TRA - TRA",
        text: "TRA - TRA - TRA - TRA - TRA - TRA - TRA - TRA - TRA - TRA",
        tip: "Complex consonant cluster. Do not separate the T from the R.",
        type: "repetition",
        repetitions: 10
      },
      {
        id: "motor-14",
        title: "PLA - BLA - FLA",
        text: "PLA - BLA - FLA - PLA - BLA - FLA - PLA - BLA - FLA",
        tip: "Clusters with L. The tongue must be quick and precise.",
        type: "repetition",
        repetitions: 9
      },
      {
        id: "motor-15",
        title: "GLO - GRO - BRO",
        text: "GLO - GRO - BRO - GLO - GRO - BRO - GLO - GRO - BRO",
        tip: "Rounded vowel O. Keep your lips in position.",
        type: "repetition",
        repetitions: 9
      }
    ]
  },
  {
    id: "breath-control",
    level: 2,
    title: "Phrasing & Pausing",
    description: "Short phrase technique and strategic pausing. Teach yourself to speak in breath groups — the most effective phrasing strategy for cluttering.",
    icon: "🌬️",
    color: "from-sky-500/20 to-blue-600/10",
    exercises: [
      {
        id: "breath-1",
        title: "The Dive",
        text: "Take a deep breath right now. Imagine you are diving underwater, slowly, without panic. Observe the fish, the coral, the absolute stillness. Rise gently toward the surface, exhaling all the air from your lungs. Bubbles float up around you. Sunlight streams through the clear water. You approach the surface, feeling the warmth return.",
        tip: "Try to read this text in one breath if possible. Otherwise, find the natural pauses at the commas."
      },
      {
        id: "breath-2",
        title: "Classic Poetry (Frost)",
        text: "Whose woods these are I think I know. His house is in the village though. He will not see me stopping here to watch his woods fill up with snow. My little horse must think it queer to stop without a farmhouse near between the woods and frozen lake the darkest evening of the year. The woods are lovely, dark and deep, but I have promises to keep, and miles to go before I sleep, and miles to go before I sleep.",
        tip: "Poetry has a natural rhythm. Treat commas and periods as breathing points."
      },
      {
        id: "breath-3",
        title: "The Vocal Marathon",
        text: "This is an endurance test for your voice. The goal is not to go fast, but to go the distance without running out of breath. Control your rate, pause at every comma, and make sure to finish each word before starting the next. Consistency beats speed. Imagine you are running a long-distance race. Your breathing must remain stable from start to finish. Each sentence is a steady stride toward the finish line.",
        tip: "Imagine you are running a marathon. Conserve your breath."
      },
      {
        id: "breath-4",
        title: "The Long Description",
        text: "The house stood at the end of the lane, surrounded by tall ancient trees whose branches formed a natural canopy above the gravel path. The green shutters, slightly peeled by time, contrasted with the honey-colored stone walls. Wisteria climbed along the facade, offering its purple clusters to the June sun. The garden stretched as far as the eye could see, dotted with old rose bushes and fragrant lavender. At the far end, an old fountain murmured its eternal song.",
        tip: "Long descriptions test your ability to maintain the listener's attention."
      },
      {
        id: "breath-5",
        title: "The Science Report",
        text: "The water cycle consists of several essential stages. Evaporation transforms liquid water into vapor. This vapor rises into the atmosphere, where it cools and condenses into clouds. Precipitation then brings the water back to the earth's surface, where it seeps into the soil or flows into rivers. Rivers join larger waterways, which empty into the oceans. The sun warms the oceans, and the cycle begins again endlessly.",
        tip: "Informative texts require clarity and consistency. Each sentence delivers one piece of information."
      },
      {
        id: "breath-6",
        title: "The Autumn Wind",
        text: "The autumn wind blows through the trees. Golden leaves break free one by one, flutter in the cool air, and settle gently on the ground. Some spin a long time before finding their place. Others fall straight down, as if weary from the journey. The wind continues its race through the park. It makes the branches dance, whistles between the trunks, and carries away the last warmth of summer. Autumn settles in quietly, with its warm colors and its soothing melancholy.",
        tip: "Let your voice follow the movement of the wind: sometimes strong, sometimes soft."
      },
      {
        id: "breath-7",
        title: "The Love Letter",
        text: "My heart overflows with words I do not always know how to express. Every day spent away from you feels like an eternity. I think of your smile when I wake in the morning. I think of your voice that reassures me in moments of doubt. You are my light when everything seems dark. You are my calm when the storm rages. I wish I could say all of this to your face, but the words rush together and my voice trembles. So I write to you, letter after letter, so that you know how much you mean to me. Every sentence is a beat of my heart.",
        tip: "Emotions can speed up your rate. Stay in control so each word carries weight."
      },
      {
        id: "breath-8",
        title: "The Year-End Speech",
        text: "Dear colleagues, dear friends, here we are gathered to celebrate an exceptional year. Together, we have overcome challenges we once thought insurmountable. Together, we have reached ambitious goals. I want to thank each and every one of you for your commitment, your creativity, and your perseverance. The months ahead hold new challenges, but I know we will face them with the same energy. Our strength lies in our ability to work together, to support one another. I am proud to be part of this team. Let us raise a toast to our past accomplishments and our future successes.",
        tip: "A speech requires endurance. Manage your breath to last until the very end."
      },
      {
        id: "breath-9",
        title: "The Children's Story",
        text: "Once upon a time, in a faraway kingdom, there lived a little princess who did not like to sleep. Every evening, she found an excuse to stay awake. She would ask for a glass of water, then a story, then a song. Her parents, the king and queen, did not know what to do. One day, a kind fairy came to visit them. She gave the princess a magical dream, so beautiful that she could not wait to fall asleep to find it again. From that day on, the little princess falls peacefully asleep each night, with a smile on her face.",
        tip: "Stories should be read with gentleness and consistency. Your voice should lull the child."
      },
      {
        id: "breath-10",
        title: "Classic Recitation",
        text: "To be, or not to be, that is the question: whether it is nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles, and by opposing end them. To die, to sleep, no more; and by a sleep to say we end the heartache and the thousand natural shocks that flesh is heir to. It is a consummation devoutly to be wished. To die, to sleep; to sleep, perchance to dream.",
        tip: "Classic verse demands a sustained rhythm. Breathe at the natural pauses."
      }
    ]
  },
  {
    id: "cognitive-traps",
    level: 3,
    title: "Cognitive Traps",
    description: "Texts designed to trip up fast readers. Rhythm changes, numbers, and tricky words.",
    icon: "🧠",
    color: "from-amber-500/20 to-yellow-600/10",
    exercises: [
      {
        id: "trap-1",
        title: "The Speed Trap",
        text: "Warning, this sentence is about to change speed. Sometimes it is slow. And suddenly it speeds up to see if you can keep up! But you must keep, absolutely, control, of, the, rhythm. Always. Even when the text tries to make you rush. Stay in charge of your reading.",
        tip: "Do not let the text carry you away. YOU control the tempo, not it."
      },
      {
        id: "trap-2",
        title: "The Numbers",
        text: "Counting requires precision. 1984, 2023, 3310, 555. Numbers break the natural rhythm of reading. Say: nineteen eighty-four, two thousand twenty-three, three thousand three hundred ten, five hundred fifty-five. Be careful with the transitions.",
        tip: "Pronounce every number in full words, slowly and distinctly."
      },
      {
        id: "trap-3",
        title: "The Job Interview",
        text: "Hello, I am here to apply for the project manager position. I am a dynamic, organized, and highly motivated person. I have managed teams of ten people for five years. My greatest strength? Listening. My biggest weakness? I can be too much of a perfectionist. In summary, I believe I am the ideal candidate for this exciting role.",
        tip: "Under stress, you tend to speed up. Practice to stay calm on the big day."
      },
      {
        id: "trap-4",
        title: "The Speed Shift",
        text: "Read this text at a normal pace. Now read more slowly. Even more slowly. Then speed up slightly. Return to normal. The goal is to consciously vary your speed without losing clarity. You are the conductor of your own voice.",
        tip: "This exercise teaches you to modulate your rate at will."
      },
      {
        id: "trap-5",
        title: "Homophones",
        text: "Their friends went there to pick up their things over there. To write the right rite is a writer's right. I knew the new gnu knew a new knot. The bare bear could not bear the blare. The knight knew a new knight at night. The flour flower flowered in the flower flour.",
        tip: "Homophones trick the brain. Articulate clearly to differentiate the sounds."
      },
      {
        id: "trap-6",
        title: "Rapid-Fire Q and A",
        text: "What is your name? My name is John Smith. What is your address? I live at 15 Oak Street in Portland. Your phone number? It is 503-555-1234. Your date of birth? March 3rd, 1985. Your nationality? American. Your family status? Married, two children.",
        tip: "Personal information often comes out too fast. Slow down on the details."
      },
      {
        id: "trap-7",
        title: "Double Negatives",
        text: "I am not saying I do not want to. It is not that it is not good. It is not impossible that he will not come. She did not say she did not know. We do not think we cannot do it. Double negatives deceive both the ear and the mind.",
        tip: "Multiple negatives are classic traps. Read every single word."
      },
      {
        id: "trap-8",
        title: "Acronyms",
        text: "NASA works alongside the FBI and the CIA. The CEO of this SMB earned his MBA at MIT. The GDP affects the GNP and the CPI. ASAP, the HR team needs the KPIs for the Q3 ROI report. Every acronym must be spelled out clearly.",
        tip: "Spell each letter distinctly without speeding up between acronyms."
      },
      {
        id: "trap-9",
        title: "The Official Form",
        text: "Last name: Smith. First name: Marie. Date of birth: January 15, 1990. Place of birth: Portland, Oregon. Current address: 42 Elm Street, Apartment 3B, New York, NY 10001. Social Security Number: redacted. File reference: AB-2024-00567.",
        tip: "Administrative data requires perfect diction. Every number counts."
      },
      {
        id: "trap-10",
        title: "Look-Alike Words",
        text: "Affect and effect. Accept and except. Dessert and desert. Compliment and complement. Eminent and imminent. These words look alike but their meanings differ greatly. The confusion comes from speed. Slow down to pronounce them correctly.",
        tip: "Near-homophones (words that look or sound alike) trip up rushed speakers."
      },
      {
        id: "trap-11",
        title: "The Long List",
        text: "I need: apples, pears, bananas, oranges, lemons, tangerines, kiwis, mangoes, pineapples, strawberries, raspberries, blueberries, blackcurrants, gooseberries, cherries, apricots, peaches, nectarines, plums, and melons. Twenty fruits not to forget.",
        tip: "Long lists push you to speed up. Keep the same pace from the first word to the last."
      },
      {
        id: "trap-12",
        title: "Linking Sounds",
        text: "An apple a day. An old oak tree. I am always aware. It is an honor. The elephants entered eagerly. She ate an orange. We are all arriving early. These animals are absolutely adorable. An enormous elephant. An interesting idea.",
        tip: "Smooth linking between vowels is essential. Pronounce each connection without swallowing sounds."
      }
    ]
  },
  {
    id: "auto-controle",
    level: 2,
    title: "Self-Monitoring",
    description: "Practice without real-time feedback. Develop your internal ear for rate — the clinician's ultimate goal for carryover into daily speech.",
    icon: "🎧",
    color: "from-indigo-500/20 to-violet-600/10",
    type: "proprioception",
    exercises: [
      {
        id: "proprio-1",
        title: "Describe Your Home",
        text: "Describe the place where you live: the rooms, the decor, what you like about it.",
        tip: "Close your eyes and focus on the sensations of your speech muscles.",
        type: "proprioception"
      },
      {
        id: "proprio-2",
        title: "Your Last Vacation",
        text: "Talk about your last vacation: where, with whom, your best memories.",
        tip: "Listen to your inner voice to maintain your target pace.",
        type: "proprioception"
      },
      {
        id: "proprio-3",
        title: "Your Day Yesterday",
        text: "Describe in detail what you did yesterday, from waking up to going to bed.",
        tip: "Chronology helps you structure your speech without speeding up.",
        type: "proprioception"
      },
      {
        id: "proprio-4",
        title: "Your Favorite Meal",
        text: "What is your favorite dish? Describe it and explain how to prepare it.",
        tip: "Recipe steps impose a natural rhythm.",
        type: "proprioception"
      },
      {
        id: "proprio-5",
        title: "Your Work or Studies",
        text: "Explain what you do in your work or studies on a daily basis.",
        tip: "Simplify as if you were speaking to someone unfamiliar with your field.",
        type: "proprioception"
      },
      {
        id: "proprio-6",
        title: "Your Ideal Weekend",
        text: "Describe your perfect weekend: activities, places, people.",
        tip: "Imagination can speed up your rate. Stay grounded in your sensations.",
        type: "proprioception"
      },
      {
        id: "proprio-7",
        title: "A Treasured Object",
        text: "Describe an object you cherish and tell its story.",
        tip: "Emotions can speed you up. Use them as a warning signal.",
        type: "proprioception"
      },
      {
        id: "proprio-8",
        title: "The Trip Here",
        text: "Describe how you got here today, step by step.",
        tip: "A chronological account naturally structures your speech.",
        type: "proprioception"
      },
      {
        id: "proprio-9",
        title: "Your Favorite Show or Movie",
        text: "Talk about your favorite show or movie: the story, why you love it.",
        tip: "Enthusiasm often speeds things up. Monitor your internal rhythm.",
        type: "proprioception"
      },
      {
        id: "proprio-10",
        title: "A Project You Have",
        text: "Describe a personal or professional project you are working on.",
        tip: "Explaining a project requires organization. Take your time.",
        type: "proprioception"
      }
    ]
  },
  {
    id: "rebus-enfant",
    level: 0,
    title: "Kids Mode (Picture Stories) 🧒",
    description: "Emoji-based exercises for non-readers ages 4-7. Fun, visual, and effective.",
    icon: "🖼️",
    color: "from-yellow-400/20 to-orange-400/10",
    type: "rebus" as ExerciseType,
    exercises: [
      // --- Funny Animals ---
      {
        id: "rebus-1",
        title: "The Hungry Cow",
        text: "The cow eats an ice cream.",
        tip: "Take a big pause at every orange bar! Breathe in deeply.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "The cow", emoji: "🐄", pause_after: true },
          { segment: "eats", emoji: "😋", pause_after: true },
          { segment: "an ice cream", emoji: "🍦", pause_after: false }
        ]
      },
      {
        id: "rebus-2",
        title: "The Tired Robot",
        text: "The robot sleeps in the garage.",
        tip: "Speak slowly like a robot falling asleep. Pause at the bars!",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "The robot", emoji: "🤖", pause_after: true },
          { segment: "sleeps", emoji: "😴", pause_after: true },
          { segment: "in the garage", emoji: "🏠", pause_after: false }
        ]
      },
      {
        id: "rebus-3",
        title: "The Magic Candle",
        text: "I blow very hard on the candle.",
        tip: "When you see the candle, really blow! It is a breathing exercise.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "I blow", emoji: "💨", pause_after: true },
          { segment: "very hard", emoji: "💪", pause_after: true },
          { segment: "on the candle", emoji: "🕯️", pause_after: false }
        ]
      },
      {
        id: "rebus-4",
        title: "The Musical Cat",
        text: "The cat plays the guitar under the moon.",
        tip: "Imagine a cat strumming its guitar! Pause between each picture.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "The cat", emoji: "🐱", pause_after: true },
          { segment: "plays the guitar", emoji: "🎸", pause_after: true },
          { segment: "under the moon", emoji: "🌙", pause_after: false }
        ]
      },
      {
        id: "rebus-5",
        title: "The Dog at the Park",
        text: "The dog runs after the ball in the park.",
        tip: "Say each part nice and loud, then breathe at the bars!",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "The dog", emoji: "🐕", pause_after: true },
          { segment: "runs after", emoji: "🏃", pause_after: true },
          { segment: "the ball", emoji: "⚽", pause_after: true },
          { segment: "in the park", emoji: "🌳", pause_after: false }
        ]
      },
      {
        id: "rebus-6",
        title: "The Flying Fish",
        text: "The fish jumps out of the water and flies in the sky.",
        tip: "A fish that flies -- how funny! Breathe well between pictures.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "The fish", emoji: "🐟", pause_after: true },
          { segment: "jumps out of the water", emoji: "💦", pause_after: true },
          { segment: "and flies", emoji: "🦅", pause_after: true },
          { segment: "in the sky", emoji: "☁️", pause_after: false }
        ]
      },
      {
        id: "rebus-7",
        title: "The Hungry Bear",
        text: "The bear eats honey with a spoon.",
        tip: "Mmm honey! Speak softly and breathe at the bars.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "The bear", emoji: "🐻", pause_after: true },
          { segment: "eats honey", emoji: "🍯", pause_after: true },
          { segment: "with a spoon", emoji: "🥄", pause_after: false }
        ]
      },
      // --- Daily Life ---
      {
        id: "rebus-8",
        title: "Morning at School",
        text: "At eight o'clock the boy goes to school.",
        tip: "Tell your morning picture by picture. Pause at the bars!",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "At eight o'clock", emoji: "🕗", pause_after: true },
          { segment: "the boy goes", emoji: "🚶", pause_after: true },
          { segment: "to school", emoji: "🏫", pause_after: false }
        ]
      },
      {
        id: "rebus-9",
        title: "Breakfast",
        text: "I drink milk and I eat a muffin.",
        tip: "Yum! Say each part slowly. Breathe well.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "I drink", emoji: "🥛", pause_after: true },
          { segment: "some milk", emoji: "🥛", pause_after: true },
          { segment: "and I eat", emoji: "😋", pause_after: true },
          { segment: "a muffin", emoji: "🥐", pause_after: false }
        ]
      },
      {
        id: "rebus-10",
        title: "Morning Shower",
        text: "I take my shower and I put on my clothes.",
        tip: "Each morning step, one by one. Breathe between pictures!",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "I take", emoji: "🚿", pause_after: true },
          { segment: "my shower", emoji: "🧼", pause_after: true },
          { segment: "and I put on", emoji: "👕", pause_after: true },
          { segment: "my clothes", emoji: "👖", pause_after: false }
        ]
      },
      {
        id: "rebus-11",
        title: "Bedtime",
        text: "At night I put on my pajamas and I sleep in my bed.",
        tip: "Whisper like it is bedtime. Soft pauses at the bars.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "At night", emoji: "🌙", pause_after: true },
          { segment: "I put on my pajamas", emoji: "👕", pause_after: true },
          { segment: "and I sleep", emoji: "😴", pause_after: true },
          { segment: "in my bed", emoji: "🛏️", pause_after: false }
        ]
      },
      // --- Funny Stories ---
      {
        id: "rebus-12",
        title: "The Dinosaur in the City",
        text: "The dinosaur walks down the street and eats a pizza.",
        tip: "A dinosaur eating pizza! So funny. Breathe well.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "The dinosaur", emoji: "🦕", pause_after: true },
          { segment: "walks down the street", emoji: "🏙️", pause_after: true },
          { segment: "and eats", emoji: "😋", pause_after: true },
          { segment: "a pizza", emoji: "🍕", pause_after: false }
        ]
      },
      {
        id: "rebus-13",
        title: "The Astronaut Princess",
        text: "The princess gets in the rocket and goes to the moon.",
        tip: "Three, two, one, blast off! Say each part clearly.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "The princess", emoji: "👸", pause_after: true },
          { segment: "gets in the rocket", emoji: "🚀", pause_after: true },
          { segment: "and goes", emoji: "✨", pause_after: true },
          { segment: "to the moon", emoji: "🌕", pause_after: false }
        ]
      },
      {
        id: "rebus-14",
        title: "The Pirate and the Treasure",
        text: "The pirate sails across the sea and finds a treasure.",
        tip: "Arrr! Talk like a pirate, but slowly. Breathe at the bars!",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "The pirate", emoji: "🏴‍☠️", pause_after: true },
          { segment: "sails across the sea", emoji: "⛵", pause_after: true },
          { segment: "and finds", emoji: "🔍", pause_after: true },
          { segment: "a treasure", emoji: "💎", pause_after: false }
        ]
      },
      {
        id: "rebus-15",
        title: "The Friendly Monster",
        text: "The monster gives the bunny a hug and a cake.",
        tip: "A friendly monster! Speak softly like him.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "The monster", emoji: "👾", pause_after: true },
          { segment: "gives a hug", emoji: "🤗", pause_after: true },
          { segment: "to the bunny", emoji: "🐰", pause_after: true },
          { segment: "and gives a cake", emoji: "🎂", pause_after: false }
        ]
      },
      // --- Weather and Nature ---
      {
        id: "rebus-16",
        title: "It Is Raining!",
        text: "It is raining outside and I grab my umbrella.",
        tip: "Drip drop! Breathe between each picture like between raindrops.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "It is raining", emoji: "🌧️", pause_after: true },
          { segment: "outside", emoji: "🏡", pause_after: true },
          { segment: "and I grab", emoji: "✋", pause_after: true },
          { segment: "my umbrella", emoji: "☂️", pause_after: false }
        ]
      },
      {
        id: "rebus-17",
        title: "The Sun Shines",
        text: "The sun shines and the flowers grow in the garden.",
        tip: "Think about the warm bright sun. Take your time at each picture.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "The sun shines", emoji: "☀️", pause_after: true },
          { segment: "and the flowers", emoji: "🌸", pause_after: true },
          { segment: "grow", emoji: "🌱", pause_after: true },
          { segment: "in the garden", emoji: "🏡", pause_after: false }
        ]
      },
      {
        id: "rebus-18",
        title: "The Snow Falls",
        text: "The snow falls and I make a snowman.",
        tip: "Brrr! Speak softly like the snowflakes falling.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "The snow falls", emoji: "❄️", pause_after: true },
          { segment: "and I make", emoji: "⛏️", pause_after: true },
          { segment: "a snowman", emoji: "⛄", pause_after: false }
        ]
      },
      {
        id: "rebus-19",
        title: "The Rainbow",
        text: "After the rain there is a rainbow in the sky.",
        tip: "The colors of the rainbow! Breathe between each picture.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "After the rain", emoji: "🌧️", pause_after: true },
          { segment: "there is a rainbow", emoji: "🌈", pause_after: true },
          { segment: "in the sky", emoji: "☁️", pause_after: false }
        ]
      },
      // --- Transportation ---
      {
        id: "rebus-20",
        title: "The Fast Train",
        text: "The train goes fast on the tracks and arrives at the station.",
        tip: "Choo choo! But remember, YOU speak slo-o-owly.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "The train", emoji: "🚂", pause_after: true },
          { segment: "goes fast", emoji: "💨", pause_after: true },
          { segment: "on the tracks", emoji: "🛤️", pause_after: true },
          { segment: "and arrives at the station", emoji: "🏛️", pause_after: false }
        ]
      },
      {
        id: "rebus-21",
        title: "The Plane in the Clouds",
        text: "The plane takes off and flies above the clouds.",
        tip: "We are taking off! Say each part calmly.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "The plane", emoji: "✈️", pause_after: true },
          { segment: "takes off", emoji: "🛫", pause_after: true },
          { segment: "and flies above", emoji: "🦅", pause_after: true },
          { segment: "the clouds", emoji: "☁️", pause_after: false }
        ]
      },
      {
        id: "rebus-22",
        title: "Dad's Bicycle",
        text: "Dad rides his bicycle in the park with me.",
        tip: "Pedal slowly in your head! Pause at the bars.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Dad", emoji: "👨", pause_after: true },
          { segment: "rides his bicycle", emoji: "🚲", pause_after: true },
          { segment: "in the park", emoji: "🌳", pause_after: true },
          { segment: "with me", emoji: "👦", pause_after: false }
        ]
      },
      // --- Emotions ---
      {
        id: "rebus-23",
        title: "I Am Happy",
        text: "I am happy because it is my birthday.",
        tip: "Smile while you speak! Breathe well between pictures.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "I am happy", emoji: "😊", pause_after: true },
          { segment: "because", emoji: "💭", pause_after: true },
          { segment: "it is my birthday", emoji: "🎂", pause_after: false }
        ]
      },
      {
        id: "rebus-24",
        title: "I Am a Little Scared",
        text: "I am a little scared of the dark but my lamp helps me.",
        tip: "It is okay to be scared. Speak softly, it helps.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "I am a little scared", emoji: "😨", pause_after: true },
          { segment: "of the dark", emoji: "🌑", pause_after: true },
          { segment: "but my lamp", emoji: "💡", pause_after: true },
          { segment: "helps me", emoji: "😌", pause_after: false }
        ]
      },
      {
        id: "rebus-25",
        title: "I Am Angry",
        text: "I am angry but I breathe and I calm down.",
        tip: "Breathe in deeply at each bar. It really helps!",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "I am angry", emoji: "😠", pause_after: true },
          { segment: "but I breathe", emoji: "🌬️", pause_after: true },
          { segment: "and I calm down", emoji: "😌", pause_after: false }
        ]
      },
      // --- Food ---
      {
        id: "rebus-26",
        title: "The Fruit Salad",
        text: "I cut an apple a banana and an orange for the salad.",
        tip: "Yum! Name each fruit slowly.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "I cut", emoji: "🔪", pause_after: true },
          { segment: "an apple", emoji: "🍎", pause_after: true },
          { segment: "a banana", emoji: "🍌", pause_after: true },
          { segment: "and an orange", emoji: "🍊", pause_after: true },
          { segment: "for the salad", emoji: "🥗", pause_after: false }
        ]
      },
      {
        id: "rebus-27",
        title: "The Chocolate Cake",
        text: "Mom makes a chocolate cake in the kitchen.",
        tip: "Mmm the yummy cake! Speak slowly to really taste the chocolate.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Mom", emoji: "👩", pause_after: true },
          { segment: "makes a cake", emoji: "🎂", pause_after: true },
          { segment: "with chocolate", emoji: "🍫", pause_after: true },
          { segment: "in the kitchen", emoji: "🍳", pause_after: false }
        ]
      },
      // --- Breathing and Blowing ---
      {
        id: "rebus-28",
        title: "Soap Bubbles",
        text: "I blow gently and I make big bubbles.",
        tip: "Really blow when you see the bubbles! Breathing exercise.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "I blow", emoji: "💨", pause_after: true },
          { segment: "gently", emoji: "🐢", pause_after: true },
          { segment: "and I make", emoji: "✨", pause_after: true },
          { segment: "big bubbles", emoji: "🫧", pause_after: false }
        ]
      },
      {
        id: "rebus-29",
        title: "The Balloon",
        text: "I blow up a big red balloon and it flies away.",
        tip: "Puff up your cheeks at each bar! Then speak.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "I blow up", emoji: "💨", pause_after: true },
          { segment: "a big balloon", emoji: "🎈", pause_after: true },
          { segment: "that is red", emoji: "🔴", pause_after: true },
          { segment: "and it flies away", emoji: "🕊️", pause_after: false }
        ]
      },
      {
        id: "rebus-30",
        title: "Wind in the Trees",
        text: "The wind blows through the trees and the leaves fly.",
        tip: "Make the wind sound at each pause! Shhhh...",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "The wind blows", emoji: "🌬️", pause_after: true },
          { segment: "through the trees", emoji: "🌳", pause_after: true },
          { segment: "and the leaves", emoji: "🍂", pause_after: true },
          { segment: "fly away", emoji: "🍃", pause_after: false }
        ]
      },
      {
        id: "rebus-31",
        title: "I Am Happy",
        text: "I am happy because it is my birthday.",
        tip: "Show your biggest smile at each pause!",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "I am happy", emoji: "😊", pause_after: true },
          { segment: "because", emoji: "🎉", pause_after: true },
          { segment: "it is my birthday", emoji: "🎂", pause_after: false }
        ]
      },
      {
        id: "rebus-32",
        title: "The Kind Doctor",
        text: "The doctor listens to my heart with a stethoscope.",
        tip: "Put your hand on your heart and speak softly.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "The doctor", emoji: "👨‍⚕️", pause_after: true },
          { segment: "listens to my heart", emoji: "❤️", pause_after: true },
          { segment: "with a stethoscope", emoji: "🩺", pause_after: false }
        ]
      },
      {
        id: "rebus-33",
        title: "The Angry Lion",
        text: "The lion is angry and he roars very loud.",
        tip: "Roar like a lion, but not too fast!",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "The lion is angry", emoji: "🦁", pause_after: true },
          { segment: "and he roars", emoji: "😡", pause_after: true },
          { segment: "very loud", emoji: "🔊", pause_after: false }
        ]
      },
      {
        id: "rebus-34",
        title: "The Crying Baby",
        text: "The baby cries and mom gives a big hug.",
        tip: "Speak very softly, like you are comforting the baby.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "The baby cries", emoji: "👶", pause_after: true },
          { segment: "and mom", emoji: "😢", pause_after: true },
          { segment: "gives a big hug", emoji: "🤗", pause_after: false }
        ]
      },
      {
        id: "rebus-35",
        title: "The Happy Dance",
        text: "I turn on the music and I dance in the living room.",
        tip: "Sway gently as you speak, like you are dancing!",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "I turn on the music", emoji: "🎵", pause_after: true },
          { segment: "and I dance", emoji: "💃", pause_after: true },
          { segment: "in the living room", emoji: "🛋️", pause_after: false }
        ]
      }
    ]
  },
  {
    id: "teen-life",
    level: 2,
    title: "Teen Scenarios",
    description: "Free-speech scenarios for ages 12-18. No script to read: real-life situations where you simply talk.",
    icon: "⚡",
    color: "from-orange-500/20 to-orange-600/10",
    type: "improvisation" as ExerciseType,
    exercises: [
      {
        id: "teen-1",
        title: "The Big Game",
        text: "You just witnessed an incredible sports moment: a final, a nail-biter, a dramatic comeback. Retell what happened as if you were reliving it. Describe the field, the atmosphere, your emotions. Build the tension all the way to the final play.",
        tip: "Build tension gradually. Speed up during the action, slow down on the emotion.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-2",
        title: "First Day at a New School",
        text: "It's the first day at a brand-new school. You don't know anyone. Describe your day: the commute, arriving at the building, finding your classroom, your first interaction with someone. How you felt and how the day ended.",
        tip: "Tell it as if you were talking to a friend that same evening. Natural and relaxed.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-3",
        title: "The Camping Trip",
        text: "You're telling someone about a camping night with friends. Describe the preparations, the drive, setting up camp, the campfire, the conversations under the stars. Bring the atmosphere and emotions to life.",
        tip: "Alternate between action passages and calm moments. The contrast creates atmosphere.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-4",
        title: "The Concert",
        text: "You just got back from a concert or show that really hit you. Tell the whole story: the wait, walking into the venue, the moment the music started, the vibe, your favorite moments. Make the listener feel the energy.",
        tip: "Let the atmosphere come through in your voice. Quiet passages contrast with intense moments.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-5",
        title: "The Class Debate",
        text: "Your teacher launches a debate on a social issue you care about. Pick a side and defend your point of view with structured arguments. Also try to respond to an objection someone might raise.",
        tip: "Each new idea deserves a pause before you develop it. Structure: argument, example, conclusion.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-6",
        title: "Sunday Recipe",
        text: "You're explaining to a friend how to make your favorite dish or dessert. List the ingredients, the quantities, and every step of the preparation. Be precise enough that they can follow your instructions.",
        tip: "State quantities clearly. Each step is its own sentence.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-7",
        title: "The Road Trip",
        text: "You're telling someone about a road trip or train ride with friends or family. Describe the departure, the stops, the passing scenery, the funny or unexpected moments. Where were you going and how did it turn out?",
        tip: "Lists give rhythm; descriptions require slowing down.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-8",
        title: "The Oral Presentation",
        text: "You're giving a presentation in front of a panel. Present a topic you're passionate about in three parts: what it is, why it interests you, and what you've done or learned in that field. Wrap up and offer to take questions.",
        tip: "Structure your presentation with clear pauses between each part. Talk to the audience, not your notes.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-9",
        title: "The Podcast",
        text: "You're recording a podcast episode about something that matters to you: school pressure, friendship, sports, or anything else. Share your opinion, give examples from your life, and ask an open-ended question to your listeners.",
        tip: "Use a conversational tone, as if you were speaking into a mic. Questions are natural pauses.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-10",
        title: "The Sports Challenge",
        text: "You set yourself a sports challenge: a race, a training program, a goal to reach. Tell about your preparation, the effort, the moments you wanted to quit, and how you pushed through. How did you feel at the end?",
        tip: "Let the effort come through in your voice: slow down on the hard parts, pick up momentum when you find new motivation.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-impro-1",
        title: "Ordering at a Fast-Food Counter",
        text: "You're at the counter of a packed fast-food restaurant. Behind you, the line is growing and people are getting impatient. You need to order for yourself and three friends, detailing each meal, the extras, and the drinks. Speak clearly so the cashier gets it right the first time.",
        tip: "Organize your order mentally before speaking. Detail each item calmly, without letting the line rush you.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-impro-2",
        title: "Explaining Why You're Late to Class",
        text: "You walk into class fifteen minutes late. The teacher looks at you and waits for an explanation. You need to come up with a believable excuse and tell it convincingly, with specific details. Watch out -- the teacher asks follow-up questions to check your story.",
        tip: "Keep a calm, confident tone. Details make the story credible, but don't overdo it.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-impro-3",
        title: "Convincing Your Parents",
        text: "You want to go to a party at a friend's house this weekend, but your parents are hesitant. You need to convince them with the right arguments: who will be there, how you'll get home, why it matters to you. Anticipate their objections and address them.",
        tip: "Start by showing you understand their concerns before presenting your arguments. Empathy is the key to persuasion.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-impro-4",
        title: "Introducing Yourself to a New Group",
        text: "It's the first day at a new school, or you're joining a sports club. You don't know anyone. A group of students is chatting, and one of them asks you to introduce yourself. Say who you are, where you're from, what you're into, and ask them questions to start connecting.",
        tip: "Be natural, smile, and show curiosity about others. The perfect introduction doesn't exist -- what matters is being authentic.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-impro-5",
        title: "Telling About Your Weekend",
        text: "It's Monday morning and a friend asks what you did over the weekend. Describe your weekend in detail: the activities, the people you saw, the funny or unexpected moments. Bring the story to life with descriptions and bits of dialogue.",
        tip: "Structure your story chronologically. Small details and reported dialogue make the story come alive.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-11",
        title: "Calling About a Summer Job",
        text: "You're calling a shop or restaurant to ask if they're hiring for the summer. Introduce yourself, explain your availability, your motivation, and ask questions about the position. Be polite and professional.",
        tip: "Mentally prepare your key sentences before 'picking up the phone.' A calm tone inspires confidence.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-12",
        title: "Explaining Game Rules",
        text: "You need to explain the rules of a board game or card game to someone who has never played. Be clear, logical, and give examples so the other person understands without having to read the rulebook.",
        tip: "Go from simplest to most complex. Make sure each step is understood before moving to the next.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-13",
        title: "Describing a Movie",
        text: "You just watched a movie or show that really stuck with you. Tell the story without too many spoilers, explain what you liked or didn't, and say whether you'd recommend it or not.",
        tip: "Organize your thoughts: the pitch in two sentences, then your opinion. Avoid summarizing scene by scene.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-14",
        title: "Asking a Neighbor for a Favor",
        text: "You ring the doorbell of a neighbor you barely know to ask for a favor: borrow a tool, pick up a package, watch a pet for the weekend. Explain your situation and make your request politely.",
        tip: "Start by introducing yourself and explaining the context. Politeness and clarity go a long way.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-15",
        title: "A Childhood Memory",
        text: "Choose a childhood memory that's close to your heart: a vacation, a birthday, a moment with your grandparents. Tell it with sensory details: the smells, the sounds, the colors. Bring that moment back to life.",
        tip: "Sensory details make the story vivid. Take your time on the images that matter.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-16",
        title: "Giving Street Directions",
        text: "A passerby asks you how to get to the train station, city hall, or somewhere you know well. Give them precise directions: the street names, visual landmarks, and approximate distances.",
        tip: "Use concrete landmarks (the traffic light, the bakery) rather than abstract directions.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-17",
        title: "Introducing Your Pet",
        text: "You are introducing your pet (real or imaginary) to someone: its name, breed, personality, habits, and a funny or heartwarming story about it. If you do not have one, describe the pet you would love to have and why.",
        tip: "Concrete anecdotes bring the description to life. Avoid dry lists of characteristics.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-18",
        title: "Clearing Up a Misunderstanding",
        text: "A friend thinks you said something mean about them, but it was a misunderstanding. Calmly explain what actually happened, show that you understand why they might have misread the situation, and offer to sort things out.",
        tip: "Stay calm and stick to the facts. Acknowledge the other person's feelings before sharing your side of the story.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-19",
        title: "Choosing a Vacation Destination",
        text: "Your family asks you to pick the destination for the next family vacation and justify your choice. Suggest a place, explain what you could do there, why it would appeal to everyone, and how you would organize the trip.",
        tip: "Structure your pitch: the destination, the activities, and the reasons it works for every family member.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-20",
        title: "A Travel Disaster Story",
        text: "You lived through a chaotic commute: a late bus, a missed connection, a flat tire, a GPS sending you the wrong way. Recount the chain of events and how you eventually got it sorted out.",
        tip: "The humor comes from the build-up. String the mishaps together with good timing and rhythm.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-21",
        title: "Explaining a Passion",
        text: "Someone asks why you spend so much time on your passion — music, drawing, sports, reading, building things. Explain what you get out of it, how you got started, and what it brings to your daily life.",
        tip: "Speak from the heart. What people find interesting is your enthusiasm, not the technical details.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-22",
        title: "Scheduling a Medical Appointment",
        text: "You are calling a doctor's or dentist's office to make an appointment. Explain the reason for your visit, offer your availability, and write down the information you are given — the date, time, and anything you need to bring.",
        tip: "Prepare the key details before you call. Speak clearly and do not hesitate to ask them to repeat something.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-23",
        title: "Defending a Career Choice",
        text: "Your parents or a teacher ask why you want to pursue a certain program or profession. Explain what draws you to it, what you know about the path ahead, and why you think it is right for you. Anticipate the doubts they might raise.",
        tip: "Show that you have done your research. A well-argued choice is always more convincing than a simple 'I just like it.'",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-24",
        title: "Planning a Birthday Party",
        text: "You are organizing a surprise birthday party for a friend. Explain your plan to a co-conspirator: the venue, the guests, the cake, the activities, and how to keep the secret. Walk through every step of the planning.",
        tip: "Be methodical: who does what, when, and where. Good organizers are the ones who plan for the unexpected.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-25",
        title: "Filing a Polite Complaint",
        text: "You bought something online and the product does not match the description. You call customer service to explain the problem and request an exchange or refund, all while staying polite.",
        tip: "Describe the problem factually, without pointing fingers. Polite language gets better results.",
        type: "improvisation" as ExerciseType
      }
    ]
  },
  {
    id: "retelling",
    level: 4,
    title: "Story Recap",
    description: "Listen to a short story, then retell it from memory. An algorithm evaluates whether you covered the key points concisely.",
    icon: "📖",
    color: "from-emerald-500/20 to-teal-600/10",
    type: "retelling" as ExerciseType,
    exercises: [
      {
        id: "retelling-1",
        title: "The Lost Wallet",
        text: "Yesterday morning, a man was walking down the street when he noticed a wallet on the ground near a bench. He picked it up and found inside an ID card, some cash, and a family photo. Rather than keeping it, he went straight to the neighborhood police station. The officer recorded the information and contacted the owner. An hour later, the owner came to pick up his wallet. He wanted to give a reward, but the man declined, saying it was simply the right thing to do.",
        tip: "Focus on the main actions: finding, reporting, returning. Do not linger on the details of what was inside the wallet.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "A man finds a wallet on the street",
          "He brings it to the police station",
          "The owner is contacted and comes to pick it up",
          "The owner offers a reward",
          "The man declines the reward"
        ]
      },
      {
        id: "retelling-2",
        title: "The Doctor's Appointment",
        text: "Mrs. Johnson had a doctor appointment at two in the afternoon. As she was leaving home, she realized her car would not start. She called a taxi, but with traffic, she arrived twenty minutes late. Luckily, the doctor was running behind too. She was seen without any problem. On the way out, she called a mechanic about her car.",
        tip: "The story follows a problem-solution sequence. Retell that logic without adding extra details.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Mrs. Johnson has a doctor appointment",
          "Her car won't start",
          "She takes a taxi and arrives late",
          "The doctor is also running late so she is seen as usual",
          "She calls a mechanic about her car"
        ]
      },
      {
        id: "retelling-3",
        title: "The Neighbor's Package",
        text: "Last Tuesday, the mail carrier rang Paul's doorbell to drop off a package. But the package was not for him — it was addressed to his neighbor on the third floor. Paul kept the package and slipped a note under her door. That evening, the neighbor came and knocked on Paul's door to pick up her parcel. It was a birthday gift sent by her sister. She thanked Paul and brought him a slice of the cake she had made.",
        tip: "Who receives what, for whom, and how is it resolved? That is the heart of the story.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "The mail carrier leaves a package with Paul",
          "The package belongs to his neighbor",
          "Paul leaves her a note",
          "The neighbor comes to pick up her package",
          "She thanks Paul"
        ]
      },
      {
        id: "retelling-4",
        title: "A Trip to the Market",
        text: "On Saturday morning, Sophie went to the market with her shopping list. She bought vegetables, cheese, and bread. While paying the cheese vendor, she realized she had left her wallet at home. The vendor, who knew her well, told her to pay next time. Sophie came back in the afternoon to settle her tab and took the opportunity to bring him a bunch of flowers as a thank-you.",
        tip: "Retell the sequence: shopping, the forgotten wallet, the vendor's solution, Sophie's return.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Sophie goes to the market to do her shopping",
          "She realizes she forgot her wallet when paying",
          "The cheese vendor trusts her and lets her leave",
          "Sophie comes back in the afternoon to pay",
          "She brings the vendor flowers to thank him"
        ]
      },
      {
        id: "retelling-5",
        title: "The Missed Train",
        text: "Lucas needed to take the eight o'clock train to get to a job interview. His alarm did not go off and he woke up late. He ran to the station, but the train had already left. He took the next train an hour later and called the company to let them know he would be late. The hiring manager agreed to push the interview back. In the end, the interview went well and Lucas got a call back the following week.",
        tip: "Problem, consequence, adaptation, result: that is the structure to retell.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Lucas needs to take a train to a job interview",
          "His alarm does not go off and he misses the train",
          "He takes the next train and calls the company",
          "The interview is rescheduled",
          "The interview goes well"
        ]
      },
      {
        id: "retelling-6",
        title: "The Lost Dog",
        text: "A boy was walking his dog in the park when the dog ran off chasing a cat. The boy searched for an hour with no luck. When he got home, he made flyers with a photo of the dog and posted them around the neighborhood. Three days later, a neighbor called: the dog was in her backyard. Relieved, the boy went to get him right away.",
        tip: "Retell the main steps without getting lost in descriptions.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "The dog runs away in the park",
          "The boy searches but cannot find him",
          "He puts up flyers around the neighborhood",
          "A neighbor finds the dog",
          "The boy picks up his dog"
        ]
      },
      {
        id: "retelling-7",
        title: "The Water Leak",
        text: "When Claire got home from work, she found a puddle of water on her kitchen floor. A pipe under the sink was leaking. She shut off the water supply and mopped up the floor with towels. She then called a plumber who came the next morning. The repair took half an hour. The plumber advised her to have the entire plumbing system checked because the seals were old.",
        tip: "Discovery of the problem, immediate actions, professional intervention: three stages to keep in order.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Claire discovers a water leak in her kitchen",
          "She shuts off the water and mops up",
          "She calls a plumber",
          "The plumber repairs the pipe",
          "He advises her to have all the plumbing checked"
        ]
      },
      {
        id: "retelling-8",
        title: "The Borrowed Book",
        text: "Antoine borrowed a book from the library to prepare a class presentation. The day he was supposed to return it, he realized he had left it at a friend's place. He called his friend, who found it on the living room couch. The friend dropped the book off at the library on his way by. Antoine thanked his friend and did not get a late fee.",
        tip: "Follow the journey of the book: library, friend's place, back to the library. That is the through-line.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Antoine borrows a book from the library",
          "He forgets the book at a friend's place",
          "The friend finds the book",
          "The friend returns the book to the library",
          "Antoine does not get a late fee"
        ]
      },
      {
        id: "retelling-9",
        title: "The Breakdown",
        text: "A couple was driving on vacation when the engine started making a strange noise on the highway. They pulled over on the shoulder and called a tow truck. The mechanic arrived after an hour and found a problem with the belt. The repair took thirty minutes. The couple was able to get back on the road and decided to stop in the next town to rest for a bit.",
        tip: "What matters is the sequence of events, not the technical details.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "A couple breaks down on the highway",
          "They call a tow truck",
          "The mechanic diagnoses the problem",
          "The car is repaired",
          "They drive on and take a break"
        ]
      },
      {
        id: "retelling-10",
        title: "The Birthday Cake",
        text: "Marie wanted to bake a cake for her daughter's birthday. She followed a recipe but made a mistake and added salt instead of sugar. The cake was inedible. Since she did not have time to make another one, she went to the neighborhood bakery and bought a beautiful chocolate cake. Her daughter was delighted and never noticed a thing.",
        tip: "Be brief and clear: mistake, consequence, solution, result.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Marie bakes a birthday cake",
          "She confuses salt and sugar",
          "The cake is ruined and there is no time to redo it",
          "She buys a cake from the bakery",
          "Her daughter is happy"
        ]
      },
      {
        id: "retelling-11",
        title: "The Forgotten Keys",
        text: "Thomas stepped out of his apartment and let the door slam behind him. He immediately realized he had left his keys inside. He tried calling a locksmith, but it was Sunday and the rates were very high. He remembered that his mother had a spare key. He called her, she came over an hour later, and he was able to get back in. Since then, he keeps a spare key with a trusted neighbor.",
        tip: "Problem, attempted solutions, resolution: that is the pattern to retell.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Thomas locks himself out by forgetting his keys",
          "The locksmith is too expensive on a Sunday",
          "His mother has a spare key",
          "She comes to let him in",
          "He decides to leave a spare key with a neighbor"
        ]
      },
      {
        id: "retelling-12",
        title: "The Mysterious Letter",
        text: "Julie found an unstamped envelope in her mailbox. Inside was a card with a drawing of a star and a message: meet at the corner cafe at five o'clock. Intrigued, she went — and discovered that her friends had organized a surprise party for her thirtieth birthday. They had decorated the cafe and prepared a meal. Julie was deeply moved and had an unforgettable evening.",
        tip: "Retell the discovery, the mystery, then the reveal. That is the narrative arc.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Julie finds a mysterious envelope in her mailbox",
          "The message tells her to meet at the cafe",
          "She discovers a surprise party for her thirtieth birthday",
          "Her friends organized everything",
          "She has a wonderful evening"
        ]
      },
      {
        id: "retelling-13",
        title: "The Switched Umbrellas",
        text: "When leaving a restaurant, Marc grabbed a black umbrella from the stand, thinking it was his. When he opened it in the rain, he found a tag with a name and phone number. He called the number and explained the mix-up. The umbrella's owner had also accidentally taken Marc's by mistake. They met up the next day to swap their umbrellas, laughing about the whole situation.",
        tip: "The mistake, the discovery, the contact, the swap: four simple steps.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Marc takes the wrong umbrella at the restaurant",
          "He finds a tag with a phone number",
          "He calls the owner",
          "The other person also took the wrong umbrella",
          "They swap their umbrellas"
        ]
      },
      {
        id: "retelling-14",
        title: "The Neighbor's Garden",
        text: "While her neighbors were on vacation, Helene offered to water their garden. The first week went smoothly. But during the second week, she forgot to water for three days because of a work trip. When her neighbors returned, they noticed that some plants had suffered. Helene apologized and offered to replace the damaged plants with new ones. The neighbors thanked her for the rest of the garden, which was in perfect condition.",
        tip: "The commitment, the problem, the consequences, and the resolution: stay on that track.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Helene agrees to water her neighbors' garden",
          "She forgets to water for three days",
          "Some plants are damaged",
          "She offers to replace the plants",
          "The neighbors thank her anyway"
        ]
      },
      {
        id: "retelling-15",
        title: "The Wallet at the Movies",
        text: "After a movie, Lea realized she had lost her wallet. She went back to the theater, but the cleaning crew had not found anything. She left her phone number at the front desk just in case. The next day, the theater called: a moviegoer had found the wallet wedged between two seats and turned it in. Lea went to pick it up and everything was still inside.",
        tip: "Loss, search, waiting, return: a simple linear structure.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Lea loses her wallet at the movie theater",
          "She goes back to look but does not find it",
          "She leaves her number at the front desk",
          "A moviegoer found and returned it",
          "She picks up her wallet with everything inside"
        ]
      },
      {
        id: "retelling-16",
        title: "The Improvised Recipe",
        text: "Pierre wanted to make a quiche for dinner, but when he opened the fridge he realized he was out of eggs. The stores were closed. He asked his neighbor, who lent him four eggs. In return, Pierre brought her a slice of the finished quiche. His neighbor liked it so much she asked him to write down the recipe.",
        tip: "Need, problem, helping each other out, exchange: that is the heart of the story.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Pierre wants to make a quiche but has no eggs",
          "The stores are closed",
          "His neighbor lends him eggs",
          "He brings her a slice of quiche",
          "The neighbor asks for the recipe"
        ]
      },
      {
        id: "retelling-17",
        title: "The Missed Bus",
        text: "Emma was waiting for the bus to go to work like every morning. The bus drove past without stopping because the stop was under construction and she had not noticed. The temporary stop was two hundred yards further down. A passerby pointed her in the right direction. She ran and just barely caught the next bus. Since then, she always checks the information signs at bus stops.",
        tip: "A routine situation disrupted, outside help, and adaptation: three clear stages.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Emma waits for the bus but it does not stop",
          "The stop has been moved due to construction",
          "A passerby tells her where the new stop is",
          "She catches the next bus",
          "She pays more attention to signs from then on"
        ]
      },
      {
        id: "retelling-18",
        title: "The Surprise Gift",
        text: "For Mother's Day, Theo and his sister decided to make breakfast in bed for their mom. Theo made the toast while his sister squeezed oranges. While carrying the tray, Theo tripped and spilled the orange juice on the rug. They quickly cleaned it up and made more juice. Their mother loved the surprise and said it was the most beautiful gift she had ever received.",
        tip: "The intention, the preparation, the incident, the fix, and the reaction: five moments.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Theo and his sister prepare breakfast for Mother's Day",
          "They split the tasks",
          "Theo spills the orange juice",
          "They clean up and start over",
          "Their mother is very touched"
        ]
      },
      {
        id: "retelling-19",
        title: "The Cat on the Roof",
        text: "The Martin family's cat climbed up onto the roof and could not get down. It had been meowing for two hours. Mr. Martin tried with a ladder but the roof was too high. He called the fire department. They arrived with a tall ladder and retrieved the cat in a matter of minutes. The children were relieved and promised to keep a closer eye on the cat.",
        tip: "The problem, the attempts, the intervention, and the result: keep that structure.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "The cat is stuck on the roof",
          "Mr. Martin tries a ladder but it is too short",
          "He calls the fire department",
          "The firefighters retrieve the cat",
          "The children promise to watch the cat more carefully"
        ]
      },
      {
        id: "retelling-20",
        title: "The Switched Suitcase",
        text: "At the airport, Nadia grabbed a black suitcase off the baggage carousel. When she arrived at the hotel, she opened it and found clothes that were not hers. She called the airline, which tracked down the passenger who had her suitcase. The next day, a courier delivered the right suitcase to the hotel and picked up the other one. Nadia checked that nothing was missing.",
        tip: "Mistake, discovery, action taken, exchange: a logical sequence to retell.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Nadia picks up the wrong suitcase at the airport",
          "She discovers the mistake at the hotel",
          "She contacts the airline",
          "A courier swaps the suitcases the next day",
          "Everything is in order"
        ]
      }
    ]
  }
];

export const getRandomExercise = (categoryId: string): Exercise | null => {
  const category = exerciseCategories.find(c => c.id === categoryId);
  if (!category || category.exercises.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * category.exercises.length);
  return category.exercises[randomIndex];
};

export const getCategoryById = (categoryId: string): ExerciseCategory | undefined => {
  return exerciseCategories.find(c => c.id === categoryId);
};
